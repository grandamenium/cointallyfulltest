import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { PrismaService } from '../../common/services/prisma.service';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { BulkCategorizeDto } from './dto/bulk-categorize.dto';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let prisma: jest.Mocked<PrismaService>;

  const mockUser = { id: 'user-123', email: 'test@example.com' };

  beforeEach(async () => {
    const mockPrisma = {
      transaction: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    prisma = module.get(PrismaService) as any;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTransactions', () => {
    it('should return transactions for a user', async () => {
      const query: QueryTransactionsDto = {
        limit: 50,
        page: 1,
      };

      const mockTransactions = [
        {
          id: 'tx-1',
          userId: mockUser.id,
          type: 'trade',
          category: 'buy',
          date: new Date(),
        },
        {
          id: 'tx-2',
          userId: mockUser.id,
          type: 'deposit',
          category: 'deposit',
          date: new Date(),
        },
      ];

      (prisma.transaction.findMany as jest.Mock).mockResolvedValue(
        mockTransactions,
      );

      const result = await controller.getTransactions(mockUser, query);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        orderBy: { date: 'desc' },
        take: 50,
        skip: 0,
      });
      expect(result).toEqual(mockTransactions);
    });

    it('should filter transactions by category', async () => {
      const query: QueryTransactionsDto = {
        category: 'buy',
        limit: 50,
      };

      (prisma.transaction.findMany as jest.Mock).mockResolvedValue([]);

      await controller.getTransactions(mockUser, query);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id, category: 'buy' },
        orderBy: { date: 'desc' },
        take: 50,
        skip: 0,
      });
    });

    it('should filter transactions by type', async () => {
      const query: QueryTransactionsDto = {
        type: 'trade',
        limit: 50,
      };

      (prisma.transaction.findMany as jest.Mock).mockResolvedValue([]);

      await controller.getTransactions(mockUser, query);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id, type: 'trade' },
        orderBy: { date: 'desc' },
        take: 50,
        skip: 0,
      });
    });

    it('should filter transactions by date range', async () => {
      const query: QueryTransactionsDto = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        limit: 50,
      };

      (prisma.transaction.findMany as jest.Mock).mockResolvedValue([]);

      await controller.getTransactions(mockUser, query);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: mockUser.id,
            date: {
              gte: new Date('2024-01-01'),
              lte: new Date('2024-12-31'),
            },
          }),
        }),
      );
    });

    it('should support pagination', async () => {
      const query: QueryTransactionsDto = {
        limit: 20,
        page: 3,
      };

      (prisma.transaction.findMany as jest.Mock).mockResolvedValue([]);

      await controller.getTransactions(mockUser, query);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        orderBy: { date: 'desc' },
        take: 20,
        skip: 40, // (page 3 - 1) * 20
      });
    });
  });

  describe('getTransaction', () => {
    it('should return a single transaction', async () => {
      const mockTransaction = {
        id: 'tx-1',
        userId: mockUser.id,
        type: 'trade',
        category: 'buy',
      };

      (prisma.transaction.findFirst as jest.Mock).mockResolvedValue(
        mockTransaction,
      );

      const result = await controller.getTransaction(mockUser, 'tx-1');

      expect(prisma.transaction.findFirst).toHaveBeenCalledWith({
        where: { id: 'tx-1', userId: mockUser.id },
      });
      expect(result).toEqual({ transaction: mockTransaction });
    });

    it('should return error when transaction not found', async () => {
      (prisma.transaction.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await controller.getTransaction(mockUser, 'tx-nonexistent');

      expect(result).toEqual({
        error: 'Transaction not found',
        code: 'NOT_FOUND',
      });
    });
  });

  describe('updateTransaction', () => {
    it('should update a transaction', async () => {
      const dto: UpdateTransactionDto = {
        category: 'staking',
        description: 'ETH staking reward',
      };

      const mockTransaction = {
        id: 'tx-1',
        userId: mockUser.id,
      };

      const updatedTransaction = {
        ...mockTransaction,
        category: dto.category,
        description: dto.description,
        isCategorized: true,
      };

      (prisma.transaction.findFirst as jest.Mock).mockResolvedValue(
        mockTransaction,
      );
      (prisma.transaction.update as jest.Mock).mockResolvedValue(
        updatedTransaction,
      );

      const result = await controller.updateTransaction(
        mockUser,
        'tx-1',
        dto,
      );

      expect(prisma.transaction.update).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        data: updatedTransaction,
      });
    });

    it('should return error when updating non-existent transaction', async () => {
      const dto: UpdateTransactionDto = {
        category: 'personal',
      };

      (prisma.transaction.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await controller.updateTransaction(
        mockUser,
        'tx-nonexistent',
        dto,
      );

      expect(result).toEqual({
        error: 'Transaction not found',
        code: 'NOT_FOUND',
      });
    });
  });

  describe('bulkCategorize', () => {
    it('should categorize multiple transactions', async () => {
      const ids = ['tx-1', 'tx-2', 'tx-3'];
      const dto = {
        ids,
        category: 'buy',
        description: 'Bulk buy transactions',
        getTransactionIds: () => ids,
      } as BulkCategorizeDto;

      const mockTransactions = ids.map((id) => ({
        id,
        userId: mockUser.id,
        category: dto.category,
        description: dto.description,
        isCategorized: true,
      }));

      (prisma.transaction.count as jest.Mock).mockResolvedValue(3);
      (prisma.transaction.updateMany as jest.Mock).mockResolvedValue({
        count: 3,
      });
      (prisma.transaction.findMany as jest.Mock).mockResolvedValue(
        mockTransactions,
      );

      const result = await controller.bulkCategorize(mockUser, dto);

      expect(prisma.transaction.count).toHaveBeenCalledWith({
        where: {
          id: { in: dto.ids },
          userId: mockUser.id,
        },
      });

      expect(prisma.transaction.updateMany).toHaveBeenCalledWith({
        where: {
          id: { in: dto.ids },
          userId: mockUser.id,
        },
        data: {
          category: dto.category,
          description: dto.description,
          isCategorized: true,
        },
      });

      expect(result).toEqual({
        success: true,
        updatedCount: 3,
        transactions: mockTransactions,
      });
    });

    it('should return error when some transactions not found', async () => {
      const ids = ['tx-1', 'tx-2', 'tx-3'];
      const dto = {
        ids,
        category: 'buy',
        getTransactionIds: () => ids,
      } as BulkCategorizeDto;

      (prisma.transaction.count as jest.Mock).mockResolvedValue(2); // Only 2 found

      const result = await controller.bulkCategorize(mockUser, dto);

      expect(result).toEqual({
        error: 'Some transactions not found',
        code: 'NOT_FOUND',
      });
    });
  });
});
