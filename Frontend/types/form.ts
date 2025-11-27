export type TaxMethod = 'FIFO' | 'LIFO' | 'HIFO' | 'SpecificID';
export type FormStatus = 'draft' | 'generating' | 'completed' | 'error';
export type ExportFormat = 'pdf' | 'csv' | 'turbotax' | 'taxact';

export interface TaxForm {
  id: string;
  userId: string;
  taxYear: number;
  taxMethod: TaxMethod;
  status: FormStatus;

  // Summary data
  totalGains: number;
  totalLosses: number;
  netGainLoss: number;
  transactionsIncluded: number;

  // Form files
  files: {
    form8949?: string; // URL to generated PDF
    scheduleD?: string;
    detailedCsv?: string;
  };

  // Metadata
  generatedAt?: Date;
  emailSentAt?: Date;
  createdAt: Date;
}
