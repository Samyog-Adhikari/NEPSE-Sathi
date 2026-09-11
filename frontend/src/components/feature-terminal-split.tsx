"use client";

import * as React from "react";
import {
  CheckCircle2,
  Home,
  BarChart3,
  Star,
  PieChart,
  FileText,
  Settings,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface FeatureTerminalSplitProps {
  locale?: string;
}

export function FeatureTerminalSplit({ locale = "en" }: FeatureTerminalSplitProps) {
  const isNepali = locale === "ne";

  const checklist = [
    {
      title: isNepali ? "प्रत्यक्ष नेप्से परिसूचक र सेयर मूल्य" : "Live NEPSE index and stock prices",
    },
    {
      title: isNepali ? "विस्तृत चार्ट र प्राविधिक विश्लेषण" : "Detailed charts and technical insights",
    },
    {
      title: isNepali ? "व्यक्तिगत वाचलिस्ट र पोर्टफोलियो ट्र्याकिङ" : "Personalized watchlist and portfolio tracking",
    },
    {
      title: isNepali ? "समयमै बजार समाचार र सूचनाहरू" : "Timely news and market updates",
    },
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left: Desktop Terminal Card Preview */}
        <div className="lg:col-span-7">
          <Card className="rounded-3xl border-border/80 bg-card shadow-xl overflow-hidden p-0">
            {/* Terminal Window Header */}
            <div className="px-4 py-3 border-b border-border/60 bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs tracking-tight text-emerald-600 dark:text-emerald-400">NEPSE</span>
                <span className="text-xs text-muted-foreground">Terminal Pro</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
            </div>

            {/* Terminal Grid */}
            <div className="grid grid-cols-12 divide-x divide-border/60">
              {/* Mini Left Sidebar */}
              <div className="hidden sm:flex col-span-3 p-3 flex-col gap-1 text-[11px] font-medium text-muted-foreground">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Home className="w-3.5 h-3.5" />
                  <span>Home</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Market</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50">
                  <Star className="w-3.5 h-3.5" />
                  <span>Watchlist</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50">
                  <PieChart className="w-3.5 h-3.5" />
                  <span>Portfolio</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50">
                  <FileText className="w-3.5 h-3.5" />
                  <span>News</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50 mt-auto">
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="col-span-12 sm:col-span-9 p-4 space-y-4">
                {/* Top Row: Index Chart + Market Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* NEPSE Index Box */}
                  <div className="p-3 rounded-2xl bg-muted/20 border border-border/60">
                    <div className="text-[11px] font-medium text-muted-foreground">NEPSE Index</div>
                    <div className="text-lg font-bold text-foreground">
                      2,748.36 <span className="text-xs text-emerald-600 font-semibold">+32.45 (1.19%)</span>
                    </div>
                    {/* SVG Curve */}
                    <div className="h-16 w-full mt-1">
                      <svg viewBox="0 0 200 60" className="w-full h-full" preserveAspectRatio="none">
                        <path d="M 0 50 Q 50 40 100 25 T 200 10" fill="none" stroke="#10b981" strokeWidth="2.5" />
                      </svg>
                    </div>
                    {/* Range Buttons */}
                    <div className="flex justify-between text-[9px] font-semibold text-muted-foreground pt-1">
                      <span className="text-emerald-600 font-bold">1D</span>
                      <span>1W</span>
                      <span>1M</span>
                      <span>3M</span>
                      <span>1Y</span>
                      <span>ALL</span>
                    </div>
                  </div>

                  {/* Market Overview Box */}
                  <div className="p-3 rounded-2xl bg-muted/20 border border-border/60 space-y-2 text-xs">
                    <div className="font-bold text-[11px] text-foreground">Market Overview</div>
                    <div className="flex justify-between py-1 border-b border-border/40 text-[11px]">
                      <span className="text-muted-foreground">Total Turnover</span>
                      <span className="font-bold text-foreground">8.42B</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/40 text-[11px]">
                      <span className="text-muted-foreground">Total Traded Shares</span>
                      <span className="font-bold text-foreground">12.56M</span>
                    </div>
                    <div className="flex justify-between py-1 text-[11px]">
                      <span className="text-muted-foreground">Total Transactions</span>
                      <span className="font-bold text-foreground">68,342</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Top Stocks Table */}
                <div className="space-y-1.5">
                  <div className="font-bold text-xs text-foreground">Top Stocks</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="text-muted-foreground border-b border-border/40">
                          <th className="py-1 font-medium">Symbol</th>
                          <th className="py-1 font-medium">LTP</th>
                          <th className="py-1 font-medium">Change</th>
                          <th className="py-1 font-medium">Volume</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        <tr>
                          <td className="py-1.5 font-bold text-foreground">NABIL</td>
                          <td className="py-1.5">1,620.00</td>
                          <td className="py-1.5 font-bold text-emerald-600">+4.21%</td>
                          <td className="py-1.5 text-muted-foreground">1.2M</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 font-bold text-foreground">NRIC</td>
                          <td className="py-1.5">1,230.50</td>
                          <td className="py-1.5 font-bold text-emerald-600">+3.78%</td>
                          <td className="py-1.5 text-muted-foreground">856K</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 font-bold text-foreground">SICL</td>
                          <td className="py-1.5">703.00</td>
                          <td className="py-1.5 font-bold text-emerald-600">+3.12%</td>
                          <td className="py-1.5 text-muted-foreground">742K</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 font-bold text-foreground">NLIC</td>
                          <td className="py-1.5">1,540.00</td>
                          <td className="py-1.5 font-bold text-emerald-600">+2.98%</td>
                          <td className="py-1.5 text-muted-foreground">658K</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Feature Description & Checklist */}
        <div className="lg:col-span-5 space-y-6">
          <Badge
            variant="outline"
            className="gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
          >
            <span>◆</span>
            <span>{isNepali ? "तपाईंलाई आवश्यक सबै कुरा" : "Everything you need"}</span>
          </Badge>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            {isNepali ? (
              <>
                स्मार्ट <span className="text-emerald-600 dark:text-emerald-400">लगानी निर्णयहरू</span> लिनुहोस्
              </>
            ) : (
              <>
                Make Smarter <br />
                <span className="text-emerald-600 dark:text-emerald-400">Investment</span> Decisions
              </>
            )}
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {isNepali
              ? "प्रत्यक्ष बजार तथ्याङ्कदेखि शक्तिशाली एनालिटिक्ससम्म, NEPSE Sathi ले तपाईंलाई बजार बुझ्न, पोर्टफोलियो ट्र्याक गर्न र सधैं अगाडि रहन आवश्यक सबै उपकरणहरू प्रदान गर्दछ।"
              : "From real-time market data to powerful analytics, NEPSE Sathi gives you the tools to understand the market, track your portfolio, and stay ahead — effortlessly."}
          </p>

          {/* Checklist with Green Checkmarks */}
          <div className="space-y-3 pt-2">
            {checklist.map((c, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-foreground">
                  {c.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
