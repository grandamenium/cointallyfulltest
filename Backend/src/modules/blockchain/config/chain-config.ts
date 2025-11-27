export const ETHERSCAN_V2_BASE_URL = 'https://api.etherscan.io/v2/api';

export interface ChainConfig {
  chainId: number;
  name: string;
  sourceId: string;
  nativeToken: string;
  decimals: number;
}

export const EVM_CHAINS: Record<string, ChainConfig> = {
  ethereum: {
    chainId: 1,
    name: 'Ethereum',
    sourceId: 'ethereum',
    nativeToken: 'ETH',
    decimals: 18,
  },
  polygon: {
    chainId: 137,
    name: 'Polygon',
    sourceId: 'polygon',
    nativeToken: 'POL',
    decimals: 18,
  },
  bsc: {
    chainId: 56,
    name: 'BNB Smart Chain',
    sourceId: 'bsc',
    nativeToken: 'BNB',
    decimals: 18,
  },
  arbitrum: {
    chainId: 42161,
    name: 'Arbitrum One',
    sourceId: 'arbitrum',
    nativeToken: 'ETH',
    decimals: 18,
  },
  optimism: {
    chainId: 10,
    name: 'Optimism',
    sourceId: 'optimism',
    nativeToken: 'ETH',
    decimals: 18,
  },
  avalanche: {
    chainId: 43114,
    name: 'Avalanche C-Chain',
    sourceId: 'avalanche',
    nativeToken: 'AVAX',
    decimals: 18,
  },
  base: {
    chainId: 8453,
    name: 'Base',
    sourceId: 'base',
    nativeToken: 'ETH',
    decimals: 18,
  },
};

export function getChainByChainId(chainId: number): ChainConfig | undefined {
  return Object.values(EVM_CHAINS).find((chain) => chain.chainId === chainId);
}

export function getChainBySourceId(sourceId: string): ChainConfig | undefined {
  return EVM_CHAINS[sourceId.toLowerCase()];
}

export function getSupportedChainIds(): number[] {
  return Object.values(EVM_CHAINS).map((chain) => chain.chainId);
}
