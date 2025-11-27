import { Test, TestingModule } from '@nestjs/testing';
import { CoinbaseAdapter } from './coinbase.adapter';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CoinbaseAdapter', () => {
  let adapter: CoinbaseAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoinbaseAdapter],
    }).compile();

    adapter = module.get<CoinbaseAdapter>(CoinbaseAdapter);
    mockedAxios.create = jest.fn().mockReturnValue(mockedAxios);
  });

  describe('getExchangeName', () => {
    it('should return coinbase', () => {
      expect(adapter.getExchangeName()).toBe('coinbase');
    });
  });

  describe('testConnection', () => {
    it('should return true for valid credentials', async () => {
      mockedAxios.get = jest.fn().mockResolvedValue({ status: 200 });

      const result = await adapter.testConnection({
        apiKey: 'test-key',
        apiSecret: 'test-secret',
      });

      expect(result).toBe(true);
    });

    it('should return false for invalid credentials', async () => {
      mockedAxios.get = jest.fn().mockRejectedValue(new Error('Unauthorized'));

      try {
        await adapter.testConnection({
          apiKey: 'invalid-key',
          apiSecret: 'invalid-secret',
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('syncAccounts', () => {
    it('should fetch and format accounts', async () => {
      const mockAccounts = {
        data: {
          data: [
            {
              id: 'acc-1',
              currency: { code: 'BTC' },
              balance: { amount: '1.5' },
            },
            {
              id: 'acc-2',
              currency: { code: 'ETH' },
              balance: { amount: '10.0' },
            },
          ],
        },
      };

      mockedAxios.get = jest.fn().mockResolvedValue(mockAccounts);

      const accounts = await adapter.syncAccounts({
        apiKey: 'test-key',
        apiSecret: 'test-secret',
      });

      expect(accounts).toHaveLength(2);
      expect(accounts[0].currency).toBe('BTC');
      expect(accounts[0].balance).toBe('1.5');
    });
  });

  describe('syncTransactions', () => {
    it('should fetch transactions within date range', async () => {
      const mockAccountsResponse = {
        data: {
          data: [{ id: 'acc-1', currency: { code: 'BTC' }, balance: { amount: '1.0' } }],
        },
      };

      const mockTransactionsResponse = {
        data: {
          data: [
            {
              id: 'tx-1',
              type: 'buy',
              created_at: '2024-01-15T10:00:00Z',
              amount: { currency: 'BTC', amount: '0.5' },
            },
          ],
          pagination: { next_uri: null },
        },
      };

      mockedAxios.get = jest
        .fn()
        .mockResolvedValueOnce(mockAccountsResponse)
        .mockResolvedValueOnce(mockTransactionsResponse);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const transactions = await adapter.syncTransactions(
        {
          apiKey: 'test-key',
          apiSecret: 'test-secret',
        },
        startDate,
        endDate,
      );

      expect(transactions).toHaveLength(1);
      expect(transactions[0].id).toBe('tx-1');
      expect(transactions[0].type).toBe('buy');
    });
  });
});
