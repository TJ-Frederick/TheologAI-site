export async function onRequestGet() {
  return Response.json({
    recipient: '0xf2BE3382cF48ef5CAf21Ca3B01C4e6fC3Ea04B04',
    token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    tokenSymbol: 'USDC',
    tokenDecimals: 6,
    chain: 'base',
    chainId: 8453,
    suggestedAmounts: [5, 10, 25, 50],
    x402Compatible: true,
  });
}
