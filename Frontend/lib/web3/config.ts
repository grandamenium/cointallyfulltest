import { defaultWagmiConfig } from '@web3modal/wagmi';
import {
  mainnet,
  polygon,
  bsc,
  arbitrum,
  optimism,
  avalanche,
  base,
} from 'viem/chains';

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

if (!projectId) {
  console.warn('Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID environment variable');
}

const metadata = {
  name: 'CoinTally',
  description: 'Crypto Tax Calculator',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://cointally.app',
  icons: ['/logo.svg'],
};

export const chains = [mainnet, polygon, bsc, arbitrum, optimism, avalanche, base] as const;

export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
});

export const chainIdToSourceId: Record<number, string> = {
  1: 'ethereum',
  137: 'polygon',
  56: 'bsc',
  42161: 'arbitrum',
  10: 'optimism',
  43114: 'avalanche',
  8453: 'base',
};

export function getSourceIdFromChainId(chainId: number): string | undefined {
  return chainIdToSourceId[chainId];
}
