import type { Transaction } from '@/types/transaction';

export function calculateTransactionStatus(tx: Transaction): {
  isPriced: boolean;
  isCategorized: boolean;
  needsReview: boolean;
} {
  const isPriced = tx.valueUsd !== null && tx.valueUsd !== undefined;
  const isCategorized = tx.category !== 'uncategorized';
  const needsReview = !isPriced || !isCategorized;

  return { isPriced, isCategorized, needsReview };
}

export function calculateCategorizationRating(transactions: Transaction[]): number {
  if (!transactions || transactions.length === 0) return 0;

  const categorizedCount = transactions.filter(tx => tx.isCategorized).length;
  return Math.round((categorizedCount / transactions.length) * 100);
}

export function getUncategorizedTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.filter(tx => !tx.isCategorized);
}

export function getUnpricedTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.filter(tx => !tx.isPriced);
}
