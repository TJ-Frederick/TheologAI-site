export async function onRequestGet() {
  return Response.json({
    recipient: '0xf2BE3382cF48ef5CAf21Ca3B01C4e6fC3Ea04B04',
    suggestedAmounts: [1, 5, 10, 25],
    tokens: [
      {
        id: 'usdc-base',
        symbol: 'USDC',
        chain: 'Base',
        chainId: 8453,
        type: 'erc20',
        decimals: 6,
        contract: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      },
      {
        id: 'eth-base',
        symbol: 'ETH',
        chain: 'Base',
        chainId: 8453,
        type: 'native',
        decimals: 18,
      },
      {
        id: 'usdc-ethereum',
        symbol: 'USDC',
        chain: 'Ethereum',
        chainId: 1,
        type: 'erc20',
        decimals: 6,
        contract: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      },
      {
        id: 'eth-ethereum',
        symbol: 'ETH',
        chain: 'Ethereum',
        chainId: 1,
        type: 'native',
        decimals: 18,
      },
      {
        id: 'sbc-radius',
        symbol: 'SBC',
        chain: 'Radius',
        chainId: 723,
        type: 'erc20',
        decimals: 6,
        contract: '0x33ad9e4bd16b69b5bfded37d8b5d9ff9aba014fb',
      },
    ],
  });
}
