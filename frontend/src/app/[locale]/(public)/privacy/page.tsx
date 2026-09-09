import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | NEPSE Sathi",
  description: "Privacy policy and data protection standards at NEPSE Sathi.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-28 space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Last updated: September 2026
        </p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-sm sm:text-base leading-relaxed text-muted-foreground">
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">1. Overview</h2>
          <p>
            Welcome to NEPSE Sathi. We respect your privacy and are committed to protecting any personal information you share with us. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data when using our stock market companion platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">2. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Account Information:</strong> When you register, we collect your email address and authentication credentials securely managed through encrypted Supabase Auth.</li>
            <li><strong>Portfolio & Watchlist Preferences:</strong> The stocks you add to your watchlists and manual trade journals are stored privately and linked strictly to your unique user ID.</li>
            <li><strong>Usage Diagnostics:</strong> Anonymous diagnostic telemetry to improve platform speed and maintain uptime.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">3. How We Use Your Data</h2>
          <p>
            We use your data solely to deliver the NEPSE Sathi service, calculate your personalized portfolio metrics, synchronize your watchlists across devices, and send critical market or IPO alerts if enabled. We do not sell your personal or financial trading data to any third parties.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">4. Contact Us</h2>
          <p>
            If you have questions or requests regarding your data, reach out to our privacy officer at <code className="text-foreground">support@nepsesathi.com</code>.
          </p>
        </section>
      </div>
    </div>
  );
}
