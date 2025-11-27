import { Controller, Get, Post, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { WalletsService } from './wallets.service';
import { ConnectSourceDto } from './dto/connect-source.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('wallets')
export class WalletsController {
  constructor(private walletsService: WalletsService) {}

  @Public()
  @Get('sources')
  async getSources() {
    return this.walletsService.getAvailableSources();
  }

  @UseGuards(JwtAuthGuard)
  @Get('connected')
  async getConnected(@CurrentUser() user: any) {
    return this.walletsService.getConnectedSources(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('connect')
  async connect(@CurrentUser() user: any, @Body() dto: ConnectSourceDto) {
    return this.walletsService.connectSource(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('disconnect/:id')
  async disconnect(@CurrentUser() user: any, @Param('id') id: string) {
    return this.walletsService.disconnectSource(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('resync/:id')
  async resync(@CurrentUser() user: any, @Param('id') id: string) {
    return this.walletsService.resyncSource(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-csv/:sourceId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCsv(
    @CurrentUser() user: any,
    @Param('sourceId') sourceId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.originalname.endsWith('.csv')) {
      throw new BadRequestException('Only CSV files are allowed');
    }

    return this.walletsService.uploadCsv(user.id, sourceId, file);
  }
}
