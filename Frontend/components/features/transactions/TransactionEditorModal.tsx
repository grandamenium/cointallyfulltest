'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import type { Transaction } from '@/types/transaction';
import { format } from 'date-fns';

interface TransactionEditorModalProps {
  transaction: Transaction | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: TransactionFormData) => Promise<void>;
}

export interface TransactionFormData {
  date: string;
  type: string;
  asset: string;
  amount: number;
  valueUsd: number | null;
  fee: number | null;
  feeUsd: number | null;
  fromAddress: string;
  toAddress: string;
  txHash: string;
  category: string;
  description: string;
}

const TRANSACTION_TYPES = [
  { value: 'buy', label: 'Buy' },
  { value: 'sell', label: 'Sell' },
  { value: 'transfer-in', label: 'Transfer In' },
  { value: 'transfer-out', label: 'Transfer Out' },
  { value: 'self-transfer', label: 'Self Transfer' },
  { value: 'expense', label: 'Expense' },
  { value: 'gift-received', label: 'Gift Received' },
  { value: 'gift-sent', label: 'Gift Sent' },
  { value: 'income', label: 'Income' },
  { value: 'mining', label: 'Mining' },
  { value: 'staking', label: 'Staking' },
  { value: 'airdrop', label: 'Airdrop' },
];

const CATEGORIES = [
  { value: 'uncategorized', label: 'Uncategorized' },
  { value: 'personal', label: 'Personal' },
  { value: 'business-expense', label: 'Business Expense' },
  { value: 'income', label: 'Income' },
  { value: 'self-transfer', label: 'Self Transfer' },
  { value: 'gift', label: 'Gift' },
  { value: 'donation', label: 'Donation' },
  { value: 'mining', label: 'Mining' },
  { value: 'staking', label: 'Staking' },
  { value: 'airdrop', label: 'Airdrop' },
  { value: 'lost', label: 'Lost' },
];

export function TransactionEditorModal({
  transaction,
  open,
  onClose,
  onSave,
}: TransactionEditorModalProps) {
  const [formData, setFormData] = useState<TransactionFormData>({
    date: '',
    type: '',
    asset: '',
    amount: 0,
    valueUsd: null,
    fee: null,
    feeUsd: null,
    fromAddress: '',
    toAddress: '',
    txHash: '',
    category: '',
    description: '',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        date: format(new Date(transaction.date), "yyyy-MM-dd'T'HH:mm"),
        type: transaction.type || '',
        asset: transaction.asset || '',
        amount: Number(transaction.amount) || 0,
        valueUsd: transaction.valueUsd ? Number(transaction.valueUsd) : null,
        fee: transaction.fee ? Number(transaction.fee) : null,
        feeUsd: transaction.feeUsd ? Number(transaction.feeUsd) : null,
        fromAddress: transaction.fromAddress || '',
        toAddress: transaction.toAddress || '',
        txHash: transaction.txHash || '',
        category: transaction.category || 'uncategorized',
        description: transaction.description || '',
      });
    }
  }, [transaction]);

  if (!transaction) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = <K extends keyof TransactionFormData>(
    field: K,
    value: TransactionFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <Badge variant="outline" className="w-fit">
            Source: {transaction.sourceName}
          </Badge>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Core Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="datetime-local"
                value={formData.date}
                onChange={(e) => updateField('date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(v) => updateField('type', v)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset">Asset</Label>
              <Input
                id="asset"
                value={formData.asset}
                onChange={(e) => updateField('asset', e.target.value.toUpperCase())}
                placeholder="BTC, ETH, USDC..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="any"
                value={formData.amount}
                onChange={(e) => updateField('amount', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valueUsd">Value (USD)</Label>
              <Input
                id="valueUsd"
                type="number"
                step="0.01"
                value={formData.valueUsd ?? ''}
                onChange={(e) => updateField('valueUsd', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(v) => updateField('category', v)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Add notes or description..."
              rows={2}
            />
          </div>

          {/* Advanced Fields */}
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between"
              onClick={() => setShowAdvanced(!showAdvanced)}
              type="button"
            >
              Advanced Fields
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            {showAdvanced && (
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fee">Fee</Label>
                    <Input
                      id="fee"
                      type="number"
                      step="any"
                      value={formData.fee ?? ''}
                      onChange={(e) => updateField('fee', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="Optional"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="feeUsd">Fee (USD)</Label>
                    <Input
                      id="feeUsd"
                      type="number"
                      step="0.01"
                      value={formData.feeUsd ?? ''}
                      onChange={(e) => updateField('feeUsd', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fromAddress">From Address</Label>
                  <Input
                    id="fromAddress"
                    value={formData.fromAddress}
                    onChange={(e) => updateField('fromAddress', e.target.value)}
                    placeholder="Optional"
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toAddress">To Address</Label>
                  <Input
                    id="toAddress"
                    value={formData.toAddress}
                    onChange={(e) => updateField('toAddress', e.target.value)}
                    placeholder="Optional"
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="txHash">Transaction Hash</Label>
                  <Input
                    id="txHash"
                    value={formData.txHash}
                    onChange={(e) => updateField('txHash', e.target.value)}
                    placeholder="Optional"
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
