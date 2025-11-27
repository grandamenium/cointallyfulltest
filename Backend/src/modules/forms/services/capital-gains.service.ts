import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

export interface TaxLot {
  id: string;
  date: Date;
  asset: string;
  amount: Decimal;
  costBasisUsd: Decimal;
  remainingAmount: Decimal;
}

export interface CapitalGainItem {
  description: string;
  dateAcquired: Date;
  dateSold: Date;
  proceeds: Decimal;
  costBasis: Decimal;
  gainOrLoss: Decimal;
  isLongTerm: boolean;
  asset: string;
  amount: Decimal;
}

export interface CapitalGainsResult {
  items: CapitalGainItem[];
  shortTermGains: Decimal;
  shortTermLosses: Decimal;
  longTermGains: Decimal;
  longTermLosses: Decimal;
  totalGains: Decimal;
  totalLosses: Decimal;
  netGainLoss: Decimal;
  transactionsIncluded: number;
}

@Injectable()
export class CapitalGainsService {
  constructor(private prisma: PrismaService) {}

  async calculate(
    userId: string,
    taxYear: number,
    method: string = 'FIFO',
  ): Promise<CapitalGainsResult> {
    const startDate = new Date(`${taxYear}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${taxYear}-12-31T23:59:59.999Z`);

    const acquisitionTypes = ['buy', 'income', 'mining', 'staking', 'airdrop', 'gift-received'];
    const disposalTypes = ['sell', 'expense', 'gift-sent'];

    const allTransactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: { lte: endDate },
      },
      orderBy: { date: 'asc' },
    });

    const acquisitions = allTransactions.filter((tx) =>
      acquisitionTypes.includes(tx.type),
    );
    const disposals = allTransactions.filter(
      (tx) =>
        disposalTypes.includes(tx.type) &&
        tx.date >= startDate &&
        tx.date <= endDate,
    );

    const taxLotsByAsset = new Map<string, TaxLot[]>();
    for (const acq of acquisitions) {
      const asset = acq.asset;
      if (!taxLotsByAsset.has(asset)) {
        taxLotsByAsset.set(asset, []);
      }
      taxLotsByAsset.get(asset)!.push({
        id: acq.id,
        date: acq.date,
        asset: acq.asset,
        amount: acq.amount,
        costBasisUsd: acq.valueUsd || new Decimal(0),
        remainingAmount: acq.amount,
      });
    }

    if (method === 'LIFO') {
      for (const [asset, lots] of taxLotsByAsset) {
        taxLotsByAsset.set(asset, lots.reverse());
      }
    } else if (method === 'HIFO') {
      for (const [asset, lots] of taxLotsByAsset) {
        lots.sort((a, b) => {
          const priceA = a.costBasisUsd.div(a.amount);
          const priceB = b.costBasisUsd.div(b.amount);
          return priceB.comparedTo(priceA);
        });
        taxLotsByAsset.set(asset, lots);
      }
    }

    const items: CapitalGainItem[] = [];
    let shortTermGains = new Decimal(0);
    let shortTermLosses = new Decimal(0);
    let longTermGains = new Decimal(0);
    let longTermLosses = new Decimal(0);

    for (const disposal of disposals) {
      const asset = disposal.asset;
      let amountToSell = disposal.amount;
      const proceeds = disposal.valueUsd || new Decimal(0);
      const lots = taxLotsByAsset.get(asset) || [];

      const proceedsPerUnit = amountToSell.gt(0)
        ? proceeds.div(amountToSell)
        : new Decimal(0);

      for (const lot of lots) {
        if (amountToSell.lte(0)) break;
        if (lot.remainingAmount.lte(0)) continue;

        const amountFromLot = Decimal.min(lot.remainingAmount, amountToSell);
        const costBasisPerUnit = lot.amount.gt(0)
          ? lot.costBasisUsd.div(lot.amount)
          : new Decimal(0);

        const itemProceeds = proceedsPerUnit.mul(amountFromLot);
        const itemCostBasis = costBasisPerUnit.mul(amountFromLot);
        const gainOrLoss = itemProceeds.sub(itemCostBasis);

        const holdingPeriodMs =
          disposal.date.getTime() - lot.date.getTime();
        const oneYearMs = 365 * 24 * 60 * 60 * 1000;
        const isLongTerm = holdingPeriodMs > oneYearMs;

        items.push({
          description: `${amountFromLot.toFixed(8)} ${asset}`,
          dateAcquired: lot.date,
          dateSold: disposal.date,
          proceeds: itemProceeds,
          costBasis: itemCostBasis,
          gainOrLoss,
          isLongTerm,
          asset,
          amount: amountFromLot,
        });

        if (gainOrLoss.gte(0)) {
          if (isLongTerm) {
            longTermGains = longTermGains.add(gainOrLoss);
          } else {
            shortTermGains = shortTermGains.add(gainOrLoss);
          }
        } else {
          if (isLongTerm) {
            longTermLosses = longTermLosses.add(gainOrLoss.abs());
          } else {
            shortTermLosses = shortTermLosses.add(gainOrLoss.abs());
          }
        }

        lot.remainingAmount = lot.remainingAmount.sub(amountFromLot);
        amountToSell = amountToSell.sub(amountFromLot);
      }

      if (amountToSell.gt(0)) {
        const remainingProceeds = proceedsPerUnit.mul(amountToSell);
        items.push({
          description: `${amountToSell.toFixed(8)} ${asset} (unknown cost basis)`,
          dateAcquired: new Date(0),
          dateSold: disposal.date,
          proceeds: remainingProceeds,
          costBasis: new Decimal(0),
          gainOrLoss: remainingProceeds,
          isLongTerm: true,
          asset,
          amount: amountToSell,
        });
        longTermGains = longTermGains.add(remainingProceeds);
      }
    }

    const totalGains = shortTermGains.add(longTermGains);
    const totalLosses = shortTermLosses.add(longTermLosses);
    const netGainLoss = totalGains.sub(totalLosses);

    return {
      items,
      shortTermGains,
      shortTermLosses,
      longTermGains,
      longTermLosses,
      totalGains,
      totalLosses,
      netGainLoss,
      transactionsIncluded: items.length,
    };
  }
}
