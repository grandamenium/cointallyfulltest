import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateTaxInfoDto } from './dto/update-tax-info.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
        twoFactorEnabled: true,
        onboardingCompleted: true,
        taxInfo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If firstName/lastName are null but name exists, split name
    if (user.name && (!user.firstName || !user.lastName)) {
      const nameParts = user.name.split(' ');
      user.firstName = user.firstName || nameParts[0];
      user.lastName = user.lastName || nameParts.slice(1).join(' ') || '';
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // If name is provided but not firstName/lastName, split it
    const updateData: any = { ...dto };
    if (dto.name && !dto.firstName && !dto.lastName) {
      const nameParts = dto.name.split(' ');
      updateData.firstName = nameParts[0];
      updateData.lastName = nameParts.slice(1).join(' ') || '';
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
        twoFactorEnabled: true,
        onboardingCompleted: true,
        taxInfo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      user,
    };
  }

  async updateTaxInfo(userId: string, dto: UpdateTaxInfoDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        taxInfo: dto as any,
      },
      select: {
        taxInfo: true,
      },
    });

    return {
      success: true,
      taxInfo: user.taxInfo,
    };
  }

  async deleteAccount(userId: string) {
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return {
      success: true,
    };
  }
}
