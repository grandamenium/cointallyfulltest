import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { CsvImportService } from './services/csv-import.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('transactions/import')
@UseGuards(JwtAuthGuard)
export class CsvImportController {
  constructor(private csvImportService: CsvImportService) {}

  @Get('templates')
  async getTemplates() {
    return {
      templates: this.csvImportService.getAvailableTemplates(),
    };
  }

  @Post('csv')
  async importCsv(
    @CurrentUser() user: any,
    @Body() body: { csvContent: string; sourceName: string; templateName?: string },
  ) {
    return this.csvImportService.importCsv(
      user.id,
      body.csvContent,
      body.sourceName,
      body.templateName,
    );
  }
}
