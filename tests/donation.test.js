import { test } from 'node:test';
import assert from 'node:assert/strict';
import { donationValue } from '../src/donation.js';

test('converts supported token and native amounts exactly', () => {
  assert.equal(donationValue('1.234567', 6), 1234567n);
  assert.equal(donationValue('0.000000000000000001', 18), 1n);
  assert.equal(donationValue('25', 6), 25000000n);
});

test('accepts leading and trailing decimal notation without changing the amount', () => {
  assert.equal(donationValue('.5', 18), 500000000000000000n);
  assert.equal(donationValue('.1', 6), 100000n);
  assert.equal(donationValue('.000001', 6), 1n);
  assert.equal(donationValue('.000000000000000001', 18), 1n);
  assert.equal(donationValue('1.', 6), 1000000n);
});

test('rejects invalid, nonpositive, overflowing and overprecision amounts without rounding', () => {
  for (const amount of ['', '.', '0', '0.00', '.0', '-1', 'NaN', 'Infinity', '1e3', '1..0', '1.0000001', '.0000001', '1'.repeat(80)]) {
    assert.equal(donationValue(amount, 6), null, amount);
  }
});
