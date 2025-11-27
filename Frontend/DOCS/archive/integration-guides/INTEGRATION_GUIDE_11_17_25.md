# Backend Integration Guide
**CoinTally Frontend - Backend Developer Onboarding**

**Date:** November 17, 2025
**Frontend Version:** 1.1.0 - Production Ready
**Status:** Frontend complete, awaiting backend integration

---

## 📋 Executive Summary

The CoinTally frontend is **100% production-ready** with comprehensive error handling, type safety, and backend integration points. All 19 API endpoints are stubbed with mock data and ready for your implementation. The frontend follows strict architectural patterns that you need to understand to ensure seamless integration.

**What's Working:**
- ✅ Complete UI/UX for all pages (dashboard, transactions, wallets, forms, profile)
- ✅ 600 mock transactions across 6 connected sources
- ✅ Type-safe API client with interceptors
- ✅ Global error handling with retry logic
- ✅ Optimistic updates for instant UI feedback
- ✅ Loading states and skeleton loaders
- ✅ All React Query hooks configured

**What You Need to Do:**
- 🔲 Implement Supabase authentication
- 🔲 Replace 19 mock API endpoints with real database queries
- 🔲 Implement tax calculation engine
- 🔲 Implement PDF form generation
- 🔲 Set up database migrations
- 🔲 Configure JWT token management

---

## 🏗️ Frontend Architecture Overview

### Tech Stack You're Integrating With

```
Frontend:
├── Next.js 14 (App Router) - Server & API routes
├── TypeScript 5.5 (strict mode) - 100% type-safe
├── React Query (TanStack Query v5) - Data fetching & caching
├── Zustand - Auth state management
└── Supabase Client - Auth (needs implementation)

Your Backend:
├── Supabase - PostgreSQL + Auth + Realtime
├── Database - See database-schema.svg for ERD
└── API Routes - 19 endpoints in /app/api/*
```

### Request Flow (How Data Moves)

```
User Action
    ↓
React Component calls Hook (useTransactions, useWallets, etc.)
    ↓
React Query executes query/mutation
    ↓
API Client (lib/api/client.ts) - Adds JWT token via interceptor
    ↓
Next.js API Route (/app/api/*)  ← YOU IMPLEMENT HERE
    ↓
Database Query (Supabase/PostgreSQL)  ← YOU IMPLEMENT HERE
    ↓
Response → Interceptor checks status → Transform data if needed
    ↓
React Query updates cache → Component re-renders
    ↓
Success/Error Toast shown to user
```

---

## 🎯 Critical Frontend Conventions (You Must Follow These)

### 1. Error Handling Architecture

We have a **4-layer error handling system** already implemented:

#### Layer 1: Custom Error Classes
**Location:** `lib/api/errors.ts`

```typescript
// Already implemented - DO NOT MODIFY
export class APIError extends Error {
  statusCode: number;
  details?: unknown;
}

export class AuthenticationError extends APIError {}
export class ValidationError extends APIError {}
export class NotFoundError extends APIError {}
```

**Your Responsibility:**
- Return proper HTTP status codes from API routes
- Use these error classes when throwing errors:
  - 400 → `new ValidationError('message')`
  - 401 → `new AuthenticationError('message')`
  - 404 → `new NotFoundError('message')`
  - 500 → `new APIError('message', 500)`

#### Layer 2: Request/Response Interceptors
**Location:** `lib/api/client.ts`

```typescript
// Already implemented - intercepts EVERY request/response
function getAuthHeaders(): HeadersInit {
  // Checks localStorage for JWT token
  // YOU NEED TO: Store token here after Supabase auth
}

async function handleResponse(response: Response) {
  // Automatically redirects to /login on 401
  // Throws appropriate error class based on status code
}
```

**Your Responsibility:**
- Store JWT token in localStorage after successful login
- Return proper status codes so interceptor works correctly
- Token format: `localStorage.setItem('auth-token', token)`

#### Layer 3: Global React Query Error Handler
**Location:** `app/providers.tsx`

```typescript
// Already implemented - shows toast on ANY query/mutation error
QueryCache: {
  onError: (error) => {
    toast.error(error.message); // User sees this
  }
}
```

**Your Responsibility:**
- Return user-friendly error messages in response body:
  ```json
  { "error": "Email already exists" }  // ✅ Good
  { "message": "Database constraint violation" }  // ❌ Bad
  ```

#### Layer 4: React Error Boundaries
**Location:** `app/layout.tsx`

```typescript
// Catches any React rendering errors
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**Your Responsibility:** None - this is frontend only

### 2. Caching Strategy (React Query)

**Configuration:** `app/providers.tsx`

```typescript
defaultOptions: {
  queries: {
    staleTime: 1000 * 60 * 5,      // 5 minutes (don't refetch if < 5min old)
    gcTime: 1000 * 60 * 30,        // 30 minutes (keep in cache)
    retry: 3,                       // Retry failed requests 3 times
    retryDelay: (attemptIndex) =>  // Exponential backoff
      Math.min(1000 * 2 ** attemptIndex, 30000)
  }
}
```

**What This Means For You:**
- API calls are **automatically cached** for 5 minutes
- If user visits Transactions page twice in 5 minutes, **no second API call**
- Failed requests retry 3 times: 1s delay, 2s delay, 4s delay
- You don't need to implement caching/retry logic in your API routes
- BUT: Your API routes should be **idempotent** (safe to retry)

**Cache Invalidation (Already Implemented):**

```typescript
// When user creates/updates/deletes, we invalidate cache
useMutation({
  mutationFn: updateTransaction,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    // ↑ This triggers fresh API call to GET /api/transactions
  }
});
```

**Your Responsibility:**
- Ensure GET endpoints return latest data
- POST/PATCH/DELETE operations should be fast (< 2s)
- Return updated object in response body for optimistic updates

### 3. Optimistic Updates Pattern

**Example:** `hooks/useTransactions.ts`

```typescript
useMutation({
  mutationFn: categorizeTransaction,
  onMutate: async (newData) => {
    // BEFORE API call, update UI immediately
    queryClient.setQueryData(['transactions'], (old) =>
      updateTransactionInList(old, newData)
    );
  },
  onError: (error, variables, context) => {
    // IF API call fails, rollback to previous data
    queryClient.setQueryData(['transactions'], context.previousData);
  }
});
```

**What This Means For You:**
- User sees instant feedback (UI updates immediately)
- If your API returns error, UI rolls back automatically
- Your API should return the **updated object** in response:
  ```json
  // ✅ Good response
  { "id": "123", "category": "capital-gain", "updatedAt": "2025-11-17T..." }

  // ❌ Bad response
  { "success": true }
  ```

### 4. Authentication State Management

**Location:** `hooks/useAuth.ts` (Zustand store)

```typescript
// Current implementation (YOU NEED TO REPLACE)
export function useAuth() {
  return {
    user: mockUser,  // ← Replace with real Supabase user
    isLoading: false,
    isAuthenticated: true,

    // YOU IMPLEMENT THESE:
    signIn: async (email, password) => {
      // TODO: Call Supabase auth.signInWithPassword()
      // Store token in localStorage
      // Update Zustand state
    },

    signUp: async (email, password, firstName, lastName) => {
      // TODO: Call Supabase auth.signUp()
      // Create user profile in database
    },

    signOut: async () => {
      // TODO: Call Supabase auth.signOut()
      // Clear localStorage
      // Redirect to /login
    }
  }
}
```

**Your Tasks:**
1. Install Supabase client: `npm install @supabase/supabase-js`
2. Create `lib/supabase/client.ts`:
   ```typescript
   import { createClient } from '@supabase/supabase-js';

   export const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   );
   ```
3. Replace stub functions in `useAuth.ts` with real Supabase calls
4. Implement session persistence with `onAuthStateChange`

### 5. Type Safety & Data Transformers

**The Problem:** Database schema ≠ Frontend types

**Our Solution:** Type transformers in `lib/utils/transformers.ts`

```typescript
// Database schema (snake_case)
interface DBConnectedSource {
  id: string;
  user_id: string;
  source_id: string;
  created_at: string;  // ISO string from DB
  last_sync_at: string | null;
  sync_status: 'active' | 'error' | 'pending';
  credentials: Record<string, string> | null;
  transaction_count: number;
  last_error_message: string | null;
}

// Frontend type (camelCase)
interface ConnectedSource {
  id: string;
  userId: string;
  sourceId: string;
  createdAt: Date;  // ← Converted to Date object
  lastSyncAt: Date | null;
  syncStatus: 'active' | 'error' | 'pending';
  credentials?: Record<string, string>;
  transactionCount: number;
  lastErrorMessage?: string;
}

// Transformer function (already implemented)
export function transformConnectedSourceFromDB(db: DBConnectedSource): ConnectedSource {
  return {
    id: db.id,
    userId: db.user_id,
    sourceId: db.source_id,
    createdAt: new Date(db.created_at),
    // ... etc
  };
}
```

**Your Responsibility:**
- Use transformers in your API routes:
  ```typescript
  // In /app/api/wallets/connected/route.ts
  const dbSources = await db.query('SELECT * FROM connected_sources');

  return Response.json(
    dbSources.map(transformConnectedSourceFromDB)  // ✅ Good
  );

  // Don't return raw DB data:
  return Response.json(dbSources);  // ❌ Bad - frontend expects camelCase
  ```

---

## 🔌 Your Integration Points (19 API Endpoints)

All API routes are in `/app/api/` and currently return mock data. Replace the mock logic with real database queries.

### Pattern Used in Every Route

```typescript
// Current mock implementation
export async function GET(request: Request) {
  // TODO: BACKEND - Replace with real database query
  const mockData = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), '@mock-database', 'transactions.json'))
  );

  return Response.json(mockData);
}

// What you need to do:
export async function GET(request: Request) {
  try {
    // 1. Get user from session
    const session = await getServerSession();
    if (!session) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Query database
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', session.user.id);

    if (error) throw new APIError(error.message, 500);

    // 3. Transform data
    const transformed = data.map(transformTransactionFromDB);

    // 4. Return response
    return Response.json(transformed);

  } catch (error) {
    if (error instanceof APIError) {
      return Response.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Endpoint Reference

#### Authentication (`/app/api/auth/`)
- `POST /api/auth/register` - Create user + profile
- `POST /api/auth/login` - Sign in with email/password
- `POST /api/auth/logout` - End session

#### User Profile (`/app/api/user/`)
- `GET /api/user/profile` - Get current user profile
- `PATCH /api/user/profile` - Update profile (firstName, lastName, email)
- `DELETE /api/user/profile` - Delete account (cascade delete all data)
- `PUT /api/user/tax-info` - Update tax settings (state, filing status, etc.)

#### Transactions (`/app/api/transactions/`)
- `GET /api/transactions` - List all (supports filtering via query params)
- `GET /api/transactions/:id` - Get single transaction
- `PATCH /api/transactions/:id` - Update category/notes
- `POST /api/transactions/bulk-categorize` - Bulk update categories

#### Wallets (`/app/api/wallets/`)
- `GET /api/wallets` - List connected sources
- `DELETE /api/wallets/disconnect/:id` - Remove connection
- `POST /api/wallets/resync/:id` - Trigger resync job

#### Tax Forms (`/app/api/forms/`)
- `GET /api/forms` - List generated forms
- `GET /api/forms/:id` - Get single form
- `POST /api/forms/generate` - Generate new tax form (needs tax engine)
- `GET /api/forms/:id/download` - Download PDF (needs PDF generator)
- `POST /api/forms/:id/email` - Email form to user

---

## 📝 Your Specific Tasks (From backendfixes.md)

### High Priority (Blocking Frontend Functionality)

**Task 1: Implement Supabase Authentication**
- Location: `hooks/useAuth.ts`
- Replace all stub functions with Supabase auth calls
- Implement session persistence
- Store JWT token in localStorage
- Test: Login should persist across page refreshes

**Task 7: Form Generation Logic**
- Location: `/app/api/forms/generate/route.ts`
- Implement tax calculation engine
- Generate IRS Form 8949 PDF
- Calculate short-term vs long-term gains
- Test: Generate form from transactions page

**Task 8: Auth UI Logic**
- Location: `/app/(auth)/login/page.tsx`
- Wire up login form to `useAuth().signIn()`
- Add password reset flow
- Add email verification flow
- Test: Full registration → verification → login flow

**Task 21: Replace Mock Database**
- Location: All `/app/api/*` routes
- Replace `fs.readFileSync` with Supabase queries
- Use type transformers for DB → Frontend conversion
- Test: All 19 endpoints return real data

### Medium Priority (Feature Enhancements)

**Task 5 & 6: Sync Frontend/Backend Schema**
- Review `types/*.ts` files
- Ensure your DB schema matches TypeScript interfaces
- Create transformers if schemas differ
- See `database-schema.svg` for current ERD

**Task 9 & 10: Additional Endpoints**
- These are already created as stubs
- Implement the database logic
- Follow existing patterns

**Task 20: Complete Supabase Auth**
- Set up Row Level Security (RLS) policies
- Configure email templates
- Set up OAuth providers if needed
- Test security: Users can only see their own data

**Task 42: Additional Backend Features**
- Implement wallet connection OAuth flows
- Set up background jobs for transaction syncing
- Implement webhook handlers for exchange APIs

### Low Priority (Nice to Have)

**Tasks 28-30: Backend-Specific Features**
- Analytics tracking
- Error monitoring (Sentry)
- Performance monitoring
- Email notifications

---

## 🗄️ Database Integration Guide

### Current Mock Data Structure

```
@mock-database/
├── users.json              # 1 user with complete profile
├── connected-sources.json  # 6 connected exchanges/wallets
├── connection-sources.json # 10 available sources to connect
├── transactions.json       # 600 transactions with edge cases
└── forms.json              # 2 completed tax forms
```

### Your Database Setup

**Tables You Need to Create:**
1. `users` - User accounts (linked to Supabase auth.users)
2. `connected_sources` - User's connected wallets/exchanges
3. `connection_sources` - Available sources (Coinbase, Kraken, etc.)
4. `transactions` - Crypto transactions with categorization
5. `tax_forms` - Generated IRS forms
6. `user_tax_info` - Tax filing information (embedded in users table or separate)

**See:** `DOCS/database-schema.svg` for complete ERD

### Data Migration Strategy

```bash
# Step 1: Create tables with migrations
# (Use Supabase CLI or dashboard)

# Step 2: Import mock data for testing
# Use @mock-database/*.json as seed data

# Step 3: Set up Row Level Security
# Ensure users can only access their own data

# Step 4: Test each endpoint with real data
# Replace one API route at a time
```

---

## 🧪 Testing Your Integration

### Testing Checklist

**For Each Endpoint:**
1. ✅ Returns correct HTTP status codes (200, 400, 401, 404, 500)
2. ✅ Requires authentication (returns 401 without token)
3. ✅ Returns data in expected frontend type format (camelCase)
4. ✅ Handles errors gracefully (user-friendly messages)
5. ✅ Works with React Query caching (idempotent)
6. ✅ Triggers optimistic updates correctly
7. ✅ Shows success/error toasts in UI

### Manual Testing Flow

```bash
# 1. Start frontend dev server
npm run dev

# 2. Open browser to http://localhost:3000

# 3. Test authentication
- Try to access /dashboard (should redirect to /login)
- Register new account → should send verification email
- Verify email → should auto-login
- Refresh page → should stay logged in

# 4. Test each feature
- Dashboard: Shows real transaction data
- Transactions: Filter/search works with real data
- Wallets: Connect new source → triggers OAuth flow
- Forms: Generate form → downloads PDF
- Profile: Update info → persists to database

# 5. Test error handling
- Disconnect internet → see retry behavior
- Send invalid data → see validation error toast
- Force 401 error → should redirect to /login
```

### Integration Testing with React Query Devtools

Frontend has React Query Devtools installed. Open it to see:
- All active queries and their cache status
- When queries are refetching
- When mutations are running
- Cache invalidation events

**How to use:**
1. Open app in browser
2. Look for React Query icon in bottom corner
3. Click to open devtools panel
4. Perform actions and watch cache update in real-time

---

## 🚨 Common Integration Pitfalls

### Pitfall 1: Wrong Error Response Format

```typescript
// ❌ BAD - Frontend can't parse this
return Response.json({ success: false }, { status: 400 });

// ✅ GOOD - Frontend shows this message to user
return Response.json(
  { error: 'Email already registered' },
  { status: 400 }
);
```

### Pitfall 2: Forgetting to Transform Data

```typescript
// ❌ BAD - Frontend expects camelCase
const dbData = await db.query('SELECT * FROM transactions');
return Response.json(dbData);  // snake_case from DB

// ✅ GOOD - Use transformer
return Response.json(
  dbData.map(transformTransactionFromDB)
);
```

### Pitfall 3: Not Handling Authentication

```typescript
// ❌ BAD - No auth check
export async function GET() {
  const data = await db.query('SELECT * FROM transactions');
  return Response.json(data);
}

// ✅ GOOD - Check session first
export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await db.query(
    'SELECT * FROM transactions WHERE user_id = $1',
    [session.user.id]
  );
  return Response.json(data);
}
```

### Pitfall 4: Slow API Responses

```typescript
// Frontend expects responses in < 2 seconds
// Use database indexes on frequently queried fields
// Consider pagination for large datasets
// Cache expensive calculations

// ✅ GOOD - Add pagination
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 50;

  const data = await db.query(
    'SELECT * FROM transactions LIMIT $1 OFFSET $2',
    [limit, (page - 1) * limit]
  );

  return Response.json(data);
}
```

---

## 📚 Additional Resources

**Frontend Documentation:**
- `README.md` - Complete project overview
- `DOCS/FRONTEND_FIXES_ROADMAP.md` - What was implemented
- `DOCS/BACKEND_INTEGRATION_READINESS_REPORT.md` - Integration checklist
- `database-schema.svg` - Database ERD

**Code References:**
- `types/*.ts` - All TypeScript interfaces
- `lib/api/client.ts` - API client and interceptors
- `lib/api/errors.ts` - Custom error classes
- `lib/utils/transformers.ts` - Data transformation functions
- `hooks/*.ts` - All React Query hooks

**External Docs:**
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)

---

## 🎯 Success Criteria

Your integration is complete when:

1. ✅ All 19 API endpoints return real data from database
2. ✅ User can register, login, logout with Supabase auth
3. ✅ Session persists across page refreshes
4. ✅ All pages show real user data (no mock data)
5. ✅ User can connect wallet and see real transactions
6. ✅ User can generate and download tax form PDF
7. ✅ All error cases show appropriate toast messages
8. ✅ Frontend build passes with zero TypeScript errors
9. ✅ Manual testing passes all feature flows
10. ✅ RLS policies prevent users from seeing others' data

---

## 💬 Questions?

**Frontend Developer Contact:** [Your contact info]

**Key Files to Review:**
1. Start with: `README.md` (project overview)
2. Then read: `lib/api/client.ts` (understand request flow)
3. Then review: `hooks/useAuth.ts` (auth integration point)
4. Then check: `app/api/transactions/route.ts` (endpoint example)

**When in doubt:**
- Search codebase for `// TODO: BACKEND` comments
- Check React Query Devtools to see what frontend expects
- Look at mock data files to understand data shape
- Run TypeScript checker to catch type mismatches

Good luck! The frontend is ready and waiting for your backend magic. 🚀
