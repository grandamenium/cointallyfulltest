import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TwoFactorService } from './two-factor.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

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

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let twoFactorService: jest.Mocked<TwoFactorService>;

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      verifyEmail: jest.fn(),
      validateUser: jest.fn(),
    };

    const mockTwoFactorService = {
      setup: jest.fn(),
      enable: jest.fn(),
      disable: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: TwoFactorService,
          useValue: mockTwoFactorService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService) as jest.Mocked<AuthService>;
    twoFactorService = module.get(TwoFactorService) as jest.Mocked<TwoFactorService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      };

      const expectedResult = {
        user: createMockUserResponse({ email: dto.email, name: dto.name }),
        token: 'token123',
      };

      authService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle registration errors', async () => {
      const dto: RegisterDto = {
        email: 'existing@example.com',
        password: 'Password123!',
        name: 'Test User',
      };

      authService.register.mockRejectedValue(
        new Error('Email already exists'),
      );

      await expect(controller.register(dto)).rejects.toThrow(
        'Email already exists',
      );
    });
  });

  describe('login', () => {
    it('should login a user with valid credentials', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const expectedResult = {
        user: createMockUserResponse({ email: dto.email }),
        token: 'token123',
      };

      authService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle invalid credentials', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      authService.login.mockRejectedValue(new Error('Invalid credentials'));

      await expect(controller.login(dto)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should logout a user', async () => {
      const user = { id: '1', email: 'test@example.com' };

      const result = await controller.logout(user);

      expect(result).toEqual({ success: true });
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      const dto: VerifyEmailDto = {
        token: 'valid-token',
      };

      const expectedResult = {
        success: true,
        message: 'Email verified successfully',
      };

      authService.verifyEmail.mockResolvedValue(expectedResult);

      const result = await controller.verifyEmail(dto);

      expect(authService.verifyEmail).toHaveBeenCalledWith(dto.token);
      expect(result).toEqual(expectedResult);
    });

    it('should handle invalid verification token', async () => {
      const dto: VerifyEmailDto = {
        token: 'invalid-token',
      };

      authService.verifyEmail.mockRejectedValue(
        new Error('Invalid or expired token'),
      );

      await expect(controller.verifyEmail(dto)).rejects.toThrow(
        'Invalid or expired token',
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      const result = await controller.getProfile(user);

      expect(result).toEqual(user);
    });
  });

  describe('setup2FA', () => {
    it('should setup 2FA for user', async () => {
      const user = { id: '1', email: 'test@example.com' };

      const expectedResult = {
        secret: 'secret123',
        qrCode: 'data:image/png;base64,...',
      };

      twoFactorService.setup.mockResolvedValue(expectedResult);

      const result = await controller.setup2FA(user);

      expect(twoFactorService.setup).toHaveBeenCalledWith(user.id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('enable2FA', () => {
    it('should enable 2FA with valid code', async () => {
      const user = { id: '1', email: 'test@example.com' };
      const dto: Verify2FADto = {
        code: '123456',
      };

      const expectedResult = {
        success: true,
        message: '2FA enabled successfully',
      };

      twoFactorService.enable.mockResolvedValue(expectedResult);

      const result = await controller.enable2FA(user, dto);

      expect(twoFactorService.enable).toHaveBeenCalledWith(user.id, dto.code);
      expect(result).toEqual(expectedResult);
    });

    it('should reject invalid 2FA code', async () => {
      const user = { id: '1', email: 'test@example.com' };
      const dto: Verify2FADto = {
        code: '000000',
      };

      twoFactorService.enable.mockRejectedValue(new Error('Invalid code'));

      await expect(controller.enable2FA(user, dto)).rejects.toThrow(
        'Invalid code',
      );
    });
  });

  describe('disable2FA', () => {
    it('should disable 2FA with valid code', async () => {
      const user = { id: '1', email: 'test@example.com' };
      const dto: Verify2FADto = {
        code: '123456',
      };

      const expectedResult = {
        success: true,
        message: '2FA disabled successfully',
      };

      twoFactorService.disable.mockResolvedValue(expectedResult);

      const result = await controller.disable2FA(user, dto);

      expect(twoFactorService.disable).toHaveBeenCalledWith(user.id, dto.code);
      expect(result).toEqual(expectedResult);
    });

    it('should reject invalid 2FA code on disable', async () => {
      const user = { id: '1', email: 'test@example.com' };
      const dto: Verify2FADto = {
        code: '000000',
      };

      twoFactorService.disable.mockRejectedValue(new Error('Invalid code'));

      await expect(controller.disable2FA(user, dto)).rejects.toThrow(
        'Invalid code',
      );
    });
  });
});
