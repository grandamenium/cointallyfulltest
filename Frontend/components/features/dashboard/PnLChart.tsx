'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { format, subMonths, subDays, startOfYear } from 'date-fns';
import { usePnLHistory } from '@/hooks/useTransactions';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'YTD' | 'All';

interface PnLChartProps {
  className?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const value = payload[0].value as number;
  const date = new Date(label);
  const isPositive = value >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-lg border bg-background/95 p-3 shadow-xl backdrop-blur-sm"
    >
      <p className="text-xs font-medium text-muted-foreground">
        {format(date, 'MMM dd, yyyy')}
      </p>
      <p className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? '+' : '-'}${new Intl.NumberFormat('en-US').format(Math.abs(value))}
      </p>
      <p className="text-xs text-muted-foreground">Cumulative P&L</p>
    </motion.div>
  );
}

export function PnLChart({ className }: PnLChartProps) {
  const { user } = useAuth();
  const taxYear = user?.taxInfo?.filingYear || new Date().getFullYear();
  const { data: pnlHistory, isLoading } = usePnLHistory(taxYear);
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y');

  const filteredData = useMemo(() => {
    if (!pnlHistory?.dataPoints || pnlHistory.dataPoints.length === 0) {
      return [];
    }

    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '1M':
        startDate = subMonths(now, 1);
        break;
      case '3M':
        startDate = subMonths(now, 3);
        break;
      case '6M':
        startDate = subMonths(now, 6);
        break;
      case '1Y':
        startDate = subMonths(now, 12);
        break;
      case 'YTD':
        startDate = startOfYear(now);
        break;
      case 'All':
      default:
        startDate = new Date(0);
        break;
    }

    return pnlHistory.dataPoints
      .filter((point) => new Date(point.date) >= startDate)
      .map((point) => ({
        date: point.date,
        value: point.cumulativePnl,
      }));
  }, [pnlHistory, timeRange]);

  const timeRanges: TimeRange[] = ['1M', '3M', '6M', '1Y', 'YTD', 'All'];

  const hasData = filteredData.length > 0;
  const latestValue = hasData ? filteredData[filteredData.length - 1].value : 0;
  const isPositive = latestValue >= 0;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Realized P&L</CardTitle>
            {hasData && (
              <p className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}${latestValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            )}
          </div>

          <div className="relative flex gap-1 rounded-lg bg-muted p-1">
            <motion.div
              layoutId="timeRangeIndicator"
              className="absolute inset-y-1 rounded-md bg-background shadow-sm"
              initial={false}
              animate={{
                x: timeRanges.indexOf(timeRange) * (100 / timeRanges.length) + '%',
                width: `${100 / timeRanges.length}%`,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
            />

            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`
                  relative z-10 rounded-md px-3 py-1.5 text-sm font-medium transition-colors
                  ${
                    timeRange === range
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[320px] w-full" />
        ) : !hasData ? (
          <div className="flex h-[320px] items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">No realized gains or losses yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                P&L will appear here after you sell some assets
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={timeRange}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart
                  data={filteredData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return format(date, 'MMM dd');
                    }}
                    className="text-xs text-muted-foreground"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    minTickGap={50}
                  />

                  <YAxis
                    tickFormatter={(value) =>
                      `$${new Intl.NumberFormat('en-US', {
                        notation: 'compact',
                        compactDisplay: 'short',
                        signDisplay: 'exceptZero',
                      }).format(value)}`
                    }
                    className="text-xs text-muted-foreground"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    width={80}
                  />

                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{
                      stroke: 'hsl(var(--foreground))',
                      strokeWidth: 1,
                      strokeDasharray: '5 5',
                    }}
                    animationDuration={200}
                    animationEasing="ease-out"
                  />

                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={isPositive ? '#22c55e' : '#ef4444'}
                    strokeWidth={2}
                    fill={isPositive ? 'url(#colorPositive)' : 'url(#colorNegative)'}
                    fillOpacity={1}
                    isAnimationActive={true}
                    animationDuration={800}
                    animationEasing="ease-in-out"
                    dot={false}
                    activeDot={{
                      r: 6,
                      fill: isPositive ? '#22c55e' : '#ef4444',
                      stroke: '#fff',
                      strokeWidth: 2,
                      className: 'animate-pulse',
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}
