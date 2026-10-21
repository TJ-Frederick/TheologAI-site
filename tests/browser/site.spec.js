import { test, expect } from '@playwright/test';
import { installWallet, openDonation, connectWallet, recipient, txHash } from './wallet.js';

test('homepage, client guides, copy controls and static discovery files work', async ({ page, request }) => {
  await installWallet(page);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const response = await page.goto('/');
  expect(response.headers()['content-security-policy']).toContain("script-src 'self'");
  expect(response.headers()['x-frame-options']).toBe('DENY');
  await expect(page.locator('h1')).toBeVisible();
  const install = page.locator('#install');
  for (const mode of [/Hosted MCP/, /Run locally/]) {
    await page.getByRole('group', { name: 'Installation mode' }).getByRole('button', { name: mode }).click();
    for (const button of await page.getByRole('group', { name: 'AI client', exact: true }).getByRole('button').all()) {
      await button.click();
      for (const variant of await install.locator('.client-variants button').all()) {
        await variant.click();
        await expect(install.locator('.install-detail')).toBeVisible();
      }
      if (await page.locator('#additional-client').count()) {
        for (const value of ['other', 'cursor', 'vscode']) {
          await page.locator('#additional-client').selectOption(value);
          await expect(install.locator('.install-detail')).toBeVisible();
        }
      }
    }
  }
  await page.getByRole('group', { name: 'Installation mode' }).getByRole('button', { name: /Hosted MCP/ }).click();
  await install.locator('.copy-button').first().click();
  await expect(install.locator('.copy-button').first()).toContainText('Copied');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.evaluate(() => window.__cspViolations)).toEqual([]);
  expect(errors).toEqual([]);
  for (const path of ['/llms.txt', '/index.md', '/connect.md', '/robots.txt', '/sitemap.xml']) {
    const doc = await request.get(path);
    expect(doc.ok()).toBe(true);
    expect(await doc.text()).not.toContain('<!DOCTYPE html>');
  }
  await page.screenshot({ path: `test-results/home-${test.info().project.name}.png`, fullPage: true, animations: 'disabled' });
});

test('donation dialog opens, offers every asset and closes', async ({ page }) => {
  await installWallet(page);
  const dialog = await openDonation(page);
  await expect(dialog.getByRole('button', { name: 'USDC', exact: true })).toHaveCount(2);
  await expect(dialog.getByRole('button', { name: 'ETH', exact: true })).toHaveCount(2);
  await expect(dialog.getByRole('button', { name: 'SBC', exact: true })).toBeVisible();
  expect(await page.evaluate(() => window.__cspViolations)).toEqual([]);
  await page.screenshot({ path: `test-results/donation-${test.info().project.name}.png`, animations: 'disabled' });
  await dialog.getByRole('button', { name: 'Close donation dialog' }).click();
  await expect(dialog).not.toBeVisible();
});

test('Base USDC donation submits the correct transfer, locks edits and verifies', async ({ page }) => {
  await installWallet(page);
  const dialog = await openDonation(page);
  await dialog.getByRole('button', { name: 'USDC', exact: true }).nth(1).click();
  await connectWallet(page, dialog);
  await dialog.getByRole('button', { name: '$5', exact: true }).click();
  await page.route('**/api/verify-payment', (route) => {
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toEqual({ txHash });
    return route.fulfill({ json: { verified: true, amount: '5' } });
  });
  await page.evaluate(() => { window.__holdTransaction = true; });
  await dialog.getByRole('button', { name: 'Send 5 USDC', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'USDC', exact: true }).first()).toBeDisabled();
  await expect(dialog.getByRole('textbox', { name: 'Custom amount' }).or(dialog.getByRole('spinbutton', { name: 'Custom amount' }))).toBeDisabled();
  await page.evaluate(() => { window.__holdTransaction = false; });
  await expect(dialog.getByText('Payment confirmed. Thank you for your support!')).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Send 5 USDC', exact: true })).toBeDisabled();
  const sent = await page.evaluate(() => window.__walletRequests.find((req) => req.method === 'eth_sendTransaction').params[0]);
  expect(sent.to.toLowerCase()).toBe('0x833589fcd6edb6e08f4c7c32d4f71b54bda02913');
  expect(sent.data.toLowerCase()).toBe(`0xa9059cbb${recipient.slice(2).toLowerCase().padStart(64, '0')}${(5_000_000).toString(16).padStart(64, '0')}`);
  expect(await page.evaluate(() => window.__cspViolations)).toEqual([]);
});

for (const asset of [
  { symbol: 'USDC', index: 0, chain: 'Ethereum', contract: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' },
  { symbol: 'ETH', index: 1, chain: 'Base' },
  { symbol: 'SBC', index: 0, chain: 'Radius', contract: '0x33ad9e4bd16b69b5bfded37d8b5d9ff9aba014fb' },
]) {
  test(`${asset.chain} ${asset.symbol} donation confirms with the correct destination`, async ({ page }) => {
    await installWallet(page);
    const dialog = await openDonation(page);
    await dialog.getByRole('button', { name: asset.symbol, exact: true }).nth(asset.index).click();
    await connectWallet(page, dialog);
    const switchChain = dialog.getByRole('button', { name: `Switch to ${asset.chain}`, exact: true });
    if (await switchChain.isVisible()) await switchChain.click();
    await dialog.getByRole('spinbutton', { name: 'Custom amount' }).fill('1');
    await dialog.getByRole('button', { name: `Send 1 ${asset.symbol}`, exact: true }).click();
    await expect(dialog.getByText('Payment confirmed. Thank you for your support!')).toBeVisible();
    const sent = await page.evaluate(() => window.__walletRequests.find((req) => req.method === 'eth_sendTransaction').params[0]);
    expect(sent.to.toLowerCase()).toBe(asset.contract || recipient.toLowerCase());
    if (asset.contract) expect(sent.data.toLowerCase()).toBe(`0xa9059cbb${recipient.slice(2).toLowerCase().padStart(64, '0')}${(1_000_000).toString(16).padStart(64, '0')}`);
    else expect(BigInt(sent.value)).toBe(10n ** 18n);
    expect(await page.evaluate(() => window.__cspViolations)).toEqual([]);
  });
}

test('CSP prevents execution of an injected inline script', async ({ page }) => {
  await installWallet(page);
  await page.goto('/');
  await page.evaluate(() => {
    const script = document.createElement('script');
    script.textContent = 'window.__untrustedScriptRan = true';
    document.head.appendChild(script);
  });
  expect(await page.evaluate(() => window.__untrustedScriptRan)).toBeUndefined();
  await expect.poll(() => page.evaluate(() => window.__cspViolations.length)).toBeGreaterThan(0);
});

test('WalletConnect QR setup works under the CSP', async ({ page }) => {
  await installWallet(page);
  const dialog = await openDonation(page);
  await dialog.getByRole('button', { name: 'Connect Wallet', exact: true }).click();
  await page.getByRole('button', { name: 'WalletConnect', exact: true }).click();
  await expect(page.getByText(/Scan.*wallet|Scan.*phone/i).first()).toBeVisible();
  expect(await page.evaluate(() => window.__cspViolations)).toEqual([]);
});

test('native donation switches chain and transfers only the requested amount', async ({ page }) => {
  await installWallet(page);
  const dialog = await openDonation(page);
  await connectWallet(page, dialog);
  await dialog.getByRole('button', { name: 'Switch to Ethereum', exact: true }).click();
  await dialog.getByRole('button', { name: 'ETH', exact: true }).first().click();
  await dialog.getByRole('spinbutton', { name: 'Custom amount' }).fill('0.0001');
  await dialog.getByRole('button', { name: 'Send 0.0001 ETH', exact: true }).click();
  await expect(dialog.getByText('Payment confirmed. Thank you for your support!')).toBeVisible();
  const sent = await page.evaluate(() => window.__walletRequests.find((req) => req.method === 'eth_sendTransaction').params[0]);
  expect(sent.to.toLowerCase()).toBe(recipient.toLowerCase());
  expect(BigInt(sent.value)).toBe(100_000_000_000_000n);
  expect(sent.data || '0x').toBe('0x');
});

test('invalid precision, wallet rejection and verification errors never show false success', async ({ page }) => {
  await installWallet(page);
  const dialog = await openDonation(page);
  await dialog.getByRole('button', { name: 'USDC', exact: true }).nth(1).click();
  await connectWallet(page, dialog);
  await dialog.getByRole('spinbutton', { name: 'Custom amount' }).fill('1.0000001');
  await expect(dialog.getByRole('button', { name: 'Send 1.0000001 USDC', exact: true })).toBeDisabled();
  await expect(dialog.getByRole('alert')).toContainText('at most 6 decimal places');
  await dialog.getByRole('button', { name: '$1', exact: true }).click();
  await page.evaluate(() => { window.__rejectTransaction = true; });
  await dialog.getByRole('button', { name: 'Send 1 USDC', exact: true }).click();
  await expect(dialog.getByText(/User rejected/).first()).toBeVisible();
  await expect(dialog.getByText('Payment confirmed. Thank you for your support!')).not.toBeVisible();
  await page.evaluate(() => { window.__rejectTransaction = false; });
  await page.route('**/api/verify-payment', (route) => route.fulfill({ status: 502, json: { verified: false, error: 'Unavailable' } }));
  await dialog.getByRole('button', { name: 'Send 1 USDC', exact: true }).click();
  await expect(dialog.getByText(/couldn't verify this donation/)).toBeVisible();
  await expect(dialog.getByText('Payment confirmed. Thank you for your support!')).not.toBeVisible();
});

test('Pages Functions reject invalid requests with security headers', async ({ request }) => {
  const config = await request.get('/api/donation-config');
  expect(config.ok()).toBe(true);
  expect((await config.json()).tokens).toHaveLength(5);
  expect(config.headers()['x-content-type-options']).toBe('nosniff');
  for (const [data, status] of [[{}, 400], [null, 400], [{ txHash: '0x' }, 400], [' '.repeat(1100), 413]]) {
    const response = await request.post('/api/verify-payment', {
      headers: { 'Content-Type': 'application/json' }, data: JSON.stringify(data),
    });
    expect(response.status()).toBe(status);
    expect(response.headers()['cache-control']).toBe('no-store');
  }
  expect((await request.get('/api/verify-payment')).status()).toBe(405);
});

test('a reverted on-chain transaction never shows a successful donation', async ({ page }) => {
  const state = await installWallet(page);
  state.status = '0x0';
  const dialog = await openDonation(page);
  await dialog.getByRole('button', { name: 'ETH', exact: true }).nth(1).click();
  await connectWallet(page, dialog);
  await dialog.getByRole('spinbutton', { name: 'Custom amount' }).fill('1');
  await dialog.getByRole('button', { name: 'Send 1 ETH', exact: true }).click();
  await expect(dialog.getByText(/Transaction reverted/)).toBeVisible({ timeout: 15_000 });
  await expect(dialog.getByText('Payment confirmed. Thank you for your support!')).not.toBeVisible();
});
