import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — BhoomiQ",
  description:
    "Learn how BhoomiQ collects, uses, and protects your property and financial data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link
          href="/"
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          &larr; Back to Home
        </Link>

        <h1 className="text-4xl font-extrabold text-slate-900 mt-8 mb-8">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-400 mb-10">
          Last updated: March 18, 2026
        </p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              1. Information We Collect
            </h2>
            <p>
              When you use BhoomiQ, we collect information you provide directly,
              including your name, email address, and Google account details used
              for authentication. We also collect property-related data you
              enter, such as property details, utility bills, rental income
              records, tenant information, and uploaded documents including bill
              images processed by our AI scanner.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              2. How We Use Your Data
            </h2>
            <p>
              Your data is used solely to provide BhoomiQ&apos;s property
              management services. This includes displaying your property
              portfolio, processing bill images with AI extraction, calculating
              analytics such as rental yields and ROI, and generating reports.
              We do not sell or share your personal or financial data with third
              parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              3. AI Bill Processing
            </h2>
            <p>
              When you upload utility bills, we send the images to Google&apos;s
              Gemini AI for data extraction. The extracted data (amounts, dates,
              meter readings) is stored in your account. Bill images are
              processed in real-time and are not retained by the AI provider
              beyond the processing request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              4. Data Storage & Security
            </h2>
            <p>
              All data is stored on secure cloud infrastructure using Neon
              Postgres with encryption at rest. Authentication is handled
              through NextAuth with industry-standard OAuth 2.0 protocols. We
              use HTTPS for all data transmission. Access to your data is
              limited to your authenticated account only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              5. Data Retention
            </h2>
            <p>
              Your data is retained as long as your account is active. You may
              request deletion of your account and all associated data at any
              time by contacting us. Upon account deletion, all property data,
              documents, and personal information will be permanently removed
              within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              6. Cookies & Analytics
            </h2>
            <p>
              We use essential cookies for authentication and session management.
              We may use privacy-friendly analytics to understand usage patterns
              and improve the service. We do not use third-party advertising
              trackers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              7. Your Rights
            </h2>
            <p>
              You have the right to access, correct, or delete your personal
              data at any time. You may export your property data or request a
              copy of all information we hold about you. To exercise any of
              these rights, please contact us at the email below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              8. Contact Us
            </h2>
            <p>
              For privacy-related questions or requests, please reach out to us
              at{" "}
              <a
                href="mailto:privacy@bhoomiq.com"
                className="text-blue-600 hover:text-blue-800"
              >
                privacy@bhoomiq.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
