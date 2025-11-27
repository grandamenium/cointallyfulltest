'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { PageTransition } from '@/components/layout/PageTransition';
import { MetricsCards } from '@/components/features/dashboard/MetricsCards';
import { RatingBadge } from '@/components/features/dashboard/RatingBadge';
import { PnLChart } from '@/components/features/dashboard/PnLChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useConnectedSources } from '@/hooks/useWallets';
import { useTransactions, useTransactionStats } from '@/hooks/useTransactions';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils/format';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardSkeleton } from '@/components/loading/transaction-skeleton';
import { MascotModal } from '@/components/ui/MascotModal';
import { MascotToast } from '@/components/ui/MascotToast';
import { getFullName } from '@/lib/utils/user';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: sources, isLoading: isLoadingSources } = useConnectedSources();
  const { data: transactions, isLoading: isLoadingTransactions } = useTransactions();
  const { data: stats } = useTransactionStats();

  const taxYear = user?.taxInfo?.filingYear || new Date().getFullYear();

  const { data: summary } = useQuery({
    queryKey: ['transactions', 'summary', taxYear],
    queryFn: () => apiClient.get<{
      totalGains: number;
      totalLosses: number;
      netGainLoss: number;
      estimatedTax: number;
      shortTermGains: number;
      longTermGains: number;
      transactionCount: number;
      taxYear: number;
    }>(`/transactions/summary?year=${taxYear}`),
    enabled: !!user,
  });

  // Modal and toast states
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showUncategorizedToast, setShowUncategorizedToast] = useState(false);
  const [showPnLToast, setShowPnLToast] = useState(false);

  // Get rating and counts from stats API
  const rating = stats?.categorizationRate ?? 0;
  const uncategorizedCount = stats?.uncategorizedCount ?? 0;

  const totalGains = summary?.totalGains || 0;
  const totalLosses = summary?.totalLosses || 0;
  const netGainLoss = summary?.netGainLoss || 0;
  const estimatedTax = summary?.estimatedTax || 0;
  const shortTermGains = summary?.shortTermGains || 0;
  const longTermGains = summary?.longTermGains || 0;

  // Check for first visit
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasVisited = localStorage.getItem('hasVisitedDashboard');
      if (!hasVisited) {
        setShowWelcomeModal(true);
      }

      // Show uncategorized toast if >50 uncategorized
      if (uncategorizedCount > 50) {
        setShowUncategorizedToast(true);
      }

      // Show P&L achievement toast for milestones
      const pnlMilestones = [25000, 50000, 100000];
      const lastMilestone = localStorage.getItem('lastPnLMilestone');
      const currentMilestone = pnlMilestones.find(m => netGainLoss >= m && (!lastMilestone || parseInt(lastMilestone) < m));

      if (currentMilestone) {
        setShowPnLToast(true);
        localStorage.setItem('lastPnLMilestone', currentMilestone.toString());
      }
    }
  }, [uncategorizedCount, netGainLoss]);

  const handleWelcomeClose = () => {
    setShowWelcomeModal(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasVisitedDashboard', 'true');
    }
  };

  // Show loading skeleton while data is loading
  if (isLoadingSources || isLoadingTransactions) {
    return (
      <PageTransition>
        <DashboardSkeleton />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
        {/* Mascot Modal - Welcome */}
        <MascotModal
          isOpen={showWelcomeModal}
          onClose={handleWelcomeClose}
          mascotImage="mascot-at-desk-analyzing-charts.png"
          title="Welcome to CoinTally!"
          message="Let's set up your crypto tax calculations and get you organized for tax season."
          buttonText="Got it"
        />

        {/* Mascot Toast - Uncategorized */}
        <AnimatePresence>
          {showUncategorizedToast && (
            <MascotToast
              mascotImage="mascot-stressed-panicking.png"
              message={`Yikes! You have ${uncategorizedCount} transactions to categorize!`}
              buttonText="Let's fix this!"
              buttonAction={() => (window.location.href = '/transactions')}
              onClose={() => setShowUncategorizedToast(false)}
              variant="warning"
              position="top-right"
              duration={6000}
            />
          )}
        </AnimatePresence>

        {/* Mascot Toast - P&L Achievement */}
        <AnimatePresence>
          {showPnLToast && (
            <MascotToast
              mascotImage="mascot-sitting-on-money.png"
              message="Nice! Your portfolio is looking great!"
              onClose={() => setShowPnLToast(false)}
              variant="success"
              position="bottom-right"
              duration={5000}
            />
          )}
        </AnimatePresence>

        <div className="space-y-6">
        {/* Uncategorized Alert */}
        {uncategorizedCount > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                You have {uncategorizedCount} uncategorized transaction
                {uncategorizedCount !== 1 ? 's' : ''} that need attention
              </span>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-4"
                  onClick={() => (window.location.href = '/transactions')}
                >
                  Review Now
                </Button>
              </motion.div>
            </AlertDescription>
          </Alert>
        )}

        {/* Welcome Section with Rating */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Welcome back, {getFullName(user)}!</h1>
            <p className="text-muted-foreground">
              Here&apos;s your crypto tax summary for {user?.taxInfo?.filingYear || new Date().getFullYear()}
            </p>
          </div>
          <RatingBadge rating={rating} />
        </div>

        {/* Metrics Cards */}
        <MetricsCards
          totalPnL={netGainLoss}
          totalGains={totalGains}
          totalLosses={totalLosses}
          estimatedTax={estimatedTax}
          shortTermGains={shortTermGains}
          longTermGains={longTermGains}
        />

        {/* Portfolio Performance Chart */}
        <PnLChart />

        {/* Connected Sources */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Connected Sources</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Click any source to view transactions
                </p>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm" onClick={() => (window.location.href = '/wallets')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Source
                </Button>
              </motion.div>
            </div>
          </CardHeader>
          <CardContent>
            {!sources ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : sources.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <p className="mb-4 text-muted-foreground">No sources connected yet</p>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button onClick={() => (window.location.href = '/wallets')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Wallet or Exchange
                  </Button>
                </motion.div>
              </div>
            ) : (
              <motion.div
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
                initial="hidden"
                animate="visible"
              >
                {sources.map((source, index) => {
                  const needsSync = new Date().getTime() - new Date(source.lastSyncedAt).getTime() > 1000 * 60 * 60 * 24;

                  return (
                    <motion.div
                      key={source.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                      }}
                      whileHover={{
                        scale: 1.02,
                        boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                        transition: { duration: 0.25 }
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className="cursor-pointer relative overflow-hidden border-2 transition-colors duration-250"
                        onClick={() => (window.location.href = `/transactions?source=${source.id}`)}
                        style={{
                          borderColor: needsSync ? 'hsl(var(--destructive) / 0.3)' : 'transparent'
                        }}
                      >
                        {needsSync && (
                          <motion.div
                            className="absolute top-2 right-2"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Badge variant="destructive" className="text-xs">
                              Needs Sync
                            </Badge>
                          </motion.div>
                        )}
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-b from-[#14BEFF] to-[#3F6EFF]">
                                <span className="font-bold text-white">{source.sourceName[0]}</span>
                              </div>
                              <div>
                                <h4 className="font-semibold">{source.sourceName}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {source.sourceType}
                                </Badge>
                              </div>
                            </div>
                            {!needsSync && (
                              <Badge
                                variant={source.status === 'connected' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {source.status}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-4 space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Last synced:</span>
                              <span className="text-xs">
                                {formatRelativeTime(new Date(source.lastSyncedAt))}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Transactions:</span>
                              <span className="font-medium">{source.transactionCount}</span>
                            </div>
                          </div>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3 w-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle resync with rotation animation
                              }}
                              aria-label={`Resync wallet data for ${source.sourceName}`}
                            >
                              <motion.div
                                whileTap={{ rotate: 360 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center"
                              >
                                <RefreshCw className="mr-2 h-3 w-3" />
                              </motion.div>
                              Resync
                            </Button>
                          </motion.div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <motion.div
                whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  className="h-auto flex-col gap-2 py-6 w-full"
                  onClick={() => (window.location.href = '/new-form')}
                >
                  <span className="text-lg">📄</span>
                  <span>Get My Tax Forms</span>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="h-auto flex-col gap-2 py-6 w-full"
                  onClick={() => (window.location.href = '/wallets')}
                >
                  <span className="text-lg">➕</span>
                  <span>Add New Source</span>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="h-auto flex-col gap-2 py-6 w-full"
                  onClick={() => (window.location.href = '/transactions')}
                >
                  <span className="text-lg">📊</span>
                  <span>Export Transactions</span>
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Last synced: {formatRelativeTime(new Date(Date.now() - 1000 * 60 * 15))}</p>
        </div>
      </div>
      </PageTransition>
  );
}
