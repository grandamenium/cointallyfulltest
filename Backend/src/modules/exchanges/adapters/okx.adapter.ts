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
export class OkxAdapter extends BaseExchangeAdapter implements IExchangeAdapter {
  getExchangeName(): string {
    return 'okx';
  }

  private createExchange(credentials: ExchangeCredentials): ccxt.okx {
    return new ccxt.okx({
      apiKey: credentials.apiKey,
      secret: credentials.apiSecret,
      password: credentials.passphrase,
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
      this.handleApiError(error, 'OKX connection test');
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
      this.handleApiError(error, 'OKX sync accounts');
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

      const balance = await exchange.fetchBalance();
      const currencies = Object.keys(balance).filter(
        c => !['info', 'free', 'used', 'total', 'timestamp', 'datetime'].includes(c)
      );

      for (const currency of currencies) {
        try {
          if (exchange.has['fetchDeposits']) {
            const deposits = await exchange.fetchDeposits(currency, since, 1000);
            for (const deposit of deposits) {
              if (!deposit.timestamp || !deposit.id) continue;
              const depositDate = new Date(deposit.timestamp);
              if (depositDate >= startDate && depositDate <= endDate) {
                allTransactions.push({
                  id: `deposit-${deposit.id}`,
                  type: 'deposit',
                  timestamp: depositDate,
                  data: { ...deposit, txType: 'deposit' },
                });
              }
            }
          }

          if (exchange.has['fetchWithdrawals']) {
            const withdrawals = await exchange.fetchWithdrawals(currency, since, 1000);
            for (const withdrawal of withdrawals) {
              if (!withdrawal.timestamp || !withdrawal.id) continue;
              const withdrawalDate = new Date(withdrawal.timestamp);
              if (withdrawalDate >= startDate && withdrawalDate <= endDate) {
                allTransactions.push({
                  id: `withdrawal-${withdrawal.id}`,
                  type: 'withdrawal',
                  timestamp: withdrawalDate,
                  data: { ...withdrawal, txType: 'withdrawal' },
                });
              }
            }
          }
        } catch (error) {
          this.logger.warn(`OKX: Failed to fetch transactions for ${currency}: ${error.message}`);
        }
      }

      allTransactions.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      return allTransactions;
    } catch (error) {
      this.handleApiError(error, 'OKX sync transactions');
    }
  }
}
