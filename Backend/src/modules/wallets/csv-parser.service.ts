import { Injectable } from '@nestjs/common';
import { parse } from 'csv-parse/sync';

export interface ParsedTransaction {
  timestamp: Date;
  type: string;
  asset: string;
  amount: number;
  price?: number;
  fee?: number;
  feeCurrency?: string;
  notes?: string;
}

export interface CsvParseResult {
  transactions: ParsedTransaction[];
  errors: string[];
  totalRows: number;
  successfulRows: number;
}

@Injectable()
export class CsvParserService {
  async parseExchangeCsv(
    csvContent: string,
    sourceId: string,
  ): Promise<CsvParseResult> {
    const errors: string[] = [];
    const transactions: ParsedTransaction[] = [];

    try {
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      const totalRows = records.length;

      for (let i = 0; i < records.length; i++) {
        try {
          const parsed = this.parseRowBySource(records[i], sourceId);
          if (parsed) {
            transactions.push(parsed);
          }
        } catch (error) {
          errors.push(`Row ${i + 2}: ${error.message}`);
        }
      }

      return {
        transactions,
        errors,
        totalRows,
        successfulRows: transactions.length,
      };
    } catch (error) {
      throw new Error(`Failed to parse CSV: ${error.message}`);
    }
  }

  private parseRowBySource(
    row: Record<string, any>,
    sourceId: string,
  ): ParsedTransaction | null {
    switch (sourceId) {
      case 'coinbase':
        return this.parseCoinbaseRow(row);
      case 'binance':
        return this.parseBinanceRow(row);
      case 'kraken':
        return this.parseKrakenRow(row);
      default:
        return this.parseGenericRow(row);
    }
  }

  private parseCoinbaseRow(row: Record<string, any>): ParsedTransaction | null {
    if (!row['Timestamp'] || !row['Transaction Type']) {
      return null;
    }

    return {
      timestamp: new Date(row['Timestamp']),
      type: this.normalizeTransactionType(row['Transaction Type']),
      asset: row['Asset'] || row['Currency'],
      amount: parseFloat(row['Quantity'] || row['Amount'] || '0'),
      price: row['Spot Price at Transaction']
        ? parseFloat(row['Spot Price at Transaction'])
        : undefined,
      fee: row['Fees'] ? parseFloat(row['Fees']) : undefined,
      feeCurrency: row['Fees Currency'] || undefined,
      notes: row['Notes'] || undefined,
    };
  }

  private parseBinanceRow(row: Record<string, any>): ParsedTransaction | null {
    if (!row['Date(UTC)'] || !row['Operation']) {
      return null;
    }

    return {
      timestamp: new Date(row['Date(UTC)']),
      type: this.normalizeTransactionType(row['Operation']),
      asset: row['Coin'],
      amount: parseFloat(row['Change'] || '0'),
      notes: row['Remark'] || undefined,
    };
  }

  private parseKrakenRow(row: Record<string, any>): ParsedTransaction | null {
    if (!row['time'] || !row['type']) {
      return null;
    }

    return {
      timestamp: new Date(row['time']),
      type: this.normalizeTransactionType(row['type']),
      asset: row['asset'],
      amount: parseFloat(row['amount'] || '0'),
      fee: row['fee'] ? parseFloat(row['fee']) : undefined,
      notes: row['refid'] || undefined,
    };
  }

  private parseGenericRow(row: Record<string, any>): ParsedTransaction | null {
    const timestampField =
      row['timestamp'] || row['date'] || row['time'] || row['Date'] || row['Time'];
    const typeField = row['type'] || row['transaction_type'] || row['Type'];
    const assetField = row['asset'] || row['currency'] || row['coin'] || row['Asset'];
    const amountField = row['amount'] || row['quantity'] || row['Amount'];

    if (!timestampField || !typeField || !assetField) {
      return null;
    }

    return {
      timestamp: new Date(timestampField),
      type: this.normalizeTransactionType(typeField),
      asset: assetField,
      amount: parseFloat(amountField || '0'),
      price: row['price'] ? parseFloat(row['price']) : undefined,
      fee: row['fee'] ? parseFloat(row['fee']) : undefined,
      notes: row['notes'] || row['memo'] || undefined,
    };
  }

  private normalizeTransactionType(type: string): string {
    const normalizedType = type.toLowerCase().trim();

    if (normalizedType.includes('buy') || normalizedType.includes('purchase')) {
      return 'buy';
    }
    if (normalizedType.includes('sell')) {
      return 'sell';
    }
    if (
      normalizedType.includes('receive') ||
      normalizedType.includes('deposit') ||
      normalizedType.includes('incoming')
    ) {
      return 'deposit';
    }
    if (
      normalizedType.includes('send') ||
      normalizedType.includes('withdraw') ||
      normalizedType.includes('outgoing')
    ) {
      return 'withdrawal';
    }
    if (normalizedType.includes('trade') || normalizedType.includes('swap')) {
      return 'trade';
    }
    if (normalizedType.includes('reward') || normalizedType.includes('staking')) {
      return 'reward';
    }

    return normalizedType;
  }
}
