'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ReadProgressIndicator } from '@/components/legal/ReadProgressIndicator';
import { EnhancedCheckbox } from '@/components/legal/EnhancedCheckbox';
import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PrivacyPage() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    if (accepted) {
      router.push('/onboarding');
    }
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
        </div>

        {/* Main Content */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-heading">
              <Shield className="h-6 w-6 text-blue-500" />
              Privacy Policy
            </CardTitle>
            <p className="text-muted-foreground">How we handle your data</p>
            <p className="text-xs text-muted-foreground">Last updated: November 18, 2025</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Scrollable Privacy Policy */}
            <div className="max-h-[60vh] overflow-y-auto rounded-lg border p-6">
              <div className="prose dark:prose-invert max-w-none space-y-4 text-sm">
                <h3>1. Information We Collect</h3>
                <p>
                  We collect information you provide directly to us, including:
                </p>
                <ul>
                  <li>Account information (name, email address, password)</li>
                  <li>Tax information (filing year, state, filing status)</li>
                  <li>Cryptocurrency transaction data</li>
                  <li>Wallet addresses and exchange connections</li>
                </ul>
                <p>
                  We also automatically collect certain information about your device and usage,
                  including IP address, browser type, and analytics data.
                </p>

                <h3>2. How We Use Your Information</h3>
                <p>
                  We use the information we collect to:
                </p>
                <ul>
                  <li>Provide, maintain, and improve our tax calculation services</li>
                  <li>Calculate your cryptocurrency tax obligations accurately</li>
                  <li>Generate tax reports and forms</li>
                  <li>Send service notifications and updates</li>
                  <li>Respond to support requests</li>
                  <li>Comply with legal obligations</li>
                </ul>

                <h3>3. Data Sharing and Disclosure</h3>
                <p className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                  <strong>We do not sell your personal information.</strong>
                </p>
                <p>
                  We may share your information with:
                </p>
                <ul>
                  <li>Service providers who help us operate our business (hosting, analytics, etc.)</li>
                  <li>Legal authorities when required by law or court order</li>
                  <li>Professional advisors (lawyers, accountants) when necessary</li>
                </ul>
                <p>
                  All service providers are contractually bound to protect your information and use
                  it only for the services they provide to us.
                </p>

                <h3>4. Data Security</h3>
                <p>
                  We implement appropriate technical and organizational measures to protect the
                  security of your personal information:
                </p>
                <ul>
                  <li>All data is encrypted in transit using TLS/SSL</li>
                  <li>Sensitive data is encrypted at rest</li>
                  <li>Secure authentication mechanisms and password requirements</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Access controls limiting employee access to personal data</li>
                </ul>
                <p className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                  <strong>Important:</strong> While we implement robust security measures, no system
                  is completely secure. You are responsible for maintaining the confidentiality of
                  your account credentials and should enable two-factor authentication when available.
                </p>

                <h3>5. Data Retention</h3>
                <p>
                  We retain your information for as long as necessary to provide our services and
                  comply with legal obligations:
                </p>
                <ul>
                  <li>Account data: While your account is active and for 7 years after closure</li>
                  <li>Transaction data: 7 years (to comply with IRS record-keeping requirements)</li>
                  <li>Analytics data: Up to 2 years</li>
                </ul>

                <h3>6. Your Rights</h3>
                <p>You have the right to:</p>
                <ul>
                  <li>Access your personal information</li>
                  <li>Correct or update inaccurate data</li>
                  <li>Request deletion of your account and data (subject to legal retention requirements)</li>
                  <li>Export your data in a portable format</li>
                  <li>Opt out of marketing communications</li>
                  <li>Control cookie preferences through your browser settings</li>
                </ul>

                <h3>7. Third-Party Services</h3>
                <p>
                  We may use third-party service providers to help us operate our business and
                  provide services to you. These providers have access to your personal information
                  only to perform specific tasks on our behalf and are obligated to protect your
                  information.
                </p>
                <p>
                  Our service may contain links to third-party websites or services (such as
                  exchanges or blockchain explorers). We are not responsible for their privacy
                  practices.
                </p>

                <h3>8. Cookies and Tracking</h3>
                <p>
                  We use cookies and similar tracking technologies to:
                </p>
                <ul>
                  <li>Maintain your session and keep you logged in</li>
                  <li>Remember your preferences and settings</li>
                  <li>Analyze usage patterns and improve our service</li>
                  <li>Provide personalized content and features</li>
                </ul>
                <p>
                  You can control cookies through your browser settings, though some features may
                  not function properly if cookies are disabled.
                </p>

                <h3>9. International Data Transfers</h3>
                <p>
                  CoinTally is based in the United States. If you access our service from outside
                  the U.S., your information will be transferred to and processed in the U.S. We
                  implement appropriate safeguards for international data transfers in compliance
                  with applicable laws.
                </p>

                <h3>10. Children&apos;s Privacy</h3>
                <p>
                  CoinTally is not intended for users under 18 years of age. We do not knowingly
                  collect personal information from children. If we become aware that we have
                  collected information from a child under 18, we will take steps to delete it
                  promptly.
                </p>

                <h3>11. Changes to This Policy</h3>
                <p>
                  We may update our Privacy Policy from time to time. We will notify you of any
                  material changes by:
                </p>
                <ul>
                  <li>Posting the new Privacy Policy on this page</li>
                  <li>Updating the &quot;Last Updated&quot; date</li>
                  <li>Sending email notifications for significant changes</li>
                </ul>
                <p>
                  Your continued use of CoinTally after changes are posted constitutes acceptance
                  of the updated Privacy Policy.
                </p>

                <h3>12. Contact Us</h3>
                <p>
                  If you have any questions about this Privacy Policy or our data practices, please
                  contact us at:
                </p>
                <ul>
                  <li>Email: privacy@cointally.com</li>
                  <li>Support: Use the in-app support form</li>
                </ul>

                <h3>13. GDPR Compliance (For EEA Residents)</h3>
                <p>
                  If you are a resident of the European Economic Area (EEA), you have certain data
                  protection rights under the General Data Protection Regulation (GDPR):
                </p>
                <ul>
                  <li>Right to access your personal data</li>
                  <li>Right to rectification of inaccurate data</li>
                  <li>Right to erasure (&quot;right to be forgotten&quot;)</li>
                  <li>Right to restrict processing</li>
                  <li>Right to data portability</li>
                  <li>Right to object to processing</li>
                  <li>Rights related to automated decision-making and profiling</li>
                </ul>

                <h3>14. California Privacy Rights (CCPA)</h3>
                <p>
                  If you are a California resident, you have additional rights under the California
                  Consumer Privacy Act (CCPA):
                </p>
                <ul>
                  <li>Right to know what personal information is collected</li>
                  <li>Right to know if personal information is sold or disclosed (we do not sell your data)</li>
                  <li>Right to request deletion of personal information</li>
                  <li>Right to opt out of the sale of personal information</li>
                  <li>Right to non-discrimination for exercising your rights</li>
                </ul>
                <p>
                  To exercise these rights, please contact us at privacy@cointally.com or through
                  our support form.
                </p>
              </div>
            </div>

            {/* Enhanced Checkbox */}
            <div className="space-y-3">
              <EnhancedCheckbox
                id="accept-privacy"
                label="I have read and accept the privacy policy"
                checked={accepted}
                onCheckedChange={(checked) => setAccepted(checked)}
              />
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => router.back()}>
                Back
              </Button>
              <Button
                onClick={handleAccept}
                disabled={!accepted}
                className={cn(
                  "transition-all duration-300",
                  accepted && "animate-in fade-in scale-in-95 duration-500"
                )}
              >
                {accepted ? 'Accept & Continue' : 'Please Accept Privacy Policy'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
