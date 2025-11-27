import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateTaxInfoDto } from './dto/update-tax-info.dto';

const createMockUserResponse = (overrides = {}) => ({
  id: 'user-123',
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

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  const mockUser = { id: 'user-123', email: 'test@example.com' };

  beforeEach(async () => {
    const mockUserService = {
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
      updateTaxInfo: jest.fn(),
      deleteAccount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService) as jest.Mocked<UserService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const expectedProfile = createMockUserResponse({
        id: mockUser.id,
        email: mockUser.email,
        onboardingCompleted: true,
        taxInfo: {
          filingYear: 2024,
          state: 'CA',
          filingStatus: 'single',
          incomeBand: '50k-100k',
        },
      });

      userService.getProfile.mockResolvedValue(expectedProfile);

      const result = await controller.getProfile(mockUser);

      expect(userService.getProfile).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(expectedProfile);
    });

    it('should handle user not found', async () => {
      userService.getProfile.mockRejectedValue(
        new Error('User not found'),
      );

      await expect(controller.getProfile(mockUser)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const dto: UpdateProfileDto = {
        name: 'Updated Name',
      };

      const expectedResult = {
        success: true,
        user: createMockUserResponse({
          id: mockUser.id,
          email: mockUser.email,
          name: dto.name,
        }),
      };

      userService.updateProfile.mockResolvedValue(expectedResult);

      const result = await controller.updateProfile(mockUser, dto);

      expect(userService.updateProfile).toHaveBeenCalledWith(
        mockUser.id,
        dto,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should update only specified fields', async () => {
      const dto: UpdateProfileDto = {
        name: 'New Name Only',
      };

      const expectedResult = {
        success: true,
        user: createMockUserResponse({
          id: mockUser.id,
          email: mockUser.email,
          name: dto.name,
        }),
      };

      userService.updateProfile.mockResolvedValue(expectedResult);

      const result = await controller.updateProfile(mockUser, dto);

      expect(result.user.name).toBe(dto.name);
    });
  });

  describe('updateTaxInfo', () => {
    it('should update tax information', async () => {
      const dto: UpdateTaxInfoDto = {
        filingYear: 2024,
        state: 'CA',
        filingStatus: 'single',
        incomeBand: '50k-100k',
      };

      const expectedResult = {
        success: true,
        taxInfo: dto as any,
      };

      userService.updateTaxInfo.mockResolvedValue(expectedResult);

      const result = await controller.updateTaxInfo(mockUser, dto);

      expect(userService.updateTaxInfo).toHaveBeenCalledWith(
        mockUser.id,
        dto,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should update tax filing status', async () => {
      const dto: UpdateTaxInfoDto = {
        filingYear: 2024,
        state: 'NY',
        filingStatus: 'married-joint',
        incomeBand: '100k-200k',
      };

      const expectedResult = {
        success: true,
        taxInfo: dto as any,
      };

      userService.updateTaxInfo.mockResolvedValue(expectedResult);

      const result = await controller.updateTaxInfo(mockUser, dto);

      expect((result.taxInfo as any).filingStatus).toBe('married-joint');
    });
  });

  describe('deleteAccount', () => {
    it('should delete user account', async () => {
      const expectedResult = {
        success: true,
      };

      userService.deleteAccount.mockResolvedValue(expectedResult);

      const result = await controller.deleteAccount(mockUser);

      expect(userService.deleteAccount).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(expectedResult);
    });

    it('should handle deletion errors', async () => {
      userService.deleteAccount.mockRejectedValue(
        new Error('Cannot delete account with active subscriptions'),
      );

      await expect(controller.deleteAccount(mockUser)).rejects.toThrow(
        'Cannot delete account with active subscriptions',
      );
    });
  });
});
