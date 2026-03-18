import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — BhoomiQ",
  description:
    "Terms and conditions for using BhoomiQ property management platform.",
};

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="text-sm text-slate-400 mb-10">
          Last updated: March 18, 2026
        </p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using BhoomiQ (&quot;the Service&quot;), you agree
              to be bound by these Terms of Service. If you do not agree to
              these terms, please do not use the Service. BhoomiQ is a property
              portfolio management platform designed for Indian families and
              property owners.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              2. Description of Service
            </h2>
            <p>
              BhoomiQ provides tools for managing property portfolios, including
              property registration, utility bill tracking with AI-powered
              extraction, rental income management, document storage, analytics
              dashboards, and Excel import capabilities. The Service is provided
              &quot;as is&quot; and may be updated or modified at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              3. User Accounts
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials. You agree to provide accurate information
              during registration and to keep your account details up to date.
              You are responsible for all activities that occur under your
              account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              4. Acceptable Use
            </h2>
            <p>
              You agree to use the Service only for lawful purposes and in
              accordance with these Terms. You shall not use the Service to
              store or transmit any illegal content, attempt to gain
              unauthorized access to the Service or its systems, or interfere
              with other users&apos; use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              5. Data & Content
            </h2>
            <p>
              You retain ownership of all data you enter into BhoomiQ, including
              property details, financial records, and uploaded documents. You
              grant us a limited license to process, store, and display this
              data solely for the purpose of providing the Service to you. You
              are responsible for ensuring the accuracy of the data you enter.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              6. AI Processing
            </h2>
            <p>
              Our AI bill scanning feature processes uploaded images to extract
              data. While we strive for accuracy, AI-extracted data should be
              reviewed by you before relying on it. BhoomiQ is not liable for
              any errors in AI-extracted information. Always verify critical
              financial data manually.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              7. Limitation of Liability
            </h2>
            <p>
              BhoomiQ is a management tool and does not provide financial, legal,
              or tax advice. The analytics, yields, and calculations shown are
              for informational purposes only. We are not liable for decisions
              made based on data shown in the Service. In no event shall our
              total liability exceed the amount you paid for the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              8. Termination
            </h2>
            <p>
              We may suspend or terminate your access to the Service at any time
              for violation of these Terms. You may terminate your account at
              any time by contacting us. Upon termination, your right to use the
              Service ceases immediately, and we may delete your data in
              accordance with our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              9. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms at any time. Changes
              will be posted on this page with an updated effective date.
              Continued use of the Service after changes constitutes acceptance
              of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              10. Contact
            </h2>
            <p>
              For questions about these Terms, please contact us at{" "}
              <a
                href="mailto:support@bhoomiq.com"
                className="text-blue-600 hover:text-blue-800"
              >
                support@bhoomiq.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
