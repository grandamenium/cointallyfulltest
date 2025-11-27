import { Injectable } from '@nestjs/common';
import * as ccxt from 'ccxt';
import {
  IExchangeAdapter,
  ExchangeCredentials,
  ExchangeAccount,
  RawExchangeTransaction,
} from '../interfaces/IExchangeAdapter';
import { BaseExchangeAdapter } from './base-exchange.adapter';

@Injectable()
export class CoinbaseAdapter extends BaseExchangeAdapter implements IExchangeAdapter {
  getExchangeName(): string {
    return 'coinbase';
  }

  private createExchange(credentials: ExchangeCredentials): ccxt.coinbase {
    return new ccxt.coinbase({
      apiKey: credentials.apiKey,
      secret: credentials.apiSecret,
      enableRateLimit: true,
    });
  }

  async authenticate(credentials: ExchangeCredentials): Promise<boolean> {
    try {
      await this.testConnection(credentials);
      return true;
    } catch (error) {
      return false;
    }
  }

  async testConnection(credentials: ExchangeCredentials): Promise<boolean> {
    try {
      const exchange = this.createExchange(credentials);
      await exchange.fetchBalance();
      return true;
    } catch (error) {
      this.handleApiError(error, 'Coinbase connection test');
    }
  }

  async syncAccounts(credentials: ExchangeCredentials): Promise<ExchangeAccount[]> {
    try {
      const exchange = this.createExchange(credentials);
      const balance = await exchange.fetchBalance();

      const accounts: ExchangeAccount[] = [];

      for (const [currency, balanceInfo] of Object.entries(balance)) {
        if (currency === 'info' || currency === 'free' || currency === 'used' || currency === 'total') {
          continue;
        }

        const info = balanceInfo as any;
        if (info && typeof info === 'object' && (info.total > 0 || info.free > 0)) {
          accounts.push({
            id: `${currency}-wallet`,
            currency: currency,
            balance: info.total ? info.total.toString() : '0',
            available: info.free ? info.free.toString() : '0',
          });
        }
      }

      return accounts;
    } catch (error) {
      this.handleApiError(error, 'Coinbase sync accounts');
    }
  }

  async syncTransactions(
    credentials: ExchangeCredentials,
    startDate: Date,
    endDate: Date,
  ): Promise<RawExchangeTransaction[]> {
    try {
      const exchange = this.createExchange(credentials);

      const since = startDate.getTime();
      const allTransactions: RawExchangeTransaction[] = [];

      if (exchange.has['fetchMyTrades']) {
        const trades = await exchange.fetchMyTrades(undefined, since, 1000);
        for (const trade of trades) {
          if (!trade.timestamp || !trade.id) continue;
          const tradeDate = new Date(trade.timestamp);
          if (tradeDate >= startDate && tradeDate <= endDate) {
            allTransactions.push({
              id: `trade-${trade.id}`,
              type: trade.side || 'trade',
              timestamp: tradeDate,
              data: { ...trade, txType: 'trade' },
            });
          }
        }
      }

      if (exchange.has['fetchLedger']) {
        const balance = await exchange.fetchBalance();
        const currencies = Object.keys(balance).filter(
          c => !['info', 'free', 'used', 'total', 'timestamp', 'datetime'].includes(c)
        );

        for (const currency of currencies) {
          try {
            const ledgerEntries = await exchange.fetchLedger(currency, since, 100);

            for (const entry of ledgerEntries) {
              if (!entry.timestamp || !entry.id) continue;

              const entryDate = new Date(entry.timestamp);
              if (entryDate < startDate || entryDate > endDate) continue;

              let txType = 'income';
              if (entry.direction === 'in' || (entry.type === 'transaction' && entry.amount && entry.amount > 0)) {
                txType = 'deposit';
              } else if (entry.direction === 'out' || (entry.type === 'transaction' && entry.amount && entry.amount < 0)) {
                txType = 'withdrawal';
              } else if (entry.type === 'trade') {
                txType = 'trade';
              } else if (entry.type === 'fee') {
                txType = 'fee';
              } else if (entry.type === 'rebate' || entry.type === 'cashback') {
                txType = 'income';
              }

              allTransactions.push({
                id: `${txType}-${entry.id}`,
                type: txType,
                timestamp: entryDate,
                data: { ...entry, txType, currency: entry.currency },
              });
            }
          } catch (error) {
            this.logger.warn(`Coinbase: Failed to fetch ledger for ${currency}: ${error.message}`);
          }
        }
      }

      allTransactions.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      return allTransactions;
    } catch (error) {
      this.handleApiError(error, 'Coinbase sync transactions');
    }
  }
}
