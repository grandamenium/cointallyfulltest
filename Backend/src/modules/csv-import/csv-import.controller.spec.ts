import { Test, TestingModule } from '@nestjs/testing';
import { CsvImportController } from './csv-import.controller';
import { CsvImportService } from './services/csv-import.service';

describe('CsvImportController', () => {
  let controller: CsvImportController;
  let csvImportService: jest.Mocked<CsvImportService>;

  const mockUser = { id: 'user-123', email: 'test@example.com' };

  beforeEach(async () => {
    const mockCsvImportService = {
      getAvailableTemplates: jest.fn(),
      importCsv: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CsvImportController],
      providers: [
        {
          provide: CsvImportService,
          useValue: mockCsvImportService,
        },
      ],
    }).compile();

    controller = module.get<CsvImportController>(CsvImportController);
    csvImportService = module.get(
      CsvImportService,
    ) as jest.Mocked<CsvImportService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTemplates', () => {
    it('should return available CSV templates', async () => {
      const mockTemplates = [
        'coinbase',
        'binance',
        'kraken',
        'generic',
      ];

      csvImportService.getAvailableTemplates.mockReturnValue(mockTemplates);

      const result = await controller.getTemplates();

      expect(csvImportService.getAvailableTemplates).toHaveBeenCalled();
      expect(result).toEqual({
        templates: mockTemplates,
      });
    });
  });

  describe('importCsv', () => {
    it('should import CSV with template', async () => {
      const csvContent = 'timestamp,type,asset,amount\n2024-01-01,buy,BTC,0.5';
      const body = {
        csvContent,
        sourceName: 'coinbase',
        templateName: 'coinbase',
      };

      const expectedResult = {
        imported: 1,
        errors: [],
      };

      csvImportService.importCsv.mockResolvedValue(expectedResult);

      const result = await controller.importCsv(mockUser, body);

      expect(csvImportService.importCsv).toHaveBeenCalledWith(
        mockUser.id,
        csvContent,
        'coinbase',
        'coinbase',
      );
      expect(result).toEqual(expectedResult);
    });

    it('should import CSV without template (auto-detect)', async () => {
      const csvContent = 'date,action,coin,quantity\n2024-01-01,BUY,ETH,2.0';
      const body = {
        csvContent,
        sourceName: 'manual-import',
      };

      const expectedResult = {
        imported: 1,
        errors: [],
      };

      csvImportService.importCsv.mockResolvedValue(expectedResult);

      const result = await controller.importCsv(mockUser, body);

      expect(csvImportService.importCsv).toHaveBeenCalledWith(
        mockUser.id,
        csvContent,
        'manual-import',
        undefined,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle CSV import with errors', async () => {
      const csvContent = 'timestamp,type,asset,amount\n2024-01-01,buy,BTC,invalid\n2024-01-02,sell,ETH,1.5';
      const body = {
        csvContent,
        sourceName: 'manual',
        templateName: 'generic',
      };

      const expectedResult = {
        imported: 1,
        errors: ['Row 1: Invalid amount value'],
      };

      csvImportService.importCsv.mockResolvedValue(expectedResult);

      const result = await controller.importCsv(mockUser, body);

      expect(result).toEqual(expectedResult);
      expect(result.errors).toHaveLength(1);
    });

    it('should handle empty CSV', async () => {
      const body = {
        csvContent: '',
        sourceName: 'manual',
      };

      csvImportService.importCsv.mockRejectedValue(
        new Error('CSV file is empty'),
      );

      await expect(controller.importCsv(mockUser, body)).rejects.toThrow(
        'CSV file is empty',
      );
    });

    it('should handle invalid CSV format', async () => {
      const body = {
        csvContent: 'invalid csv content without proper structure',
        sourceName: 'manual',
      };

      csvImportService.importCsv.mockRejectedValue(
        new Error('Failed to parse CSV'),
      );

      await expect(controller.importCsv(mockUser, body)).rejects.toThrow(
        'Failed to parse CSV',
      );
    });
  });
});
