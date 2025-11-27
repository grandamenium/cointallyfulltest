'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeftRight,
  Briefcase,
  User,
  Gift,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Heart,
  Pickaxe,
  Lock,
  CloudDownload,
  XCircle,
} from 'lucide-react';
import type { Transaction } from '@/types/transaction';
import { format } from 'date-fns';

interface CategorizationModalProps {
  transaction: Transaction | null;
  open: boolean;
  onClose: () => void;
  onCategorize: (category: string, description?: string) => Promise<void>;
  onSkip: () => void;
  progress?: { current: number; total: number };
}

export function CategorizationModal({
  transaction,
  open,
  onClose,
  onCategorize,
  onSkip,
  progress,
}: CategorizationModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [showDescription, setShowDescription] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!transaction) return null;

  const handleCategorize = async () => {
    if (!selectedCategory) return;

    setIsSubmitting(true);
    setShowSuccess(false);

    try {
      await onCategorize(selectedCategory, description || undefined);

      // Show success animation
      setShowSuccess(true);

      // Reset form and auto-advance after 1 second
      setTimeout(() => {
        setSelectedCategory('');
        setDescription('');
        setShowDescription(false);
        setShowSuccess(false);
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      setIsSubmitting(false);
      console.error('Failed to categorize:', error);
    }
  };

  const handleSkip = () => {
    setSelectedCategory('');
    setDescription('');
    setShowDescription(false);
    onSkip();
  };

  const categories = [
    {
      id: 'personal',
      label: 'Personal',
      description: 'Personal purchase or payment',
      icon: User,
      color: 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-gray-100',
      selectedColor: 'bg-gray-500 text-white border-gray-500',
    },
    {
      id: 'business-expense',
      label: 'Business Expense',
      description: 'Business-related purchase or expense',
      icon: Briefcase,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900 dark:bg-blue-950 dark:hover:bg-blue-900 dark:border-blue-800 dark:text-blue-100',
      selectedColor: 'bg-blue-500 text-white border-blue-500',
    },
    {
      id: 'income',
      label: 'Income',
      description: 'Crypto income or payment received',
      icon: DollarSign,
      color: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-900 dark:bg-green-950 dark:hover:bg-green-900 dark:border-green-800 dark:text-green-100',
      selectedColor: 'bg-green-500 text-white border-green-500',
    },
    {
      id: 'self-transfer',
      label: 'Self-Transfer',
      description: 'Transfer between my own wallets',
      icon: ArrowLeftRight,
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-900 dark:bg-purple-950 dark:hover:bg-purple-900 dark:border-purple-800 dark:text-purple-100',
      selectedColor: 'bg-purple-500 text-white border-purple-500',
    },
    {
      id: 'gift',
      label: 'Gift',
      description: 'Gift sent or received',
      icon: Gift,
      color: 'bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-900 dark:bg-pink-950 dark:hover:bg-pink-900 dark:border-pink-800 dark:text-pink-100',
      selectedColor: 'bg-pink-500 text-white border-pink-500',
    },
    {
      id: 'donation',
      label: 'Donation',
      description: 'Charitable donation',
      icon: Heart,
      color: 'bg-red-50 hover:bg-red-100 border-red-200 text-red-900 dark:bg-red-950 dark:hover:bg-red-900 dark:border-red-800 dark:text-red-100',
      selectedColor: 'bg-red-500 text-white border-red-500',
    },
    {
      id: 'mining',
      label: 'Mining',
      description: 'Mining rewards',
      icon: Pickaxe,
      color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-900 dark:bg-yellow-950 dark:hover:bg-yellow-900 dark:border-yellow-800 dark:text-yellow-100',
      selectedColor: 'bg-yellow-500 text-white border-yellow-500',
    },
    {
      id: 'staking',
      label: 'Staking',
      description: 'Staking rewards',
      icon: Lock,
      color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-900 dark:bg-indigo-950 dark:hover:bg-indigo-900 dark:border-indigo-800 dark:text-indigo-100',
      selectedColor: 'bg-indigo-500 text-white border-indigo-500',
    },
    {
      id: 'airdrop',
      label: 'Airdrop',
      description: 'Airdrop received',
      icon: CloudDownload,
      color: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200 text-cyan-900 dark:bg-cyan-950 dark:hover:bg-cyan-900 dark:border-cyan-800 dark:text-cyan-100',
      selectedColor: 'bg-cyan-500 text-white border-cyan-500',
    },
    {
      id: 'lost',
      label: 'Lost',
      description: 'Lost or stolen crypto',
      icon: XCircle,
      color: 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-600 dark:text-slate-100',
      selectedColor: 'bg-slate-500 text-white border-slate-500',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Categorize Transaction</DialogTitle>
          {progress && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {progress.current} of {progress.total} categorized
              </span>
              <Progress value={(progress.current / progress.total) * 100} className="w-32" />
            </div>
          )}
        </DialogHeader>

        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
              >
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 text-lg font-medium text-green-600"
              >
                Transaction categorized!
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Transaction Details Card */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Date</Label>
                      <p className="font-medium">{format(new Date(transaction.date), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Asset</Label>
                      <p className="font-medium font-mono">{transaction.asset}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Amount</Label>
                      <p className="font-medium font-mono">{Number(transaction.amount).toFixed(8)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Value (USD)</Label>
                      <p className="font-medium">
                        {transaction.valueUsd ? `$${Number(transaction.valueUsd).toLocaleString()}` : '-'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Source</Label>
                      <p className="font-medium">{transaction.sourceName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Type</Label>
                      <Badge variant="outline">{transaction.type}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Categorization Buttons */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategory === category.id;

                  return (
                    <motion.button
                      key={category.id}
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                        isSelected ? category.selectedColor : category.color
                      }`}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <div className="flex-1 text-left">
                        <p className="font-semibold">{category.label}</p>
                        <p className={`text-sm ${isSelected ? 'text-white/90' : 'text-muted-foreground'}`}>
                          {category.description}
                        </p>
                      </div>
                      {isSelected && <CheckCircle2 className="h-5 w-5 flex-shrink-0" />}
                    </motion.button>
                  );
                })}
              </div>

              {/* Warning for Personal */}
              <AnimatePresence>
                {selectedCategory === 'personal' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <AlertDescription className="text-amber-800 dark:text-amber-200">
                        Personal payments are not tax deductible. Switch to Business Expense if this was
                        for your business.
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Optional Description */}
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setShowDescription(!showDescription)}
                  className="mb-2"
                >
                  {showDescription ? (
                    <>
                      <ChevronUp className="mr-2 h-4 w-4" />
                      Hide Description
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-2 h-4 w-4" />
                      Add Description
                    </>
                  )}
                </Button>
                <AnimatePresence>
                  {showDescription && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Textarea
                        placeholder="Add any notes or description (optional)..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!showSuccess && (
          <DialogFooter>
            <Button variant="outline" onClick={handleSkip} disabled={isSubmitting}>
              Skip
            </Button>
            <Button onClick={handleCategorize} disabled={!selectedCategory || isSubmitting}>
              {isSubmitting ? 'Categorizing...' : 'Categorize'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
