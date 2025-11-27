'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, FileText, Calendar, Calculator } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm, useDownloadForm } from '@/hooks/useForms';

export default function FormDetailPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  const { data: formData, isLoading } = useForm(formId);
  const downloadMutation = useDownloadForm();

  const form = (formData as any)?.form;

  const handleDownload = async (format: string) => {
    try {
      const { blob, filename } = await downloadMutation.mutateAsync({
        formId,
        format,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold mb-4">Form not found</h2>
        <Button onClick={() => router.push('/view-forms')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Forms
        </Button>
      </div>
    );
  }

  const netGainLoss = parseFloat(form.netGainLoss?.toString() || '0');
  const totalGains = parseFloat(form.totalGains?.toString() || '0');
  const totalLosses = parseFloat(form.totalLosses?.toString() || '0');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/view-forms')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Tax Forms {form.taxYear}</h1>
            <p className="text-muted-foreground">
              Generated on {new Date(form.generatedAt || form.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Badge variant={form.status === 'completed' ? 'default' : 'secondary'}>
          {form.status}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Tax Year
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{form.taxYear}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{form.taxMethod}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Total Gains</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              ${totalGains.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Total Losses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              ${totalLosses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Net Capital Gain/Loss</span>
            <span className={`text-3xl ${netGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netGainLoss >= 0 ? '+' : '-'}$
              {Math.abs(netGainLoss).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Based on {form.transactionsIncluded || 0} taxable transactions using the {form.taxMethod} method.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="downloads" className="w-full">
        <TabsList>
          <TabsTrigger value="downloads">Downloads</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="downloads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Download Your Tax Forms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Button
                  variant="outline"
                  className="h-auto py-6 flex-col"
                  onClick={() => handleDownload('pdf')}
                  disabled={downloadMutation.isPending}
                >
                  <FileText className="h-8 w-8 mb-2" />
                  <span className="font-semibold">Form 8949</span>
                  <span className="text-xs text-muted-foreground">Sales and Dispositions</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-6 flex-col"
                  onClick={() => handleDownload('scheduled')}
                  disabled={downloadMutation.isPending}
                >
                  <FileText className="h-8 w-8 mb-2" />
                  <span className="font-semibold">Schedule D</span>
                  <span className="text-xs text-muted-foreground">Capital Gains Summary</span>
                </Button>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Export for Tax Software</h4>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => handleDownload('csv')}
                    disabled={downloadMutation.isPending}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    CSV Export
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleDownload('turbotax')}
                    disabled={downloadMutation.isPending}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    TurboTax Format
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardContent className="p-6">
              {form.files?.htmlPreview ? (
                <iframe
                  srcDoc={form.files.htmlPreview}
                  className="w-full h-[600px] border rounded-lg"
                  title="Form Preview"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <FileText className="h-12 w-12 mb-4" />
                  <p>Preview not available</p>
                  <p className="text-sm">Download the PDF to view the full form</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
