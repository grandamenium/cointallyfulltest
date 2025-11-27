'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { PageTransition } from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, RefreshCw, Trash2, Edit } from 'lucide-react';
import { useConnectedSources, useResyncSource, useDisconnectSource, useConnectSource } from '@/hooks/useWallets';
import { formatRelativeTime } from '@/lib/utils/format';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { AddWalletModal } from '@/components/features/wallets/AddWalletModal';
import { ConnectionType } from '@/types/wallet';
import { MascotImage } from '@/components/ui/MascotImage';
import { MascotToast } from '@/components/ui/MascotToast';
import CountUp from 'react-countup';
import { JobProgressIndicator } from '@/components/features/jobs/JobProgressIndicator';

export default function WalletsPage() {
  const queryClient = useQueryClient();
  const { data: sources, isLoading } = useConnectedSources();
  const resyncMutation = useResyncSource();
  const disconnectMutation = useDisconnectSource();
  const connectSource = useConnectSource();
  const [showAddModal, setShowAddModal] = useState(false);

  // Mascot toast states
  const [showSyncErrorToast, setShowSyncErrorToast] = useState(false);
  const [showAllSyncedToast, setShowAllSyncedToast] = useState(false);
  const [errorSourceName, setErrorSourceName] = useState('');

  // Job tracking for each source
  const [syncingJobs, setSyncingJobs] = useState<Record<string, string>>({});

  const handleResync = async (sourceId: string, sourceName: string) => {
    try {
      const response = await resyncMutation.mutateAsync(sourceId);

      if (response.jobId) {
        setSyncingJobs(prev => ({ ...prev, [sourceId]: response.jobId }));
        toast.success(`${sourceName} sync started`);
      }
    } catch (error) {
      setErrorSourceName(sourceName);
      setShowSyncErrorToast(true);
    }
  };

  const handleJobComplete = (sourceId: string) => {
    setSyncingJobs(prev => {
      const newJobs = { ...prev };
      delete newJobs[sourceId];
      return newJobs;
    });

    const allSynced = sources?.every(s =>
      s.status === 'connected' || s.id === sourceId
    );

    if (allSynced && sources && sources.length > 0) {
      setShowAllSyncedToast(true);
    }
  };

  const handleJobError = (sourceId: string, error: string) => {
    setSyncingJobs(prev => {
      const newJobs = { ...prev };
      delete newJobs[sourceId];
      return newJobs;
    });

    queryClient.invalidateQueries({ queryKey: ['connected-sources'] });

    const source = sources?.find(s => s.id === sourceId);
    if (source) {
      setErrorSourceName(source.sourceName);
      setShowSyncErrorToast(true);
    }
  };

  const handleDisconnect = async (sourceId: string, sourceName: string) => {
    if (confirm(`Are you sure you want to disconnect ${sourceName}? This will remove all associated transaction data.`)) {
      try {
        await disconnectMutation.mutateAsync(sourceId);
        toast.success(`${sourceName} disconnected`);
      } catch (error) {
        toast.error('Failed to disconnect source');
      }
    }
  };

  const handleConnect = async (sourceId: string, connectionType: ConnectionType, credentials: Record<string, string>) => {
    try {
      await connectSource.mutateAsync({ sourceId, connectionType, credentials });
      toast.success('Source connected successfully!');
      setShowAddModal(false);
    } catch (error) {
      toast.error('Failed to connect source');
      throw error; // Re-throw to let ConnectionMethodSelector handle it
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'syncing':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'connected':
        return 'default';
      case 'syncing':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getSourceTypeGradient = (sourceType: string) => {
    switch (sourceType.toLowerCase()) {
      case 'blockchain':
      case 'wallet':
        return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'; // Blue
      case 'exchange':
        return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'; // Purple
      case 'defi':
        return 'linear-gradient(135deg, #10b981 0%, #059669 100%)'; // Green
      default:
        return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'; // Gray
    }
  };

  const needsSync = (lastSyncedAt: string | Date) => {
    const syncDate = typeof lastSyncedAt === 'string' ? new Date(lastSyncedAt) : lastSyncedAt;
    return new Date().getTime() - syncDate.getTime() > 1000 * 60 * 60 * 24;
  };

  return (
    <PageTransition>
        {/* Mascot Toast - Sync Error */}
        <AnimatePresence>
          {showSyncErrorToast && (
            <MascotToast
              mascotImage="mascot-stressed-panicking.png"
              message={`Oops! We couldn't sync ${errorSourceName}. Try again?`}
              buttonText="Retry"
              buttonAction={() => {
                const source = sources?.find(s => s.sourceName === errorSourceName);
                if (source) handleResync(source.id, source.sourceName);
              }}
              onClose={() => setShowSyncErrorToast(false)}
              variant="error"
              position="top-right"
              autoClose={false}
            />
          )}
        </AnimatePresence>

        {/* Mascot Toast - All Synced */}
        <AnimatePresence>
          {showAllSyncedToast && (
            <MascotToast
              mascotImage="mascot-sitting-on-money.png"
              message="All wallets up to date! 🎉"
              onClose={() => setShowAllSyncedToast(false)}
              variant="success"
              position="bottom-right"
              duration={4000}
            />
          )}
        </AnimatePresence>

        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-heading font-bold">Connected Sources</h2>
            <p className="text-muted-foreground">
              Manage your wallets, exchanges, and blockchain connections
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Source
            </Button>
          </motion.div>
        </div>

        {/* Sources Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sources && sources.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sources.map((source) => {
              const sourceNeedsSync = needsSync(source.lastSyncedAt);

              return (
                <motion.div
                  key={source.id}
                  whileHover={{
                    y: -6,
                    boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className="relative overflow-hidden border-2 transition-all duration-300"
                    style={{
                      borderImage: `${getSourceTypeGradient(source.sourceType)} 1`,
                      borderImageSlice: 1,
                    }}
                  >
                    {sourceNeedsSync && (
                      <motion.div
                        className="absolute top-2 right-2 z-10"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Badge variant="destructive" className="text-xs">
                          Needs Sync
                        </Badge>
                      </motion.div>
                    )}
                    <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Logo and Info */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-b from-[#14BEFF] to-[#3F6EFF]">
                        <span className="text-xl font-bold text-white">
                          {source.sourceName[0]}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{source.sourceName}</h3>
                        {source.label && (
                          <p className="text-xs text-muted-foreground">{source.label}</p>
                        )}
                        <Badge variant="outline" className="mt-1 text-xs">
                          {source.sourceType}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`Actions for ${source.sourceName}`}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleResync(source.id, source.sourceName)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Resync
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Label
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDisconnect(source.id, source.sourceName)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Disconnect
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Connection Details */}
                  <div className="mt-4 space-y-2 text-sm">
                    {source.address && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Address:</span>
                        <span className="font-mono text-xs">
                          {source.address.slice(0, 6)}...{source.address.slice(-4)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Method:</span>
                      <Badge variant="secondary" className="text-xs">
                        {source.connectionType}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={getStatusBadgeVariant(source.status)} className="text-xs">
                        {source.status}
                      </Badge>
                    </div>

                    {syncingJobs[source.id] && (
                      <div className="mt-3">
                        <JobProgressIndicator
                          jobId={syncingJobs[source.id]}
                          sourceName={source.sourceName}
                          onComplete={() => handleJobComplete(source.id)}
                          onError={(error) => handleJobError(source.id, error)}
                        />
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last synced:</span>
                      <span className="text-xs">
                        {formatRelativeTime(new Date(source.lastSyncedAt))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transactions:</span>
                      <span className="font-medium tabular-nums">
                        <CountUp end={source.transactionCount} duration={1.5} />
                      </span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-4 flex gap-2">
                    <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleResync(source.id, source.sourceName)}
                        disabled={resyncMutation.isPending}
                      >
                        {resyncMutation.isPending ? (
                          <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-2 h-3 w-3" />
                        )}
                        Resync
                      </Button>
                    </motion.div>
                    <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => window.location.href = `/transactions?source=${source.id}`}
                      >
                        View Txns
                      </Button>
                    </motion.div>
                  </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          // Empty State with Mascot
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="mb-6"
              >
                <MascotImage
                  mascot="mascot-holding-bitcoin.png"
                  alt="Connect your first wallet"
                  size={200}
                  className="mx-auto"
                />
              </motion.div>
              <h3 className="mb-2 text-2xl font-semibold">Connect your first wallet to get started!</h3>
              <p className="mb-6 text-muted-foreground max-w-md">
                Link your wallets and exchanges to automatically track your crypto transactions and calculate taxes
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={() => setShowAddModal(true)} size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Add Wallet
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* AddWalletModal */}
      <AddWalletModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onConnect={handleConnect}
      />
    </PageTransition>
  );
}

function Wallet({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}
