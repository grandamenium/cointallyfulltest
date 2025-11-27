import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { SyncJobData } from './processors/sync.processor';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class JobsService {
  constructor(
    @InjectQueue('sync-queue') private syncQueue: Queue,
    private prisma: PrismaService,
  ) {}

  async queueSync(data: SyncJobData) {
    const job = await this.syncQueue.add('sync-exchange', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });

    return {
      jobId: job.id,
      status: 'queued',
    };
  }

  async getJobStatus(jobId: string) {
    const job = await this.syncQueue.getJob(jobId);

    if (job) {
      const state = await job.getState();
      const rawProgress = (job as any)._progress;
      const progress = typeof rawProgress === 'number'
        ? Math.max(0, Math.min(100, rawProgress))
        : 0;

      if (state !== 'completed' && state !== 'failed') {
        return {
          id: job.id,
          status: state,
          progress,
          data: job.data,
          result: job.returnvalue,
          failedReason: job.failedReason,
        };
      }
    }

    const syncJob = await this.prisma.syncJob.findFirst({
      where: { bullJobId: jobId },
    });

    if (syncJob) {
      return {
        id: jobId,
        status: syncJob.status === 'completed' ? 'completed'
             : syncJob.status === 'failed' ? 'failed'
             : 'active',
        progress: syncJob.progress,
        data: { syncJobId: syncJob.id, connectedSourceId: syncJob.connectedSourceId },
        result: syncJob.result,
        failedReason: syncJob.errorMessage,
      };
    }

    return null;
  }

  async cancelJob(jobId: string) {
    const job = await this.syncQueue.getJob(jobId);

    if (!job) {
      return null;
    }

    await job.remove();

    return { message: 'Job cancelled successfully' };
  }

  async getQueueStats() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.syncQueue.getWaitingCount(),
      this.syncQueue.getActiveCount(),
      this.syncQueue.getCompletedCount(),
      this.syncQueue.getFailedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
    };
  }

  async updateJobProgress(syncJobId: string, progress: number, details: string) {
    await this.prisma.syncJob.update({
      where: { id: syncJobId },
      data: {
        progress,
        result: { details, updatedAt: new Date().toISOString() },
      },
    });
  }
}
