import { Test, TestingModule } from '@nestjs/testing';
import { TransferMatcherService } from './transfer-matcher.service';
import { PrismaService } from '../../../common/services/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

const createMockNormalizedTransaction = (overrides = {}) => ({
  id: 'tx-1',
  userId: 'user-1',
  source: 'binance',
  externalId: 'ext-1',
  rawTransactionId: 'raw-1',
  taxYearId: 'ty-1',
  kind: 'withdrawal',
  baseAsset: 'BTC',
  baseAmount: new Decimal(1.0),
  quoteAsset: null,
  quoteAmount: null,
  feeAsset: null,
  feeAmount: null,
  timestamp: new Date('2024-01-01T12:00:00Z'),
  txHash: null,
  category: null,
  notes: null,
  isTransfer: false,
  transferMatchId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('TransferMatcherService', () => {
  let service: TransferMatcherService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransferMatcherService,
        {
          provide: PrismaService,
          useValue: {
            normalizedTransaction: {
              findMany: jest.fn(),
              updateMany: jest.fn(),
            },
            transferMatch: {
              create: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TransferMatcherService>(TransferMatcherService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('findAndMatchTransfers', () => {
    it('should match transfers by hash', async () => {
      const withdrawal = createMockNormalizedTransaction({
        id: 'tx-1',
        kind: 'withdrawal',
        txHash: 'hash123',
        source: 'binance',
      });

      const deposit = createMockNormalizedTransaction({
        id: 'tx-2',
        kind: 'deposit',
        txHash: 'hash123',
        source: 'coinbase',
        timestamp: new Date('2024-01-01T12:05:00Z'),
      });

      jest
        .spyOn(prismaService.normalizedTransaction, 'findMany')
        .mockResolvedValueOnce([withdrawal] as any)
        .mockResolvedValueOnce([deposit] as any);

      jest.spyOn(prismaService.transferMatch, 'create').mockResolvedValue({
        id: 'match-1',
        withdrawalTxId: 'tx-1',
        depositTxId: 'tx-2',
        matchConfidence: new Decimal(1.0),
        matchMethod: 'tx_hash',
        createdAt: new Date(),
      });

      jest.spyOn(prismaService.normalizedTransaction, 'updateMany').mockResolvedValue({
        count: 2,
      });

      const matchCount = await service.findAndMatchTransfers('user-1');

      expect(matchCount).toBe(1);
      expect(prismaService.transferMatch.create).toHaveBeenCalledWith({
        data: {
          withdrawalTxId: 'tx-1',
          depositTxId: 'tx-2',
          matchConfidence: 1.0,
          matchMethod: 'tx_hash',
        },
      });
    });

    it('should match transfers by amount and time', async () => {
      const withdrawal = createMockNormalizedTransaction({
        id: 'tx-3',
        kind: 'withdrawal',
        baseAsset: 'ETH',
        baseAmount: new Decimal(5.0),
        txHash: null,
        source: 'binance',
      });

      const deposit = createMockNormalizedTransaction({
        id: 'tx-4',
        kind: 'deposit',
        baseAsset: 'ETH',
        baseAmount: new Decimal(5.0),
        timestamp: new Date('2024-01-01T12:10:00Z'),
        txHash: null,
        source: 'coinbase',
      });

      jest
        .spyOn(prismaService.normalizedTransaction, 'findMany')
        .mockResolvedValueOnce([withdrawal] as any)
        .mockResolvedValueOnce([deposit] as any);

      jest.spyOn(prismaService.transferMatch, 'create').mockResolvedValue({
        id: 'match-2',
        withdrawalTxId: 'tx-3',
        depositTxId: 'tx-4',
        matchConfidence: new Decimal(0.7),
        matchMethod: 'amount_time',
        createdAt: new Date(),
      });

      jest.spyOn(prismaService.normalizedTransaction, 'updateMany').mockResolvedValue({
        count: 2,
      });

      const matchCount = await service.findAndMatchTransfers('user-1');

      expect(matchCount).toBe(1);
      expect(prismaService.transferMatch.create).toHaveBeenCalled();
    });

    it('should match transfers with fee adjustment', async () => {
      const withdrawal = createMockNormalizedTransaction({
        id: 'tx-5',
        kind: 'withdrawal',
        baseAsset: 'BTC',
        baseAmount: new Decimal(1.0),
        feeAmount: new Decimal(0.0001),
        feeAsset: 'BTC',
        txHash: null,
        source: 'binance',
      });

      const deposit = createMockNormalizedTransaction({
        id: 'tx-6',
        kind: 'deposit',
        baseAsset: 'BTC',
        baseAmount: new Decimal(0.9999),
        timestamp: new Date('2024-01-01T12:15:00Z'),
        txHash: null,
        source: 'coinbase',
      });

      jest
        .spyOn(prismaService.normalizedTransaction, 'findMany')
        .mockResolvedValueOnce([withdrawal] as any)
        .mockResolvedValueOnce([deposit] as any);

      jest.spyOn(prismaService.transferMatch, 'create').mockResolvedValue({
        id: 'match-3',
        withdrawalTxId: 'tx-5',
        depositTxId: 'tx-6',
        matchConfidence: new Decimal(0.665),
        matchMethod: 'amount_time_fee_adjusted',
        createdAt: new Date(),
      });

      jest.spyOn(prismaService.normalizedTransaction, 'updateMany').mockResolvedValue({
        count: 2,
      });

      const matchCount = await service.findAndMatchTransfers('user-1');

      expect(matchCount).toBe(1);
    });

    it('should not match transfers from same source', async () => {
      const withdrawal = createMockNormalizedTransaction({
        id: 'tx-7',
        kind: 'withdrawal',
        txHash: null,
        source: 'binance',
      });

      const deposit = createMockNormalizedTransaction({
        id: 'tx-8',
        kind: 'deposit',
        timestamp: new Date('2024-01-01T12:05:00Z'),
        txHash: null,
        source: 'binance',
      });

      jest
        .spyOn(prismaService.normalizedTransaction, 'findMany')
        .mockResolvedValueOnce([withdrawal] as any)
        .mockResolvedValueOnce([deposit] as any);

      const matchCount = await service.findAndMatchTransfers('user-1');

      expect(matchCount).toBe(0);
      expect(prismaService.transferMatch.create).not.toHaveBeenCalled();
    });
  });

  describe('unmatchTransfer', () => {
    it('should unmatch a transfer', async () => {
      jest.spyOn(prismaService.normalizedTransaction, 'updateMany').mockResolvedValue({
        count: 2,
      });

      jest.spyOn(prismaService.transferMatch, 'delete').mockResolvedValue({
        id: 'match-1',
        withdrawalTxId: 'tx-1',
        depositTxId: 'tx-2',
        matchConfidence: new Decimal(1.0),
        matchMethod: 'tx_hash',
        createdAt: new Date(),
      });

      await service.unmatchTransfer('match-1');

      expect(prismaService.normalizedTransaction.updateMany).toHaveBeenCalledWith({
        where: { transferMatchId: 'match-1' },
        data: {
          isTransfer: false,
          transferMatchId: null,
        },
      });

      expect(prismaService.transferMatch.delete).toHaveBeenCalledWith({
        where: { id: 'match-1' },
      });
    });
  });
});
