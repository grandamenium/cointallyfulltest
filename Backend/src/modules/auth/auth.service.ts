import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../common/services/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TwoFactorService } from './two-factor.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private twoFactorService: TwoFactorService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Auto-split name into firstName/lastName if not provided
    let firstName = dto.firstName;
    let lastName = dto.lastName;

    if (!firstName || !lastName) {
      const nameParts = dto.name.split(' ');
      firstName = firstName || nameParts[0];
      lastName = lastName || nameParts.slice(1).join(' ') || '';
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        firstName,
        lastName,
      },
    });

    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        onboardingCompleted: user.onboardingCompleted,
        taxInfo: user.taxInfo,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user.id, user.email);

    // Auto-split name if firstName/lastName are missing
    let { firstName, lastName } = user;
    if (!firstName || !lastName) {
      const nameParts = user.name.split(' ');
      firstName = firstName || nameParts[0];
      lastName = lastName || nameParts.slice(1).join(' ') || '';
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName,
        lastName,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        onboardingCompleted: user.onboardingCompleted,
        taxInfo: user.taxInfo,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Auto-split name if firstName/lastName are missing
    let { firstName, lastName } = user;
    if (!firstName || !lastName) {
      const nameParts = user.name.split(' ');
      firstName = firstName || nameParts[0];
      lastName = lastName || nameParts.slice(1).join(' ') || '';
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      firstName,
      lastName,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      onboardingCompleted: user.onboardingCompleted,
      taxInfo: user.taxInfo,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private generateToken(userId: string, email: string): string {
    return this.jwtService.sign(
      { sub: userId, email },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRATION || '7d',
      },
    );
  }
}
