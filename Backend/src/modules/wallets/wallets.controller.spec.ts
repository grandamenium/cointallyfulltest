import { Test, TestingModule } from '@nestjs/testing';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';
import { ConnectSourceDto } from './dto/connect-source.dto';

const createMockConnectedSource = (overrides = {}) => ({
  id: 'conn-1',
  userId: 'user-123',
  sourceId: '1',
  sourceName: 'Ethereum',
  sourceType: 'blockchain',
  connectionType: 'public_address',
  label: null,
  address: '0x123...',
  encryptedCredentials: null,
  lastSyncedAt: new Date(),
  status: 'connected',
  transactionCount: 42,
  connectedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('WalletsController', () => {
  let controller: WalletsController;
  let walletsService: jest.Mocked<WalletsService>;

  const mockUser = { id: 'user-123', email: 'test@example.com' };

  beforeEach(async () => {
    const mockWalletsService = {
      getAvailableSources: jest.fn(),
      getConnectedSources: jest.fn(),
      connectSource: jest.fn(),
      disconnectSource: jest.fn(),
      resyncSource: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletsController],
      providers: [
        {
          provide: WalletsService,
          useValue: mockWalletsService,
        },
      ],
    }).compile();

    controller = module.get<WalletsController>(WalletsController);
    walletsService = module.get(WalletsService) as jest.Mocked<WalletsService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSources', () => {
    it('should return all available sources', async () => {
      const mockSources = [
        {
          id: '1',
          name: 'Ethereum',
          type: 'blockchain',
          logo: 'eth-logo.png',
          connectionMethods: ['public_address'],
        },
        {
          id: '2',
          name: 'Bitcoin',
          type: 'blockchain',
          logo: 'btc-logo.png',
          connectionMethods: ['public_address', 'xpub'],
        },
      ];

      walletsService.getAvailableSources.mockResolvedValue(mockSources);

      const result = await controller.getSources();

      expect(walletsService.getAvailableSources).toHaveBeenCalled();
      expect(result).toEqual(mockSources);
    });
  });

  describe('getConnected', () => {
    it('should return connected sources for a user', async () => {
      const mockConnectedSources = [createMockConnectedSource()];

      walletsService.getConnectedSources.mockResolvedValue(
        mockConnectedSources,
      );

      const result = await controller.getConnected(mockUser);

      expect(walletsService.getConnectedSources).toHaveBeenCalledWith(
        mockUser.id,
      );
      expect(result).toEqual(mockConnectedSources);
    });
  });

  describe('connect', () => {
    it('should connect a wallet source', async () => {
      const dto: ConnectSourceDto = {
        sourceId: '1',
        connectionType: 'public_address',
        credentials: {
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        },
      };

      const expectedResult = {
        success: true,
        data: createMockConnectedSource({
          sourceId: dto.sourceId,
          address: dto.credentials.address,
          transactionCount: 0,
          lastSyncedAt: null,
        }),
        message: 'Ethereum connected successfully',
      };

      walletsService.connectSource.mockResolvedValue(expectedResult);

      const result = await controller.connect(mockUser, dto);

      expect(walletsService.connectSource).toHaveBeenCalledWith(
        mockUser.id,
        dto,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle connection errors', async () => {
      const dto: ConnectSourceDto = {
        sourceId: '1',
        connectionType: 'public_address',
        credentials: {
          address: 'invalid-address',
        },
      };

      walletsService.connectSource.mockRejectedValue(
        new Error('Invalid wallet address'),
      );

      await expect(controller.connect(mockUser, dto)).rejects.toThrow(
        'Invalid wallet address',
      );
    });
  });

  describe('disconnect', () => {
    it('should disconnect a wallet source', async () => {
      const sourceId = 'conn-1';
      const expectedResult = {
        success: true,
      };

      walletsService.disconnectSource.mockResolvedValue(expectedResult);

      const result = await controller.disconnect(mockUser, sourceId);

      expect(walletsService.disconnectSource).toHaveBeenCalledWith(
        mockUser.id,
        sourceId,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle disconnecting non-existent source', async () => {
      const sourceId = 'nonexistent';

      walletsService.disconnectSource.mockRejectedValue(
        new Error('Connected source not found'),
      );

      await expect(controller.disconnect(mockUser, sourceId)).rejects.toThrow(
        'Connected source not found',
      );
    });
  });

  describe('resync', () => {
    it('should resync a wallet source', async () => {
      const sourceId = 'conn-1';
      const expectedResult = {
        success: true,
        message: 'Sync initiated',
        jobId: 'job-123',
      };

      walletsService.resyncSource.mockResolvedValue(expectedResult);

      const result = await controller.resync(mockUser, sourceId);

      expect(walletsService.resyncSource).toHaveBeenCalledWith(
        mockUser.id,
        sourceId,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle resync errors', async () => {
      const sourceId = 'conn-1';

      walletsService.resyncSource.mockRejectedValue(
        new Error('Source is already syncing'),
      );

      await expect(controller.resync(mockUser, sourceId)).rejects.toThrow(
        'Source is already syncing',
      );
    });
  });
});
