"use client";

import * as React from "react";
import Link from "next/link";
import {
  TrendingUp,
  ArrowRight,
  Search,
  Bell,
  Home,
  Star,
  PieChart,
  FileText,
  MoreHorizontal,
  Zap,
  BarChart2,
  Lock,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HeroShowcaseProps {
  locale?: string;
}

export function HeroShowcase({ locale = "en" }: HeroShowcaseProps) {
  const isNepali = locale === "ne";
  const [timeRange, setTimeRange] = React.useState<"1D" | "1W" | "1M" | "3M" | "1Y" | "ALL">("1D");
  const [stockTab, setStockTab] = React.useState<"All" | "Commercial" | "Development" | "Finance">("All");

  const topGainers = [
    { symbol: "NABIL", name: "Nabil", price: "1,620.00", change: "+4.21%" },
    { symbol: "NRIC", name: "Reins", price: "1,230.50", change: "+3.78%" },
    { symbol: "SICL", name: "Shikhar", price: "703.00", change: "+3.12%" },
    { symbol: "NLIC", name: "Nepal Life", price: "1,540.00", change: "+2.98%" },
    { symbol: "EBL", name: "Everest", price: "620.00", change: "+2.74%" },
  ];

  const floatingStocks = [
    { symbol: "NABIL", sector: "Commercial", price: "1,620.00", change: "+4.21%" },
    { symbol: "NRIC", sector: "Insurance", price: "1,230.50", change: "+3.78%" },
    { symbol: "SICL", sector: "Insurance", price: "703.00", change: "+3.12%" },
    { symbol: "NLIC", sector: "Life", price: "1,540.00", change: "+2.98%" },
    { symbol: "EBL", sector: "Commercial", price: "620.00", change: "+2.74%" },
    { symbol: "HBL", sector: "Commercial", price: "1,180.00", change: "+2.36%" },
    { symbol: "SCB", sector: "Commercial", price: "452.00", change: "+1.68%" },
  ];

  return (
    <section className="pt-6 sm:pt-12 pb-16 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column: Headline, Description & CTAs */}
        <div className="lg:col-span-6 space-y-6 text-left">
          {/* Green Pill Badge */}
          <div className="inline-flex items-center">
            <Badge
              variant="outline"
              className="gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isNepali ? "नेपालको सेयर बजार, अब सहज र सरल" : "Nepal's Stock Market, Made Simple"}</span>
            </Badge>
          </div>

          {/* Main Hero Headline */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
              {isNepali ? (
                <>
                  नेप्सेको लागि तपाईंको <br />
                  <span className="text-emerald-600 dark:text-emerald-400">स्मार्ट सारथी</span>
                </>
              ) : (
                <>
                  Your <span className="italic font-serif font-medium">Smart</span> Companion <br />
                  for <span className="text-emerald-600 dark:text-emerald-400">NEPSE</span>
                </>
              )}
            </h1>

            <div className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              {isNepali ? "ट्र्याक गर्नुहोस्। विश्लेषण गर्नुहोस्। वृद्धि गर्नुहोस्।" : "Track. Analyze. Grow."}
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg">
              {isNepali
                ? "प्रत्यक्ष बजार अन्तर्दृष्टि प्राप्त गर्नुहोस्, ताजा समाचारहरूसँग अपडेट रहनुहोस्, र स्मार्ट लगानी निर्णयहरू गर्नुहोस् — सबै एउटै प्लेटफर्ममा।"
                : "Get real-time market insights, stay updated with the latest news, and make smarter investment decisions — all in one place."}
            </p>
          </div>

          {/* Dual Action CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={`/${locale}/auth/register`}
              className={cn(
                buttonVariants({ size: "lg" }),
                "rounded-full gap-2 px-7 h-12 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 group cursor-pointer transition-all"
              )}
            >
              <span>{isNepali ? "सुरु गर्नुहोस्" : "Get Started"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href={`/${locale}/features`}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-full px-7 h-12 text-sm font-medium border-border/80 bg-background/80 hover:bg-accent cursor-pointer transition-colors"
              )}
            >
              <span>{isNepali ? "थप जान्नुहोस्" : "Learn More"}</span>
            </Link>
          </div>

          {/* Clean, safe benefit pills (No legal/broker claims) */}
          <div className="pt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/40 border border-border/60">
              <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold text-foreground">Fast & Intuitive</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/40 border border-border/60">
              <BarChart2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold text-foreground">Modern Interactive Charts</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/40 border border-border/60">
              <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold text-foreground">Private & Secure</span>
            </div>
          </div>
        </div>

        {/* Right Column: Mobile Phone Mockup & Floating Stock Card Preview */}
        <div className="lg:col-span-6 relative flex items-center justify-center pt-4 lg:pt-0">
          {/* Ambient Mint Glow */}
          <div className="absolute -z-10 w-[380px] h-[380px] bg-emerald-500/10 blur-[90px] rounded-full pointer-events-none" />

          {/* Phone Mockup Frame */}
          <div className="relative z-10 w-[270px] sm:w-[290px] rounded-[40px] bg-slate-900 p-2.5 shadow-2xl ring-1 ring-slate-800/80">
            {/* Phone Bezel / Screen Container */}
            <div className="relative rounded-[32px] bg-card text-card-foreground overflow-hidden border border-border/60">
              {/* Phone Status Bar */}
              <div className="px-5 pt-3 pb-1 flex items-center justify-between text-[11px] font-semibold text-foreground">
                <span>9:41</span>
                <div className="w-16 h-4 rounded-full bg-slate-900/90 dark:bg-slate-800" />
                <div className="flex items-center gap-1">
                  <span className="text-[10px]">5G</span>
                  <div className="w-4 h-2 rounded-xs border border-foreground/80 flex items-center p-0.5">
                    <div className="w-full h-full bg-foreground" />
                  </div>
                </div>
              </div>

              {/* App Topbar Inside Phone */}
              <div className="px-4 py-2 flex items-center justify-between border-b border-border/40">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">NEPSE</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Search className="w-3.5 h-3.5" />
                  <Bell className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Phone App Body Content */}
              <div className="p-3.5 space-y-3">
                {/* Index Price */}
                <div>
                  <div className="text-xl font-extrabold tracking-tight text-foreground">
                    2,748.36
                  </div>
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span>+32.45 (1.19%)</span>
                  </div>
                </div>

                {/* SVG Area Mini Chart */}
                <div className="relative h-24 w-full">
                  <svg viewBox="0 0 260 90" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="phoneChartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 75 Q 30 65 60 55 T 120 40 T 180 25 T 260 15 L 260 90 L 0 90 Z"
                      fill="url(#phoneChartGrad)"
                    />
                    <path
                      d="M 0 75 Q 30 65 60 55 T 120 40 T 180 25 T 260 15"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Timeframe Selector Pills */}
                <div className="flex items-center justify-between bg-muted/40 p-1 rounded-lg text-[10px] font-semibold text-muted-foreground">
                  {(["1D", "1W", "1M", "3M", "1Y", "ALL"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setTimeRange(r)}
                      className={cn(
                        "px-2 py-0.5 rounded-md transition-colors",
                        timeRange === r ? "bg-emerald-600 text-white shadow-xs" : "hover:text-foreground"
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                {/* Top Gainers List Inside Phone */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-bold text-foreground">Top Gainers</div>
                  <div className="space-y-1 text-[11px]">
                    {topGainers.map((stock) => (
                      <div
                        key={stock.symbol}
                        className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-[9px] font-bold">
                            {stock.symbol[0]}
                          </div>
                          <div>
                            <div className="font-bold text-foreground leading-none">{stock.symbol}</div>
                            <div className="text-[9px] text-muted-foreground">{stock.name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-foreground leading-none">{stock.price}</div>
                          <div className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                            {stock.change}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Phone Bottom Navigation Bar */}
              <div className="px-3 py-2 border-t border-border/40 bg-card flex items-center justify-between text-[9px] text-muted-foreground">
                <div className="flex flex-col items-center text-emerald-600 font-bold">
                  <Home className="w-3.5 h-3.5" />
                  <span>Home</span>
                </div>
                <div className="flex flex-col items-center hover:text-foreground">
                  <Star className="w-3.5 h-3.5" />
                  <span>Watchlist</span>
                </div>
                <div className="flex flex-col items-center hover:text-foreground">
                  <PieChart className="w-3.5 h-3.5" />
                  <span>Portfolio</span>
                </div>
                <div className="flex flex-col items-center hover:text-foreground">
                  <FileText className="w-3.5 h-3.5" />
                  <span>News</span>
                </div>
                <div className="flex flex-col items-center hover:text-foreground">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                  <span>More</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Stocks Card on the Right (as in demo design) */}
          <div className="hidden sm:block absolute -right-4 lg:-right-10 top-12 z-20 w-64 rounded-2xl bg-card/95 backdrop-blur-md border border-border/80 p-4 shadow-xl animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-bold text-xs text-foreground">Stocks</span>
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Sector Tabs */}
            <div className="flex items-center gap-1 mb-3 text-[10px] font-medium text-muted-foreground border-b border-border/50 pb-1.5 overflow-x-auto">
              {(["All", "Commercial", "Development", "Finance"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStockTab(tab)}
                  className={cn(
                    "px-1.5 py-0.5 rounded transition-colors whitespace-nowrap cursor-pointer",
                    stockTab === tab ? "text-emerald-600 dark:text-emerald-400 font-bold" : "hover:text-foreground"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Stocks List */}
            <div className="space-y-2 text-xs">
              {floatingStocks.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-[9px] font-bold">
                      {s.symbol[0]}
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-[11px] leading-tight">{s.symbol}</div>
                      <div className="text-[9px] text-muted-foreground leading-none">{s.sector}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-foreground text-[11px]">{s.price}</div>
                    <div className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">{s.change}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
