import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CoinGeckoService } from './services/coingecko.service';
import { PrismaService } from '../../common/services/prisma.service';

@Module({
  imports: [HttpModule],
  providers: [CoinGeckoService, PrismaService],
  exports: [CoinGeckoService],
})
export class PricingModule {}
