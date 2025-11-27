export type FilingStatus = "single" | "married_joint" | "married_separate" | "head"

export type TaxBracket = {
  upTo: number | null // null = no cap (top bracket)
  rate: number // e.g., 0.22 for 22%
}

export type LTCGThresholds = {
  zeroRateTop: number // top income for 0% LTCG
  fifteenRateTop: number // top income for 15% LTCG
  // 20% applies above fifteenRateTop
}

export const STANDARD_DEDUCTION_2024: Record<FilingStatus, number> = {
  single: 14600,
  married_joint: 29200,
  married_separate: 14600,
  head: 21900,
}

// Ordinary income tax brackets for 2024
// Source: IRS 2024 published brackets (rounded to nearest dollar)
export const ORDINARY_BRACKETS_2024: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { upTo: 11600, rate: 0.1 },
    { upTo: 47150, rate: 0.12 },
    { upTo: 100525, rate: 0.22 },
    { upTo: 191950, rate: 0.24 },
    { upTo: 243725, rate: 0.32 },
    { upTo: 609350, rate: 0.35 },
    { upTo: null, rate: 0.37 },
  ],
  married_joint: [
    { upTo: 23200, rate: 0.1 },
    { upTo: 94300, rate: 0.12 },
    { upTo: 201050, rate: 0.22 },
    { upTo: 383900, rate: 0.24 },
    { upTo: 487450, rate: 0.32 },
    { upTo: 731200, rate: 0.35 },
    { upTo: null, rate: 0.37 },
  ],
  married_separate: [
    { upTo: 11600, rate: 0.1 },
    { upTo: 47150, rate: 0.12 },
    { upTo: 100525, rate: 0.22 },
    { upTo: 191950, rate: 0.24 },
    { upTo: 243725, rate: 0.32 },
    { upTo: 365600, rate: 0.35 },
    { upTo: null, rate: 0.37 },
  ],
  head: [
    { upTo: 16550, rate: 0.1 },
    { upTo: 63100, rate: 0.12 },
    { upTo: 100500, rate: 0.22 },
    { upTo: 191950, rate: 0.24 },
    { upTo: 243700, rate: 0.32 },
    { upTo: 609350, rate: 0.35 },
    { upTo: null, rate: 0.37 },
  ],
}

// Long-term capital gains thresholds (0% / 15% / 20%) for 2024
// Source: IRS 2024 LTCG thresholds
export const LTCG_THRESHOLDS_2024: Record<FilingStatus, LTCGThresholds> = {
  single: {
    zeroRateTop: 47025, // 0% up to this taxable income
    fifteenRateTop: 518900, // 15% up to this income; above = 20%
  },
  married_joint: {
    zeroRateTop: 94050,
    fifteenRateTop: 583750,
  },
  married_separate: {
    zeroRateTop: 47025,
    fifteenRateTop: 291850,
  },
  head: {
    zeroRateTop: 63000,
    fifteenRateTop: 551350,
  },
}

// Compute tax on a taxable ordinary income amount using brackets
export function computeOrdinaryTax(taxableIncome: number, brackets: TaxBracket[]): number {
  if (taxableIncome <= 0) return 0
  let remaining = taxableIncome
  let lowerBound = 0
  let tax = 0

  for (const b of brackets) {
    const cap = b.upTo
    const slice = cap == null ? remaining : Math.max(0, Math.min(remaining, cap - lowerBound))
    if (slice > 0) {
      tax += slice * b.rate
      remaining -= slice
      lowerBound = cap ?? lowerBound + slice
    }
    if (remaining <= 0) break
  }
  return tax
}

// Incremental tax for adding an ordinary-income amount to a baseline taxable amount
export function incrementalOrdinaryTax(baselineTaxable: number, addAmount: number, brackets: TaxBracket[]): number {
  if (addAmount <= 0) return 0
  const base = Math.max(0, baselineTaxable)
  const added = Math.max(0, baselineTaxable + addAmount)
  const taxBefore = computeOrdinaryTax(base, brackets)
  const taxAfter = computeOrdinaryTax(added, brackets)
  return Math.max(0, taxAfter - taxBefore)
}

// Incremental LTCG tax for adding LTCG on top of a baseline taxable income.
// LTCG rates apply based on total taxable income including ordinary pieces.
export function incrementalLTCGTax(baselineTaxable: number, ltcgAmount: number, thresholds: LTCGThresholds): number {
  if (ltcgAmount <= 0) return 0

  let tax = 0
  let remaining = ltcgAmount

  // Determine how much room remains in each LTCG band above the baseline
  const base = Math.max(0, baselineTaxable)

  // 0% band
  const room0 = Math.max(0, thresholds.zeroRateTop - base)
  const take0 = Math.min(remaining, room0)
  tax += take0 * 0
  remaining -= take0

  if (remaining <= 0) return tax

  // 15% band
  const baseAfter0 = base + take0
  const room15 = Math.max(0, thresholds.fifteenRateTop - baseAfter0)
  const take15 = Math.min(remaining, room15)
  tax += take15 * 0.15
  remaining -= take15

  if (remaining <= 0) return tax

  // 20% band (everything above)
  tax += remaining * 0.2

  return tax
}
