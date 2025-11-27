import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '../../common/services/prisma.service';

const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  passwordHash: 'hash',
  name: 'Test User',
  firstName: 'Test',
  lastName: 'User',
  onboardingCompleted: false,
  emailVerified: true,
  emailVerificationToken: null,
  twoFactorEnabled: false,
  twoFactorSecret: null,
  taxInfo: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('UserService', () => {
  let service: UserService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get(PrismaService) as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const userId = 'user-123';
      const mockUser = createMockUser({
        id: userId,
        onboardingCompleted: true,
        taxInfo: {
          filingYear: 2024,
          state: 'CA',
          filingStatus: 'single',
          incomeBand: '50k-100k',
        },
      });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.getProfile(userId);

      expect(result).toEqual(mockUser);
    });

    it('should throw error when user not found', async () => {
      const userId = 'nonexistent';

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getProfile(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const userId = 'user-123';
      const dto = { name: 'Updated Name', onboardingCompleted: true };
      const mockUpdatedUser = createMockUser({
        id: userId,
        name: dto.name,
        onboardingCompleted: dto.onboardingCompleted,
      });

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

      const result = await service.updateProfile(userId, dto);

      expect(result.success).toBe(true);
      expect(result.user.name).toBe(dto.name);
    });
  });

  describe('updateTaxInfo', () => {
    it('should update tax information', async () => {
      const userId = 'user-123';
      const dto = {
        filingYear: 2024,
        state: 'CA',
        filingStatus: 'single',
        incomeBand: '50k-100k',
      };
      const mockUpdatedUser = createMockUser({
        taxInfo: dto,
      });

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

      const result = await service.updateTaxInfo(userId, dto as any);

      expect(result.success).toBe(true);
      expect(result.taxInfo).toEqual(dto);
    });
  });

  describe('deleteAccount', () => {
    it('should delete user account', async () => {
      const userId = 'user-123';

      (prisma.user.delete as jest.Mock).mockResolvedValue({});

      const result = await service.deleteAccount(userId);

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result.success).toBe(true);
    });
  });
});
