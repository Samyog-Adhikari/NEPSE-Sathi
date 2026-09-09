"use client";

import * as React from "react";
import { TrendingUp, FileText, Star, Clock, Bell } from "lucide-react";

interface CoreHighlightsProps {
  locale?: string;
}

export function CoreHighlights({ locale = "en" }: CoreHighlightsProps) {
  const isNepali = locale === "ne";

  const items = [
    {
      title: isNepali ? "प्रत्यक्ष बजार तथ्याङ्क" : "Real-time Market Data",
      desc: isNepali
        ? "नेप्से परिसूचक, सेयर मूल्य र कारोबार भोल्युमको प्रत्यक्ष अपडेट।"
        : "Live updates on NEPSE index, stock prices and trading volume.",
      icon: TrendingUp,
    },
    {
      title: isNepali ? "ताजा समाचार र विश्लेषण" : "Latest News & Insights",
      desc: isNepali
        ? "विश्वसनीय बजार समाचार र गहन विश्लेषणबाट सधैं सुसूचित रहनुहोस्।"
        : "Stay informed with trusted market news and analysis.",
      icon: FileText,
    },
    {
      title: isNepali ? "वाचलिस्ट" : "Watchlist",
      desc: isNepali
        ? "आफ्ना मनपर्ने सेयरहरू ट्र्याक गर्नुहोस् र कुनै पनि अवसर नछुटाउनुहोस्।"
        : "Track your favorite stocks and never miss a move.",
      icon: Star,
    },
    {
      title: isNepali ? "पोर्टफोलियो ट्र्याकिङ" : "Portfolio Tracking",
      desc: isNepali
        ? "आफ्नो लगानी र नाफा-नोक्सान सजिलैसँग व्यवस्थापन गर्नुहोस्।"
        : "Monitor your investments and performance easily.",
      icon: Clock,
    },
    {
      title: isNepali ? "स्मार्ट सूचनाहरू" : "Smart Notifications",
      desc: isNepali
        ? "मूल्य परिवर्तन, समाचार र अलर्टहरूको तत्काल सूचना पाउनुहोस्।"
        : "Get alerts for price changes, news and more.",
      icon: Bell,
    },
  ];

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto border-t border-border/60">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-6">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col items-start space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 group-hover:bg-emerald-500/15 transition-all">
              <item.icon className="w-6 h-6" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              {item.title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
