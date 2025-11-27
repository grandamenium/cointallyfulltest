# Backend Integration Guide
**CoinTally Cryptocurrency Tax Platform**

**Created:** 2025-11-08
**For:** Backend developers integrating with this frontend

---

## 📚 Documentation Overview

This guide provides a structured approach to implementing the backend for CoinTally. All endpoints, data models, and integration requirements have been cataloged from the frontend codebase.

### Essential Documentation

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[API_ENDPOINTS_DOCUMENTATION.md](./API_ENDPOINTS_DOCUMENTATION.md)** | Complete endpoint specifications | Reference for implementing each endpoint |
| **[API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md)** | Quick lookup table | Quick lookups during development |
| **[PRODUCT-REQUIREMENTS-DOCUMENT.md](./PRODUCT-REQUIREMENTS-DOCUMENT.md)** | Full product context | Understanding business requirements |
| **This Guide** | Integration workflow | Getting started and implementation order |

---

## 🚀 Quick Start

### 1. Review the Codebase Structure

```
CoinTallyFrontend/
├── app/
│   ├── api/                    # Mock API routes (replace these)
│   │   ├── transactions/
│   │   └── wallets/
│   ├── (auth)/                 # Authentication pages
│   ├── (dashboard)/            # Main app pages
│   └── (onboarding)/           # Onboarding flow
├── components/
│   └── features/               # Feature-specific components
├── hooks/                      # React Query hooks (API integration)
│   ├── useAuth.ts
│   ├── useWallets.ts
│   └── useTransactions.ts
├── lib/
│   └── api/
│       ├── client.ts           # API client wrapper
│       └── endpoints.ts        # Endpoint constants
├── types/                      # TypeScript interfaces
│   ├── user.ts
│   ├── wallet.ts
│   ├── transaction.ts
│   └── form.ts
├── @mock-database/             # Mock data (use for testing)
└── DOCS/                       # Documentation (you are here)
```

### 2. Understand the Data Flow

```
User Action (UI)
    ↓
React Component
    ↓
React Query Hook (useWallets.ts, useTransactions.ts, etc.)
    ↓
API Client (lib/api/client.ts)
    ↓
API Endpoint (NEXT_PUBLIC_API_URL + endpoint)
    ↓
[YOUR BACKEND] ← You implement this
    ↓
Database
```

### 3. Set Up Environment

**Frontend (.env.local):**
```bash
# Point to your backend API
NEXT_PUBLIC_API_URL=http://localhost:3001/api
# Or production
NEXT_PUBLIC_API_URL=https://api.cointally.com

# Supabase (for authentication)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Backend (.env):**
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/cointally
JWT_SECRET=your-secret-key
PORT=3001

# External API keys (for blockchain/exchange integration)
ETHERSCAN_API_KEY=your-key
COINBASE_API_KEY=your-key
COINBASE_API_SECRET=your-secret
KRAKEN_API_KEY=your-key
# ... etc
```

---

## 🎯 Implementation Roadmap

### Phase 1: Authentication & User Management (Week 1-2)
**Goal:** Users can register, login, and manage their profile

#### Tasks:
1. **Set up project structure**
   - Initialize backend framework (Express, FastAPI, etc.)
   - Configure PostgreSQL database
   - Set up ORM (Prisma, TypeORM, SQLAlchemy, etc.)

2. **Implement authentication**
   - [ ] `POST /auth/register`
   - [ ] `POST /auth/login`
   - [ ] `POST /auth/logout`
   - [ ] JWT token generation/validation
   - [ ] Password hashing (bcrypt/argon2)

3. **Implement user endpoints**
   - [ ] `GET /user/profile`
   - [ ] `PATCH /user/profile`
   - [ ] `PUT /user/tax-info`
   - [ ] `DELETE /user/profile`

4. **Update frontend**
   - [ ] Remove mock auth from `hooks/useAuth.ts`
   - [ ] Add Bearer token to `lib/api/client.ts`
   - [ ] Test login/register flows

**Test with:**
- Register a new user
- Login with credentials
- Update profile and tax info
- Verify token authentication works

**Reference:**
- API_ENDPOINTS_DOCUMENTATION.md: Lines 71-223
- Frontend files: `hooks/useAuth.ts`, `lib/api/client.ts`
- Mock data: `@mock-database/users.json`

---

### Phase 2: Wallet/Source Management (Week 2-3)
**Goal:** Users can connect wallets and exchanges

#### Tasks:
1. **Create connection sources seed data**
   - [ ] Define supported blockchains (Ethereum, Bitcoin, Solana, etc.)
   - [ ] Define supported exchanges (Coinbase, Binance, Kraken, etc.)
   - [ ] Create database seed script

2. **Implement wallet endpoints**
   - [ ] `GET /wallets/sources`
   - [ ] `GET /wallets/connected`
   - [ ] `POST /wallets/connect` (API key method)
   - [ ] `POST /wallets/connect` (CSV upload method)
   - [ ] `DELETE /wallets/disconnect/{id}`
   - [ ] `POST /wallets/resync/{id}`

3. **Set up background job processing**
   - [ ] Choose job queue system (Bull, Celery, etc.)
   - [ ] Implement wallet sync jobs
   - [ ] Implement transaction import jobs

4. **Integrate blockchain APIs**
   - [ ] Etherscan API (Ethereum transactions)
   - [ ] Blockchain.com API (Bitcoin)
   - [ ] Solscan API (Solana)
   - [ ] Handle rate limiting

5. **Integrate exchange APIs**
   - [ ] Coinbase Pro API
   - [ ] Kraken API
   - [ ] Binance API (if needed)

**Test with:**
- Connect Ethereum wallet (via API or mock address)
- Connect Coinbase exchange (with test API keys)
- Upload CSV file
- Trigger resync
- Verify transactions are imported

**Reference:**
- API_ENDPOINTS_DOCUMENTATION.md: Lines 225-358
- Frontend files: `hooks/useWallets.ts`, `components/features/wallets/`
- Mock data: `@mock-database/connection-sources.json`, `connected-sources.json`

---

### Phase 3: Transaction Management (Week 3-4)
**Goal:** Users can view, filter, and categorize transactions

#### Tasks:
1. **Implement transaction endpoints**
   - [ ] `GET /transactions` (with filtering)
   - [ ] `GET /transactions/{id}`
   - [ ] `PATCH /transactions/{id}` (categorization)
   - [ ] `POST /transactions/bulk-categorize`

2. **Set up transaction indexing**
   - [ ] Database indexes for filtering (date, sourceId, category, type)
   - [ ] Optimize for large datasets (1000+ transactions)

3. **Implement pricing service**
   - [ ] Historical USD price lookup
   - [ ] CoinGecko API or CryptoCompare API integration
   - [ ] Price caching strategy
   - [ ] Handle missing price data

4. **Transaction processing**
   - [ ] Parse blockchain transactions
   - [ ] Parse exchange transactions
   - [ ] Parse CSV uploads
   - [ ] Detect transaction types
   - [ ] Calculate USD values

**Test with:**
- List all transactions
- Filter by date range
- Filter by source
- Filter by category
- Categorize single transaction
- Bulk categorize multiple transactions
- Verify pricing data is accurate

**Reference:**
- API_ENDPOINTS_DOCUMENTATION.md: Lines 360-491
- Frontend files: `hooks/useTransactions.ts`, `app/(dashboard)/transactions/`
- Mock data: `@mock-database/transactions.json` (1000+ examples)

---

### Phase 4: Tax Form Generation (Week 4-6)
**Goal:** Users can generate IRS tax forms

#### Tasks:
1. **Implement tax calculation engine**
   - [ ] FIFO (First In, First Out) algorithm
   - [ ] LIFO (Last In, First Out) algorithm
   - [ ] HIFO (Highest In, First Out) algorithm
   - [ ] Specific Identification algorithm
   - [ ] Capital gains/loss calculations
   - [ ] Wash sale rule detection

2. **Implement form endpoints**
   - [ ] `GET /forms`
   - [ ] `POST /forms/generate` (async job)
   - [ ] `GET /forms/{id}`
   - [ ] `GET /forms/{id}/download`
   - [ ] `POST /forms/{id}/email`

3. **PDF generation**
   - [ ] Form 8949 template
   - [ ] Schedule D template
   - [ ] Library setup (PDFKit, ReportLab, etc.)

4. **Export formats**
   - [ ] CSV export
   - [ ] TurboTax format
   - [ ] TaxAct format

5. **Email service**
   - [ ] SendGrid/AWS SES integration
   - [ ] Email templates
   - [ ] PDF attachments

**Test with:**
- Generate form for 2024 with FIFO method
- Verify calculations are accurate
- Download PDF
- Download CSV
- Email form to user
- Test all tax methods (FIFO, LIFO, HIFO)

**Reference:**
- API_ENDPOINTS_DOCUMENTATION.md: Lines 493-619
- Frontend files: `components/features/forms/FormWizard.tsx`
- Mock data: `@mock-database/forms.json`

---

## 🔐 Authentication Implementation

### Required Changes

**1. Update API Client (`lib/api/client.ts`)**

Current (line 6):
```typescript
// TODO: AUTH - Add bearer token to headers
const headers = {
  'Content-Type': 'application/json',
  ...options?.headers,
};
```

Update to:
```typescript
const token = localStorage.getItem('auth_token'); // or cookie, or session
const headers = {
  'Content-Type': 'application/json',
  ...(token && { Authorization: `Bearer ${token}` }),
  ...options?.headers,
};
```

**2. Update Auth Hook (`hooks/useAuth.ts`)**

Current (line 3):
```typescript
// TODO: AUTH - Replace with real Supabase authentication
```

Replace entire hook with Supabase client or your auth service.

**3. Protect Routes (`app/page.tsx`)**

Current (line 4):
```typescript
// TODO: AUTH - Check if user is authenticated, redirect to /login if not
```

Add authentication check in middleware or page component.

---

## 📊 Database Schema Suggestions

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  onboarding_completed BOOLEAN DEFAULT FALSE
);
```

### Tax Info Table
```sql
CREATE TABLE user_tax_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  filing_year INTEGER NOT NULL,
  state VARCHAR(2) NOT NULL,
  filing_status VARCHAR(50) NOT NULL,
  income_band VARCHAR(50) NOT NULL,
  prior_year_losses DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Connection Sources Table (Seed Data)
```sql
CREATE TABLE connection_sources (
  id VARCHAR(50) PRIMARY KEY, -- e.g., 'ethereum', 'coinbase'
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'blockchain', 'exchange', 'wallet'
  logo TEXT,
  connection_methods JSONB NOT NULL -- ['wallet-connect', 'api-key', 'csv-upload']
);
```

### Connected Sources Table
```sql
CREATE TABLE connected_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  source_id VARCHAR(50) REFERENCES connection_sources(id),
  connection_type VARCHAR(20) NOT NULL,
  label VARCHAR(100),
  address VARCHAR(255), -- for blockchain wallets
  encrypted_credentials JSONB, -- for API keys
  last_synced_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'connected',
  transaction_count INTEGER DEFAULT 0,
  connected_at TIMESTAMP DEFAULT NOW()
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  source_id UUID REFERENCES connected_sources(id) ON DELETE CASCADE,
  date TIMESTAMP NOT NULL,
  type VARCHAR(20) NOT NULL,
  asset VARCHAR(20) NOT NULL,
  amount DECIMAL(30,15) NOT NULL,
  value_usd DECIMAL(15,2),
  fee DECIMAL(30,15),
  fee_usd DECIMAL(15,2),
  to_address VARCHAR(255),
  from_address VARCHAR(255),
  tx_hash VARCHAR(255),
  category VARCHAR(50) DEFAULT 'uncategorized',
  description TEXT,
  is_categorized BOOLEAN DEFAULT FALSE,
  is_priced BOOLEAN DEFAULT FALSE,
  needs_review BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_source_id ON transactions(source_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_type ON transactions(type);
```

### Tax Forms Table
```sql
CREATE TABLE tax_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,
  tax_method VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  total_gains DECIMAL(15,2) DEFAULT 0,
  total_losses DECIMAL(15,2) DEFAULT 0,
  net_gain_loss DECIMAL(15,2) DEFAULT 0,
  transactions_included INTEGER DEFAULT 0,
  files JSONB, -- {form8949: 'url', scheduleD: 'url', detailedCsv: 'url'}
  generated_at TIMESTAMP,
  email_sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🧪 Testing Strategy

### 1. Use Mock Data
The frontend has extensive mock data in `@mock-database/`:
- Use `users.json` to understand expected user structure
- Use `transactions.json` (1000+ entries) to test transaction endpoints
- Use `forms.json` to see expected tax form structure

### 2. Test Each Endpoint Independently
```bash
# Example: Test login endpoint
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Expected response:
# {"user": {...}, "token": "eyJhbGc..."}
```

### 3. Test with Frontend
1. Update `NEXT_PUBLIC_API_URL` in frontend `.env.local`
2. Start both frontend and backend
3. Test user flows:
   - Register → Login → Dashboard
   - Connect wallet → Import transactions
   - Categorize transactions
   - Generate tax form

### 4. Integration Tests
- Test authentication flow end-to-end
- Test wallet connection with real API keys (use test accounts)
- Test transaction import from blockchain
- Test tax calculations with known datasets

---

## 🔍 Finding Integration Points

### Search for Backend TODOs
```bash
# Find all backend integration points
grep -r "TODO: BACKEND" /home/user/CoinTallyFrontend

# Find all auth integration points
grep -r "TODO: AUTH" /home/user/CoinTallyFrontend
```

### Key Files to Review
1. **`lib/api/client.ts`** - API client (add auth token here)
2. **`lib/api/endpoints.ts`** - All endpoint constants
3. **`hooks/useAuth.ts`** - Authentication hook
4. **`hooks/useWallets.ts`** - Wallet management hooks
5. **`hooks/useTransactions.ts`** - Transaction hooks
6. **`types/*.ts`** - TypeScript interfaces (use for API contracts)

---

## 📦 Recommended Backend Stack

### Option 1: Node.js + Express
```
- Express.js (API server)
- Prisma (ORM)
- PostgreSQL (Database)
- Bull (Job queue)
- JWT (Authentication)
- PDFKit (PDF generation)
- SendGrid (Email)
```

### Option 2: Python + FastAPI
```
- FastAPI (API server)
- SQLAlchemy (ORM)
- PostgreSQL (Database)
- Celery + Redis (Job queue)
- JWT (Authentication)
- ReportLab (PDF generation)
- SendGrid (Email)
```

### Option 3: Your Choice
The frontend is framework-agnostic. As long as you implement the documented endpoints, you can use any backend stack.

---

## 🔄 Async Job Implementation

### Endpoints Requiring Async Processing

1. **Wallet Resync** (`POST /wallets/resync/{id}`)
   - Can take 1-5 minutes (fetching from blockchain APIs)
   - Return job ID immediately
   - Process in background

2. **Form Generation** (`POST /forms/generate`)
   - Can take 2-10 minutes (tax calculations)
   - Return job ID immediately
   - Generate PDFs in background

### Recommended Flow
```
Client Request
    ↓
Create background job
    ↓
Return job ID immediately (HTTP 202)
    ↓
Client polls: GET /jobs/{jobId}/status
    ↓
Job completes
    ↓
Return result
```

### Job Status Response
```json
{
  "jobId": "job_abc123",
  "status": "processing" | "completed" | "failed",
  "progress": 75,
  "result": {...},
  "error": "..."
}
```

---

## 🚨 Common Pitfalls

### 1. Missing CORS Configuration
```javascript
// Backend needs CORS headers
app.use(cors({
  origin: ['http://localhost:3000', 'https://cointally.com'],
  credentials: true
}));
```

### 2. Date Format Mismatches
Frontend expects ISO 8601 dates:
```json
{
  "date": "2024-11-08T19:38:00.000Z"
}
```

### 3. Decimal Precision
Crypto amounts can be very small (e.g., 0.000000123 BTC).
Use `DECIMAL(30,15)` in database, not `FLOAT`.

### 4. Rate Limiting
Blockchain APIs have rate limits. Implement:
- Request queuing
- Caching
- Exponential backoff

### 5. Security
- Never store API keys in plain text
- Encrypt sensitive credentials
- Use prepared statements (prevent SQL injection)
- Validate all input
- Rate limit endpoints

---

## 📞 Next Steps

1. **Read the full API documentation**
   - [API_ENDPOINTS_DOCUMENTATION.md](./API_ENDPOINTS_DOCUMENTATION.md)
   - [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md)

2. **Set up development environment**
   - Clone backend repository (or create new project)
   - Set up PostgreSQL database
   - Configure environment variables

3. **Start with Phase 1**
   - Implement authentication
   - Test with frontend
   - Move to next phase

4. **Reference mock data**
   - Use `@mock-database/*.json` files as examples
   - Match data structures exactly

5. **Test thoroughly**
   - Unit tests for each endpoint
   - Integration tests with frontend
   - Load testing for transaction imports

---

## 📚 Additional Resources

- **Frontend codebase:** `/home/user/CoinTallyFrontend/`
- **Mock database:** `/home/user/CoinTallyFrontend/@mock-database/`
- **Type definitions:** `/home/user/CoinTallyFrontend/types/`
- **PRD:** [PRODUCT-REQUIREMENTS-DOCUMENT.md](./PRODUCT-REQUIREMENTS-DOCUMENT.md)

---

**Good luck with the implementation! 🚀**

If you have questions about any endpoint or integration point, all the details are documented in API_ENDPOINTS_DOCUMENTATION.md.
