import { Test, TestingModule } from '@nestjs/testing';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

describe('JobsController', () => {
  let controller: JobsController;
  let jobsService: jest.Mocked<JobsService>;

  beforeEach(async () => {
    const mockJobsService = {
      getJobStatus: jest.fn(),
      getQueueStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [
        {
          provide: JobsService,
          useValue: mockJobsService,
        },
      ],
    }).compile();

    controller = module.get<JobsController>(JobsController);
    jobsService = module.get(JobsService) as jest.Mocked<JobsService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getJobStatus', () => {
    it('should return job status for active job', async () => {
      const jobId = 'job-123';
      const mockJobStatus = {
        id: jobId as any,
        status: 'active' as any,
        progress: 50,
        data: {
          userId: 'user-1',
          exchangeId: 'exchange-1',
        },
        result: null as any,
        failedReason: undefined,
      };

      jobsService.getJobStatus.mockResolvedValue(mockJobStatus);

      const result = await controller.getJobStatus(jobId);

      expect(jobsService.getJobStatus).toHaveBeenCalledWith(jobId);
      expect(result).toEqual(mockJobStatus);
      expect(result!.status).toBe('active');
      expect(result!.progress).toBe(50);
    });

    it('should return job status for completed job', async () => {
      const jobId = 'job-456';
      const mockJobStatus = {
        id: jobId as any,
        status: 'completed' as any,
        progress: 100,
        data: {
          userId: 'user-1',
          exchangeId: 'exchange-1',
        },
        result: {
          transactionsImported: 42,
          syncTime: 5000,
        },
        failedReason: undefined,
      };

      jobsService.getJobStatus.mockResolvedValue(mockJobStatus);

      const result = await controller.getJobStatus(jobId);

      expect(result!.status).toBe('completed');
      expect(result!.result).toBeDefined();
      expect(result!.result.transactionsImported).toBe(42);
    });

    it('should return job status for failed job', async () => {
      const jobId = 'job-789';
      const mockJobStatus = {
        id: jobId as any,
        status: 'failed' as any,
        progress: 30,
        data: {
          userId: 'user-1',
          exchangeId: 'exchange-1',
        },
        result: null as any,
        failedReason: 'API rate limit exceeded',
      };

      jobsService.getJobStatus.mockResolvedValue(mockJobStatus);

      const result = await controller.getJobStatus(jobId);

      expect(result!.status).toBe('failed');
      expect(result!.failedReason).toBe('API rate limit exceeded');
    });

    it('should return null for non-existent job', async () => {
      const jobId = 'nonexistent';

      jobsService.getJobStatus.mockResolvedValue(null);

      const result = await controller.getJobStatus(jobId);

      expect(result).toBeNull();
    });

    it('should return job status for waiting job', async () => {
      const jobId = 'job-waiting';
      const mockJobStatus = {
        id: jobId as any,
        status: 'waiting' as any,
        progress: 0,
        data: {
          userId: 'user-1',
          exchangeId: 'exchange-1',
        },
        result: null as any,
        failedReason: undefined,
      };

      jobsService.getJobStatus.mockResolvedValue(mockJobStatus);

      const result = await controller.getJobStatus(jobId);

      expect(result!.status).toBe('waiting');
      expect(result!.progress).toBe(0);
    });
  });

  describe('getQueueStats', () => {
    it('should return queue statistics', async () => {
      const mockStats = {
        waiting: 5,
        active: 2,
        completed: 100,
        failed: 3,
      };

      jobsService.getQueueStats.mockResolvedValue(mockStats);

      const result = await controller.getQueueStats();

      expect(jobsService.getQueueStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
      expect(result.waiting).toBe(5);
      expect(result.active).toBe(2);
      expect(result.completed).toBe(100);
      expect(result.failed).toBe(3);
    });

    it('should return zero stats for empty queue', async () => {
      const mockStats = {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
      };

      jobsService.getQueueStats.mockResolvedValue(mockStats);

      const result = await controller.getQueueStats();

      expect(result.waiting).toBe(0);
      expect(result.active).toBe(0);
      expect(result.completed).toBe(0);
      expect(result.failed).toBe(0);
    });

    it('should handle high volume queue stats', async () => {
      const mockStats = {
        waiting: 1000,
        active: 10,
        completed: 50000,
        failed: 150,
      };

      jobsService.getQueueStats.mockResolvedValue(mockStats);

      const result = await controller.getQueueStats();

      expect(result.completed).toBe(50000);
      expect(result.waiting).toBe(1000);
    });
  });
});
