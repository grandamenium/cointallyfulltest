import { Test, TestingModule } from '@nestjs/testing';
import { TransactionNormalizerService } from './transaction-normalizer.service';
import { PrismaService } from '../../../common/services/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

const createMockNormalizedTransaction = (overrides = {}) => ({
  id: 'norm-1',
  rawTransactionId: 'raw-1',
  taxYearId: 'ty-1',
  userId: 'user-1',
  source: 'coinbase',
  externalId: 'cb-123',
  kind: 'trade',
  baseAsset: 'BTC',
  baseAmount: new Decimal(0.5),
  quoteAsset: 'USD',
  quoteAmount: new Decimal(10000),
  feeAsset: null,
  feeAmount: null,
  timestamp: new Date('2024-01-01T00:00:00Z'),
  txHash: null,
  category: null,
  notes: null,
  isTransfer: false,
  transferMatchId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('TransactionNormalizerService', () => {
  let service: TransactionNormalizerService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionNormalizerService,
        {
          provide: PrismaService,
          useValue: {
            rawTransaction: {
              findUnique: jest.fn(),
            },
            taxYear: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            normalizedTransaction: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TransactionNormalizerService>(TransactionNormalizerService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('normalizeTransaction', () => {
    it('should normalize a Coinbase trade transaction', async () => {
      const rawTx = {
        id: 'raw-1',
        userId: 'user-1',
        source: 'coinbase',
        externalId: 'cb-123',
        rawData: {
          id: 'cb-123',
          type: 'trade',
          amount: { currency: 'BTC', amount: '0.5' },
          native_amount: { currency: 'USD', amount: '10000' },
          created_at: '2024-01-01T00:00:00Z',
        },
        exchangeConnectionId: 'conn-1',
        processedAt: null,
        createdAt: new Date(),
      };

      const taxYear = {
        id: 'ty-1',
        userId: 'user-1',
        year: 2024,
        country: 'IT',
        filingStatus: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const normalizedTx = createMockNormalizedTransaction();

      jest.spyOn(prismaService.rawTransaction, 'findUnique').mockResolvedValue(rawTx as any);
      jest.spyOn(prismaService.taxYear, 'findUnique').mockResolvedValue(taxYear);
      jest.spyOn(prismaService.normalizedTransaction, 'create').mockResolvedValue(normalizedTx as any);

      const result = await service.normalizeTransaction('raw-1', 'user-1');

      expect(result.kind).toBe('trade');
      expect(result.baseAsset).toBe('BTC');
      expect(result.quoteAsset).toBe('USD');
    });

    it('should normalize a Binance trade transaction', async () => {
      const rawTx = {
        id: 'raw-2',
        userId: 'user-1',
        source: 'binance',
        externalId: 'bn-456',
        rawData: {
          id: 'bn-456',
          symbol: 'BTCUSDT',
          qty: '1.5',
          quoteQty: '45000',
          commission: '0.001',
          commissionAsset: 'BTC',
          time: 1704067200000,
        },
        exchangeConnectionId: 'conn-2',
        processedAt: null,
        createdAt: new Date(),
      };

      const taxYear = {
        id: 'ty-1',
        userId: 'user-1',
        year: 2024,
        country: 'IT',
        filingStatus: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.rawTransaction, 'findUnique').mockResolvedValue(rawTx as any);
      jest.spyOn(prismaService.taxYear, 'findUnique').mockResolvedValue(taxYear);
      jest.spyOn(prismaService.normalizedTransaction, 'create').mockResolvedValue(
        createMockNormalizedTransaction({
          id: 'norm-2',
          rawTransactionId: 'raw-2',
          source: 'binance',
          externalId: 'bn-456',
          baseAmount: new Decimal(1.5),
          quoteAsset: 'USDT',
          quoteAmount: new Decimal(45000),
          feeAsset: 'BTC',
          feeAmount: new Decimal(0.001),
          timestamp: new Date(1704067200000),
        }) as any,
      );

      const result = await service.normalizeTransaction('raw-2', 'user-1');

      expect(result.kind).toBe('trade');
      expect(result.baseAsset).toBe('BTC');
      expect(result.feeAsset).toBe('BTC');
    });

    it('should create tax year if not exists', async () => {
      const rawTx = {
        id: 'raw-3',
        userId: 'user-1',
        source: 'coinbase',
        externalId: 'cb-789',
        rawData: {
          id: 'cb-789',
          type: 'receive',
          amount: { currency: 'ETH', amount: '2' },
          created_at: '2024-01-01T00:00:00Z',
        },
        exchangeConnectionId: 'conn-1',
        processedAt: null,
        createdAt: new Date(),
      };

      const newTaxYear = {
        id: 'ty-2',
        userId: 'user-1',
        year: 2024,
        country: 'IT',
        filingStatus: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.rawTransaction, 'findUnique').mockResolvedValue(rawTx as any);
      jest.spyOn(prismaService.taxYear, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.taxYear, 'create').mockResolvedValue(newTaxYear);
      jest.spyOn(prismaService.normalizedTransaction, 'create').mockResolvedValue(
        createMockNormalizedTransaction({
          id: 'norm-3',
          rawTransactionId: 'raw-3',
          taxYearId: 'ty-2',
          externalId: 'cb-789',
          kind: 'deposit',
          baseAsset: 'ETH',
          baseAmount: new Decimal(2),
          quoteAsset: null,
          quoteAmount: null,
        }) as any,
      );

      await service.normalizeTransaction('raw-3', 'user-1');

      expect(prismaService.taxYear.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', year: 2024 },
      });
    });

    it('should throw error for unsupported exchange', async () => {
      const rawTx = {
        id: 'raw-4',
        userId: 'user-1',
        source: 'unsupported',
        externalId: 'unsup-123',
        rawData: {},
        exchangeConnectionId: null,
        processedAt: null,
        createdAt: new Date(),
      };

      jest.spyOn(prismaService.rawTransaction, 'findUnique').mockResolvedValue(rawTx as any);

      await expect(service.normalizeTransaction('raw-4', 'user-1')).rejects.toThrow(
        'Unsupported exchange: unsupported',
      );
    });
  });
});
