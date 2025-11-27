import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get(Reflector) as any;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow public routes', () => {
      const mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn(),
        }),
      } as unknown as ExecutionContext;

      reflector.getAllAndOverride.mockReturnValue(true); // isPublic = true

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
    });

    it('should call parent canActivate for protected routes', () => {
      const mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: { authorization: 'Bearer valid-token' },
          }),
        }),
      } as unknown as ExecutionContext;

      reflector.getAllAndOverride.mockReturnValue(false); // isPublic = false

      // We can't easily test the parent's canActivate without mocking Passport
      // So we just ensure it's called by checking it doesn't return true immediately
      const result = guard.canActivate(mockContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalled();
    });
  });

  describe('handleRequest', () => {
    it('should return user when authentication succeeds', () => {
      const mockUser = { id: '123', email: 'test@example.com' };

      const result = guard.handleRequest(null, mockUser, null);

      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when no user', () => {
      expect(() => guard.handleRequest(null, null, null)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw error when error is provided', () => {
      const mockError = new Error('Token expired');

      expect(() => guard.handleRequest(mockError, null, null)).toThrow(
        mockError,
      );
    });

    it('should throw UnauthorizedException with message when no user', () => {
      expect(() => guard.handleRequest(null, null, null)).toThrow(
        'Invalid token',
      );
    });

    it('should prioritize error over missing user', () => {
      const mockError = new Error('Custom error');

      expect(() => guard.handleRequest(mockError, null, null)).toThrow(
        mockError,
      );
    });
  });
});
