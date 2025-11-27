import { Controller, Get, Patch, Put, Delete, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateTaxInfoDto } from './dto/update-tax-info.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    return this.userService.getProfile(user.id);
  }

  @Patch('profile')
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(user.id, dto);
  }

  @Put('tax-info')
  async updateTaxInfo(@CurrentUser() user: any, @Body() dto: UpdateTaxInfoDto) {
    return this.userService.updateTaxInfo(user.id, dto);
  }

  @Delete('profile')
  async deleteAccount(@CurrentUser() user: any) {
    return this.userService.deleteAccount(user.id);
  }
}
