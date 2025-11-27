# CoinTally Frontend - API Endpoints Documentation

**Generated:** 2025-11-08
**Version:** 1.0
**Purpose:** Complete API endpoint reference for backend implementation

---

## Table of Contents

1. [Overview](#overview)
2. [API Client Configuration](#api-client-configuration)
3. [Authentication Endpoints](#authentication-endpoints)
4. [User Management Endpoints](#user-management-endpoints)
5. [Wallet/Source Management Endpoints](#walletsource-management-endpoints)
6. [Transaction Endpoints](#transaction-endpoints)
7. [Tax Form Endpoints](#tax-form-endpoints)
8. [Data Models](#data-models)
9. [Error Handling](#error-handling)
10. [File Upload Requirements](#file-upload-requirements)
11. [Implementation Checklist](#implementation-checklist)

---

## Overview

### Base Configuration
- **API Base URL:** Configurable via `NEXT_PUBLIC_API_URL` environment variable
- **Default Base:** `/api` (Next.js API routes)
- **Content Type:** `application/json`
- **Authentication:** Bearer token (to be implemented)

### Current Implementation Status
- Mock API routes in `/app/api/` using Next.js route handlers
- Data served from `@mock-database/*.json` files
- All TODO comments marked with `// TODO: BACKEND` or `// TODO: AUTH`

---

## API Client Configuration

### File Location
`/home/user/CoinTallyFrontend/lib/api/client.ts`

### Implementation
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T>
```

### Features
- Automatic JSON content-type headers
- Response error handling
- Placeholder for Bearer token authentication

### Authentication TODO
```typescript
// TODO: AUTH - Add bearer token to headers
const headers = {
  'Content-Type': 'application/json',
  ...options?.headers,
};
```

---

## Authentication Endpoints

### Endpoint Definitions
**File:** `/home/user/CoinTallyFrontend/lib/api/endpoints.ts`

### 1. Login
- **Endpoint:** `POST /auth/login`
- **Constant:** `ENDPOINTS.AUTH_LOGIN`
- **Request Body:**
  ```typescript
  {
    email: string;
    password: string;
  }
  ```
- **Expected Response:**
  ```typescript
  {
    user: User;
    token: string;
    refreshToken?: string;
  }
  ```
- **Status Codes:**
  - `200`: Success
  - `401`: Invalid credentials
  - `500`: Server error

### 2. Logout
- **Endpoint:** `POST /auth/logout`
- **Constant:** `ENDPOINTS.AUTH_LOGOUT`
- **Request Body:** None (uses auth token)
- **Expected Response:**
  ```typescript
  {
    success: boolean;
  }
  ```
- **Status Codes:**
  - `200`: Success
  - `401`: Unauthorized

### 3. Register
- **Endpoint:** `POST /auth/register`
- **Constant:** `ENDPOINTS.AUTH_REGISTER`
- **Request Body:**
  ```typescript
  {
    email: string;
    password: string;
    name: string;
  }
  ```
- **Expected Response:**
  ```typescript
  {
    user: User;
    token: string;
  }
  ```
- **Status Codes:**
  - `201`: User created
  - `400`: Validation error
  - `409`: Email already exists

### Implementation Notes
- Currently uses mock `useAuth` hook in `/home/user/CoinTallyFrontend/hooks/useAuth.ts`
- Frontend expects session-based or JWT authentication
- Password reset endpoint (`/forgot-password`) referenced in UI but not implemented

---

## User Management Endpoints

### 1. Get User Profile
- **Endpoint:** `GET /user/profile`
- **Constant:** `ENDPOINTS.USER_PROFILE`
- **Request:** None (authenticated)
- **Expected Response:**
  ```typescript
  User {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    onboardingCompleted: boolean;
    taxInfo: {
      filingYear: number;
      state: string;
      filingStatus: 'single' | 'married-joint' | 'married-separate' | 'head-of-household';
      incomeBand: 'under-50k' | '50k-100k' | '100k-200k' | '200k-500k' | 'over-500k';
      priorYearLosses: number; // USD
    };
  }
  ```
- **Status Codes:**
  - `200`: Success
  - `401`: Unauthorized

### 2. Update User Profile
- **Endpoint:** `PATCH /user/profile`
- **Request Body:**
  ```typescript
  {
    name?: string;
    // Other updatable fields
  }
  ```
- **Expected Response:**
  ```typescript
  {
    success: boolean;
    user: User;
  }
  ```

### 3. Update Tax Information
- **Endpoint:** `PUT /user/tax-info` or `PATCH /user/tax-info`
- **Constant:** `ENDPOINTS.USER_TAX_INFO`
- **Request Body:**
  ```typescript
  {
    filingYear: number;
    state: string;
    filingStatus: 'single' | 'married-joint' | 'married-separate' | 'head-of-household';
    incomeBand: 'under-50k' | '50k-100k' | '100k-200k' | '200k-500k' | 'over-500k';
    priorYearLosses: number;
  }
  ```
- **Expected Response:**
  ```typescript
  {
    success: boolean;
    taxInfo: User['taxInfo'];
  }
  ```
- **Status Codes:**
  - `200`: Success
  - `400`: Validation error
  - `401`: Unauthorized

### 4. Delete Account
- **Endpoint:** `DELETE /user/profile`
- **Request:** None (authenticated)
- **Expected Response:**
  ```typescript
  {
    success: boolean;
  }
  ```
- **Notes:** Referenced in disclaimer page (`/app/(onboarding)/disclaimer/page.tsx`)

---

## Wallet/Source Management Endpoints

### 1. Get Available Connection Sources
- **Endpoint:** `GET /wallets/sources`
- **Usage:** Display available blockchain/exchange/wallet options to connect
- **Mock Route:** `/home/user/CoinTallyFrontend/app/api/wallets/sources/route.ts`
- **Expected Response:**
  ```typescript
  ConnectionSource[] = [
    {
      id: string; // e.g., "ethereum", "coinbase", "metamask"
      name: string; // e.g., "Ethereum", "Coinbase"
      type: 'blockchain' | 'exchange' | 'wallet';
      logo: string; // URL or path to logo
      connectionMethods: ('wallet-connect' | 'api-key' | 'csv-upload')[];
    }
  ]
  ```
- **Status Codes:**
  - `200`: Success
- **Frontend Hook:** `useConnectionSources()` in `/home/user/CoinTallyFrontend/hooks/useWallets.ts`

### 2. Get Connected Sources
- **Endpoint:** `GET /wallets/connected`
- **Constant:** `ENDPOINTS.WALLETS_CONNECTED`
- **Mock Route:** `/home/user/CoinTallyFrontend/app/api/wallets/connected/route.ts`
- **Expected Response:**
  ```typescript
  ConnectedSource[] = [
    {
      id: string;
      userId: string;
      sourceId: string; // Reference to ConnectionSource
      sourceName: string;
      sourceType: 'blockchain' | 'exchange' | 'wallet';
      connectionType: 'wallet-connect' | 'api-key' | 'csv-upload';
      label?: string; // User-assigned nickname
      address?: string; // For blockchain wallets
      lastSyncedAt: Date;
      status: 'connected' | 'syncing' | 'error' | 'disconnected';
      transactionCount: number;
      connectedAt: Date;
    }
  ]
  ```
- **Status Codes:**
  - `200`: Success
  - `401`: Unauthorized
- **Frontend Hook:** `useConnectedSources()` in `/home/user/CoinTallyFrontend/hooks/useWallets.ts`

### 3. Connect New Source
- **Endpoint:** `POST /wallets/connect`
- **Constant:** `ENDPOINTS.WALLETS_CONNECT`
- **Mock Route:** `/home/user/CoinTallyFrontend/app/api/wallets/connect/route.ts`
- **Request Body:**
  ```typescript
  {
    sourceId: string; // ID from ConnectionSource
    connectionType: 'wallet-connect' | 'api-key' | 'csv-upload';
    credentials: {
      // For API Key:
      apiKey?: string;
      apiSecret?: string;
      passphrase?: string; // Optional, exchange-specific

      // For CSV Upload:
      fileName?: string;
      fileSize?: string;

      // For Wallet Connect:
      address?: string;
    };
  }
  ```
- **Expected Response:**
  ```typescript
  {
    success: boolean;
    data: ConnectedSource;
    message: string; // e.g., "Ethereum connected successfully"
  }
  ```
- **Status Codes:**
  - `200`: Success
  - `400`: Missing required fields or invalid connection method
  - `404`: Invalid source ID
  - `409`: Source already connected
  - `500`: Connection failed
- **Frontend Hook:** `useConnectSource()` in `/home/user/CoinTallyFrontend/hooks/useWallets.ts`
- **Component:** `/home/user/CoinTallyFrontend/components/features/wallets/ConnectionMethodSelector.tsx`

### 4. Disconnect Source
- **Endpoint:** `DELETE /wallets/disconnect/{id}`
- **Constant:** `ENDPOINTS.WALLETS_DISCONNECT(id)`
- **Path Parameters:**
  - `id`: ConnectedSource ID
- **Expected Response:**
  ```typescript
  {
    success: boolean;
  }
  ```
- **Status Codes:**
  - `200`: Success
  - `404`: Source not found
  - `401`: Unauthorized
- **Frontend Hook:** `useDisconnectSource()` in `/home/user/CoinTallyFrontend/hooks/useWallets.ts`
- **Side Effects:** Should also trigger deletion/archival of associated transactions

### 5. Resync Source
- **Endpoint:** `POST /wallets/resync/{id}`
- **Constant:** `ENDPOINTS.WALLETS_RESYNC(id)`
- **Path Parameters:**
  - `id`: ConnectedSource ID
- **Request Body:** None
- **Expected Response:**
  ```typescript
  {
    success: boolean;
    message: string;
    jobId?: string; // For async processing tracking
  }
  ```
- **Status Codes:**
  - `200`: Sync initiated
  - `202`: Sync accepted (async)
  - `404`: Source not found
  - `401`: Unauthorized
- **Frontend Hook:** `useResyncSource()` in `/home/user/CoinTallyFrontend/hooks/useWallets.ts`
- **Notes:**
  - Should be implemented as an async background job
  - Should update `lastSyncedAt` timestamp
  - Should set status to 'syncing' during process

---

## Transaction Endpoints

### 1. List Transactions
- **Endpoint:** `GET /transactions`
- **Constant:** `ENDPOINTS.TRANSACTIONS_LIST`
- **Mock Route:** `/home/user/CoinTallyFrontend/app/api/transactions/route.ts`
- **Query Parameters:**
  ```typescript
  {
    sourceId?: string;      // Filter by connected source
    category?: string;      // Filter by category
    type?: string;          // Filter by transaction type
    startDate?: string;     // ISO date
    endDate?: string;       // ISO date
    limit?: number;         // Pagination
    offset?: number;        // Pagination
  }
  ```
- **Expected Response:**
  ```typescript
  Transaction[] = [
    {
      id: string;
      userId: string;
      sourceId: string; // ConnectedSource ID
      sourceName: string;

      // Core transaction data
      date: Date;
      type: 'buy' | 'sell' | 'transfer-in' | 'transfer-out' | 'self-transfer' |
            'expense' | 'gift-received' | 'gift-sent' | 'income' | 'mining' |
            'staking' | 'airdrop';
      asset: string; // Ticker (BTC, ETH, etc.)
      amount: number; // Quantity of asset
      valueUsd: number | null; // USD value at time of transaction

      // Optional fields
      fee?: number; // Transaction fee in native currency
      feeUsd?: number | null;
      toAddress?: string;
      fromAddress?: string;
      txHash?: string;

      // User categorization
      category: 'uncategorized' | 'personal' | 'business-expense' | 'self-transfer' | 'gift';
      description?: string; // User notes

      // Status flags
      isCategorized: boolean;
      isPriced: boolean; // Has valid USD price
      needsReview: boolean; // Flagged for user attention

      // Timestamps
      createdAt: Date;
      updatedAt: Date;
    }
  ]
  ```
- **Status Codes:**
  - `200`: Success
  - `401`: Unauthorized
- **Frontend Hook:** `useTransactions(filters)` in `/home/user/CoinTallyFrontend/hooks/useTransactions.ts`

### 2. Get Transaction by ID
- **Endpoint:** `GET /transactions/{id}`
- **Constant:** `ENDPOINTS.TRANSACTIONS_BY_ID(id)`
- **Path Parameters:**
  - `id`: Transaction ID
- **Expected Response:**
  ```typescript
  {
    transaction: Transaction;
  }
  ```
- **Status Codes:**
  - `200`: Success
  - `404`: Transaction not found
  - `401`: Unauthorized

### 3. Categorize Single Transaction
- **Endpoint:** `PATCH /transactions/{id}`
- **Constant:** `ENDPOINTS.TRANSACTIONS_CATEGORIZE(id)` (note: the constant includes /categorize suffix, but implementation uses PATCH on base ID)
- **Mock Route:** `/home/user/CoinTallyFrontend/app/api/transactions/route.ts` (PATCH method)
- **Path Parameters:**
  - `id`: Transaction ID
- **Request Body:**
  ```typescript
  {
    category: 'personal' | 'business-expense' | 'self-transfer' | 'gift';
    description?: string;
  }
  ```
- **Expected Response:**
  ```typescript
  {
    success: boolean;
    data: Transaction;
  }
  ```
- **Status Codes:**
  - `200`: Success
  - `400`: Invalid category
  - `404`: Transaction not found
  - `401`: Unauthorized
- **Frontend Hook:** `useCategorizeTransaction()` in `/home/user/CoinTallyFrontend/hooks/useTransactions.ts`

### 4. Bulk Categorize Transactions
- **Endpoint:** `POST /transactions/bulk-categorize`
- **Constant:** `ENDPOINTS.TRANSACTIONS_BULK_CATEGORIZE`
- **Request Body:**
  ```typescript
  {
    ids: string[]; // Array of transaction IDs
    category: 'personal' | 'business-expense' | 'self-transfer' | 'gift';
    description?: string;
  }
  ```
- **Expected Response:**
  ```typescript
  {
    success: boolean;
    updatedCount: number;
    transactions: Transaction[];
  }
  ```
- **Status Codes:**
  - `200`: Success
  - `400`: Invalid data
  - `401`: Unauthorized
- **Frontend Hook:** `useBulkCategorize()` in `/home/user/CoinTallyFrontend/hooks/useTransactions.ts`

---

## Tax Form Endpoints

### 1. List Tax Forms
- **Endpoint:** `GET /forms`
- **Constant:** `ENDPOINTS.FORMS_LIST`
- **Expected Response:**
  ```typescript
  TaxForm[] = [
    {
      id: string;
      userId: string;
      taxYear: number;
      taxMethod: 'FIFO' | 'LIFO' | 'HIFO' | 'SpecificID';
      status: 'draft' | 'generating' | 'completed' | 'error';

      // Summary data
      totalGains: number;
      totalLosses: number;
      netGainLoss: number;
      transactionsIncluded: number;

      // Form files
      files: {
        form8949?: string; // URL to generated PDF
        scheduleD?: string; // URL to generated PDF
        detailedCsv?: string; // URL to CSV export
      };

      // Metadata
      generatedAt?: Date;
      emailSentAt?: Date;
      createdAt: Date;
    }
  ]
  ```
- **Status Codes:**
  - `200`: Success
  - `401`: Unauthorized
- **Used in:** `/home/user/CoinTallyFrontend/app/(dashboard)/view-forms/page.tsx`

### 2. Generate Tax Form
- **Endpoint:** `POST /forms/generate`
- **Constant:** `ENDPOINTS.FORMS_GENERATE`
- **Request Body:**
  ```typescript
  {
    taxYear: number; // e.g., 2024
    taxMethod: 'FIFO' | 'LIFO' | 'HIFO' | 'SpecificID';
    includeTransactionIds?: string[]; // Optional: specific transactions to include
  }
  ```
- **Expected Response:**
  ```typescript
  {
    success: boolean;
    formId: string;
    status: 'generating' | 'completed';
    jobId?: string; // For async processing
  }
  ```
- **Status Codes:**
  - `200`: Form generation started
  - `202`: Accepted (async processing)
  - `400`: Invalid parameters
  - `401`: Unauthorized
- **Notes:**
  - Should be implemented as async job (can take minutes to generate)
  - Frontend polls or uses WebSocket for status updates
  - Used in: `/home/user/CoinTallyFrontend/components/features/forms/FormWizard.tsx`

### 3. Get Form by ID
- **Endpoint:** `GET /forms/{id}`
- **Constant:** `ENDPOINTS.FORMS_BY_ID(id)`
- **Path Parameters:**
  - `id`: Form ID
- **Expected Response:**
  ```typescript
  {
    form: TaxForm;
  }
  ```
- **Status Codes:**
  - `200`: Success
  - `404`: Form not found
  - `401`: Unauthorized

### 4. Download Form
- **Endpoint:** `GET /forms/{id}/download?format={format}`
- **Constant:** `ENDPOINTS.FORMS_DOWNLOAD(id, format)`
- **Path Parameters:**
  - `id`: Form ID
- **Query Parameters:**
  - `format`: 'pdf' | 'csv' | 'turbotax' | 'taxact'
- **Expected Response:** File download (binary)
- **Content-Type:**
  - PDF: `application/pdf`
  - CSV: `text/csv`
- **Status Codes:**
  - `200`: Success
  - `404`: Form or file not found
  - `401`: Unauthorized
- **Notes:**
  - Should set `Content-Disposition: attachment; filename="form-8949-2024.pdf"`
  - Used in: `/home/user/CoinTallyFrontend/app/(dashboard)/view-forms/page.tsx`

### 5. Email Form (Implied)
- **Endpoint:** `POST /forms/{id}/email`
- **Request Body:**
  ```typescript
  {
    email?: string; // Optional, defaults to user's email
  }
  ```
- **Expected Response:**
  ```typescript
  {
    success: boolean;
    message: string;
  }
  ```
- **Status Codes:**
  - `200`: Email sent
  - `404`: Form not found
  - `401`: Unauthorized
- **Notes:** Referenced in FormWizard success screen

---

## Data Models

### Complete TypeScript Definitions

**Location:** `/home/user/CoinTallyFrontend/types/`

#### User Model
```typescript
// File: types/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  onboardingCompleted: boolean;
  taxInfo: {
    filingYear: number;
    state: string;
    filingStatus: 'single' | 'married-joint' | 'married-separate' | 'head-of-household';
    incomeBand: 'under-50k' | '50k-100k' | '100k-200k' | '200k-500k' | 'over-500k';
    priorYearLosses: number; // USD
  };
}
```

#### Wallet/Source Models
```typescript
// File: types/wallet.ts
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
  sourceId: string; // Reference to ConnectionSource
  sourceName: string;
  sourceType: SourceType;
  connectionType: ConnectionType;
  label?: string; // User-assigned nickname
  address?: string; // For blockchain wallets
  lastSyncedAt: Date;
  status: ConnectionStatus;
  transactionCount: number;
  connectedAt: Date;
}
```

#### Transaction Model
```typescript
// File: types/transaction.ts
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
```

#### Tax Form Model
```typescript
// File: types/form.ts
export type TaxMethod = 'FIFO' | 'LIFO' | 'HIFO' | 'SpecificID';
export type FormStatus = 'draft' | 'generating' | 'completed' | 'error';
export type ExportFormat = 'pdf' | 'csv' | 'turbotax' | 'taxact';

export interface TaxForm {
  id: string;
  userId: string;
  taxYear: number;
  taxMethod: TaxMethod;
  status: FormStatus;

  // Summary data
  totalGains: number;
  totalLosses: number;
  netGainLoss: number;
  transactionsIncluded: number;

  // Form files
  files: {
    form8949?: string; // URL to generated PDF
    scheduleD?: string;
    detailedCsv?: string;
  };

  // Metadata
  generatedAt?: Date;
  emailSentAt?: Date;
  createdAt: Date;
}
```

---

## Error Handling

### Expected Error Response Format
```typescript
{
  error: string; // Human-readable error message
  code?: string; // Error code for programmatic handling
  details?: any; // Additional error details
}
```

### Error Handling in Frontend
**Location:** `/home/user/CoinTallyFrontend/lib/api/client.ts`

```typescript
if (!response.ok) {
  throw new Error(`API Error: ${response.statusText}`);
}
```

### Recommended Error Codes
- `AUTH_REQUIRED`: User not authenticated
- `INVALID_TOKEN`: Token expired or invalid
- `VALIDATION_ERROR`: Request validation failed
- `NOT_FOUND`: Resource not found
- `ALREADY_EXISTS`: Resource already exists (e.g., duplicate connection)
- `RATE_LIMIT`: Too many requests
- `SERVER_ERROR`: Internal server error

---

## File Upload Requirements

### CSV Upload Implementation

**Component:** `/home/user/CoinTallyFrontend/components/features/wallets/ConnectionMethodSelector.tsx` (CsvUploadFlow)

### Current Mock Implementation
- File selection via HTML input
- Client-side validation: `.csv` file type only
- Simulated upload with 2-second delay
- Passes file metadata to connection endpoint

### Backend Requirements

#### Upload Endpoint
Should be part of `/wallets/connect` or separate endpoint:
```
POST /wallets/upload-csv
Content-Type: multipart/form-data
```

#### Request Format
```typescript
FormData {
  file: File; // CSV file
  sourceId: string; // Which exchange/blockchain this is from
}
```

#### Processing Steps
1. Validate file type and size (recommend max 10MB)
2. Parse CSV according to source format
3. Extract transaction data
4. Store raw file (for audit trail)
5. Process transactions asynchronously
6. Return job ID for status tracking

#### Expected Response
```typescript
{
  success: boolean;
  uploadId: string;
  fileName: string;
  rowCount: number;
  jobId: string; // For tracking async processing
}
```

### CSV Template Download
**Referenced in:** `ConnectionMethodSelector.tsx` line 388

Should provide downloadable CSV templates for each exchange/blockchain with:
- Column headers
- Example rows
- Format specifications

---

## Implementation Checklist

### Phase 1: Authentication
- [ ] Implement `/auth/login` endpoint
- [ ] Implement `/auth/register` endpoint
- [ ] Implement `/auth/logout` endpoint
- [ ] Set up JWT or session-based auth
- [ ] Update `apiClient` to include Bearer token
- [ ] Replace mock `useAuth` hook with real Supabase integration

### Phase 2: User Management
- [ ] Implement `/user/profile` GET endpoint
- [ ] Implement `/user/profile` PATCH endpoint
- [ ] Implement `/user/tax-info` PUT/PATCH endpoint
- [ ] Implement `/user/profile` DELETE endpoint (account deletion)

### Phase 3: Wallet/Source Management
- [ ] Create `ConnectionSource` seed data in database
- [ ] Implement `/wallets/sources` GET endpoint
- [ ] Implement `/wallets/connected` GET endpoint
- [ ] Implement `/wallets/connect` POST endpoint
  - [ ] API key connection type
  - [ ] CSV upload connection type
  - [ ] Wallet connect integration (future)
- [ ] Implement `/wallets/disconnect/{id}` DELETE endpoint
- [ ] Implement `/wallets/resync/{id}` POST endpoint
- [ ] Set up background job processing for syncing
- [ ] Integrate blockchain API clients (Etherscan, etc.)
- [ ] Integrate exchange API clients (Coinbase, Kraken, etc.)

### Phase 4: Transaction Management
- [ ] Implement `/transactions` GET endpoint with filtering
- [ ] Implement `/transactions/{id}` GET endpoint
- [ ] Implement `/transactions/{id}` PATCH endpoint (categorization)
- [ ] Implement `/transactions/bulk-categorize` POST endpoint
- [ ] Set up transaction indexing for performance
- [ ] Implement pricing service (historical USD values)

### Phase 5: Tax Form Generation
- [ ] Implement `/forms` GET endpoint
- [ ] Implement `/forms/generate` POST endpoint
- [ ] Set up async job queue for form generation
- [ ] Implement tax calculation engine (FIFO/LIFO/HIFO/SpecificID)
- [ ] Implement Form 8949 PDF generation
- [ ] Implement Schedule D PDF generation
- [ ] Implement CSV export
- [ ] Implement `/forms/{id}` GET endpoint
- [ ] Implement `/forms/{id}/download` GET endpoint
- [ ] Implement `/forms/{id}/email` POST endpoint
- [ ] Set up email service integration

### Phase 6: Infrastructure
- [ ] Set up production API base URL
- [ ] Configure CORS policies
- [ ] Set up rate limiting
- [ ] Implement request logging
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure database backups
- [ ] Set up API documentation (Swagger/OpenAPI)

---

## Additional Notes

### Mock Data Location
All mock data is stored in `/home/user/CoinTallyFrontend/@mock-database/`:
- `connection-sources.json` - Available sources to connect
- `connected-sources.json` - User's connected sources
- `transactions.json` - Transaction history (large file, ~476KB)
- `forms.json` - Generated tax forms
- `users.json` - User data

### Mock Data Generation
**Script:** `/home/user/CoinTallyFrontend/@mock-database/generate-mock-data.ts`
- Uses Faker.js to generate realistic data
- Generates 1000+ transactions with varied types
- Run with: `npm run generate:mocks`

### Frontend Data Fetching Patterns
- Uses TanStack Query v5 for all API calls
- Implements optimistic updates for mutations
- Cache invalidation on successful mutations
- Query keys defined in hook files

### Cache Invalidation Strategy
When data changes, the following queries are invalidated:
- Disconnect source → `['connected-sources']`, `['transactions']`
- Resync source → `['connected-sources']`, `['transactions']`
- Categorize transaction → `['transactions']`
- Connect source → `['connected-sources']`

---

## Support Contact

For questions about frontend implementation or API integration:
- Review TODO comments in codebase: `grep -r "TODO: BACKEND"`
- Check React Query hooks in `/home/user/CoinTallyFrontend/hooks/`
- Review mock API routes in `/home/user/CoinTallyFrontend/app/api/`
- Consult PRD at `/home/user/CoinTallyFrontend/DOCS/PRODUCT-REQUIREMENTS-DOCUMENT.md`

---

**END OF API DOCUMENTATION**
