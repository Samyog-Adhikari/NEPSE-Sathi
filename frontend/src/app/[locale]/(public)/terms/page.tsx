import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | NEPSE Sathi",
  description: "Terms and conditions for utilizing the NEPSE Sathi platform and services.",
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-28 space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Last updated: September 2026
        </p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-sm sm:text-base leading-relaxed text-muted-foreground">
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the NEPSE Sathi platform, web application, or associated market data APIs, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">2. Description of Service</h2>
          <p>
            NEPSE Sathi provides tools for tracking and analyzing the Nepal Stock Exchange (NEPSE), including market summaries, floorsheet data, broker analytics, technical indicators, IPO tracking, and AI-assisted insights. All market information is aggregated from public feeds and official regulatory filings for informational purposes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">3. User Responsibilities</h2>
          <p>
            You agree to provide accurate registration details and maintain the security of your account credentials. You may not attempt to reverse engineer, scrape at abusive frequencies, or disrupt the operation of the NEPSE Sathi infrastructure.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">4. Contact Information</h2>
          <p>
            For support or legal inquiries regarding these terms, please contact <code className="text-foreground">support@nepsesathi.com</code>.
          </p>
        </section>
      </div>
    </div>
  );
}
