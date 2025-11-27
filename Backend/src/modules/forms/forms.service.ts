import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { GenerateFormDto } from './dto/generate-form.dto';
import { EmailFormDto } from './dto/email-form.dto';
import { CapitalGainsService } from './services/capital-gains.service';
import { HtmlGeneratorService } from './services/html-generator.service';
import { PdfGeneratorService } from './services/pdf-generator.service';
import { CsvGeneratorService } from './services/csv-generator.service';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class FormsService {
  constructor(
    private prisma: PrismaService,
    private capitalGainsService: CapitalGainsService,
    private htmlGeneratorService: HtmlGeneratorService,
    private pdfGeneratorService: PdfGeneratorService,
    private csvGeneratorService: CsvGeneratorService,
  ) {}

  async listForms(userId: string) {
    return this.prisma.taxForm.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        taxYear: true,
        taxMethod: true,
        status: true,
        totalGains: true,
        totalLosses: true,
        netGainLoss: true,
        transactionsIncluded: true,
        files: true,
        generatedAt: true,
        emailSentAt: true,
        createdAt: true,
      },
    });
  }

  async generateForm(userId: string, dto: GenerateFormDto) {
    const form = await this.prisma.taxForm.create({
      data: {
        userId,
        taxYear: dto.taxYear,
        taxMethod: dto.taxMethod,
        status: 'generating',
      },
    });

    try {
      const calculations = await this.capitalGainsService.calculate(
        userId,
        dto.taxYear,
        dto.taxMethod,
      );

      const htmlContent = this.htmlGeneratorService.generate(
        calculations,
        dto.taxYear,
        dto.taxMethod,
      );

      const form8949Buffer = await this.pdfGeneratorService.generateForm8949(
        calculations.items,
        dto.taxYear,
      );

      const scheduleDBuffer = await this.pdfGeneratorService.generateScheduleD(
        calculations,
        dto.taxYear,
      );

      const csvContent = this.csvGeneratorService.generateForm8949CSV(
        calculations.items,
        dto.taxYear,
      );

      const turboTaxCsv = this.csvGeneratorService.generateTurboTaxCSV(
        calculations.items,
        dto.taxYear,
      );

      const uploadsDir = path.join(process.cwd(), 'uploads', 'forms', form.id);
      await fs.mkdir(uploadsDir, { recursive: true });

      await fs.writeFile(path.join(uploadsDir, 'form-8949.pdf'), form8949Buffer);
      await fs.writeFile(path.join(uploadsDir, 'schedule-d.pdf'), scheduleDBuffer);
      await fs.writeFile(path.join(uploadsDir, 'transactions.csv'), csvContent);
      await fs.writeFile(path.join(uploadsDir, 'turbotax.csv'), turboTaxCsv);

      const files = {
        form8949: `/uploads/forms/${form.id}/form-8949.pdf`,
        scheduleD: `/uploads/forms/${form.id}/schedule-d.pdf`,
        detailedCsv: `/uploads/forms/${form.id}/transactions.csv`,
        turboTaxCsv: `/uploads/forms/${form.id}/turbotax.csv`,
        htmlPreview: htmlContent,
      };

      await this.prisma.taxForm.update({
        where: { id: form.id },
        data: {
          status: 'completed',
          totalGains: calculations.totalGains,
          totalLosses: calculations.totalLosses,
          netGainLoss: calculations.netGainLoss,
          transactionsIncluded: calculations.transactionsIncluded,
          files,
          generatedAt: new Date(),
        },
      });

      return {
        success: true,
        id: form.id,
        formId: form.id,
        status: 'completed',
        files,
      };
    } catch (error) {
      await this.prisma.taxForm.update({
        where: { id: form.id },
        data: {
          status: 'error',
          errorMessage: error.message,
        },
      });

      throw error;
    }
  }

  async getForm(userId: string, id: string) {
    const form = await this.prisma.taxForm.findFirst({
      where: { id, userId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    return { form };
  }

  async downloadForm(
    userId: string,
    id: string,
    format: string,
  ): Promise<{ filePath: string; fileName: string; contentType: string }> {
    const form = await this.prisma.taxForm.findFirst({
      where: { id, userId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (form.status !== 'completed') {
      throw new Error('Form not ready for download');
    }

    const files = form.files as any;
    const baseDir = path.join(process.cwd(), 'uploads', 'forms', id);

    switch (format) {
      case 'pdf':
      case 'form8949':
        return {
          filePath: path.join(baseDir, 'form-8949.pdf'),
          fileName: `Form-8949-${form.taxYear}.pdf`,
          contentType: 'application/pdf',
        };
      case 'scheduled':
        return {
          filePath: path.join(baseDir, 'schedule-d.pdf'),
          fileName: `Schedule-D-${form.taxYear}.pdf`,
          contentType: 'application/pdf',
        };
      case 'csv':
        return {
          filePath: path.join(baseDir, 'transactions.csv'),
          fileName: `Transactions-${form.taxYear}.csv`,
          contentType: 'text/csv',
        };
      case 'turbotax':
        return {
          filePath: path.join(baseDir, 'turbotax.csv'),
          fileName: `TurboTax-Import-${form.taxYear}.csv`,
          contentType: 'text/csv',
        };
      case 'taxact':
        return {
          filePath: path.join(baseDir, 'transactions.csv'),
          fileName: `TaxAct-Import-${form.taxYear}.csv`,
          contentType: 'text/csv',
        };
      default:
        return {
          filePath: path.join(baseDir, 'form-8949.pdf'),
          fileName: `Form-8949-${form.taxYear}.pdf`,
          contentType: 'application/pdf',
        };
    }
  }

  async getPreview(userId: string, id: string): Promise<string> {
    const form = await this.prisma.taxForm.findFirst({
      where: { id, userId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (form.status !== 'completed') {
      throw new Error('Form not ready for preview');
    }

    const files = form.files as any;
    if (!files?.htmlPreview) {
      throw new NotFoundException('Preview not available');
    }

    return files.htmlPreview;
  }

  async emailForm(userId: string, id: string, dto: EmailFormDto) {
    const form = await this.prisma.taxForm.findFirst({
      where: { id, userId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (form.status !== 'completed') {
      throw new Error('Form not ready to send');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    const emailTo = dto.email || user?.email;

    await this.prisma.taxForm.update({
      where: { id },
      data: { emailSentAt: new Date() },
    });

    return {
      success: true,
      message: `Form sent to ${emailTo}`,
    };
  }

  async deleteForm(userId: string, id: string) {
    const form = await this.prisma.taxForm.findFirst({
      where: { id, userId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    const uploadsDir = path.join(process.cwd(), 'uploads', 'forms', id);
    try {
      await fs.rm(uploadsDir, { recursive: true, force: true });
    } catch {
    }

    await this.prisma.taxForm.delete({
      where: { id },
    });

    return { success: true };
  }
}
