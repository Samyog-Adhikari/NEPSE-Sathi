"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CtaBannerProps {
  locale?: string;
}

export function CtaBanner({ locale = "en" }: CtaBannerProps) {
  const isNepali = locale === "ne";

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="relative rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-50/80 via-emerald-100/30 to-background dark:from-emerald-950/20 dark:via-background dark:to-background p-8 sm:p-12 overflow-hidden shadow-lg flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Background Trend Graphic Accent */}
        <div className="absolute right-8 -bottom-6 opacity-15 dark:opacity-10 pointer-events-none">
          <TrendingUp className="w-64 h-64 text-emerald-500" strokeWidth={1.5} />
        </div>

        {/* Left Content */}
        <div className="space-y-2 text-center md:text-left z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {isNepali
              ? "के तपाईं आफ्नो लगानी यात्रा सुरु गर्न तयार हुनुहुन्छ?"
              : "Ready to Start Your Investment Journey?"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isNepali
              ? "NEPSE Sathi प्रयोग गर्ने हजारौं स्मार्ट लगानीकर्ताहरूसँग आजै जोडिनुहोस्।"
              : "Join thousands of smart investors using NEPSE Sathi."}
          </p>
        </div>

        {/* Right CTA Button & Note */}
        <div className="flex flex-col items-center md:items-end gap-2 z-10 shrink-0">
          <Link
            href={`/${locale}/auth/register`}
            className={cn(
              buttonVariants({ size: "lg" }),
              "rounded-full gap-2 px-8 h-12 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 cursor-pointer group transition-all"
            )}
          >
            <span>{isNepali ? "निःशुल्क खाता खोल्नुहोस्" : "Get Started Free"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <span className="text-[11px] text-muted-foreground">
            {isNepali ? "कुनै क्रेडिट कार्ड आवश्यक छैन" : "No credit card required"}
          </span>
        </div>
      </div>
    </section>
  );
}
