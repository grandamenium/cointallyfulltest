import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';

@Injectable()
export class TransferMatcherService {
  private readonly TIME_WINDOW_MS = 1 * 60 * 60 * 1000;
  private readonly AMOUNT_TOLERANCE = 0.0001;

  constructor(private prisma: PrismaService) {}

  async findAndMatchTransfers(userId: string): Promise<number> {
    const unmatchedWithdrawals = await this.prisma.normalizedTransaction.findMany({
      where: {
        userId,
        kind: 'withdrawal',
        isTransfer: false,
        transferMatchId: null,
      },
      orderBy: { timestamp: 'asc' },
    });

    const unmatchedDeposits = await this.prisma.normalizedTransaction.findMany({
      where: {
        userId,
        kind: 'deposit',
        isTransfer: false,
        transferMatchId: null,
      },
      orderBy: { timestamp: 'asc' },
    });

    let matchCount = 0;

    for (const withdrawal of unmatchedWithdrawals) {
      const match = await this.findMatchingDeposit(withdrawal, unmatchedDeposits);

      if (match) {
        await this.createTransferMatch(withdrawal, match.deposit, match.confidence, match.method);
        matchCount++;

        const index = unmatchedDeposits.findIndex((d) => d.id === match.deposit.id);
        if (index > -1) {
          unmatchedDeposits.splice(index, 1);
        }
      }
    }

    return matchCount;
  }

  private async findMatchingDeposit(
    withdrawal: any,
    deposits: any[],
  ): Promise<{ deposit: any; confidence: number; method: string } | null> {
    if (withdrawal.txHash) {
      const hashMatch = deposits.find((d) => d.txHash && d.txHash === withdrawal.txHash);
      if (hashMatch) {
        return { deposit: hashMatch, confidence: 1.0, method: 'tx_hash' };
      }
    }

    const timeWindowStart = new Date(withdrawal.timestamp.getTime() - this.TIME_WINDOW_MS);
    const timeWindowEnd = new Date(withdrawal.timestamp.getTime() + this.TIME_WINDOW_MS);

    const candidateDeposits = deposits.filter((d) => {
      const depositTime = new Date(d.timestamp);
      return (
        depositTime >= timeWindowStart &&
        depositTime <= timeWindowEnd &&
        d.baseAsset === withdrawal.baseAsset &&
        d.source !== withdrawal.source
      );
    });

    for (const deposit of candidateDeposits) {
      const withdrawalAmount = parseFloat(withdrawal.baseAmount?.toString() || '0');
      const depositAmount = parseFloat(deposit.baseAmount?.toString() || '0');

      if (this.amountsMatch(withdrawalAmount, depositAmount)) {
        const confidence = this.calculateConfidence(withdrawal, deposit);
        return { deposit, confidence, method: 'amount_time' };
      }

      const withdrawalFee = parseFloat(withdrawal.feeAmount?.toString() || '0');
      if (
        withdrawal.feeAsset === withdrawal.baseAsset &&
        this.amountsMatch(withdrawalAmount - withdrawalFee, depositAmount)
      ) {
        const confidence = this.calculateConfidence(withdrawal, deposit) * 0.95;
        return { deposit, confidence, method: 'amount_time_fee_adjusted' };
      }
    }

    return null;
  }

  private amountsMatch(amount1: number, amount2: number): boolean {
    const diff = Math.abs(amount1 - amount2);
    const avg = (amount1 + amount2) / 2;
    return diff / avg <= this.AMOUNT_TOLERANCE;
  }

  private calculateConfidence(withdrawal: any, deposit: any): number {
    let confidence = 0.5;

    const timeDiff = Math.abs(
      new Date(deposit.timestamp).getTime() - new Date(withdrawal.timestamp).getTime(),
    );
    const timeScore = 1 - timeDiff / this.TIME_WINDOW_MS;
    confidence += timeScore * 0.3;

    if (withdrawal.baseAsset === deposit.baseAsset) {
      confidence += 0.2;
    }

    return Math.min(confidence, 0.99);
  }

  private async createTransferMatch(
    withdrawal: any,
    deposit: any,
    confidence: number,
    method: string,
  ): Promise<void> {
    const transferMatch = await this.prisma.transferMatch.create({
      data: {
        withdrawalTxId: withdrawal.id,
        depositTxId: deposit.id,
        matchConfidence: confidence,
        matchMethod: method,
      },
    });

    await this.prisma.normalizedTransaction.updateMany({
      where: {
        id: { in: [withdrawal.id, deposit.id] },
      },
      data: {
        isTransfer: true,
        transferMatchId: transferMatch.id,
      },
    });
  }

  async unmatchTransfer(matchId: string): Promise<void> {
    await this.prisma.normalizedTransaction.updateMany({
      where: { transferMatchId: matchId },
      data: {
        isTransfer: false,
        transferMatchId: null,
      },
    });

    await this.prisma.transferMatch.delete({
      where: { id: matchId },
    });
  }
}
