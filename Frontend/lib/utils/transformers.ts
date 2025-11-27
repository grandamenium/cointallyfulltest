import type { ConnectedSource, SourceType, ConnectionType, ConnectionStatus } from '@/types/wallet';

/**
 * Database record type for connected sources
 * Represents the structure as stored in the database
 */
interface DBConnectedSource {
  id: string;
  userId: string;
  exchangeName?: string;
  sourceName?: string;
  sourceId?: string;
  displayName?: string;
  label?: string;
  sourceType?: SourceType;
  connectionType?: ConnectionType;
  status: ConnectionStatus;
  lastSyncAt?: string;
  lastSyncedAt?: string;
  transactionCount?: number;
  credentials?: Record<string, unknown>;
  address?: string;
  createdAt?: string;
  connectedAt?: string;
}

/**
 * Transforms a connected source from database format to frontend format
 *
 * Database schema fields:
 * - id, userId, exchangeName, displayName, status, lastSyncAt, transactionCount, credentials, createdAt
 *
 * Frontend ConnectedSource fields:
 * - id, userId, sourceId, sourceName, sourceType, connectionType, label, address,
 *   credentials, lastSyncedAt, status, transactionCount, connectedAt
 *
 * @param dbSource - The connected source data from the database
 * @returns ConnectedSource - The transformed data for frontend use
 */
export function transformConnectedSourceFromDB(dbSource: DBConnectedSource): ConnectedSource {
  return {
    id: dbSource.id,
    userId: dbSource.userId,
    // sourceId could come from either field depending on DB structure
    sourceId: dbSource.sourceId || dbSource.exchangeName || 'unknown',
    // sourceName maps to exchangeName in DB
    sourceName: dbSource.exchangeName || dbSource.sourceName || 'Unknown Source',
    // sourceType might need to be derived from the source or stored separately
    sourceType: dbSource.sourceType || 'exchange',
    // connectionType might need to be derived or stored separately
    connectionType: dbSource.connectionType || 'api-key',
    // label maps to displayName in DB
    label: dbSource.displayName || dbSource.label,
    // address is for blockchain wallets
    address: dbSource.address,
    // credentials stored in DB (should be encrypted)
    credentials: dbSource.credentials,
    // lastSyncedAt maps to lastSyncAt in DB
    lastSyncedAt: new Date(dbSource.lastSyncAt || dbSource.lastSyncedAt || Date.now()),
    status: dbSource.status,
    transactionCount: dbSource.transactionCount || 0,
    // connectedAt maps to createdAt in DB
    connectedAt: new Date(dbSource.createdAt || dbSource.connectedAt || Date.now()),
  };
}

/**
 * Transforms multiple connected sources from database format to frontend format
 *
 * @param dbSources - Array of connected source data from the database
 * @returns ConnectedSource[] - Array of transformed data for frontend use
 */
export function transformConnectedSourcesFromDB(dbSources: DBConnectedSource[]): ConnectedSource[] {
  return dbSources.map(transformConnectedSourceFromDB);
}

/**
 * Transforms a connected source from frontend format to database format
 * Used when sending data to the backend API
 *
 * @param source - The frontend ConnectedSource object
 * @returns Object in database format
 */
export function transformConnectedSourceToDB(source: Partial<ConnectedSource>): Partial<DBConnectedSource> {
  const dbSource: Partial<DBConnectedSource> = {};

  if (source.id) dbSource.id = source.id;
  if (source.userId) dbSource.userId = source.userId;
  // Map sourceName to exchangeName for DB
  if (source.sourceName) dbSource.exchangeName = source.sourceName;
  // Map label to displayName for DB
  if (source.label) dbSource.displayName = source.label;
  if (source.status) dbSource.status = source.status;
  if (source.address) dbSource.address = source.address;
  if (source.credentials) dbSource.credentials = source.credentials;
  if (source.sourceType) dbSource.sourceType = source.sourceType;
  if (source.connectionType) dbSource.connectionType = source.connectionType;
  if (source.transactionCount !== undefined) dbSource.transactionCount = source.transactionCount;

  // Map lastSyncedAt to lastSyncAt for DB
  if (source.lastSyncedAt) {
    dbSource.lastSyncAt = source.lastSyncedAt instanceof Date
      ? source.lastSyncedAt.toISOString()
      : source.lastSyncedAt;
  }

  // Map connectedAt to createdAt for DB
  if (source.connectedAt) {
    dbSource.createdAt = source.connectedAt instanceof Date
      ? source.connectedAt.toISOString()
      : source.connectedAt;
  }

  return dbSource;
}
