'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FormCardSkeleton } from '@/components/loading/transaction-skeleton';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { DownloadButton } from '@/components/view-forms/DownloadButton';
import { FormCompletionToast } from '@/components/view-forms/FormCompletionToast';
import { Download, Eye, Trash2, MoreVertical } from 'lucide-react';
import { useForms, useDownloadForm, useDeleteForm } from '@/hooks/useForms';
import CountUp from 'react-countup';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function ViewFormsPage() {
  const { data: forms, isLoading } = useForms();
  const downloadFormMutation = useDownloadForm();
  const deleteFormMutation = useDeleteForm();
  const router = useRouter();
  const [completedFormIds, setCompletedFormIds] = useState<string[]>([]);
  const [showCompletionToast, setShowCompletionToast] = useState(false);
  const [completedForm, setCompletedForm] = useState<{ id: string; taxYear: number } | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<string | null>(null);

  // Monitor for newly completed forms and show toast
  useEffect(() => {
    if (forms) {
      forms.forEach((form) => {
        if (form.status === 'completed' && !completedFormIds.includes(form.id)) {
          setCompletedFormIds((prev) => [...prev, form.id]);
          setCompletedForm({ id: form.id, taxYear: form.taxYear });
          setShowCompletionToast(true);

          // Auto-dismiss after 5 seconds
          setTimeout(() => {
            setShowCompletionToast(false);
          }, 5000);
        }
      });
    }
  }, [forms, completedFormIds]);

  const handleCardClick = (formId: string) => {
    router.push(`/forms/${formId}`);
  };

  const handleDelete = (formId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormToDelete(formId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!formToDelete) return;

    try {
      await deleteFormMutation.mutateAsync(formToDelete);
      toast.success('Form deleted successfully');
      setDeleteConfirmOpen(false);
      setFormToDelete(null);
    } catch (error) {
      toast.error('Failed to delete form');
    }
  };

  const handleDownload = async (formId: string, formName: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const { blob, filename } = await downloadFormMutation.mutateAsync({ formId, format: 'pdf' });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || `${formName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Form downloaded successfully');
    } catch (error) {
      toast.error('Failed to download form');
    }
  };

  return (
    <>
      <AnimatePresence>
        {showCompletionToast && completedForm && (
          <FormCompletionToast
            taxYear={completedForm.taxYear}
            onViewClick={() => {
              setShowCompletionToast(false);
              router.push(`/forms/${completedForm.id}`);
            }}
            onClose={() => setShowCompletionToast(false)}
          />
        )}
      </AnimatePresence>

      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-heading font-bold">Tax Forms</h2>
            <p className="text-muted-foreground">View and download your generated tax forms</p>
          </div>
          <Button onClick={() => router.push('/new-form')}>
            Generate New Form
          </Button>
        </div>

        {/* Forms List */}
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <FormCardSkeleton key={i} />
            ))
          ) : forms && forms.length > 0 ? (
            forms.map((form) => (
              <AnimatedCard
                key={form.id}
                hoverEffect="lift"
                onClick={() => handleCardClick(form.id)}
                className="transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  {/* Left side: Form info */}
                  <div className="flex-1">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-heading font-bold">
                          Tax Year {form.taxYear}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Generated on{' '}
                          {form.generatedAt
                            ? new Date(form.generatedAt).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Status badge with pulse for generating */}
                        <motion.div
                          animate={
                            form.status === 'generating'
                              ? {
                                  scale: [1, 1.05, 1],
                                  opacity: [1, 0.8, 1],
                                }
                              : {}
                          }
                          transition={{
                            duration: 2,
                            repeat: form.status === 'generating' ? Infinity : 0,
                          }}
                        >
                          <Badge
                            variant={form.status === 'completed' ? 'default' : 'secondary'}
                            className={
                              form.status === 'generating'
                                ? 'bg-blue-100 text-blue-700'
                                : ''
                            }
                          >
                            {form.status}
                          </Badge>
                        </motion.div>

                        {/* Card menu (3 dots) */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleCardClick(form.id);
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => handleDownload(form.id, `tax-form-${form.taxYear}`, e)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => handleDelete(form.id, e)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Form stats */}
                    <div className="mb-4 grid gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Method</p>
                        <p className="font-medium">{form.taxMethod}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Net Gain/Loss</p>
                        <p
                          className={`text-xl font-bold ${
                            form.netGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {form.netGainLoss >= 0 ? '+' : ''}$
                          <CountUp
                            end={Math.abs(form.netGainLoss)}
                            duration={2}
                            separator=","
                            decimals={2}
                            decimal="."
                          />
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Transactions</p>
                        <p className="text-xl font-bold">
                          <CountUp end={form.transactionsIncluded} duration={2} />
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(form.id);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <div onClick={(e) => e.stopPropagation()}>
                        <DownloadButton formId={form.id} />
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            ))
          ) : (
            // Empty state with mascot
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="mb-6"
                >
                  <Image
                    src="/mascot/mascot-with-cigar-on-money.png"
                    alt="Ready to generate forms"
                    width={200}
                    height={200}
                  />
                </motion.div>
                <h3 className="mb-2 text-xl font-semibold">
                  Ready to generate your first tax form?
                </h3>
                <p className="mb-6 text-muted-foreground">
                  Create your first tax form in just a few clicks
                </p>
                <Button size="lg" onClick={() => router.push('/new-form')}>
                  Get Started
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tax Form</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this tax form? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
