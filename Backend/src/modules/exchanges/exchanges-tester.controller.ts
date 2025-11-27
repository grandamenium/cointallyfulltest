import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { CoinbaseAdapter } from './adapters/coinbase.adapter';
import { BinanceAdapter } from './adapters/binance.adapter';
import { KrakenAdapter } from './adapters/kraken.adapter';
import { ExchangeCredentials } from './interfaces/IExchangeAdapter';

interface TestConnectionDto {
  exchangeName: string;
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
}

interface TestSyncDto {
  exchangeName: string;
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
  startDate?: string;
  endDate?: string;
}

@Controller('test/exchanges')
export class ExchangesTesterController {
  constructor(
    private coinbaseAdapter: CoinbaseAdapter,
    private binanceAdapter: BinanceAdapter,
    private krakenAdapter: KrakenAdapter,
  ) {}

  private getAdapter(exchangeName: string) {
    const adapters = {
      coinbase: this.coinbaseAdapter,
      binance: this.binanceAdapter,
      kraken: this.krakenAdapter,
    };

    const adapter = adapters[exchangeName.toLowerCase()];
    if (!adapter) {
      throw new Error(`Exchange ${exchangeName} not supported`);
    }
    return adapter;
  }

  @Public()
  @Get('supported')
  getSupportedExchanges() {
    return {
      exchanges: [
        {
          name: 'coinbase',
          displayName: 'Coinbase',
          requiredFields: ['apiKey', 'apiSecret'],
          optionalFields: ['passphrase'],
          docsUrl: 'https://docs.cloud.coinbase.com/exchange/docs',
        },
        {
          name: 'binance',
          displayName: 'Binance',
          requiredFields: ['apiKey', 'apiSecret'],
          optionalFields: [],
          docsUrl: 'https://binance-docs.github.io/apidocs/spot/en/',
        },
        {
          name: 'kraken',
          displayName: 'Kraken',
          requiredFields: ['apiKey', 'apiSecret'],
          optionalFields: [],
          docsUrl: 'https://docs.kraken.com/rest/',
        },
      ],
    };
  }

  @Public()
  @Post('test-connection')
  async testConnection(@Body() dto: TestConnectionDto) {
    const startTime = Date.now();

    try {
      const adapter = this.getAdapter(dto.exchangeName);
      const credentials: ExchangeCredentials = {
        apiKey: dto.apiKey,
        apiSecret: dto.apiSecret,
        passphrase: dto.passphrase,
      };

      const isValid = await adapter.testConnection(credentials);
      const duration = Date.now() - startTime;

      return {
        success: isValid,
        exchange: dto.exchangeName,
        message: isValid
          ? 'Connection successful!'
          : 'Connection failed. Please check your credentials.',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        exchange: dto.exchangeName,
        message: 'Connection failed',
        error: error.message,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Public()
  @Post('test-accounts')
  async testAccounts(@Body() dto: TestConnectionDto) {
    const startTime = Date.now();

    try {
      const adapter = this.getAdapter(dto.exchangeName);
      const credentials: ExchangeCredentials = {
        apiKey: dto.apiKey,
        apiSecret: dto.apiSecret,
        passphrase: dto.passphrase,
      };

      const accounts = await adapter.syncAccounts(credentials);
      const duration = Date.now() - startTime;

      return {
        success: true,
        exchange: dto.exchangeName,
        accountsCount: accounts.length,
        accounts: accounts.map((acc) => ({
          id: acc.id,
          currency: acc.currency,
          balance: acc.balance,
          available: acc.available,
          hold: acc.hold,
        })),
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        exchange: dto.exchangeName,
        message: 'Failed to fetch accounts',
        error: error.message,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Public()
  @Post('test-transactions')
  async testTransactions(@Body() dto: TestSyncDto) {
    const startTime = Date.now();

    try {
      const adapter = this.getAdapter(dto.exchangeName);
      const credentials: ExchangeCredentials = {
        apiKey: dto.apiKey,
        apiSecret: dto.apiSecret,
        passphrase: dto.passphrase,
      };

      // Default to last 7 days
      const endDate = dto.endDate ? new Date(dto.endDate) : new Date();
      const startDate = dto.startDate
        ? new Date(dto.startDate)
        : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const transactions = await adapter.syncTransactions(
        credentials,
        startDate,
        endDate,
      );

      const duration = Date.now() - startTime;

      // Group by type for summary
      const summary = transactions.reduce((acc, tx) => {
        acc[tx.type] = (acc[tx.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        success: true,
        exchange: dto.exchangeName,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        totalTransactions: transactions.length,
        summary,
        sampleTransactions: transactions.slice(0, 5).map((tx) => ({
          id: tx.id,
          type: tx.type,
          timestamp: tx.timestamp,
          data: tx.data,
        })),
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        exchange: dto.exchangeName,
        message: 'Failed to fetch transactions',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Public()
  @Post('test-full-sync')
  async testFullSync(@Body() dto: TestSyncDto) {
    const startTime = Date.now();
    const results: any = {
      exchange: dto.exchangeName,
      timestamp: new Date().toISOString(),
      steps: [],
    };

    try {
      const adapter = this.getAdapter(dto.exchangeName);
      const credentials: ExchangeCredentials = {
        apiKey: dto.apiKey,
        apiSecret: dto.apiSecret,
        passphrase: dto.passphrase,
      };

      // Step 1: Test Connection
      const stepStartTime1 = Date.now();
      const connectionValid = await adapter.testConnection(credentials);
      results.steps.push({
        step: 'connection',
        success: connectionValid,
        duration: `${Date.now() - stepStartTime1}ms`,
      });

      if (!connectionValid) {
        throw new Error('Connection test failed');
      }

      // Step 2: Fetch Accounts
      const stepStartTime2 = Date.now();
      const accounts = await adapter.syncAccounts(credentials);
      results.steps.push({
        step: 'accounts',
        success: true,
        count: accounts.length,
        duration: `${Date.now() - stepStartTime2}ms`,
      });

      // Step 3: Fetch Transactions
      const stepStartTime3 = Date.now();
      const endDate = dto.endDate ? new Date(dto.endDate) : new Date();
      const startDate = dto.startDate
        ? new Date(dto.startDate)
        : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const transactions = await adapter.syncTransactions(
        credentials,
        startDate,
        endDate,
      );

      const txSummary = transactions.reduce((acc, tx) => {
        acc[tx.type] = (acc[tx.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      results.steps.push({
        step: 'transactions',
        success: true,
        count: transactions.length,
        summary: txSummary,
        duration: `${Date.now() - stepStartTime3}ms`,
      });

      const totalDuration = Date.now() - startTime;

      return {
        success: true,
        ...results,
        totalDuration: `${totalDuration}ms`,
        summary: {
          accountsFound: accounts.length,
          transactionsFound: transactions.length,
          transactionTypes: Object.keys(txSummary),
        },
      };
    } catch (error) {
      const totalDuration = Date.now() - startTime;

      return {
        success: false,
        ...results,
        error: error.message,
        totalDuration: `${totalDuration}ms`,
      };
    }
  }

  @Public()
  @Get('api-docs/:exchange')
  getApiDocs(@Param('exchange') exchange: string) {
    const docs = {
      coinbase: {
        name: 'Coinbase',
        baseUrl: 'https://api.coinbase.com',
        docsUrl: 'https://docs.cloud.coinbase.com/exchange/docs',
        authentication: 'API Key + Secret + Passphrase',
        endpoints: [
          {
            name: 'Get Accounts',
            method: 'GET',
            path: '/accounts',
            description: 'Get a list of trading accounts',
          },
          {
            name: 'Get Account',
            method: 'GET',
            path: '/accounts/:account_id',
            description: 'Get a single account by ID',
          },
          {
            name: 'Get Fills',
            method: 'GET',
            path: '/fills',
            description: 'Get a list of recent fills',
          },
          {
            name: 'Get Transfers',
            method: 'GET',
            path: '/transfers',
            description: 'Get a list of deposits and withdrawals',
          },
        ],
        rateLimits: {
          public: '3 requests per second',
          private: '5 requests per second',
        },
      },
      binance: {
        name: 'Binance',
        baseUrl: 'https://api.binance.com',
        docsUrl: 'https://binance-docs.github.io/apidocs/spot/en/',
        authentication: 'API Key + Secret (HMAC SHA256)',
        endpoints: [
          {
            name: 'Account Information',
            method: 'GET',
            path: '/api/v3/account',
            description: 'Get current account information',
          },
          {
            name: 'Account Trade List',
            method: 'GET',
            path: '/api/v3/myTrades',
            description: 'Get trades for a specific account and symbol',
          },
          {
            name: 'Deposit History',
            method: 'GET',
            path: '/sapi/v1/capital/deposit/hisrec',
            description: 'Fetch deposit history',
          },
          {
            name: 'Withdraw History',
            method: 'GET',
            path: '/sapi/v1/capital/withdraw/history',
            description: 'Fetch withdraw history',
          },
        ],
        rateLimits: {
          requests: '1200 requests per minute',
          orders: '10 orders per second',
        },
      },
      kraken: {
        name: 'Kraken',
        baseUrl: 'https://api.kraken.com',
        docsUrl: 'https://docs.kraken.com/rest/',
        authentication: 'API Key + Secret (HMAC SHA512)',
        endpoints: [
          {
            name: 'Account Balance',
            method: 'POST',
            path: '/0/private/Balance',
            description: 'Retrieve all cash balances',
          },
          {
            name: 'Trade History',
            method: 'POST',
            path: '/0/private/TradesHistory',
            description: 'Get information about trades',
          },
          {
            name: 'Ledgers Info',
            method: 'POST',
            path: '/0/private/Ledgers',
            description: 'Get information about ledger entries',
          },
        ],
        rateLimits: {
          tier1: '15 requests per 3 seconds',
          tier2: '20 requests per 2 seconds',
        },
      },
    };

    const exchangeDocs = docs[exchange.toLowerCase()];

    if (!exchangeDocs) {
      return {
        error: 'Exchange not found',
        supportedExchanges: Object.keys(docs),
      };
    }

    return exchangeDocs;
  }
}
