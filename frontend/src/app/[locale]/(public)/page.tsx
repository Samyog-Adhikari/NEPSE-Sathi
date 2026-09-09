"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { HeroShowcase } from "@/components/hero-showcase";
import { CoreHighlights } from "@/components/core-highlights";
import { DetailedFeaturesSection } from "@/components/detailed-features-section";
import { FeatureTerminalSplit } from "@/components/feature-terminal-split";
import { FaqSection } from "@/components/faq-section";
import { CtaBanner } from "@/components/cta-banner";

export default function LandingPage() {
  const pathname = usePathname() || "/en";
  const locale = pathname.startsWith("/ne") ? "ne" : "en";

  return (
    <div className="relative overflow-hidden">
      {/* Subtle Ambient Background Gradient */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 -z-10 w-[600px] sm:w-[900px] h-[400px] bg-emerald-500/5 blur-[140px] rounded-full pointer-events-none" />

      {/* 1. Hero Showcase Section (Phone Mockup + Live Stocks Card + Live Market Metrics) */}
      <HeroShowcase locale={locale} />

      {/* 2. 5-Column Core Value Highlights Row */}
      <CoreHighlights locale={locale} />

      {/* 3. Deep Feature Capabilities with "Learn More" actions */}
      <DetailedFeaturesSection locale={locale} />

      {/* 4. Split Feature Showcase (Desktop Terminal Preview + Everything you need) */}
      <FeatureTerminalSplit locale={locale} />

      {/* 5. Investor Frequently Asked Questions Accordion */}
      <FaqSection locale={locale} />

      {/* 6. Ready to Start Your Investment Journey? CTA Banner */}
      <CtaBanner locale={locale} />
    </div>
  );
}
