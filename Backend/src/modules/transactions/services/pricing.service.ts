import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';
import { CoinGeckoService } from '../../../common/services/coingecko.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);

  private readonly STABLECOINS = new Set([
    'USDC',
    'USDT',
    'DAI',
    'BUSD',
    'TUSD',
    'USDP',
    'USDD',
    'FRAX',
    'GUSD',
    'PAXG',
    'USD',
  ]);

  constructor(
    private prisma: PrismaService,
    private coingecko: CoinGeckoService,
  ) {}

  async priceTransactionBatch(userId: string, limit: number = 50): Promise<number> {
    const unpricedTransactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        isPriced: false,
      },
      take: limit,
      orderBy: { date: 'asc' },
    });

    this.logger.log(`Processing ${unpricedTransactions.length} unpriced transactions`);

    let pricedCount = 0;
    let failedCount = 0;

    for (const tx of unpricedTransactions) {
      try {
        const beforeState = await this.prisma.transaction.findUnique({
          where: { id: tx.id },
          select: { isPriced: true },
        });

        await this.priceTransaction(tx.id);

        const afterState = await this.prisma.transaction.findUnique({
          where: { id: tx.id },
          select: { isPriced: true },
        });

        if (afterState?.isPriced) {
          pricedCount++;
        } else {
          failedCount++;
        }
      } catch (error) {
        failedCount++;
        this.logger.error(`Error pricing transaction ${tx.id}:`, error.message);
      }
    }

    this.logger.log(`Pricing complete: ${pricedCount} successful, ${failedCount} failed/skipped`);
    return pricedCount;
  }

  async priceTransaction(transactionId: string): Promise<void> {
    const tx = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!tx) {
      throw new Error('Transaction not found');
    }

    if (tx.isPriced) {
      return;
    }

    if (this.isStablecoin(tx.asset)) {
      const valueUsd = this.calculateValue(tx.amount, 1);

      await this.prisma.transaction.update({
        where: { id: transactionId },
        data: {
          valueUsd,
          isPriced: true,
        },
      });

      this.logger.debug(`Priced ${tx.asset} as stablecoin: $${valueUsd}`);
      return;
    }

    const price = await this.getPrice(tx.asset, tx.date);

    if (price === null) {
      const valueUsd = this.calculateValue(tx.amount, 0);

      await this.prisma.transaction.update({
        where: { id: transactionId },
        data: {
          valueUsd,
          isPriced: true,
        },
      });

      this.logger.warn(
        `Could not get price for ${tx.asset} on ${tx.date.toISOString().split('T')[0]} - set to $0 (manual edit required)`
      );
      return;
    }

    const valueUsd = this.calculateValue(tx.amount, price);

    await this.prisma.transaction.update({
      where: { id: transactionId },
      data: {
        valueUsd,
        isPriced: true,
      },
    });

    this.logger.debug(`Priced ${tx.asset}: $${valueUsd} (${price} * ${tx.amount})`);
  }

  private async getPrice(asset: string, date: Date): Promise<number | null> {
    const dateOnly = new Date(date.toISOString().split('T')[0]);

    const cachedPrice = await this.prisma.historicalPrice.findUnique({
      where: {
        asset_date: {
          asset: asset.toUpperCase(),
          date: dateOnly,
        },
      },
    });

    if (cachedPrice) {
      this.logger.debug(`Using cached price for ${asset} on ${dateOnly.toISOString().split('T')[0]}`);
      return parseFloat(cachedPrice.priceUsd.toString());
    }

    const price = await this.coingecko.getHistoricalPrice(asset, date);

    if (price !== null) {
      await this.prisma.historicalPrice.create({
        data: {
          asset: asset.toUpperCase(),
          date: dateOnly,
          priceUsd: price,
          source: 'coingecko',
        },
      });

      this.logger.log(`Cached price for ${asset} on ${dateOnly.toISOString().split('T')[0]}: $${price}`);
    }

    return price;
  }

  private isStablecoin(asset: string): boolean {
    return this.STABLECOINS.has(asset.toUpperCase());
  }

  private calculateValue(amount: Decimal | number, price: number): Decimal {
    const amountNum = typeof amount === 'number' ? amount : parseFloat(amount.toString());
    return new Decimal(amountNum * price);
  }
}
