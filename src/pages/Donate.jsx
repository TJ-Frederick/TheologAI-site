import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
} from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import {
  RECIPIENT_ADDRESS,
  USDC_CONTRACT,
  USDC_DECIMALS,
  USDC_ABI,
  SUGGESTED_AMOUNTS,
  BASE_CHAIN_ID,
  BASESCAN_TX_URL,
} from '../config';

export default function Donate() {
  const { address, isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const [amount, setAmount] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState(null);

  const {
    data: txHash,
    writeContract,
    isPending: isSending,
    error: sendError,
    reset: resetSend,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({ hash: txHash });

  const wrongChain = isConnected && chainId !== BASE_CHAIN_ID;

  function selectPreset(value) {
    setSelectedPreset(value);
    setAmount(String(value));
    resetSend();
    setVerifyStatus(null);
  }

  function handleCustomAmount(e) {
    setSelectedPreset(null);
    setAmount(e.target.value);
    resetSend();
    setVerifyStatus(null);
  }

  function sendDonation() {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    writeContract({
      address: USDC_CONTRACT,
      abi: USDC_ABI,
      functionName: 'transfer',
      args: [RECIPIENT_ADDRESS, parseUnits(amount, USDC_DECIMALS)],
    });
  }

  useEffect(() => {
    if (!isConfirmed || !txHash) return;
    setVerifyStatus('verifying');
    fetch('/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txHash }),
    })
      .then((r) => r.json())
      .then((data) => {
        setVerifyStatus(data.verified ? 'verified' : 'failed');
      })
      .catch(() => {
        setVerifyStatus('failed');
      });
  }, [isConfirmed, txHash]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-xl">
        <Link to="/" className="mb-6 block text-sm text-gray-500 hover:text-gray-300">
          &larr; Back to TheologAI
        </Link>

        <h1 className="mb-2 text-2xl font-bold text-gold-400">
          Support TheologAI
        </h1>
        <p className="mb-6 text-sm text-gray-400">
          Donate USDC on Base to help keep TheologAI running and free for everyone.
        </p>

        <div className="mb-6">
          <ConnectButton showBalance={false} />
        </div>

        {wrongChain && (
          <button
            onClick={() => switchChain({ chainId: BASE_CHAIN_ID })}
            className="mb-4 w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
          >
            Switch to Base Network
          </button>
        )}

        {isConnected && !wrongChain && (
          <>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Amount (USDC)
              </label>
              <div className="mb-3 grid grid-cols-4 gap-2">
                {SUGGESTED_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => selectPreset(preset)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      selectedPreset === preset
                        ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                        : 'border-gray-700 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Custom amount"
                value={selectedPreset ? '' : amount}
                onChange={handleCustomAmount}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-gray-100 placeholder-gray-500 focus:border-gold-500 focus:outline-none"
              />
            </div>

            <button
              onClick={sendDonation}
              disabled={isSending || isConfirming || !amount || Number(amount) <= 0}
              className="w-full rounded-lg bg-gold-500 px-4 py-3 font-semibold text-gray-950 transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSending
                ? 'Confirm in Wallet...'
                : isConfirming
                  ? 'Confirming...'
                  : `Send $${amount || '0'} USDC`}
            </button>

            {sendError && (
              <p className="mt-3 rounded-lg bg-red-900/30 p-3 text-sm text-red-400">
                {sendError.shortMessage || sendError.message}
              </p>
            )}

            {txHash && (
              <div className="mt-4 rounded-lg border border-gray-700 bg-gray-800 p-4">
                <p className="mb-1 text-sm text-gray-400">Transaction submitted</p>
                <a
                  href={`${BASESCAN_TX_URL}${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-sm text-gold-400 hover:underline"
                >
                  {txHash}
                </a>

                {isConfirming && (
                  <p className="mt-2 text-sm text-gray-400">
                    Waiting for confirmation...
                  </p>
                )}

                {isConfirmed && verifyStatus === 'verifying' && (
                  <p className="mt-2 text-sm text-gray-400">Verifying payment...</p>
                )}

                {isConfirmed && verifyStatus === 'verified' && (
                  <p className="mt-2 text-sm font-medium text-green-400">
                    Payment verified. Thank you for your support!
                  </p>
                )}

                {isConfirmed && verifyStatus === 'failed' && (
                  <p className="mt-2 text-sm text-yellow-400">
                    Transaction confirmed on-chain but verification returned an error.
                    Your donation was still received — thank you!
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
