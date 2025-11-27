'use client';

import { useState } from 'react';
import { Upload, Download, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCSVImport, useCSVTemplates } from '@/hooks/useCSVImport';
import { toast } from 'sonner';

interface CSVImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'upload' | 'importing' | 'results';

export function CSVImportModal({ open, onOpenChange }: CSVImportModalProps) {
  const [step, setStep] = useState<Step>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>('');
  const [sourceName, setSourceName] = useState<string>('');
  const [templateName, setTemplateName] = useState<string>('auto');
  const [importResult, setImportResult] = useState<{
    imported: number;
    errors: string[];
  } | null>(null);

  const { data: templates } = useCSVTemplates();
  const csvImport = useCSVImport();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 10MB.');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvContent(content);
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
      setSelectedFile(null);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!csvContent || !sourceName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setStep('importing');

    try {
      const result = await csvImport.mutateAsync({
        csvContent,
        sourceName,
        templateName: templateName === 'auto' ? undefined : templateName,
      });

      setImportResult(result);
      setStep('results');

      if (result.imported > 0) {
        toast.success(`Imported ${result.imported} transactions!`);
      }
    } catch (error: any) {
      setStep('upload');
      toast.error(error.message || 'Import failed. Please try again.');
    }
  };

  const handleDownloadTemplate = (template: string) => {
    const templates: Record<string, string> = {
      coinbase: 'Timestamp,Transaction Type,Asset,Quantity Transacted,Spot Price at Transaction,Subtotal,Total,Fees and/or Spread,Notes\n2024-01-01 10:00:00,Buy,BTC,0.5,50000.00,25000.00,25010.00,10.00,Example transaction',
      binance: 'Date(UTC),Pair,Type,Side,Price,Filled,Total,Fee\n2024-01-01 10:00:00,BTCUSDT,LIMIT,BUY,50000.00,0.5,25000.00,2.50',
    };

    const content = templates[template] || templates.coinbase;
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template}-template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setStep('upload');
    setSelectedFile(null);
    setCsvContent('');
    setSourceName('');
    setTemplateName('auto');
    setImportResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Transactions from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file from your exchange or wallet to import transactions
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Download Template</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {templates?.map((template) => (
                    <Button
                      key={template}
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadTemplate(template)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {template.charAt(0).toUpperCase() + template.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="file">CSV File *</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileSelect}
                  className="mt-2"
                />
                {selectedFile && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="sourceName">Source Name *</Label>
                <Input
                  id="sourceName"
                  placeholder="e.g., Coinbase, Binance, MetaMask"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  className="mt-2"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Enter the name of the exchange or wallet
                </p>
              </div>

              <div>
                <Label htmlFor="template">Template</Label>
                <Select value={templateName} onValueChange={setTemplateName}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-detect</SelectItem>
                    {templates?.map((template) => (
                      <SelectItem key={template} value={template}>
                        {template.charAt(0).toUpperCase() + template.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-muted-foreground">
                  System will auto-detect the format if not specified
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={!selectedFile || !sourceName}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import Transactions
              </Button>
            </div>
          </div>
        )}

        {step === 'importing' && (
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">Importing transactions...</h3>
              <p className="text-sm text-muted-foreground mt-1">
                This may take a few moments for large files
              </p>
            </div>
          </div>
        )}

        {step === 'results' && importResult && (
          <div className="space-y-6">
            {importResult.imported > 0 ? (
              <Alert>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  Successfully imported {importResult.imported} transaction
                  {importResult.imported !== 1 ? 's' : ''}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No transactions were imported
                </AlertDescription>
              </Alert>
            )}

            {importResult.errors.length > 0 && (
              <div className="space-y-2">
                <Label className="text-destructive">
                  {importResult.errors.length} error
                  {importResult.errors.length !== 1 ? 's' : ''} occurred:
                </Label>
                <div className="max-h-60 overflow-y-auto rounded-md border p-4 space-y-1">
                  {importResult.errors.map((error, index) => (
                    <p key={index} className="text-sm text-muted-foreground">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              {importResult.imported > 0 && (
                <Button onClick={handleClose}>
                  View Transactions
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
