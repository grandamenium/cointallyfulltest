import { Test, TestingModule } from '@nestjs/testing';
import { FormsController } from './forms.controller';
import { FormsService } from './forms.service';
import { GenerateFormDto } from './dto/generate-form.dto';
import { EmailFormDto } from './dto/email-form.dto';
import { Decimal } from '@prisma/client/runtime/library';

const createMockTaxForm = (overrides = {}) => ({
  id: 'form-1',
  userId: 'user-123',
  taxYear: 2024,
  taxMethod: 'FIFO',
  status: 'completed',
  totalGains: new Decimal(5000),
  totalLosses: new Decimal(2000),
  netGainLoss: new Decimal(3000),
  transactionsIncluded: 100,
  files: null,
  generatedAt: new Date(),
  emailSentAt: null,
  errorMessage: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('FormsController', () => {
  let controller: FormsController;
  let formsService: jest.Mocked<FormsService>;

  const mockUser = { id: 'user-123', email: 'test@example.com' };

  beforeEach(async () => {
    const mockFormsService = {
      listForms: jest.fn(),
      generateForm: jest.fn(),
      getForm: jest.fn(),
      getPreview: jest.fn(),
      downloadForm: jest.fn(),
      emailForm: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormsController],
      providers: [
        {
          provide: FormsService,
          useValue: mockFormsService,
        },
      ],
    }).compile();

    controller = module.get<FormsController>(FormsController);
    formsService = module.get(FormsService) as jest.Mocked<FormsService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('listForms', () => {
    it('should return all forms for a user', async () => {
      const mockForms = [
        createMockTaxForm(),
        createMockTaxForm({
          id: 'form-2',
          taxYear: 2023,
          taxMethod: 'LIFO',
          totalGains: new Decimal(3000),
          totalLosses: new Decimal(1000),
          netGainLoss: new Decimal(2000),
          transactionsIncluded: 75,
        }),
      ];

      formsService.listForms.mockResolvedValue(mockForms);

      const result = await controller.listForms(mockUser);

      expect(formsService.listForms).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockForms);
      expect(result).toHaveLength(2);
    });
  });

  describe('generateForm', () => {
    it('should generate a new tax form', async () => {
      const dto: GenerateFormDto = {
        taxYear: 2024,
        taxMethod: 'FIFO',
      };

      const expectedResult = {
        success: true,
        formId: 'form-123',
        status: 'completed',
      };

      formsService.generateForm.mockResolvedValue(expectedResult);

      const result = await controller.generateForm(mockUser, dto);

      expect(formsService.generateForm).toHaveBeenCalledWith(
        mockUser.id,
        dto,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should generate form with LIFO method', async () => {
      const dto: GenerateFormDto = {
        taxYear: 2023,
        taxMethod: 'LIFO',
      };

      const expectedResult = {
        success: true,
        formId: 'form-456',
        status: 'completed',
      };

      formsService.generateForm.mockResolvedValue(expectedResult);

      const result = await controller.generateForm(mockUser, dto);

      expect(result.formId).toBe('form-456');
    });
  });

  describe('getForm', () => {
    it('should return a specific form', async () => {
      const formId = 'form-123';
      const mockForm = {
        form: createMockTaxForm({ id: formId }),
      };

      formsService.getForm.mockResolvedValue(mockForm);

      const result = await controller.getForm(mockUser, formId);

      expect(formsService.getForm).toHaveBeenCalledWith(mockUser.id, formId);
      expect(result).toEqual(mockForm);
    });

    it('should handle form not found', async () => {
      const formId = 'nonexistent';

      formsService.getForm.mockRejectedValue(
        new Error('Form not found'),
      );

      await expect(controller.getForm(mockUser, formId)).rejects.toThrow(
        'Form not found',
      );
    });
  });

  describe('emailForm', () => {
    it('should email form to user email', async () => {
      const formId = 'form-123';
      const dto: EmailFormDto = {};

      const expectedResult = {
        success: true,
        message: 'Form sent to test@example.com',
      };

      formsService.emailForm.mockResolvedValue(expectedResult);

      const result = await controller.emailForm(mockUser, formId, dto);

      expect(formsService.emailForm).toHaveBeenCalledWith(
        mockUser.id,
        formId,
        dto,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should email form to custom email', async () => {
      const formId = 'form-123';
      const dto: EmailFormDto = {
        email: 'accountant@example.com',
      };

      const expectedResult = {
        success: true,
        message: 'Form sent to accountant@example.com',
      };

      formsService.emailForm.mockResolvedValue(expectedResult);

      const result = await controller.emailForm(mockUser, formId, dto);

      expect(result.message).toContain('accountant@example.com');
    });

    it('should handle form not ready to send', async () => {
      const formId = 'form-generating';
      const dto: EmailFormDto = {};

      formsService.emailForm.mockRejectedValue(
        new Error('Form not ready to send'),
      );

      await expect(
        controller.emailForm(mockUser, formId, dto),
      ).rejects.toThrow('Form not ready to send');
    });
  });
});
