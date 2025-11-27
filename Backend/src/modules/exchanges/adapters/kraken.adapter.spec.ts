import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { KrakenAdapter } from './kraken.adapter';

describe('KrakenAdapter', () => {
  let adapter: KrakenAdapter;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const mockHttpService = {
      get: jest.fn(),
      post: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KrakenAdapter,
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    adapter = module.get<KrakenAdapter>(KrakenAdapter);
    httpService = module.get(HttpService) as any;
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('getExchangeName', () => {
    it('should return kraken', () => {
      expect(adapter.getExchangeName()).toBe('kraken');
    });
  });

  describe('testConnection', () => {
    it('should return true for valid credentials', async () => {
      const credentials = {
        apiKey: 'test-key',
        apiSecret: Buffer.from('test-secret').toString('base64'),
      };

      httpService.post.mockReturnValue(
        of({
          status: 200,
          data: {
            error: [],
            result: { XXBT: '1.5' },
          },
        } as any),
      );

      const result = await adapter.testConnection(credentials);

      expect(result).toBe(true);
      expect(httpService.post).toHaveBeenCalled();
    });

    it('should return false for invalid credentials', async () => {
      const credentials = {
        apiKey: 'invalid-key',
        apiSecret: Buffer.from('invalid-secret').toString('base64'),
      };

      httpService.post.mockReturnValue(
        throwError(() => ({ response: { status: 401 } })),
      );

      const result = await adapter.testConnection(credentials);

      expect(result).toBe(false);
    });

    it('should handle Kraken API errors', async () => {
      const credentials = {
        apiKey: 'test-key',
        apiSecret: Buffer.from('test-secret').toString('base64'),
      };

      httpService.post.mockReturnValue(
        of({
          status: 200,
          data: {
            error: ['EService:Unavailable'],
            result: null,
          },
        } as any),
      );

      await expect(adapter.testConnection(credentials)).rejects.toThrow();
    });
  });

  describe('syncAccounts', () => {
    it('should return normalized account balances', async () => {
      const credentials = {
        apiKey: 'test-key',
        apiSecret: Buffer.from('test-secret').toString('base64'),
      };

      const mockResponse = {
        status: 200,
        data: {
          error: [],
          result: {
            XXBT: '1.5',
            XETH: '10.0',
            ZUSD: '1000.0',
          },
        },
      };

      httpService.post.mockReturnValue(of(mockResponse as any));

      const result = await adapter.syncAccounts(credentials);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        id: 'XXBT',
        currency: 'BTC', // Normalized
        balance: '1.5',
        available: '1.5',
      });
      expect(result[2]).toEqual({
        id: 'ZUSD',
        currency: 'USD', // Normalized
        balance: '1000.0',
        available: '1000.0',
      });
    });

    it('should handle API errors', async () => {
      const credentials = {
        apiKey: 'test-key',
        apiSecret: Buffer.from('test-secret').toString('base64'),
      };

      httpService.post.mockReturnValue(
        of({
          status: 200,
          data: {
            error: ['EAPI:Invalid key'],
            result: null,
          },
        } as any),
      );

      await expect(adapter.syncAccounts(credentials)).rejects.toThrow(
        'EAPI:Invalid key',
      );
    });
  });

  describe('syncTransactions', () => {
    it('should sync trades and ledgers', async () => {
      const credentials = {
        apiKey: 'test-key',
        apiSecret: Buffer.from('test-secret').toString('base64'),
      };

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      // Mock trades response
      httpService.post.mockReturnValueOnce(
        of({
          status: 200,
          data: {
            error: [],
            result: {
              trades: {
                'TRADE1': {
                  ordertxid: 'ORDER1',
                  pair: 'XBTUSDT',
                  time: 1704067200,
                  type: 'buy',
                  ordertype: 'market',
                  price: '45000',
                  vol: '0.1',
                },
              },
            },
          },
        } as any),
      );

      // Mock ledgers response
      httpService.post.mockReturnValueOnce(
        of({
          status: 200,
          data: {
            error: [],
            result: {
              ledger: {
                'LEDGER1': {
                  refid: 'REF1',
                  time: 1704067200,
                  type: 'deposit',
                  asset: 'XXBT',
                  amount: '1.0',
                },
                'LEDGER2': {
                  refid: 'REF2',
                  time: 1704153600,
                  type: 'withdrawal',
                  asset: 'XETH',
                  amount: '-0.5',
                },
              },
            },
          },
        } as any),
      );

      const result = await adapter.syncTransactions(
        credentials,
        startDate,
        endDate,
      );

      expect(result.length).toBeGreaterThanOrEqual(3);
      expect(result.some((tx) => tx.type === 'trade')).toBe(true);
      expect(result.some((tx) => tx.type === 'deposit')).toBe(true);
      expect(result.some((tx) => tx.type === 'withdrawal')).toBe(true);
    });

    it('should filter out non-deposit/withdrawal ledgers', async () => {
      const credentials = {
        apiKey: 'test-key',
        apiSecret: Buffer.from('test-secret').toString('base64'),
      };

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      // Mock trades response (empty)
      httpService.post.mockReturnValueOnce(
        of({
          status: 200,
          data: {
            error: [],
            result: { trades: {} },
          },
        } as any),
      );

      // Mock ledgers response with various types
      httpService.post.mockReturnValueOnce(
        of({
          status: 200,
          data: {
            error: [],
            result: {
              ledger: {
                'LEDGER1': {
                  refid: 'REF1',
                  time: 1704067200,
                  type: 'deposit',
                  asset: 'XXBT',
                  amount: '1.0',
                },
                'LEDGER2': {
                  refid: 'REF2',
                  time: 1704153600,
                  type: 'trade', // Should be filtered
                  asset: 'XETH',
                  amount: '0.5',
                },
              },
            },
          },
        } as any),
      );

      const result = await adapter.syncTransactions(
        credentials,
        startDate,
        endDate,
      );

      const ledgerResults = result.filter((tx) => tx.id.startsWith('ledger-'));
      expect(ledgerResults).toHaveLength(1);
      expect(ledgerResults[0].type).toBe('deposit');
    });
  });

  describe('authenticate', () => {
    it('should return true for valid credentials', async () => {
      const credentials = {
        apiKey: 'test-key',
        apiSecret: Buffer.from('test-secret').toString('base64'),
      };

      httpService.post.mockReturnValue(
        of({
          status: 200,
          data: {
            error: [],
            result: { XXBT: '1.0' },
          },
        } as any),
      );

      const result = await adapter.authenticate(credentials);

      expect(result).toBe(true);
    });

    it('should return false for invalid credentials', async () => {
      const credentials = {
        apiKey: 'invalid-key',
        apiSecret: Buffer.from('invalid-secret').toString('base64'),
      };

      httpService.post.mockReturnValue(
        throwError(() => new Error('Unauthorized')),
      );

      const result = await adapter.authenticate(credentials);

      expect(result).toBe(false);
    });
  });
});
