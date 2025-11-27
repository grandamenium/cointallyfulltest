import { Test, TestingModule } from '@nestjs/testing';
import { ExchangesController } from './exchanges.controller';
import { ExchangeSyncService } from './services/exchange-sync.service';
import { ConnectExchangeDto } from './dto/connect-exchange.dto';
import { SyncExchangeDto } from './dto/sync-exchange.dto';

const createMockExchangeConnection = (overrides = {}) => ({
  id: 'conn-1',
  exchangeName: 'coinbase',
  displayName: 'My Coinbase',
  isActive: true,
  lastSyncAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('ExchangesController', () => {
  let controller: ExchangesController;
  let exchangeSyncService: jest.Mocked<ExchangeSyncService>;

  const mockUser = { id: 'user-123', email: 'test@example.com' };

  beforeEach(async () => {
    const mockExchangeSyncService = {
      getExchangeConnections: jest.fn(),
      connectExchange: jest.fn(),
      disconnectExchange: jest.fn(),
      syncExchange: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExchangesController],
      providers: [
        {
          provide: ExchangeSyncService,
          useValue: mockExchangeSyncService,
        },
      ],
    }).compile();

    controller = module.get<ExchangesController>(ExchangesController);
    exchangeSyncService = module.get(
      ExchangeSyncService,
    ) as jest.Mocked<ExchangeSyncService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getExchanges', () => {
    it('should return all exchange connections for a user', async () => {
      const mockConnections = [
        createMockExchangeConnection(),
        createMockExchangeConnection({
          id: 'conn-2',
          exchangeName: 'binance',
          displayName: 'My Binance',
        }),
      ];

      exchangeSyncService.getExchangeConnections.mockResolvedValue(
        mockConnections,
      );

      const result = await controller.getExchanges(mockUser);

      expect(exchangeSyncService.getExchangeConnections).toHaveBeenCalledWith(
        mockUser.id,
      );
      expect(result).toEqual(mockConnections);
    });
  });

  describe('connectExchange', () => {
    it('should connect a new exchange', async () => {
      const dto: ConnectExchangeDto = {
        exchangeName: 'coinbase',
        displayName: 'My Coinbase Account',
        apiKey: 'test-api-key',
        apiSecret: 'test-api-secret',
      };

      const expectedResult = createMockExchangeConnection({
        exchangeName: dto.exchangeName,
        displayName: dto.displayName,
      });

      exchangeSyncService.connectExchange.mockResolvedValue(expectedResult);

      const result = await controller.connectExchange(mockUser, dto);

      expect(exchangeSyncService.connectExchange).toHaveBeenCalledWith(
        mockUser.id,
        dto,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle invalid exchange credentials', async () => {
      const dto: ConnectExchangeDto = {
        exchangeName: 'coinbase',
        apiKey: 'invalid-key',
        apiSecret: 'invalid-secret',
      };

      exchangeSyncService.connectExchange.mockRejectedValue(
        new Error('Invalid exchange credentials'),
      );

      await expect(controller.connectExchange(mockUser, dto)).rejects.toThrow(
        'Invalid exchange credentials',
      );
    });
  });

  describe('disconnectExchange', () => {
    it('should disconnect an exchange', async () => {
      const connectionId = 'conn-1';
      const expectedResult = {
        message: 'Exchange disconnected successfully',
      };

      exchangeSyncService.disconnectExchange.mockResolvedValue(expectedResult);

      const result = await controller.disconnectExchange(mockUser, connectionId);

      expect(exchangeSyncService.disconnectExchange).toHaveBeenCalledWith(
        mockUser.id,
        connectionId,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle disconnecting non-existent exchange', async () => {
      const connectionId = 'nonexistent';

      exchangeSyncService.disconnectExchange.mockRejectedValue(
        new Error('Exchange connection not found'),
      );

      await expect(
        controller.disconnectExchange(mockUser, connectionId),
      ).rejects.toThrow('Exchange connection not found');
    });
  });

  describe('syncExchange', () => {
    it('should sync exchange with default dates', async () => {
      const connectionId = 'conn-1';
      const dto: SyncExchangeDto = {};

      const expectedResult = {
        syncId: 'sync-1',
        status: 'completed',
        transactionsImported: 42,
      };

      exchangeSyncService.syncExchange.mockResolvedValue(expectedResult);

      const result = await controller.syncExchange(mockUser, connectionId, dto);

      expect(exchangeSyncService.syncExchange).toHaveBeenCalledWith(
        mockUser.id,
        connectionId,
        expect.any(Date),
        expect.any(Date),
      );
      expect(result).toEqual(expectedResult);
    });

    it('should sync exchange with custom date range', async () => {
      const connectionId = 'conn-1';
      const dto: SyncExchangeDto = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      const expectedResult = {
        syncId: 'sync-1',
        status: 'completed',
        transactionsImported: 100,
      };

      exchangeSyncService.syncExchange.mockResolvedValue(expectedResult);

      const result = await controller.syncExchange(mockUser, connectionId, dto);

      expect(exchangeSyncService.syncExchange).toHaveBeenCalledWith(
        mockUser.id,
        connectionId,
        new Date('2024-01-01'),
        new Date('2024-12-31'),
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle sync errors', async () => {
      const connectionId = 'conn-1';
      const dto: SyncExchangeDto = {};

      exchangeSyncService.syncExchange.mockRejectedValue(
        new Error('API rate limit exceeded'),
      );

      await expect(
        controller.syncExchange(mockUser, connectionId, dto),
      ).rejects.toThrow('API rate limit exceeded');
    });
  });
});
