export const HELIUS_API_BASE_URL = 'https://api.helius.xyz/v0';

export interface SolanaConfig {
  name: string;
  sourceId: string;
  nativeToken: string;
  decimals: number;
}

export const SOLANA_CONFIG: SolanaConfig = {
  name: 'Solana',
  sourceId: 'solana',
  nativeToken: 'SOL',
  decimals: 9,
};

export interface HeliusTransaction {
  signature: string;
  timestamp: number;
  fee: number;
  feePayer: string;
  type: string;
  source: string;
  description: string;
  nativeTransfers?: HeliusNativeTransfer[];
  tokenTransfers?: HeliusTokenTransfer[];
  accountData?: HeliusAccountData[];
  events?: HeliusEvents;
}

export interface HeliusNativeTransfer {
  fromUserAccount: string;
  toUserAccount: string;
  amount: number;
}

export interface HeliusTokenTransfer {
  fromUserAccount: string;
  toUserAccount: string;
  fromTokenAccount: string;
  toTokenAccount: string;
  tokenAmount: number;
  mint: string;
  tokenName?: string;
  symbol?: string;
  decimals?: number;
}

export interface HeliusAccountData {
  account: string;
  nativeBalanceChange: number;
  tokenBalanceChanges?: HeliusTokenBalanceChange[];
}

export interface HeliusTokenBalanceChange {
  mint: string;
  rawTokenAmount: {
    tokenAmount: string;
    decimals: number;
  };
  tokenAccount: string;
  userAccount: string;
}

export interface HeliusEvents {
  swap?: HeliusSwapEvent;
}

export interface HeliusSwapEvent {
  nativeInput?: { account: string; amount: string };
  nativeOutput?: { account: string; amount: string };
  tokenInputs?: HeliusSwapToken[];
  tokenOutputs?: HeliusSwapToken[];
  innerSwaps?: any[];
}

export interface HeliusSwapToken {
  userAccount: string;
  tokenAccount: string;
  mint: string;
  rawTokenAmount: {
    tokenAmount: string;
    decimals: number;
  };
}
