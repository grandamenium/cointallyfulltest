import { Injectable, BadRequestException } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import * as yaml from 'yaml';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../../../common/services/prisma.service';
import { TransactionNormalizerService } from '../../transactions/services/transaction-normalizer.service';

interface CsvTemplate {
  name: string;
  columns: Record<string, string>;
  mapping: Record<string, any>;
}

@Injectable()
export class CsvImportService {
  private templates: Map<string, CsvTemplate> = new Map();

  constructor(
    private prisma: PrismaService,
    private normalizer: TransactionNormalizerService,
  ) {
    this.loadTemplates();
  }

  async importCsv(
    userId: string,
    csvContent: string,
    sourceName: string,
    templateName?: string,
  ): Promise<{ imported: number; errors: string[] }> {
    const records = this.parseCsv(csvContent);

    if (records.length === 0) {
      throw new BadRequestException('CSV file is empty');
    }

    const template = templateName
      ? this.templates.get(templateName)
      : this.detectTemplate(records[0]);

    if (!template) {
      throw new BadRequestException('Could not detect CSV format. Please specify a template.');
    }

    const errors: string[] = [];
    let imported = 0;

    for (let i = 0; i < records.length; i++) {
      try {
        const normalizedData = this.mapRecord(records[i], template);

        const rawTx = await this.prisma.rawTransaction.create({
          data: {
            userId,
            source: sourceName,
            externalId: `csv-${sourceName}-${Date.now()}-${i}`,
            rawData: records[i],
          },
        });

        await this.normalizer.normalizeTransaction(rawTx.id, userId);

        imported++;
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    return { imported, errors };
  }

  private parseCsv(content: string): any[] {
    try {
      return parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (error) {
      throw new BadRequestException(`Failed to parse CSV: ${error.message}`);
    }
  }

  private detectTemplate(firstRecord: any): CsvTemplate | null {
    const headers = Object.keys(firstRecord);

    for (const template of this.templates.values()) {
      const requiredColumns = Object.values(template.columns);
      const matchCount = requiredColumns.filter((col) => headers.includes(col)).length;

      if (matchCount >= requiredColumns.length * 0.7) {
        return template;
      }
    }

    return null;
  }

  private mapRecord(record: any, template: CsvTemplate): any {
    const mapped: any = {
      source: template.name.toLowerCase(),
    };

    for (const [key, mapping] of Object.entries(template.mapping)) {
      if (typeof mapping === 'string') {
        const columnName = template.columns[mapping];
        mapped[key] = record[columnName];
      } else if (typeof mapping === 'object') {
        if (mapping.field) {
          const columnName = template.columns[mapping.field];
          const value = record[columnName];

          if (mapping.values) {
            mapped[key] = mapping.values[value] || value;
          } else {
            mapped[key] = value;
          }
        } else if (mapping.extract && mapping.pattern) {
          const columnName = template.columns[mapping.extract];
          const value = record[columnName];
          const match = value?.match(new RegExp(mapping.pattern));
          mapped[key] = match ? match[1] : null;
        }
      }
    }

    if (mapped.timestamp && typeof mapped.timestamp === 'string') {
      mapped.timestamp = new Date(mapped.timestamp);
    }

    return mapped;
  }

  private loadTemplates(): void {
    const templatesDir = path.join(__dirname, '../templates');

    if (!fs.existsSync(templatesDir)) {
      return;
    }

    const files = fs.readdirSync(templatesDir).filter((f) => f.endsWith('.yaml'));

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(templatesDir, file), 'utf-8');
        const template = yaml.parse(content);
        this.templates.set(template.name.toLowerCase(), template);
      } catch (error) {
        console.error(`Failed to load template ${file}:`, error.message);
      }
    }
  }

  getAvailableTemplates(): string[] {
    return Array.from(this.templates.keys());
  }
}
