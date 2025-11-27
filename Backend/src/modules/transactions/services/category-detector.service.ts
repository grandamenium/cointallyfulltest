import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';

export enum TransactionCategory {
  SPOT_TRADE = 'spot_trade',
  MARGIN_TRADE = 'margin_trade',
  STAKING_REWARD = 'staking_reward',
  MINING_REWARD = 'mining_reward',
  AIRDROP = 'airdrop',
  INTEREST = 'interest',
  GIFT = 'gift',
  EXPENSE = 'expense',
  INTERNAL_TRANSFER = 'internal_transfer',
  EXTERNAL_DEPOSIT = 'external_deposit',
  EXTERNAL_WITHDRAWAL = 'external_withdrawal',
  FEE = 'fee',
  UNKNOWN = 'unknown',
}

@Injectable()
export class CategoryDetectorService {
  constructor(private prisma: PrismaService) {}

  async detectAndUpdateCategory(transactionId: string): Promise<string> {
    const tx = await this.prisma.normalizedTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!tx) {
      throw new Error('Transaction not found');
    }

    const category = this.detectCategory(tx);

    await this.prisma.normalizedTransaction.update({
      where: { id: transactionId },
      data: { category },
    });

    return category;
  }

  async detectCategoriesForUser(userId: string): Promise<number> {
    const transactions = await this.prisma.normalizedTransaction.findMany({
      where: { userId, category: null },
    });

    let count = 0;
    for (const tx of transactions) {
      const category = this.detectCategory(tx);
      await this.prisma.normalizedTransaction.update({
        where: { id: tx.id },
        data: { category },
      });
      count++;
    }

    return count;
  }

  private detectCategory(tx: any): string {
    if (tx.isTransfer) {
      return TransactionCategory.INTERNAL_TRANSFER;
    }

    switch (tx.kind) {
      case 'trade':
        return this.detectTradeCategory(tx);
      case 'deposit':
        return this.detectDepositCategory(tx);
      case 'withdrawal':
        return this.detectWithdrawalCategory(tx);
      case 'income':
        return this.detectIncomeCategory(tx);
      case 'fee':
        return TransactionCategory.FEE;
      default:
        return TransactionCategory.UNKNOWN;
    }
  }

  private detectTradeCategory(tx: any): string {
    if (this.isSpotTrade(tx)) {
      return TransactionCategory.SPOT_TRADE;
    }

    if (this.isMarginTrade(tx)) {
      return TransactionCategory.MARGIN_TRADE;
    }

    return TransactionCategory.SPOT_TRADE;
  }

  private detectDepositCategory(tx: any): string {
    if (this.isStakingReward(tx)) {
      return TransactionCategory.STAKING_REWARD;
    }

    if (this.isMiningReward(tx)) {
      return TransactionCategory.MINING_REWARD;
    }

    if (this.isAirdrop(tx)) {
      return TransactionCategory.AIRDROP;
    }

    if (this.isInterest(tx)) {
      return TransactionCategory.INTEREST;
    }

    return TransactionCategory.EXTERNAL_DEPOSIT;
  }

  private detectWithdrawalCategory(tx: any): string {
    return TransactionCategory.EXTERNAL_WITHDRAWAL;
  }

  private detectIncomeCategory(tx: any): string {
    if (this.isStakingReward(tx)) {
      return TransactionCategory.STAKING_REWARD;
    }

    if (this.isMiningReward(tx)) {
      return TransactionCategory.MINING_REWARD;
    }

    if (this.isAirdrop(tx)) {
      return TransactionCategory.AIRDROP;
    }

    if (this.isInterest(tx)) {
      return TransactionCategory.INTEREST;
    }

    if (this.isGift(tx)) {
      return TransactionCategory.GIFT;
    }

    return TransactionCategory.UNKNOWN;
  }

  private isSpotTrade(tx: any): boolean {
    return tx.baseAsset && tx.quoteAsset && tx.baseAmount && tx.quoteAmount;
  }

  private isMarginTrade(tx: any): boolean {
    const marginKeywords = ['margin', 'leverage', 'futures', 'perpetual'];
    const notes = tx.notes?.toLowerCase() || '';
    return marginKeywords.some((keyword) => notes.includes(keyword));
  }

  private isStakingReward(tx: any): boolean {
    const stakingKeywords = ['staking', 'stake', 'staked', 'pos reward'];
    const rawData = JSON.stringify(tx).toLowerCase();
    return stakingKeywords.some((keyword) => rawData.includes(keyword));
  }

  private isMiningReward(tx: any): boolean {
    const miningKeywords = ['mining', 'mined', 'pow reward', 'block reward'];
    const rawData = JSON.stringify(tx).toLowerCase();
    return miningKeywords.some((keyword) => rawData.includes(keyword));
  }

  private isAirdrop(tx: any): boolean {
    const airdropKeywords = ['airdrop', 'distribution', 'token distribution'];
    const rawData = JSON.stringify(tx).toLowerCase();
    return airdropKeywords.some((keyword) => rawData.includes(keyword));
  }

  private isInterest(tx: any): boolean {
    const interestKeywords = ['interest', 'earn', 'savings', 'lending'];
    const rawData = JSON.stringify(tx).toLowerCase();
    return interestKeywords.some((keyword) => rawData.includes(keyword));
  }

  private isGift(tx: any): boolean {
    const giftKeywords = ['gift', 'bonus', 'referral', 'promotion'];
    const rawData = JSON.stringify(tx).toLowerCase();
    return giftKeywords.some((keyword) => rawData.includes(keyword));
  }
}
