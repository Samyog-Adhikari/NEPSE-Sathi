"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  PieChart,
  Layers,
  ArrowRight,
  TrendingUp,
  LineChart,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DetailedFeaturesSectionProps {
  locale?: string;
}

export function DetailedFeaturesSection({ locale = "en" }: DetailedFeaturesSectionProps) {
  const isNepali = locale === "ne";

  const features = [
    {
      badge: isNepali ? "फ्लोरशीट इन्टेलिजेन्स" : "Live Floor Intelligence",
      title: isNepali ? "वास्तविक समय फ्लोरशीट र ब्रोकर एनालिटिक्स" : "Real-Time Floorsheet & Broker Analytics",
      description: isNepali
        ? "नेपालका ब्रोकरहरूको खरीद-बिक्री प्रवाह, ठूला कारोबार (Bulk Trades), र संस्थागत संकलन/वितरण ढाँचाहरू तत्काल पहिचान गर्नुहोस्।"
        : "Detect institutional accumulation and distribution patterns across registered broker houses with live transaction data and volume momentum.",
      points: isNepali
        ? [
            "ब्रोकरहरूको दैनिक खरिद-बिक्री सारांश",
            "ठूला कारोबारहरूको प्रत्यक्ष ट्र्याकिङ",
            "ऐतिहासिक ब्रोकर होल्डिङ विश्लेषण",
          ]
        : [
            "Broker holding & turnover breakdown",
            "Real-time bulk deal & block trade tracking",
            "Historical accumulation vs distribution analysis",
          ],
      href: `/${locale}/features#floorsheet`,
      icon: Activity,
    },
    {
      badge: isNepali ? "प्राविधिक विश्लेषण" : "Automated Technicals",
      title: isNepali ? "प्राविधिक विश्लेषण र बजार दृष्टिकोण" : "Technical Analysis & Market Outlook",
      description: isNepali
        ? "प्राविधिक सूचकहरू (RSI, MACD, Moving Averages) को स्वचालित विश्लेषण, प्रमुख समर्थन र अवरोध स्तरहरू स्पष्ट बुझ्नुहोस्।"
        : "Automated indicator synthesis evaluating momentum, trend strength, moving averages, and critical support and resistance levels.",
      points: isNepali
        ? [
            "प्राविधिक सूचकहरूको स्पष्ट व्याख्या",
            "बजार सेन्टिमेन्ट र मोमेन्टम स्कोर",
            "समर्थन (Support) र अवरोध (Resistance) स्तरहरू",
          ]
        : [
            "Clear technical momentum indicators",
            "Daily sentiment score & trend ratings",
            "Dynamic support, resistance, and pivot levels",
          ],
      href: `/${locale}/features#technicals`,
      icon: LineChart,
    },
    {
      badge: isNepali ? "पोर्टफोलियो व्यवस्थापन" : "Portfolio Tracking",
      title: isNepali ? "स्मार्ट पोर्टफोलियो र ट्रेड जर्नल" : "Smart Portfolio & Trade Journal",
      description: isNepali
        ? "आफ्नो सम्पूर्ण लगानीलाई एउटै ड्यासबोर्डमा व्यवस्थित गर्नुहोस्। WACC, पूँजीगत लाभकर (CGT) र लाभांश प्रतिफलको स्वचालित हिसाब राख्नुहोस्।"
        : "Consolidate all equity holdings with automated WACC recalculations, dividend yields, capital gains estimates, and trade logging.",
      points: isNepali
        ? [
            "वास्तविक र अवास्तविक नाफा-नोक्सान ट्र्याकर",
            "लाभांश र हकप्रद सेयरको स्वचालित हिसाब",
            "ट्रेडिङ कारण र डायरी रेकर्डिङ सुविधा",
          ]
        : [
            "Realized vs Unrealized PnL with WACC calculation",
            "Automated dividend yield & bonus share ledger",
            "Trade execution notes and discipline logging",
          ],
      href: `/${locale}/features#portfolio`,
      icon: PieChart,
    },
    {
      badge: isNepali ? "प्राथमिक बजार" : "Primary Market",
      title: isNepali ? "आईपीओ हब र नतिजा जाँच" : "IPO Hub & Rapid Allotment Checker",
      description: isNepali
        ? "आगामी साधारण सेयर (IPO), हकप्रद, ऋणपत्र र म्युचुअल फण्डहरूको पूर्ण समयतालिका र एकैपटक धेरै डिम्याट खाताहरूको नतिजा हेर्ने सुविधा।"
        : "Complete pipeline tracking for ordinary shares, right shares, debentures, and mutual funds, plus bulk BOID allotment verification.",
      points: isNepali
        ? [
            "आगामी र सक्रिय निष्कासनहरूको क्यालेन्डर",
            "पाइपलाइन स्वीकृति स्थिति",
            "एकै क्लिकमा परिवारका सबै खाताको नतिजा जाँच",
          ]
        : [
            "Upcoming & ongoing issue calendar",
            "Regulatory pipeline status tracking",
            "1-click bulk BOID allotment result verification",
          ],
      href: `/${locale}/features#ipo`,
      icon: Layers,
    },
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto border-t border-border/60">
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
        <Badge variant="outline" className="px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
          <span>{isNepali ? "प्लेटफर्म सुविधाहरू" : "Platform Capabilities"}</span>
        </Badge>
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {isNepali
            ? "लगानीकर्ताका लागि आवश्यक विशेष सुविधाहरू"
            : "Deep Intelligence for Smarter Decisions"}
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          {isNepali
            ? "हाम्रो प्रत्येक फिचर लगानीकर्तालाई वास्तविक लाभ र सही समयमा सही निर्णय लिन मद्दत गर्न तयार पारिएको छ।"
            : "Explore what makes NEPSE Sathi the go-to terminal for active traders and long-term investors."}
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {features.map((f, idx) => (
          <Card
            key={idx}
            className="rounded-3xl border-border/80 bg-card p-6 sm:p-8 hover:border-emerald-500/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <f.icon className="w-6 h-6" />
                </div>
                <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-1">
                  {f.badge}
                </Badge>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                {f.title}
              </h3>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {f.description}
              </p>

              {/* Key Bullet Highlights */}
              <div className="space-y-2 pt-2 border-t border-border/50">
                {f.points.map((pt, pIdx) => (
                  <div key={pIdx} className="flex items-center gap-2 text-xs text-foreground/90 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Learn More Action Button linking directly to /features */}
            <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
              <Link
                href={f.href}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "rounded-full gap-1.5 text-xs font-semibold text-foreground hover:text-emerald-600 hover:border-emerald-500/40 transition-colors"
                )}
              >
                <span>{isNepali ? "थप जान्नुहोस्" : "Learn More"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[11px] text-muted-foreground">
                {isNepali ? "सुविधा विवरण" : "Feature Details"}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
