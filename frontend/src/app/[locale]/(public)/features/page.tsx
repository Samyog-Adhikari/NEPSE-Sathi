"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  LineChart,
  PieChart,
  Layers,
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";


export default function FeaturesPage() {
  const featuresList = [
    {
      id: "floorsheet",
      badge: "Real-Time Transaction Feed",
      title: "Live Floorsheet & Broker Analytics",
      tagline: "Track the footprints of institutional capital in real time.",
      description:
        "Every second during trading hours, thousands of transactions pass through NEPSE. Our live floorsheet engine filters, aggregates, and categorizes trades so you can easily spot institutional accumulation, aggressive market buying, and top broker distribution trends.",
      bullets: [
        "Real-time transaction stream with instant search by stock symbol or broker number",
        "Broker Net Buy/Sell summary breakdown updated continuously",
        "Bulk trade alerts highlighting unusual block orders",
        "Historical broker holding accumulation vs. distribution tracking",
      ],
      icon: Activity,
    },
    {
      id: "technicals",
      badge: "Chart & Momentum Analytics",
      title: "Technical Analysis & Market Indicators",
      tagline: "Cut through market noise with automated momentum signals.",
      description:
        "Whether you are evaluating swing trades or long-term entries, NEPSE Sathi calculates multi-timeframe technical indicators across all listed securities, providing clarity on trend momentum, overbought/oversold levels, and dynamic pivot zones.",
      bullets: [
        "Interactive candlestick charts with EMA ribbons, RSI, and MACD indicators",
        "Automatic detection of key support and resistance levels",
        "Daily sector-wise relative strength and volume momentum rankings",
        "Market sentiment score derived from breadth and buying volume flow",
      ],
      icon: LineChart,
    },
    {
      id: "portfolio",
      badge: "Discipline & Tracking",
      title: "Smart Portfolio & Automated Trade Journal",
      tagline: "Manage your capital with exact WACC, dividends, and psychology notes.",
      description:
        "Keep your investments perfectly organized without messy spreadsheets. NEPSE Sathi recalculates your true Weighted Average Cost of Capital (WACC), tracks realized and unrealized profit/loss, factors in capital gains tax (CGT), and gives you a private journal to record trade rationale.",
      bullets: [
        "Real-time realized vs. unrealized PnL portfolio summary",
        "Automated adjustments for bonus shares, right issues, and cash dividends",
        "Estimated Capital Gains Tax (CGT) and SEBON commission calculations",
        "Private trade execution log to reflect on decisions and build disciplined habits",
      ],
      icon: PieChart,
    },
    {
      id: "ipo",
      badge: "Primary Market Calendar",
      title: "IPO Hub & Rapid Allotment Checker",
      tagline: "Stay ahead of every public offering and check allotments instantly.",
      description:
        "Track the complete primary market lifecycle in Nepal. From SEBON approval status to opening dates, closing deadlines, and rapid bulk allotment verification, the IPO Hub ensures you never miss a new issue.",
      bullets: [
        "Complete pipeline calendar for upcoming Ordinary Shares, Right Shares, and Debentures",
        "Key prospectus highlights, issue size, credit ratings, and capital structure",
        "1-click bulk BOID allotment checker to verify family accounts simultaneously",
        "Automatic notifications for opening, closing, and allotment announcement dates",
      ],
      icon: Layers,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-16">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="outline" className="px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
          <Zap className="w-3.5 h-3.5 mr-1" />
          <span>Complete Feature Overview</span>
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          Built for Precision, Speed, and Smarter Investing
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Discover how NEPSE Sathi consolidates real-time market data, technical indicators, broker analytics, and portfolio tracking into one cohesive platform.
        </p>
      </div>

      {/* Feature Sections */}
      <div className="space-y-12">
        {featuresList.map((f, idx) => (
          <div
            id={f.id}
            key={f.id}
            className="scroll-mt-28 rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-sm transition-all"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column */}
              <div className="lg:col-span-5 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <f.icon className="w-6 h-6" />
                </div>
                <Badge variant="secondary" className="text-xs font-semibold">
                  {f.badge}
                </Badge>
                <h2 className="text-2xl font-bold text-foreground">
                  {f.title}
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {f.tagline}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </div>

              {/* Right Column: Key Feature Highlights & CTA */}
              <div className="lg:col-span-7 bg-muted/20 rounded-2xl p-6 border border-border/60 space-y-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Key Capabilities
                </h3>
                <div className="space-y-3">
                  {f.bullets.map((b, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-3 text-xs sm:text-sm text-foreground/90">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">
                    Ready to explore this tool live?
                  </span>
                  <Link
                    href="/en/auth/register"
                    className={cn(
                      buttonVariants({ size: "sm" }),
                      "rounded-full gap-1.5 px-4 h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                    )}
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA Banner */}
      <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-50/80 via-emerald-100/30 to-background dark:from-emerald-950/20 dark:via-background dark:to-background p-8 sm:p-12 text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
          Start Exploring NEPSE Sathi Today
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
          Create your free account within seconds to access real-time charts, broker data, and portfolio tracking.
        </p>
        <div className="pt-2">
          <Link
            href="/en/auth/register"
            className={cn(
              buttonVariants({ size: "lg" }),
              "rounded-full gap-2 px-8 h-12 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20"
            )}
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
