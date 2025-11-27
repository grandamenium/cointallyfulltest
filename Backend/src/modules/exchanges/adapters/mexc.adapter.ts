import { Injectable } from '@nestjs/common';
import * as ccxt from 'ccxt';
import {
  IExchangeAdapter,
  ExchangeCredentials,
  ExchangeAccount,
  RawExchangeTransaction,
  SyncProgressCallback,
} from '../interfaces/IExchangeAdapter';
import { BaseExchangeAdapter } from './base-exchange.adapter';

@Injectable()
export class MexcAdapter extends BaseExchangeAdapter implements IExchangeAdapter {
  getExchangeName(): string {
    return 'mexc';
  }

  private createExchange(credentials: ExchangeCredentials): ccxt.mexc {
    return new ccxt.mexc({
      apiKey: credentials.apiKey,
      secret: credentials.apiSecret,
      timeout: 30000,
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
      this.handleApiError(error, 'MEXC connection test');
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
      this.handleApiError(error, 'MEXC sync accounts');
    }
  }

  async syncTransactions(
    credentials: ExchangeCredentials,
    startDate: Date,
    endDate: Date,
    onProgress?: SyncProgressCallback,
  ): Promise<RawExchangeTransaction[]> {
    try {
      const exchange = this.createExchange(credentials);
      const since = startDate.getTime();
      const allTransactions: RawExchangeTransaction[] = [];

      this.logger.log('MEXC: Fetching balance...');
      if (onProgress) await onProgress('Fetching balance', 0, 1);
      const balance = await exchange.fetchBalance();
      const currencies = Object.keys(balance).filter(
        c => !['info', 'free', 'used', 'total', 'timestamp', 'datetime'].includes(c)
      );
      this.logger.log(`MEXC: Balance fetched, found ${currencies.length} currencies`);

      if (exchange.has['fetchMyTrades']) {
        this.logger.log('MEXC: Loading markets...');
        if (onProgress) await onProgress('Loading markets', 0, 1);
        await exchange.loadMarkets();
        const symbols = Object.keys(exchange.markets);
        this.logger.log(`MEXC: Markets loaded, found ${symbols.length} symbols`);

        const userCurrencies = currencies.filter(c => {
          const info = balance[c] as any;
          return info && (info.total > 0 || info.free > 0);
        });

        const relevantSymbols = symbols.filter(symbol => {
          const [base, quote] = symbol.split('/');
          return userCurrencies.includes(base) || userCurrencies.includes(quote);
        });

        this.logger.log(`MEXC: Fetching trades for ${relevantSymbols.length} relevant symbols...`);

        for (let i = 0; i < relevantSymbols.length; i++) {
          const symbol = relevantSymbols[i];
          try {
            if (onProgress) await onProgress('Fetching trades', i + 1, relevantSymbols.length);
            if (i % 100 === 0) {
              const pct = Math.round((i / relevantSymbols.length) * 100);
              this.logger.log(`MEXC: Fetching trades ${i}/${relevantSymbols.length} (${pct}%)`);
            }

            const trades = await exchange.fetchMyTrades(symbol, since, 1000);
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
            await this.sleep(100);
          } catch (error) {
            this.logger.debug(`MEXC: Could not fetch trades for ${symbol}: ${error.message}`);
          }
        }
        this.logger.log(`MEXC: Trades fetched, found ${allTransactions.length} transactions so far`);
      }

      this.logger.log('MEXC: Fetching deposits and withdrawals...');
      if (onProgress) await onProgress('Fetching deposits/withdrawals', 0, currencies.length);

      for (let i = 0; i < currencies.length; i++) {
        const currency = currencies[i];
        try {
          if (onProgress && i % 50 === 0) {
            await onProgress('Fetching deposits/withdrawals', i, currencies.length);
          }

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
          this.logger.warn(`MEXC: Failed to fetch transactions for ${currency}: ${error.message}`);
        }
      }

      allTransactions.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      this.logger.log(`MEXC: Sync complete, total ${allTransactions.length} transactions`);

      return allTransactions;
    } catch (error) {
      this.logger.error(`MEXC: Sync failed - ${error.message}`);
      this.handleApiError(error, 'MEXC sync transactions');
    }
  }
}
