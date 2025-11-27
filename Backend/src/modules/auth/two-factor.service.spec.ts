import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { TwoFactorService } from './two-factor.service';
import { PrismaService } from '../../common/services/prisma.service';
import { authenticator } from 'otplib';

jest.mock('otplib');
jest.mock('qrcode');

const createMockUser = (overrides = {}) => ({
  id: '1',
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

describe('TwoFactorService', () => {
  let service: TwoFactorService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwoFactorService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TwoFactorService>(TwoFactorService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('setup', () => {
    it('should generate 2FA secret and QR code', async () => {
      const user = createMockUser();

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);
      jest.spyOn(authenticator, 'generateSecret').mockReturnValue('secret');
      jest.spyOn(authenticator, 'keyuri').mockReturnValue('otpauth://totp/...');
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(user);

      const qrcode = require('qrcode');
      qrcode.toDataURL = jest.fn().mockResolvedValue('data:image/png;base64,...');

      const result = await service.setup('1');

      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('qrCode');
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { twoFactorSecret: 'secret' },
      });
    });

    it('should throw BadRequestException if 2FA already enabled', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(
        createMockUser({ twoFactorEnabled: true }),
      );

      await expect(service.setup('1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('enable', () => {
    it('should enable 2FA with valid code', async () => {
      const user = createMockUser({ twoFactorSecret: 'secret' });

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);
      jest.spyOn(authenticator, 'verify').mockReturnValue(true);
      jest.spyOn(prismaService.user, 'update').mockResolvedValue({ ...user });

      const result = await service.enable('1', '123456');

      expect(result.message).toBe('2FA enabled successfully');
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { twoFactorEnabled: true },
      });
    });

    it('should throw BadRequestException for invalid code', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(
        createMockUser({ twoFactorSecret: 'secret' }),
      );
      jest.spyOn(authenticator, 'verify').mockReturnValue(false);

      await expect(service.enable('1', 'invalid')).rejects.toThrow(BadRequestException);
    });
  });

  describe('disable', () => {
    it('should disable 2FA with valid code', async () => {
      const user = createMockUser({
        twoFactorEnabled: true,
        twoFactorSecret: 'secret',
      });

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);
      jest.spyOn(authenticator, 'verify').mockReturnValue(true);
      jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        ...user,
      });

      const result = await service.disable('1', '123456');

      expect(result.message).toBe('2FA disabled successfully');
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
        },
      });
    });

    it('should throw BadRequestException if 2FA not enabled', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(
        createMockUser({ twoFactorEnabled: false }),
      );

      await expect(service.disable('1', '123456')).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyToken', () => {
    it('should return true for valid token', () => {
      jest.spyOn(authenticator, 'verify').mockReturnValue(true);

      const result = service.verifyToken('secret', '123456');

      expect(result).toBe(true);
    });

    it('should return false for invalid token', () => {
      jest.spyOn(authenticator, 'verify').mockReturnValue(false);

      const result = service.verifyToken('secret', 'invalid');

      expect(result).toBe(false);
    });

    it('should return false on error', () => {
      jest.spyOn(authenticator, 'verify').mockImplementation(() => {
        throw new Error('Invalid');
      });

      const result = service.verifyToken('secret', 'invalid');

      expect(result).toBe(false);
    });
  });
});
