import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { PrismaService } from '../../common/services/prisma.service';
import { EncryptionService } from '../../common/services/encryption.service';

describe('WalletsService', () => {
  let service: WalletsService;
  let prisma: jest.Mocked<PrismaService>;
  let encryption: jest.Mocked<EncryptionService>;

  beforeEach(async () => {
    const mockPrisma = {
      connectionSource: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      connectedSource: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
      },
      syncJob: {
        create: jest.fn(),
      },
    };

    const mockEncryption = {
      encrypt: jest.fn((value) => `encrypted_${value}`),
      decrypt: jest.fn((value) => value.replace('encrypted_', '')),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EncryptionService, useValue: mockEncryption },
      ],
    }).compile();

    service = module.get<WalletsService>(WalletsService);
    prisma = module.get(PrismaService) as any;
    encryption = module.get(EncryptionService) as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAvailableSources', () => {
    it('should return all available sources', async () => {
      const mockSources = [
        {
          id: '1',
          name: 'Ethereum',
          type: 'blockchain',
          logo: 'eth.png',
          connectionMethods: ['public_address'],
        },
      ];

      (prisma.connectionSource.findMany as jest.Mock).mockResolvedValue(
        mockSources,
      );

      const result = await service.getAvailableSources();

      expect(result).toEqual(mockSources);
    });
  });

  describe('getConnectedSources', () => {
    it('should return connected sources for a user', async () => {
      const userId = 'user-123';
      const mockConnected = [
        {
          id: 'conn-1',
          userId,
          sourceId: '1',
          sourceName: 'Ethereum',
          address: '0x123',
        },
      ];

      (prisma.connectedSource.findMany as jest.Mock).mockResolvedValue(
        mockConnected,
      );

      const result = await service.getConnectedSources(userId);

      expect(result).toEqual(mockConnected);
    });
  });

  describe('connectSource', () => {
    it('should connect a new wallet source', async () => {
      const userId = 'user-123';
      const dto = {
        sourceId: '1',
        connectionType: 'public_address',
        credentials: { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' },
      };

      const mockSource = {
        id: '1',
        name: 'Ethereum',
        type: 'blockchain',
        connectionMethods: ['public_address'],
      };

      (prisma.connectionSource.findUnique as jest.Mock).mockResolvedValue(
        mockSource,
      );
      (prisma.connectedSource.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.connectedSource.create as jest.Mock).mockResolvedValue({
        id: 'conn-1',
        userId,
        sourceId: dto.sourceId,
        address: dto.credentials.address,
      });

      const result = await service.connectSource(userId, dto);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Ethereum');
    });

    it('should throw error when source not found', async () => {
      const userId = 'user-123';
      const dto = {
        sourceId: 'nonexistent',
        connectionType: 'public_address',
        credentials: { address: '0x123' },
      };

      (prisma.connectionSource.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.connectSource(userId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw error for unsupported connection method', async () => {
      const userId = 'user-123';
      const dto = {
        sourceId: '1',
        connectionType: 'unsupported',
        credentials: { address: '0x123' },
      };

      const mockSource = {
        id: '1',
        name: 'Ethereum',
        connectionMethods: ['public_address'],
      };

      (prisma.connectionSource.findUnique as jest.Mock).mockResolvedValue(
        mockSource,
      );

      await expect(service.connectSource(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error for duplicate wallet address', async () => {
      const userId = 'user-123';
      const dto = {
        sourceId: '1',
        connectionType: 'public_address',
        credentials: { address: '0x123' },
      };

      const mockSource = {
        id: '1',
        name: 'Ethereum',
        connectionMethods: ['public_address'],
      };

      (prisma.connectionSource.findUnique as jest.Mock).mockResolvedValue(
        mockSource,
      );
      (prisma.connectedSource.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing',
      });

      await expect(service.connectSource(userId, dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('disconnectSource', () => {
    it('should disconnect a source', async () => {
      const userId = 'user-123';
      const id = 'conn-1';

      (prisma.connectedSource.findFirst as jest.Mock).mockResolvedValue({
        id,
        userId,
      });

      const result = await service.disconnectSource(userId, id);

      expect(prisma.connectedSource.delete).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result.success).toBe(true);
    });

    it('should throw error when source not found', async () => {
      const userId = 'user-123';
      const id = 'nonexistent';

      (prisma.connectedSource.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.disconnectSource(userId, id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('resyncSource', () => {
    it('should initiate resync for a source', async () => {
      const userId = 'user-123';
      const id = 'conn-1';

      const mockConnected = {
        id,
        userId,
        sourceType: 'blockchain',
      };

      (prisma.connectedSource.findFirst as jest.Mock).mockResolvedValue(
        mockConnected,
      );
      (prisma.connectedSource.update as jest.Mock).mockResolvedValue({});
      (prisma.syncJob.create as jest.Mock).mockResolvedValue({
        id: 'job-123',
      });

      const result = await service.resyncSource(userId, id);

      expect(result.success).toBe(true);
      expect(result.jobId).toBe('job-123');
    });

    it('should throw error when source not found', async () => {
      const userId = 'user-123';
      const id = 'nonexistent';

      (prisma.connectedSource.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.resyncSource(userId, id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
