import { Injectable } from '@nestjs/common';
import { CapitalGainItem } from './capital-gains.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CsvGeneratorService {
  private formatDate(date: Date): string {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  }

  private roundToWholeDollars(value: Decimal | number): number {
    const num = typeof value === 'number' ? value : parseFloat(value.toString());
    return Math.round(num);
  }

  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  generateForm8949CSV(items: CapitalGainItem[], taxYear: number): string {
    const headers = [
      'Description',
      'Date Acquired',
      'Date Sold',
      'Proceeds',
      'Cost Basis',
      'Adjustment Code',
      'Adjustment Amount',
      'Gain or Loss',
      'Term',
      'Tax Year',
    ];

    const rows: string[] = [headers.join(',')];

    for (const item of items) {
      const row = [
        this.escapeCSV(item.description),
        this.formatDate(item.dateAcquired),
        this.formatDate(item.dateSold),
        this.roundToWholeDollars(item.proceeds).toString(),
        this.roundToWholeDollars(item.costBasis).toString(),
        '',
        '',
        this.roundToWholeDollars(item.gainOrLoss).toString(),
        item.isLongTerm ? 'Long' : 'Short',
        taxYear.toString(),
      ];
      rows.push(row.join(','));
    }

    return rows.join('\n');
  }

  generateTurboTaxCSV(items: CapitalGainItem[], taxYear: number): string {
    const headers = [
      'Description of Property',
      'Date Acquired',
      'Date Sold',
      'Sales Price',
      'Cost or Basis',
      'Gain or Loss',
      'Short or Long Term',
    ];

    const rows: string[] = [headers.join(',')];

    for (const item of items) {
      const row = [
        this.escapeCSV(item.description),
        this.formatDate(item.dateAcquired),
        this.formatDate(item.dateSold),
        this.roundToWholeDollars(item.proceeds).toString(),
        this.roundToWholeDollars(item.costBasis).toString(),
        this.roundToWholeDollars(item.gainOrLoss).toString(),
        item.isLongTerm ? 'Long-term' : 'Short-term',
      ];
      rows.push(row.join(','));
    }

    return rows.join('\n');
  }

  generateTaxActCSV(items: CapitalGainItem[], taxYear: number): string {
    const headers = [
      'Property Description',
      'Acquired',
      'Sold',
      'Proceeds',
      'Cost',
      'Gain/Loss',
      'Holding Period',
    ];

    const rows: string[] = [headers.join(',')];

    for (const item of items) {
      const row = [
        this.escapeCSV(item.description),
        this.formatDate(item.dateAcquired),
        this.formatDate(item.dateSold),
        this.roundToWholeDollars(item.proceeds).toString(),
        this.roundToWholeDollars(item.costBasis).toString(),
        this.roundToWholeDollars(item.gainOrLoss).toString(),
        item.isLongTerm ? 'L' : 'S',
      ];
      rows.push(row.join(','));
    }

    return rows.join('\n');
  }
}
