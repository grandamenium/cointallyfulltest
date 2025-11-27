# CoinTally Frontend - Backend Integration Guide

**For Backend Developers integrating Supabase, Database, and API Endpoints**

> **TL;DR**: This is a production-ready Next.js 14 frontend with **19 stubbed API endpoints** ready for Supabase integration. All auth hooks, data hooks, and API routes are pre-built with clear `TODO: BACKEND` markers. Jump to [Quick Start Integration](#-quick-start-integration-5-minutes) to begin.

---

## 📊 Project Status

**Frontend Status:** ✅ 100% Complete & Production Ready
**Backend Status:** ⏳ Ready for Integration
**Build Status:** ✅ Passing (TypeScript ✓ ESLint ✓ Build ✓)
**Version:** 1.1.0
**Last Updated:** November 18, 2025

### What's Built (Frontend)
- ✅ 11 fully functional pages with polished UI
- ✅ Complete type-safe API client with error handling
- ✅ React Query hooks for all data operations
- ✅ Mock authentication system (ready for Supabase swap)
- ✅ 600+ mock transactions for development/testing
- ✅ Comprehensive error boundaries and loading states
- ✅ Mobile-responsive design (375px - 1920px)

### What's Needed (Backend)
- ⏳ Supabase authentication integration
- ⏳ Database schema implementation
- ⏳ API endpoint implementation (19 routes)
- ⏳ Real-time data sync
- ⏳ File upload for CSV imports
- ⏳ PDF generation for tax forms

---

## 🎯 Quick Start Integration (5 Minutes)

### 1. Understand the Architecture

```
Frontend (You're Here)          Backend (You'll Build)
┌─────────────────────┐        ┌──────────────────────┐
│  React Components   │        │   Supabase Auth      │
│         ↓           │        │         ↓            │
│   Custom Hooks      │◄──────►│   API Routes         │
│         ↓           │  HTTP  │         ↓            │
│   API Client        │        │   Database Queries   │
│   (lib/api/)        │        │   (PostgreSQL)       │
└─────────────────────┘        └──────────────────────┘
```

### 2. Find Integration Points

Search for these markers in the codebase:
```bash
# Find all backend integration points
grep -r "TODO: BACKEND" --include="*.ts" --include="*.tsx" .

# Find all auth integration points
grep -r "TODO: AUTH" --include="*.ts" --include="*.tsx" .

# Count total TODOs
grep -r "TODO: BACKEND\|TODO: AUTH" --include="*.ts" --include="*.tsx" . | wc -l
```

**Result:** ~25-30 integration points clearly marked

### 3. Key Files You'll Modify

| File | Purpose | Line Count | Complexity |
|------|---------|------------|------------|
| `hooks/useAuth.ts` | Replace mock auth with Supabase | 96 lines | ⭐⭐ Easy |
| `lib/api/client.ts` | Add JWT token handling | 73 lines | ⭐ Very Easy |
| `app/api/*/route.ts` | Replace JSON with DB queries | 30-50/file | ⭐⭐⭐ Medium |

### 4. Environment Setup

Create `.env.local` in project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# API Configuration
NEXT_PUBLIC_API_URL=/api  # Use /api for Next.js routes, or https://your-backend.com for external

# Database (if not using Supabase)
DATABASE_URL=postgresql://user:password@localhost:5432/cointally

# Optional: External Services
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
```

### 5. Install Supabase

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

---

## 🏗 Architecture Deep Dive

### File Structure (Where Everything Lives)

```
CoinTallyFrontEnd/
│
├── 📁 app/                              # Next.js App Router
│   ├── (auth)/login/page.tsx            # Login UI (ready for Supabase)
│   ├── (dashboard)/                     # Protected routes
│   │   ├── dashboard/page.tsx           # Main dashboard
│   │   ├── transactions/page.tsx        # Transaction management
│   │   ├── wallets/page.tsx            # Wallet connections
│   │   ├── new-form/page.tsx           # Tax form generation
│   │   ├── view-forms/page.tsx         # Form history
│   │   ├── profile/page.tsx            # User settings
│   │   └── support/page.tsx            # Help & FAQ
│   │
│   └── 📁 api/                         # ⚠️ YOUR MAIN INTEGRATION POINT
│       ├── auth/
│       │   ├── login/route.ts          # Replace with: supabase.auth.signInWithPassword()
│       │   ├── register/route.ts       # Replace with: supabase.auth.signUp()
│       │   └── logout/route.ts         # Replace with: supabase.auth.signOut()
│       │
│       ├── user/
│       │   ├── profile/route.ts        # GET/PATCH user data
│       │   └── tax-info/route.ts       # PUT tax information
│       │
│       ├── transactions/
│       │   ├── route.ts                # GET /transactions (with filters)
│       │   ├── [id]/route.ts           # GET/PATCH single transaction
│       │   └── bulk-categorize/route.ts # POST bulk update
│       │
│       ├── wallets/
│       │   ├── connected/route.ts      # GET user's connected wallets
│       │   ├── sources/route.ts        # GET available connection sources
│       │   ├── connect/route.ts        # POST connect new wallet
│       │   ├── disconnect/[id]/route.ts # DELETE disconnect wallet
│       │   └── resync/[id]/route.ts    # POST trigger resync
│       │
│       └── forms/
│           ├── route.ts                # GET all forms
│           ├── generate/route.ts       # POST create new form
│           ├── [id]/route.ts           # GET single form
│           ├── [id]/download/route.ts  # GET download PDF
│           └── [id]/email/route.ts     # POST email form
│
├── 📁 hooks/                            # ⚠️ DATA FETCHING LOGIC
│   ├── useAuth.ts                      # 🔐 AUTH: Replace with Supabase client
│   ├── useTransactions.ts              # 📊 React Query hooks for transactions
│   ├── useWallets.ts                   # 💼 React Query hooks for wallets
│   ├── useForms.ts                     # 📋 React Query hooks for forms
│   └── useUser.ts                      # 👤 React Query hooks for user profile
│
├── 📁 lib/
│   ├── api/
│   │   ├── client.ts                   # 🌐 HTTP client (add JWT here)
│   │   ├── endpoints.ts                # 📍 API endpoint constants
│   │   └── errors.ts                   # ⚠️ Custom error classes
│   │
│   └── utils/
│       ├── transformers.ts             # 🔄 DB ↔ Frontend data transformers
│       ├── format.ts                   # 📅 Date/currency formatting
│       └── transactions.ts             # 💰 Transaction calculations
│
├── 📁 types/                            # 📝 TypeScript Definitions
│   ├── user.ts                         # User interface (matches DB schema)
│   ├── transaction.ts                  # Transaction types
│   ├── wallet.ts                       # Wallet/source types
│   └── form.ts                         # Tax form types
│
└── 📁 @mock-database/                   # 🎭 Mock Data (delete after integration)
    ├── transactions.json               # 600 sample transactions
    ├── connected-sources.json          # 6 connected wallets
    ├── connection-sources.json         # 10 available sources
    ├── users.json                      # 1 mock user
    ├── forms.json                      # 2 sample forms
    └── generate-mock-data.ts           # Data generator script
```

---

## 🔐 Authentication Integration (Supabase)

### Current State (Mock)

**File:** `hooks/useAuth.ts`

```typescript
// Current implementation uses Zustand store
export function useAuth() {
  return {
    user: mockUser,  // Hardcoded mock user
    signIn: async () => { /* stub */ },
    signOut: async () => { /* stub */ },
  };
}
```

### Target State (Supabase)

**Step 1: Create Supabase Client**

Create `lib/supabase/client.ts`:

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase'; // Generate this with Supabase CLI

export const supabase = createClientComponentClient<Database>();
```

**Step 2: Replace useAuth Hook**

Update `hooks/useAuth.ts`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@/types/user';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? transformSupabaseUser(session.user) : null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ? transformSupabaseUser(session.user) : null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,

    signIn: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { user: data.user, error };
    },

    signUp: async (email: string, password: string, firstName: string, lastName: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName },
        },
      });
      return { user: data.user, error };
    },

    signOut: async () => {
      await supabase.auth.signOut();
    },

    resetPassword: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    },
  };
}

// Helper to transform Supabase user to our User type
function transformSupabaseUser(supabaseUser: any): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email!,
    firstName: supabaseUser.user_metadata?.first_name || '',
    lastName: supabaseUser.user_metadata?.last_name || '',
    emailVerified: supabaseUser.email_confirmed_at !== null,
    twoFactorEnabled: false,
    createdAt: new Date(supabaseUser.created_at),
    updatedAt: new Date(supabaseUser.updated_at),
    onboardingCompleted: supabaseUser.user_metadata?.onboarding_completed || false,
    taxInfo: supabaseUser.user_metadata?.tax_info || null,
  };
}
```

**Step 3: Update API Client to Include JWT**

Update `lib/api/client.ts`:

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.access_token) {
    return {
      'Authorization': `Bearer ${session.access_token}`,
    };
  }

  return {};
}

// Rest of client.ts remains the same, but getAuthHeaders() is now async
export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(await getAuthHeaders()), // Now awaited
    ...options?.headers,
  };

  // ... rest of implementation
}
```

**Step 4: Protect Routes with Middleware**

Create `middleware.ts` in project root:

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();

  // Protect dashboard routes
  if (req.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Redirect to dashboard if already logged in
  if (req.nextUrl.pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
```

---

## 🗄 Database Schema

### Required Tables

Based on the TypeScript types in `types/`, you need these tables:

#### 1. Users Table (Managed by Supabase Auth)

```sql
-- Supabase creates auth.users automatically
-- Add additional fields to user_metadata or create profiles table

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### 2. Tax Information Table

```sql
CREATE TABLE public.tax_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  filing_year INTEGER NOT NULL,
  state TEXT NOT NULL,
  filing_status TEXT NOT NULL CHECK (filing_status IN ('single', 'married-joint', 'married-separate', 'head-of-household')),
  income_band TEXT NOT NULL CHECK (income_band IN ('under-50k', '50k-100k', '100k-200k', '200k-500k', 'over-500k')),
  prior_year_losses DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, filing_year)
);

ALTER TABLE public.tax_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tax info"
  ON public.tax_info
  FOR ALL
  USING (auth.uid() = user_id);
```

#### 3. Connection Sources Table (Available Wallets/Exchanges)

```sql
CREATE TABLE public.connection_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('blockchain', 'exchange', 'wallet')),
  logo TEXT,
  connection_methods TEXT[] NOT NULL, -- ['wallet-connect', 'api-key', 'csv-upload']
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Public read access (no RLS needed, it's reference data)
-- Seed data from @mock-database/connection-sources.json
```

#### 4. Connected Sources Table (User's Wallets)

```sql
CREATE TABLE public.connected_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source_id TEXT REFERENCES public.connection_sources(id),
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  connection_type TEXT NOT NULL CHECK (connection_type IN ('wallet-connect', 'api-key', 'csv-upload')),
  label TEXT, -- User's custom nickname
  address TEXT, -- Wallet address (for blockchain)
  api_key_encrypted TEXT, -- Encrypted API credentials
  last_synced_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'syncing', 'error', 'disconnected')),
  transaction_count INTEGER DEFAULT 0,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.connected_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sources"
  ON public.connected_sources
  FOR ALL
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_connected_sources_user_id ON public.connected_sources(user_id);
```

#### 5. Transactions Table

```sql
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source_id UUID REFERENCES public.connected_sources(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,

  -- Transaction data
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell', 'transfer-in', 'transfer-out', 'self-transfer', 'expense', 'gift-received', 'gift-sent', 'income', 'mining', 'staking', 'airdrop')),
  asset TEXT NOT NULL, -- BTC, ETH, etc.
  amount DECIMAL(30, 18) NOT NULL,
  value_usd DECIMAL(15, 2),

  -- Optional fields
  fee DECIMAL(30, 18),
  fee_usd DECIMAL(15, 2),
  to_address TEXT,
  from_address TEXT,
  tx_hash TEXT,

  -- User categorization
  category TEXT NOT NULL DEFAULT 'uncategorized' CHECK (category IN ('uncategorized', 'personal', 'business-expense', 'self-transfer', 'gift')),
  description TEXT,

  -- Status flags
  is_categorized BOOLEAN DEFAULT FALSE,
  is_priced BOOLEAN DEFAULT FALSE,
  needs_review BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own transactions"
  ON public.transactions
  FOR ALL
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_source_id ON public.transactions(source_id);
CREATE INDEX idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX idx_transactions_category ON public.transactions(category);
CREATE INDEX idx_transactions_type ON public.transactions(type);
```

#### 6. Tax Forms Table

```sql
CREATE TABLE public.tax_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,
  tax_method TEXT NOT NULL CHECK (tax_method IN ('FIFO', 'LIFO', 'HIFO', 'SpecificID')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'completed', 'error')),

  -- Summary data
  total_gains DECIMAL(15, 2) DEFAULT 0,
  total_losses DECIMAL(15, 2) DEFAULT 0,
  net_gain_loss DECIMAL(15, 2) DEFAULT 0,
  transactions_included INTEGER DEFAULT 0,

  -- File URLs (S3 or Supabase Storage)
  form_8949_url TEXT,
  schedule_d_url TEXT,
  detailed_csv_url TEXT,

  -- Metadata
  generated_at TIMESTAMP WITH TIME ZONE,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.tax_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own forms"
  ON public.tax_forms
  FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_tax_forms_user_id ON public.tax_forms(user_id);
```

### Database Triggers

```sql
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tax_info_updated_at BEFORE UPDATE ON public.tax_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_connected_sources_updated_at BEFORE UPDATE ON public.connected_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tax_forms_updated_at BEFORE UPDATE ON public.tax_forms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔌 API Endpoint Integration

### Pattern: How to Replace Mock Routes

Every API route follows this pattern:

**Before (Mock):**
```typescript
// app/api/transactions/route.ts
import fs from 'fs';
import path from 'path';

const transactions = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), '@mock-database', 'transactions.json'), 'utf-8')
);

export async function GET(request: Request) {
  // TODO: BACKEND - Replace with database query
  return NextResponse.json(transactions);
}
```

**After (Supabase):**
```typescript
// app/api/transactions/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  // Verify authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get query params
  const { searchParams } = new URL(request.url);
  const sourceId = searchParams.get('sourceId');
  const category = searchParams.get('category');
  const type = searchParams.get('type');

  // Build query
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', session.user.id)
    .order('date', { ascending: false });

  // Apply filters
  if (sourceId) query = query.eq('source_id', sourceId);
  if (category) query = query.eq('category', category);
  if (type) query = query.eq('type', type);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
```

### All 19 Endpoints to Implement

#### Authentication (3 endpoints)

| Endpoint | Method | Current | Replace With |
|----------|--------|---------|--------------|
| `/api/auth/login` | POST | Mock delay | `supabase.auth.signInWithPassword()` |
| `/api/auth/register` | POST | Mock delay | `supabase.auth.signUp()` |
| `/api/auth/logout` | POST | Mock delay | `supabase.auth.signOut()` |

**Location:** `app/api/auth/*/route.ts`

#### User Profile (3 endpoints)

| Endpoint | Method | Current | Replace With |
|----------|--------|---------|--------------|
| `/api/user/profile` | GET | JSON file | `SELECT * FROM profiles WHERE id = $1` |
| `/api/user/profile` | PATCH | Mock success | `UPDATE profiles SET ... WHERE id = $1` |
| `/api/user/tax-info` | PUT | Mock success | `UPSERT INTO tax_info ...` |

**Location:** `app/api/user/*/route.ts`

#### Transactions (4 endpoints)

| Endpoint | Method | Current | Replace With |
|----------|--------|---------|--------------|
| `/api/transactions` | GET | JSON file | `SELECT * FROM transactions WHERE user_id = $1` |
| `/api/transactions/[id]` | GET | JSON lookup | `SELECT * FROM transactions WHERE id = $1 AND user_id = $2` |
| `/api/transactions/[id]` | PATCH | Mock success | `UPDATE transactions SET category = $1 WHERE id = $2` |
| `/api/transactions/bulk-categorize` | POST | Mock success | `UPDATE transactions SET category = $1 WHERE id = ANY($2)` |

**Location:** `app/api/transactions/*/route.ts`

#### Wallets (5 endpoints)

| Endpoint | Method | Current | Replace With |
|----------|--------|---------|--------------|
| `/api/wallets/sources` | GET | JSON file | `SELECT * FROM connection_sources WHERE is_active = true` |
| `/api/wallets/connected` | GET | JSON file | `SELECT * FROM connected_sources WHERE user_id = $1` |
| `/api/wallets/connect` | POST | Mock success | `INSERT INTO connected_sources ...` + trigger sync job |
| `/api/wallets/disconnect/[id]` | DELETE | Mock success | `UPDATE connected_sources SET status = 'disconnected'` |
| `/api/wallets/resync/[id]` | POST | Mock success | Trigger background job to fetch transactions |

**Location:** `app/api/wallets/*/route.ts`

#### Tax Forms (4 endpoints)

| Endpoint | Method | Current | Replace With |
|----------|--------|---------|--------------|
| `/api/forms` | GET | JSON file | `SELECT * FROM tax_forms WHERE user_id = $1` |
| `/api/forms/generate` | POST | Mock success | Background job: calculate taxes → generate PDF → store URL |
| `/api/forms/[id]` | GET | JSON lookup | `SELECT * FROM tax_forms WHERE id = $1 AND user_id = $2` |
| `/api/forms/[id]/download` | GET | Mock file | Return file from Supabase Storage or S3 |

**Location:** `app/api/forms/*/route.ts`

---

## 🎣 React Query Hooks (Frontend Data Layer)

All data fetching is handled through custom hooks in `hooks/`. **You don't need to modify these** unless the API response structure changes.

### Hook Architecture

```typescript
Component → Hook → API Client → Next.js API Route → Database
   ↓         ↓          ↓              ↓               ↓
 <Page>  useTransactions  apiClient   /api/transactions  Supabase
```

### Available Hooks

#### `hooks/useTransactions.ts`

```typescript
// Automatically handles loading, error, caching
const { data: transactions, isLoading, error } = useTransactions();

// With filters
const { data } = useTransactions({
  sourceId: 'wallet-123',
  category: 'uncategorized',
  type: 'buy'
});

// Mutations
const { mutate: categorize } = useCategorizeTransaction();
categorize({ id: 'tx-123', category: 'personal' });

const { mutate: bulkCategorize } = useBulkCategorize();
bulkCategorize({ ids: ['tx-1', 'tx-2'], category: 'business-expense' });
```

**What it does:**
- Fetches transactions from `/api/transactions`
- Applies filters via query params
- Caches results for 5 minutes
- Auto-refetches on window focus
- Handles optimistic updates

#### `hooks/useWallets.ts`

```typescript
// Get available connection sources (blockchains, exchanges)
const { data: sources } = useConnectionSources();

// Get user's connected wallets
const { data: connectedSources } = useConnectedSources();

// Connect new wallet
const { mutate: connect } = useConnectSource();
connect({
  sourceId: 'ethereum',
  connectionType: 'wallet-connect',
  credentials: { address: '0x...' }
});

// Disconnect wallet
const { mutate: disconnect } = useDisconnectSource();
disconnect('source-id-123');

// Resync wallet data
const { mutate: resync } = useResyncSource();
resync('source-id-123');
```

#### `hooks/useForms.ts`

```typescript
// List all generated forms
const { data: forms } = useForms();

// Get single form
const { data: form } = useForm('form-id-123');

// Generate new form
const { mutate: generate } = useGenerateForm();
generate({
  taxYear: 2024,
  taxMethod: 'FIFO',
});
```

#### `hooks/useUser.ts`

```typescript
// Get user profile
const { data: user } = useUser();

// Update profile
const { mutate: updateProfile } = useUpdateUser();
updateProfile({ firstName: 'Jane', lastName: 'Doe' });

// Update tax info
const { mutate: updateTaxInfo } = useUpdateTaxInfo();
updateTaxInfo({
  filingYear: 2024,
  state: 'California',
  filingStatus: 'single',
  incomeBand: '100k-200k',
  priorYearLosses: 5000
});
```

### Cache Invalidation Strategy

React Query automatically invalidates caches when mutations succeed:

```typescript
// When a transaction is categorized
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['transactions'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // Refresh stats
}

// When a wallet is disconnected
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['connected-sources'] });
  queryClient.invalidateQueries({ queryKey: ['transactions'] }); // Remove its txs
}
```

**You don't need to manage this** - it's already configured!

---

## 🔄 Data Transformers

### Purpose

Frontend expects dates as `Date` objects, but databases return strings. We handle this in `lib/utils/transformers.ts`.

**Example:**

```typescript
// Database returns
{
  created_at: "2024-11-17T10:30:00Z",  // String
  date: "2024-01-15T00:00:00Z"
}

// Frontend expects
{
  createdAt: Date,  // Date object
  date: Date
}
```

### Usage in API Routes

```typescript
import { transformTransaction, transformUser } from '@/lib/utils/transformers';

export async function GET() {
  const { data } = await supabase.from('transactions').select('*');

  // Transform before sending to frontend
  const transformed = data.map(transformTransaction);

  return NextResponse.json(transformed);
}
```

### Available Transformers

| Function | Input (DB) | Output (Frontend) |
|----------|-----------|-------------------|
| `transformUser(dbUser)` | `profiles` table row | `User` type |
| `transformTransaction(dbTx)` | `transactions` row | `Transaction` type |
| `transformConnectedSource(dbSource)` | `connected_sources` row | `ConnectedSource` type |
| `transformForm(dbForm)` | `tax_forms` row | `TaxForm` type |

**Location:** `lib/utils/transformers.ts`

---

## 📋 Step-by-Step Integration Checklist

### Phase 1: Setup (30 minutes)

- [ ] **Install Supabase**
  ```bash
  npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
  ```

- [ ] **Create Supabase Project**
  - Go to [supabase.com](https://supabase.com)
  - Create new project
  - Copy API URL and anon key

- [ ] **Add Environment Variables**
  - Create `.env.local`
  - Add `NEXT_PUBLIC_SUPABASE_URL`
  - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Add `SUPABASE_SERVICE_ROLE_KEY`

- [ ] **Create Database Schema**
  - Run SQL from [Database Schema](#-database-schema) section
  - Verify tables created in Supabase dashboard

- [ ] **Seed Reference Data**
  ```sql
  -- Copy data from @mock-database/connection-sources.json
  INSERT INTO connection_sources (id, name, type, logo, connection_methods) VALUES
    ('ethereum', 'Ethereum', 'blockchain', '/logos/ethereum.svg', ARRAY['wallet-connect', 'csv-upload']),
    ('bitcoin', 'Bitcoin', 'blockchain', '/logos/bitcoin.svg', ARRAY['wallet-connect', 'csv-upload']),
    ('coinbase', 'Coinbase', 'exchange', '/logos/coinbase.svg', ARRAY['api-key', 'csv-upload']),
    -- ... more rows
  ```

### Phase 2: Authentication (1 hour)

- [ ] **Create Supabase Client**
  - Create `lib/supabase/client.ts`
  - Add client-side client
  - Add server-side client

- [ ] **Update `useAuth` Hook**
  - Replace mock implementation
  - Add `supabase.auth.signInWithPassword()`
  - Add `supabase.auth.signUp()`
  - Add `supabase.auth.signOut()`
  - Add `onAuthStateChange` listener

- [ ] **Update `lib/api/client.ts`**
  - Replace `localStorage.getItem('auth_token')`
  - Add `supabase.auth.getSession()`
  - Include JWT in Authorization header

- [ ] **Add Route Protection**
  - Create `middleware.ts`
  - Protect `/dashboard/*` routes
  - Redirect to login if not authenticated

- [ ] **Test Authentication**
  - [ ] Can register new user
  - [ ] Can log in with email/password
  - [ ] Can log out
  - [ ] Protected routes redirect correctly
  - [ ] JWT token included in API requests

### Phase 3: User Profile API (30 minutes)

- [ ] **`GET /api/user/profile`**
  - Remove `fs.readFileSync()`
  - Add Supabase query
  - Join `profiles` + `tax_info` tables
  - Transform data before response

- [ ] **`PATCH /api/user/profile`**
  - Add input validation
  - Update `profiles` table
  - Return updated user

- [ ] **`PUT /api/user/tax-info`**
  - Upsert into `tax_info` table
  - Update `user_metadata` in auth.users

- [ ] **Test Profile API**
  - [ ] Can fetch user profile
  - [ ] Can update name/email
  - [ ] Can update tax information
  - [ ] Profile page displays correctly

### Phase 4: Wallets API (2 hours)

- [ ] **`GET /api/wallets/sources`**
  - Query `connection_sources` table
  - Return active sources only

- [ ] **`GET /api/wallets/connected`**
  - Query `connected_sources` for user
  - Include transaction counts

- [ ] **`POST /api/wallets/connect`**
  - Validate connection credentials
  - Encrypt API keys if applicable
  - Insert into `connected_sources`
  - **TODO: Trigger background job** to fetch transactions

- [ ] **`DELETE /api/wallets/disconnect/[id]`**
  - Update status to 'disconnected'
  - Optionally: Delete or archive transactions

- [ ] **`POST /api/wallets/resync/[id]`**
  - Update status to 'syncing'
  - **TODO: Trigger background job** to refetch transactions
  - Update `last_synced_at`

- [ ] **Implement Transaction Sync**
  - [ ] Choose background job system (Inngest, BullMQ, or Supabase Functions)
  - [ ] Integrate with blockchain APIs (Etherscan, Alchemy, etc.)
  - [ ] Integrate with exchange APIs (Coinbase, Kraken, etc.)
  - [ ] Handle CSV uploads (parse + import)
  - [ ] Store transactions in database
  - [ ] Handle pagination for large wallets
  - [ ] Update transaction counts

- [ ] **Test Wallets API**
  - [ ] Can list available sources
  - [ ] Can list connected wallets
  - [ ] Can connect new wallet
  - [ ] Can disconnect wallet
  - [ ] Can resync wallet

### Phase 5: Transactions API (1.5 hours)

- [ ] **`GET /api/transactions`**
  - Query `transactions` table
  - Apply filters (sourceId, category, type)
  - Order by date DESC
  - Add pagination (offset/limit)

- [ ] **`GET /api/transactions/[id]`**
  - Query single transaction
  - Verify user ownership

- [ ] **`PATCH /api/transactions/[id]`**
  - Update category and description
  - Set `is_categorized = true`
  - Update `updated_at`

- [ ] **`POST /api/transactions/bulk-categorize`**
  - Validate `ids` array
  - Update multiple transactions
  - Use SQL `WHERE id = ANY($1)`

- [ ] **Test Transactions API**
  - [ ] Can list all transactions
  - [ ] Filtering works (source, category, type)
  - [ ] Can categorize single transaction
  - [ ] Can bulk categorize multiple
  - [ ] Pagination works correctly

### Phase 6: Tax Forms API (3 hours)

> **Note:** This is the most complex feature. Consider using a background job queue.

- [ ] **`GET /api/forms`**
  - Query `tax_forms` table
  - Filter by user
  - Order by tax_year DESC

- [ ] **`POST /api/forms/generate`**
  - Validate tax year and method
  - Create draft form record
  - **Trigger background job:**
    1. Fetch all transactions for tax year
    2. Apply accounting method (FIFO/LIFO/HIFO)
    3. Calculate capital gains/losses
    4. Generate Form 8949 PDF
    5. Generate Schedule D PDF
    6. Generate CSV export
    7. Upload files to Supabase Storage
    8. Update form record with file URLs
    9. Set status to 'completed'

- [ ] **`GET /api/forms/[id]`**
  - Query single form
  - Verify user ownership

- [ ] **`GET /api/forms/[id]/download`**
  - Get file URL from database
  - Generate signed URL from Supabase Storage
  - Redirect to file or proxy download

- [ ] **Implement Tax Calculation Engine**
  - [ ] FIFO (First In First Out)
  - [ ] LIFO (Last In First Out)
  - [ ] HIFO (Highest In First Out)
  - [ ] Specific ID (user selects lots)
  - [ ] Handle wash sales (optional)
  - [ ] Calculate short-term vs long-term gains

- [ ] **Implement PDF Generation**
  - [ ] Choose PDF library (pdf-lib, jsPDF, or Puppeteer)
  - [ ] Create Form 8949 template
  - [ ] Create Schedule D template
  - [ ] Populate with calculated data
  - [ ] Upload to Supabase Storage

- [ ] **Test Forms API**
  - [ ] Can list generated forms
  - [ ] Can generate new form
  - [ ] Form status updates correctly
  - [ ] Can download PDF
  - [ ] Tax calculations are accurate

### Phase 7: File Uploads (1 hour)

- [ ] **Setup Supabase Storage**
  - Create `tax-forms` bucket (private)
  - Create `csv-uploads` bucket (private)
  - Configure RLS policies

- [ ] **Implement CSV Upload**
  - Add `POST /api/wallets/upload-csv`
  - Parse CSV file
  - Validate format
  - Store transactions
  - Return import summary

- [ ] **Test File Uploads**
  - [ ] Can upload CSV from Coinbase
  - [ ] Can upload CSV from Binance
  - [ ] Invalid files rejected
  - [ ] Large files handled (>10MB)

### Phase 8: Testing & Optimization (2 hours)

- [ ] **End-to-End Testing**
  - [ ] Register → Onboard → Connect Wallet → View Transactions → Categorize → Generate Form → Download
  - [ ] Test error handling (network errors, auth errors, validation errors)
  - [ ] Test edge cases (empty states, no transactions, no wallets)

- [ ] **Performance Optimization**
  - [ ] Add database indexes (see schema above)
  - [ ] Enable Supabase connection pooling
  - [ ] Add Redis caching (optional)
  - [ ] Optimize transaction queries (limit 50 per page)

- [ ] **Remove Mock Data**
  - [ ] Delete `@mock-database/` folder
  - [ ] Remove `npm run generate:mocks` script
  - [ ] Remove mock auth initialization
  - [ ] Clean up `// TODO:` comments

- [ ] **Security Audit**
  - [ ] Verify RLS policies on all tables
  - [ ] Test unauthorized access attempts
  - [ ] Encrypt sensitive data (API keys)
  - [ ] Add rate limiting
  - [ ] Enable CORS properly
  - [ ] Add CSP headers

---

## 🛠 Common Integration Patterns

### Pattern 1: Adding a New API Endpoint

**Scenario:** You need to add `GET /api/analytics/summary`

1. **Create route file**
   ```bash
   mkdir -p app/api/analytics
   touch app/api/analytics/summary/route.ts
   ```

2. **Implement route**
   ```typescript
   import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
   import { cookies } from 'next/headers';
   import { NextResponse } from 'next/server';

   export async function GET(request: Request) {
     const supabase = createRouteHandlerClient({ cookies });

     const { data: { session } } = await supabase.auth.getSession();
     if (!session) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }

     const { data, error } = await supabase
       .from('transactions')
       .select('type, count(*), sum(value_usd)')
       .eq('user_id', session.user.id)
       .group('type');

     if (error) {
       return NextResponse.json({ error: error.message }, { status: 500 });
     }

     return NextResponse.json(data);
   }
   ```

3. **Add endpoint constant**
   ```typescript
   // lib/api/endpoints.ts
   export const ENDPOINTS = {
     // ... existing
     ANALYTICS_SUMMARY: '/analytics/summary',
   };
   ```

4. **Create React Query hook**
   ```typescript
   // hooks/useAnalytics.ts
   import { useQuery } from '@tanstack/react-query';
   import { apiClient } from '@/lib/api/client';

   export function useAnalyticsSummary() {
     return useQuery({
       queryKey: ['analytics', 'summary'],
       queryFn: () => apiClient('/analytics/summary'),
     });
   }
   ```

5. **Use in component**
   ```typescript
   const { data: analytics, isLoading } = useAnalyticsSummary();
   ```

### Pattern 2: Adding a New Mutation

**Scenario:** You need to add `DELETE /api/transactions/[id]`

1. **Add API route**
   ```typescript
   // app/api/transactions/[id]/route.ts
   export async function DELETE(
     request: Request,
     { params }: { params: { id: string } }
   ) {
     const supabase = createRouteHandlerClient({ cookies });

     const { error } = await supabase
       .from('transactions')
       .delete()
       .eq('id', params.id)
       .eq('user_id', session.user.id); // Ensure user owns it

     if (error) {
       return NextResponse.json({ error: error.message }, { status: 500 });
     }

     return NextResponse.json({ success: true });
   }
   ```

2. **Add mutation hook**
   ```typescript
   // hooks/useTransactions.ts
   export function useDeleteTransaction() {
     const queryClient = useQueryClient();

     return useMutation({
       mutationFn: (id: string) =>
         apiClient(`/transactions/${id}`, { method: 'DELETE' }),
       onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['transactions'] });
       },
     });
   }
   ```

3. **Use in component**
   ```typescript
   const { mutate: deleteTransaction } = useDeleteTransaction();

   <Button onClick={() => deleteTransaction(transaction.id)}>
     Delete
   </Button>
   ```

### Pattern 3: Adding Real-time Updates

**Scenario:** You want live updates when transactions change

1. **Set up Supabase subscription**
   ```typescript
   // hooks/useTransactions.ts
   import { useEffect } from 'react';
   import { supabase } from '@/lib/supabase/client';

   export function useTransactions() {
     const queryClient = useQueryClient();

     useEffect(() => {
       const subscription = supabase
         .channel('transactions')
         .on(
           'postgres_changes',
           {
             event: '*',
             schema: 'public',
             table: 'transactions'
           },
           () => {
             queryClient.invalidateQueries({ queryKey: ['transactions'] });
           }
         )
         .subscribe();

       return () => {
         subscription.unsubscribe();
       };
     }, [queryClient]);

     // ... rest of hook
   }
   ```

---

## 🧪 Testing Your Integration

### Manual Testing Checklist

**Authentication Flow:**
- [ ] Can register new user with email/password
- [ ] Receives email verification (if enabled)
- [ ] Can log in with credentials
- [ ] JWT token is set in cookies/localStorage
- [ ] Protected routes redirect to login when not authenticated
- [ ] Can log out successfully
- [ ] Can reset password

**User Profile:**
- [ ] Profile page loads user data
- [ ] Can update first name, last name
- [ ] Can update tax information
- [ ] Changes persist after page refresh
- [ ] Optimistic updates work (UI updates before server confirms)

**Wallet Management:**
- [ ] Available sources display correctly
- [ ] Can connect new wallet/exchange
- [ ] Connection modal shows appropriate fields (API key vs wallet address)
- [ ] Connected sources appear in dashboard
- [ ] Transaction count updates after sync
- [ ] Can disconnect wallet
- [ ] Can resync wallet
- [ ] Resync shows loading state

**Transactions:**
- [ ] Transactions list loads
- [ ] Filters work (source, category, type)
- [ ] Date range filter works
- [ ] Can categorize single transaction
- [ ] Can bulk categorize multiple transactions
- [ ] Categorization updates transaction count in dashboard
- [ ] Pagination works (if implemented)
- [ ] Virtual scrolling smooth (if implemented)

**Tax Forms:**
- [ ] Form generation wizard completes
- [ ] Form status updates to "generating"
- [ ] Form status updates to "completed" when ready
- [ ] Can download PDF
- [ ] PDF contains correct data
- [ ] Can generate multiple forms for different years
- [ ] CSV export works

### Automated Testing (TODO)

Once integration is complete, add tests:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

**Example test:**
```typescript
// __tests__/api/transactions.test.ts
import { GET } from '@/app/api/transactions/route';

describe('GET /api/transactions', () => {
  it('returns transactions for authenticated user', async () => {
    const request = new Request('http://localhost:3000/api/transactions');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it('returns 401 for unauthenticated user', async () => {
    // Mock session as null
    const response = await GET(request);
    expect(response.status).toBe(401);
  });
});
```

---

## 🚀 Deployment

### Environment Variables (Production)

```bash
# Vercel/Production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
NEXT_PUBLIC_API_URL=https://api.cointally.com  # or /api for same domain

# Optional
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
```

### Vercel Deployment

1. **Connect to Git**
   ```bash
   git remote add origin https://github.com/your-org/cointally-frontend.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import repository
   - Add environment variables
   - Deploy

3. **Configure Supabase**
   - Add Vercel domain to Supabase allowed URLs
   - Update `NEXT_PUBLIC_API_URL` in Supabase dashboard

### Build Command

```bash
# Production build
npm run build

# Start production server
npm run start
```

### Pre-deployment Checklist

- [ ] All environment variables set
- [ ] Database migrations run
- [ ] RLS policies enabled and tested
- [ ] API rate limiting configured
- [ ] Error tracking configured (Sentry)
- [ ] Analytics configured (Posthog/Mixpanel)
- [ ] Supabase backup enabled
- [ ] SSL certificates valid
- [ ] Custom domain configured (optional)

---

## 📚 Additional Resources

### Documentation
- **Next.js 14 Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **React Query Docs:** https://tanstack.com/query/latest
- **Tailwind CSS:** https://tailwindcss.com/docs

### Internal Documentation
- **API Endpoints Reference:** `DOCS/archive/api-documentation/API_ENDPOINTS_DOCUMENTATION.md`
- **Product Requirements:** `DOCS/archive/ui-ux-design/PRODUCT-REQUIREMENTS-DOCUMENT.md`
- **Integration Guide:** `DOCS/archive/integration-guides/INTEGRATION_GUIDE_11_17_25.md`
- **Database Schema:** `DOCS/archive/reference-materials/database-schema.svg`

### Example Code
- **Mock API Routes:** `app/api/*/route.ts` (before integration)
- **React Query Hooks:** `hooks/*.ts`
- **Type Definitions:** `types/*.ts`
- **Transformers:** `lib/utils/transformers.ts`

### Getting Help

**Common Issues:**

1. **"Unauthorized" errors**
   - Check JWT token is included in requests
   - Verify `getAuthHeaders()` in `lib/api/client.ts`
   - Check Supabase session exists

2. **CORS errors**
   - Add frontend URL to Supabase allowed origins
   - Verify `NEXT_PUBLIC_API_URL` is correct

3. **Database errors**
   - Check RLS policies allow user access
   - Verify table names match queries
   - Check user_id foreign keys

4. **Build fails**
   - Run `npx tsc --noEmit` to check types
   - Verify all environment variables set
   - Check `next.config.js` is valid

---

## 🎯 Summary: Your Integration Roadmap

```
Week 1: Foundation
├── Day 1-2: Setup Supabase + Database Schema
├── Day 3-4: Authentication Integration
└── Day 5: User Profile API

Week 2: Core Features
├── Day 1-2: Wallets API
├── Day 3-4: Transactions API
└── Day 5: Testing & Bug Fixes

Week 3: Advanced Features
├── Day 1-3: Tax Forms API (complex)
├── Day 4: File Uploads (CSV import)
└── Day 5: Performance Optimization

Week 4: Launch
├── Day 1-2: End-to-end testing
├── Day 3: Security audit
├── Day 4: Deployment setup
└── Day 5: Production launch
```

**Total Estimated Time:** 15-20 days for full integration

---

## 📞 Quick Reference: File Locations

| What You Need | Where to Find It | What to Do |
|---------------|------------------|------------|
| Auth logic | `hooks/useAuth.ts` | Replace mock with Supabase |
| API client | `lib/api/client.ts` | Add JWT token to headers |
| All endpoints | `lib/api/endpoints.ts` | Reference for URLs |
| Type definitions | `types/*.ts` | Match your DB schema |
| Mock API routes | `app/api/*/route.ts` | Replace with DB queries |
| Data hooks | `hooks/*.ts` | Already done - don't modify |
| Transformers | `lib/utils/transformers.ts` | Use when returning data |
| Error handling | `lib/api/errors.ts` | Already done |
| Mock data | `@mock-database/*.json` | DELETE after integration |

---

**Ready to start?** Begin with [Quick Start Integration](#-quick-start-integration-5-minutes) and work through the [Checklist](#-step-by-step-integration-checklist)!

**Questions?** All integration points are marked with `// TODO: BACKEND` or `// TODO: AUTH` comments throughout the codebase.

---

*Generated: November 18, 2025 | Version 1.1.0*
