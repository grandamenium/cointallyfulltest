'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

interface MetricsCardsProps {
  totalPnL: number;
  totalGains: number;
  totalLosses: number;
  estimatedTax: number;
  shortTermGains?: number;
  longTermGains?: number;
}

export function MetricsCards({ totalPnL, totalGains, totalLosses, estimatedTax, shortTermGains, longTermGains }: MetricsCardsProps) {
  const pnlPositive = totalPnL >= 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total P&L */}
      <motion.div
        whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)' }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        <Card className={`border-l-4 ${pnlPositive ? 'border-l-green-500' : 'border-l-red-500'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            {pnlPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold tabular-nums ${pnlPositive ? 'text-green-600' : 'text-red-600'}`}>
              <CountUp
                end={totalPnL}
                duration={1.2}
                decimals={2}
                prefix="$"
                separator=","
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pnlPositive ? '↑' : '↓'} <CountUp end={Math.abs(totalPnL)} duration={1} decimals={0} separator="," /> vs last year
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Total Gains */}
      <motion.div
        whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)' }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capital Gains</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums text-green-600">
              <CountUp
                end={totalGains}
                duration={1.2}
                decimals={2}
                prefix="$"
                separator=","
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Short-term: $<CountUp end={shortTermGains ?? 0} duration={1} decimals={0} separator="," /> | Long-term: $
              <CountUp end={longTermGains ?? 0} duration={1} decimals={0} separator="," />
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Total Losses */}
      <motion.div
        whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)' }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capital Losses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums text-red-600">
              <CountUp
                end={totalLosses}
                duration={1.2}
                decimals={2}
                prefix="$"
                separator=","
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Available to offset gains</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Estimated Tax */}
      <motion.div
        whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)' }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Tax Liability</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">
              <CountUp
                end={estimatedTax}
                duration={1.2}
                decimals={2}
                prefix="$"
                separator=","
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Based on FIFO method
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
