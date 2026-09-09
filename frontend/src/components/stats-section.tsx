"use client";

import * as React from "react";
import { Building2, Layers, Cpu, ShieldCheck } from "lucide-react";

interface StatsSectionProps {
  locale?: string;
}

export function StatsSection({ locale = "en" }: StatsSectionProps) {
  const isNepali = locale === "ne";

  const stats = [
    {
      value: "50+",
      label: isNepali ? "सक्रिय ब्रोकर विश्लेषण" : "Registered Brokers Tracked",
      desc: isNepali ? "दैनिक फ्लोरशीट सिंक" : "Real-time buying/selling flows",
      icon: Building2,
    },
    {
      value: "100%",
      label: isNepali ? "नेप्से सूचीकृत कम्पनीहरू" : "Listed Equities Covered",
      desc: isNepali ? "वाणिज्य बैंकदेखि हाइड्रोसम्म" : "Live EOD & intraday quotes",
      icon: Layers,
    },
    {
      value: "< 250ms",
      label: isNepali ? "अत्यधिक द्रुत गति" : "Ultra-Low Latency Feed",
      desc: isNepali ? "वास्तविक समय अपडेट" : "Engineered high-frequency stream",
      icon: Cpu,
    },
    {
      value: "SEBON",
      label: isNepali ? "नियमनकारी ढाँचा" : "Compliant Analytics",
      desc: isNepali ? "सुरक्षित र भरपर्दो" : "Standardized financial indicators",
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-muted/20 border-y border-border/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-start sm:items-center sm:text-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 border border-primary/20">
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-foreground mt-0.5">
                {stat.label}
              </div>
              <div className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                {stat.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
