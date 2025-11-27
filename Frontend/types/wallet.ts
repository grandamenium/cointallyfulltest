export type ConnectionType = 'wallet-connect' | 'api-key' | 'csv-upload';
export type SourceType = 'blockchain' | 'exchange' | 'wallet';
export type ConnectionStatus = 'connected' | 'syncing' | 'error' | 'disconnected';

export interface ConnectionSource {
  id: string;
  name: string; // e.g., "Ethereum", "Coinbase", "MetaMask"
  type: SourceType;
  logo: string; // URL or path to logo
  connectionMethods: ConnectionType[]; // Which methods are supported
}

export interface ConnectedSource {
  id: string;
  userId: string;
  sourceId: string; // Reference to ConnectionSource (FK to connection_sources table)
  sourceName: string; // Maps to exchangeName in DB
  sourceType: SourceType;
  connectionType: ConnectionType;
  label?: string; // User-assigned nickname (maps to displayName in DB)
  address?: string; // For blockchain wallets
  credentials?: any; // Maps to encrypted credentials in DB (should not be exposed to client in production)
  lastSyncedAt: Date; // Maps to lastSyncAt in DB
  status: ConnectionStatus;
  transactionCount: number;
  connectedAt: Date; // Maps to createdAt in DB
}
