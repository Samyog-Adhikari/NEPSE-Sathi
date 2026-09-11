"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  PieChart,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BentoFeaturesProps {
  locale?: string;
}

export function BentoFeatures({ locale = "en" }: BentoFeaturesProps) {
  const isNepali = locale === "ne";

  const features = [
    {
      title: isNepali ? "प्रत्यक्ष फ्लोरशीट र ब्रोकर एनालिटिक्स" : "Live Floorsheet & Broker Analytics",
      description: isNepali
        ? "शीर्ष ५० ब्रोकरहरूको खरीद-बिक्री प्रवाह, संकलन र वितरण ढाँचाहरू तत्काल ट्र्याक गर्नुहोस्।"
        : "Track top broker buy/sell flows, accumulation zones, and institutional distribution patterns with live floor feed.",
      icon: Activity,
      tag: isNepali ? "संस्थागत संकलन" : "Smart Money",
      href: `/${locale}/floorsheet`,
    },
    {
      title: isNepali ? "एआई प्राविधिक विश्लेषण र बजार आउटलुक" : "AI Technical Intelligence & Outlook",
      description: isNepali
        ? "नेपाल राष्ट्र बैंक र सेबोन नीतिहरूको सन्दर्भमा प्राविधिक सूचकहरू (RSI, MACD, EMA) को स्वचालित एआई व्याख्या।"
        : "Automated multi-model AI synthesis of NEPSE technicals, momentum indicators, and macro sector signals.",
      icon: Sparkles,
      tag: "AI Powered",
      href: `/${locale}/ai`,
    },
    {
      title: isNepali ? "स्मार्ट WACC, लाभांश र कर व्यवस्थापन" : "Smart WACC, Dividends & CGT Ledger",
      description: isNepali
        ? "आफ्नो नाफा-नोक्सान, लाभांश प्रतिफल, WACC र पूँजीगत लाभकर स्वचालित रूपमा व्यवस्थापन गर्नुहोस्।"
        : "Automate realized/unrealized PnL, dividend yields, WACC calculations, and disciplined trade execution notes.",
      icon: PieChart,
      tag: isNepali ? "सटीक हिसाब" : "Exact Accounting",
      href: `/${locale}/portfolio`,
    },
    {
      title: isNepali ? "आईपीओ हब र सामूहिक नतिजा जाँच" : "IPO Hub & Bulk BOID Checker",
      description: isNepali
        ? "आगामी साधारण सेयर, हकप्रद, र ऋणपत्रहरूको समयतालिका र एकै क्लिकमा परिवारका सबै डिम्याटको नतिजा हेर्ने सुविधा।"
        : "Real-time IPO pipeline tracker, issue calendar, premium debenture alerts, and instant bulk family allotment checker.",
      icon: Layers,
      tag: isNepali ? "सामूहिक नतिजा" : "1-Click Bulk",
      href: `/${locale}/ipo`,
    },
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
        <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs font-semibold bg-primary/10 text-primary border-primary/20">
          <Zap className="w-3.5 h-3.5" />
          <span>{isNepali ? "शक्तिशाली सुविधाहरू" : "Engineered for Nepal"}</span>
        </Badge>
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
          {isNepali
            ? "नेपाली लगानीकर्ताका लागि आवश्यक सबै उपकरणहरू एकै ठाउँमा"
            : "Everything Nepali Investors Need to Win the Market"}
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          {isNepali
            ? "जटिल बजार तथ्याङ्कलाई सरल, भरपर्दो र स्पष्ट निर्णयमा बदल्ने प्लेटफर्म।"
            : "No fragmented tools or delayed feeds. Built ground-up for precision and speed."}
        </p>
      </div>

      {/* Bento 2x2 Grid using shadcn Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {features.map((item, idx) => (
          <Card
            key={idx}
            className="group relative rounded-3xl border-border/80 bg-card/80 p-6 sm:p-8 hover:border-primary/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 group-hover:scale-105 transition-transform">
                  <item.icon className="w-6 h-6" />
                </div>
                <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-1">
                  {item.tag}
                </Badge>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {item.title}
              </h3>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
              <Link
                href={item.href}
                className={cn(buttonVariants({ variant: "link", size: "sm" }), "p-0 h-auto text-xs font-semibold text-primary gap-1 group/btn")}
              >
                <span>{isNepali ? "थप जान्नुहोस्" : "Explore feature"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
              <ShieldCheck className="w-4 h-4 text-muted-foreground/50" />
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
