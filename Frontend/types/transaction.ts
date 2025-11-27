export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export type TransactionType =
  | 'buy'
  | 'sell'
  | 'transfer-in'
  | 'transfer-out'
  | 'self-transfer'
  | 'expense'
  | 'gift-received'
  | 'gift-sent'
  | 'income'
  | 'mining'
  | 'staking'
  | 'airdrop';

export type TransactionCategory =
  | 'uncategorized'
  | 'personal'
  | 'business-expense'
  | 'self-transfer'
  | 'gift';

export interface Transaction {
  id: string;
  userId: string;
  sourceId: string; // ConnectedSource ID
  sourceName: string;

  // Core transaction data
  date: Date;
  type: TransactionType;
  asset: string; // Ticker (BTC, ETH, etc.)
  amount: number; // Quantity of asset
  valueUsd: number | null; // USD value at time of transaction

  // Optional fields (may be null for edge cases)
  fee?: number; // Transaction fee in native currency
  feeUsd?: number | null;
  toAddress?: string;
  fromAddress?: string;
  txHash?: string;

  // User categorization
  category: TransactionCategory;
  description?: string; // User notes

  // Status flags
  isCategorized: boolean;
  isPriced: boolean; // Has valid USD price
  needsReview: boolean; // Flagged for user attention

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
