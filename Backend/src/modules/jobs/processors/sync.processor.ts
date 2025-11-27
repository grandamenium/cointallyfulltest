import { Processor, Process, InjectQueue } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { ExchangeSyncService } from '../../exchanges/services/exchange-sync.service';
import { BlockchainSyncService } from '../../blockchain/services/blockchain-sync.service';
import { TransactionNormalizerService } from '../../transactions/services/transaction-normalizer.service';
import { TransferMatcherService } from '../../transactions/services/transfer-matcher.service';
import { CategoryDetectorService } from '../../transactions/services/category-detector.service';
import { TransactionTransformerService } from '../../transactions/services/transaction-transformer.service';
import { PrismaService } from '../../../common/services/prisma.service';
import { JobsService } from '../jobs.service';

export interface SyncJobData {
  userId: string;
  connectionId: string;
  syncJobId: string;
  startDate: Date;
  endDate: Date;
}

@Processor('sync-queue')
export class SyncProcessor {
  private readonly logger = new Logger(SyncProcessor.name);

  constructor(
    private exchangeSyncService: ExchangeSyncService,
    private blockchainSyncService: BlockchainSyncService,
    private normalizer: TransactionNormalizerService,
    private transferMatcher: TransferMatcherService,
    private categoryDetector: CategoryDetectorService,
    private transformer: TransactionTransformerService,
    private prisma: PrismaService,
    private jobsService: JobsService,
    @InjectQueue('pricing-queue') private pricingQueue: Queue,
  ) {}

  @Process('sync-exchange')
  async process(job: Job<SyncJobData>): Promise<any> {
    const { userId, connectionId, syncJobId, startDate, endDate } = job.data;

    this.logger.log(`Starting sync job for connection ${connectionId}`);

    try {
      await job.progress(5);
      await this.jobsService.updateJobProgress(syncJobId, 5, 'Starting sync...');

      const syncResult = await this.exchangeSyncService.syncExchange(
        userId,
        connectionId,
        new Date(startDate),
        new Date(endDate),
        async (phase, current, total) => {
          const percent = 5 + Math.floor((current / total) * 45);
          await job.progress(percent);
          await this.jobsService.updateJobProgress(syncJobId, percent, `${phase}: ${current}/${total}`);
        },
      );

      await job.progress(50);
      await this.jobsService.updateJobProgress(syncJobId, 50, 'Processing transactions...');

      const connectedSource = await this.prisma.connectedSource.findUnique({
        where: { id: connectionId },
      });

      const rawTransactions = await this.prisma.rawTransaction.findMany({
        where: {
          userId,
          source: connectedSource?.sourceName,
          processedAt: null,
        },
      });

      this.logger.log(`Normalizing ${rawTransactions.length} transactions`);

      for (let i = 0; i < rawTransactions.length; i++) {
        const rawTx = rawTransactions[i];

        try {
          await this.normalizer.normalizeTransaction(rawTx.id, userId);

          await this.prisma.rawTransaction.update({
            where: { id: rawTx.id },
            data: { processedAt: new Date() },
          });
        } catch (error) {
          this.logger.error(`Error normalizing transaction ${rawTx.id}:`, error.message);
        }

        const progress = 50 + ((i + 1) / rawTransactions.length) * 30;
        await job.progress(progress);
      }

      await job.progress(80);

      this.logger.log('Transforming to transactions');
      const transformedCount = await this.transformer.transformNormalizedTransactions(userId, connectionId);
      this.logger.log(`Transformed ${transformedCount} transactions`);

      await job.progress(85);

      this.logger.log('Matching transfers');
      await this.transferMatcher.findAndMatchTransfers(userId);

      await job.progress(90);

      this.logger.log('Detecting categories');
      await this.categoryDetector.detectCategoriesForUser(userId);

      await job.progress(95);

      this.logger.log('Queuing pricing job');
      await this.pricingQueue.add('price-transactions', { userId });

      await job.progress(100);

      const result = {
        status: 'completed',
        transactionsImported: syncResult.transactionsImported,
      };

      await this.prisma.syncJob.update({
        where: { id: syncJobId },
        data: {
          status: 'completed',
          progress: 100,
          result: result,
          completedAt: new Date(),
        },
      });

      const transactionCount = await this.prisma.transaction.count({
        where: {
          userId,
          sourceId: connectionId,
        },
      });

      await this.prisma.connectedSource.update({
        where: { id: connectionId },
        data: {
          status: 'connected',
          lastSyncedAt: new Date(),
          transactionCount,
        },
      });

      this.logger.log(`Sync job completed for connection ${connectionId}`);

      return result;
    } catch (error) {
      this.logger.error(`Sync job failed for connection ${connectionId}:`, error.message);

      await this.prisma.syncJob.update({
        where: { id: syncJobId },
        data: {
          status: 'failed',
          errorMessage: error.message,
          completedAt: new Date(),
        },
      });

      await this.prisma.connectedSource.update({
        where: { id: connectionId },
        data: {
          status: 'error',
        },
      });

      throw error;
    }
  }

  @Process('sync-wallet')
  async processWalletSync(job: Job<SyncJobData>): Promise<any> {
    const { userId, connectionId, syncJobId, startDate, endDate } = job.data;

    this.logger.log(`Starting wallet sync job for connection ${connectionId}`);

    try {
      await job.progress(10);

      const syncResult = await this.blockchainSyncService.syncWallet(
        userId,
        connectionId,
        new Date(startDate),
        new Date(endDate),
      );

      await job.progress(50);

      const connectedSource = await this.prisma.connectedSource.findUnique({
        where: { id: connectionId },
      });

      const rawTransactions = await this.prisma.rawTransaction.findMany({
        where: {
          userId,
          source: connectedSource?.sourceName,
          processedAt: null,
        },
      });

      this.logger.log(`Normalizing ${rawTransactions.length} wallet transactions`);

      for (let i = 0; i < rawTransactions.length; i++) {
        const rawTx = rawTransactions[i];

        try {
          await this.normalizer.normalizeTransaction(rawTx.id, userId);

          await this.prisma.rawTransaction.update({
            where: { id: rawTx.id },
            data: { processedAt: new Date() },
          });
        } catch (error) {
          this.logger.error(`Error normalizing wallet transaction ${rawTx.id}:`, error.message);
        }

        const progress = 50 + ((i + 1) / rawTransactions.length) * 30;
        await job.progress(progress);
      }

      await job.progress(80);

      this.logger.log('Transforming wallet transactions');
      const transformedCount = await this.transformer.transformNormalizedTransactions(userId, connectionId);
      this.logger.log(`Transformed ${transformedCount} wallet transactions`);

      await job.progress(85);

      this.logger.log('Matching transfers');
      await this.transferMatcher.findAndMatchTransfers(userId);

      await job.progress(90);

      this.logger.log('Detecting categories');
      await this.categoryDetector.detectCategoriesForUser(userId);

      await job.progress(95);

      this.logger.log('Queuing pricing job');
      await this.pricingQueue.add('price-transactions', { userId });

      await job.progress(100);

      const result = {
        status: 'completed',
        transactionsImported: syncResult.transactionsImported,
      };

      await this.prisma.syncJob.update({
        where: { id: syncJobId },
        data: {
          status: 'completed',
          progress: 100,
          result: result,
          completedAt: new Date(),
        },
      });

      const transactionCount = await this.prisma.transaction.count({
        where: {
          userId,
          sourceId: connectionId,
        },
      });

      await this.prisma.connectedSource.update({
        where: { id: connectionId },
        data: {
          status: 'connected',
          lastSyncedAt: new Date(),
          transactionCount,
        },
      });

      this.logger.log(`Wallet sync job completed for connection ${connectionId}`);

      return result;
    } catch (error) {
      this.logger.error(`Wallet sync job failed for connection ${connectionId}:`, error.message);

      await this.prisma.syncJob.update({
        where: { id: syncJobId },
        data: {
          status: 'failed',
          errorMessage: error.message,
          completedAt: new Date(),
        },
      });

      await this.prisma.connectedSource.update({
        where: { id: connectionId },
        data: {
          status: 'error',
        },
      });

      throw error;
    }
  }
}
