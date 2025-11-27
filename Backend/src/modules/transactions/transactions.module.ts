import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TransactionsController } from './transactions.controller';
import { TransactionNormalizerService } from './services/transaction-normalizer.service';
import { TransferMatcherService } from './services/transfer-matcher.service';
import { CategoryDetectorService } from './services/category-detector.service';
import { TransactionTransformerService } from './services/transaction-transformer.service';
import { PricingService } from './services/pricing.service';
import { PrismaService } from '../../common/services/prisma.service';
import { CoinGeckoService } from '../../common/services/coingecko.service';
import { CapitalGainsService } from '../forms/services/capital-gains.service';

@Module({
  imports: [ConfigModule],
  controllers: [TransactionsController],
  providers: [
    TransactionNormalizerService,
    TransferMatcherService,
    CategoryDetectorService,
    TransactionTransformerService,
    PricingService,
    CoinGeckoService,
    PrismaService,
    CapitalGainsService,
  ],
  exports: [
    TransactionNormalizerService,
    TransferMatcherService,
    CategoryDetectorService,
    TransactionTransformerService,
    PricingService,
  ],
})
export class TransactionsModule {}
