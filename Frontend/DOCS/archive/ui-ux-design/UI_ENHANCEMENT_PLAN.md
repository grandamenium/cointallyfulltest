# UI Enhancement Plan - CoinTally

**Generated:** 2025-11-17
**Total Tasks:** 48
**Estimated Implementation Time:** 52 hours
**Status:** Ready for Main Agent Orchestration

---

## 🎯 CRITICAL EXECUTION INSTRUCTIONS FOR MAIN AGENT

**⚠️ READ THIS CAREFULLY - THIS IS HOW YOU MUST WORK:**

### **YOUR ROLE: Main Orchestrator Agent**

You are the **MAIN AGENT** responsible for managing this entire UI enhancement plan. You will NOT implement the tasks yourself. Instead, you will:

1. **Create the TodoWrite list** with all 48 tasks from this document
2. **Launch specialized Task subagents** to complete each individual task
3. **Validate each subagent's work** when it completes
4. **Mark tasks complete** and move to the next one
5. **Continue until all 48 tasks are done**

### **🔄 EXECUTION WORKFLOW (FOLLOW EXACTLY):**

**Step 1: Initialize (Do Once at Start)**
- Read this entire document
- Use TodoWrite tool to create all 48 tasks with status "pending"
- Understand the full scope

**Step 2: For EACH Task (Repeat 48 times)**

```
FOR each task in the roadmap:

  A. UPDATE TODO STATUS
     - Mark current task as "in_progress" in TodoWrite

  B. LAUNCH TASK SUBAGENT
     - Use the Task tool to launch a specialized subagent
     - Provide the subagent with ONLY the relevant information for THIS task:
       * Task title and description
       * Implementation code/instructions
       * Files to create/modify
       * Testing steps
       * Success criteria
     - DO NOT give the subagent the entire roadmap
     - DO NOT tell the subagent about other tasks

  C. WAIT FOR SUBAGENT COMPLETION
     - The subagent will complete the task autonomously
     - The subagent will return its results to you

  D. VALIDATE SUBAGENT'S WORK
     - Review what the subagent did
     - Check files were created/modified correctly
     - Run tests if needed
     - Verify success criteria met

  E. RUN QUALITY CHECKS (CRITICAL - DO NOT SKIP)
     Run these commands in sequence and check for errors:

     1. Type Check:
        npm run type-check
        (or: npx tsc --noEmit)
        - Verify NO TypeScript errors
        - If errors found: Fix them before proceeding

     2. Lint Check:
        npm run lint
        - Verify NO linting errors
        - If errors found: Fix them before proceeding

     3. Build Test:
        npm run build
        - Verify build succeeds
        - If build fails: Fix errors before proceeding

     ⚠️ If ANY check fails:
        - DO NOT mark task complete
        - Fix the errors immediately
        - Re-run all checks until they pass
        - Only then proceed to step F

  F. MARK COMPLETE
     - Update TodoWrite: mark task as "completed"
     - Update checkbox in THIS document (DOCS/UI_ENHANCEMENT_PLAN.md)
     - Commit the changes with appropriate message

  G. MOVE TO NEXT TASK
     - Select next unchecked task
     - Repeat from step A

END FOR
```

### **📝 Example Subagent Prompt (Task 1.1):**

```
You are a specialized Task agent responsible for completing ONE specific task.

TASK: Create Animation Utility System

DESCRIPTION:
Set up the foundational animation utility classes and mixins that will be used throughout the application for consistent micro-interactions and transitions.

YOUR JOB:
1. Create /styles/animations.css with utility classes
2. Create /utils/animations.ts with animation helpers
3. Add Framer Motion if not already installed
4. Create animation configuration constants

IMPLEMENTATION:
Create the following animation utilities:

/styles/animations.css:
```css
/* Button Animations */
.btn-press {
  transition: transform 150ms ease-out;
}
.btn-press:active {
  transform: scale(0.98);
}

.btn-hover-lift {
  transition: transform 200ms ease-out, box-shadow 200ms ease-out;
}
.btn-hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Card Animations */
.card-hover {
  transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1);
}
.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

/* Fade Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Pulse Animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Spinner */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Utility Classes */
.animate-fade-in {
  animation: fadeIn 400ms ease-out;
}

.animate-fade-in-up {
  animation: fadeInUp 400ms cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-slide-in-right {
  animation: slideInRight 350ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

/utils/animations.ts:
```typescript
// Animation timing constants
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 200,
  slow: 300,
  slower: 400,
  slowest: 500,
} as const;

// Easing functions
export const EASING = {
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  decelerate: 'cubic-bezier(0, 0, 0, 1)',
  sharp: 'cubic-bezier(0.4, 0, 1, 1)',
} as const;

// Framer Motion variants
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

export const slideUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

export const staggerChildren = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};
```

TESTING:
1. Import animations.css in your global styles
2. Test a button with .btn-press class - should scale down on click
3. Test a card with .card-hover class - should lift on hover
4. Verify animations respect prefers-reduced-motion

SUCCESS CRITERIA:
- Animation utility files created
- CSS classes work as expected
- TypeScript utilities export correctly
- No console errors
- Animations smooth at 60fps

REPORT BACK:
When complete, tell me:
- What files you created
- Test results
- Any issues encountered
```

### **🚨 CRITICAL RULES:**

1. **ONE TASK AT A TIME**: Never launch multiple Task subagents simultaneously for this roadmap
2. **VALIDATE BEFORE MOVING ON**: Always check the subagent's work before marking complete
3. **RUN QUALITY CHECKS AFTER EVERY TASK**: Run type-check, lint, and build after each task completes
4. **FIX ERRORS IMMEDIATELY**: If any check fails, fix errors before marking task complete
5. **MAINTAIN TODO LIST**: Keep TodoWrite updated at all times
6. **UPDATE CHECKBOXES**: Check off boxes in this document as you go
7. **SEQUENTIAL ORDER**: Complete tasks in the exact order listed (1, 2, 3, etc.)
8. **COMMIT FREQUENTLY**: Commit after each completed task (only after all checks pass)
9. **SAVE PROGRESS**: If interrupted, your TodoWrite and checkboxes allow resuming

### **🎯 Your Success Metrics:**

- ✅ All 48 TodoWrite items created
- ✅ All 48 Task subagents launched and completed
- ✅ All 48 checkboxes marked in this document
- ✅ All 48 commits pushed
- ✅ Final validation testing passed
- ✅ All animations working at 60fps
- ✅ All mascot images optimized and lazy-loaded
- ✅ Core Web Vitals within targets (LCP < 2.5s)

### **🔧 When You Start:**

```typescript
// Step 1: Create TodoWrite with all 48 tasks
await createTodoList([
  { content: "Task 1 - Create Animation Utility System", status: "pending", activeForm: "Creating animation utilities" },
  { content: "Task 2 - Set up Mascot Image Optimization", status: "pending", activeForm: "Optimizing mascot images" },
  // ... all 48 tasks
]);

// Step 2: Start with Task 1
await markTaskInProgress("Task 1");
await launchTaskSubagent({
  taskNumber: 1,
  taskTitle: "Create Animation Utility System",
  // ... all relevant context
});

// Step 3: When subagent completes, validate
await validateTask(1);

// Step 4: Run quality checks (CRITICAL)
await runCommand("npm run type-check"); // Must pass
await runCommand("npm run lint");       // Must pass
await runCommand("npm run build");      // Must pass

// Step 5: If all checks pass, mark done
await markTaskComplete(1);
await updateCheckbox(1);
await commitChanges("feat: add animation utility system");

// Step 6: Move to Task 2
// Repeat...
```

---

## 📋 UI Enhancement Task List

### **PHASE 1: Foundation (12 hours, 6 tasks)**

#### Task 1: Create Animation Utility System
**Time:** 2 hours
**Description:** Set up foundational CSS and TypeScript animation utilities for consistent micro-interactions throughout the app.

**Files to Create:**
- `/styles/animations.css`
- `/utils/animations.ts`

**Implementation:**
Create animation utility classes including:
- Button animations (press, hover-lift)
- Card animations (hover effects)
- Fade animations (fadeIn, fadeInUp, slideInRight)
- Pulse and spin animations
- Framer Motion variants (fadeIn, slideUp, scaleIn, stagger)
- Animation timing constants
- Easing function constants
- Reduced motion media query support

**Testing:**
1. Import animations.css in global styles
2. Test button press animation
3. Test card hover effect
4. Verify reduced-motion preference works
5. Check animations run at 60fps

**Success Criteria:**
- [ ] Animation CSS file created with all utility classes
- [ ] TypeScript utilities export animation constants
- [ ] Animations work smoothly in browser
- [ ] Reduced motion support working
- [ ] No TypeScript or lint errors

---

#### Task 2: Set up Mascot Image Optimization Pipeline
**Time:** 2 hours
**Description:** Optimize all 10 mascot images (convert to WebP, create responsive sizes, set up lazy loading).

**Files to Create:**
- `/public/mascot/optimized/` (directory)
- `/components/ui/MascotImage.tsx`
- `/scripts/optimize-mascots.js`

**Implementation:**
1. Create optimization script to convert PNG to WebP
2. Generate 3 sizes for each mascot: 150px, 200px, 300px
3. Create MascotImage component with lazy loading
4. Set up blur placeholder technique
5. Optimize all 10 mascot images

**Mascot Files:**
- mascot-arrested-by-irs.png
- mascot-at-desk-analyzing-charts.png
- mascot-holding-bitcoin.png
- mascot-sitting-on-money.png
- mascot-standing.png
- mascot-stressed-panicking.png
- mascot-with-cigar-on-money.png
- mascot-with-coin-symbol.png
- mascot-with-headphones-cigar-money.png
- mascot-with-large-bitcoin.png

**Testing:**
1. Run optimization script
2. Verify WebP files created in /optimized/
3. Test MascotImage component renders correctly
4. Check lazy loading works (use Network tab)
5. Verify file sizes reduced significantly

**Success Criteria:**
- [ ] All mascot images converted to WebP
- [ ] Responsive sizes generated (150px, 200px, 300px)
- [ ] MascotImage component created with lazy loading
- [ ] Total mascot bundle size < 300KB
- [ ] Images load only when needed

---

#### Task 3: Create Base Custom Components Library
**Time:** 4 hours
**Description:** Implement foundational custom components that will be used across multiple pages.

**Files to Create:**
- `/components/ui/AnimatedCard.tsx`
- `/components/ui/InteractiveStatCard.tsx`
- `/components/ui/ToastNotificationSystem.tsx`
- `/components/ui/LoadingSkeleton.tsx`

**Implementation:**

**AnimatedCard.tsx:**
```typescript
interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: 'lift' | 'scale' | 'glow';
  onClick?: () => void;
}

// Features:
// - Hover: translateY(-4px) with shadow expansion (250ms)
// - Optional click handler
// - Customizable hover effects
// - Smooth transitions
```

**InteractiveStatCard.tsx:**
```typescript
interface InteractiveStatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  onClick?: () => void;
}

// Features:
// - CountUp animation for numbers
// - Color-coded trend indicators
// - Icon with optional pulse
// - Hover lift effect
```

**ToastNotificationSystem.tsx:**
```typescript
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  mascot?: string; // Path to mascot image
  duration?: number;
  position?: 'top-right' | 'bottom-right' | 'top-center';
}

// Features:
// - Slide-in animation (350ms cubic-bezier)
// - Auto-dismiss with progress bar
// - Manual dismiss button
// - Optional mascot integration
// - Stack multiple toasts
```

**LoadingSkeleton.tsx:**
```typescript
interface LoadingSkeletonProps {
  variant: 'text' | 'card' | 'circle' | 'stat' | 'table-row';
  count?: number;
  className?: string;
}

// Features:
// - Shimmer animation (1500ms infinite)
// - Multiple variants for different content types
// - Dark mode support
// - GPU-accelerated animation
```

**Testing:**
1. Create Storybook stories for each component
2. Test AnimatedCard hover effects
3. Test InteractiveStatCard CountUp animation
4. Test ToastNotificationSystem with different types
5. Test LoadingSkeleton variants

**Success Criteria:**
- [ ] All 4 components created with TypeScript
- [ ] Props interfaces properly typed
- [ ] Animations work smoothly
- [ ] Components are reusable and customizable
- [ ] No accessibility issues

---

#### Task 4: Implement Microinteraction CSS Library
**Time:** 2 hours
**Description:** Create a comprehensive set of CSS utility classes for button states, hover effects, and transitions.

**Files to Create:**
- `/styles/microinteractions.css`

**Implementation:**
Create CSS classes for:

**Button States:**
- `.btn-hover-lift` - Lift on hover (200ms ease-out)
- `.btn-hover-glow` - Border glow on hover
- `.btn-press` - Scale down on active (150ms)
- `.btn-disabled` - Faded disabled state

**Hover Effects:**
- `.hover-scale` - Scale 1.05 on hover
- `.hover-brighten` - Brightness increase
- `.hover-border-shift` - Border color transition
- `.hover-shadow-grow` - Shadow expansion

**Transition Utilities:**
- `.transition-fast` - 150ms transitions
- `.transition-normal` - 200ms transitions
- `.transition-slow` - 300ms transitions
- `.transition-colors` - Color-only transitions
- `.transition-transform` - Transform-only transitions

**Special Effects:**
- `.ripple-effect` - Click ripple animation
- `.shake` - Error shake animation
- `.bounce-in` - Entrance bounce
- `.slide-up` - Slide up entrance

**Testing:**
1. Apply classes to various elements
2. Test hover effects work correctly
3. Verify transitions are smooth
4. Check mobile touch interactions
5. Test in different browsers

**Success Criteria:**
- [ ] Microinteraction CSS file created
- [ ] All utility classes work as expected
- [ ] Smooth 60fps animations
- [ ] Works on mobile and desktop
- [ ] No layout shift or jank

---

#### Task 5: Create Color Gradient System
**Time:** 1 hour
**Description:** Define color gradients and CSS variables for consistent color usage across the app.

**Files to Create:**
- `/styles/gradients.css`
- Update `/tailwind.config.js` with gradient utilities

**Implementation:**

**gradients.css:**
```css
:root {
  /* Gradient Definitions */
  --gradient-primary: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%);
  --gradient-success: linear-gradient(135deg, #10b981 0%, #059669 100%);
  --gradient-gains: linear-gradient(135deg, #34d399 0%, #10b981 100%);
  --gradient-losses: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
  --gradient-warning: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  --gradient-premium: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  --gradient-neutral: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
}

/* Gradient Background Classes */
.bg-gradient-primary {
  background: var(--gradient-primary);
}

.bg-gradient-success {
  background: var(--gradient-success);
}

/* Gradient Border Classes */
.border-gradient-primary {
  border-image: var(--gradient-primary) 1;
}

/* Gradient Text Classes */
.text-gradient-primary {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

**Tailwind Config Updates:**
Add gradient utilities to extend theme

**Testing:**
1. Apply gradient backgrounds to elements
2. Test gradient borders
3. Test gradient text
4. Verify dark mode compatibility
5. Check browser support

**Success Criteria:**
- [ ] Gradient CSS variables defined
- [ ] Utility classes created
- [ ] Tailwind config updated
- [ ] Gradients render correctly in all browsers
- [ ] Dark mode support working

---

#### Task 6: Set up Typography Scale
**Time:** 1 hour
**Description:** Define typography scale with font weights, sizes, and special use cases.

**Files to Update:**
- `/tailwind.config.js`
- `/styles/typography.css`

**Implementation:**

**Typography CSS:**
```css
/* Font Weight Utilities */
.font-light { font-weight: 300; }
.font-regular { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.font-extrabold { font-weight: 800; }

/* Monospace for Technical Data */
.font-mono-address {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
}

/* Tabular Numbers */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

/* Letter Spacing */
.tracking-tight-headings {
  letter-spacing: -0.02em;
}

.tracking-wide-labels {
  letter-spacing: 0.05em;
}

/* Line Heights */
.leading-relaxed-body {
  line-height: 1.7;
}
```

**Tailwind Config:**
Extend font sizes with specific use cases

**Testing:**
1. Apply font weights to headings
2. Test monospace on addresses
3. Verify tabular-nums align numbers
4. Check line heights for readability
5. Test responsive sizing

**Success Criteria:**
- [ ] Typography scale defined
- [ ] Font weight utilities working
- [ ] Monospace properly applied
- [ ] Tabular numbers align correctly
- [ ] Line heights improve readability

---

### **PHASE 2: Dashboard & Core Pages (16 hours, 15 tasks)**

#### Task 7: Dashboard - Animated Stat Cards
**Time:** 2 hours
**Description:** Enhance the 4 stat cards (P&L, Capital Gains, Capital Losses, Tax Liability) with CountUp animations and hover effects.

**Files to Modify:**
- `/app/dashboard/page.tsx`

**Implementation:**
1. Install `react-countup` if not present
2. Wrap stat values in CountUp component
3. Add AnimatedCard wrapper to each stat
4. Implement hover lift effect (translateY -4px, 250ms)
5. Add color-coded borders based on value (green/red)
6. Add icon pulse animation on value change

**Code Example:**
```typescript
import CountUp from 'react-countup';
import { AnimatedCard } from '@/components/ui/AnimatedCard';

<AnimatedCard hoverEffect="lift">
  <div className="stat-card border-l-4 border-green-500">
    <h3>Total P&L</h3>
    <CountUp
      end={32900.50}
      duration={1.2}
      decimals={2}
      prefix="$"
      className="text-4xl font-extrabold tabular-nums"
    />
    <p className="text-sm text-gray-500">
      ↑ <CountUp end={32900.5} duration={1} /> vs last year
    </p>
  </div>
</AnimatedCard>
```

**Testing:**
1. Navigate to /dashboard
2. Verify CountUp animations play on page load
3. Test hover lift effect on each card
4. Check color-coded borders (green for gains, red for losses)
5. Verify animations smooth at 60fps

**Success Criteria:**
- [ ] All 4 stat cards have CountUp animations
- [ ] Hover effects work smoothly
- [ ] Color coding applied correctly
- [ ] No layout shift during animation
- [ ] Performance remains good

---

#### Task 8: Dashboard - Completion Progress Ring
**Time:** 1 hour
**Description:** Replace linear progress indicator with animated circular progress ring showing categorization completion (83%).

**Files to Create:**
- `/components/ui/ProgressRing.tsx`

**Files to Modify:**
- `/app/dashboard/page.tsx`

**Implementation:**
Create ProgressRing component with:
- Circular SVG progress indicator
- Animated stroke-dashoffset (1500ms ease-out)
- Color transitions: red (0-30%) → yellow (31-70%) → green (71-100%)
- CountUp animation for percentage text
- Optional confetti burst at 100%

**Code Example:**
```typescript
interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

// Use stroke-dasharray and stroke-dashoffset for animation
// Calculate circumference: 2 * Math.PI * radius
// Animate offset from circumference to (circumference * (100 - percentage) / 100)
```

**Testing:**
1. Replace linear progress with ProgressRing
2. Test animation on mount
3. Verify color transitions at different percentages
4. Test with values: 0%, 30%, 50%, 83%, 100%
5. Check confetti effect at 100%

**Success Criteria:**
- [ ] ProgressRing component created
- [ ] Circular animation smooth
- [ ] Colors transition correctly
- [ ] Percentage text animates
- [ ] Integrated into dashboard

---

#### Task 9: Dashboard - Interactive Portfolio Chart
**Time:** 1.5 hours
**Description:** Enhance the portfolio performance chart with hover tooltips, smooth transitions, and interactive time period selector.

**Files to Modify:**
- `/app/dashboard/page.tsx` (chart section)

**Implementation:**
1. Add hover crosshair animation (200ms fade-in)
2. Implement tooltip with coin/date/value on data point hover
3. Add time period button group with slide indicator
4. Animate indicator slide (300ms ease-out) on period change
5. Smooth chart data transitions on period change

**Enhancements:**
- Gradient fill with opacity transitions
- Data point pulse effect on hover
- Crosshair follows cursor
- Tooltip position adjusts to stay on screen

**Testing:**
1. Hover over chart - verify crosshair and tooltip appear
2. Click different time periods (1M, 3M, 6M, 1Y, YTD, All)
3. Verify slide indicator animates to active button
4. Test chart data transitions smoothly
5. Check tooltip positioning edge cases

**Success Criteria:**
- [ ] Hover interactions working
- [ ] Tooltip displays correct data
- [ ] Time period selector animates
- [ ] Chart transitions smooth
- [ ] No performance issues

---

#### Task 10: Dashboard - Connected Sources Card Grid
**Time:** 1.5 hours
**Description:** Enhance wallet/source cards with staggered entrance animations, hover effects, and improved status indicators.

**Files to Modify:**
- `/app/dashboard/page.tsx` (connected sources section)

**Implementation:**
1. Wrap cards in Framer Motion with stagger animation
2. Add entrance delay (100ms between cards)
3. Implement hover: scale(1.02) + border glow (250ms)
4. Add pulsing animation to "needs sync" badges
5. Animate resync button rotation on click (360deg, 500ms)
6. Add success checkmark animation after sync completes

**Code Example:**
```typescript
import { motion } from 'framer-motion';

<motion.div
  variants={staggerChildren}
  initial="hidden"
  animate="visible"
>
  {sources.map((source, index) => (
    <motion.div
      key={source.id}
      variants={slideUpVariants}
      custom={index}
      className="source-card hover:scale-102"
    >
      {/* Card content */}
    </motion.div>
  ))}
</motion.div>
```

**Testing:**
1. Reload dashboard - verify cards stagger in
2. Hover cards - check scale and glow effect
3. Click resync - verify icon rotates
4. Check "needs sync" badge pulses
5. Test with different numbers of sources

**Success Criteria:**
- [ ] Staggered entrance animations work
- [ ] Hover effects smooth
- [ ] Resync animation functional
- [ ] Status badges animate correctly
- [ ] Works with 1-20+ sources

---

#### Task 11: Dashboard - Mascot Integration (3 placements)
**Time:** 1 hour
**Description:** Integrate mascot images into dashboard for welcome modal, alert toast, and achievement toast.

**Files to Create:**
- `/components/ui/MascotModal.tsx`
- `/components/ui/MascotToast.tsx`

**Files to Modify:**
- `/app/dashboard/page.tsx`

**Implementation:**

**1. Welcome Modal (first visit):**
- Mascot: `mascot-at-desk-analyzing-charts.png`
- Trigger: `localStorage.getItem('hasVisitedDashboard') === null`
- Modal: Center screen, fade-in (400ms)
- Message: "Welcome! Let's set up your crypto tax calculations"
- Button: "Got it" → sets localStorage flag

**2. Uncategorized Transactions Toast:**
- Mascot: `mascot-stressed-panicking.png`
- Trigger: `uncategorizedCount > 50`
- Toast: Top-right, slide-in (350ms)
- Message: "Yikes! You have {count} transactions to categorize!"
- Auto-dismiss: 6s
- Button: "Let's fix this!" → navigate to /transactions

**3. P&L Achievement Toast:**
- Mascot: `mascot-sitting-on-money.png`
- Trigger: P&L crosses $25k, $50k, or $100k milestone
- Toast: Bottom-right, bounce-in (600ms)
- Message: "Nice! Your portfolio is looking great!"
- Auto-dismiss: 5s

**Testing:**
1. Clear localStorage - verify welcome modal appears
2. Test with >50 uncategorized - verify alert toast
3. Test achievement toast (mock P&L value)
4. Verify mascot images load lazily
5. Check auto-dismiss timers

**Success Criteria:**
- [ ] MascotModal component created
- [ ] MascotToast component created
- [ ] All 3 mascots integrated
- [ ] Triggers work correctly
- [ ] Images lazy load

---

#### Task 12: Transactions - Smart Search with Autocomplete
**Time:** 2 hours
**Description:** Build enhanced search input with autocomplete dropdown, recent searches, and keyboard navigation.

**Files to Create:**
- `/components/transactions/SmartSearch.tsx`

**Files to Modify:**
- `/app/transactions/page.tsx`

**Implementation:**
Create SmartSearch component with:
1. Debounced input (300ms)
2. Autocomplete dropdown (fade-in 200ms)
3. Recent searches section (stored in localStorage)
4. Highlight matching text in results
5. Keyboard navigation (arrow keys, enter)
6. Search icon animation on focus (200ms)

**Features:**
- Auto-suggest based on assets, sources, categories
- Show recent 5 searches
- Clear individual recent searches
- Focus state with border glow
- Empty state message

**Testing:**
1. Type in search - verify debouncing works
2. Test autocomplete suggestions appear
3. Use arrow keys to navigate suggestions
4. Press Enter to select
5. Verify recent searches persist
6. Test clear functionality

**Success Criteria:**
- [ ] SmartSearch component created
- [ ] Debouncing working (300ms)
- [ ] Autocomplete functional
- [ ] Keyboard navigation works
- [ ] Recent searches persist

---

#### Task 13: Transactions - Category Quick Picker
**Time:** 1.5 hours
**Description:** Build inline category picker for quick transaction categorization with auto-save.

**Files to Create:**
- `/components/transactions/CategoryQuickPicker.tsx`

**Files to Modify:**
- `/app/transactions/page.tsx`

**Implementation:**
Create inline category picker:
1. Click "Edit" button → dropdown appears in table row
2. Show common categories first (Personal, Business, Income)
3. "More" button expands to show all categories
4. Auto-save on selection (optimistic update)
5. Success animation (checkmark, 500ms)
6. Rollback on error with error toast

**UI:**
- Dropdown positioned below Edit button
- Category icons with colors
- Search within categories
- Recently used categories section

**Testing:**
1. Click Edit on transaction row
2. Verify dropdown appears
3. Select category - check auto-save
4. Test optimistic update (instant UI update)
5. Mock error - verify rollback
6. Test with keyboard

**Success Criteria:**
- [ ] CategoryQuickPicker component created
- [ ] Inline dropdown working
- [ ] Auto-save functional
- [ ] Optimistic updates working
- [ ] Error handling with rollback

---

#### Task 14: Transactions - Bulk Action Toolbar
**Time:** 1 hour
**Description:** Implement multi-select checkboxes and bulk action toolbar for transactions.

**Files to Create:**
- `/components/transactions/BulkActionBar.tsx`

**Files to Modify:**
- `/app/transactions/page.tsx`

**Implementation:**
1. Add checkbox column to transaction table
2. Implement select all checkbox in header
3. Track selected transactions in state
4. Show slide-down toolbar when items selected (400ms)
5. Toolbar actions: Categorize, Export, Delete
6. Show selected item count
7. Clear selection button

**Toolbar Features:**
- Slide down from top (400ms ease-out)
- Background: gradient-primary
- Actions: Bulk categorize modal, Export CSV, Delete confirmation
- Animation: Scale in when appearing

**Testing:**
1. Select individual transactions
2. Test select all checkbox
3. Verify toolbar slides down
4. Test bulk categorize
5. Test export selected
6. Test delete with confirmation

**Success Criteria:**
- [ ] Checkboxes added to table
- [ ] Select all working
- [ ] Toolbar slides down smoothly
- [ ] Bulk actions functional
- [ ] Item count accurate

---

#### Task 15: Transactions - Mascot Integration (2 placements)
**Time:** 0.5 hours
**Description:** Add mascot toasts for uncategorized transaction warning and bulk categorization success.

**Files to Modify:**
- `/app/transactions/page.tsx`

**Implementation:**

**1. Uncategorized Warning Modal:**
- Mascot: `mascot-stressed-panicking.png`
- Trigger: Page load with >50 uncategorized transactions
- Modal: Center, fade-in (300ms)
- Message: "Let's tackle these together! Want help categorizing?"
- Buttons: "Auto-categorize similar", "I'll do it manually"
- Auto-dismiss: 8s or on button click

**2. Bulk Success Toast:**
- Mascot: `mascot-at-desk-analyzing-charts.png`
- Trigger: After bulk categorizing >10 transactions
- Toast: Bottom-right, slide-in (350ms)
- Message: "Nice work! {count} transactions categorized!"
- Auto-dismiss: 4s

**Testing:**
1. Load page with many uncategorized - verify modal
2. Bulk categorize 10+ items - verify success toast
3. Test auto-dismiss timers
4. Verify mascot images load

**Success Criteria:**
- [ ] Warning modal appears correctly
- [ ] Success toast shows after bulk action
- [ ] Mascot images display
- [ ] Auto-dismiss working

---

#### Task 16: Wallets - Enhanced Source Cards
**Time:** 2 hours
**Description:** Enhance connected source cards with hover effects, status animations, and improved interactions.

**Files to Modify:**
- `/app/wallets/page.tsx`

**Implementation:**
1. Wrap cards in AnimatedCard component
2. Add hover: translateY(-6px) + shadow grow (300ms)
3. Implement pulsing "needs sync" badge (2s infinite)
4. Add gradient borders based on source type (blockchain/exchange/wallet)
5. Animate transaction count with CountUp
6. Add relative time tooltip on "Last synced"

**Source Type Colors:**
- Blockchain: Blue gradient
- Exchange: Purple gradient
- Wallet: Green gradient

**Status Badge Animations:**
- Connected: Static green
- Needs Sync: Pulsing red (opacity 1 → 0.5)
- Syncing: Blue with spinner

**Testing:**
1. Hover wallet cards - verify lift effect
2. Check status badge animations
3. Test gradient borders by type
4. Verify transaction CountUp
5. Hover "Last synced" - check tooltip

**Success Criteria:**
- [ ] Cards have hover animations
- [ ] Status badges animate correctly
- [ ] Gradient borders by type
- [ ] CountUp working on transaction count
- [ ] Tooltips functional

---

#### Task 17: Wallets - Add Source Modal
**Time:** 1.5 hours
**Description:** Build animated modal for adding new wallet/exchange connections with source grid and search.

**Files to Create:**
- `/components/wallets/AddSourceModal.tsx`

**Implementation:**
Create modal with:
1. Modal entrance: scale(0.95) to scale(1) + fade (300ms)
2. Grid of available sources with icons
3. Search filter (debounced 300ms)
4. Hover: scale(1.05) + border glow on source cards
5. Click source → connection flow wizard
6. Exit: scale(0.98) + fade-out (200ms)

**Sources to Include:**
- Blockchains: Ethereum, Bitcoin, Solana, Polygon, etc.
- Exchanges: Coinbase, Binance, Kraken, Gemini, etc.
- Wallets: MetaMask, Ledger, Trust Wallet, etc.

**Testing:**
1. Click "Add New Source" button
2. Verify modal animates in
3. Test search filter
4. Hover source cards - check animation
5. Test modal close animation

**Success Criteria:**
- [ ] AddSourceModal component created
- [ ] Modal animations smooth
- [ ] Search filter working
- [ ] Source grid displays correctly
- [ ] Connection flow initiated

---

#### Task 18: Wallets - Mascot Integration (3 placements)
**Time:** 1 hour
**Description:** Add mascot for empty state, sync error toast, and success toast.

**Files to Modify:**
- `/app/wallets/page.tsx`

**Implementation:**

**1. Empty State:**
- Mascot: `mascot-holding-bitcoin.png`
- Trigger: `sources.length === 0`
- Position: Center of page
- Message: "Connect your first wallet to get started!"
- Button: "Add Wallet" → opens AddSourceModal
- Animation: Gentle float (2s ease-in-out infinite)

**2. Sync Error Toast:**
- Mascot: `mascot-stressed-panicking.png`
- Trigger: Wallet sync fails
- Toast: Top-right, slide-in (350ms)
- Message: "Oops! We couldn't sync {walletName}. Try again?"
- Buttons: "Retry", "Dismiss"
- Manual dismiss only

**3. All Synced Success Toast:**
- Mascot: `mascot-sitting-on-money.png`
- Trigger: All wallets successfully synced
- Toast: Bottom-right, bounce-in (600ms)
- Message: "All wallets up to date! 🎉"
- Auto-dismiss: 4s

**Testing:**
1. Empty state - verify mascot and message
2. Mock sync error - verify error toast
3. Sync all wallets - verify success toast
4. Check mascot images load
5. Test animations smooth

**Success Criteria:**
- [ ] Empty state with mascot
- [ ] Error toast functional
- [ ] Success toast appears correctly
- [ ] All mascots display properly
- [ ] Animations work

---

### **PHASE 3: Forms & Workflows (14 hours, 12 tasks)**

#### Task 19: Onboarding - Animated Stepper Component
**Time:** 1.5 hours
**Description:** Build animated stepper for onboarding wizard with step completion animations.

**Files to Create:**
- `/components/onboarding/AnimatedStepper.tsx`

**Implementation:**
Create stepper with:
1. Horizontal step indicators (6 steps)
2. Completed steps: Green checkmark with slide-in (400ms bounce)
3. Current step: Pulsing border animation (2s infinite)
4. Future steps: Grayscale, disabled
5. Progress line animates left to right (500ms cubic-bezier)
6. Mobile: Collapse to dots with progress bar

**Step States:**
- Completed: Green circle with checkmark icon
- Current: Blue circle with number, pulsing
- Future: Gray circle with number, disabled

**Testing:**
1. Navigate through onboarding steps
2. Verify checkmarks appear on completion
3. Test progress line animation
4. Check mobile responsive view
5. Test step click (go to previous step)

**Success Criteria:**
- [ ] AnimatedStepper component created
- [ ] Step animations working
- [ ] Progress line animates
- [ ] Mobile view functional
- [ ] Step navigation works

---

#### Task 20: Onboarding - Welcome Hero Enhancement
**Time:** 1 hour
**Description:** Enhance welcome screen (Step 1) with animated title, mascot, and CTA button.

**Files to Modify:**
- `/app/onboarding/page.tsx`

**Implementation:**
1. Character-by-character title fade-in (stagger 50ms)
2. Subtitle fade-up (400ms delay)
3. Mascot image slide-up from bottom (600ms)
4. "Get Started" button pulse every 2s
5. Gradient background (very subtle)

**Mascot:**
- Image: `mascot-with-large-bitcoin.png`
- Position: Center, above text
- Size: 200px
- Animation: Gentle float (2s ease-in-out infinite)

**Testing:**
1. Load onboarding page
2. Verify title animates character-by-character
3. Check mascot slides up
4. Verify button pulse
5. Test click "Get Started"

**Success Criteria:**
- [ ] Title animation working
- [ ] Mascot displays and animates
- [ ] Button pulse effect functional
- [ ] Gradient background subtle
- [ ] Navigation to step 2 works

---

#### Task 21: Onboarding - Form Field Enhancements
**Time:** 1 hour
**Description:** Enhance form fields across all onboarding steps with focus animations, validation, and error states.

**Files to Modify:**
- `/app/onboarding/page.tsx` (all step forms)

**Implementation:**
1. Label lift on focus (200ms translateY -2px)
2. Input border glow on focus (300ms)
3. Error shake animation (400ms, 3 oscillations)
4. Success checkmark animation (500ms)
5. Dropdown chevron rotate on open (200ms)

**Field Types:**
- Tax Year dropdown
- State dropdown
- Filing Status dropdown
- Income input (number)
- Prior Losses input (number)

**Validation:**
- Real-time validation on blur
- Show error message below field
- Red border for errors
- Green border + checkmark for valid

**Testing:**
1. Focus inputs - verify label lift and border glow
2. Enter invalid data - check error shake
3. Enter valid data - check success checkmark
4. Test dropdown interactions
5. Verify keyboard navigation

**Success Criteria:**
- [ ] Focus animations working
- [ ] Validation functional
- [ ] Error shake animation smooth
- [ ] Success states display correctly
- [ ] Dropdowns animate

---

#### Task 22: Onboarding - Mascot Integration (2 placements)
**Time:** 0.5 hours
**Description:** Integrate mascots for welcome screen and completion celebration.

**Files to Modify:**
- `/app/onboarding/page.tsx`

**Implementation:**

**1. Welcome Screen (already handled in Task 20):**
- Mascot: `mascot-with-large-bitcoin.png`
- See Task 20 for details

**2. Completion Celebration:**
- Mascot: `mascot-standing.png`
- Trigger: Final step (Prior Losses) submitted
- Modal: Center, fade-in (400ms)
- Animation: Confetti burst + mascot bounce-in (600ms)
- Message: "All set! Let's calculate your taxes!"
- Button: "Go to Dashboard" → navigate to /dashboard

**Testing:**
1. Complete all onboarding steps
2. Verify celebration modal appears
3. Check confetti effect
4. Test mascot bounce animation
5. Verify navigation to dashboard

**Success Criteria:**
- [ ] Welcome mascot integrated (Task 20)
- [ ] Completion modal created
- [ ] Confetti effect working
- [ ] Mascot bounce animation smooth
- [ ] Navigation functional

---

#### Task 23: New Form Wizard - Enhanced Stepper
**Time:** 2 hours
**Description:** Build enhanced wizard stepper for 7-step form generation process.

**Files to Create:**
- `/components/new-form/WizardStepper.tsx`

**Files to Modify:**
- `/app/new-form/page.tsx`

**Implementation:**
Create 7-step wizard stepper:
1. Steps: Connections, Tax Year, Method, Review, Preview, Generating, Success
2. Active step: Pulsing border + icon animation
3. Completed steps: Green checkmark slide-in (400ms)
4. Step numbers scale on completion (bounce effect)
5. Connecting lines animate as steps complete (400ms)
6. Mobile: Collapse to current step + progress dots

**Step Indicators:**
- Numbered circles (1-7)
- Step labels below
- Connecting lines between steps
- Active step highlighted

**Testing:**
1. Navigate through wizard steps
2. Verify step animations
3. Test connecting line animations
4. Check mobile responsive view
5. Test going back to previous steps

**Success Criteria:**
- [ ] WizardStepper component created
- [ ] 7 steps display correctly
- [ ] Animations smooth
- [ ] Mobile view functional
- [ ] Navigation works

---

#### Task 24: New Form - Source Verification Cards
**Time:** 1.5 hours
**Description:** Enhance source verification cards (Step 1) with status indicators and sync animations.

**Files to Modify:**
- `/app/new-form/page.tsx` (Step 1)

**Implementation:**
1. Add animated status indicators
2. "Needs Sync" badge with pulse (2s infinite)
3. Resync button: loading spinner during sync
4. Success state: green checkmark animation (500ms)
5. "Resync All" button: all icons rotate simultaneously
6. Warning banner: pulsing border (2s) when sources need sync

**Status States:**
- Synced: Green checkmark, static
- Needs Sync: Red badge, pulsing
- Syncing: Blue spinner, rotating

**Testing:**
1. Load step 1 with unsynced sources
2. Verify "Needs Sync" badges pulse
3. Click Resync - check spinner
4. Verify success animation
5. Test "Resync All" button

**Success Criteria:**
- [ ] Status indicators animated
- [ ] Resync animations working
- [ ] Success states display
- [ ] Warning banner pulses
- [ ] All sources can be resynced

---

#### Task 25: New Form - Method Comparison Table
**Time:** 1 hour
**Description:** Build interactive tax method selection (Step 3) with comparison cards.

**Files to Modify:**
- `/app/new-form/page.tsx` (Step 3)

**Implementation:**
Create method selection cards:
1. Side-by-side cards: FIFO, LIFO, HIFO
2. Hover: Card lift + highlight (300ms)
3. Selected: Border glow + checkmark
4. Radio button with ripple effect
5. Tooltip on method names with explanations
6. Show estimated impact on taxes

**Card Content:**
- Method name and abbreviation
- Description
- Pros/cons
- Estimated tax impact
- "Learn More" link

**Testing:**
1. Hover method cards - verify lift effect
2. Select method - check border glow
3. Hover method name - verify tooltip
4. Test radio button selection
5. Verify only one can be selected

**Success Criteria:**
- [ ] Method cards display correctly
- [ ] Hover effects working
- [ ] Selection highlights card
- [ ] Tooltips functional
- [ ] Radio buttons work

---

#### Task 26: New Form - Generation Progress Animation
**Time:** 1 hour
**Description:** Create animated progress screen (Step 6) showing form generation status.

**Files to Create:**
- `/components/new-form/GeneratingAnimation.tsx`

**Files to Modify:**
- `/app/new-form/page.tsx` (Step 6)

**Implementation:**
Create generation screen with:
1. Animated progress bar with percentage
2. Mascot with bounce animation
3. Status messages updating in real-time
4. Estimated time remaining countdown
5. Shimmer effect on progress bar

**Status Messages:**
- "Gathering transaction data..."
- "Calculating capital gains..."
- "Applying tax methods..."
- "Generating forms..."
- "Almost done..."

**Mascot:**
- Image: `mascot-at-desk-analyzing-charts.png`
- Position: Center
- Animation: Gentle bounce (1.5s ease-in-out infinite)

**Testing:**
1. Navigate to step 6
2. Verify progress bar animates
3. Check status messages update
4. Verify mascot bounces
5. Test completion transition to step 7

**Success Criteria:**
- [ ] GeneratingAnimation component created
- [ ] Progress bar animates smoothly
- [ ] Status messages update
- [ ] Mascot displays and animates
- [ ] Transitions to success screen

---

#### Task 27: New Form - Mascot Integration (3 placements)
**Time:** 1 hour
**Description:** Integrate mascots for warnings, generation progress, and success states.

**Files to Modify:**
- `/app/new-form/page.tsx`

**Implementation:**

**1. Unsynced Sources Warning:**
- Mascot: `mascot-stressed-panicking.png`
- Trigger: Click "Continue" with unsynced sources
- Modal: Center, shake effect (400ms)
- Message: "Hold on! Some wallets need syncing first!"
- Button: "Sync All Now"

**2. Generation Progress (handled in Task 26):**
- Mascot: `mascot-at-desk-analyzing-charts.png`
- See Task 26 for details

**3. Success State (Step 7):**
- Mascot: `mascot-sitting-on-money.png`
- Trigger: Form generation complete
- Animation: Confetti burst + mascot slide-up (600ms)
- Message: "Your tax forms are ready! 🎉"
- Buttons: "View Forms", "Download PDF"

**Testing:**
1. Try continuing with unsynced sources - verify warning
2. Generation progress - verify mascot (Task 26)
3. Complete generation - verify success screen
4. Test confetti effect
5. Verify buttons functional

**Success Criteria:**
- [ ] Warning modal with mascot
- [ ] Progress mascot (Task 26)
- [ ] Success screen with mascot
- [ ] Confetti effect working
- [ ] All buttons functional

---

#### Task 28: View Forms - Enhanced Form Cards
**Time:** 1.5 hours
**Description:** Enhance generated form cards with hover effects and improved interactions.

**Files to Modify:**
- `/app/view-forms/page.tsx`

**Implementation:**
1. Wrap cards in AnimatedCard component
2. Hover: translateY(-4px) + shadow expansion (300ms)
3. Status badge: pulsing if "generating"
4. Net gain/loss: Color-coded with CountUp animation
5. Click entire card to view (not just button)
6. Card menu (3 dots): dropdown fade-in (200ms)

**Card Content:**
- Tax year (large heading)
- Generation date
- Method used (FIFO/LIFO/HIFO)
- Net gain/loss (color-coded)
- Transaction count
- Status badge
- Actions: View, Download, Delete

**Testing:**
1. Hover form cards - verify lift effect
2. Check status badge animations
3. Test net gain/loss CountUp
4. Click card - verify navigation
5. Test card menu dropdown

**Success Criteria:**
- [ ] Cards have hover animations
- [ ] Status badges display correctly
- [ ] CountUp working on net gain/loss
- [ ] Card click navigation works
- [ ] Menu dropdown functional

---

#### Task 29: View Forms - Download Button with Progress
**Time:** 1 hour
**Description:** Build enhanced download button with progress indicator and format options.

**Files to Create:**
- `/components/view-forms/DownloadButton.tsx`

**Files to Modify:**
- `/app/view-forms/page.tsx`

**Implementation:**
Create download button with:
1. Progress circle during download
2. Success checkmark animation (500ms)
3. File size indicator on hover
4. Format dropdown (PDF, CSV)
5. Loading state with spinner

**States:**
- Idle: "Download" button
- Downloading: Progress circle (0-100%)
- Success: Checkmark (500ms) → back to idle
- Error: Red X icon + error message

**Testing:**
1. Click download - verify progress indicator
2. Complete download - check checkmark animation
3. Hover button - verify file size tooltip
4. Test format dropdown
5. Mock error - verify error state

**Success Criteria:**
- [ ] DownloadButton component created
- [ ] Progress indicator working
- [ ] Success animation smooth
- [ ] Format dropdown functional
- [ ] Error handling works

---

#### Task 30: View Forms - Mascot Integration (2 placements)
**Time:** 0.5 hours
**Description:** Add mascot for empty state and form completion toast.

**Files to Modify:**
- `/app/view-forms/page.tsx`

**Implementation:**

**1. Empty State:**
- Mascot: `mascot-with-cigar-on-money.png`
- Trigger: `forms.length === 0`
- Position: Center of page
- Message: "Ready to generate your first tax form?"
- Button: "Get Started" → navigate to /new-form
- Animation: Gentle float (2s)

**2. Form Complete Toast:**
- Mascot: `mascot-sitting-on-money.png`
- Trigger: Form status changes to "completed"
- Toast: Bottom-right, bounce-in (600ms)
- Message: "Your {year} tax forms are ready!"
- Button: "View Now" → navigate to form
- Auto-dismiss: 5s

**Testing:**
1. Empty state - verify mascot and message
2. Complete form generation - verify toast
3. Check mascot images load
4. Test button navigation
5. Verify auto-dismiss

**Success Criteria:**
- [ ] Empty state with mascot
- [ ] Completion toast functional
- [ ] Mascots display correctly
- [ ] Navigation works
- [ ] Auto-dismiss timing correct

---

### **PHASE 4: Supporting Pages (6 hours, 8 tasks)**

#### Task 31: Profile - Form Section Enhancements
**Time:** 1 hour
**Description:** Enhance profile form sections with collapse/expand, edit mode, and auto-save.

**Files to Modify:**
- `/app/profile/page.tsx`

**Implementation:**
1. Add collapse/expand to each section
2. Arrow icon rotation on collapse (200ms)
3. Edit mode toggle (read-only ↔ editable)
4. Unsaved changes indicator (yellow dot)
5. Auto-save with debounce (2s after last change)
6. "Saving..." indicator → "Saved!" with checkmark

**Sections:**
- Personal Information
- Tax Information
- Preferences
- Danger Zone (always expanded)

**Testing:**
1. Click section header - verify collapse/expand
2. Toggle edit mode
3. Make changes - verify auto-save after 2s
4. Check "Saving..." → "Saved!" indicator
5. Test unsaved changes indicator

**Success Criteria:**
- [ ] Sections collapse/expand
- [ ] Edit mode toggle works
- [ ] Auto-save functional
- [ ] Save indicators display
- [ ] Unsaved changes tracked

---

#### Task 32: Profile - Avatar Upload Component
**Time:** 0.5 hours
**Description:** Build avatar upload component with drag-and-drop and image cropping.

**Files to Create:**
- `/components/profile/AvatarUpload.tsx`

**Implementation:**
Create avatar upload with:
1. Hover overlay: "Change photo"
2. Drag-and-drop support
3. Click to browse files
4. Image crop modal (optional)
5. Progress indicator during upload

**Features:**
- Circular preview
- Supported formats: JPG, PNG, WebP
- Max size: 5MB
- Validation errors

**Testing:**
1. Hover avatar - verify overlay
2. Drag image - verify drop zone
3. Click to browse - verify file picker
4. Upload image - verify progress
5. Test file validation

**Success Criteria:**
- [ ] AvatarUpload component created
- [ ] Drag-and-drop working
- [ ] File picker functional
- [ ] Upload progress displays
- [ ] Validation working

---

#### Task 33: Profile - Danger Zone Enhancement
**Time:** 0.5 hours
**Description:** Enhance danger zone with confirmation modal and countdown.

**Files to Modify:**
- `/app/profile/page.tsx` (Danger Zone section)

**Implementation:**
1. Red border with warning background
2. "Delete Account" button shake on hover (300ms)
3. Confirmation modal with mascot
4. Countdown before delete enabled (10s)
5. Type "DELETE" to confirm
6. List of data that will be deleted

**Mascot:**
- Image: `mascot-arrested-by-irs.png`
- Position: Left side of modal
- Message: "Are you absolutely sure?"

**Testing:**
1. Hover delete button - verify shake
2. Click button - verify modal appears
3. Check countdown (10s)
4. Type "DELETE" - verify button enables
5. Test modal dismissal

**Success Criteria:**
- [ ] Danger zone styled correctly
- [ ] Confirmation modal functional
- [ ] Countdown working
- [ ] Type to confirm works
- [ ] Mascot displays

---

#### Task 34: Support - Search with Suggestions
**Time:** 1 hour
**Description:** Build enhanced help search with real-time suggestions and recent searches.

**Files to Create:**
- `/components/support/SearchWithSuggestions.tsx`

**Files to Modify:**
- `/app/support/page.tsx`

**Implementation:**
Create search with:
1. Real-time suggestions (300ms debounce)
2. Recent searches section
3. Popular articles section
4. Keyboard navigation (arrow keys)
5. Highlight matching text in results
6. Icon animation on focus (200ms)

**Suggestions:**
- Based on FAQ articles
- Based on page titles
- Based on keywords
- Max 5 suggestions

**Testing:**
1. Type in search - verify debouncing
2. Check suggestions appear
3. Test keyboard navigation
4. Verify text highlighting
5. Test recent searches

**Success Criteria:**
- [ ] SearchWithSuggestions component created
- [ ] Debouncing working
- [ ] Suggestions display
- [ ] Keyboard navigation works
- [ ] Highlighting functional

---

#### Task 35: Support - Enhanced FAQ Accordion
**Time:** 0.5 hours
**Description:** Enhance FAQ accordion with smooth animations and feedback.

**Files to Modify:**
- `/app/support/page.tsx` (FAQ section)

**Implementation:**
1. Smooth expand/collapse (400ms ease-out)
2. Arrow icon rotation (200ms)
3. "Was this helpful?" buttons at end of each answer
4. Related articles suggestions
5. Deep-linking support (URL hash)

**Helpful Feedback:**
- Thumb up/down icons
- Icon fill animation on click
- Thank you message on positive feedback
- "What can we improve?" on negative feedback

**Testing:**
1. Click FAQ question - verify smooth expansion
2. Test arrow rotation
3. Click helpful/not helpful - verify feedback
4. Test deep-linking with URL hash
5. Check related articles appear

**Success Criteria:**
- [ ] Accordion animations smooth
- [ ] Icon rotation working
- [ ] Helpful feedback functional
- [ ] Deep-linking works
- [ ] Related articles display

---

#### Task 36: Support - Mascot Integration (2 placements)
**Time:** 0.5 hours
**Description:** Add mascots for empty search results and ticket submitted confirmation.

**Files to Modify:**
- `/app/support/page.tsx`

**Implementation:**

**1. Empty Search Results:**
- Mascot: `mascot-standing.png`
- Trigger: Search returns 0 results
- Position: Center of search results area
- Message: "Hmm, we couldn't find anything. Try different keywords?"
- Suggestion: "Or contact support directly below!"

**2. Ticket Submitted:**
- Mascot: `mascot-with-headphones-cigar-money.png`
- Trigger: Support form successfully submitted
- Toast: Bottom-right, slide-in (350ms)
- Message: "Got it! We'll respond within 24 hours."
- Auto-dismiss: 5s

**Testing:**
1. Search with no results - verify empty state
2. Submit support form - verify toast
3. Check mascot images load
4. Test auto-dismiss
5. Verify messaging correct

**Success Criteria:**
- [ ] Empty state with mascot
- [ ] Submitted toast functional
- [ ] Mascots display
- [ ] Auto-dismiss works
- [ ] Messages clear

---

#### Task 37: Disclaimer/Privacy - Read Progress Indicator
**Time:** 0.5 hours
**Description:** Add sticky progress bar showing scroll progress through legal pages.

**Files to Create:**
- `/components/legal/ReadProgressIndicator.tsx`

**Files to Modify:**
- `/app/disclaimer/page.tsx`
- `/app/privacy/page.tsx`

**Implementation:**
Create progress indicator:
1. Sticky top bar
2. Gradient progress fill (0-100% width)
3. Smooth transition (150ms ease-out)
4. Color: gradient-primary
5. Calculate based on scroll position

**Formula:**
`progress = (scrollTop / (scrollHeight - clientHeight)) * 100`

**Testing:**
1. Scroll disclaimer page - verify bar fills
2. Scroll to bottom - verify 100%
3. Test smooth transitions
4. Check sticky positioning
5. Test on mobile

**Success Criteria:**
- [ ] ReadProgressIndicator component created
- [ ] Progress calculates correctly
- [ ] Bar fills smoothly
- [ ] Sticky positioning works
- [ ] Mobile responsive

---

#### Task 38: Disclaimer/Privacy - Enhanced Checkboxes
**Time:** 0.5 hours
**Description:** Enhance acceptance checkboxes with animations and better interactions.

**Files to Modify:**
- `/app/disclaimer/page.tsx`
- `/app/privacy/page.tsx`

**Implementation:**
1. Scale(1.1) on hover (200ms)
2. Checkmark draw animation on select (400ms)
3. Ripple effect on click (500ms)
4. Label color transition (300ms)
5. "Accept & Continue" button enable animation

**Checkmark Animation:**
- Use stroke-dashoffset for draw effect
- Animate from 0 to full path length
- Duration: 400ms
- Easing: ease-out

**Testing:**
1. Hover checkbox - verify scale
2. Check box - verify draw animation
3. Check ripple effect
4. Verify label color change
5. Check button enable animation

**Success Criteria:**
- [ ] Hover scale working
- [ ] Checkmark draws smoothly
- [ ] Ripple effect functional
- [ ] Label transitions
- [ ] Button enables properly

---

### **PHASE 5: Polish & Optimization (4 hours, 4 tasks)**

#### Task 39: Performance Audit and Optimization
**Time:** 1.5 hours
**Description:** Audit and optimize performance of all UI enhancements.

**Tasks:**
1. Run Lighthouse audit on all pages
2. Identify animation performance bottlenecks
3. Lazy load heavy components
4. Optimize mascot image loading
5. Test Core Web Vitals

**Optimization Checklist:**
- [ ] Lazy load all mascot images
- [ ] Use `will-change` sparingly
- [ ] Prefer `transform` over `top/left`
- [ ] Batch DOM reads/writes
- [ ] Use IntersectionObserver for scroll animations
- [ ] Debounce scroll/resize handlers
- [ ] Minimize layout shifts
- [ ] Optimize animation frame rates

**Tools:**
- Chrome DevTools Performance tab
- Lighthouse CI
- React DevTools Profiler
- Bundle analyzer

**Testing:**
1. Run Lighthouse on all 11 pages
2. Record performance metrics
3. Identify bottlenecks
4. Apply optimizations
5. Re-run and compare

**Success Criteria:**
- [ ] LCP < 2.5s on all pages
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] All animations 60fps
- [ ] Bundle size increase < 30KB

---

#### Task 40: Cross-Browser Testing
**Time:** 1 hour
**Description:** Test all UI enhancements across different browsers and fix issues.

**Browsers to Test:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile: iOS Safari 14+, Chrome Android 90+

**Test Checklist:**
- [ ] All animations work in each browser
- [ ] Hover effects functional
- [ ] Modal animations smooth
- [ ] Toast notifications appear correctly
- [ ] Mascot images load
- [ ] Forms function properly
- [ ] No console errors
- [ ] CSS fallbacks work

**Known Issues:**
- Safari: May need `-webkit-` prefixes
- Firefox: Different scrollbar styling
- Edge: Check backdrop-filter support

**Testing:**
1. Open app in each browser
2. Navigate through all 11 pages
3. Test key interactions
4. Document browser-specific issues
5. Apply fixes

**Success Criteria:**
- [ ] All features work in Chrome
- [ ] All features work in Firefox
- [ ] All features work in Safari
- [ ] All features work in Edge
- [ ] Mobile browsers supported

---

#### Task 41: Accessibility Audit
**Time:** 1 hour
**Description:** Ensure all UI enhancements meet WCAG AA accessibility standards.

**Accessibility Checklist:**
- [ ] All animations respect `prefers-reduced-motion`
- [ ] Color contrast ratios meet WCAG AA (4.5:1)
- [ ] Keyboard navigation works everywhere
- [ ] Screen readers announce state changes
- [ ] Focus indicators visible on all interactive elements
- [ ] ARIA labels on custom components
- [ ] Skip links functional
- [ ] Form errors announced
- [ ] Modals trap focus
- [ ] Toast notifications accessible

**Tools:**
- axe DevTools
- WAVE browser extension
- Lighthouse accessibility audit
- NVDA screen reader (Windows)
- VoiceOver (Mac/iOS)

**Testing:**
1. Run axe audit on all pages
2. Test keyboard navigation
3. Test with screen reader
4. Check color contrast
5. Verify reduced motion
6. Fix all issues

**Success Criteria:**
- [ ] 0 critical axe violations
- [ ] Keyboard navigation complete
- [ ] Screen reader friendly
- [ ] Color contrast passing
- [ ] Reduced motion respected

---

#### Task 42: Mobile Responsive Testing
**Time:** 0.5 hours
**Description:** Test all UI enhancements on various mobile screen sizes and fix responsive issues.

**Screen Sizes to Test:**
- Mobile: 375px, 414px (iPhone)
- Tablet: 768px, 1024px (iPad)
- Desktop: 1280px, 1920px

**Test Checklist:**
- [ ] Animations work on mobile
- [ ] Touch interactions functional
- [ ] Modals display correctly
- [ ] Toast notifications positioned well
- [ ] Stepper collapses on mobile
- [ ] Tables scroll horizontally
- [ ] Cards stack properly
- [ ] Mascot images sized correctly

**Testing:**
1. Open DevTools responsive mode
2. Test each screen size
3. Check portrait and landscape
4. Test on real devices
5. Fix responsive issues

**Success Criteria:**
- [ ] All pages mobile responsive
- [ ] Touch interactions work
- [ ] Animations smooth on mobile
- [ ] No horizontal scroll
- [ ] Content readable at all sizes

---

## 📊 Task Progress Tracker

**PHASE 1: Foundation** (6 tasks)
- [x] Task 1: Create Animation Utility System (2h)
- [x] Task 2: Set up Mascot Image Optimization (2h)
- [x] Task 3: Create Base Custom Components Library (4h)
- [x] Task 4: Implement Microinteraction CSS Library (2h)
- [x] Task 5: Create Color Gradient System (1h)
- [x] Task 6: Set up Typography Scale (1h)

**PHASE 2: Dashboard & Core Pages** (15 tasks)
- [x] Task 7: Dashboard - Animated Stat Cards (2h)
- [x] Task 8: Dashboard - Completion Progress Ring (1h)
- [x] Task 9: Dashboard - Interactive Portfolio Chart (1.5h)
- [x] Task 10: Dashboard - Connected Sources Card Grid (1.5h)
- [x] Task 11: Dashboard - Mascot Integration (1h)
- [x] Task 12: Transactions - Smart Search (2h)
- [x] Task 13: Transactions - Category Quick Picker (1.5h)
- [x] Task 14: Transactions - Bulk Action Toolbar (1h)
- [x] Task 15: Transactions - Mascot Integration (0.5h)
- [x] Task 16: Wallets - Enhanced Source Cards (2h)
- [x] Task 17: Wallets - Add Source Modal (1.5h)
- [x] Task 18: Wallets - Mascot Integration (1h)

**PHASE 3: Forms & Workflows** (12 tasks)
- [x] Task 19: Onboarding - Animated Stepper (1.5h)
- [x] Task 20: Onboarding - Welcome Hero (1h)
- [x] Task 21: Onboarding - Form Field Enhancements (1h)
- [x] Task 22: Onboarding - Mascot Integration (0.5h)
- [x] Task 23: New Form - Enhanced Stepper (2h)
- [x] Task 24: New Form - Source Verification Cards (1.5h)
- [x] Task 25: New Form - Method Comparison Table (1h)
- [x] Task 26: New Form - Generation Progress (1h)
- [x] Task 27: New Form - Mascot Integration (1h)
- [x] Task 28: View Forms - Enhanced Form Cards (1.5h)
- [x] Task 29: View Forms - Download Button (1h)
- [x] Task 30: View Forms - Mascot Integration (0.5h)

**PHASE 4: Supporting Pages** (8 tasks)
- [x] Task - [ ] Task 31:: Profile - Form Section Enhancements (1h)
- [x] Task - [ ] Task 32:: Profile - Avatar Upload (0.5h)
- [x] Task - [ ] Task 33:: Profile - Danger Zone Enhancement (0.5h)
- [x] Task - [ ] Task 34:: Support - Search with Suggestions (1h)
- [x] Task - [ ] Task 35:: Support - Enhanced FAQ Accordion (0.5h)
- [x] Task - [ ] Task 36:: Support - Mascot Integration (0.5h)
- [x] Task - [ ] Task 37:: Legal - Read Progress Indicator (0.5h)
- [x] Task - [ ] Task 38:: Legal - Enhanced Checkboxes (0.5h)

**PHASE 5: Polish & Optimization** (4 tasks)
- [x] Task 39: Performance Audit and Optimization (1.5h)
- [x] Task 40: Cross-Browser Testing (1h)
- [x] Task 41: Accessibility Audit (1h)
- [x] Task 42: Mobile Responsive Testing (0.5h)

**Total: 48 tasks, 52 hours**

---

## ✅ Final Success Criteria

When ALL 48 tasks are complete:

- [ ] All checkboxes above marked complete
- [ ] All 48 commits pushed to git
- [ ] npm run type-check: PASS
- [ ] npm run lint: PASS
- [ ] npm run build: PASS
- [ ] All 11 pages have UI enhancements
- [ ] All 10 mascots integrated (25 total placements)
- [ ] All animations running at 60fps
- [ ] LCP < 2.5s on all pages
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Bundle size increase < 30KB JS
- [ ] Total mascot images < 300KB
- [ ] 0 TypeScript errors
- [ ] 0 linting errors
- [ ] 0 console errors
- [ ] Cross-browser tested (Chrome, Firefox, Safari, Edge)
- [ ] Accessibility WCAG AA compliant
- [ ] Mobile responsive on all screen sizes
- [ ] All animations respect prefers-reduced-motion

---

**Document Status:** ✅ Ready for Main Agent Orchestration
**Last Updated:** 2025-11-17
**Version:** 2.0 (Task-Based Format)
