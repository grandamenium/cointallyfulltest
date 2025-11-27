export interface WalletCredentials {
  address: string;
  chainId?: string;
}

export interface BlockchainTransaction {
  id: string;
  hash: string;
  type: 'normal' | 'erc20' | 'erc721' | 'internal' | 'sol-transfer' | 'spl' | 'swap';
  timestamp: Date;
  from: string;
  to: string;
  value: string;
  asset: string;
  contractAddress?: string;
  tokenName?: string;
  tokenDecimal?: number;
  gasUsed?: string;
  gasPrice?: string;
  isError?: boolean;
  rawData: Record<string, any>;
  swapData?: {
    inputAsset: string;
    inputAmount: string;
    outputAsset: string;
    outputAmount: string;
  };
}

export interface IBlockchainAdapter {
  validateAddress(address: string): boolean;

  fetchNormalTransactions(
    address: string,
    startDate: Date,
    endDate: Date,
  ): Promise<BlockchainTransaction[]>;

  fetchERC20Transfers(
    address: string,
    startDate: Date,
    endDate: Date,
  ): Promise<BlockchainTransaction[]>;

  getChainName(): string;

  getChainId(): number | null;
}
