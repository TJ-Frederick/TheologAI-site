import { parseUnits } from 'viem';

export function donationValue(amount, decimals) {
  if (typeof amount !== 'string' || amount.length > 80 || !/^\d+(?:\.\d+)?$/.test(amount)) return null;
  if ((amount.split('.')[1]?.length || 0) > decimals) return null;
  const value = parseUnits(amount, decimals);
  return value > 0n && value < 2n ** 256n ? value : null;
}
