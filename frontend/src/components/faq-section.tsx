"use client";

import * as React from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FaqSectionProps {
  locale?: string;
}

export function FaqSection({ locale = "en" }: FaqSectionProps) {
  const isNepali = locale === "ne";
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const faqs = [
    {
      q: isNepali
        ? "के NEPSE Sathi को तथ्याङ्क वास्तविक समयमा (Real-time) उपलब्ध हुन्छ?"
        : "Is NEPSE Sathi's market data updated in real-time?",
      a: isNepali
        ? "हो, बजार खुला भएको समयमा हाम्रो उच्च-गतिको डाटा इन्जेशन पाइपलाइनले प्रत्यक्ष मूल्य र फ्लोरशीट कारोबार सिंक गर्दछ। बजार बन्द भएपछि आधिकारिक अन्तिम (EOD) तथ्याङ्क स्वतः प्रमाणित हुन्छ।"
        : "Yes, during active market hours, our high-speed data pipeline streams live trade ticks, index movements, and floorsheet transactions with low latency. After market hours, official EOD data is automatically reconciled.",
    },
    {
      q: isNepali
        ? "एआई मार्केट आउटलुकले कसरी काम गर्छ?"
        : "How does the AI Market Outlook work?",
      a: isNepali
        ? "हाम्रो एआई मोडेलले प्राविधिक सूचकहरू (RSI, MACD, Bollinger Bands, Moving Averages), भोल्युम गतिशीलता र प्रमुख समष्टिगत आर्थिक तथ्याङ्कहरूलाई प्रशोधन गरी नेपाली र अंग्रेजीमा स्पष्ट बजार सारांश तयार गर्दछ।"
        : "Our multi-model AI synthesis engine analyzes key technical momentum indicators (RSI, MACD, EMA ribbons, volume spikes) in conjunction with macroeconomic indicators to generate plain-language, objective market outlook summaries.",
    },
    {
      q: isNepali
        ? "के मेरो पोर्टफोलियो र वाचलिस्ट सुरक्षित र गोप्य हुन्छन्?"
        : "Is my portfolio and watchlist data kept private?",
      a: isNepali
        ? "बिल्कुल सुरक्षित। तपाईंको सम्पूर्ण पोर्टफोलियो विवरण, खरिद-बिक्री मूल्य र व्यक्तिगत वाचलिस्टहरू तपाईंको आफ्नै खातामा इन्क्रिप्ट भएर मात्र सुरक्षित रहन्छन्।"
        : "Absolutely. All portfolio entries, purchase prices, notes, and custom watchlists are strictly encrypted and tied to your private user account. We never share or sell personal financial data.",
    },
    {
      q: isNepali
        ? "के म एकैपटक परिवारका धेरै डिम्याट खाताहरूको आईपीओ नतिजा जाँच गर्न सक्छु?"
        : "Can I check IPO allotment results for multiple BOID accounts at once?",
      a: isNepali
        ? "हो, हाम्रो आईपीओ हबमा तपाईंले आफ्ना सबै परिवारका सदस्यहरूको १६-अंकीय BOID सुरक्षित रूपमा सेभ गरेर केवल एक क्लिकमा सबैको नतिजा हेर्न सक्नुहुन्छ।"
        : "Yes, the IPO Center includes a bulk allotment checker allowing you to save multiple 16-digit BOID numbers and verify all family allocations simultaneously with a single click.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-4xl mx-auto border-t border-border/60">
      <div className="text-center mb-10 space-y-3">
        <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{isNepali ? "प्राय सोधिने प्रश्नहरू" : "Frequently Asked Questions"}</span>
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {isNepali ? "लगानीकर्ताका जिज्ञासा र उत्तरहरू" : "Questions? We've Got Answers."}
        </h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-border/70 bg-card overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between text-sm sm:text-base font-bold text-foreground cursor-pointer hover:bg-muted/40 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200",
                    isOpen && "rotate-180 text-emerald-600 dark:text-emerald-400"
                  )}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 animate-in fade-in-50 duration-150">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
