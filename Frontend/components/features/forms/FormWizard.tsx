'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Loader2,
  FileText,
  Download,
  Mail,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  Target,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

import { useTransactions, useTransactionSummary, useTransactionSummaryWithMethod } from '@/hooks/useTransactions';
import { useConnectedSources } from '@/hooks/useWallets';
import { useAuth } from '@/hooks/useAuth';
import { useGenerateForm, useDownloadForm } from '@/hooks/useForms';
import type { TaxMethod } from '@/types/form';
import type { Transaction } from '@/types/transaction';
import type { ConnectedSource } from '@/types/wallet';
import { WizardStepper } from '@/components/new-form/WizardStepper';
import { GeneratingAnimation } from '@/components/new-form/GeneratingAnimation';
import { MascotImage } from '@/components/ui/MascotImage';

interface FormData {
  taxYear: number;
  taxMethod: TaxMethod;
}

const STEPS = [
  { id: 1, label: 'Connections' },
  { id: 2, label: 'Tax Year' },
  { id: 3, label: 'Method' },
  { id: 4, label: 'Review' },
  { id: 5, label: 'Preview' },
  { id: 6, label: 'Generating' },
  { id: 7, label: 'Success' }
];

function isStale(source: ConnectedSource): boolean {
  const daysSinceSync = (Date.now() - new Date(source.lastSyncedAt).getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceSync > 7;
}

function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${diffDays} days ago`;
}

type SourceSyncStatus = 'synced' | 'needs_sync' | 'syncing';

interface SourceWithSyncStatus extends ConnectedSource {
  syncStatus: SourceSyncStatus;
}

export function FormWizard() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: transactions } = useTransactions();
  const { data: sources } = useConnectedSources();

  const { data: summary2023 } = useTransactionSummary(2023);
  const { data: summary2024 } = useTransactionSummary(2024);
  const { data: summary2025 } = useTransactionSummary(2025);

  const defaultTaxYear = user?.taxInfo?.filingYear || new Date().getFullYear();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    taxYear: defaultTaxYear,
    taxMethod: 'FIFO'
  });

  const { data: selectedYearSummary } = useTransactionSummaryWithMethod(formData.taxYear, formData.taxMethod);

  // Fetch summaries for all tax methods to show real estimates in method selector
  const { data: fifoSummary } = useTransactionSummaryWithMethod(formData.taxYear, 'FIFO');
  const { data: lifoSummary } = useTransactionSummaryWithMethod(formData.taxYear, 'LIFO');
  const { data: hifoSummary } = useTransactionSummaryWithMethod(formData.taxYear, 'HIFO');

  const generateFormMutation = useGenerateForm();
  const downloadFormMutation = useDownloadForm();

  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [syncedIds, setSyncedIds] = useState<Set<string>>(new Set());
  const [showUnsyncedWarning, setShowUnsyncedWarning] = useState(false);
  const [generatedFormId, setGeneratedFormId] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Trigger confetti on success step (Step 6)
  useEffect(() => {
    if (currentStep === 6) {
      const prefersReducedMotion = typeof window !== 'undefined'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!prefersReducedMotion) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  }, [currentStep]);

  const handleNext = () => {
    // Check for unsynced sources on Step 0 (Connections)
    if (currentStep === 0) {
      const enrichedSources = getEnrichedSources();
      const hasUnsyncedSources = enrichedSources.some(s => s.syncStatus === 'needs_sync');
      if (hasUnsyncedSources) {
        setShowUnsyncedWarning(true);
        return;
      }
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerateForms = async () => {
    setCurrentStep(5);
    setGenerateError(null);

    try {
      const result = await generateFormMutation.mutateAsync({
        taxYear: formData.taxYear,
        taxMethod: formData.taxMethod,
      });

      setGeneratedFormId((result as any).id || (result as any).formId);
      setCurrentStep(6);
    } catch (error: any) {
      setGenerateError(error.message || 'Failed to generate forms');
      setCurrentStep(4);
    }
  };

  // Get sync status for a source
  const getSyncStatus = (source: ConnectedSource): SourceSyncStatus => {
    if (syncingIds.has(source.id)) return 'syncing';
    if (syncedIds.has(source.id)) return 'synced';
    return isStale(source) ? 'needs_sync' : 'synced';
  };

  // Handle individual source resync
  const handleResync = async (sourceId: string) => {
    setSyncingIds(prev => new Set(prev).add(sourceId));

    // Simulate API call (replace with actual sync logic)
    await new Promise(resolve => setTimeout(resolve, 2000));

    setSyncingIds(prev => {
      const next = new Set(prev);
      next.delete(sourceId);
      return next;
    });
    setSyncedIds(prev => new Set(prev).add(sourceId));
  };

  // Handle resync all sources
  const handleResyncAll = async () => {
    if (!sources) return;

    const staleSources = sources.filter(s => getSyncStatus(s) === 'needs_sync');
    const ids = new Set(staleSources.map(s => s.id));

    setSyncingIds(ids);

    // Simulate API calls (replace with actual sync logic)
    await Promise.all(
      staleSources.map(s => new Promise(resolve => setTimeout(resolve, 2000)))
    );

    setSyncingIds(new Set());
    setSyncedIds(prev => {
      const next = new Set(prev);
      staleSources.forEach(s => next.add(s.id));
      return next;
    });
  };

  // Handle sync all from warning modal
  const handleSyncAllFromModal = async () => {
    await handleResyncAll();
    setShowUnsyncedWarning(false);
  };

  // Get enriched sources with sync status
  const getEnrichedSources = (): SourceWithSyncStatus[] => {
    if (!sources) return [];
    return sources.map(source => ({
      ...source,
      syncStatus: getSyncStatus(source)
    }));
  };

  // Status Badge Component
  const StatusBadge = ({ status }: { status: SourceSyncStatus }) => {
    const prefersReducedMotion = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (status === 'synced') {
      return (
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: 'easeOut' }}
          className="flex items-center"
        >
          <CheckCircle className="h-5 w-5 text-green-500" />
        </motion.div>
      );
    }

    if (status === 'syncing') {
      return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    }

    // needs_sync
    return (
      <motion.div
        animate={prefersReducedMotion ? {} : {
          opacity: [1, 0.5, 1],
          scale: [1, 1.05, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600">
          Needs Sync
        </Badge>
      </motion.div>
    );
  };

  // Step 0: Verify Connections
  const renderConnectionsStep = () => {
    const enrichedSources = getEnrichedSources();
    const needsSyncCount = enrichedSources.filter(s => s.syncStatus === 'needs_sync').length;
    const syncingCount = enrichedSources.filter(s => s.syncStatus === 'syncing').length;
    const syncedCount = enrichedSources.filter(s => s.syncStatus === 'synced').length;
    const anySyncing = syncingCount > 0;
    const prefersReducedMotion = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        {/* Warning Banner */}
        {needsSyncCount > 0 && (
          <motion.div
            animate={prefersReducedMotion ? {} : {
              borderWidth: ['2px', '4px', '2px'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950 border-amber-400 dark:border-amber-600 rounded-lg"
          >
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-amber-900 dark:text-amber-100">
                Some wallets need syncing before generating forms
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                {needsSyncCount} {needsSyncCount === 1 ? 'source needs' : 'sources need'} to be synced for accurate results.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleResyncAll}
              disabled={anySyncing}
              className="border-amber-400 text-amber-900 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-100 dark:hover:bg-amber-900"
            >
              {anySyncing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync All Now
                </>
              )}
            </Button>
          </motion.div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Verify Your Connections</CardTitle>
            <CardDescription>
              Make sure all sources are synced before generating forms
              {anySyncing && (
                <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium">
                  ({syncedCount}/{enrichedSources.length} synced)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {enrichedSources.map(source => {
              const { syncStatus } = source;
              const isSyncing = syncStatus === 'syncing';

              // Determine border and background colors based on status
              let borderColor = 'border-gray-200 dark:border-gray-700';
              let bgColor = 'bg-white dark:bg-gray-900';

              if (syncStatus === 'synced') {
                borderColor = 'border-green-500';
                bgColor = 'bg-green-50 dark:bg-green-950';
              } else if (syncStatus === 'needs_sync') {
                borderColor = 'border-orange-500';
                bgColor = 'bg-orange-50 dark:bg-orange-950';
              } else if (syncStatus === 'syncing') {
                borderColor = 'border-blue-500';
                bgColor = 'bg-blue-50 dark:bg-blue-950';
              }

              return (
                <motion.div
                  key={source.id}
                  layout
                  className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${borderColor} ${bgColor}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{source.sourceName}</p>
                      <StatusBadge status={syncStatus} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Last synced: {formatRelativeTime(source.lastSyncedAt)}
                    </p>
                    {source.transactionCount > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {source.transactionCount.toLocaleString()} transactions
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResync(source.id)}
                    disabled={isSyncing}
                  >
                    {isSyncing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Resync
                      </>
                    )}
                  </Button>
                </motion.div>
              );
            })}

            {/* Resync All Button */}
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleResyncAll}
              disabled={anySyncing || needsSyncCount === 0}
            >
              {anySyncing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Syncing {syncedCount}/{enrichedSources.length}...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resync All
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Step 1: Select Tax Year
  const renderTaxYearStep = () => {
    const summaryByYear: Record<number, { transactionCount: number; netGainLoss: number } | undefined> = {
      2023: summary2023,
      2024: summary2024,
      2025: summary2025,
    };
    const years = [2023, 2024, 2025];

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Select Tax Year</h2>
          <p className="text-muted-foreground">Choose the year you want to generate forms for</p>
        </div>
        <div className="grid gap-4">
          {years.map(year => {
            const summary = summaryByYear[year];
            const transactionCount = summary?.transactionCount ?? 0;
            const yearPnL = summary?.netGainLoss ?? 0;

            return (
              <Card
                key={year}
                className={`cursor-pointer transition-all hover:border-primary ${formData.taxYear === year ? 'border-primary border-2 bg-primary/5' : ''}`}
                onClick={() => setFormData({ ...formData, taxYear: year })}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">{year}</h3>
                      <p className="text-muted-foreground">{transactionCount} transactions</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">Net P&amp;L</p>
                      <p className={`text-lg font-semibold ${yearPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${Math.abs(yearPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>
    );
  };

  // Step 2: Select Tax Method
  const renderTaxMethodStep = () => {
    const TAX_METHODS = [
      {
        id: 'FIFO' as TaxMethod,
        name: 'FIFO',
        fullName: 'First-In, First-Out',
        description: 'Sell oldest assets first',
        pros: ['Simple to understand', 'IRS default method', 'Widely accepted'],
        cons: ['Higher taxes in bull markets', 'May realize more gains'],
        icon: TrendingUp,
        color: 'blue'
      },
      {
        id: 'LIFO' as TaxMethod,
        name: 'LIFO',
        fullName: 'Last-In, First-Out',
        description: 'Sell newest assets first',
        pros: ['Lower gains in rising markets', 'Tax deferral strategy'],
        cons: ['Not accepted by all exchanges', 'Complex tracking'],
        icon: TrendingDown,
        color: 'purple'
      },
      {
        id: 'HIFO' as TaxMethod,
        name: 'HIFO',
        fullName: 'Highest-In, First-Out',
        description: 'Sell highest cost basis first',
        pros: ['Minimizes capital gains', 'Optimal tax savings', 'IRS approved'],
        cons: ['Requires detailed records', 'More complex calculations'],
        icon: ArrowUp,
        color: 'green'
      },
    ];

    const getEstimatedTax = (methodId: string): number => {
      switch(methodId) {
        case 'FIFO': return fifoSummary?.estimatedTax ?? 0;
        case 'LIFO': return lifoSummary?.estimatedTax ?? 0;
        case 'HIFO': return hifoSummary?.estimatedTax ?? 0;
        default: return 0;
      }
    };

    const maxEstimatedTax = Math.max(
      fifoSummary?.estimatedTax ?? 0,
      lifoSummary?.estimatedTax ?? 0,
      hifoSummary?.estimatedTax ?? 0
    );

    const prefersReducedMotion = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Choose Your Cost Basis Method</h2>
          <p className="text-muted-foreground">Select the tax calculation method that works best for you</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TAX_METHODS.map(method => {
            const Icon = method.icon;
            const isSelected = formData.taxMethod === method.id;
            const estimatedTax = getEstimatedTax(method.id);
            const taxSavings = maxEstimatedTax - estimatedTax;

            return (
              <motion.div
                key={method.id}
                whileHover={prefersReducedMotion ? {} : { y: -4 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative"
              >
                <Card
                  className={cn(
                    'cursor-pointer transition-all duration-300 h-full',
                    isSelected
                      ? 'border-blue-500 border-2 bg-blue-50/50 dark:bg-blue-950/20 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                  onClick={() => setFormData({ ...formData, taxMethod: method.id })}
                >
                  {/* Selected Checkmark */}
                  {isSelected && (
                    <motion.div
                      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: 10, y: -10 }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      transition={{
                        duration: prefersReducedMotion ? 0 : 0.3,
                        type: prefersReducedMotion ? 'tween' : 'spring',
                        bounce: 0.4
                      }}
                      className="absolute -top-2 -right-2 z-10"
                    >
                      <div className="bg-blue-500 rounded-full p-1 shadow-lg">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                    </motion.div>
                  )}

                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className={cn(
                        'p-3 rounded-lg transition-colors',
                        isSelected
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                      )}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <CardTitle className="text-xl">{method.name}</CardTitle>
                    <CardDescription className="font-medium">{method.fullName}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{method.description}</p>

                    {/* Pros */}
                    <div>
                      <h4 className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Pros
                      </h4>
                      <ul className="space-y-1">
                        {method.pros.map((pro, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Cons */}
                    <div>
                      <h4 className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Cons
                      </h4>
                      <ul className="space-y-1">
                        {method.cons.map((con, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="text-orange-500 mt-0.5">!</span>
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Estimated Tax Impact */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-muted-foreground">Estimated Tax:</span>
                        <span className={cn(
                          'text-sm font-bold',
                          estimatedTax < maxEstimatedTax ? 'text-green-600' : 'text-gray-700 dark:text-gray-300'
                        )}>
                          ${estimatedTax.toLocaleString()}
                        </span>
                      </div>
                      {taxSavings > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Potential Savings:</span>
                          <span className="text-sm font-semibold text-green-600">
                            ${taxSavings.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Radio Button Visual */}
                    <div className="flex items-center justify-center pt-2">
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                        isSelected
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                      )}>
                        {isSelected && (
                          <motion.div
                            initial={prefersReducedMotion ? { scale: 1 } : { scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                            className="w-2 h-2 bg-white rounded-full"
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Learn More Section */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-muted-foreground text-center">
            <span className="font-medium">Not sure which method to choose?</span> FIFO is the IRS default and simplest option.
            HIFO typically provides the best tax savings if you have detailed transaction records.
          </p>
        </div>
      </motion.div>
    );
  };

  // Step 3: Review Summary
  const renderReviewStep = () => {
    const summary = selectedYearSummary;

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Review Your Tax Summary</h2>
          <p className="text-muted-foreground">Make sure everything looks correct before generating forms</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Total Capital Gains</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${(summary?.totalGains ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Total Capital Losses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${(summary?.totalLosses ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Net Gain/Loss</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${(summary?.netGainLoss ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(summary?.netGainLoss ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Transactions Included</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{summary?.transactionCount ?? 0}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Breakdown by Term</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Short-term</TableHead>
                  <TableHead>Long-term</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Gains</TableCell>
                  <TableCell>${(summary?.shortTermGains ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell>${(summary?.longTermGains ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Losses</TableCell>
                  <TableCell>${(summary?.shortTermLosses ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell>${(summary?.longTermLosses ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          Based on {formData.taxMethod} method for tax year {formData.taxYear}
        </div>
      </motion.div>
    );
  };

  // Step 4: Preview Forms
  const renderPreviewStep = () => {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Preview Your Tax Forms</h2>
          <p className="text-muted-foreground">Review the forms before final generation</p>
        </div>

        <Tabs defaultValue="form8949" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form8949">Form 8949</TabsTrigger>
            <TabsTrigger value="scheduleD">Schedule D</TabsTrigger>
          </TabsList>
          <TabsContent value="form8949">
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">
                  Form 8949 preview will be generated
                </p>
                <p className="text-sm text-muted-foreground">
                  This form includes all {selectedYearSummary?.transactionCount || 0} taxable transactions
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="scheduleD">
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">
                  Schedule D preview will be generated
                </p>
                <p className="text-sm text-muted-foreground">
                  Summary of capital gains and losses
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    );
  };

  // Step 5: Generating
  const renderGeneratingStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <GeneratingAnimation />
    </motion.div>
  );

  // Step 6: Success
  const renderSuccessStep = () => {
    const prefersReducedMotion = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleDownload = async (format: string = 'pdf') => {
      if (!generatedFormId) return;

      try {
        const { blob, filename } = await downloadFormMutation.mutateAsync({
          formId: generatedFormId,
          format,
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Download failed:', error);
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center py-12"
      >
        <motion.div
          initial={prefersReducedMotion ? { scale: 1, y: 0 } : { scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.6,
            ease: prefersReducedMotion ? 'linear' : [0.34, 1.56, 0.64, 1]
          }}
          className="mb-6"
        >
          <MascotImage
            mascot="mascot-sitting-on-money.png"
            alt="Success mascot sitting on money"
            size={200}
          />
        </motion.div>

        <h2 className="text-3xl font-bold mt-2 mb-2">Your tax forms are ready!</h2>
        <p className="text-muted-foreground mb-8">Download your forms or view them in your documents</p>

        <div className="space-y-3 w-full max-w-md">
          <Button
            className="w-full"
            size="lg"
            onClick={() => router.push('/view-forms')}
          >
            <FileText className="mr-2 h-5 w-5" />
            View Forms
          </Button>
          <Button
            className="w-full"
            variant="outline"
            size="lg"
            onClick={() => handleDownload('pdf')}
            disabled={downloadFormMutation.isPending}
          >
            <Download className="mr-2 h-5 w-5" />
            {downloadFormMutation.isPending ? 'Downloading...' : 'Download Form 8949 PDF'}
          </Button>
          <Button
            className="w-full"
            variant="outline"
            size="lg"
            onClick={() => handleDownload('scheduled')}
            disabled={downloadFormMutation.isPending}
          >
            <Download className="mr-2 h-5 w-5" />
            Download Schedule D PDF
          </Button>
          <Button
            className="w-full"
            variant="ghost"
            size="lg"
            onClick={() => handleDownload('csv')}
            disabled={downloadFormMutation.isPending}
          >
            <Download className="mr-2 h-5 w-5" />
            Download CSV (for TurboTax/TaxAct)
          </Button>
        </div>

        <div className="flex gap-4 mt-8">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </motion.div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: return renderConnectionsStep();
      case 1: return renderTaxYearStep();
      case 2: return renderTaxMethodStep();
      case 3: return renderReviewStep();
      case 4: return renderPreviewStep();
      case 5: return renderGeneratingStep();
      case 6: return renderSuccessStep();
      default: return null;
    }
  };

  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {currentStep < 5 && <WizardStepper currentStep={currentStep + 1} steps={STEPS} />}

        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        {currentStep < 5 && (
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                Cancel
              </Button>
              {currentStep === 4 ? (
                <Button onClick={handleGenerateForms}>
                  Generate Forms
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Continue
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Unsynced Sources Warning Modal */}
      <AnimatePresence>
        {showUnsyncedWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowUnsyncedWarning(false)}
          >
            <motion.div
              initial={prefersReducedMotion ? { scale: 1, x: 0 } : { scale: 0.9, x: [0, 10, -10, 5, -5, 0] }}
              animate={{ scale: 1, x: 0 }}
              exit={prefersReducedMotion ? { scale: 1 } : { scale: 0.9 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.4,
                ease: 'easeOut'
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white dark:bg-gray-900 rounded-xl p-8 max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-800"
            >
              {/* Close button */}
              <button
                onClick={() => setShowUnsyncedWarning(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Mascot */}
              <div className="flex justify-center mb-6">
                <MascotImage
                  mascot="mascot-stressed-panicking.png"
                  alt="Warning mascot stressed and panicking"
                  size={150}
                />
              </div>

              {/* Warning Message */}
              <h3 className="text-2xl font-bold text-center mb-3">
                Hold on! Some wallets need syncing first!
              </h3>
              <p className="text-muted-foreground text-center mb-6">
                To ensure accurate tax calculations, all your wallets must be synced before generating forms.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleSyncAllFromModal}
                >
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Sync All Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowUnsyncedWarning(false)}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
