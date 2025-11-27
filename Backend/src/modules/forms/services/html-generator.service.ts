import { Injectable } from '@nestjs/common';
import { CapitalGainsResult, CapitalGainItem } from './capital-gains.service';

@Injectable()
export class HtmlGeneratorService {
  generate(result: CapitalGainsResult, taxYear: number, taxMethod: string): string {
    const shortTermItems = result.items.filter((item) => !item.isLongTerm);
    const longTermItems = result.items.filter((item) => item.isLongTerm);

    const formatDate = (date: Date): string => {
      if (date.getTime() === 0) return 'VARIOUS';
      return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      });
    };

    const formatCurrency = (value: any): string => {
      const num = typeof value === 'object' && value.toNumber
        ? value.toNumber()
        : parseFloat(value);
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(num);
    };

    const generateTableRows = (items: CapitalGainItem[]): string => {
      if (items.length === 0) {
        return `<tr><td colspan="7" style="text-align: center; padding: 20px;">No transactions</td></tr>`;
      }
      return items
        .map(
          (item) => `
        <tr>
          <td>${item.description}</td>
          <td>${formatDate(item.dateAcquired)}</td>
          <td>${formatDate(item.dateSold)}</td>
          <td class="currency">${formatCurrency(item.proceeds)}</td>
          <td class="currency">${formatCurrency(item.costBasis)}</td>
          <td></td>
          <td class="currency ${item.gainOrLoss.toNumber() < 0 ? 'loss' : 'gain'}">${formatCurrency(item.gainOrLoss)}</td>
        </tr>
      `,
        )
        .join('');
    };

    const shortTermTotal = shortTermItems.reduce(
      (sum, item) => sum + item.gainOrLoss.toNumber(),
      0,
    );
    const longTermTotal = longTermItems.reduce(
      (sum, item) => sum + item.gainOrLoss.toNumber(),
      0,
    );

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form 8949 - Sales and Other Dispositions of Capital Assets - ${taxYear}</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
      color: #333;
    }
    .header {
      background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
      color: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 20px;
    }
    .header h1 {
      font-size: 24px;
      margin-bottom: 5px;
    }
    .header p {
      opacity: 0.9;
      font-size: 14px;
    }
    .info-bar {
      display: flex;
      gap: 30px;
      margin-top: 15px;
      font-size: 14px;
    }
    .info-item {
      background: rgba(255,255,255,0.1);
      padding: 8px 15px;
      border-radius: 5px;
    }
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 25px;
    }
    .card {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .card-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .card-value {
      font-size: 24px;
      font-weight: bold;
    }
    .card-value.gain {
      color: #22c55e;
    }
    .card-value.loss {
      color: #ef4444;
    }
    .section {
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
      overflow: hidden;
    }
    .section-header {
      background: #f8fafc;
      padding: 15px 20px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #1a365d;
    }
    .section-total {
      font-weight: bold;
      font-size: 16px;
    }
    .section-total.gain {
      color: #22c55e;
    }
    .section-total.loss {
      color: #ef4444;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th {
      background: #f1f5f9;
      padding: 12px 15px;
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 600;
    }
    td {
      padding: 12px 15px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
    }
    tr:hover {
      background: #f8fafc;
    }
    .currency {
      text-align: right;
      font-family: 'Courier New', monospace;
    }
    .gain {
      color: #22c55e;
    }
    .loss {
      color: #ef4444;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 12px;
    }
    .print-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #1a365d;
      color: white;
      border: none;
      padding: 15px 25px;
      border-radius: 30px;
      cursor: pointer;
      font-size: 14px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    .print-btn:hover {
      background: #2c5282;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .print-btn {
        display: none;
      }
      .section {
        box-shadow: none;
        border: 1px solid #ddd;
      }
      .header {
        background: #1a365d !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Form 8949 - Sales and Other Dispositions of Capital Assets</h1>
    <p>Tax Year ${taxYear} | Generated by CoinTally</p>
    <div class="info-bar">
      <div class="info-item">Cost Basis Method: ${taxMethod}</div>
      <div class="info-item">Total Transactions: ${result.transactionsIncluded}</div>
      <div class="info-item">Generated: ${new Date().toLocaleDateString()}</div>
    </div>
  </div>

  <div class="summary-cards">
    <div class="card">
      <div class="card-label">Short-Term Gains</div>
      <div class="card-value gain">${formatCurrency(result.shortTermGains)}</div>
    </div>
    <div class="card">
      <div class="card-label">Short-Term Losses</div>
      <div class="card-value loss">${formatCurrency(result.shortTermLosses)}</div>
    </div>
    <div class="card">
      <div class="card-label">Long-Term Gains</div>
      <div class="card-value gain">${formatCurrency(result.longTermGains)}</div>
    </div>
    <div class="card">
      <div class="card-label">Long-Term Losses</div>
      <div class="card-value loss">${formatCurrency(result.longTermLosses)}</div>
    </div>
    <div class="card">
      <div class="card-label">Net Gain/Loss</div>
      <div class="card-value ${result.netGainLoss.toNumber() >= 0 ? 'gain' : 'loss'}">${formatCurrency(result.netGainLoss)}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-header">
      <span class="section-title">Part I - Short-Term Capital Gains and Losses (Assets held 1 year or less)</span>
      <span class="section-total ${shortTermTotal >= 0 ? 'gain' : 'loss'}">Total: ${formatCurrency(shortTermTotal)}</span>
    </div>
    <table>
      <thead>
        <tr>
          <th>(a) Description</th>
          <th>(b) Date Acquired</th>
          <th>(c) Date Sold</th>
          <th>(d) Proceeds</th>
          <th>(e) Cost Basis</th>
          <th>(f) Adjustment</th>
          <th>(g) Gain or Loss</th>
        </tr>
      </thead>
      <tbody>
        ${generateTableRows(shortTermItems)}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-header">
      <span class="section-title">Part II - Long-Term Capital Gains and Losses (Assets held more than 1 year)</span>
      <span class="section-total ${longTermTotal >= 0 ? 'gain' : 'loss'}">Total: ${formatCurrency(longTermTotal)}</span>
    </div>
    <table>
      <thead>
        <tr>
          <th>(a) Description</th>
          <th>(b) Date Acquired</th>
          <th>(c) Date Sold</th>
          <th>(d) Proceeds</th>
          <th>(e) Cost Basis</th>
          <th>(f) Adjustment</th>
          <th>(g) Gain or Loss</th>
        </tr>
      </thead>
      <tbody>
        ${generateTableRows(longTermItems)}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-header">
      <span class="section-title">Schedule D Summary</span>
    </div>
    <table>
      <tbody>
        <tr>
          <td>Short-term capital gain or (loss)</td>
          <td class="currency ${shortTermTotal >= 0 ? 'gain' : 'loss'}">${formatCurrency(shortTermTotal)}</td>
        </tr>
        <tr>
          <td>Long-term capital gain or (loss)</td>
          <td class="currency ${longTermTotal >= 0 ? 'gain' : 'loss'}">${formatCurrency(longTermTotal)}</td>
        </tr>
        <tr style="font-weight: bold; background: #f8fafc;">
          <td>Net capital gain or (loss)</td>
          <td class="currency ${result.netGainLoss.toNumber() >= 0 ? 'gain' : 'loss'}">${formatCurrency(result.netGainLoss)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>This document is for informational purposes only. Consult a tax professional for advice.</p>
    <p>Generated by CoinTally - Cryptocurrency Tax Calculator</p>
  </div>

  <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
</body>
</html>
    `.trim();
  }
}
