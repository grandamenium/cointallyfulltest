import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PricingService } from '../../transactions/services/pricing.service';

export interface PricingJobData {
  userId: string;
}

@Processor('pricing-queue')
export class PricingProcessor {
  private readonly logger = new Logger(PricingProcessor.name);

  constructor(private pricingService: PricingService) {}

  @Process('price-transactions')
  async process(job: Job<PricingJobData>): Promise<any> {
    const { userId } = job.data;

    this.logger.log(`Starting pricing job for user ${userId}`);

    try {
      await job.progress(10);

      const batchSize = 50;
      let totalPriced = 0;
      let batchCount = 0;

      while (true) {
        const pricedCount = await this.pricingService.priceTransactionBatch(userId, batchSize);

        if (pricedCount === 0) {
          break;
        }

        totalPriced += pricedCount;
        batchCount++;

        const progress = Math.min(90, 10 + (batchCount * 10));
        await job.progress(progress);

        this.logger.log(`Priced batch ${batchCount}: ${pricedCount} transactions (total: ${totalPriced})`);

        if (pricedCount < batchSize) {
          break;
        }
      }

      await job.progress(100);

      this.logger.log(`Pricing job completed for user ${userId}. Total priced: ${totalPriced}`);

      return {
        status: 'completed',
        transactionsPriced: totalPriced,
      };
    } catch (error) {
      this.logger.error(`Pricing job failed for user ${userId}:`, error.message);
      throw error;
    }
  }
}
