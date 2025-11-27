# CoinTally API Quick Reference

**Last Updated:** 2025-11-08
**For:** Backend developers implementing the API

---

## Quick Endpoint Summary

### Authentication
| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| POST | `/auth/login` | User login | `{email, password}` | `{user, token}` |
| POST | `/auth/register` | Create account | `{email, password, name}` | `{user, token}` |
| POST | `/auth/logout` | End session | None | `{success}` |

### User Management
| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| GET | `/user/profile` | Get user data | - | `User` object |
| PATCH | `/user/profile` | Update profile | `{name?, ...}` | `{success, user}` |
| PUT | `/user/tax-info` | Update tax info | `TaxInfo` object | `{success, taxInfo}` |
| DELETE | `/user/profile` | Delete account | - | `{success}` |

### Wallet/Source Management
| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| GET | `/wallets/sources` | List available sources | - | `ConnectionSource[]` |
| GET | `/wallets/connected` | List user's connections | - | `ConnectedSource[]` |
| POST | `/wallets/connect` | Connect new source | `{sourceId, connectionType, credentials}` | `{success, data}` |
| DELETE | `/wallets/disconnect/{id}` | Remove connection | - | `{success}` |
| POST | `/wallets/resync/{id}` | Trigger re-sync | - | `{success, jobId?}` |

### Transactions
| Method | Endpoint | Purpose | Query Params | Response |
|--------|----------|---------|--------------|----------|
| GET | `/transactions` | List transactions | `?sourceId&category&type` | `Transaction[]` |
| GET | `/transactions/{id}` | Get single transaction | - | `{transaction}` |
| PATCH | `/transactions/{id}` | Categorize transaction | `{category, description?}` | `{success, data}` |
| POST | `/transactions/bulk-categorize` | Categorize multiple | `{ids[], category, description?}` | `{success, updatedCount}` |

### Tax Forms
| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| GET | `/forms` | List user's forms | - | `TaxForm[]` |
| POST | `/forms/generate` | Create new form | `{taxYear, taxMethod}` | `{success, formId, jobId?}` |
| GET | `/forms/{id}` | Get form details | - | `{form}` |
| GET | `/forms/{id}/download?format=pdf` | Download form | - | Binary file |
| POST | `/forms/{id}/email` | Email form to user | `{email?}` | `{success}` |

---

## Priority Implementation Order

### Phase 1: Core Auth & Data (Week 1-2)
1. ✅ Authentication endpoints
2. ✅ User profile endpoints
3. ✅ Connection sources (seed data)
4. ✅ Get connected sources

### Phase 2: Wallet Integration (Week 2-3)
5. ✅ Connect wallet (API key method)
6. ✅ Connect wallet (CSV upload)
7. ✅ Disconnect wallet
8. ✅ Resync wallet (async job)
9. ✅ Transaction sync jobs

### Phase 3: Transaction Management (Week 3-4)
10. ✅ List transactions with filters
11. ✅ Categorize single transaction
12. ✅ Bulk categorize
13. ✅ Historical pricing service

### Phase 4: Tax Forms (Week 4-6)
14. ✅ Tax calculation engine (FIFO/LIFO/HIFO)
15. ✅ Form generation (async job)
16. ✅ PDF generation (Form 8949 & Schedule D)
17. ✅ CSV export
18. ✅ Download endpoints
19. ✅ Email service integration

---

## Critical Data Models

### User
```typescript
{
  id: string;
  email: string;
  name: string;
  onboardingCompleted: boolean;
  taxInfo: {
    filingYear: number;
    state: string;
    filingStatus: 'single' | 'married-joint' | 'married-separate' | 'head-of-household';
    incomeBand: 'under-50k' | '50k-100k' | '100k-200k' | '200k-500k' | 'over-500k';
    priorYearLosses: number;
  };
}
```

### ConnectedSource
```typescript
{
  id: string;
  userId: string;
  sourceId: string;        // e.g., "ethereum", "coinbase"
  connectionType: 'wallet-connect' | 'api-key' | 'csv-upload';
  address?: string;        // For blockchain wallets
  lastSyncedAt: Date;
  status: 'connected' | 'syncing' | 'error' | 'disconnected';
  transactionCount: number;
}
```

### Transaction
```typescript
{
  id: string;
  userId: string;
  sourceId: string;
  date: Date;
  type: 'buy' | 'sell' | 'transfer-in' | 'transfer-out' | 'self-transfer' |
        'expense' | 'gift-received' | 'gift-sent' | 'income' | 'mining' |
        'staking' | 'airdrop';
  asset: string;           // BTC, ETH, etc.
  amount: number;
  valueUsd: number | null;
  fee?: number;
  feeUsd?: number | null;
  toAddress?: string;
  fromAddress?: string;
  txHash?: string;
  category: 'uncategorized' | 'personal' | 'business-expense' | 'self-transfer' | 'gift';
  description?: string;
  isCategorized: boolean;
  isPriced: boolean;
  needsReview: boolean;
}
```

### TaxForm
```typescript
{
  id: string;
  userId: string;
  taxYear: number;
  taxMethod: 'FIFO' | 'LIFO' | 'HIFO' | 'SpecificID';
  status: 'draft' | 'generating' | 'completed' | 'error';
  totalGains: number;
  totalLosses: number;
  netGainLoss: number;
  transactionsIncluded: number;
  files: {
    form8949?: string;
    scheduleD?: string;
    detailedCsv?: string;
  };
}
```

---

## Environment Variables

```bash
# Frontend .env.local
NEXT_PUBLIC_API_URL=https://api.cointally.com
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key

# Backend .env
DATABASE_URL=postgresql://...
JWT_SECRET=...
ETHERSCAN_API_KEY=...
COINBASE_API_KEY=...
# ... other exchange/blockchain API keys
```

---

## Authentication Flow

1. User submits login form → `POST /auth/login`
2. Backend validates credentials
3. Backend returns JWT token + user data
4. Frontend stores token (localStorage/cookie)
5. Frontend includes token in all subsequent requests:
   ```
   Authorization: Bearer <token>
   ```
6. Backend validates token on each request
7. Token expires → Frontend redirects to login

---

## File Upload (CSV)

### Endpoint
```
POST /wallets/connect
Content-Type: application/json

{
  "sourceId": "coinbase",
  "connectionType": "csv-upload",
  "credentials": {
    "fileName": "transactions.csv",
    "fileSize": "12345"
  }
}
```

### Alternative: Separate Upload Endpoint
```
POST /wallets/upload-csv
Content-Type: multipart/form-data

file: <binary>
sourceId: "coinbase"
```

### Processing
1. Validate file type (.csv)
2. Parse CSV based on source format
3. Extract transaction data
4. Store raw file (audit trail)
5. Create background job to process transactions
6. Return job ID for status tracking

---

## Async Job Patterns

### Endpoints that should use async jobs:
- `/wallets/resync/{id}` - Can take 1-5 minutes
- `/forms/generate` - Can take 2-10 minutes

### Flow:
1. Client initiates request
2. Server creates job and returns immediately:
   ```json
   {
     "success": true,
     "jobId": "job_abc123",
     "status": "processing"
   }
   ```
3. Client polls status endpoint:
   ```
   GET /jobs/{jobId}/status
   Response: {
     "status": "processing" | "completed" | "failed",
     "progress": 75, // percentage
     "result": {...} // if completed
   }
   ```

### Alternative: WebSocket
- Client establishes WebSocket connection
- Server pushes real-time updates
- Better UX, more complex implementation

---

## Error Handling

### Standard Error Response
```json
{
  "error": "Human-readable message",
  "code": "ERROR_CODE",
  "details": {...}
}
```

### Common Error Codes
- `AUTH_REQUIRED` - Not authenticated
- `INVALID_TOKEN` - Token expired
- `VALIDATION_ERROR` - Bad request data
- `NOT_FOUND` - Resource doesn't exist
- `ALREADY_EXISTS` - Duplicate resource
- `RATE_LIMIT` - Too many requests
- `SERVER_ERROR` - Internal error

---

## Testing with Mock Data

### Mock Data Location
`/home/user/CoinTallyFrontend/@mock-database/`
- `connection-sources.json` - 10 sources (blockchains, exchanges, wallets)
- `connected-sources.json` - 6 user connections
- `transactions.json` - 1000+ sample transactions
- `forms.json` - 2 generated tax forms
- `users.json` - Mock user data

### Available Sources
- Blockchains: Ethereum, Bitcoin, Solana, Polygon
- Exchanges: Coinbase, Binance, Kraken
- Wallets: MetaMask, Ledger, Phantom

---

## Frontend Integration Points

### API Client
**File:** `/home/user/CoinTallyFrontend/lib/api/client.ts`
- Simple fetch wrapper
- JSON content-type headers
- Error handling
- **TODO:** Add Bearer token

### Endpoint Constants
**File:** `/home/user/CoinTallyFrontend/lib/api/endpoints.ts`
- All endpoints defined as constants
- Use these for consistency

### React Query Hooks
**Files:** `/home/user/CoinTallyFrontend/hooks/`
- `useAuth.ts` - Authentication
- `useWallets.ts` - Wallet/source management
- `useTransactions.ts` - Transaction operations

### Mock API Routes
**Directory:** `/home/user/CoinTallyFrontend/app/api/`
- Current Next.js route handlers
- Replace with real API calls
- Search for `// TODO: BACKEND` comments

---

## Support Resources

### Documentation
- Full API docs: `/DOCS/API_ENDPOINTS_DOCUMENTATION.md`
- PRD: `/DOCS/PRODUCT-REQUIREMENTS-DOCUMENT.md`
- Type definitions: `/types/*.ts`

### Search for Integration Points
```bash
# Find all backend TODOs
grep -r "TODO: BACKEND" /home/user/CoinTallyFrontend

# Find all auth TODOs
grep -r "TODO: AUTH" /home/user/CoinTallyFrontend

# Find API calls
grep -r "apiClient" /home/user/CoinTallyFrontend
```

---

**For detailed specifications, see API_ENDPOINTS_DOCUMENTATION.md**
