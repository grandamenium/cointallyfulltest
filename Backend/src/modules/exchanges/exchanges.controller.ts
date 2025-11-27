import { Controller, Get, Post, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ExchangeSyncService } from './services/exchange-sync.service';
import { ConnectExchangeDto } from './dto/connect-exchange.dto';
import { SyncExchangeDto } from './dto/sync-exchange.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('exchanges')
@UseGuards(JwtAuthGuard)
export class ExchangesController {
  constructor(private exchangeSyncService: ExchangeSyncService) {}

  @Get()
  async getExchanges(@CurrentUser() user: any) {
    return this.exchangeSyncService.getExchangeConnections(user.id);
  }

  @Post('connect')
  async connectExchange(@CurrentUser() user: any, @Body() dto: ConnectExchangeDto) {
    return this.exchangeSyncService.connectExchange(user.id, dto);
  }

  @Delete(':id')
  async disconnectExchange(@CurrentUser() user: any, @Param('id') id: string) {
    return this.exchangeSyncService.disconnectExchange(user.id, id);
  }

  @Post(':id/sync')
  async syncExchange(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: SyncExchangeDto,
  ) {
    const startDate = dto.startDate ? new Date(dto.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dto.endDate ? new Date(dto.endDate) : new Date();

    return this.exchangeSyncService.syncExchange(user.id, id, startDate, endDate);
  }
}
