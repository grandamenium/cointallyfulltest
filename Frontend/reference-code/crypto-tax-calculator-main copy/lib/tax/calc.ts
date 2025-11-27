import {
  type FilingStatus,
  ORDINARY_BRACKETS_2024,
  STANDARD_DEDUCTION_2024,
  LTCG_THRESHOLDS_2024,
  incrementalLTCGTax,
  incrementalOrdinaryTax,
} from "./federal"
import { type StateCode, STATE_EFFECTIVE_FLAT_2024 } from "./state"

export type TaxYear = 2024 // structured for easy extension later

export type Inputs = {
  year: TaxYear
  filingStatus: FilingStatus
  state: StateCode
  nonCryptoIncome: number // wages/salary/other non-crypto ordinary income
  shortTermGains: number // gains held <= 1 year
  longTermGains: number // gains held > 1 year
}

export type Outputs = {
  federalShortTermTax: number
  federalLongTermTax: number
  federalTotalOnGains: number
  stateTaxOnGains: number
  totalTaxOnGains: number
  effectiveTaxRateOnGains: number // total tax on gains / total gains
}

function clampNonNegative(n: number) {
  return Number.isFinite(n) ? Math.max(0, n) : 0
}

export function computeEstimate(inputs: Inputs): Outputs {
  const year = inputs.year
  if (year !== 2024) throw new Error("Only 2024 supported.")

  const filing = inputs.filingStatus
  const nonCrypto = clampNonNegative(inputs.nonCryptoIncome)
  const stg = clampNonNegative(inputs.shortTermGains)
  const ltg = clampNonNegative(inputs.longTermGains)

  const stdDeduction = STANDARD_DEDUCTION_2024[filing]

  // Baseline taxable income (ordinary) without any crypto gains
  const baselineTaxable = Math.max(0, nonCrypto - stdDeduction)

  // Short-term gains are taxed as ordinary income incrementally
  const ordinaryBrackets = ORDINARY_BRACKETS_2024[filing]
  const federalST = incrementalOrdinaryTax(baselineTaxable, stg, ordinaryBrackets)

  // Long-term gains are taxed with preferential rates based on taxable income including STG
  const taxableAfterSTG = baselineTaxable + stg
  const ltcgThresholds = LTCG_THRESHOLDS_2024[filing]
  const federalLT = incrementalLTCGTax(taxableAfterSTG, ltg, ltcgThresholds)

  const federalTotal = federalST + federalLT

  // State tax: simplified flat effective rate applied incrementally to total gains
  const stateRate = STATE_EFFECTIVE_FLAT_2024[inputs.state] ?? 0.05
  const stateTax = (stg + ltg) * stateRate

  const totalTax = federalTotal + stateTax
  const totalGains = stg + ltg
  const effective = totalGains > 0 ? totalTax / totalGains : 0

  return {
    federalShortTermTax: federalST,
    federalLongTermTax: federalLT,
    federalTotalOnGains: federalTotal,
    stateTaxOnGains: stateTax,
    totalTaxOnGains: totalTax,
    effectiveTaxRateOnGains: effective,
  }
}
