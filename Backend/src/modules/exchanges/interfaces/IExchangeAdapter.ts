export interface ExchangeCredentials {
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
  additionalConfig?: Record<string, any>;
}

export interface ExchangeAccount {
  id: string;
  currency: string;
  balance: string;
  available: string;
  hold?: string;
}

export interface RawExchangeTransaction {
  id: string;
  type: string;
  timestamp: Date;
  data: any;
}

export type SyncProgressCallback = (phase: string, current: number, total: number) => void | Promise<void>;

export interface IExchangeAdapter {
  authenticate(credentials: ExchangeCredentials): Promise<boolean>;

  testConnection(credentials: ExchangeCredentials): Promise<boolean>;

  syncAccounts(credentials: ExchangeCredentials): Promise<ExchangeAccount[]>;

  syncTransactions(
    credentials: ExchangeCredentials,
    startDate: Date,
    endDate: Date,
    onProgress?: SyncProgressCallback,
  ): Promise<RawExchangeTransaction[]>;

  getExchangeName(): string;
}
