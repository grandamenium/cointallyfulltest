import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlockchainAdapterFactory } from './services/blockchain-adapter.factory';
import { BlockchainSyncService } from './services/blockchain-sync.service';
import { PrismaService } from '../../common/services/prisma.service';

@Module({
  imports: [ConfigModule],
  providers: [PrismaService, BlockchainAdapterFactory, BlockchainSyncService],
  exports: [BlockchainSyncService, BlockchainAdapterFactory],
})
export class BlockchainModule {}
