import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';

@Injectable()
export class TransactionTransformerService {
  private readonly logger = new Logger(TransactionTransformerService.name);

  constructor(private prisma: PrismaService) {}

  async transformNormalizedTransactions(userId: string, connectionId: string): Promise<number> {
    const connectedSource = await this.prisma.connectedSource.findUnique({
      where: { id: connectionId },
    });

    if (!connectedSource) {
      throw new Error('Connected source not found');
    }

    const normalizedTxs = await this.prisma.normalizedTransaction.findMany({
      where: {
        userId,
        source: connectedSource.sourceName.toLowerCase(),
      },
      include: {
        rawTransaction: true,
      },
    });

    let transformedCount = 0;

    for (const normalizedTx of normalizedTxs) {
      try {
        const existingTransaction = await this.prisma.transaction.findFirst({
          where: {
            userId,
            sourceId: connectionId,
            txHash: normalizedTx.txHash || undefined,
            date: normalizedTx.timestamp,
            asset: normalizedTx.baseAsset || '',
          },
        });

        if (existingTransaction) {
          continue;
        }

        const transactionType = this.mapKindToType(normalizedTx.kind, normalizedTx.isTransfer);

        await this.prisma.transaction.create({
          data: {
            userId,
            sourceId: connectionId,
            sourceName: connectedSource.sourceName,
            date: normalizedTx.timestamp,
            type: transactionType,
            asset: normalizedTx.baseAsset || 'UNKNOWN',
            amount: normalizedTx.baseAmount || 0,
            valueUsd: normalizedTx.quoteAmount,
            fee: normalizedTx.feeAmount,
            feeUsd: null,
            txHash: normalizedTx.txHash,
            category: normalizedTx.category || 'uncategorized',
            isCategorized: !!normalizedTx.category,
            isPriced: !!normalizedTx.quoteAmount,
            needsReview: false,
            rawData: normalizedTx.rawTransaction.rawData as any,
          },
        });

        transformedCount++;
      } catch (error) {
        this.logger.error(`Error transforming transaction ${normalizedTx.id}:`, error.message);
      }
    }

    return transformedCount;
  }

  private mapKindToType(kind: string, isTransfer: boolean): string {
    if (isTransfer) {
      return 'self-transfer';
    }

    switch (kind.toLowerCase()) {
      case 'trade':
        return 'buy';
      case 'deposit':
        return 'transfer-in';
      case 'withdrawal':
        return 'transfer-out';
      case 'income':
        return 'income';
      case 'fee':
        return 'expense';
      default:
        return 'income';
    }
  }
}
