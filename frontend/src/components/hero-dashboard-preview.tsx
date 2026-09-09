"use client";

import * as React from "react";
import {
  TrendingUp,
  Activity,
  Sparkles,
  Calendar,
  ChevronDown,
  ShieldCheck,
  BarChart2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeroDashboardPreviewProps {
  locale?: string;
}

export function HeroDashboardPreview({ locale = "en" }: HeroDashboardPreviewProps) {
  const [activeRange, setActiveRange] = React.useState<"1D" | "1W" | "1M" | "1Y">("1M");
  const isNepali = locale === "ne";

  return (
    <div className="relative w-full max-w-5xl mx-auto pt-6 pb-8">
      {/* Floating Pill Metric Widget - Left (Inspired by Landing_Page.png) */}
      <div className="hidden lg:flex absolute -left-6 top-24 z-20 items-center gap-3.5 px-4 py-3 rounded-2xl bg-card/95 backdrop-blur-md border border-border/80 shadow-lg animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            {isNepali ? "कुल कारोबार रकम" : "Total Turnover"}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-foreground">NPR 8.42 Arba</span>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold px-2 py-0.5">
              +14.2%
            </Badge>
          </div>
        </div>
      </div>

      {/* Floating Pill Metric Widget - Right (Inspired by Landing_Page.png) */}
      <div className="hidden lg:flex absolute -right-6 top-32 z-20 items-center gap-3.5 px-4 py-3 rounded-2xl bg-card/95 backdrop-blur-md border border-border/80 shadow-lg animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            {isNepali ? "नेप्से परिसूचक" : "NEPSE Index"}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-foreground">2,842.15</span>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold px-2 py-0.5">
              +12.5%
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Elevated Dashboard Container using shadcn Card */}
      <Card className="relative rounded-3xl border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden p-0">
        {/* Mock Topbar Navigation Inside Dashboard */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1.5 px-2.5 py-1 text-xs font-semibold bg-primary/10 text-primary border-primary/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isNepali ? "नेप्से लाइभ" : "NEPSE Live"}</span>
            </Badge>
            <span className="font-semibold text-sm text-foreground hidden sm:inline">
              {isNepali ? "सिंहावलोकन ड्यासबोर्ड" : "Overview Terminal"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Timeframe Filter Buttons */}
            <div className="flex items-center gap-1 bg-background/80 border border-border/70 rounded-lg p-0.5 text-xs font-medium">
              {(["1D", "1W", "1M", "1Y"] as const).map((range) => (
                <Button
                  key={range}
                  onClick={() => setActiveRange(range)}
                  variant={activeRange === range ? "default" : "ghost"}
                  size="xs"
                  className="px-2.5 h-6 text-xs cursor-pointer font-medium"
                >
                  {range}
                </Button>
              ))}
            </div>

            {/* Filter Pills */}
            <Button
              variant="outline"
              size="xs"
              className="hidden sm:inline-flex items-center gap-1.5 h-7 text-xs font-medium border-border/70 bg-background/80 text-muted-foreground"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Last 14 days</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </Button>

            {/* User Avatar */}
            <Avatar className="w-7 h-7 border border-primary/20 bg-primary/10 text-primary text-xs">
              <AvatarFallback className="text-[10px] font-bold">NS</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Dashboard Grid Content */}
        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* Top 4 KPI Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: NEPSE Index */}
            <Card className="p-3.5 sm:p-4 rounded-2xl bg-background/70 border-border/70 shadow-2xs hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-xs font-medium">{isNepali ? "नेप्से परिसूचक" : "NEPSE Index"}</span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] px-1.5 py-0">
                  +1.15%
                </Badge>
              </div>
              <div className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                2,842.15
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                +32.40 pts vs previous day
              </div>
            </Card>

            {/* Card 2: Daily Turnover */}
            <Card className="p-3.5 sm:p-4 rounded-2xl bg-background/70 border-border/70 shadow-2xs hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-xs font-medium">{isNepali ? "कारोबार रकम" : "Turnover"}</span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] px-1.5 py-0">
                  +8.7%
                </Badge>
              </div>
              <div className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                Rs 8.42 Arba
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                324,890 shares traded
              </div>
            </Card>

            {/* Card 3: Top Gainer */}
            <Card className="p-3.5 sm:p-4 rounded-2xl bg-background/70 border-border/70 shadow-2xs hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-xs font-medium">{isNepali ? "शीर्ष कमाउने" : "Top Gainer"}</span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] px-1.5 py-0">
                  +15.0%
                </Badge>
              </div>
              <div className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                PURE
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                LTP: Rs 460.00 (+60.00)
              </div>
            </Card>

            {/* Card 4: AI Market Outlook */}
            <Card className="p-3.5 sm:p-4 rounded-2xl bg-background/70 border-border/70 shadow-2xs hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-xs font-medium">{isNepali ? "एआई सेन्टिमेन्ट" : "AI Sentiment"}</span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] px-1.5 py-0">
                  Bullish
                </Badge>
              </div>
              <div className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-1.5">
                <span>68% Buy Flow</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Technicals: RSI 58.4 (Neutral)
              </div>
            </Card>
          </div>

          {/* Chart & Sector Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left 2 Cols: Interactive Smooth Line / Area Chart */}
            <Card className="lg:col-span-2 p-4 rounded-2xl bg-background/70 border-border/70 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {isNepali ? "नेप्से परिसूचक प्रवृत्ति" : "NEPSE Trend Analysis"}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {isNepali ? "३० दिनको कारोबार र भोल्युम विश्लेषण" : "Daily close with volume momentum"}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-muted-foreground">Current</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40" />
                    <span className="text-muted-foreground">Previous</span>
                  </div>
                </div>
              </div>

              {/* Realistic SVG Curved Line Graph */}
              <div className="relative h-48 sm:h-56 w-full pt-4">
                <svg
                  viewBox="0 0 600 200"
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="nepseGradientHero" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="0" y1="40" x2="600" y2="40" stroke="currentColor" strokeOpacity="0.08" />
                  <line x1="0" y1="90" x2="600" y2="90" stroke="currentColor" strokeOpacity="0.08" />
                  <line x1="0" y1="140" x2="600" y2="140" stroke="currentColor" strokeOpacity="0.08" />

                  {/* Previous Period Dashed Curve */}
                  <path
                    d="M 0 150 Q 100 130 200 145 T 400 110 T 600 100"
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity="0.25"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />

                  {/* Current Period Fill */}
                  <path
                    d="M 0 160 Q 90 140 160 110 T 320 80 T 460 50 T 600 35 L 600 200 L 0 200 Z"
                    fill="url(#nepseGradientHero)"
                  />

                  {/* Current Period Smooth Green Curve */}
                  <path
                    d="M 0 160 Q 90 140 160 110 T 320 80 T 460 50 T 600 35"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Highlight Point Tooltip */}
                  <circle cx="460" cy="50" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="600" cy="35" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                </svg>

                {/* Tooltip Badge on Graph */}
                <div className="absolute top-2 right-24 bg-card border border-border px-2.5 py-1 rounded-lg shadow-md text-[11px] font-medium text-foreground">
                  <span className="text-muted-foreground mr-1">May 12:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">2,842.15</span>
                </div>
              </div>
            </Card>

            {/* Right 1 Col: Sector Distribution */}
            <Card className="p-4 rounded-2xl bg-background/70 border-border/70 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">
                  {isNepali ? "क्षेत्रगत कारोबार हिस्सा" : "Sector Turnover"}
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  {isNepali ? "आजको कुल हिस्सा प्रतिशत" : "Volume distribution by sector"}
                </p>

                {/* Sector Progress Bars */}
                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-foreground">Commercial Banks</span>
                      <span className="text-muted-foreground font-semibold">36%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: "36%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-foreground">Hydropower</span>
                      <span className="text-muted-foreground font-semibold">28%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: "28%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-foreground">Microfinance</span>
                      <span className="text-muted-foreground font-semibold">18%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: "18%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-foreground">Others (Finance/Life)</span>
                      <span className="text-muted-foreground font-semibold">18%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: "18%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Indicator */}
              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Market Status</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  EOD Verified
                </span>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
