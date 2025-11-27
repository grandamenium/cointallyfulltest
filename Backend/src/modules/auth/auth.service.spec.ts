import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TwoFactorService } from './two-factor.service';
import { PrismaService } from '../../common/services/prisma.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const createMockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  passwordHash: 'hashedPassword',
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

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let twoFactorService: TwoFactorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: TwoFactorService,
          useValue: {
            verifyToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    twoFactorService = module.get<TwoFactorService>(TwoFactorService);
  });

  describe('register', () => {
    it('should create a new user', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(
        createMockUser({
          email: dto.email,
          emailVerified: false,
          emailVerificationToken: 'token',
        }),
      );

      const result = await service.register(dto);

      expect(result).toEqual({
        id: '1',
        email: dto.email,
        emailVerified: false,
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
    });

    it('should throw ConflictException if email exists', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(
        createMockUser({ email: dto.email }),
      );

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return access token for valid credentials', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = createMockUser({ email: dto.email });

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');

      const result = await service.login(dto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(dto.email);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(
        createMockUser({ email: dto.email }),
      );
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should require 2FA when enabled', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(
        createMockUser({
          email: dto.email,
          twoFactorEnabled: true,
          twoFactorSecret: 'secret',
        }),
      );
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.login(dto);

      expect(result).toEqual({
        requiresTwoFactor: true,
        userId: '1',
      });
    });

    it('should login with valid 2FA code', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
        twoFactorCode: '123456',
      };

      const user = createMockUser({
        email: dto.email,
        twoFactorEnabled: true,
        twoFactorSecret: 'secret',
      });

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest.spyOn(twoFactorService, 'verifyToken').mockReturnValue(true);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');

      const result = await service.login(dto);

      expect(result).toHaveProperty('accessToken');
      expect(twoFactorService.verifyToken).toHaveBeenCalledWith('secret', '123456');
    });
  });

  describe('validateUser', () => {
    it('should return user data for valid userId', async () => {
      const user = createMockUser();

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);

      const result = await service.validateUser('1');

      expect(result).toEqual({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    });

    it('should throw UnauthorizedException for invalid userId', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.validateUser('invalid')).rejects.toThrow(UnauthorizedException);
    });
  });
});
