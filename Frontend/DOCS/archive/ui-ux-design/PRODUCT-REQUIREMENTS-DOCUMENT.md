# CoinTally Frontend - Product Requirements Document (PRD)

**Version:** 1.0
**Last Updated:** 2025-10-28
**Status:** Ready for Development
**Target:** LLM Coding Agent Implementation

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technical Architecture](#2-technical-architecture)
3. [Design System](#3-design-system)
4. [Project Structure](#4-project-structure)
5. [Data Models & Mock Data](#5-data-models--mock-data)
6. [User Flows](#6-user-flows)
7. [Page Specifications](#7-page-specifications)
8. [Component Specifications](#8-component-specifications)
9. [State Management](#9-state-management)
10. [API Integration Layer](#10-api-integration-layer)
11. [Development Phases](#11-development-phases)
12. [Backend Integration Guide](#12-backend-integration-guide)
13. [Testing & QA Strategy](#13-testing--qa-strategy)
14. [Performance & Optimization](#14-performance--optimization)
15. [Accessibility Requirements](#15-accessibility-requirements)

---

## 1. Executive Summary

### 1.1 Project Overview
CoinTally is a professional cryptocurrency tax calculation and reporting platform. This PRD defines the complete frontend implementation for a production-ready web application that will enable users to connect their crypto wallets and exchanges, categorize transactions, and generate IRS-compliant tax forms (Form 8949 and Schedule D).

### 1.2 Scope
This document covers **frontend-only development**. Authentication, backend APIs, database operations, and actual tax calculations are OUT OF SCOPE for this phase. We are building a fully functional UI with mock data that prepares for seamless backend integration.

### 1.3 Goals
- Build a production-ready, maintainable, and scalable frontend codebase
- Create a professional, modern UI that feels crypto-native yet approachable
- Implement complete user flows with realistic mock data
- Prepare clean integration points for backend developers
- Ensure optimal performance, accessibility (WCAG 2.1 AA), and responsiveness (desktop/laptop only)

### 1.4 Target Users
- Individual cryptocurrency investors filing taxes in the United States
- Users with transactions across multiple wallets, exchanges, and blockchains
- Users requiring capital gains/loss calculations and IRS form generation

---

## 2. Technical Architecture

### 2.1 Core Technology Stack

**Framework & Runtime:**
```
- Next.js 14.x (App Router)
- React 18.x
- TypeScript 5.x
- Node.js 20.x LTS
```

**State Management:**
```
- Zustand (UI state: sidebar toggle, modals, feature flags)
- TanStack Query v5 (React Query) (remote data: wallets, transactions, forms)
- React Hook Form + Zod (form state & validation)
```

**Styling & UI:**
```
- Tailwind CSS 3.x
- shadcn/ui component library (latest)
- Tremor (charts and dashboards)
- Inter font (UI text)
- DM Sans font (headlines)
```

**Data Fetching & APIs:**
```
- REST API architecture (backend future)
- TanStack Query for caching/refetching
- Custom apiClient wrapper (fetch + interceptors)
```

**Development Tools:**
```
- ESLint (Next.js default config)
- Prettier (code formatting)
- Storybook (component documentation)
- Jest + React Testing Library (unit tests)
- Conventional Commits + PR templates
```

### 2.2 Key Architectural Decisions

**Server-Side Rendering (SSR):**
- All pages use Next.js App Router with SSR enabled
- Route-level code splitting for optimal performance
- Suspense boundaries for loading states

**Authentication Preparation (Not Implemented Yet):**
- Build all pages as if user is authenticated
- Leave `// TODO: AUTH` comments at integration points
- Create placeholder `middleware.ts` with commented-out Supabase checks
- Mock `useAuth` hook that returns `{ user: mockUser, isLoading: false }`

**Data Flow:**
```
User Action → React Hook Form (local state)
           → TanStack Query mutation (optimistic update)
           → API Client (mock or real)
           → Response → Cache update → UI re-render
```

---

## 3. Design System

### 3.1 Brand Colors

**Primary Palette (Extracted from Logo):**
```css
/* Primary - Dark Navy (text, headers, primary buttons) */
--color-primary: #0F172A;
--color-primary-foreground: #FFFFFF;

/* Secondary - Bright Cyan (accent, links, highlights) */
--color-secondary: #14BEFF;
--color-secondary-foreground: #0F172A;

/* Accent - Blue (gradients, CTAs) */
--color-accent: #3F6EFF;
--color-accent-foreground: #FFFFFF;

/* Gradient (for icon, special elements) */
--gradient-brand: linear-gradient(180deg, #14BEFF 0%, #3F6EFF 100%);
```

**Neutral Palette:**
```css
/* Gray Scale (from Tailwind slate) */
--color-background: #FFFFFF;
--color-foreground: #0F172A;

--color-muted: #F1F5F9;        /* slate-100 */
--color-muted-foreground: #64748B; /* slate-500 */

--color-border: #E2E8F0;        /* slate-200 */
--color-input: #E2E8F0;

--color-card: #FFFFFF;
--color-card-foreground: #0F172A;
```

**Semantic Colors (Tailwind defaults):**
```css
/* Success */
--color-success: #10B981;       /* green-500 */
--color-success-foreground: #FFFFFF;

/* Warning */
--color-warning: #F59E0B;       /* amber-500 */
--color-warning-foreground: #FFFFFF;

/* Error/Destructive */
--color-destructive: #EF4444;   /* red-500 */
--color-destructive-foreground: #FFFFFF;

/* Info */
--color-info: #3B82F6;          /* blue-500 */
--color-info-foreground: #FFFFFF;
```

**Dark Mode Colors:**
```css
/* Dark mode inverts light background to dark slate */
--color-background-dark: #0F172A;
--color-foreground-dark: #F8FAFC;
--color-muted-dark: #1E293B;
--color-border-dark: #334155;
```

### 3.2 Typography

**Font Families:**
```css
/* Headings */
--font-heading: 'DM Sans', sans-serif;
font-weight: 500, 600, 700;

/* Body Text */
--font-body: 'Inter', sans-serif;
font-weight: 400, 500, 600;

/* Code/Monospace (for addresses, hashes) */
--font-mono: 'Roboto Mono', monospace;
```

**Type Scale:**
```css
/* Display (Page titles) */
--text-display: 3rem (48px);    /* font-heading, font-bold */

/* Heading 1 */
--text-h1: 2.25rem (36px);      /* font-heading, font-semibold */

/* Heading 2 */
--text-h2: 1.875rem (30px);     /* font-heading, font-semibold */

/* Heading 3 */
--text-h3: 1.5rem (24px);       /* font-heading, font-medium */

/* Body Large */
--text-lg: 1.125rem (18px);     /* font-body, font-normal */

/* Body (default) */
--text-base: 1rem (16px);       /* font-body, font-normal */

/* Body Small */
--text-sm: 0.875rem (14px);     /* font-body, font-normal */

/* Caption */
--text-xs: 0.75rem (12px);      /* font-body, font-medium */
```

### 3.3 Spacing & Layout

**Container Widths:**
```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
```

**Spacing Scale (Tailwind defaults):**
```
Use Tailwind spacing: 0, 1 (4px), 2 (8px), 3 (12px), 4 (16px), 6 (24px), 8 (32px), 12 (48px), 16 (64px), 20 (80px), 24 (96px)
```

**Border Radius:**
```css
--radius-sm: 0.25rem (4px);
--radius-md: 0.375rem (6px);
--radius-lg: 0.5rem (8px);
--radius-xl: 0.75rem (12px);
--radius-2xl: 1rem (16px);
```

### 3.4 Component Patterns

**Buttons:**
- Primary: Dark navy background (#0F172A), white text
- Secondary: Light blue (#14BEFF), dark text
- Outline: Border only, transparent background
- Ghost: No border, hover background
- Destructive: Red background (#EF4444)
- Sizes: sm (32px height), md (40px height), lg (48px height)

**Cards:**
- White background (#FFFFFF)
- Border: 1px solid #E2E8F0 (slate-200)
- Border radius: 0.5rem (8px)
- Padding: 1.5rem (24px)
- Shadow: subtle (shadow-sm)

**Inputs:**
- Height: 40px (md), 48px (lg)
- Border: 1px solid #E2E8F0
- Border radius: 0.375rem (6px)
- Focus: 2px ring, primary color
- Error state: Red border

**Modals:**
- Max width: 90vw or 600px (whichever is smaller)
- Background: White with backdrop blur
- Padding: 2rem (32px)
- Close button: Top-right corner

### 3.5 Design Tokens Implementation

**Tailwind Config (`tailwind.config.ts`):**
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        brand: {
          primary: '#0F172A',
          secondary: '#14BEFF',
          accent: '#3F6EFF',
        },
        // shadcn/ui color system
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        heading: ['var(--font-dm-sans)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
```

**Global CSS (`src/app/globals.css`):**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    --primary: 222.2 84% 11%;      /* #0F172A */
    --primary-foreground: 210 40% 98%;

    --secondary: 193 100% 54%;     /* #14BEFF */
    --secondary-foreground: 222.2 84% 11%;

    --accent: 223 93% 63%;         /* #3F6EFF */
    --accent-foreground: 210 40% 98%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 11%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;    /* #0F172A */
    --foreground: 210 40% 98%;

    --card: 222.2 47% 11.2%;
    --card-foreground: 210 40% 98%;

    --primary: 193 100% 54%;         /* Inverted - bright cyan in dark mode */
    --primary-foreground: 222.2 84% 4.9%;

    --secondary: 217.2 91.2% 59.8%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 193 100% 54%;

    --accent: 223 93% 63%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground font-body;
  }
  h1, h2, h3, h4, h5, h6 {
    @apply font-heading;
  }
}
```

---

## 4. Project Structure

### 4.1 Folder Organization

**ROOT STRUCTURE:**
```
CoinTallyFrontEnd/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth route group (future)
│   │   │   └── login/
│   │   ├── (onboarding)/      # Onboarding flow
│   │   │   ├── disclaimer/
│   │   │   ├── privacy/
│   │   │   └── onboarding/
│   │   ├── (dashboard)/       # Main app (protected routes)
│   │   │   ├── dashboard/
│   │   │   ├── wallets/
│   │   │   ├── transactions/
│   │   │   ├── new-form/
│   │   │   ├── view-forms/
│   │   │   ├── profile/
│   │   │   └── support/
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Global styles
│   │   └── page.tsx           # Redirect to dashboard
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── table.tsx
│   │   │   └── ... (all shadcn components)
│   │   ├── features/          # Feature-specific components
│   │   │   ├── dashboard/
│   │   │   │   ├── DashboardHeader.tsx
│   │   │   │   ├── PnLChart.tsx
│   │   │   │   ├── MetricsCards.tsx
│   │   │   │   └── ConnectedWallets.tsx
│   │   │   ├── transactions/
│   │   │   │   ├── TransactionTable.tsx
│   │   │   │   ├── TransactionFilters.tsx
│   │   │   │   ├── CategorizationModal.tsx
│   │   │   │   └── RatingBanner.tsx
│   │   │   ├── wallets/
│   │   │   │   ├── WalletCard.tsx
│   │   │   │   ├── AddWalletModal.tsx
│   │   │   │   ├── BlockchainList.tsx
│   │   │   │   ├── ExchangeList.tsx
│   │   │   │   └── WalletList.tsx
│   │   │   ├── forms/
│   │   │   │   ├── FormWizard.tsx
│   │   │   │   ├── TaxYearSelector.tsx
│   │   │   │   ├── TaxMethodSelector.tsx
│   │   │   │   ├── FormPreview.tsx
│   │   │   │   └── ExportOptions.tsx
│   │   │   └── onboarding/
│   │   │       ├── OnboardingWizard.tsx
│   │   │       ├── TaxInfoForm.tsx
│   │   │       └── PriorYearLossesForm.tsx
│   │   └── layout/            # Layout components
│   │       ├── Sidebar.tsx
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── AppShell.tsx
│   ├── lib/
│   │   ├── api/               # API client & endpoints
│   │   │   ├── client.ts      # Fetch wrapper with interceptors
│   │   │   ├── endpoints.ts   # API endpoint constants
│   │   │   └── mock-api.ts    # Mock API responses
│   │   ├── utils/             # Utility functions
│   │   │   ├── cn.ts          # Tailwind class merger
│   │   │   ├── format.ts      # Number/date formatting
│   │   │   ├── calculations.ts # Tax calculations (mock)
│   │   │   └── validators.ts  # Custom validators
│   │   └── constants/         # App constants
│   │       ├── routes.ts
│   │       ├── transactions.ts
│   │       └── forms.ts
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts         # Mock auth hook
│   │   ├── useWallets.ts      # TanStack Query: wallets
│   │   ├── useTransactions.ts # TanStack Query: transactions
│   │   ├── useForms.ts        # TanStack Query: forms
│   │   └── useUIStore.ts      # Zustand UI state
│   ├── types/                 # TypeScript types
│   │   ├── index.ts
│   │   ├── wallet.ts
│   │   ├── transaction.ts
│   │   ├── form.ts
│   │   └── user.ts
│   ├── stores/                # Zustand stores
│   │   └── uiStore.ts
│   └── middleware.ts          # Route protection (future auth)
├── @mock-database/            # Mock data
│   ├── wallets.json
│   ├── transactions.json
│   ├── users.json
│   └── generate-mock-data.ts  # Script to generate mock data
├── assets/
│   ├── brand/                 # Logo and brand assets
│   │   ├── full-text-logo.png
│   │   └── Icon.svg
│   └── inspirationscreenshots/ # TaTax reference
├── public/
│   └── fonts/                 # Custom fonts if needed
├── .storybook/                # Storybook config
├── __tests__/                 # Global test setup
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### 4.2 Naming Conventions

**Files:**
- Components: PascalCase (`DashboardHeader.tsx`)
- Utilities: camelCase (`formatCurrency.ts`)
- Constants: camelCase (`routes.ts`)
- Types: camelCase (`transaction.ts`)
- Pages (App Router): lowercase (`dashboard/page.tsx`)

**Components:**
- Export named components: `export function Button() {}`
- Use TypeScript interfaces for props: `ButtonProps`

**Variables:**
- camelCase for variables and functions
- SCREAMING_SNAKE_CASE for constants
- PascalCase for types/interfaces

---

## 5. Data Models & Mock Data

### 5.1 Core Data Models

**User:**
```typescript
// src/types/user.ts
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

**Wallet:**
```typescript
// src/types/wallet.ts
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

**Transaction:**
```typescript
// src/types/transaction.ts
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

**Tax Form:**
```typescript
// src/types/form.ts
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

### 5.2 Mock Data Structure

**Mock Data Location:** `@mock-database/`

**Files:**
- `users.json` - 1 mock user
- `connection-sources.json` - All available sources to connect
- `connected-sources.json` - User's connected sources (2 wallets, 2 exchanges, 2 blockchains)
- `transactions.json` - 600 transactions (100 per source)
- `forms.json` - 2 completed forms (2023, 2024)

**Mock Data Generation Script:**
```typescript
// @mock-database/generate-mock-data.ts
import { faker } from '@faker-js/faker';
import fs from 'fs';

// Seed for consistent data across team
const SEED = process.env.MOCK_SEED ? parseInt(process.env.MOCK_SEED) : 12345;
faker.seed(SEED);

// Generate 600 transactions with edge cases:
// - 10% missing USD values (isPriced: false)
// - 15% very large values (>$100k)
// - 10% very small values (<$1)
// - 20% need categorization
// - Include various transaction types
// - Dates spanning 2023-2024

function generateTransactions(sources: ConnectedSource[], count: number): Transaction[] {
  const transactions: Transaction[] = [];
  const assets = ['BTC', 'ETH', 'SOL', 'USDC', 'USDT', 'MATIC', 'AVAX', 'DOGE'];

  for (let i = 0; i < count; i++) {
    const source = faker.helpers.arrayElement(sources);
    const asset = faker.helpers.arrayElement(assets);
    const type = faker.helpers.arrayElement<TransactionType>([
      'buy', 'sell', 'transfer-in', 'transfer-out', 'self-transfer'
    ]);

    // Edge case: 10% missing prices
    const hasPricing = faker.number.float({ min: 0, max: 1 }) > 0.1;

    // Edge case: Some very large or very small values
    let valueUsd: number | null = null;
    if (hasPricing) {
      const rand = faker.number.float({ min: 0, max: 1 });
      if (rand < 0.15) {
        // Large value
        valueUsd = faker.number.float({ min: 100000, max: 1000000, precision: 2 });
      } else if (rand < 0.25) {
        // Small value
        valueUsd = faker.number.float({ min: 0.01, max: 1, precision: 4 });
      } else {
        // Normal value
        valueUsd = faker.number.float({ min: 10, max: 50000, precision: 2 });
      }
    }

    // 20% need categorization
    const needsCategorization = faker.number.float({ min: 0, max: 1 }) < 0.2;

    transactions.push({
      id: faker.string.uuid(),
      userId: 'mock-user-id',
      sourceId: source.id,
      sourceName: source.sourceName,
      date: faker.date.between({ from: '2023-01-01', to: '2024-12-31' }),
      type,
      asset,
      amount: faker.number.float({ min: 0.001, max: 100, precision: 8 }),
      valueUsd,
      fee: faker.number.float({ min: 0, max: 50, precision: 4 }),
      feeUsd: hasPricing ? faker.number.float({ min: 0, max: 50, precision: 2 }) : null,
      txHash: faker.string.hexadecimal({ length: 64, prefix: '0x' }),
      category: needsCategorization ? 'uncategorized' : 'personal',
      description: needsCategorization ? undefined : faker.lorem.sentence(),
      isCategorized: !needsCategorization,
      isPriced: hasPricing,
      needsReview: needsCategorization || !hasPricing,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
}

// Run script: npm run generate:mocks
// Or with seed: npm run generate:mocks --seed=54321
```

**Package.json scripts:**
```json
{
  "scripts": {
    "generate:mocks": "tsx @mock-database/generate-mock-data.ts",
    "dev": "npm run check:mocks && next dev",
    "check:mocks": "node -e \"require('fs').existsSync('./@mock-database/transactions.json') || require('child_process').execSync('npm run generate:mocks', {stdio:'inherit'})\""
  }
}
```

### 5.3 Mock API Layer

**API Client (`src/lib/api/client.ts`):**
```typescript
// Simple fetch wrapper with interceptors
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // TODO: AUTH - Add bearer token to headers
  const headers = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}
```

**Mock API Routes (`src/app/api/`):**
Create Next.js route handlers that return mock data:

```typescript
// src/app/api/transactions/route.ts
import { NextResponse } from 'next/server';
import transactions from '@mock-database/transactions.json';

export async function GET(request: Request) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // TODO: BACKEND - Replace with actual database query
  return NextResponse.json(transactions);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  // TODO: BACKEND - Update transaction in database
  // For now, just return success
  return NextResponse.json({ success: true, data: body });
}
```

**TanStack Query Hooks:**
```typescript
// src/hooks/useTransactions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { Transaction } from '@/types/transaction';

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: () => apiClient<Transaction[]>('/transactions'),
  });
}

export function useCategorizeTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; category: string; description?: string }) =>
      apiClient(`/transactions/${data.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
```

---

## 6. User Flows

### 6.1 First-Time User Flow

**Journey Map:**
```
External Landing Page (not in scope)
  ↓ [User clicks "Get Started"]

1. /login (Auth Page)
   - Show login form
   - Show "Sign Up" button
   - TODO: AUTH - Supabase integration
   ↓ [New user clicks "Sign Up"]

2. Registration Modal/Page
   - Email, Password fields
   - "Create Account" button
   - TODO: AUTH - Create user in Supabase
   ↓ [Account created]

3. /disclaimer
   - Page title: "Terms and Conditions"
   - Scrollable terms text (legal copy)
   - Two checkboxes:
     * "I have read and accept the terms"
     * "I acknowledge the specific clauses [list numbers]"
   - "Cancel Account" button (destructive, left)
   - "Accept" button (primary, right, disabled until checked)
   ↓ [User accepts]

4. /privacy
   - Page title: "Privacy Policy"
   - Scrollable privacy policy text
   - Single checkbox: "I have read and accept the privacy policy"
   - "Back" button (left)
   - "Accept" button (primary, right, disabled until checked)
   ↓ [User accepts]

5. /onboarding
   - Multi-step wizard (Progress indicator at top)
   - Step 1: Welcome
     * Heading: "Welcome to CoinTally!"
     * Subtext: "Let's get your tax information set up"
     * Illustration/mascot
     * "Get Started" button
   - Step 2: Tax Year
     * "Which tax year are you filing for?"
     * Radio buttons: 2023, 2024, 2025
   - Step 3: State
     * "Which state do you file taxes in?"
     * Dropdown: All 50 states + DC
   - Step 4: Filing Status
     * "What is your filing status?"
     * Radio cards: Single, Married (Joint), Married (Separate), Head of Household
   - Step 5: Income Band
     * "What is your estimated annual income?"
     * Radio cards: Under $50k, $50k-$100k, $100k-$200k, $200k-$500k, Over $500k
   - Step 6: Prior Year Losses
     * "Do you have prior year capital losses to carry forward?"
     * Input field: Dollar amount
     * Helper text: "This is optional. You can enter this later."
   - Each step has "Back" and "Continue" buttons
   - Progress saved after each step (server action)
   ↓ [User completes onboarding]

6. /wallets (with Add Wallet Modal auto-opened)
   - Modal appears immediately on first visit
   - Background shows empty wallets page
   - Modal: "Add Wallet/Exchange"
     * Three tabs: Blockchain, Exchange, Wallet
     * Grid of connection options (copy TaTax layout exactly)
     * Search bar at top
     * Each item shows logo, name, connection methods icons
     * Click item → Connection method selection screen
   - User must connect at least one source to proceed
   - "Skip for Now" button (allows proceeding with 0 connections, but they'll be prompted later)
   ↓ [User connects at least one source]

7. /dashboard
   - User lands on main dashboard
   - If uncategorized transactions exist:
     * Red banner appears: "You have X uncategorized transactions. [Review Now]"
   - Welcome message: "Welcome back, [Name]!"
   - Dashboard content loads
```

### 6.2 Returning User Flow

```
External Landing Page
  ↓ [User clicks "Login" or "Get Started"]

/login
  ↓ [User already logged in? Check session]
  YES → Redirect to /dashboard
  NO → Show login form
  ↓ [User logs in]

/dashboard (Main App)
```

### 6.3 Transaction Categorization Flow

**Trigger Points:**
1. User lands on /transactions for first time after new sync
2. User clicks red banner on dashboard
3. User clicks "Review Transactions" button anywhere
4. User manually navigates to /transactions (no auto-popup unless conditions above)

**Flow:**
```
/transactions page loads
  ↓ [Check: Are there uncategorized transactions?]
  YES → Auto-open Categorization Modal
  NO → Show normal transaction table

Categorization Modal:
  - Overlay with backdrop
  - Shows first uncategorized transaction
  - Transaction details displayed:
    * Date, Asset, Amount, Value USD
    * Source (wallet/exchange name)
    * Type (buy, sell, transfer, etc.)
    * Current category: "Uncategorized"

  - Categorization options (buttons):
    * "Self-Transfer" (green)
    * "Business Expense" (blue)
    * "Personal" (gray)
    * "Gift" (purple)
    * "Other" → Opens custom category input

  - Additional fields (collapsed by default):
    * "Add Description" (textarea)
    * "Add Notes" (textarea)

  - Action buttons:
    * "Skip" (left)
    * "Categorize" (right, primary)

  ↓ [User categorizes transaction]

  - Optimistic UI update (transaction marked as categorized)
  - Show next uncategorized transaction
  - Progress indicator: "5 of 23 transactions categorized"

  ↓ [All transactions categorized]

  - Success message: "All transactions categorized!"
  - Modal auto-closes after 2 seconds
  - Transaction table refreshes
  - Rating score updates on dashboard

  - User can X out modal anytime
    * Shows warning banner on page: "You have X uncategorized transactions"
    * Banner persists until all categorized
```

### 6.4 Form Generation Flow

**Prerequisite:** User must have categorized all transactions (or explicitly marked some as "exclude from report")

```
/dashboard or /transactions
  ↓ [User clicks "Get My Tax Forms" button]

  Check: Is rating 100%?
  NO → Show warning modal:
    * "Your categorization is XX% complete"
    * "We recommend categorizing all transactions before generating forms"
    * "Forms may be inaccurate if transactions are uncategorized"
    * Buttons: "Categorize More" (secondary), "Continue Anyway" (destructive)

  YES → Proceed to form generation
  ↓

/new-form (Wizard)

Step 1: Verify Connections
  - Heading: "Verify Your Connections"
  - List of all connected sources with last sync time
  - "Resync All" button
  - Warning if any source hasn't synced in >7 days
  - "Continue" button

Step 2: Select Tax Year
  - Heading: "Select Tax Year"
  - Radio cards: 2023, 2024, 2025
  - Shows transaction count for each year
  - "Back" and "Continue" buttons

Step 3: Select Tax Method
  - Heading: "Choose Your Cost Basis Method"
  - Radio cards with descriptions:
    * FIFO (First In, First Out) - Default, most common
    * LIFO (Last In, First Out) - Minimizes short-term gains
    * HIFO (Highest In, First Out) - Minimizes total gains
    * Specific ID - Manual selection (advanced)
  - Info tooltip for each method
  - "Back" and "Continue" buttons

Step 4: Review Summary
  - Heading: "Review Your Tax Summary"
  - Summary cards:
    * Total Capital Gains: $XX,XXX
    * Total Capital Losses: $XX,XXX
    * Net Gain/Loss: $XX,XXX
    * Transactions Included: XXX
    * Short-term vs Long-term breakdown
  - "Back" and "Continue" buttons

Step 5: Preview Forms
  - Heading: "Preview Your Tax Forms"
  - Tabs: Form 8949, Schedule D
  - Mockup preview of each form (static image or PDF preview)
  - "Back" and "Generate Forms" buttons

  ↓ [User clicks "Generate Forms"]

Step 6: Generating...
  - Full-page loading state
  - Spinner with message:
    * "Generating your tax forms..."
    * "This may take a few minutes"
    * "We'll email you when ready"
  - Progress bar (fake progress for UX)

  TODO: BACKEND - Trigger form generation job

  ↓ [Generation complete (simulated 5-10 seconds)]

Step 7: Success
  - Success message: "Forms Generated!"
  - "Download PDF" button
  - "Download CSV" button
  - "Email Forms" button
  - "View in Documents" link
  - Forms automatically saved to /view-forms
```

---

## 7. Page Specifications

### 7.1 Authentication Page (`/login`)

**Layout:**
- Centered card on full-screen background
- Background: Subtle gradient (brand colors)
- Card: White, max-width 400px, shadow-lg

**Content:**
- Logo at top (full-text-logo.png)
- Heading: "Welcome to CoinTally"
- Subheading: "Sign in to manage your crypto taxes"

**Login Form:**
- Email input (type="email", required)
- Password input (type="password", required)
- "Remember me" checkbox
- "Forgot password?" link (right-aligned)
- "Sign In" button (primary, full-width)

**Sign Up Section:**
- Divider: "Or"
- "Don't have an account? Sign Up" link

**Social Login (Future):**
- "Continue with Google" button (outline, full-width)
- TODO: AUTH - Supabase Google OAuth

**States:**
- Loading: Disable form, show spinner on button
- Error: Show error message above form (red background)

**TODO Comments:**
```typescript
// TODO: AUTH - Integrate Supabase signInWithPassword
// TODO: AUTH - Integrate Supabase signInWithOAuth (Google)
// TODO: AUTH - Handle session creation and redirect to /dashboard
```

---

### 7.2 Disclaimer Page (`/disclaimer`)

**Layout:**
- Full-screen page
- Header: Logo (top-left), "Log Out" button (top-right)
- Main content: Centered, max-width 800px

**Header:**
- Heading: "Terms and Conditions"
- Subheading: "Please read and accept to continue"

**Content:**
- Scrollable text area (max-height: 60vh, overflow-y: scroll)
- Border: 1px solid gray
- Padding: 24px
- Legal text (lorem ipsum for now, client will provide)

**Checkboxes:**
- Checkbox 1: "I have read and accept the terms and conditions"
- Checkbox 2: "I acknowledge clauses 3, 4, 5, 10, 12, 14, 15, 16, 19, 21, 25, 26, 27, 28, 30, 31, 32, 33, 35, 37, 39, 41, 42, 43, 45, 46, 47"
- Both must be checked to enable "Accept" button

**Footer Actions:**
- "Cancel Account" button (left, destructive, opens confirmation modal)
- "Accept" button (right, primary, disabled until both checkboxes checked)

**Confirmation Modal (Cancel Account):**
- Heading: "Are you sure?"
- Text: "Canceling will delete your account and all data"
- "Go Back" button (secondary)
- "Delete Account" button (destructive)
- TODO: AUTH - Handle account deletion

---

### 7.3 Privacy Policy Page (`/privacy`)

**Layout:**
- Same as Disclaimer page

**Header:**
- Heading: "Privacy Policy"
- Subheading: "How we handle your data"

**Content:**
- Scrollable privacy policy text
- Single checkbox: "I have read and accept the privacy policy"

**Footer Actions:**
- "Back" button (left, secondary, navigates to /disclaimer)
- "Accept" button (right, primary, disabled until checkbox checked)

---

### 7.4 Onboarding Wizard Page (`/onboarding`)

**Layout:**
- Full-screen wizard
- Progress indicator at top (step X of 6)
- Main content: Centered card, max-width 600px
- Footer: Back/Continue buttons

**Progress Indicator:**
- Horizontal stepper
- Circles for each step (filled = completed, outlined = current, gray = upcoming)
- Labels: "Welcome", "Tax Year", "State", "Filing Status", "Income", "Prior Losses"

**Step 1: Welcome**
- Illustration (use TaTax mascot style or create simple icon)
- Heading: "Welcome to CoinTally!"
- Paragraph: "Let's get your tax information set up. This should only take a few minutes."
- "Get Started" button (primary, large)

**Step 2: Tax Year**
- Heading: "Which tax year are you filing for?"
- Radio button cards (large, clickable):
  * 2023
  * 2024 (recommended badge if current year)
  * 2025
- Auto-advance on selection, or "Continue" button

**Step 3: State**
- Heading: "Which state do you file taxes in?"
- Dropdown (searchable):
  * All 50 states + DC
  * "Other" option for international users (future)
- "Back" and "Continue" buttons

**Step 4: Filing Status**
- Heading: "What is your filing status?"
- Radio button cards with icons:
  * Single
  * Married Filing Jointly
  * Married Filing Separately
  * Head of Household
- Each card shows brief description
- "Back" and "Continue" buttons

**Step 5: Income Band**
- Heading: "What is your estimated annual income?"
- Radio button cards:
  * Under $50,000
  * $50,000 - $100,000
  * $100,000 - $200,000
  * $200,000 - $500,000
  * Over $500,000
- Helper text: "This helps us provide accurate tax calculations"
- "Back" and "Continue" buttons

**Step 6: Prior Year Losses**
- Heading: "Do you have capital losses from prior years?"
- Helper text: "Capital losses can be carried forward to offset future gains"
- Input field: Dollar amount (formatted as currency)
- Checkbox: "I don't have prior year losses" (sets value to $0)
- "Back" and "Finish" buttons

**Save Progress:**
- TODO: BACKEND - Save onboarding data after each step via server action
- Show "Saving..." indicator briefly
- Allow user to leave and return (resume where left off)

---

### 7.5 Dashboard Page (`/dashboard`)

**Layout:**
- App shell with sidebar (collapsible) and main content area
- Main content: Full-width, padding 24px

**Sidebar (Collapsed: 64px, Expanded: 240px):**
- Logo at top (icon only when collapsed, full logo when expanded)
- Theme toggle (sun/moon icon)
- Navigation menu items:
  * Dashboard (home icon)
  * Wallets (wallet icon)
  * Transactions (list icon)
  * New Form (file-plus icon)
  * View Forms (files icon)
  * Profile (user icon)
  * Support (help-circle icon)
- Active state: Background highlight, left border accent
- Nested menu capability (expandable arrows)
- Collapse/expand toggle at bottom

**Header:**
- Breadcrumbs (left): "Dashboard"
- Right section:
  * Notification bell icon (badge if unread)
  * User avatar (dropdown menu: Profile, Settings, Log Out)

**Uncategorized Alert Banner (Conditional):**
- Only shows if user has uncategorized transactions
- Background: Red (light), border: Red (dark)
- Icon: Alert triangle
- Text: "You have X uncategorized transactions that need attention"
- Button: "Review Now" (navigates to /transactions with modal auto-open)
- Dismissible X button (hides banner but it comes back on refresh)

**Main Content:**

**Welcome Section:**
- Heading: "Welcome back, [User Name]!"
- Subheading: "Here's your crypto tax summary for [Tax Year]"

**Rating Badge (Top-right of welcome section):**
- Circular progress ring or progress bar
- Shows 0-100% completion
- Color-coded:
  * 0-50%: Red (needs work)
  * 50-85%: Yellow (getting there)
  * 85-99%: Light green (almost ready)
  * 100%: Bright green (ready to file)
- Text: "X% Ready to File"
- Tooltip: "Complete categorization to increase your score"

**Metrics Cards Row:**
- 4 cards in a row (responsive grid)
- Card 1: Total P&L (Profit & Loss)
  * Label: "Total P&L"
  * Value: $XX,XXX.XX (green if positive, red if negative)
  * Change indicator: "↑ $X,XXX vs last year"
  * Icon: TrendingUp/TrendingDown
- Card 2: Total Gains
  * Label: "Capital Gains"
  * Value: $XX,XXX.XX (green)
  * Subtext: "Short-term: $X,XXX | Long-term: $X,XXX"
- Card 3: Total Losses
  * Label: "Capital Losses"
  * Value: $XX,XXX.XX (red)
  * Subtext: "Available to offset gains"
- Card 4: Estimated Taxes
  * Label: "Est. Tax Liability"
  * Value: $XX,XXX.XX
  * Subtext: "Based on [Tax Method]"
  * Info tooltip: "This is an estimate. Consult your CPA."

**Chart Section:**
- Heading: "Portfolio Performance"
- Time range selector (buttons):
  * 1M, 3M, 6M, 1Y, YTD, All Time
- Line chart (Tremor):
  * X-axis: Date
  * Y-axis: Portfolio value (USD)
  * Line: Realized P&L over time
  * Fill area under line (gradient)
  * Tooltip on hover showing exact values
- Height: 400px
- TODO: AGENT - Use Tremor documentation to implement chart correctly

**Connected Wallets/Exchanges Section:**
- Heading: "Connected Sources"
- Subheading: "Click any source to view transactions"
- Grid of cards (2-3 columns):
  * Each card shows:
    - Source logo (left)
    - Source name and type (Blockchain/Exchange/Wallet)
    - Last synced: "X hours ago"
    - Transaction count: "XXX transactions"
    - Status badge: "Active" (green) / "Syncing" (yellow) / "Error" (red)
    - Quick action buttons:
      * "View Transactions" (navigates to /transactions?source=[id])
      * "Resync" icon button
      * "Disconnect" icon button (with confirmation)
- Empty state (if no sources connected):
  * Illustration
  * Text: "No sources connected yet"
  * "Add Wallet or Exchange" button (primary)

**Quick Actions Section (Bottom):**
- Heading: "Quick Actions"
- Button cards:
  * "Get My Tax Forms" (primary, large)
  * "Add New Source" (secondary)
  * "Export Transactions" (outline)

**Footer:**
- Small text: "Last synced: X minutes ago"
- "Sync All" button

---

### 7.6 Wallets Page (`/wallets`)

**Layout:**
- App shell (same sidebar as dashboard)
- Main content: Wallets management

**Header:**
- Heading: "Connected Sources"
- Subheading: "Manage your wallets, exchanges, and blockchain connections"
- "Add New Source" button (primary, top-right)

**Connected Sources List:**
- Table or card grid showing all connected sources
- Columns (if table):
  * Logo + Name
  * Type (badge: Blockchain/Exchange/Wallet)
  * Connection Method (badge: API/Wallet Connect/CSV)
  * Status (badge: Active/Syncing/Error)
  * Last Synced (relative time)
  * Transactions (count)
  * Actions (dropdown: Edit, Resync, Disconnect)

**Source Cards (Alternative to table):**
- Each card shows:
  * Logo (large, left)
  * Name + Type
  * Label/nickname (editable inline)
  * Connection details:
    - Address (for wallets, truncated)
    - API key status (for exchanges, "Connected ✓")
  * Last synced: Date/time
  * Transaction count
  * Status indicator
  * Action buttons:
    - "Resync" (icon)
    - "Edit" (icon, opens edit modal)
    - "Disconnect" (icon, destructive, opens confirmation)

**Add Source Modal (Triggered by "Add New Source" button):**
- Modal: Large (90vw or 800px max)
- Header: "Add Wallet/Exchange"
- Three tabs: "Blockchain", "Exchange", "Wallet"
- Search bar at top of modal
- Grid of available sources (copy TaTax layout exactly):
  * Each item: Logo, Name, Supported connection methods icons
  * Clicking an item opens connection flow

**Connection Flow (Sub-modal or next step):**
- Example: User clicks "Coinbase"
- Shows connection method options:
  * "API Key" (recommended)
  * "OAuth" (if supported)
  * "CSV Upload"
- User selects method:

  **API Key Flow:**
  - Heading: "Connect Coinbase via API"
  - Instructions: "Enter your Coinbase API credentials"
  - Input: API Key (text)
  - Input: API Secret (password)
  - Input: Passphrase (if applicable)
  - Checkbox: "Read-only access" (checked, disabled)
  - "Help" link → Opens guide on how to create API key
  - "Cancel" and "Connect" buttons
  - TODO: BACKEND - Validate and store API credentials securely

  **Wallet Connect Flow:**
  - Heading: "Connect Wallet"
  - "Connect Wallet" button (triggers WalletConnect modal)
  - Shows supported wallets (MetaMask, Trust, etc.)
  - TODO: BACKEND - Integrate WalletConnect library

  **CSV Upload Flow:**
  - Heading: "Upload Transaction CSV"
  - File upload dropzone
  - "Download Template" link
  - "Upload" button
  - TODO: BACKEND - Parse and import CSV

**Empty State (No sources connected):**
- Illustration
- Heading: "No sources connected"
- Text: "Connect your wallets and exchanges to start tracking your crypto taxes"
- "Add Source" button (primary, large)

---

### 7.7 Transactions Page (`/transactions`)

**Layout:**
- App shell with sidebar
- Main content: Transaction list with filters

**Header:**
- Heading: "Transactions"
- Subheading: "View and categorize all your crypto transactions"

**Rating Banner (Top):**
- Same as dashboard rating badge
- Inline banner (full-width)
- Background color based on score:
  * Red (0-50%): "Your transactions need attention. XX% categorized."
  * Yellow (50-85%): "You're making progress! XX% categorized."
  * Green (85-99%): "Almost there! XX% categorized."
  * Bright Green (100%): "All set! You're ready to generate forms."
- Progress bar showing categorization percentage

**Uncategorized Alert (Conditional):**
- If user has uncategorized transactions:
  * Banner: "You have X uncategorized transactions"
  * "Categorize Now" button
  * Dismissible, but persists until resolved

**Filters Section:**
- Row of filter controls:
  * Source filter (dropdown, multi-select):
    - "All Sources"
    - List of connected sources (checkboxes)
  * Transaction type filter (dropdown, multi-select):
    - "All Types"
    - Buy, Sell, Transfer In, Transfer Out, etc.
  * Category filter (dropdown, multi-select):
    - "All Categories"
    - Uncategorized, Personal, Business Expense, Self-Transfer, Gift
  * Date range picker:
    - "All Time" / "2024" / "2023" / Custom range
  * Sort by (dropdown):
    - Date (newest first)
    - Date (oldest first)
    - Value (highest first)
    - Value (lowest first)
  * "Reset Filters" button

**Bulk Actions Bar (Conditional, appears when transactions selected):**
- Checkbox: "Select all"
- Selected count: "X transactions selected"
- Actions:
  * "Categorize Selected" (opens categorization modal)
  * "Export Selected" (CSV)
  * "Delete Selected" (destructive, confirmation required)

**Transaction Table:**
- Columns:
  * Checkbox (for bulk select)
  * Date (sortable)
  * Asset (logo + ticker)
  * Type (badge with color)
  * Amount (quantity)
  * Value (USD, with $ symbol)
  * Source (logo + name)
  * Category (badge, color-coded)
  * Actions (dropdown or icon buttons)
- Row hover state: Slight background color change
- Row click: Opens transaction detail modal
- Actions dropdown:
  * "Categorize" (if uncategorized)
  * "Edit"
  * "Add Note"
  * "View on Explorer" (external link, if blockchain tx)
  * "Delete" (destructive)

**Infinite Scroll:**
- Load 20 transactions initially
- As user scrolls to bottom, load next 20
- Loading indicator at bottom: "Loading more..."
- TODO: AGENT - Implement infinite scroll with React Query

**Categorization Modal (Auto-opens on certain conditions):**
- Overlay modal (backdrop with blur)
- Max-width: 600px
- Heading: "Categorize Transaction"
- Transaction details card:
  * Date, Asset, Amount, Value
  * Source name
  * Transaction type
  * Address (if applicable, truncated with copy button)
  * Transaction hash (if applicable, external link)
- Current category: "Uncategorized" (or current value)
- Categorization buttons (large, full-width):
  * "Self-Transfer" (green icon, text: "Transfer between my own wallets")
  * "Business Expense" (blue icon, text: "Business-related purchase or expense")
  * "Personal" (gray icon, text: "Personal purchase or payment")
  * "Gift" (purple icon, text: "Gift sent or received")
  * "Other" (opens custom category input)
- If user selects "Personal":
  * Show info box: "Personal payments aren't tax deductible. Switch to Business Expense if this was for your business."
- Additional fields (collapsible):
  * "Add Description" (textarea, placeholder: "e.g., 'Bought coffee'")
  * "Add Notes" (textarea, placeholder: "Any additional context")
- Footer actions:
  * "Skip" button (left, moves to next uncategorized)
  * "Categorize" button (right, primary)
  * Progress indicator: "5 of 23 categorized"
- Success animation after categorization
- Auto-advance to next uncategorized transaction

**Transaction Detail Modal (Opened by clicking a row):**
- Similar to categorization modal
- Shows full transaction details
- "Edit" button (opens categorization modal)
- "Close" button

**Empty State (No transactions):**
- Illustration
- Heading: "No transactions yet"
- Text: "Connect a wallet or exchange to import transactions"
- "Add Source" button

---

### 7.8 New Form Page (`/new-form`)

**Layout:**
- Full-screen wizard (no sidebar, minimal header)
- Progress stepper at top
- Main content: Centered, max-width 800px

**Progress Stepper:**
- Steps: "Connections" → "Tax Year" → "Method" → "Review" → "Preview" → "Generate"
- Current step highlighted

**Step 1: Verify Connections**
- Heading: "Verify Your Connections"
- Subheading: "Make sure all sources are synced before generating forms"
- List of connected sources:
  * Logo, Name, Last synced time
  * Status indicator (green = good, yellow = >7 days, red = error)
  * "Resync" button for each
- "Resync All" button (secondary, syncs all sources)
- Warning message if any source is stale
- "Back to Dashboard" and "Continue" buttons

**Step 2: Select Tax Year**
- Heading: "Select Tax Year"
- Radio button cards:
  * 2023 (shows transaction count for that year)
  * 2024
  * 2025
- Each card shows:
  * Year
  * Transaction count
  * Total gain/loss (calculated)
- "Back" and "Continue" buttons

**Step 3: Select Tax Method**
- Heading: "Choose Your Cost Basis Method"
- Subheading: "This determines how your gains and losses are calculated"
- Radio button cards with detailed descriptions:
  * FIFO (First In, First Out)
    - Description: "The default method. The first coins you bought are the first coins you sold."
    - Best for: "Most taxpayers"
  * LIFO (Last In, First Out)
    - Description: "The last coins you bought are the first coins you sold."
    - Best for: "Minimizing short-term gains"
  * HIFO (Highest In, First Out)
    - Description: "The coins with the highest cost basis are sold first."
    - Best for: "Minimizing total gains"
  * Specific ID
    - Description: "Manually select which coins to sell."
    - Best for: "Advanced users with detailed records"
- Each card has "Learn More" link (opens info modal)
- "Back" and "Continue" buttons

**Step 4: Review Summary**
- Heading: "Review Your Tax Summary"
- Subheading: "Make sure everything looks correct before generating forms"
- Summary cards (2x2 grid):
  * Total Capital Gains: $XX,XXX (green)
  * Total Capital Losses: $XX,XXX (red)
  * Net Gain/Loss: $XX,XXX (green or red)
  * Transactions Included: XXX
- Breakdown table:
  * Short-term gains: $XX,XXX
  * Short-term losses: $XX,XXX
  * Long-term gains: $XX,XXX
  * Long-term losses: $XX,XXX
- Info text: "Based on [Tax Method] method for tax year [Year]"
- "Edit" links for each section (navigates back to change selections)
- "Back" and "Continue" buttons

**Step 5: Preview Forms**
- Heading: "Preview Your Tax Forms"
- Subheading: "Review the forms before final generation"
- Tabs: "Form 8949" | "Schedule D"
- Preview area (mockup of form):
  * Static image or PDF preview for now
  * TODO: BACKEND - Generate actual form preview
- Download preview button (downloads mock PDF)
- "Back" and "Generate Forms" buttons (Generate is primary, large)

**Step 6: Generating (Full-page loading state)**
- No progress stepper visible
- Centered content:
  * Large spinner
  * Heading: "Generating Your Tax Forms"
  * Subtext: "This may take a few minutes. We'll email you when ready."
  * Fake progress bar (animated 0% → 100% over ~10 seconds)
  * Status text updates:
    - "Calculating capital gains..."
    - "Generating Form 8949..."
    - "Generating Schedule D..."
    - "Finalizing documents..."
- TODO: BACKEND - Trigger async form generation job
- Simulated delay: 5-10 seconds

**Step 7: Success**
- Heading: "Tax Forms Generated!"
- Subheading: "Your forms are ready to download"
- Success icon/animation
- Form files listed:
  * Form 8949 (PDF) - "Download" button
  * Schedule D (PDF) - "Download" button
  * Detailed Transactions (CSV) - "Download" button
- Action buttons:
  * "Email Forms to Me" (sends email with links)
  * "View in Documents" (navigates to /view-forms)
  * "Generate Another Form" (restarts wizard)
  * "Back to Dashboard" (primary)

---

### 7.9 View Forms Page (`/view-forms`)

**Layout:**
- App shell with sidebar
- Main content: List of generated forms

**Header:**
- Heading: "Tax Forms"
- Subheading: "View and download your generated tax forms"
- "Generate New Form" button (primary, top-right)

**Forms List:**
- Table or card layout
- Sorted by date (newest first)
- Columns/Fields:
  * Tax Year (2024, 2023, etc.)
  * Date Generated (relative time: "2 days ago")
  * Status (badge: Completed/Generating/Error)
  * Tax Method (FIFO, LIFO, etc.)
  * Net Gain/Loss (green or red)
  * Actions (dropdown or buttons)
- Actions for each form:
  * "Download PDF" (downloads Form 8949 + Schedule D as ZIP)
  * "Download CSV"
  * "View Details" (opens form detail modal)
  * "Regenerate" (opens confirmation modal)
  * "Delete" (destructive, confirmation required)

**Form Detail Modal:**
- Heading: "Tax Form for [Year]"
- Tabs: "Summary" | "Form 8949" | "Schedule D"
- Summary tab:
  * Date generated
  * Tax method used
  * Total gains, losses, net
  * Transactions included
  * Download buttons
- Form preview tabs:
  * Embedded PDF preview or image
  * "Download" button
- "Close" button

**Regenerate Confirmation Modal:**
- Heading: "Regenerate Tax Form?"
- Text: "This will create a new version of your [Year] tax form using the latest transaction data. Your previous form will be archived."
- "Cancel" and "Regenerate" buttons

**Empty State:**
- Illustration
- Heading: "No tax forms yet"
- Text: "Generate your first tax form to get started"
- "Generate Form" button (primary, large)

---

### 7.10 Profile Page (`/profile`)

**Layout:**
- App shell with sidebar
- Main content: Profile settings (tabs or sections)

**Sections (or Tabs):**

**1. Personal Information:**
- Heading: "Personal Information"
- Fields:
  * Name (input, editable)
  * Email (input, disabled, "Change Email" link)
  * Profile photo (avatar upload, optional)
- "Save Changes" button

**2. Tax Information:**
- Heading: "Tax Information"
- Display current values:
  * Filing Year: 2024 ("Edit" link)
  * State: California ("Edit" link)
  * Filing Status: Single ("Edit" link)
  * Income Band: $100k-$200k ("Edit" link)
  * Prior Year Losses: $5,000 ("Edit" link)
- "Edit Tax Info" button (opens edit modal)

**3. Preferences:**
- Heading: "Preferences"
- Settings:
  * Default Tax Method (dropdown: FIFO, LIFO, HIFO, Specific ID)
  * Email Notifications (toggle switches):
    - Transaction sync complete
    - Form generation complete
    - Weekly summary
  * Theme (toggle: Light / Dark / System)
- "Save Preferences" button

**4. Security:**
- Heading: "Security"
- Actions:
  * "Change Password" button (opens modal)
  * "Enable 2FA" button (future)
  * "Session History" link (shows login history)

**5. Account:**
- Heading: "Account"
- Actions:
  * "Export My Data" button (GDPR compliance)
  * "Delete Account" button (destructive, opens confirmation)

---

### 7.11 Support Page (`/support`)

**Layout:**
- App shell with sidebar
- Main content: Support resources

**Header:**
- Heading: "Help & Support"
- Subheading: "Get answers to your questions"

**Search Bar:**
- Large search input: "Search for help..."
- Searches through FAQ/help articles

**Sections:**

**1. Frequently Asked Questions:**
- Accordion of common questions:
  * "How do I connect my wallet?"
  * "What tax method should I use?"
  * "How do I categorize transactions?"
  * "What if my exchange isn't supported?"
  * "How accurate are the tax calculations?"
  * Etc.

**2. Video Tutorials:**
- Embedded videos or links to YouTube
- "Getting Started" video
- "Categorizing Transactions" video
- "Generating Tax Forms" video

**3. Contact Support:**
- Heading: "Still need help?"
- Contact form:
  * Subject (dropdown: Technical Issue, Question, Feature Request, Other)
  * Message (textarea)
  * Attach file (optional)
  * Email reply-to (pre-filled with user email)
  * "Submit" button
- Alternative: "Book a call with support" link (calendly embed)

**4. Resources:**
- Links to:
  * User Guide (PDF)
  * IRS Resources (external links)
  * Community Forum (future)
  * Status Page (service uptime)

---

## 8. Component Specifications

### 8.1 Core UI Components (shadcn/ui)

**Install shadcn/ui components as needed:**
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add accordion
```

**TODO: AGENT - Use shadcn/ui documentation to implement all components with proper theming and dark mode support.**

### 8.2 Custom Feature Components

**DashboardHeader:**
```typescript
// src/components/features/dashboard/DashboardHeader.tsx
interface DashboardHeaderProps {
  userName: string;
  taxYear: number;
  rating: number; // 0-100
}

export function DashboardHeader({ userName, taxYear, rating }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-heading font-bold">Welcome back, {userName}!</h1>
        <p className="text-muted-foreground">Here's your crypto tax summary for {taxYear}</p>
      </div>
      <RatingBadge rating={rating} />
    </div>
  );
}
```

**RatingBadge:**
```typescript
// src/components/features/transactions/RatingBadge.tsx
interface RatingBadgeProps {
  rating: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
}

export function RatingBadge({ rating, size = 'md' }: RatingBadgeProps) {
  const getColor = (r: number) => {
    if (r < 50) return 'text-red-500 bg-red-50 border-red-200';
    if (r < 85) return 'text-yellow-500 bg-yellow-50 border-yellow-200';
    if (r < 100) return 'text-green-500 bg-green-50 border-green-200';
    return 'text-green-600 bg-green-100 border-green-300';
  };

  const getLabel = (r: number) => {
    if (r < 50) return 'Needs Work';
    if (r < 85) return 'Getting There';
    if (r < 100) return 'Almost Ready';
    return 'Ready to File';
  };

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getColor(rating)}`}>
      <Progress value={rating} className="w-24" />
      <span className="font-semibold">{rating}%</span>
      <span className="text-sm">{getLabel(rating)}</span>
    </div>
  );
}
```

**PnLChart:**
```typescript
// src/components/features/dashboard/PnLChart.tsx
import { LineChart } from '@tremor/react';

interface PnLChartProps {
  data: Array<{ date: string; value: number }>;
  timeRange: '1M' | '3M' | '6M' | '1Y' | 'YTD' | 'All';
  onTimeRangeChange: (range: string) => void;
}

export function PnLChart({ data, timeRange, onTimeRangeChange }: PnLChartProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Portfolio Performance</CardTitle>
          <div className="flex gap-2">
            {['1M', '3M', '6M', '1Y', 'YTD', 'All'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTimeRangeChange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <LineChart
          data={data}
          index="date"
          categories={["value"]}
          colors={["blue"]}
          valueFormatter={(value) => `$${value.toLocaleString()}`}
          yAxisWidth={60}
          className="h-80"
        />
      </CardContent>
    </Card>
  );
}

// TODO: AGENT - Research Tremor LineChart API and implement with proper props
```

**TransactionTable:**
```typescript
// src/components/features/transactions/TransactionTable.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

interface TransactionTableProps {
  transactions: Transaction[];
  onRowClick: (transaction: Transaction) => void;
  onCategorize: (transactionId: string) => void;
}

export function TransactionTable({ transactions, onRowClick, onCategorize }: TransactionTableProps) {
  // TODO: AGENT - Implement infinite scroll using @tanstack/react-virtual
  // Load 20 rows at a time
  // Show loading indicator at bottom when fetching more

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Checkbox /> {/* Select all */}
          </TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Asset</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Value (USD)</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id} onClick={() => onRowClick(tx)} className="cursor-pointer hover:bg-muted">
            <TableCell>
              <Checkbox />
            </TableCell>
            <TableCell>{format(tx.date, 'MMM dd, yyyy')}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar src={getAssetLogo(tx.asset)} />
                <span>{tx.asset}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={getTypeVariant(tx.type)}>{tx.type}</Badge>
            </TableCell>
            <TableCell>{tx.amount.toFixed(8)}</TableCell>
            <TableCell>{tx.valueUsd ? `$${tx.valueUsd.toLocaleString()}` : '-'}</TableCell>
            <TableCell>{tx.sourceName}</TableCell>
            <TableCell>
              <Badge variant={getCategoryVariant(tx.category)}>{tx.category}</Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger><MoreVertical /></DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onCategorize(tx.id)}>Categorize</DropdownMenuItem>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Add Note</DropdownMenuItem>
                  <DropdownMenuItem>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

**CategorizationModal:**
```typescript
// src/components/features/transactions/CategorizationModal.tsx
interface CategorizationModalProps {
  transaction: Transaction;
  onCategorize: (category: string, description?: string) => void;
  onSkip: () => void;
  onClose: () => void;
  progress?: { current: number; total: number };
}

export function CategorizationModal({ transaction, onCategorize, onSkip, onClose, progress }: CategorizationModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [showNotes, setShowNotes] = useState(false);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Categorize Transaction</DialogTitle>
          {progress && (
            <DialogDescription>
              {progress.current} of {progress.total} categorized
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Transaction Details Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <p>{format(transaction.date, 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <Label>Asset</Label>
                <p>{transaction.asset}</p>
              </div>
              <div>
                <Label>Amount</Label>
                <p>{transaction.amount}</p>
              </div>
              <div>
                <Label>Value (USD)</Label>
                <p>${transaction.valueUsd?.toLocaleString() || '-'}</p>
              </div>
              <div>
                <Label>Source</Label>
                <p>{transaction.sourceName}</p>
              </div>
              <div>
                <Label>Type</Label>
                <Badge>{transaction.type}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categorization Buttons */}
        <div className="space-y-2">
          <Button
            variant={selectedCategory === 'self-transfer' ? 'default' : 'outline'}
            className="w-full justify-start"
            onClick={() => setSelectedCategory('self-transfer')}
          >
            <ArrowLeftRight className="mr-2" />
            Self-Transfer
            <span className="ml-auto text-xs text-muted-foreground">Transfer between my wallets</span>
          </Button>

          <Button
            variant={selectedCategory === 'business-expense' ? 'default' : 'outline'}
            className="w-full justify-start"
            onClick={() => setSelectedCategory('business-expense')}
          >
            <Briefcase className="mr-2" />
            Business Expense
            <span className="ml-auto text-xs text-muted-foreground">Business-related purchase</span>
          </Button>

          <Button
            variant={selectedCategory === 'personal' ? 'default' : 'outline'}
            className="w-full justify-start"
            onClick={() => setSelectedCategory('personal')}
          >
            <User className="mr-2" />
            Personal
            <span className="ml-auto text-xs text-muted-foreground">Personal purchase or payment</span>
          </Button>

          <Button
            variant={selectedCategory === 'gift' ? 'default' : 'outline'}
            className="w-full justify-start"
            onClick={() => setSelectedCategory('gift')}
          >
            <Gift className="mr-2" />
            Gift
            <span className="ml-auto text-xs text-muted-foreground">Gift sent or received</span>
          </Button>
        </div>

        {/* Warning for Personal */}
        {selectedCategory === 'personal' && (
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Personal payments aren't deductible. Switch to Business Expense if this was for your business.
            </AlertDescription>
          </Alert>
        )}

        {/* Optional Description */}
        <div>
          <Button variant="ghost" size="sm" onClick={() => setShowNotes(!showNotes)}>
            {showNotes ? 'Hide' : 'Add'} Description
          </Button>
          {showNotes && (
            <Textarea
              placeholder="Add any notes or description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2"
            />
          )}
        </div>

        {/* Actions */}
        <DialogFooter>
          <Button variant="outline" onClick={onSkip}>Skip</Button>
          <Button
            onClick={() => onCategorize(selectedCategory, description)}
            disabled={!selectedCategory}
          >
            Categorize
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**AddWalletModal:**
```typescript
// src/components/features/wallets/AddWalletModal.tsx
interface AddWalletModalProps {
  open: boolean;
  onClose: () => void;
  onConnect: (sourceId: string, connectionType: ConnectionType, credentials: any) => void;
}

export function AddWalletModal({ open, onClose, onConnect }: AddWalletModalProps) {
  const [activeTab, setActiveTab] = useState<'blockchain' | 'exchange' | 'wallet'>('blockchain');
  const [selectedSource, setSelectedSource] = useState<ConnectionSource | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // TODO: AGENT - Load connection sources from mock data

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Add Wallet/Exchange</DialogTitle>
          <DialogDescription>Select a platform and connect with a few clicks</DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
            <TabsTrigger value="exchange">Exchange</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
          </TabsList>

          {/* Blockchain Tab */}
          <TabsContent value="blockchain">
            <div className="grid grid-cols-3 gap-4">
              {/* Copy exact layout from TaTax screenshots */}
              {blockchainSources.map((source) => (
                <Card
                  key={source.id}
                  className="cursor-pointer hover:border-primary"
                  onClick={() => setSelectedSource(source)}
                >
                  <CardContent className="flex flex-col items-center p-6">
                    <Avatar src={source.logo} className="h-12 w-12 mb-2" />
                    <p className="font-medium">{source.name}</p>
                    <div className="flex gap-1 mt-2">
                      {source.connectionMethods.map((method) => (
                        <Badge key={method} variant="outline" size="sm">{method}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Exchange Tab (similar structure) */}
          <TabsContent value="exchange">
            {/* Similar grid for exchanges */}
          </TabsContent>

          {/* Wallet Tab (similar structure) */}
          <TabsContent value="wallet">
            {/* Similar grid for wallets */}
          </TabsContent>
        </Tabs>

        {/* Connection Flow (shown when source selected) */}
        {selectedSource && (
          <div className="mt-4">
            <ConnectionMethodSelector
              source={selectedSource}
              onConnect={(type, creds) => onConnect(selectedSource.id, type, creds)}
              onBack={() => setSelectedSource(null)}
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 9. State Management

### 9.1 Zustand Store (UI State)

```typescript
// src/stores/uiStore.ts
import { create } from 'zustand';

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Modals
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;

  // Feature Flags (for gradual rollout)
  featureFlags: Record<string, boolean>;
  setFeatureFlag: (flag: string, enabled: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  theme: 'system',
  setTheme: (theme) => set({ theme }),

  activeModal: null,
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),

  featureFlags: {},
  setFeatureFlag: (flag, enabled) => set((state) => ({
    featureFlags: { ...state.featureFlags, [flag]: enabled },
  })),
}));
```

### 9.2 React Query Setup

```typescript
// src/app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

```typescript
// src/app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 9.3 Query Hooks

```typescript
// src/hooks/useWallets.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { ConnectedSource } from '@/types/wallet';

export function useConnectedSources() {
  return useQuery({
    queryKey: ['connected-sources'],
    queryFn: () => apiClient<ConnectedSource[]>('/wallets/connected'),
  });
}

export function useConnectSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { sourceId: string; connectionType: string; credentials: any }) =>
      apiClient('/wallets/connect', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connected-sources'] });
    },
  });
}

export function useDisconnectSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sourceId: string) =>
      apiClient(`/wallets/disconnect/${sourceId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connected-sources'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
```

---

## 10. API Integration Layer

### 10.1 API Client Structure

```typescript
// src/lib/api/endpoints.ts
export const ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REGISTER: '/auth/register',

  // User
  USER_PROFILE: '/user/profile',
  USER_TAX_INFO: '/user/tax-info',

  // Wallets
  WALLETS_CONNECTED: '/wallets/connected',
  WALLETS_CONNECT: '/wallets/connect',
  WALLETS_DISCONNECT: (id: string) => `/wallets/disconnect/${id}`,
  WALLETS_RESYNC: (id: string) => `/wallets/resync/${id}`,

  // Transactions
  TRANSACTIONS_LIST: '/transactions',
  TRANSACTIONS_BY_ID: (id: string) => `/transactions/${id}`,
  TRANSACTIONS_CATEGORIZE: (id: string) => `/transactions/${id}/categorize`,
  TRANSACTIONS_BULK_CATEGORIZE: '/transactions/bulk-categorize',

  // Forms
  FORMS_LIST: '/forms',
  FORMS_GENERATE: '/forms/generate',
  FORMS_BY_ID: (id: string) => `/forms/${id}`,
  FORMS_DOWNLOAD: (id: string, format: string) => `/forms/${id}/download?format=${format}`,
} as const;
```

### 10.2 Mock API Implementation

**Create mock API routes in `src/app/api/` that return data from `@mock-database/`:**

```typescript
// src/app/api/transactions/route.ts
import { NextResponse } from 'next/server';
import transactions from '@mock-database/transactions.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sourceId = searchParams.get('sourceId');
  const category = searchParams.get('category');

  let filtered = transactions;

  if (sourceId) {
    filtered = filtered.filter((tx) => tx.sourceId === sourceId);
  }

  if (category) {
    filtered = filtered.filter((tx) => tx.category === category);
  }

  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return NextResponse.json(filtered);
}
```

**Backend Integration Comments:**
Add comments throughout API client code:
```typescript
// TODO: BACKEND - Replace mock API route with real endpoint
// Expected request: POST /api/transactions/:id/categorize
// Expected body: { category: string, description?: string }
// Expected response: { success: boolean, transaction: Transaction }
```

---

## 11. Development Phases

### Phase 1: Foundation (Week 1)
- Set up Next.js 14 project with App Router
- Install and configure Tailwind CSS + shadcn/ui
- Set up design tokens and theme system
- Create project folder structure
- Install all dependencies (React Query, Zustand, Zod, etc.)
- Set up ESLint, Prettier, Storybook
- Create mock data generation script
- Generate initial mock data

### Phase 2: Core UI Components (Week 1-2)
- Implement shadcn/ui components with custom theming
- Build layout components (Sidebar, Header, AppShell)
- Create reusable UI patterns (cards, buttons, inputs)
- Set up dark mode toggle
- Build Storybook stories for all components

### Phase 3: Authentication & Onboarding (Week 2)
- Build login page (UI only, no real auth)
- Create disclaimer and privacy pages
- Implement onboarding wizard with form validation (React Hook Form + Zod)
- Add progress saving placeholders

### Phase 4: Wallets & Connections (Week 3)
- Build wallets page
- Create AddWalletModal with tabs (Blockchain, Exchange, Wallet)
- Implement connection method selectors (UI only)
- Build wallet cards and management UI
- Add resync and disconnect functionality (optimistic updates)

### Phase 5: Dashboard (Week 3-4)
- Build dashboard layout
- Implement PnL chart with Tremor
- Create metrics cards
- Build connected sources section
- Add rating badge with calculation logic
- Implement uncategorized alert banner

### Phase 6: Transactions (Week 4-5)
- Build transaction table with infinite scroll
- Implement filtering and sorting
- Create categorization modal with full flow
- Add bulk operations UI
- Implement rating calculation based on categorization
- Add transaction detail modal

### Phase 7: Form Generation (Week 5-6)
- Build form wizard (7 steps)
- Implement tax year and method selectors
- Create summary and preview screens
- Build loading state with fake progress
- Add success screen with download buttons
- Connect to mock form generation

### Phase 8: View Forms & Profile (Week 6)
- Build view forms page with table/cards
- Implement form detail modal
- Create profile page with tabs
- Add settings and preferences
- Build support page with FAQs

### Phase 9: Polish & Testing (Week 7)
- Add loading states and skeletons throughout
- Implement error handling and toasts
- Add animations and transitions
- Fix responsive issues
- Write unit tests for critical components
- Test all user flows end-to-end
- Fix bugs and edge cases

### Phase 10: Documentation & Handoff (Week 7)
- Complete Storybook documentation
- Write integration guide for backend team
- Document all TODO: BACKEND comments
- Create deployment guide
- Final code review and cleanup

---

## 12. Backend Integration Guide

### 12.1 For Backend Developers

**This frontend is built to be backend-agnostic. Here's how to integrate:**

**1. API Endpoints:**
All API endpoints are defined in `src/lib/api/endpoints.ts`. Replace mock routes in `src/app/api/` with real Next.js route handlers that call your backend.

**Example:**
```typescript
// Before (Mock):
// src/app/api/transactions/route.ts
import transactions from '@mock-database/transactions.json';
export async function GET() {
  return NextResponse.json(transactions);
}

// After (Real):
// src/app/api/transactions/route.ts
import { apiClient } from '@/lib/api/client';
export async function GET() {
  const transactions = await fetch('https://your-backend.com/api/v1/transactions', {
    headers: { Authorization: `Bearer ${getToken()}` },
  }).then((res) => res.json());

  return NextResponse.json(transactions);
}
```

**2. Authentication:**
- Replace `useAuth` mock hook with real Supabase integration
- Update `middleware.ts` to check real sessions
- Add token management to API client

**3. Data Types:**
All TypeScript interfaces in `src/types/` are designed to match expected backend schemas. Adjust as needed.

**4. Environment Variables:**
Add to `.env.local`:
```
NEXT_PUBLIC_API_URL=https://api.cointally.com
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
```

**5. TODO Comments:**
Search codebase for `// TODO: BACKEND` to find all integration points.

---

## 13. Testing & QA Strategy

### 13.1 Unit Tests
- Test utility functions (`src/lib/utils/`)
- Test calculation logic (rating, tax calculations)
- Test form validation schemas (Zod)

### 13.2 Component Tests
- Test interactive components (modals, forms)
- Test state changes (button clicks, input changes)
- Test conditional rendering

### 13.3 Integration Tests
- Test user flows (onboarding, categorization, form generation)
- Test API calls with mock responses
- Test optimistic updates

### 13.4 Manual QA Checklist
- [ ] All pages load without errors
- [ ] Dark mode works on all pages
- [ ] Forms validate correctly
- [ ] Modals open and close properly
- [ ] Infinite scroll loads more data
- [ ] Filters and sorting work
- [ ] Rating updates when categorizing
- [ ] All buttons and links work
- [ ] No console errors or warnings
- [ ] Responsive on different screen sizes (desktop/laptop)

---

## 14. Performance & Optimization

### 14.1 Code Splitting
- Route-level splitting (automatic with Next.js App Router)
- Lazy load heavy components (charts, modals)
- Dynamic imports for Tremor charts

### 14.2 Data Fetching
- Use React Query caching (staleTime: 1 minute)
- Prefetch data on hover (predictive loading)
- Optimistic updates for mutations

### 14.3 Bundle Optimization
- Tree-shake unused shadcn components
- Use next/image for all images
- Defer non-critical JavaScript

### 14.4 Loading States
- Skeleton screens for large content (table, chart)
- Spinners for small actions (button clicks)
- Suspense boundaries at route level

---

## 15. Accessibility Requirements

### 15.1 WCAG 2.1 AA Compliance
- All interactive elements keyboard accessible
- Focus visible (ring) on all focusable elements
- Sufficient color contrast (4.5:1 for text)
- Alt text for all images
- ARIA labels for icon buttons

### 15.2 Keyboard Navigation
- Tab order follows visual order
- Escape closes modals
- Arrow keys navigate lists
- Enter/Space activates buttons

### 15.3 Screen Reader Support
- Semantic HTML (headings, lists, tables)
- ARIA labels where needed
- Live regions for dynamic updates (toasts, alerts)

---

## Appendix A: Key Libraries & Documentation

**Agent Instructions: Research and use official documentation for the following libraries:**

1. **Next.js 14 (App Router)**
   - Docs: https://nextjs.org/docs
   - Focus: Server components, client components, route handlers, middleware

2. **shadcn/ui**
   - Docs: https://ui.shadcn.com/docs
   - Install each component as needed
   - Customize with Tailwind config

3. **Tremor (Charts)**
   - Docs: https://www.tremor.so/docs
   - Use LineChart, AreaChart for dashboard

4. **TanStack Query v5**
   - Docs: https://tanstack.com/query/latest
   - Focus: useQuery, useMutation, query keys, cache invalidation

5. **Zustand**
   - Docs: https://github.com/pmndrs/zustand
   - Simple global state for UI

6. **React Hook Form**
   - Docs: https://react-hook-form.com
   - Use with Zod for validation

7. **Zod**
   - Docs: https://zod.dev
   - Schema validation for forms

---

## Appendix B: Glossary

- **8949**: IRS Form 8949 (Sales and Other Dispositions of Capital Assets)
- **Schedule D**: IRS Schedule D (Capital Gains and Losses)
- **FIFO**: First In, First Out (cost basis method)
- **LIFO**: Last In, First Out (cost basis method)
- **HIFO**: Highest In, First Out (cost basis method)
- **P&L**: Profit and Loss
- **CEX**: Centralized Exchange (Coinbase, Kraken, etc.)
- **DEX**: Decentralized Exchange (Uniswap, etc.)
- **Tx**: Transaction
- **Hash**: Transaction hash (unique identifier on blockchain)

---

## Document Control

**Change Log:**
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-28 | AI Assistant | Initial PRD created |

**Approval:**
- [ ] Product Owner
- [ ] Lead Developer
- [ ] Backend Lead

---

**END OF PRD**

This document is designed to be ingested by an LLM coding agent. All specifications are detailed and actionable. Begin implementation with Phase 1 and proceed sequentially through all phases until the entire project is completed and tested.
