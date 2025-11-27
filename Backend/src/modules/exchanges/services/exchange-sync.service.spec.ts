import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ExchangeSyncService } from './exchange-sync.service';
import { PrismaService } from '../../../common/services/prisma.service';
import { EncryptionService } from '../../../common/services/encryption.service';
import { CoinbaseAdapter } from '../adapters/coinbase.adapter';
import { BinanceAdapter } from '../adapters/binance.adapter';
import { KrakenAdapter } from '../adapters/kraken.adapter';

describe('ExchangeSyncService', () => {
  let service: ExchangeSyncService;
  let prisma: jest.Mocked<PrismaService>;
  let encryption: jest.Mocked<EncryptionService>;
  let coinbaseAdapter: jest.Mocked<CoinbaseAdapter>;
  let binanceAdapter: jest.Mocked<BinanceAdapter>;
  let krakenAdapter: jest.Mocked<KrakenAdapter>;

  beforeEach(async () => {
    const mockPrisma = {
      exchangeConnection: {
        create: jest.fn(),
        delete: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      syncHistory: {
        create: jest.fn(),
        update: jest.fn(),
      },
      rawTransaction: {
        upsert: jest.fn(),
      },
    };

    const mockEncryption = {
      encrypt: jest.fn((value) => `encrypted_${value}`),
      decrypt: jest.fn((value) => value.replace('encrypted_', '')),
    };

    const mockCoinbaseAdapter = {
      testConnection: jest.fn(),
      syncTransactions: jest.fn(),
    };

    const mockBinanceAdapter = {
      testConnection: jest.fn(),
      syncTransactions: jest.fn(),
    };

    const mockKrakenAdapter = {
      testConnection: jest.fn(),
      syncTransactions: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeSyncService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EncryptionService, useValue: mockEncryption },
        { provide: CoinbaseAdapter, useValue: mockCoinbaseAdapter },
        { provide: BinanceAdapter, useValue: mockBinanceAdapter },
        { provide: KrakenAdapter, useValue: mockKrakenAdapter },
      ],
    }).compile();

    service = module.get<ExchangeSyncService>(ExchangeSyncService);
    prisma = module.get(PrismaService) as any;
    encryption = module.get(EncryptionService) as any;
    coinbaseAdapter = module.get(CoinbaseAdapter) as any;
    binanceAdapter = module.get(BinanceAdapter) as any;
    krakenAdapter = module.get(KrakenAdapter) as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('connectExchange', () => {
    it('should connect a valid exchange', async () => {
      const userId = 'user-123';
      const dto = {
        exchangeName: 'coinbase',
        displayName: 'My Coinbase',
        apiKey: 'test-key',
        apiSecret: 'test-secret',
      };

      coinbaseAdapter.testConnection.mockResolvedValue(true);
      (prisma.exchangeConnection.create as jest.Mock).mockResolvedValue({
        id: 'conn-1',
        exchangeName: dto.exchangeName,
        displayName: dto.displayName,
        isActive: true,
        createdAt: new Date(),
      });

      const result = await service.connectExchange(userId, dto);

      expect(coinbaseAdapter.testConnection).toHaveBeenCalled();
      expect(encryption.encrypt).toHaveBeenCalledWith(dto.apiKey);
      expect(encryption.encrypt).toHaveBeenCalledWith(dto.apiSecret);
      expect(prisma.exchangeConnection.create).toHaveBeenCalled();
      expect(result.exchangeName).toBe(dto.exchangeName);
    });

    it('should throw error for invalid credentials', async () => {
      const userId = 'user-123';
      const dto = {
        exchangeName: 'coinbase',
        apiKey: 'invalid-key',
        apiSecret: 'invalid-secret',
      };

      coinbaseAdapter.testConnection.mockResolvedValue(false);

      await expect(service.connectExchange(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error for unsupported exchange', async () => {
      const userId = 'user-123';
      const dto = {
        exchangeName: 'unsupported-exchange',
        apiKey: 'key',
        apiSecret: 'secret',
      };

      await expect(service.connectExchange(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should encrypt passphrase when provided', async () => {
      const userId = 'user-123';
      const dto = {
        exchangeName: 'coinbase',
        apiKey: 'test-key',
        apiSecret: 'test-secret',
        passphrase: 'test-passphrase',
      };

      coinbaseAdapter.testConnection.mockResolvedValue(true);
      (prisma.exchangeConnection.create as jest.Mock).mockResolvedValue({
        id: 'conn-1',
        exchangeName: dto.exchangeName,
        displayName: dto.exchangeName,
        isActive: true,
        createdAt: new Date(),
      });

      await service.connectExchange(userId, dto);

      expect(encryption.encrypt).toHaveBeenCalledWith(dto.passphrase);
    });
  });

  describe('disconnectExchange', () => {
    it('should disconnect an exchange', async () => {
      const userId = 'user-123';
      const connectionId = 'conn-1';

      (prisma.exchangeConnection.findFirst as jest.Mock).mockResolvedValue({
        id: connectionId,
        userId,
      });

      const result = await service.disconnectExchange(userId, connectionId);

      expect(prisma.exchangeConnection.delete).toHaveBeenCalledWith({
        where: { id: connectionId },
      });
      expect(result.message).toBe('Exchange disconnected successfully');
    });

    it('should throw error when connection not found', async () => {
      const userId = 'user-123';
      const connectionId = 'nonexistent';

      (prisma.exchangeConnection.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.disconnectExchange(userId, connectionId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getExchangeConnections', () => {
    it('should return all connections for a user', async () => {
      const userId = 'user-123';
      const mockConnections = [
        {
          id: 'conn-1',
          exchangeName: 'coinbase',
          displayName: 'My Coinbase',
          isActive: true,
        },
        {
          id: 'conn-2',
          exchangeName: 'binance',
          displayName: 'My Binance',
          isActive: true,
        },
      ];

      (prisma.exchangeConnection.findMany as jest.Mock).mockResolvedValue(
        mockConnections,
      );

      const result = await service.getExchangeConnections(userId);

      expect(prisma.exchangeConnection.findMany).toHaveBeenCalledWith({
        where: { userId },
        select: expect.any(Object),
      });
      expect(result).toEqual(mockConnections);
    });
  });

  describe('syncExchange', () => {
    it('should sync transactions from exchange', async () => {
      const userId = 'user-123';
      const connectionId = 'conn-1';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const mockConnection = {
        id: connectionId,
        userId,
        exchangeName: 'coinbase',
        encryptedApiKey: 'encrypted_test-key',
        encryptedApiSecret: 'encrypted_test-secret',
        encryptedPassphrase: null,
      };

      const mockTransactions = [
        {
          id: 'tx-1',
          type: 'buy',
          timestamp: new Date('2024-01-15'),
          data: { type: 'buy', amount: '1.0', asset: 'BTC' },
        },
        {
          id: 'tx-2',
          type: 'sell',
          timestamp: new Date('2024-02-20'),
          data: { type: 'sell', amount: '0.5', asset: 'BTC' },
        },
      ];

      (prisma.exchangeConnection.findFirst as jest.Mock).mockResolvedValue(
        mockConnection,
      );
      (prisma.syncHistory.create as jest.Mock).mockResolvedValue({
        id: 'sync-1',
      });
      coinbaseAdapter.syncTransactions.mockResolvedValue(mockTransactions);
      (prisma.syncHistory.update as jest.Mock).mockResolvedValue({});
      (prisma.exchangeConnection.update as jest.Mock).mockResolvedValue({});

      const result = await service.syncExchange(
        userId,
        connectionId,
        startDate,
        endDate,
      );

      expect(coinbaseAdapter.syncTransactions).toHaveBeenCalledWith(
        expect.objectContaining({
          apiKey: 'test-key',
          apiSecret: 'test-secret',
        }),
        startDate,
        endDate,
      );
      expect(result.status).toBe('completed');
      expect(result.transactionsImported).toBe(2);
    });

    it('should handle sync errors', async () => {
      const userId = 'user-123';
      const connectionId = 'conn-1';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const mockConnection = {
        id: connectionId,
        userId,
        exchangeName: 'coinbase',
        encryptedApiKey: 'encrypted_test-key',
        encryptedApiSecret: 'encrypted_test-secret',
      };

      (prisma.exchangeConnection.findFirst as jest.Mock).mockResolvedValue(
        mockConnection,
      );
      (prisma.syncHistory.create as jest.Mock).mockResolvedValue({
        id: 'sync-1',
      });
      coinbaseAdapter.syncTransactions.mockRejectedValue(
        new Error('API error'),
      );

      await expect(
        service.syncExchange(userId, connectionId, startDate, endDate),
      ).rejects.toThrow('API error');

      expect(prisma.syncHistory.update).toHaveBeenCalledWith({
        where: { id: 'sync-1' },
        data: expect.objectContaining({
          status: 'failed',
          errorMessage: 'API error',
        }),
      });
    });

    it('should throw error when connection not found', async () => {
      const userId = 'user-123';
      const connectionId = 'nonexistent';
      const startDate = new Date();
      const endDate = new Date();

      (prisma.exchangeConnection.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.syncExchange(userId, connectionId, startDate, endDate),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
