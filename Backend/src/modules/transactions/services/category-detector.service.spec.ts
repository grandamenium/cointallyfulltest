import { Test, TestingModule } from '@nestjs/testing';
import { CategoryDetectorService, TransactionCategory } from './category-detector.service';
import { PrismaService } from '../../../common/services/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

const createMockNormalizedTransaction = (overrides = {}) => ({
  id: 'tx-1',
  userId: 'user-1',
  source: 'coinbase',
  externalId: 'ext-1',
  rawTransactionId: 'raw-1',
  taxYearId: 'ty-1',
  kind: 'trade',
  baseAsset: 'BTC',
  baseAmount: new Decimal(1.0),
  quoteAsset: 'USD',
  quoteAmount: new Decimal(30000),
  feeAsset: null,
  feeAmount: null,
  timestamp: new Date(),
  txHash: null,
  category: null,
  notes: null,
  isTransfer: false,
  transferMatchId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('CategoryDetectorService', () => {
  let service: CategoryDetectorService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryDetectorService,
        {
          provide: PrismaService,
          useValue: {
            normalizedTransaction: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CategoryDetectorService>(CategoryDetectorService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('detectAndUpdateCategory', () => {
    it('should detect spot trade category', async () => {
      const transaction = createMockNormalizedTransaction({
        id: 'tx-1',
        kind: 'trade',
      });

      jest.spyOn(prismaService.normalizedTransaction, 'findUnique').mockResolvedValue(transaction as any);
      jest.spyOn(prismaService.normalizedTransaction, 'update').mockResolvedValue({
        ...transaction,
        category: TransactionCategory.SPOT_TRADE,
      } as any);

      const category = await service.detectAndUpdateCategory('tx-1');

      expect(category).toBe(TransactionCategory.SPOT_TRADE);
      expect(prismaService.normalizedTransaction.update).toHaveBeenCalledWith({
        where: { id: 'tx-1' },
        data: { category: TransactionCategory.SPOT_TRADE },
      });
    });

    it('should detect internal transfer category', async () => {
      const transaction = createMockNormalizedTransaction({
        id: 'tx-2',
        kind: 'withdrawal',
        baseAsset: 'ETH',
        baseAmount: new Decimal(5.0),
        isTransfer: true,
      });

      jest.spyOn(prismaService.normalizedTransaction, 'findUnique').mockResolvedValue(transaction as any);
      jest.spyOn(prismaService.normalizedTransaction, 'update').mockResolvedValue({
        ...transaction,
        category: TransactionCategory.INTERNAL_TRANSFER,
      } as any);

      const category = await service.detectAndUpdateCategory('tx-2');

      expect(category).toBe(TransactionCategory.INTERNAL_TRANSFER);
    });

    it('should detect staking reward category', async () => {
      const transaction = createMockNormalizedTransaction({
        id: 'tx-3',
        kind: 'income',
        baseAsset: 'ETH',
        baseAmount: new Decimal(0.1),
        isTransfer: false,
        notes: 'Staking reward',
      });

      jest.spyOn(prismaService.normalizedTransaction, 'findUnique').mockResolvedValue(transaction as any);
      jest.spyOn(prismaService.normalizedTransaction, 'update').mockResolvedValue({
        ...transaction,
        category: TransactionCategory.STAKING_REWARD,
      } as any);

      const category = await service.detectAndUpdateCategory('tx-3');

      expect(category).toBe(TransactionCategory.STAKING_REWARD);
    });

    it('should detect external deposit category', async () => {
      const transaction = createMockNormalizedTransaction({
        id: 'tx-4',
        kind: 'deposit',
        baseAsset: 'BTC',
        baseAmount: new Decimal(2.0),
        isTransfer: false,
      });

      jest.spyOn(prismaService.normalizedTransaction, 'findUnique').mockResolvedValue(transaction as any);
      jest.spyOn(prismaService.normalizedTransaction, 'update').mockResolvedValue({
        ...transaction,
        category: TransactionCategory.EXTERNAL_DEPOSIT,
      } as any);

      const category = await service.detectAndUpdateCategory('tx-4');

      expect(category).toBe(TransactionCategory.EXTERNAL_DEPOSIT);
    });

    it('should detect fee category', async () => {
      const transaction = createMockNormalizedTransaction({
        id: 'tx-5',
        kind: 'fee',
        baseAsset: 'BTC',
        baseAmount: new Decimal(0.0001),
        isTransfer: false,
      });

      jest.spyOn(prismaService.normalizedTransaction, 'findUnique').mockResolvedValue(transaction as any);
      jest.spyOn(prismaService.normalizedTransaction, 'update').mockResolvedValue({
        ...transaction,
        category: TransactionCategory.FEE,
      } as any);

      const category = await service.detectAndUpdateCategory('tx-5');

      expect(category).toBe(TransactionCategory.FEE);
    });
  });

  describe('detectCategoriesForUser', () => {
    it('should detect categories for all user transactions', async () => {
      const transactions = [
        createMockNormalizedTransaction({
          id: 'tx-1',
          kind: 'trade',
          category: null,
        }),
        createMockNormalizedTransaction({
          id: 'tx-2',
          kind: 'deposit',
          baseAsset: 'ETH',
          baseAmount: new Decimal(5.0),
          category: null,
        }),
      ];

      jest.spyOn(prismaService.normalizedTransaction, 'findMany').mockResolvedValue(transactions as any);
      jest.spyOn(prismaService.normalizedTransaction, 'update').mockResolvedValue(transactions[0] as any);

      const count = await service.detectCategoriesForUser('user-1');

      expect(count).toBe(2);
      expect(prismaService.normalizedTransaction.update).toHaveBeenCalledTimes(2);
    });
  });
});
