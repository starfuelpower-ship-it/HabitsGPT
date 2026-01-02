import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Mail, Lock, Database, Bell, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const lastUpdated = 'December 13, 2024';
  const contactEmail = 'privacy@cozyhabits.app';
  const effectiveDate = 'December 13, 2024';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <section className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Your Privacy Matters</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cozy Habits ("we", "our", or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, and safeguard your information 
              when you use our mobile application. This policy is effective as of {effectiveDate}.
            </p>
          </section>

          {/* Data Collection */}
          <section className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Information We Collect</h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground">Account Information</p>
                <p>Email address (for account creation and authentication)</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Habit Data</p>
                <p>Habits you create, completion status, streaks, and progress</p>
              </div>
              <div>
                <p className="font-medium text-foreground">App Preferences</p>
                <p>Theme settings, notification preferences, and customization choices</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Usage Analytics</p>
                <p>Anonymous app usage data to improve our service (e.g., feature usage, app opens). This data is not personally identifiable and is stored locally on your device.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Push Notification Tokens</p>
                <p>If you enable notifications, we store a device token to send you reminders. This token is not linked to your personal identity.</p>
              </div>
            </div>
          </section>

          {/* What We Don't Collect */}
          <section className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-green-500" />
              <h2 className="font-semibold text-foreground">Information We Do NOT Collect</h2>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Location data or GPS coordinates</li>
              <li>• Contact lists, phone numbers, or address books</li>
              <li>• Photos, camera access, or media files</li>
              <li>• Health or biometric data</li>
              <li>• Financial information (payments are handled securely by Google Play)</li>
              <li>• Advertising identifiers for tracking across apps</li>
              <li>• Any sensitive personal information</li>
            </ul>
          </section>

          {/* How We Use Data */}
          <section className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
            <h2 className="font-semibold text-foreground">How We Use Your Information</h2>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Provide and maintain the app functionality</li>
              <li>• Sync your habits and progress across devices</li>
              <li>• Send notifications you've explicitly opted into</li>
              <li>• Improve app performance and user experience</li>
              <li>• Provide customer support when requested</li>
              <li>• Process in-app purchases (via Google Play)</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
            <h2 className="font-semibold text-foreground">Data Sharing</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>We do not sell, rent, or share your personal data with third parties for marketing purposes.</strong> Your data may only be shared with:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Service providers who help us operate the app (e.g., cloud hosting)</li>
              <li>• Payment processors (Google Play) for purchases</li>
              <li>• Law enforcement when required by law</li>
            </ul>
          </section>

          {/* Data Storage */}
          <section className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
            <h2 className="font-semibold text-foreground">Data Storage & Security</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your data is securely stored using industry-standard encryption (TLS 1.3 in transit, AES-256 at rest). 
              We use secure cloud infrastructure to store your information. Access to your data is strictly limited 
              to authorized personnel who need it to provide our services.
            </p>
          </section>

          {/* Data Retention */}
          <section className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
            <h2 className="font-semibold text-foreground">Data Retention</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We retain your data for as long as your account is active. If you delete your 
              account, all associated personal data will be permanently removed within 30 days. 
              Anonymous, aggregated analytics data may be retained for up to 12 months for service improvement.
            </p>
          </section>

          {/* Your Rights */}
          <section className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Your Rights (GDPR, CCPA, CalOPPA)</h2>
            </div>
            <p className="text-sm text-muted-foreground">You have the right to:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Access:</strong> Request a copy of your personal data</li>
              <li>• <strong>Correction:</strong> Request correction of inaccurate data</li>
              <li>• <strong>Deletion:</strong> Delete your account and all associated data</li>
              <li>• <strong>Portability:</strong> Export your data in a readable format</li>
              <li>• <strong>Opt-out:</strong> Disable analytics collection in settings</li>
              <li>• <strong>Object:</strong> Object to certain data processing</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              To exercise these rights, contact us at {contactEmail} or delete your account directly in Settings.
            </p>
          </section>

          {/* Notifications */}
          <section className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Push Notifications</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Push notifications are disabled by default and are completely optional. We will only send 
              notifications if you explicitly enable them in Settings. You can disable notifications at 
              any time. We do not use notifications for advertising or marketing purposes.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
            <h2 className="font-semibold text-foreground">Children's Privacy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cozy Habits is not intended for children under 13 years of age (or 16 in the EU). We do not 
              knowingly collect personal information from children. If you believe we have collected data 
              from a child, please contact us immediately and we will delete it.
            </p>
          </section>

          {/* Updates */}
          <section className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
            <h2 className="font-semibold text-foreground">Policy Updates</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material 
              changes by posting the new Privacy Policy on this page, updating the "Last updated" date, 
              and if the changes are significant, providing a notice within the app.
            </p>
          </section>

          {/* California Residents */}
          <section className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
            <h2 className="font-semibold text-foreground">California Residents (CCPA/CPRA)</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              California residents have additional rights under CCPA/CPRA. We do not sell personal 
              information. You may request disclosure of data collected, request deletion, and opt-out 
              of any future sale of personal information (though we do not sell data). Contact us to 
              exercise these rights.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
            <h2 className="font-semibold text-foreground">Contact Us</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:
            </p>
            <a 
              href={`mailto:${contactEmail}`}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Mail className="w-4 h-4" />
              {contactEmail}
            </a>
          </section>

          {/* Footer */}
          <div className="text-center pt-4 pb-8">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Cozy Habits. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
