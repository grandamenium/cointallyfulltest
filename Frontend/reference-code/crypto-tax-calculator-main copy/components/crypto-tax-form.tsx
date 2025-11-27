"use client"

import * as React from "react"
import { computeEstimate, type Inputs } from "@/lib/tax/calc"
import { STATES, type StateCode } from "@/lib/tax/state"
import type { FilingStatus } from "@/lib/tax/federal"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 2 })

type FormState = {
  filingStatus: FilingStatus
  state: StateCode
  nonCryptoIncome: string
  shortTermGains: string
  longTermGains: string
}

const defaultForm: FormState = {
  filingStatus: "single",
  state: "CA",
  nonCryptoIncome: "100000",
  shortTermGains: "5000",
  longTermGains: "10000",
}

export function CryptoTaxForm({ className }: { className?: string }) {
  const [form, setForm] = React.useState<FormState>(defaultForm)
  const [year] = React.useState<2024>(2024)

  const parsedInputs: Inputs = React.useMemo(() => {
    const nci = Number(form.nonCryptoIncome.replace(/,/g, "")) || 0
    const st = Number(form.shortTermGains.replace(/,/g, "")) || 0
    const lt = Number(form.longTermGains.replace(/,/g, "")) || 0

    return {
      year,
      filingStatus: form.filingStatus,
      state: form.state,
      nonCryptoIncome: Math.max(0, nci),
      shortTermGains: Math.max(0, st),
      longTermGains: Math.max(0, lt),
    }
  }, [form, year])

  const results = React.useMemo(() => computeEstimate(parsedInputs), [parsedInputs])

  function handleNumberChange(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
    }
  }

  function handleReset() {
    setForm(defaultForm)
  }

  const totalGains = (Number(form.shortTermGains) || 0) + (Number(form.longTermGains) || 0)

  return (
    <div className={cn("mx-auto grid w-full max-w-4xl gap-6", className)}>
      <header className="space-y-2">
        <h1 className="text-balance text-2xl font-semibold">Crypto Tax Estimator</h1>
        <p className="text-muted-foreground">
          Estimate federal and state taxes on your crypto gains using 2024 brackets and a simplified state rate.
        </p>
      </header>

      <Card className="p-4 md:p-6">
        <form className="grid gap-4 md:grid-cols-2">
          {/* Filing Status */}
          <div className="grid gap-2 ">
            <Label htmlFor="filing">Filing status</Label>
            <Select
              value={form.filingStatus}
              
              onValueChange={(v) => setForm((p) => ({ ...p, filingStatus: v as FilingStatus }))}
            >
              <SelectTrigger id="filing">
                <SelectValue placeholder="Select filing status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married_joint">Married Filing Jointly</SelectItem>
                <SelectItem value="married_separate">Married Filing Separately</SelectItem>
                <SelectItem value="head">Head of Household</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* State */}
          <div className="grid gap-2">
            <Label htmlFor="state">State of residence</Label>
            <Select value={form.state} onValueChange={(v) => setForm((p) => ({ ...p, state: v as StateCode }))}>
              <SelectTrigger id="state">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {STATES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Non-crypto income */}
          <div className="grid gap-2">
            <Label htmlFor="nci">Estimated annual non-crypto income</Label>
            <Input
              id="nci"
              inputMode="decimal"
              placeholder="e.g., 100000"
              value={form.nonCryptoIncome}
              onChange={handleNumberChange("nonCryptoIncome")}
            />
            <p className="text-xs text-muted-foreground">Enter wages/salary and other non-crypto income.</p>
          </div>

          {/* Short-term gains */}
          <div className="grid gap-2">
            <Label htmlFor="stg">Net short-term crypto gains</Label>
            <Input
              id="stg"
              inputMode="decimal"
              placeholder="e.g., 5000"
              value={form.shortTermGains}
              onChange={handleNumberChange("shortTermGains")}
            />
            <p className="text-xs text-muted-foreground">Gains on assets held 1 year or less.</p>
          </div>

          {/* Long-term gains */}
          <div className="grid gap-2">
            <Label htmlFor="ltg">Net long-term crypto gains</Label>
            <Input
              id="ltg"
              inputMode="decimal"
              placeholder="e.g., 10000"
              value={form.longTermGains}
              onChange={handleNumberChange("longTermGains")}
            />
            <p className="text-xs text-muted-foreground">Gains on assets held over 1 year.</p>
          </div>

          {/* Year (fixed 2024 for now) */}
          <div className="grid gap-2">
            <Label>Tax year</Label>
            <div className="h-10 rounded-md border bg-muted px-3 inline-flex items-center text-sm">2024</div>
            <p className="text-xs text-muted-foreground">This demo uses 2024 IRS brackets and deductions.</p>
          </div>

          <div className="md:col-span-2 flex items-center gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={handleReset} className="cursor-pointer">
              Reset
            </Button>
            <div className="text-sm text-muted-foreground">Calculations update automatically as you type.</div>
          </div>
        </form>
      </Card>

      <Card className="p-4 md:p-6">
        <h2 className="text-lg font-medium">Results</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="grid gap-1">
            <span className="text-sm text-muted-foreground">Federal tax on short-term gains</span>
            <span className="text-base font-semibold">{currency.format(results.federalShortTermTax)}</span>
          </div>
          <div className="grid gap-1">
            <span className="text-sm text-muted-foreground">Federal tax on long-term gains</span>
            <span className="text-base font-semibold">{currency.format(results.federalLongTermTax)}</span>
          </div>
          <div className="grid gap-1">
            <span className="text-sm text-muted-foreground">Total federal tax on crypto gains</span>
            <span className="text-base font-semibold">{currency.format(results.federalTotalOnGains)}</span>
          </div>
          <div className="grid gap-1">
            <span className="text-sm text-muted-foreground">Estimated state tax on crypto gains</span>
            <span className="text-base font-semibold">{currency.format(results.stateTaxOnGains)}</span>
          </div>
          <div className="grid gap-1">
            <span className="text-sm text-muted-foreground">Total estimated tax due on crypto gains</span>
            <span className="text-base font-semibold">{currency.format(results.totalTaxOnGains)}</span>
          </div>
          <div className="grid gap-1">
            <span className="text-sm text-muted-foreground">Effective tax rate on crypto gains</span>
            <span className="text-base font-semibold">{percent.format(results.effectiveTaxRateOnGains || 0)}</span>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <div className="text-sm">
            <strong>Assumptions:</strong> Uses standard deduction only; federal brackets and LTCG thresholds for 2024;
            state uses a simplified flat effective rate. Short‑term gains are taxed as ordinary income; long‑term gains
            at preferential rates based on your total taxable income.
          </div>
          <div className="text-sm text-muted-foreground">
            This tool provides an estimate only and may not reflect your actual tax. Tax rules vary by state and
            personal situation. Always consult a qualified tax professional.
          </div>
        </div>
      </Card>

      <Card className="p-4 md:p-6">
        <h3 className="text-lg font-medium">Suggestions</h3>
        <ul className="mt-3 list-disc pl-5 text-sm text-pretty">
          <li>Consider tax-loss harvesting to offset realized gains with realized losses.</li>
          <li>Holding assets for over one year may qualify gains for lower long-term rates.</li>
          <li>Review quarterly estimated payments to avoid underpayment penalties.</li>
          <li>Track basis, holding periods, and wash sale implications carefully.</li>
          <li>Consult a tax professional for personalized advice before filing.</li>
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">Not financial or tax advice. Educational estimate only.</p>
      </Card>

      {totalGains <= 0 && (
        <div className="text-sm text-muted-foreground">
          Tip: Enter positive gains to see your estimated taxes. Negative net results may indicate potential tax‑loss
          harvesting opportunities.
        </div>
      )}
    </div>
  )
}
