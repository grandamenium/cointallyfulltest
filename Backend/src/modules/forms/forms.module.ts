import { Module } from '@nestjs/common';
import { FormsController } from './forms.controller';
import { FormsService } from './forms.service';
import { PrismaService } from '../../common/services/prisma.service';
import { CapitalGainsService } from './services/capital-gains.service';
import { HtmlGeneratorService } from './services/html-generator.service';
import { PdfGeneratorService } from './services/pdf-generator.service';
import { CsvGeneratorService } from './services/csv-generator.service';

@Module({
  controllers: [FormsController],
  providers: [
    FormsService,
    PrismaService,
    CapitalGainsService,
    HtmlGeneratorService,
    PdfGeneratorService,
    CsvGeneratorService,
  ],
  exports: [FormsService, CapitalGainsService],
})
export class FormsModule {}
