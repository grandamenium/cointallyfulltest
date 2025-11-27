import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { BinanceAdapter } from './binance.adapter';

describe('BinanceAdapter', () => {
  let adapter: BinanceAdapter;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const mockHttpService = {
      get: jest.fn(),
      post: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BinanceAdapter,
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    adapter = module.get<BinanceAdapter>(BinanceAdapter);
    httpService = module.get(HttpService) as any;
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('getExchangeName', () => {
    it('should return binance', () => {
      expect(adapter.getExchangeName()).toBe('binance');
    });
  });

  describe('testConnection', () => {
    it('should return true for valid credentials', async () => {
      const credentials = {
        apiKey: 'test-key',
        apiSecret: 'test-secret',
      };

      httpService.get.mockReturnValue(
        of({
          status: 200,
          data: { balances: [] },
        } as any),
      );

      const result = await adapter.testConnection(credentials);

      expect(result).toBe(true);
      expect(httpService.get).toHaveBeenCalled();
    });

    it('should return false for invalid credentials', async () => {
      const credentials = {
        apiKey: 'invalid-key',
        apiSecret: 'invalid-secret',
      };

      httpService.get.mockReturnValue(
        throwError(() => ({ response: { status: 401 } })),
      );

      const result = await adapter.testConnection(credentials);

      expect(result).toBe(false);
    });
  });

  describe('syncAccounts', () => {
    it('should return account balances', async () => {
      const credentials = {
        apiKey: 'test-key',
        apiSecret: 'test-secret',
      };

      const mockResponse = {
        status: 200,
        data: {
          balances: [
            { asset: 'BTC', free: '1.5', locked: '0.5' },
            { asset: 'ETH', free: '10.0', locked: '0.0' },
            { asset: 'USDT', free: '0', locked: '0' }, // Should be filtered
          ],
        },
      };

      httpService.get.mockReturnValue(of(mockResponse as any));

      const result = await adapter.syncAccounts(credentials);

      expect(result).toHaveLength(2); // USDT filtered out
      expect(result[0]).toEqual({
        id: 'BTC',
        currency: 'BTC',
        balance: '2',
        available: '1.5',
        hold: '0.5',
      });
    });

    it('should filter out zero balances', async () => {
      const credentials = {
        apiKey: 'test-key',
        apiSecret: 'test-secret',
      };

      const mockResponse = {
        status: 200,
        data: {
          balances: [
            { asset: 'BTC', free: '0', locked: '0' },
            { asset: 'ETH', free: '1.0', locked: '0' },
          ],
        },
      };

      httpService.get.mockReturnValue(of(mockResponse as any));

      const result = await adapter.syncAccounts(credentials);

      expect(result).toHaveLength(1);
      expect(result[0].currency).toBe('ETH');
    });
  });

  describe('syncTransactions', () => {
    it('should sync all transaction types', async () => {
      const credentials = {
        apiKey: 'test-key',
        apiSecret: 'test-secret',
      };

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      // Mock account response
      httpService.get.mockReturnValueOnce(
        of({
          status: 200,
          data: {
            balances: [{ asset: 'BTC', free: '1', locked: '0' }],
          },
        } as any),
      );

      // Mock exchange info
      httpService.get.mockReturnValueOnce(
        of({
          status: 200,
          data: {
            symbols: [
              { symbol: 'BTCUSDT', status: 'TRADING' },
            ],
          },
        } as any),
      );

      // Mock trades
      httpService.get.mockReturnValueOnce(
        of({
          status: 200,
          data: [
            {
              id: 123,
              time: 1704067200000,
              price: '45000',
              qty: '0.1',
              commission: '0.001',
            },
          ],
        } as any),
      );

      // Mock deposits
      httpService.get.mockReturnValueOnce(
        of({
          status: 200,
          data: [
            {
              txId: 'deposit-1',
              insertTime: 1704067200000,
              amount: '1.0',
              coin: 'BTC',
            },
          ],
        } as any),
      );

      // Mock withdrawals
      httpService.get.mockReturnValueOnce(
        of({
          status: 200,
          data: [
            {
              id: 'withdraw-1',
              applyTime: 1704067200000,
              amount: '0.5',
              coin: 'BTC',
            },
          ],
        } as any),
      );

      const result = await adapter.syncTransactions(
        credentials,
        startDate,
        endDate,
      );

      expect(result.length).toBeGreaterThanOrEqual(3); // trades, deposits, withdrawals
      expect(result.some((tx) => tx.type === 'trade')).toBe(true);
      expect(result.some((tx) => tx.type === 'deposit')).toBe(true);
      expect(result.some((tx) => tx.type === 'withdrawal')).toBe(true);
    });
  });

  describe('authenticate', () => {
    it('should return true for valid credentials', async () => {
      const credentials = {
        apiKey: 'test-key',
        apiSecret: 'test-secret',
      };

      httpService.get.mockReturnValue(
        of({
          status: 200,
          data: { balances: [] },
        } as any),
      );

      const result = await adapter.authenticate(credentials);

      expect(result).toBe(true);
    });

    it('should return false for invalid credentials', async () => {
      const credentials = {
        apiKey: 'invalid-key',
        apiSecret: 'invalid-secret',
      };

      httpService.get.mockReturnValue(
        throwError(() => new Error('Unauthorized')),
      );

      const result = await adapter.authenticate(credentials);

      expect(result).toBe(false);
    });
  });
});
