import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from '../auth.service';

const createMockUserResponse = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  firstName: 'Test',
  lastName: 'User',
  emailVerified: true,
  twoFactorEnabled: false,
  onboardingCompleted: false,
  taxInfo: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const mockAuthService = {
      validateUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    authService = module.get(AuthService) as any;
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user when valid', async () => {
      const payload = { sub: 'user-123', email: 'test@example.com' };
      const mockUser = createMockUserResponse({ id: 'user-123' });

      authService.validateUser.mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);

      expect(authService.validateUser).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const payload = { sub: 'nonexistent-user', email: 'test@example.com' };

      (authService.validateUser as jest.Mock).mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user is deleted', async () => {
      const payload = { sub: 'deleted-user', email: 'deleted@example.com' };

      (authService.validateUser as jest.Mock).mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should validate user with correct userId from payload', async () => {
      const payload = { sub: '12345', email: 'user@example.com' };
      const mockUser = createMockUserResponse({
        id: '12345',
        email: 'user@example.com',
        name: 'Another User',
        onboardingCompleted: true,
      });

      authService.validateUser.mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);

      expect(authService.validateUser).toHaveBeenCalledWith('12345');
      expect(result.id).toBe('12345');
    });
  });
});
