import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { SyncProcessor } from './processors/sync.processor';
import { PricingProcessor } from './processors/pricing.processor';
import { ExchangesModule } from '../exchanges/exchanges.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { PrismaService } from '../../common/services/prisma.service';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'sync-queue',
      },
      {
        name: 'pricing-queue',
      },
    ),
    ExchangesModule,
    BlockchainModule,
    TransactionsModule,
  ],
  controllers: [JobsController],
  providers: [JobsService, SyncProcessor, PricingProcessor, PrismaService],
  exports: [JobsService],
})
export class JobsModule {}
