'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInfiniteTransactions, useCategorizeTransaction, useBulkCategorizeTransactions, useUpdateTransaction, useTransactionStats } from '@/hooks/useTransactions';
import { useConnectedSources } from '@/hooks/useWallets';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { apiClient } from '@/lib/api/client';
import { Skeleton } from '@/components/ui/skeleton';
import { RatingBadge } from '@/components/features/dashboard/RatingBadge';
import { CategorizationModal } from '@/components/features/transactions/CategorizationModal';
import { TransactionEditorModal, TransactionFormData } from '@/components/features/transactions/TransactionEditorModal';
import { TransactionFilters } from '@/components/features/transactions/TransactionFilters';
import { SmartSearch } from '@/components/features/transactions/SmartSearch';
import { CategoryQuickPicker } from '@/components/features/transactions/CategoryQuickPicker';
import { BulkActionBar } from '@/components/features/transactions/BulkActionBar';
import { MascotModal } from '@/components/ui/MascotModal';
import { MascotToast } from '@/components/ui/MascotToast';
import { AlertCircle, ChevronUp, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Transaction } from '@/types/transaction';
import { CSVImportModal } from '@/components/features/transactions/CSVImportModal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<{
    sourceId?: string;
    type?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
  }>({});

  const {
    data: transactionsData,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteTransactions(filters);
  const { data: connectedSources } = useConnectedSources();
  const { data: stats } = useTransactionStats();

  const transactions = useMemo(() => {
    if (!transactionsData?.pages) return [];
    return transactionsData.pages.flatMap((page) => page.data);
  }, [transactionsData]);

  const totalTransactions = transactionsData?.pages[0]?.pagination.total || 0;
  const categorizeTransaction = useCategorizeTransaction();
  const bulkCategorizeTransactions = useBulkCategorizeTransactions();
  const updateTransaction = useUpdateTransaction();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTransactionIndex, setCurrentTransactionIndex] = useState(0);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const hasAutoOpenedRef = useRef(false);

  // Multi-select state
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());

  // Bulk action modals
  const [bulkCategorizeModalOpen, setBulkCategorizeModalOpen] = useState(false);
  const [bulkCategorySelection, setBulkCategorySelection] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingBulkSelect, setPendingBulkSelect] = useState(false);
  const [bulkCategorizeAllUncategorized, setBulkCategorizeAllUncategorized] = useState(false);

  // Mascot states
  const [showUncategorizedModal, setShowUncategorizedModal] = useState(false);
  const [showBulkSuccessToast, setShowBulkSuccessToast] = useState(false);
  const [bulkCategorizedCount, setBulkCategorizedCount] = useState(0);

  // CSV Import modal
  const [csvImportOpen, setCsvImportOpen] = useState(false);

  // Transaction Editor modal
  const [editorModalOpen, setEditorModalOpen] = useState(false);

  // Get rating from stats API
  const rating = stats?.categorizationRate ?? 0;

  // Get uncategorized transactions
  const uncategorizedTransactions = transactions.filter((t) => !t.isCategorized);
  const currentTransaction = uncategorizedTransactions[currentTransactionIndex] as Transaction | undefined;

  // Auto-open modal ONLY when navigating with ?categorize=true param
  useEffect(() => {
    if (!isLoading && !hasAutoOpenedRef.current && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('categorize') === 'true' && uncategorizedTransactions.length > 0) {
        setModalOpen(true);
        hasAutoOpenedRef.current = true;
      }

      // Show uncategorized warning modal if >50 uncategorized
      const uncatCount = stats?.uncategorizedCount ?? uncategorizedTransactions.length;
      if (uncatCount > 50 && typeof window !== 'undefined') {
        const hasSeenWarning = sessionStorage.getItem('hasSeenUncategorizedWarning');
        if (!hasSeenWarning) {
          setShowUncategorizedModal(true);
          sessionStorage.setItem('hasSeenUncategorizedWarning', 'true');
        }
      }
    }
  }, [isLoading, uncategorizedTransactions.length, stats?.uncategorizedCount]);

  // Handle pending bulk select after filter is applied and data is loaded
  useEffect(() => {
    if (pendingBulkSelect && !isLoading && filters.category === 'uncategorized' && transactions.length > 0) {
      const allIds = new Set(transactions.map(t => t.id));
      setSelectedTransactions(allIds);
      setBulkCategorizeModalOpen(true);
      setPendingBulkSelect(false);
    }
  }, [pendingBulkSelect, isLoading, filters.category, transactions]);

  const handleCategorize = async (category: string, description?: string) => {
    if (!currentTransaction) return;

    try {
      await categorizeTransaction.mutateAsync({
        id: currentTransaction.id,
        category,
        description,
      });

      toast.success('Transaction categorized!');

      if (currentTransactionIndex < uncategorizedTransactions.length - 1) {
        setCurrentTransactionIndex(currentTransactionIndex + 1);
      } else {
        setModalOpen(false);
        setCurrentTransactionIndex(0);
        toast.success('All transactions categorized!');
      }
    } catch (error) {
      toast.error('Failed to categorize transaction');
      throw error;
    }
  };

  const handleSkip = () => {
    if (currentTransactionIndex < uncategorizedTransactions.length - 1) {
      setCurrentTransactionIndex(currentTransactionIndex + 1);
    } else {
      setCurrentTransactionIndex(0);
      setModalOpen(false);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditorModalOpen(true);
  };

  const handleSaveTransaction = async (formData: TransactionFormData) => {
    if (!editingTransaction) return;

    await updateTransaction.mutateAsync({
      id: editingTransaction.id,
      date: formData.date,
      type: formData.type,
      asset: formData.asset,
      amount: formData.amount,
      valueUsd: formData.valueUsd,
      fee: formData.fee,
      feeUsd: formData.feeUsd,
      fromAddress: formData.fromAddress || undefined,
      toAddress: formData.toAddress || undefined,
      txHash: formData.txHash || undefined,
      category: formData.category,
      description: formData.description || undefined,
    });

    toast.success('Transaction updated!');
    setEditorModalOpen(false);
    setEditingTransaction(null);
  };

  // Multi-select handlers
  const toggleTransactionSelection = (transactionId: string) => {
    const newSelection = new Set(selectedTransactions);
    if (newSelection.has(transactionId)) {
      newSelection.delete(transactionId);
    } else {
      newSelection.add(transactionId);
    }
    setSelectedTransactions(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedTransactions.size === filteredTransactions.length) {
      setSelectedTransactions(new Set());
    } else {
      setSelectedTransactions(new Set(filteredTransactions.map(t => t.id)));
    }
  };

  const handleBulkCategorize = () => {
    if (selectedTransactions.size === 0) {
      toast.error('Please select transactions to categorize');
      return;
    }
    setBulkCategorizeModalOpen(true);
  };

  const handleBulkCategorizeConfirm = async () => {
    if (!bulkCategorySelection) {
      toast.error('Please select a category');
      return;
    }

    try {
      if (bulkCategorizeAllUncategorized) {
        await bulkCategorizeTransactions.mutateAsync({
          categorizeAllUncategorized: true,
          category: bulkCategorySelection,
        });
        toast.success(`Successfully categorized ${stats?.uncategorizedCount ?? 0} transactions`);
        setBulkCategorizeAllUncategorized(false);
      } else {
        await bulkCategorizeTransactions.mutateAsync({
          transactionIds: Array.from(selectedTransactions),
          category: bulkCategorySelection,
        });
        toast.success(`Successfully categorized ${selectedTransactions.size} transactions`);
        setSelectedTransactions(new Set());
      }
      setBulkCategorizeModalOpen(false);
      setBulkCategorySelection('');
    } catch (error) {
      toast.error('Failed to categorize transactions');
    }
  };

  const handleBulkExport = () => {
    const count = selectedTransactions.size;
    if (count === 0) {
      toast.error('Please select transactions to export');
      return;
    }

    const selectedTxs = transactions.filter(t => selectedTransactions.has(t.id));

    const csvHeaders = ['Date', 'Type', 'Asset', 'Amount', 'USD Value', 'Source', 'Category', 'Description'];
    const csvRows = selectedTxs.map(tx => [
      formatDate(new Date(tx.date)),
      tx.type,
      tx.asset,
      tx.amount.toString(),
      tx.valueUsd ? tx.valueUsd.toString() : '0',
      tx.sourceName || '',
      tx.category || 'Uncategorized',
      tx.description || ''
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${count} transactions to CSV`);
    setSelectedTransactions(new Set());
  };

  const handleBulkDelete = () => {
    if (selectedTransactions.size === 0) {
      toast.error('Please select transactions to delete');
      return;
    }
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const deletePromises = Array.from(selectedTransactions).map(id =>
        apiClient.request(`/transactions/${id}`, { method: 'DELETE' })
      );
      await Promise.all(deletePromises);
      toast.success(`Successfully deleted ${selectedTransactions.size} transactions`);
      setSelectedTransactions(new Set());
      setDeleteConfirmOpen(false);
    } catch (error) {
      toast.error('Failed to delete transactions');
    }
  };

  const handleQuickCategorize = async (transactionId: string, category: string) => {
    try {
      await categorizeTransaction.mutateAsync({
        id: transactionId,
        category,
      });
      toast.success('Transaction categorized!');
    } catch (error) {
      toast.error('Failed to categorize transaction');
      throw error;
    }
  };

  // Generate search suggestions
  const searchSuggestions = useMemo(() => {
    if (!transactions) return {};

    const assets = Array.from(new Set(transactions.map(t => t.asset)));
    const sources = Array.from(new Set(transactions.map(t => t.sourceName)));
    const categories = Array.from(new Set(transactions.map(t => t.category).filter(c => c !== 'uncategorized')));

    return { assets, sources, categories };
  }, [transactions]);

  // Filter transactions with memoization
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Search filter
      const matchesSearch = t.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.sourceName.toLowerCase().includes(searchTerm.toLowerCase());

      // Source filter
      if (filters.sourceId && t.sourceId !== filters.sourceId) {
        return false;
      }

      // Type filter
      if (filters.type && t.type !== filters.type) {
        return false;
      }

      // Category filter
      if (filters.category && t.category !== filters.category) {
        return false;
      }

      // Date range filters
      if (filters.dateFrom && new Date(t.date) < new Date(filters.dateFrom)) {
        return false;
      }

      if (filters.dateTo && new Date(t.date) > new Date(filters.dateTo)) {
        return false;
      }

      return matchesSearch;
    });
  }, [transactions, searchTerm, filters]);

  // Virtual scrolling setup
  const parentRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const rowVirtualizer = useVirtualizer({
    count: filteredTransactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Row height in pixels
    overscan: 10, // Render 10 extra rows above/below viewport
  });

  // Handle scroll for showing scroll-to-top button
  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) return;

    const handleScroll = () => {
      setShowScrollTop(parent.scrollTop > 500);
    };

    parent.addEventListener('scroll', handleScroll);
    return () => parent.removeEventListener('scroll', handleScroll);
  }, []);

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      buy: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 dark:border dark:border-green-700',
      sell: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 dark:border dark:border-red-700',
      'transfer-in': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 dark:border dark:border-blue-700',
      'transfer-out': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200 dark:border dark:border-orange-700',
      'self-transfer': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 dark:border dark:border-purple-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      uncategorized: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 dark:border dark:border-red-700',
      personal: 'bg-gray-100 text-gray-800 dark:bg-gray-800/70 dark:text-gray-200 dark:border dark:border-gray-600',
      'business-expense': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 dark:border dark:border-blue-700',
      'self-transfer': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 dark:border dark:border-purple-700',
      gift: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200 dark:border dark:border-pink-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  return (
    <div className="p-6">
      {/* Mascot Modal - Uncategorized Warning */}
      <MascotModal
        isOpen={showUncategorizedModal}
        onClose={() => setShowUncategorizedModal(false)}
        mascotImage="mascot-stressed-panicking.png"
        title="Let's tackle these together!"
        message="Want help categorizing? We can automatically categorize similar transactions."
        buttonText="I'll do it manually"
      />

      {/* Mascot Toast - Bulk Success */}
      <AnimatePresence>
        {showBulkSuccessToast && (
          <MascotToast
            mascotImage="mascot-at-desk-analyzing-charts.png"
            message={`Nice work! ${bulkCategorizedCount} transactions categorized!`}
            onClose={() => setShowBulkSuccessToast(false)}
            variant="success"
            position="bottom-right"
            duration={4000}
          />
        )}
      </AnimatePresence>

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedTransactions.size}
        onCategorize={handleBulkCategorize}
        onExport={handleBulkExport}
        onDelete={handleBulkDelete}
        onClearSelection={() => setSelectedTransactions(new Set())}
      />

      <div className="space-y-6">
        {/* Header with Rating */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Transactions</h1>
            <p className="text-muted-foreground">View and categorize all your crypto transactions</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setCsvImportOpen(true)} variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
            <RatingBadge rating={rating} />
          </div>
        </div>

        {/* Uncategorized Alert Banner */}
        {(stats?.uncategorizedCount ?? 0) > 0 && (
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="flex items-center justify-between text-red-800 dark:text-red-200">
              <span>
                You have {stats?.uncategorizedCount ?? 0} uncategorized transaction
                {(stats?.uncategorizedCount ?? 0) !== 1 ? 's' : ''} that need attention.
              </span>
              <div className="flex items-center gap-2 ml-4">
                {filters.category !== 'uncategorized' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-900 hover:bg-red-100 dark:border-red-700 dark:text-red-100 dark:hover:bg-red-900"
                    onClick={() => setFilters({ ...filters, category: 'uncategorized' })}
                  >
                    Show Only Uncategorized
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-900 hover:bg-red-100 dark:border-red-700 dark:text-red-100 dark:hover:bg-red-900"
                    onClick={() => setFilters({ ...filters, category: undefined })}
                  >
                    Show All
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-900 hover:bg-red-100 dark:border-red-700 dark:text-red-100 dark:hover:bg-red-900"
                  onClick={() => {
                    setBulkCategorizeAllUncategorized(true);
                    setBulkCategorizeModalOpen(true);
                  }}
                >
                  Bulk Categorize All ({stats?.uncategorizedCount ?? 0})
                </Button>
                <Button
                  variant="link"
                  className="h-auto p-0 text-red-900 dark:text-red-100"
                  onClick={() => {
                    setFilters({ ...filters, category: 'uncategorized' });
                    setCurrentTransactionIndex(0);
                    setModalOpen(true);
                    hasAutoOpenedRef.current = true;
                  }}
                >
                  Review One by One
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Smart Search */}
        <Card>
          <CardContent className="pt-6">
            <SmartSearch
              value={searchTerm}
              onChange={setSearchTerm}
              suggestions={searchSuggestions}
            />
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <TransactionFilters
              onFilterChange={setFilters}
              sources={connectedSources || []}
            />
          </CardContent>
        </Card>

        {/* Transactions Table with Virtual Scrolling */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredTransactions.length > 0 ? (
              <div
                ref={parentRef}
                className="overflow-auto"
                style={{ height: '600px' }}
              >
                {/* Sticky Table Header */}
                <div className="sticky top-0 z-10 bg-background border-b">
                  <Table>
                    <caption className="sr-only">
                      List of {filteredTransactions.length} cryptocurrency transactions
                    </caption>
                    <TableHeader>
                      <TableRow>
                        <TableHead scope="col" className="w-[50px]">
                          <Checkbox
                            checked={selectedTransactions.size === filteredTransactions.length && filteredTransactions.length > 0}
                            onCheckedChange={toggleSelectAll}
                            aria-label="Select all transactions"
                          />
                        </TableHead>
                        <TableHead scope="col" className="w-[120px]">Date</TableHead>
                        <TableHead scope="col" className="w-[100px]">Asset</TableHead>
                        <TableHead scope="col" className="w-[130px]">Type</TableHead>
                        <TableHead scope="col" className="w-[140px]">Amount</TableHead>
                        <TableHead scope="col" className="w-[120px]">Value (USD)</TableHead>
                        <TableHead scope="col" className="w-[140px]">Source</TableHead>
                        <TableHead scope="col" className="w-[140px]">Category</TableHead>
                        <TableHead scope="col" className="w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                  </Table>
                </div>

                {/* Virtual Rows Container */}
                <div
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const transaction = filteredTransactions[virtualRow.index];

                    return (
                      <div
                        key={transaction.id}
                        data-index={virtualRow.index}
                        ref={rowVirtualizer.measureElement}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <Table>
                          <TableBody>
                            <TableRow className="cursor-pointer hover:bg-muted/50">
                              <TableCell className="w-[50px]">
                                <Checkbox
                                  checked={selectedTransactions.has(transaction.id)}
                                  onCheckedChange={() => toggleTransactionSelection(transaction.id)}
                                  aria-label={`Select transaction ${transaction.id}`}
                                />
                              </TableCell>
                              <TableCell className="font-mono text-xs w-[120px]">
                                {formatDate(new Date(transaction.date))}
                              </TableCell>
                              <TableCell className="font-medium w-[100px]">{transaction.asset}</TableCell>
                              <TableCell className="w-[130px]">
                                <Badge className={getTypeColor(transaction.type)}>{transaction.type}</Badge>
                              </TableCell>
                              <TableCell className="font-mono text-sm w-[140px]">
                                {Number(transaction.amount).toFixed(8)}
                              </TableCell>
                              <TableCell className="font-medium w-[120px]">
                                {transaction.valueUsd ? formatCurrency(transaction.valueUsd) : '-'}
                              </TableCell>
                              <TableCell className="text-sm w-[140px]">{transaction.sourceName}</TableCell>
                              <TableCell className="w-[140px]">
                                <CategoryQuickPicker
                                  currentCategory={transaction.category}
                                  onSelect={(category) => handleQuickCategorize(transaction.id, category)}
                                  onError={(error) => toast.error(error.message)}
                                />
                              </TableCell>
                              <TableCell className="w-[120px]">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditTransaction(transaction);
                                  }}
                                >
                                  {transaction.isCategorized ? 'Edit' : 'Categorize'}
                                </Button>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">No transactions found</p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchTerm('');
                    setFilters({});
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Load More Button */}
        {hasNextPage && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}

        {/* Summary */}
        {transactions.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Showing {filteredTransactions.length} of {totalTransactions} transactions
            {transactions.length !== filteredTransactions.length && (
              <> ({transactions.length} loaded, {filteredTransactions.length} matching filters)</>
            )}
          </div>
        )}

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <Button
            className="fixed bottom-8 right-8 rounded-full shadow-lg z-50"
            size="icon"
            onClick={() => parentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Scroll to top"
          >
            <ChevronUp className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Categorization Modal (for quick sequential categorization) */}
      <CategorizationModal
        transaction={currentTransaction || null}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setCurrentTransactionIndex(0);
        }}
        onCategorize={handleCategorize}
        onSkip={handleSkip}
        progress={
          (stats?.uncategorizedCount ?? uncategorizedTransactions.length) > 0
            ? {
                current: currentTransactionIndex + 1,
                total: stats?.uncategorizedCount ?? uncategorizedTransactions.length,
              }
            : undefined
        }
      />

      {/* Transaction Editor Modal (for full editing) */}
      <TransactionEditorModal
        transaction={editingTransaction}
        open={editorModalOpen}
        onClose={() => {
          setEditorModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
      />

      {/* CSV Import Modal */}
      <CSVImportModal
        open={csvImportOpen}
        onOpenChange={setCsvImportOpen}
      />

      {/* Bulk Categorization Modal */}
      <Dialog open={bulkCategorizeModalOpen} onOpenChange={(open) => {
        setBulkCategorizeModalOpen(open);
        if (!open) setBulkCategorizeAllUncategorized(false);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Categorize Transactions</DialogTitle>
            <DialogDescription>
              {bulkCategorizeAllUncategorized
                ? `Select a category to apply to all ${stats?.uncategorizedCount ?? 0} uncategorized transactions`
                : `Select a category to apply to ${selectedTransactions.size} selected transaction${selectedTransactions.size !== 1 ? 's' : ''}`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-category">Category</Label>
              <Select value={bulkCategorySelection} onValueChange={setBulkCategorySelection}>
                <SelectTrigger id="bulk-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="business-expense">Business Expense</SelectItem>
                  <SelectItem value="self-transfer">Self-Transfer</SelectItem>
                  <SelectItem value="gift">Gift</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkCategorizeModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkCategorizeConfirm} disabled={!bulkCategorySelection}>
              {bulkCategorizeAllUncategorized
                ? `Categorize All ${stats?.uncategorizedCount ?? 0} Transactions`
                : `Categorize ${selectedTransactions.size} Transaction${selectedTransactions.size !== 1 ? 's' : ''}`
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transactions</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedTransactions.size} selected transaction{selectedTransactions.size !== 1 ? 's' : ''}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete {selectedTransactions.size} Transaction{selectedTransactions.size !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
