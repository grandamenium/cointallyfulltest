import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { CapitalGainItem, CapitalGainsResult } from './capital-gains.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PdfGeneratorService {
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

  private formatCurrency(value: number): string {
    if (value < 0) {
      return `(${Math.abs(value).toLocaleString('en-US')})`;
    }
    return value.toLocaleString('en-US');
  }

  async generateForm8949(
    items: CapitalGainItem[],
    taxYear: number,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const shortTermItems = items.filter((item) => !item.isLongTerm);
        const longTermItems = items.filter((item) => item.isLongTerm);

        this.renderForm8949Page(doc, shortTermItems, taxYear, 'short');

        if (longTermItems.length > 0) {
          doc.addPage();
          this.renderForm8949Page(doc, longTermItems, taxYear, 'long');
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private renderForm8949Page(
    doc: typeof PDFDocument,
    items: CapitalGainItem[],
    taxYear: number,
    termType: 'short' | 'long',
  ): void {
    const pageWidth = 612;
    const marginLeft = 50;
    const marginRight = 50;
    const contentWidth = pageWidth - marginLeft - marginRight;

    doc.fontSize(16).font('Helvetica-Bold');
    doc.text('Form 8949', marginLeft, 50);
    doc.fontSize(10).font('Helvetica');
    doc.text('Department of the Treasury', marginLeft, 70);
    doc.text('Internal Revenue Service', marginLeft, 82);

    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Sales and Other Dispositions of Capital Assets', 200, 50, {
      align: 'center',
      width: 250,
    });

    doc.fontSize(10).font('Helvetica');
    doc.text(`Tax Year ${taxYear}`, pageWidth - marginRight - 80, 50);
    doc.text('OMB No. 1545-0074', pageWidth - marginRight - 80, 62);

    doc.fontSize(9).font('Helvetica');
    doc.text('Name(s) shown on return:', marginLeft, 110);
    doc.rect(marginLeft + 120, 107, 200, 15).stroke();
    doc.text('Social security number:', marginLeft + 340, 110);
    doc.rect(marginLeft + 440, 107, 80, 15).stroke();

    const partNum = termType === 'short' ? 'I' : 'II';
    const termLabel =
      termType === 'short'
        ? 'Short-Term (assets held one year or less)'
        : 'Long-Term (assets held more than one year)';

    doc.fontSize(11).font('Helvetica-Bold');
    doc.text(`Part ${partNum} - ${termLabel}`, marginLeft, 140);

    doc.fontSize(8).font('Helvetica');
    const checkboxY = 160;
    const checkboxLabel =
      termType === 'short'
        ? '(C) Short-term transactions not reported to you on Form 1099-B'
        : '(F) Long-term transactions not reported to you on Form 1099-B';

    doc.rect(marginLeft, checkboxY, 10, 10).stroke();
    doc.text('X', marginLeft + 2.5, checkboxY + 1);
    doc.text(checkboxLabel, marginLeft + 15, checkboxY + 1);

    const tableTop = 190;
    const colWidths = [120, 55, 55, 65, 65, 30, 40, 65];
    const headers = [
      '(a) Description',
      '(b) Date\nacquired',
      '(c) Date sold\nor disposed',
      '(d) Proceeds',
      '(e) Cost or\nother basis',
      '(f)\nCode',
      '(g) Adj.',
      '(h) Gain or\n(loss)',
    ];

    doc.fontSize(7).font('Helvetica-Bold');
    let xPos = marginLeft;
    headers.forEach((header, i) => {
      doc.rect(xPos, tableTop, colWidths[i], 30).stroke();
      doc.text(header, xPos + 2, tableTop + 3, {
        width: colWidths[i] - 4,
        align: 'center',
      });
      xPos += colWidths[i];
    });

    doc.font('Helvetica').fontSize(7);
    let yPos = tableTop + 30;
    const rowHeight = 18;
    const maxRows = 28;

    let totalProceeds = 0;
    let totalCostBasis = 0;
    let totalGainLoss = 0;

    const displayItems = items.slice(0, maxRows);

    displayItems.forEach((item) => {
      const proceeds = this.roundToWholeDollars(item.proceeds);
      const costBasis = this.roundToWholeDollars(item.costBasis);
      const gainLoss = this.roundToWholeDollars(item.gainOrLoss);

      totalProceeds += proceeds;
      totalCostBasis += costBasis;
      totalGainLoss += gainLoss;

      xPos = marginLeft;
      const rowData = [
        item.description.substring(0, 20),
        this.formatDate(item.dateAcquired),
        this.formatDate(item.dateSold),
        this.formatCurrency(proceeds),
        this.formatCurrency(costBasis),
        '',
        '',
        this.formatCurrency(gainLoss),
      ];

      rowData.forEach((data, i) => {
        doc.rect(xPos, yPos, colWidths[i], rowHeight).stroke();
        doc.text(String(data), xPos + 2, yPos + 5, {
          width: colWidths[i] - 4,
          align: i >= 3 ? 'right' : 'left',
        });
        xPos += colWidths[i];
      });

      yPos += rowHeight;
    });

    if (items.length > maxRows) {
      xPos = marginLeft;
      doc.rect(xPos, yPos, colWidths[0], rowHeight).stroke();
      doc.text(
        `... and ${items.length - maxRows} more (see attached)`,
        xPos + 2,
        yPos + 5,
      );
      for (let i = 1; i < colWidths.length; i++) {
        xPos += colWidths[i - 1];
        doc.rect(xPos, yPos, colWidths[i], rowHeight).stroke();
      }
      yPos += rowHeight;
    }

    doc.font('Helvetica-Bold');
    const totalsY = yPos + 10;
    doc.text('Totals:', marginLeft, totalsY + 5);

    xPos = marginLeft + colWidths[0] + colWidths[1] + colWidths[2];
    doc.rect(xPos, totalsY, colWidths[3], rowHeight).stroke();
    doc.text(this.formatCurrency(totalProceeds), xPos + 2, totalsY + 5, {
      width: colWidths[3] - 4,
      align: 'right',
    });

    xPos += colWidths[3];
    doc.rect(xPos, totalsY, colWidths[4], rowHeight).stroke();
    doc.text(this.formatCurrency(totalCostBasis), xPos + 2, totalsY + 5, {
      width: colWidths[4] - 4,
      align: 'right',
    });

    xPos += colWidths[4] + colWidths[5] + colWidths[6];
    doc.rect(xPos, totalsY, colWidths[7], rowHeight).stroke();
    doc.text(this.formatCurrency(totalGainLoss), xPos + 2, totalsY + 5, {
      width: colWidths[7] - 4,
      align: 'right',
    });

    doc.fontSize(7).font('Helvetica');
    doc.text(
      'Generated by CoinTally - For informational purposes. Verify all figures before filing.',
      marginLeft,
      720,
    );
  }

  async generateScheduleD(
    result: CapitalGainsResult,
    taxYear: number,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const marginLeft = 50;
        const pageWidth = 612;
        const marginRight = 50;

        doc.fontSize(16).font('Helvetica-Bold');
        doc.text('SCHEDULE D', marginLeft, 50);
        doc.fontSize(10).font('Helvetica');
        doc.text('(Form 1040)', marginLeft, 70);
        doc.text('Department of the Treasury', marginLeft, 82);
        doc.text('Internal Revenue Service', marginLeft, 94);

        doc.fontSize(14).font('Helvetica-Bold');
        doc.text('Capital Gains and Losses', 200, 50, {
          align: 'center',
          width: 250,
        });

        doc.fontSize(10).font('Helvetica');
        doc.text(`Tax Year ${taxYear}`, pageWidth - marginRight - 80, 50);
        doc.text('OMB No. 1545-0074', pageWidth - marginRight - 80, 62);

        doc.fontSize(9).font('Helvetica');
        doc.text('Name(s) shown on return:', marginLeft, 120);
        doc.rect(marginLeft + 120, 117, 200, 15).stroke();
        doc.text('Your social security number:', marginLeft + 340, 120);
        doc.rect(marginLeft + 460, 117, 80, 15).stroke();

        let yPos = 150;

        doc.fontSize(11).font('Helvetica-Bold');
        doc.text(
          'Part I - Short-Term Capital Gains and Losses (Assets Held One Year or Less)',
          marginLeft,
          yPos,
        );
        yPos += 25;

        const shortTermGains = this.roundToWholeDollars(result.shortTermGains);
        const shortTermLosses = this.roundToWholeDollars(result.shortTermLosses);
        const shortTermNet = shortTermGains - shortTermLosses;

        doc.fontSize(9).font('Helvetica');

        const lines = [
          {
            num: '1b',
            text: 'Totals for all short-term transactions not reported on Form 1099-B',
            proceeds: shortTermGains + shortTermLosses,
            costBasis: shortTermLosses > 0 ? shortTermGains : 0,
            gainLoss: shortTermNet,
          },
          { num: '7', text: 'Net short-term capital gain or (loss)', value: shortTermNet },
        ];

        lines.forEach((line) => {
          doc.text(`Line ${line.num}: ${line.text}`, marginLeft, yPos);
          if ('value' in line && line.value !== undefined) {
            doc.text(`$${this.formatCurrency(line.value)}`, 450, yPos);
          } else if ('gainLoss' in line && line.gainLoss !== undefined) {
            doc.text(`$${this.formatCurrency(line.gainLoss)}`, 450, yPos);
          }
          yPos += 18;
        });

        yPos += 20;
        doc.fontSize(11).font('Helvetica-Bold');
        doc.text(
          'Part II - Long-Term Capital Gains and Losses (Assets Held More Than One Year)',
          marginLeft,
          yPos,
        );
        yPos += 25;

        const longTermGains = this.roundToWholeDollars(result.longTermGains);
        const longTermLosses = this.roundToWholeDollars(result.longTermLosses);
        const longTermNet = longTermGains - longTermLosses;

        doc.fontSize(9).font('Helvetica');

        const longLines = [
          {
            num: '8b',
            text: 'Totals for all long-term transactions not reported on Form 1099-B',
            gainLoss: longTermNet,
          },
          { num: '15', text: 'Net long-term capital gain or (loss)', value: longTermNet },
        ];

        longLines.forEach((line) => {
          doc.text(`Line ${line.num}: ${line.text}`, marginLeft, yPos);
          if ('value' in line && line.value !== undefined) {
            doc.text(`$${this.formatCurrency(line.value)}`, 450, yPos);
          } else if ('gainLoss' in line && line.gainLoss !== undefined) {
            doc.text(`$${this.formatCurrency(line.gainLoss)}`, 450, yPos);
          }
          yPos += 18;
        });

        yPos += 20;
        doc.fontSize(11).font('Helvetica-Bold');
        doc.text('Part III - Summary', marginLeft, yPos);
        yPos += 25;

        const netGainLoss = this.roundToWholeDollars(result.netGainLoss);

        doc.fontSize(9).font('Helvetica');
        doc.text(
          `Line 16: Combine lines 7 and 15 and enter the result`,
          marginLeft,
          yPos,
        );
        doc.font('Helvetica-Bold');
        doc.text(`$${this.formatCurrency(netGainLoss)}`, 450, yPos);
        yPos += 30;

        doc.rect(marginLeft, yPos, 500, 80).stroke();
        yPos += 10;
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Summary', marginLeft + 10, yPos);
        yPos += 18;

        doc.fontSize(9).font('Helvetica');
        doc.text(
          `Total Short-Term Gains: $${this.formatCurrency(shortTermGains)}`,
          marginLeft + 10,
          yPos,
        );
        doc.text(
          `Total Short-Term Losses: $${this.formatCurrency(shortTermLosses)}`,
          marginLeft + 200,
          yPos,
        );
        yPos += 15;
        doc.text(
          `Total Long-Term Gains: $${this.formatCurrency(longTermGains)}`,
          marginLeft + 10,
          yPos,
        );
        doc.text(
          `Total Long-Term Losses: $${this.formatCurrency(longTermLosses)}`,
          marginLeft + 200,
          yPos,
        );
        yPos += 15;
        doc.font('Helvetica-Bold');
        doc.text(
          `Net Capital Gain/(Loss): $${this.formatCurrency(netGainLoss)}`,
          marginLeft + 10,
          yPos,
        );

        doc.fontSize(7).font('Helvetica');
        doc.text(
          'Generated by CoinTally - For informational purposes. Verify all figures before filing.',
          marginLeft,
          720,
        );

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
