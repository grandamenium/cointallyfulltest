# 🚀 CoinTally Phase 2: UI Enhancement & Feature Completion Prompt

## 📋 Context

You are a senior full-stack developer tasked with taking the CoinTally Frontend from MVP to production-grade excellence. The codebase is currently at **Phase 1 (MVP Complete)** with a solid foundation. Your mission is to **drastically upgrade the UI, complete all unfinished features, and implement comprehensive improvements** while strictly adhering to the Product Requirements Document (PRD) located at `/DOCS/PRODUCT-REQUIREMENTS-DOCUMENT.md`.

---

## 🎯 Mission Objectives

### Primary Goals:
1. **Drastically upgrade the UI** with modern animations, micro-interactions, and polish
2. **Complete all placeholder/incomplete features** marked with TODO comments
3. **Implement missing complex components** (categorization modal, form wizard, AddWallet modal)
4. **Add Tremor charts** for data visualization
5. **Enhance UX** with loading states, error handling, and empty states
6. **Optimize performance** and accessibility
7. **Maintain 100% adherence** to PRD specifications

---

## 📚 Required Reading (Read FIRST)

Before starting ANY work, you MUST thoroughly read and understand:

1. **`/DOCS/PRODUCT-REQUIREMENTS-DOCUMENT.md`** - Your bible. Every design decision, component spec, and user flow is defined here.
2. **`/README.md`** - Current implementation status and architecture
3. **`/CLAUDE.md`** - Project-specific instructions and agent reference
4. **Search for TODO comments** - Use `grep -r "TODO" --include="*.ts" --include="*.tsx"` to find all integration points

---

## 🎨 Phase 2: UI Enhancement & Polish

### 1. Animations & Micro-interactions

**Objective:** Make the UI feel alive, responsive, and delightful.

**Install Framer Motion:**
```bash
npm install framer-motion
```

**Implement:**

#### A. Page Transitions
- Add smooth fade-in animations for all page loads
- Implement staggered animations for lists (transaction table rows, wallet cards)
- Add exit animations when navigating between pages
- Example:
```tsx
import { motion } from 'framer-motion';

export function TransactionRow({ transaction }) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* row content */}
    </motion.tr>
  );
}
```

#### B. Button Interactions
- Add scale and ripple effects on click
- Implement loading spinners for async actions
- Add success/error state animations
- Hover effects with smooth transitions

#### C. Card Animations
- Hover lift effect for all cards
- Smooth shadow transitions
- Gradient animations on hover (for wallet/source cards)

#### D. Modal Animations
- Backdrop blur fade-in
- Modal slide-up/scale animation
- Smooth close animations

#### E. Progress Indicators
- Animated progress bars (rating badge)
- Circular progress for loading states
- Skeleton loaders with shimmer effect

**Reference:** Follow shadcn/ui animation patterns and Tailwind animate utilities.

---

### 2. Enhanced Visual Design

**Objective:** Elevate the visual polish to AAA-grade production quality.

#### A. Gradient Enhancements
- Add subtle gradient overlays to hero sections
- Implement animated gradient backgrounds (dashboard header)
- Use brand gradient (`#14BEFF` → `#3F6EFF`) for CTAs and highlights

#### B. Glassmorphism Effects
- Apply frosted glass effect to modals
- Add backdrop blur to dropdowns
- Implement semi-transparent cards with blur

#### C. Enhanced Shadows
- Add multi-layer shadows for depth
- Implement colored shadows matching brand colors
- Smooth shadow transitions on hover

#### D. Iconography
- Replace text-only buttons with icon+text combos
- Add status icons (success ✓, warning ⚠, error ✗)
- Use animated icons for loading states

#### E. Typography Refinement
- Implement proper font weights hierarchy
- Add letter-spacing to headings
- Ensure consistent line-height
- Use gradient text for key numbers (P&L, gains, losses)

---

### 3. Advanced UI Components

**Objective:** Implement production-grade component patterns.

#### A. Loading States
- Replace all `<Skeleton />` with branded loading skeletons
- Add shimmer animation to skeletons
- Implement optimistic UI updates for mutations
- Add "Saving..." indicators for forms

#### B. Empty States
- Design illustrated empty states for all lists
- Add helpful CTAs and copy
- Example: "No transactions yet? Connect a wallet to get started!"
- Include illustrations or icons

#### C. Error States
- Beautiful error pages (404, 500)
- Inline error messages with icons
- Error boundaries with recovery options
- Toast notifications for all actions

#### D. Tooltips & Hints
- Add tooltips to all icons and abbreviated text
- Implement keyboard shortcuts hints
- Add info tooltips for complex concepts (FIFO, LIFO, HIFO)

---

## 🧩 Phase 2: Complete Unfinished Features

### 1. ⭐ Priority: Transaction Categorization Modal

**Location:** Create `/components/features/transactions/CategorizationModal.tsx`

**Requirements (from PRD Section 6.3):**
- Full-screen overlay modal
- Show transaction details card
- 4 large categorization buttons:
  - "Self-Transfer" (green, with icon)
  - "Business Expense" (blue, with icon)
  - "Personal" (gray, with icon)
  - "Gift" (purple, with icon)
- Collapsible "Add Description" textarea
- "Skip" and "Categorize" buttons
- Progress indicator: "5 of 23 categorized"
- Auto-advance to next uncategorized transaction
- Success animation after categorization
- Optimistic UI updates

**Auto-open Conditions:**
1. User lands on `/transactions` with uncategorized transactions
2. User clicks "Review Now" banner on dashboard
3. User clicks "Categorize" button on a transaction

**Implementation Guide:**
```tsx
// Pseudocode structure
export function CategorizationModal({
  transaction,
  onCategorize,
  onSkip,
  progress
}) {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCategorize = async () => {
    setShowSuccess(true);
    await onCategorize(transaction.id, category, description);
    // Auto-advance to next after 1 second
    setTimeout(() => {
      setShowSuccess(false);
      // Load next transaction
    }, 1000);
  };

  return (
    <Dialog>
      {/* Transaction details */}
      {/* Category buttons */}
      {/* Description field */}
      {/* Actions */}
      {showSuccess && <SuccessAnimation />}
    </Dialog>
  );
}
```

**Integration:**
- Update `/app/(dashboard)/transactions/page.tsx`
- Add state for `selectedTransaction`
- Auto-open modal if uncategorized exists
- Wire up mutation hooks

---

### 2. ⭐ Priority: Add Wallet Modal

**Location:** Create `/components/features/wallets/AddWalletModal.tsx`

**Requirements (from PRD Section 7.6 & Component Spec 8.2):**

**Structure:**
1. Large modal (90vw or 800px max)
2. Three tabs: "Blockchain" | "Exchange" | "Wallet"
3. Search bar at top
4. Grid of connection sources (3 columns)
5. Each source shows:
   - Logo (large, centered)
   - Name
   - Supported connection method badges
6. Click source → Connection method selection screen

**Connection Flows:**

**A. API Key Flow:**
- Heading: "Connect [Source Name] via API"
- Instructions text
- Input: API Key
- Input: API Secret
- Input: Passphrase (optional)
- Checkbox: "Read-only access" (checked, disabled)
- "Help" link → Opens guide
- "Cancel" and "Connect" buttons

**B. Wallet Connect Flow:**
- Heading: "Connect Wallet"
- "Connect Wallet" button
- Show supported wallets (MetaMask, Trust, etc.)
- TODO: Integrate WalletConnect library

**C. CSV Upload Flow:**
- Heading: "Upload Transaction CSV"
- File dropzone (drag & drop)
- "Download Template" link
- File validation
- "Upload" button
- Progress bar during upload

**Data Source:**
- Use `useConnectionSources()` hook
- Filter by search query
- Filter by active tab (blockchain/exchange/wallet)

**Implementation Priority:**
1. Build modal shell with tabs
2. Implement grid view of sources
3. Build API key flow (most common)
4. Add CSV upload flow
5. Add WalletConnect (requires library)

---

### 3. ⭐ Priority: Form Generation Wizard

**Location:** Create `/components/features/forms/FormWizard.tsx`

**Requirements (from PRD Section 6.4 & 7.8):**

**7-Step Wizard:**

**Step 1: Verify Connections**
- List all connected sources with last sync time
- Warning if any source >7 days old
- "Resync All" button
- "Continue" button

**Step 2: Select Tax Year**
- Radio cards: 2023, 2024, 2025
- Show transaction count for each year
- Calculate P&L preview for each year

**Step 3: Select Tax Method**
- Radio cards with detailed descriptions:
  - FIFO (default, most common)
  - LIFO (minimize short-term gains)
  - HIFO (minimize total gains)
  - Specific ID (advanced, manual selection)
- Info tooltips explaining each method
- "Learn More" modals

**Step 4: Review Summary**
- Summary cards:
  - Total Capital Gains
  - Total Capital Losses
  - Net Gain/Loss
  - Transactions Included
- Short-term vs Long-term breakdown table
- "Edit" links to go back

**Step 5: Preview Forms**
- Tabs: Form 8949 | Schedule D
- Show mockup/preview images
- "Download Preview" button
- "Generate Forms" button (large, primary)

**Step 6: Generating... (Loading State)**
- Full-page loading with spinner
- Progress bar (fake progress 0→100%)
- Status messages:
  - "Calculating capital gains..."
  - "Generating Form 8949..."
  - "Generating Schedule D..."
  - "Finalizing documents..."
- Simulate 5-10 seconds

**Step 7: Success**
- Success icon/animation
- "Forms Generated!" heading
- Download buttons:
  - Form 8949 (PDF)
  - Schedule D (PDF)
  - Detailed CSV
- "Email Forms to Me" button
- "View in Documents" link
- "Back to Dashboard" button

**Implementation:**
```tsx
const steps = [
  'Verify Connections',
  'Tax Year',
  'Tax Method',
  'Review Summary',
  'Preview Forms',
  'Generating',
  'Success'
];

const [currentStep, setCurrentStep] = useState(0);
const [formData, setFormData] = useState({
  taxYear: 2024,
  taxMethod: 'FIFO',
  // ...
});
```

---

### 4. Tremor Charts Implementation

**Objective:** Replace chart placeholders with beautiful, interactive Tremor charts.

**Install:**
```bash
npm install @tremor/react
```

**Implement:**

#### A. Dashboard Portfolio Performance Chart
**Location:** `/components/features/dashboard/PnLChart.tsx`

**Requirements:**
- Line chart showing portfolio value over time
- Time range buttons: 1M, 3M, 6M, 1Y, YTD, All
- Fill area under line (gradient)
- Tooltip on hover showing exact values
- Y-axis: USD value
- X-axis: Date
- Height: 400px

**Mock Data Generation:**
```typescript
function generatePnLData(timeRange: string) {
  const dataPoints = [];
  const now = new Date();
  const ranges = {
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365,
    'YTD': daysSinceJan1(),
    'All': 730,
  };

  const days = ranges[timeRange];
  let value = 50000; // Starting value

  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - i));

    // Add some volatility
    value += (Math.random() - 0.5) * 5000;
    value = Math.max(value, 10000); // Floor

    dataPoints.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value),
    });
  }

  return dataPoints;
}
```

**Implementation:**
```tsx
import { AreaChart } from '@tremor/react';

export function PnLChart() {
  const [timeRange, setTimeRange] = useState('1Y');
  const data = generatePnLData(timeRange);

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
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <AreaChart
          data={data}
          index="date"
          categories={["value"]}
          colors={["blue"]}
          valueFormatter={(value) => `$${value.toLocaleString()}`}
          showLegend={false}
          showGridLines={true}
          yAxisWidth={80}
          className="h-80"
          curveType="natural"
        />
      </CardContent>
    </Card>
  );
}
```

**Reference:** https://www.tremor.so/docs/visualizations/area-chart

---

### 5. Infinite Scroll for Transactions

**Objective:** Implement infinite scroll using TanStack Virtual.

**Current State:** Shows first 50 transactions only.

**Requirements:**
- Load 50 transactions initially
- Auto-load next 50 as user scrolls to bottom
- Show loading indicator at bottom
- Smooth performance even with 600+ transactions

**Implementation:**
```bash
npm install @tanstack/react-virtual
```

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

export function TransactionTable({ transactions }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: transactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Row height
    overscan: 10,
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const transaction = transactions[virtualRow.index];
          return (
            <div
              key={transaction.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {/* Transaction row content */}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## 🎯 Phase 2: Comprehensive Improvements

### 1. Dark Mode Polish

**Current State:** Basic theme toggle exists, but many components don't look great in dark mode.

**Tasks:**
- Test EVERY page in dark mode
- Fix any contrast issues
- Add dark mode specific gradients
- Ensure all shadows work in dark mode
- Add smooth theme transition animations

**Use Tailwind dark: variants:**
```tsx
className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
```

---

### 2. Responsive Design (Desktop/Laptop Focus)

**Current State:** Desktop-first design, some responsive utilities.

**Tasks:**
- Test all pages at 1920px, 1440px, 1280px, 1024px
- Ensure sidebar collapses nicely on smaller screens
- Make tables horizontally scrollable on smaller screens
- Stack cards properly on medium screens
- Adjust font sizes for readability

**Breakpoints (Tailwind):**
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

---

### 3. Accessibility (WCAG 2.1 AA)

**Requirements from PRD Section 15:**

#### A. Keyboard Navigation
- All interactive elements must be keyboard accessible
- Visible focus rings (ring-2 ring-primary)
- Tab order follows visual order
- Escape closes all modals
- Arrow keys navigate lists
- Enter/Space activates buttons

#### B. Screen Reader Support
- Semantic HTML (use proper heading hierarchy)
- ARIA labels for icon-only buttons
- ARIA live regions for dynamic content (toasts)
- Alt text for all images

#### C. Color Contrast
- Run contrast checker on all text/background combos
- Minimum 4.5:1 ratio for body text
- Minimum 3:1 ratio for large text

**Tools:**
- Use axe DevTools extension
- Test with screen reader (VoiceOver on Mac)
- Run Lighthouse accessibility audit

---

### 4. Performance Optimization

#### A. Code Splitting
- Lazy load heavy components (charts, modals)
- Dynamic imports for rarely-used features
```tsx
const AddWalletModal = dynamic(() => import('@/components/features/wallets/AddWalletModal'), {
  loading: () => <LoadingSpinner />,
});
```

#### B. Image Optimization
- Use next/image for all images
- Optimize logo/icon sizes
- Lazy load images below fold

#### C. Bundle Analysis
```bash
npm run build
npx @next/bundle-analyzer
```
- Identify large dependencies
- Remove unused exports
- Tree-shake lodash/date-fns imports

#### D. React Query Optimization
- Set appropriate staleTime for each query
- Prefetch on hover for predictive loading
- Use query deduplication

---

### 5. Error Handling & Edge Cases

#### A. Network Errors
- Show retry button for failed requests
- Graceful degradation if API is down
- Offline indicator

#### B. Empty States
- No transactions: "Connect a wallet to import transactions"
- No forms: "Generate your first tax form"
- No sources: "Add your first wallet or exchange"

#### C. Error Boundaries
```tsx
// Create error boundary component
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

---

### 6. Form Validation & UX

#### A. Real-time Validation
- Show validation errors as user types
- Green checkmarks for valid fields
- Clear error messages

#### B. Form State Management
- Save draft state to localStorage
- "Unsaved changes" warning on navigation
- Auto-save indicators

#### C. Better Input Components
- Currency inputs with proper formatting
- Date pickers for date fields
- Searchable dropdowns for long lists (state selector)

---

### 7. Micro-improvements

#### A. Toast Notifications
- Success toasts for all mutations
- Error toasts with actionable messages
- Progress toasts for long operations
- Dismissible with X button

**Use sonner (already installed):**
```tsx
import { toast } from 'sonner';

toast.success('Transaction categorized!');
toast.error('Failed to sync wallet. Please try again.');
toast.loading('Generating forms...', { id: 'form-gen' });
toast.success('Forms generated!', { id: 'form-gen' });
```

#### B. Confirmations
- Add confirmation dialogs for destructive actions
- "Are you sure?" for disconnect wallet
- "Are you sure?" for delete account

#### C. Contextual Help
- Add "?" icons with tooltips
- "Learn more" links for complex features
- Inline help text for forms

---

## 📋 Implementation Checklist

Follow this order for maximum efficiency:

### Week 1: Core Components
- [ ] Read and understand PRD thoroughly
- [ ] Install Framer Motion
- [ ] Implement basic page transition animations
- [ ] Build Categorization Modal (complete)
- [ ] Build Add Wallet Modal (complete)
- [ ] Test both modals end-to-end

### Week 2: Charts & Visualizations
- [ ] Install and configure Tremor
- [ ] Implement Portfolio Performance Chart
- [ ] Generate realistic mock chart data
- [ ] Add interactive time range selection
- [ ] Polish chart styling and tooltips

### Week 3: Form Wizard
- [ ] Build Form Wizard shell with stepper
- [ ] Implement all 7 steps
- [ ] Add step validation
- [ ] Implement loading state with fake progress
- [ ] Build success screen
- [ ] Test entire wizard flow

### Week 4: UI Polish
- [ ] Add animations to all cards
- [ ] Implement hover effects
- [ ] Add micro-interactions to buttons
- [ ] Enhance loading states
- [ ] Polish empty states
- [ ] Add gradient effects

### Week 5: Performance & Optimization
- [ ] Implement infinite scroll for transactions
- [ ] Optimize bundle size
- [ ] Add code splitting
- [ ] Optimize images
- [ ] Test performance metrics

### Week 6: Dark Mode & Responsive
- [ ] Test all pages in dark mode
- [ ] Fix contrast issues
- [ ] Test all breakpoints
- [ ] Ensure mobile-friendly (even though desktop-first)
- [ ] Add smooth theme transitions

### Week 7: Accessibility & Testing
- [ ] Add keyboard navigation
- [ ] Implement ARIA labels
- [ ] Run accessibility audits
- [ ] Test with screen reader
- [ ] Fix all a11y issues

### Week 8: Final Polish
- [ ] Add toast notifications everywhere
- [ ] Implement confirmation dialogs
- [ ] Add contextual help
- [ ] Error handling for all edge cases
- [ ] Final QA pass
- [ ] Update documentation

---

## 🚨 Critical Rules

### DO:
✅ Read the PRD before every feature implementation
✅ Follow the exact design specifications (colors, spacing, typography)
✅ Test every feature in both light and dark mode
✅ Add TODO comments for backend integration points
✅ Use TanStack Query for all data fetching
✅ Use Zustand only for UI state
✅ Use React Hook Form + Zod for forms
✅ Follow shadcn/ui patterns for consistency
✅ Add loading states for all async operations
✅ Implement optimistic updates
✅ Write clear, descriptive component names
✅ Use TypeScript strict mode
✅ Keep components under 300 lines (split if larger)
✅ Test the build after major changes (`npm run build`)

### DON'T:
❌ Deviate from PRD specifications without reason
❌ Use different color schemes than specified
❌ Skip accessibility features
❌ Implement backend logic (frontend only!)
❌ Use class components (functional only)
❌ Ignore TypeScript errors
❌ Commit broken builds
❌ Remove existing TODO comments (add more if needed)
❌ Change the folder structure
❌ Install random dependencies without research

---

## 🎨 Design Philosophy

Follow these principles from the PRD:

1. **Professional & Modern:** The UI should feel like a Fortune 500 company built it
2. **Crypto-Native:** Use terminology and patterns crypto users expect
3. **Tax-Focused:** Everything serves the goal of accurate tax reporting
4. **Trust-Building:** Clear, honest communication about calculations
5. **Delightful:** Small animations and polish that make users smile
6. **Accessible:** Everyone should be able to use it
7. **Fast:** Instant feedback, optimistic updates, smooth animations
8. **Consistent:** Every button, card, and input follows the same patterns

---

## 🔍 Quality Checklist

Before marking any feature "complete," verify:

- [ ] Works in light AND dark mode
- [ ] Responsive on all desktop/laptop sizes
- [ ] Keyboard accessible
- [ ] Has proper loading states
- [ ] Has error states
- [ ] Has empty states
- [ ] Animations are smooth (60fps)
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Build passes (`npm run build`)
- [ ] Matches PRD specifications exactly
- [ ] Has proper ARIA labels
- [ ] Optimistic updates work
- [ ] Toast notifications show
- [ ] Can be navigated with keyboard only
- [ ] Screen reader friendly

---

## 📊 Success Metrics

You'll know Phase 2 is complete when:

1. ✅ All placeholder features are fully implemented
2. ✅ Every TODO comment in the codebase is resolved or documented
3. ✅ The UI has smooth animations on every interaction
4. ✅ Dark mode is pixel-perfect across all pages
5. ✅ Lighthouse scores: Performance >90, Accessibility 100, Best Practices 100
6. ✅ Build size is optimized (<200KB first load JS)
7. ✅ No console warnings or errors
8. ✅ All 18 pages are fully polished
9. ✅ The app feels faster and more responsive
10. ✅ You'd be proud to demo this to a VC

---

## 🚀 Getting Started

### Step 1: Environment Setup
```bash
cd /Users/jamesgoldbach/Coding/StateSpaceDesign/CoinTally/CoinTallyFrontEnd
npm install
npm run dev
```

### Step 2: Read Documentation
1. Open `/DOCS/PRODUCT-REQUIREMENTS-DOCUMENT.md`
2. Read sections 7-8 (Page & Component Specifications)
3. Understand the complete user flows (Section 6)

### Step 3: Find TODOs
```bash
grep -r "TODO" --include="*.ts" --include="*.tsx" | wc -l
# This shows how many TODO comments exist
```

### Step 4: Start with Categorization Modal
This is the highest priority feature. Start here:
1. Create `/components/features/transactions/CategorizationModal.tsx`
2. Follow PRD Section 6.3 and 8.2 exactly
3. Wire it up to transactions page
4. Test the full flow

### Step 5: Iterate and Polish
- Build → Test → Polish → Repeat
- Commit frequently with descriptive messages
- Test in both light/dark mode after each feature

---

## 💡 Pro Tips

### Animation Best Practices:
- Duration: 150-300ms for micro-interactions
- Easing: `ease-out` for entering, `ease-in` for exiting
- Spring animations for playful interactions
- Never block user input with animations

### Component Organization:
```
components/
  ui/           → Base components (shadcn)
  features/     → Feature-specific components
    transactions/
      CategorizationModal.tsx
      TransactionTable.tsx
      TransactionFilters.tsx
  layout/       → Layout components
```

### State Management:
- **TanStack Query:** Remote data (API calls)
- **Zustand:** UI state (sidebar collapsed, theme)
- **React Hook Form:** Form state
- **useState:** Local component state

### Performance:
- Memoize expensive calculations with `useMemo`
- Memoize callbacks with `useCallback`
- Virtualize long lists
- Lazy load heavy components
- Optimize images with next/image

---

## 🎯 Expected Outcome

After completing Phase 2, the CoinTally Frontend should be:

1. **Visually Stunning:** Every page is polished with smooth animations
2. **Feature Complete:** All core functionality works end-to-end
3. **Production Ready:** Could deploy to paying customers tomorrow
4. **Accessible:** WCAG 2.1 AA compliant
5. **Performant:** Lighthouse 90+ on all metrics
6. **Maintainable:** Clean code, well-organized, documented
7. **Delightful:** Users enjoy using it

The app should feel like a $50M Series B company built it, not a startup MVP.

---

## 📞 Questions?

If you encounter ambiguity:
1. Check the PRD first
2. Look at reference screenshots in `/assets/inspirationscreenshots/`
3. Follow shadcn/ui patterns for consistency
4. Make the decision that creates the best user experience
5. Document your decision in comments

---

## 🎉 Final Words

You have an excellent foundation to work with. The architecture is solid, the code is clean, and the mock data is comprehensive. Your job is to take it from "good MVP" to "holy shit this is amazing."

Focus on:
- ✨ Polish, polish, polish
- 🎯 Completing unfinished features
- 🚀 Performance and optimization
- ❤️ Delightful user experience

Make it so good that backend developers are excited to integrate with it.

**Now go build something incredible!** 🚀

---

**Document Version:** 2.0
**Last Updated:** October 29, 2025
**Status:** Ready for Agent Execution
