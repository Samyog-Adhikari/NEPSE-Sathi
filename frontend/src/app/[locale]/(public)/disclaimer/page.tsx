import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Financial Disclaimer | NEPSE Sathi",
  description: "Important regulatory and financial risk disclaimer for NEPSE Sathi users.",
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-28 space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Financial & Regulatory Disclaimer
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Notice under Securities Board of Nepal (SEBON) Information Guidelines
        </p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-sm sm:text-base leading-relaxed text-muted-foreground">
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">1. Informational & Educational Purposes Only</h2>
          <p>
            All information, charts, technical indicators, broker analytics, and AI-generated outlooks presented on NEPSE Sathi are compiled solely for informational, analytical, and educational purposes. Nothing on this website or within our platform constitutes financial, investment, legal, or tax advice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">2. Market Risk Disclosure</h2>
          <p>
            Investing and trading in securities listed on the Nepal Stock Exchange (NEPSE) involves substantial market risk, including the possible loss of principal capital. Past performance of any company, sector index, or technical pattern does not guarantee future results.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">3. No Guaranteed Accuracy of External Feeds</h2>
          <p>
            While we strive to provide real-time, verified End-of-Day (EOD) and intraday market statistics, NEPSE Sathi makes no warranties regarding the absolute precision or uninterrupted availability of third-party market data feeds.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">4. Inquiries</h2>
          <p>
            For questions or corrections regarding displayed data, reach out to <code className="text-foreground">support@nepsesathi.com</code>.
          </p>
        </section>
      </div>
    </div>
  );
}
