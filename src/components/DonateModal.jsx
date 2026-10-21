import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
  useSendTransaction,
} from 'wagmi';
import { donationValue } from '../donation';
import {
  RECIPIENT_ADDRESS,
  ERC20_ABI,
  SUGGESTED_AMOUNTS,
  SUPPORTED_TOKENS,
} from '../config';

export default function DonateModal({ onClose }) {
  const { isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const [selectedToken, setSelectedToken] = useState(SUPPORTED_TOKENS[0]);
  const [amount, setAmount] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState(null);

  // ERC-20 transfer
  const {
    data: erc20TxHash,
    writeContract,
    isPending: isErc20Sending,
    error: erc20Error,
    reset: resetErc20,
  } = useWriteContract();

  // Native ETH transfer
  const {
    data: nativeTxHash,
    sendTransaction,
    isPending: isNativeSending,
    error: nativeError,
    reset: resetNative,
  } = useSendTransaction();

  const txHash = selectedToken.type === 'native' ? nativeTxHash : erc20TxHash;
  const isSending = selectedToken.type === 'native' ? isNativeSending : isErc20Sending;

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash: txHash, chainId: selectedToken.chainId });

  const needsChainSwitch = isConnected && chainId !== selectedToken.chainId;
  const isBusy = isSending || isConfirming;
  const value = donationValue(amount, selectedToken.decimals);
  const cannotSend = isBusy || needsChainSwitch || value === null || Boolean(txHash);
  const sendError = (selectedToken.type === 'native' ? nativeError : erc20Error) || receiptError;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function selectPreset(value) {
    setSelectedPreset(value);
    setAmount(String(value));
    resetErc20();
    resetNative();
    setVerifyStatus(null);
  }

  function handleCustomAmount(e) {
    setSelectedPreset(null);
    setAmount(e.target.value);
    resetErc20();
    resetNative();
    setVerifyStatus(null);
  }

  function handleTokenChange(token) {
    setSelectedToken(token);
    resetErc20();
    resetNative();
    setVerifyStatus(null);
  }

  function sendDonation() {
    if (!isConnected || cannotSend) return;

    if (selectedToken.type === 'native') {
      sendTransaction({
        chainId: selectedToken.chainId,
        to: RECIPIENT_ADDRESS,
        value,
      });
    } else {
      writeContract({
        chainId: selectedToken.chainId,
        address: selectedToken.contract,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [RECIPIENT_ADDRESS, value],
      });
    }
  }

  // Verify payment (Base USDC only)
  useEffect(() => {
    if (!isConfirmed || !txHash) return;
    if (selectedToken.id !== 'usdc-base') {
      setVerifyStatus('verified');
      return;
    }
    setVerifyStatus('verifying');
    const controller = new AbortController();
    let active = true;
    fetch('/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txHash }),
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => { if (active) setVerifyStatus(data.verified ? 'verified' : 'failed'); })
      .catch(() => { if (active) setVerifyStatus('failed'); });
    return () => { active = false; controller.abort(); };
  }, [isConfirmed, txHash, selectedToken.id]);

  const amountLabel = selectedToken.type === 'native'
    ? `${amount || '0'} ${selectedToken.symbol}`
    : `${amount || '0'} ${selectedToken.symbol}`;

  const pillStyle = (active) => ({
    padding: '6px 14px',
    fontFamily: 'var(--font-display)',
    fontSize: 12,
    fontWeight: 500,
    border: `1px solid ${active ? 'var(--gold-dim)' : 'var(--border)'}`,
    background: active ? 'var(--gold-glow)' : 'transparent',
    color: active ? 'var(--gold)' : 'var(--muted)',
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  return (
    <div className="donate-overlay" onClick={onClose}>
      <div
        className="donate-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="donate-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="donate-close" aria-label="Close donation dialog" onClick={onClose}>×</button>

        <div id="donate-title" style={{ fontFamily: 'var(--font-hero)', fontSize: 24, marginBottom: 4 }}>
          Support TheologAI
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
          Donate to help cover server costs and fund new features.
        </p>

        {/* Token selector */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SUPPORTED_TOKENS.reduce((rows, token) => {
              const lastRow = rows[rows.length - 1];
              if (lastRow && lastRow[0].chainId === token.chainId) {
                lastRow.push(token);
              } else {
                rows.push([token]);
              }
              return rows;
            }, []).map((row) => (
              <div key={row[0].chainId} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--text-secondary)',
                  minWidth: 64,
                  flexShrink: 0,
                }}>
                  {row[0].chain}
                </span>
                <span style={{ width: 1, height: 20, background: 'var(--border)', flexShrink: 0 }} />
                <div style={{ display: 'flex', gap: 6 }}>
                  {row.map((token) => (
                    <button
                      key={token.id}
                      style={pillStyle(selectedToken.id === token.id)}
                      disabled={isBusy}
                      onClick={() => handleTokenChange(token)}
                    >
                      {token.symbol}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wallet connect */}
        <div style={{ marginBottom: 16 }}>
          <ConnectButton showBalance={false} />
        </div>

        {/* Chain switch prompt */}
        {needsChainSwitch && (
          <button
            onClick={() => switchChain({ chainId: selectedToken.chainId })}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: 12,
              background: '#7f1d1d',
              border: 'none',
              borderRadius: 8,
              color: '#fca5a5',
              fontFamily: 'var(--font-display)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Switch to {selectedToken.chain}
          </button>
        )}

        {/* Amount + send */}
        {isConnected && !needsChainSwitch && (
          <>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                Amount ({selectedToken.symbol})
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 8 }}>
                {SUGGESTED_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    disabled={isBusy}
                    onClick={() => selectPreset(preset)}
                    style={{
                      padding: '8px',
                      fontFamily: 'var(--font-display)',
                      fontSize: 13,
                      fontWeight: 500,
                      border: `1px solid ${selectedPreset === preset ? 'var(--gold-dim)' : 'var(--border)'}`,
                      background: selectedPreset === preset ? 'var(--gold-glow)' : 'transparent',
                      color: selectedPreset === preset ? 'var(--gold)' : 'var(--text-secondary)',
                      borderRadius: 6,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {selectedToken.type === 'native' ? preset : `$${preset}`}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={selectedToken.decimals === 18 ? '0.000000000000000001' : '0.000001'}
                step="any"
                placeholder="Custom amount"
                aria-label="Custom amount"
                aria-invalid={Boolean(amount && value === null)}
                disabled={isBusy}
                value={selectedPreset ? '' : amount}
                onChange={handleCustomAmount}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--bg-alt)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--text)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
              {amount && value === null && (
                <p role="alert" style={{ marginTop: 8, fontSize: 12, color: '#facc15' }}>
                  Enter a positive amount with at most {selectedToken.decimals} decimal places.
                </p>
              )}
            </div>

            <button
              onClick={sendDonation}
              disabled={cannotSend}
              style={{
                width: '100%',
                padding: '12px',
                background: cannotSend
                  ? 'var(--border)'
                  : 'linear-gradient(135deg, var(--gold-dim), var(--gold))',
                border: 'none',
                borderRadius: 8,
                color: cannotSend
                  ? 'var(--muted)'
                  : 'var(--bg)',
                fontFamily: 'var(--font-display)',
                fontSize: 14,
                fontWeight: 600,
                cursor: cannotSend
                  ? 'not-allowed'
                  : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {isSending
                ? 'Confirm in Wallet...'
                : isConfirming
                  ? 'Confirming...'
                  : `Send ${amountLabel}`}
            </button>
          </>
        )}

        {/* Error */}
        {sendError && (
          <p style={{
            marginTop: 12,
            padding: 12,
            background: 'rgba(127, 29, 29, 0.3)',
            borderRadius: 8,
            fontSize: 13,
            color: '#fca5a5',
          }}>
            {sendError.shortMessage || sendError.message || 'Transaction could not be confirmed. Check the block explorer before trying again.'}
          </p>
        )}

        {/* Transaction status */}
        {txHash && (
          <div style={{
            marginTop: 16,
            padding: 16,
            background: 'var(--bg-alt)',
            border: '1px solid var(--border)',
            borderRadius: 10,
          }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Transaction submitted
            </div>
            <a
              href={`${selectedToken.explorerTxUrl}${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
                color: 'var(--gold)',
                wordBreak: 'break-all',
              }}
            >
              {txHash}
            </a>

            {isConfirming && (
              <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                Waiting for confirmation...
              </p>
            )}

            {isConfirmed && verifyStatus === 'verifying' && (
              <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                Verifying payment...
              </p>
            )}

            {isConfirmed && verifyStatus === 'verified' && (
              <p style={{ marginTop: 8, fontSize: 13, fontWeight: 500, color: '#4ade80' }}>
                Payment confirmed. Thank you for your support!
              </p>
            )}

            {isConfirmed && verifyStatus === 'failed' && (
              <p style={{ marginTop: 8, fontSize: 13, color: '#facc15' }}>
                Transaction confirmed on-chain, but we couldn't verify this donation.
                Check the block explorer before trying again.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
