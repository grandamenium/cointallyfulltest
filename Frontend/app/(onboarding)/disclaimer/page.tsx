'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ReadProgressIndicator } from '@/components/legal/ReadProgressIndicator';
import { EnhancedCheckbox } from '@/components/legal/EnhancedCheckbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DisclaimerPage() {
  const router = useRouter();
  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const canProceed = checkbox1 && checkbox2;

  const handleAccept = () => {
    if (canProceed) {
      router.push('/privacy');
    }
  };

  const handleCancel = () => {
    setShowCancelDialog(false);
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6 dark:from-slate-900 dark:to-slate-800">
      <ReadProgressIndicator />

      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-b from-[#14BEFF] to-[#3F6EFF]">
              <span className="text-xl font-bold text-white">C</span>
            </div>
            <span className="font-heading text-xl font-bold">CoinTally</span>
          </div>
          <Button variant="outline" onClick={() => setShowCancelDialog(true)}>
            Log Out
          </Button>
        </div>

        {/* Main Content */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-heading">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              Terms and Conditions
            </CardTitle>
            <p className="text-muted-foreground">Please read and accept to continue</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Scrollable Terms */}
            <div className="max-h-[60vh] overflow-y-auto rounded-lg border p-6">
              <div className="prose dark:prose-invert max-w-none space-y-4 text-sm">
                <h3>1. Acceptance of Terms</h3>
                <p>
                  By accessing and using CoinTally, you accept and agree to be bound by the terms
                  and provision of this agreement.
                </p>

                <h3>2. Use License</h3>
                <p>
                  Permission is granted to temporarily use CoinTally for personal, non-commercial
                  transitory viewing only. This is the grant of a license, not a transfer of title.
                </p>

                <h3>3. Disclaimer of Warranties</h3>
                <p>
                  CoinTally provides tax calculation assistance but does not constitute professional
                  tax advice. You should consult with a qualified tax professional before filing.
                </p>
                <p className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                  <strong>Important:</strong> We strongly recommend consulting with a certified tax professional
                  or CPA before submitting any tax returns based on calculations from CoinTally.
                </p>

                <h3>4. Limitations of Liability</h3>
                <p>
                  In no event shall CoinTally or its suppliers be liable for any damages arising out
                  of the use or inability to use the service, including but not limited to:
                </p>
                <ul>
                  <li>Errors or omissions in tax calculations</li>
                  <li>Penalties or interest assessed by tax authorities</li>
                  <li>Loss of data or transaction history</li>
                  <li>Missed deadlines or filing requirements</li>
                </ul>

                <h3>5. Accuracy of Materials</h3>
                <p>
                  The materials appearing on CoinTally could include technical, typographical, or
                  photographic errors. We do not warrant that any of the materials are accurate,
                  complete, or current.
                </p>
                <p>
                  Tax calculations are based on the data you provide and current IRS regulations.
                  You are responsible for:
                </p>
                <ul>
                  <li>Ensuring the accuracy and completeness of imported transaction data</li>
                  <li>Properly categorizing transactions</li>
                  <li>Reviewing all calculations before filing</li>
                  <li>Maintaining adequate supporting documentation</li>
                </ul>

                <h3>6. User Responsibilities</h3>
                <p>
                  By using CoinTally, you acknowledge that you are responsible for:
                </p>
                <ul>
                  <li>Verifying the accuracy of all tax calculations</li>
                  <li>Understanding applicable tax laws and regulations</li>
                  <li>Filing accurate and timely tax returns</li>
                  <li>Maintaining records to support your tax positions</li>
                  <li>Seeking professional advice when needed</li>
                </ul>

                <h3>7. Data Security</h3>
                <p>
                  While we implement industry-standard security measures, you acknowledge that:
                </p>
                <ul>
                  <li>No system is completely secure from unauthorized access</li>
                  <li>You are responsible for maintaining account credential confidentiality</li>
                  <li>You should enable two-factor authentication when available</li>
                </ul>

                <h3>8. Service Modifications</h3>
                <p>
                  CoinTally reserves the right to modify, suspend, or discontinue any aspect of the
                  service at any time without prior notice. We are not liable for any modification,
                  suspension, or discontinuation of the service.
                </p>

                <h3>9. Regulatory Compliance</h3>
                <p>
                  Cryptocurrency tax regulations are subject to change. CoinTally makes reasonable
                  efforts to stay current with regulations, but you are ultimately responsible for
                  ensuring compliance with all applicable laws.
                </p>

                <h3>10. Indemnification</h3>
                <p>
                  You agree to indemnify and hold harmless CoinTally, its developers, and affiliates
                  from any claims, damages, or expenses arising from your use of the service or
                  violation of these terms.
                </p>

                <h3>11. Governing Law</h3>
                <p>
                  These terms shall be governed by and construed in accordance with the laws of the
                  United States, without regard to its conflict of law provisions.
                </p>

                <h3>12. Changes to Terms</h3>
                <p>
                  We reserve the right to update these terms at any time. Continued use of CoinTally
                  after changes constitutes acceptance of the modified terms.
                </p>
              </div>
            </div>

            {/* Enhanced Checkboxes */}
            <div className="space-y-3">
              <EnhancedCheckbox
                id="checkbox1"
                label="I have read and accept the terms and conditions"
                checked={checkbox1}
                onCheckedChange={(checked) => setCheckbox1(checked)}
              />

              <EnhancedCheckbox
                id="checkbox2"
                label="I acknowledge the limitations, disclaimers, and warranties outlined above"
                checked={checkbox2}
                onCheckedChange={(checked) => setCheckbox2(checked)}
              />
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button variant="destructive" onClick={() => setShowCancelDialog(true)}>
                Cancel Account
              </Button>
              <Button
                onClick={handleAccept}
                disabled={!canProceed}
                className={cn(
                  "transition-all duration-300",
                  canProceed && "animate-in fade-in scale-in-95 duration-500"
                )}
              >
                {canProceed ? 'Accept & Continue' : 'Please Accept All Terms'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              Canceling will delete your account and all data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Go Back
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
