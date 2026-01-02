import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsOfService() {
  const navigate = useNavigate();
  const lastUpdated = 'December 13, 2024';
  const contactEmail = 'support@cozyhabits.app';

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
            <h1 className="text-2xl font-bold text-foreground">Terms of Service</h1>
            <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <section className="ios-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Agreement to Terms</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By downloading, installing, or using Cozy Habits ("the App"), you agree to be 
              bound by these Terms of Service. If you do not agree to these terms, please 
              do not use the App.
            </p>
          </section>

          {/* Use of Service */}
          <section className="ios-card p-4 space-y-3">
            <h2 className="font-semibold text-foreground">Use of the Service</h2>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>You agree to use Cozy Habits only for lawful purposes and in accordance with these Terms. You agree not to:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Use the App in any way that violates applicable laws</li>
                <li>Attempt to gain unauthorized access to the App or its systems</li>
                <li>Interfere with or disrupt the App's functionality</li>
                <li>Use automated means to access the App without permission</li>
                <li>Share your account credentials with others</li>
              </ul>
            </div>
          </section>

          {/* User Accounts */}
          <section className="ios-card p-4 space-y-3">
            <h2 className="font-semibold text-foreground">User Accounts</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You are responsible for maintaining the confidentiality of your account 
              and password. You agree to accept responsibility for all activities that 
              occur under your account. You must notify us immediately of any unauthorized use.
            </p>
          </section>

          {/* Subscriptions */}
          <section className="ios-card p-4 space-y-3">
            <h2 className="font-semibold text-foreground">Premium Subscriptions</h2>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Premium features are available through in-app purchases:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Payments are processed through Apple App Store or Google Play Store</li>
                <li>Subscriptions auto-renew unless cancelled at least 24 hours before the renewal date</li>
                <li>Manage or cancel subscriptions through your app store account settings</li>
                <li>Refunds are subject to the respective app store's refund policies</li>
              </ul>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="ios-card p-4 space-y-3">
            <h2 className="font-semibold text-foreground">Intellectual Property</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The App and its original content, features, and functionality are owned by 
              Cozy Habits and are protected by international copyright, trademark, and other 
              intellectual property laws. You may not copy, modify, distribute, or create 
              derivative works based on the App.
            </p>
          </section>

          {/* User Content */}
          <section className="ios-card p-4 space-y-3">
            <h2 className="font-semibold text-foreground">Your Content</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You retain ownership of any content you create within the App (habits, journal 
              entries, etc.). By using the App, you grant us a license to store and process 
              this content to provide the service. We will not share your personal content 
              with third parties.
            </p>
          </section>

          {/* Disclaimers */}
          <section className="ios-card p-4 space-y-3">
            <h2 className="font-semibold text-foreground">Disclaimers</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The App is provided "as is" without warranties of any kind. We do not guarantee 
              that the App will be error-free or uninterrupted. Cozy Habits is not a medical 
              or therapeutic application and should not be used as a substitute for professional 
              medical advice.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="ios-card p-4 space-y-3">
            <h2 className="font-semibold text-foreground">Limitation of Liability</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, Cozy Habits shall not be liable for 
              any indirect, incidental, special, consequential, or punitive damages, or any 
              loss of profits or revenues, whether incurred directly or indirectly.
            </p>
          </section>

          {/* Termination */}
          <section className="ios-card p-4 space-y-3">
            <h2 className="font-semibold text-foreground">Termination</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may terminate or suspend your account and access to the App immediately, 
              without prior notice, for conduct that we believe violates these Terms or is 
              harmful to other users, us, or third parties.
            </p>
          </section>

          {/* Changes */}
          <section className="ios-card p-4 space-y-3">
            <h2 className="font-semibold text-foreground">Changes to Terms</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users 
              of any material changes. Continued use of the App after changes constitutes 
              acceptance of the new Terms.
            </p>
          </section>

          {/* Governing Law */}
          <section className="ios-card p-4 space-y-3">
            <h2 className="font-semibold text-foreground">Governing Law</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with applicable laws, 
              without regard to conflict of law provisions.
            </p>
          </section>

          {/* Contact */}
          <section className="ios-card p-4 space-y-3">
            <h2 className="font-semibold text-foreground">Contact Us</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have any questions about these Terms, please contact us:
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
