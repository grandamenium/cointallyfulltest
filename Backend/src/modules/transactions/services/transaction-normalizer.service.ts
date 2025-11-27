import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';

export interface NormalizedTransactionData {
  source: string;
  externalId: string;
  kind: 'trade' | 'deposit' | 'withdrawal' | 'income' | 'fee';
  baseAsset?: string;
  baseAmount?: number;
  quoteAsset?: string;
  quoteAmount?: number;
  feeAsset?: string;
  feeAmount?: number;
  timestamp: Date;
  txHash?: string;
}

@Injectable()
export class TransactionNormalizerService {
  constructor(private prisma: PrismaService) {}

  async normalizeTransaction(rawTransactionId: string, userId: string): Promise<any> {
    const rawTx = await this.prisma.rawTransaction.findUnique({
      where: { id: rawTransactionId },
    });

    if (!rawTx) {
      throw new Error('Raw transaction not found');
    }

    const normalized = this.normalize(rawTx.source, rawTx.rawData);

    const year = normalized.timestamp.getFullYear();
    let taxYear = await this.prisma.taxYear.findUnique({
      where: {
        userId_year: { userId, year },
      },
    });

    if (!taxYear) {
      taxYear = await this.prisma.taxYear.create({
        data: { userId, year },
      });
    }

    const normalizedTx = await this.prisma.normalizedTransaction.create({
      data: {
        rawTransactionId,
        taxYearId: taxYear.id,
        userId,
        source: normalized.source,
        externalId: normalized.externalId,
        kind: normalized.kind,
        baseAsset: normalized.baseAsset,
        baseAmount: normalized.baseAmount,
        quoteAsset: normalized.quoteAsset,
        quoteAmount: normalized.quoteAmount,
        feeAsset: normalized.feeAsset,
        feeAmount: normalized.feeAmount,
        timestamp: normalized.timestamp,
        txHash: normalized.txHash,
      },
    });

    return normalizedTx;
  }

  private normalize(source: string, rawData: any): NormalizedTransactionData {
    const sourceLower = source.toLowerCase();

    switch (sourceLower) {
      case 'coinbase':
        return this.normalizeCoinbase(rawData);
      case 'binance':
        return this.normalizeBinance(rawData);
      case 'kraken':
        return this.normalizeKraken(rawData);
      case 'solana':
      case 'ethereum':
      case 'polygon':
      case 'bnb smart chain':
      case 'arbitrum one':
      case 'optimism':
      case 'avalanche c-chain':
      case 'base':
        return this.normalizeBlockchain(source, rawData);
      default:
        throw new Error(`Unsupported source: ${source}`);
    }
  }

  private normalizeCoinbase(data: any): NormalizedTransactionData {
    if (data.txType) {
      let kind: NormalizedTransactionData['kind'];

      if (data.txType === 'trade') {
        kind = 'trade';
      } else if (data.txType === 'deposit') {
        kind = 'deposit';
      } else if (data.txType === 'withdrawal') {
        kind = 'withdrawal';
      } else if (data.txType === 'fee') {
        kind = 'fee';
      } else {
        kind = 'income';
      }

      return {
        source: 'coinbase',
        externalId: data.id,
        kind,
        baseAsset: data.currency,
        baseAmount: data.amount ? Math.abs(parseFloat(data.amount.toString())) : undefined,
        feeAsset: data.fee?.currency,
        feeAmount: data.fee?.cost ? parseFloat(data.fee.cost.toString()) : undefined,
        timestamp: new Date(data.timestamp || data.datetime),
        txHash: data.txid || data.referenceId,
      };
    }

    const type = data.type?.toLowerCase();
    let kind: NormalizedTransactionData['kind'];
    let baseAsset: string | undefined;
    let baseAmount: number | undefined;
    let quoteAsset: string | undefined;
    let quoteAmount: number | undefined;
    let feeAsset: string | undefined;
    let feeAmount: number | undefined;

    switch (type) {
      case 'trade':
      case 'buy':
      case 'sell':
        kind = 'trade';
        baseAsset = data.amount?.currency;
        baseAmount = Math.abs(parseFloat(data.amount?.amount || '0'));
        quoteAsset = data.native_amount?.currency;
        quoteAmount = Math.abs(parseFloat(data.native_amount?.amount || '0'));
        break;
      case 'send':
        kind = 'withdrawal';
        baseAsset = data.amount?.currency;
        baseAmount = Math.abs(parseFloat(data.amount?.amount || '0'));
        break;
      case 'receive':
        kind = 'deposit';
        baseAsset = data.amount?.currency;
        baseAmount = Math.abs(parseFloat(data.amount?.amount || '0'));
        break;
      default:
        kind = 'income';
        baseAsset = data.amount?.currency;
        baseAmount = Math.abs(parseFloat(data.amount?.amount || '0'));
    }

    if (data.network?.transaction_fee) {
      feeAsset = data.network.transaction_fee.currency;
      feeAmount = parseFloat(data.network.transaction_fee.amount);
    }

    return {
      source: 'coinbase',
      externalId: data.id,
      kind,
      baseAsset,
      baseAmount,
      quoteAsset,
      quoteAmount,
      feeAsset,
      feeAmount,
      timestamp: new Date(data.created_at),
      txHash: data.network?.hash,
    };
  }

  private normalizeBinance(data: any): NormalizedTransactionData {
    if (data.txType) {
      const kind = data.txType === 'trade' ? 'trade' :
                   data.txType === 'deposit' ? 'deposit' : 'withdrawal';

      return {
        source: 'binance',
        externalId: data.id,
        kind,
        baseAsset: data.currency,
        baseAmount: data.amount ? Math.abs(parseFloat(data.amount)) : undefined,
        feeAsset: data.fee?.currency,
        feeAmount: data.fee?.cost ? parseFloat(data.fee.cost) : undefined,
        timestamp: new Date(data.timestamp || data.datetime),
        txHash: data.txid,
      };
    }

    if (data.symbol) {
      const symbol = data.symbol;
      const baseAsset = this.extractBaseAsset(symbol);
      const quoteAsset = this.extractQuoteAsset(symbol);

      return {
        source: 'binance',
        externalId: data.id?.toString() || data.orderId?.toString(),
        kind: 'trade',
        baseAsset,
        baseAmount: parseFloat(data.qty || data.executedQty || '0'),
        quoteAsset,
        quoteAmount: parseFloat(data.quoteQty || '0'),
        feeAsset: data.commissionAsset,
        feeAmount: parseFloat(data.commission || '0'),
        timestamp: new Date(data.time || data.transactTime),
      };
    }

    if (data.coin) {
      const kind = data.status === 1 ? 'deposit' : 'withdrawal';
      return {
        source: 'binance',
        externalId: data.txId || data.id,
        kind,
        baseAsset: data.coin,
        baseAmount: parseFloat(data.amount || '0'),
        feeAsset: data.coin,
        feeAmount: parseFloat(data.transactionFee || '0'),
        timestamp: new Date(data.insertTime || data.applyTime),
        txHash: data.txId,
      };
    }

    throw new Error('Unknown Binance transaction format');
  }

  private normalizeKraken(data: any): NormalizedTransactionData {
    if (data.txType) {
      const kind = data.txType === 'trade' ? 'trade' :
                   data.txType === 'deposit' ? 'deposit' : 'withdrawal';

      return {
        source: 'kraken',
        externalId: data.id,
        kind,
        baseAsset: data.currency,
        baseAmount: data.amount ? Math.abs(parseFloat(data.amount)) : undefined,
        feeAsset: data.fee?.currency,
        feeAmount: data.fee?.cost ? parseFloat(data.fee.cost) : undefined,
        timestamp: new Date(data.timestamp || data.datetime),
        txHash: data.txid,
      };
    }

    if (data.pair) {
      return {
        source: 'kraken',
        externalId: data.id,
        kind: 'trade',
        baseAsset: data.pair.slice(0, 3),
        baseAmount: parseFloat(data.vol || '0'),
        quoteAsset: data.pair.slice(3),
        quoteAmount: parseFloat(data.cost || '0'),
        feeAsset: data.pair.slice(3),
        feeAmount: parseFloat(data.fee || '0'),
        timestamp: new Date(data.time * 1000),
      };
    }

    if (data.type === 'deposit' || data.type === 'withdrawal') {
      return {
        source: 'kraken',
        externalId: data.id,
        kind: data.type,
        baseAsset: data.asset,
        baseAmount: Math.abs(parseFloat(data.amount || '0')),
        feeAsset: data.asset,
        feeAmount: parseFloat(data.fee || '0'),
        timestamp: new Date(data.time * 1000),
        txHash: data.refid,
      };
    }

    throw new Error('Unknown Kraken transaction format');
  }

  private normalizeBlockchain(source: string, data: any): NormalizedTransactionData {
    const txType = data.txType;
    const direction = data.direction;
    const sourceLower = source.toLowerCase();

    if (txType === 'swap' && data.swapData) {
      return {
        source: sourceLower,
        externalId: data.hash || data.id,
        kind: 'trade',
        baseAsset: data.swapData.outputAsset,
        baseAmount: parseFloat(data.swapData.outputAmount),
        quoteAsset: data.swapData.inputAsset,
        quoteAmount: parseFloat(data.swapData.inputAmount),
        timestamp: new Date(data.timestamp),
        txHash: data.hash,
      };
    }

    const kind = direction === 'in' ? 'deposit' : 'withdrawal';

    return {
      source: sourceLower,
      externalId: data.hash || data.id,
      kind,
      baseAsset: data.asset,
      baseAmount: data.value ? parseFloat(data.value) : undefined,
      timestamp: new Date(data.timestamp),
      txHash: data.hash,
    };
  }

  private extractBaseAsset(symbol: string): string {
    const commonQuotes = ['USDT', 'BUSD', 'USDC', 'BTC', 'ETH', 'BNB'];
    for (const quote of commonQuotes) {
      if (symbol.endsWith(quote)) {
        return symbol.slice(0, -quote.length);
      }
    }
    return symbol.slice(0, -3);
  }

  private extractQuoteAsset(symbol: string): string {
    const commonQuotes = ['USDT', 'BUSD', 'USDC', 'BTC', 'ETH', 'BNB'];
    for (const quote of commonQuotes) {
      if (symbol.endsWith(quote)) {
        return quote;
      }
    }
    return symbol.slice(-3);
  }
}
