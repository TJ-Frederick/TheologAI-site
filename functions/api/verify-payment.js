import { createPublicClient, http, decodeEventLog } from 'viem';
import { base } from 'viem/chains';

const RECIPIENT = '0xf2BE3382cF48ef5CAf21Ca3B01C4e6fC3Ea04B04';
const USDC_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

const TRANSFER_EVENT_ABI = [
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
  },
];

const client = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
});

export async function onRequestPost(context) {
  try {
    const { txHash } = await context.request.json();

    if (!txHash || typeof txHash !== 'string' || !txHash.startsWith('0x')) {
      return Response.json(
        { verified: false, error: 'Invalid transaction hash' },
        { status: 400 }
      );
    }

    const receipt = await client.getTransactionReceipt({ hash: txHash });

    if (receipt.status !== 'success') {
      return Response.json(
        { verified: false, error: 'Transaction failed on-chain' },
        { status: 400 }
      );
    }

    // Find the USDC Transfer event log directed at our recipient
    let verifiedAmount = null;

    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== USDC_CONTRACT.toLowerCase()) continue;

      try {
        const decoded = decodeEventLog({
          abi: TRANSFER_EVENT_ABI,
          data: log.data,
          topics: log.topics,
        });

        if (
          decoded.eventName === 'Transfer' &&
          decoded.args.to.toLowerCase() === RECIPIENT.toLowerCase()
        ) {
          // USDC has 6 decimals
          verifiedAmount = Number(decoded.args.value) / 1e6;
          break;
        }
      } catch {
        // Not a matching event, skip
      }
    }

    if (verifiedAmount === null) {
      return Response.json(
        { verified: false, error: 'No matching USDC transfer to recipient found' },
        { status: 400 }
      );
    }

    return Response.json({
      verified: true,
      amount: verifiedAmount.toFixed(2),
      txHash,
    });
  } catch (err) {
    return Response.json(
      { verified: false, error: err.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
