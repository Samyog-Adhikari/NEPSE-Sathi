"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, LayoutDashboard } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface CtaBannerProps {
  locale?: string;
  className?: string;
  noPadding?: boolean;
}

export function CtaBanner({ locale = "en", className, noPadding = false }: CtaBannerProps) {
  const isNepali = locale === "ne";
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then((res: any) => {
      if (res?.data?.user) setIsLoggedIn(true);
    });
  }, []);

  return (
    <section className={cn(!noPadding && "py-8 sm:py-12 px-4 sm:px-6 max-w-6xl mx-auto", className)}>
      <div className="relative rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-50/80 via-emerald-100/30 to-background dark:from-emerald-950/20 dark:via-background dark:to-background p-6 sm:p-10 overflow-hidden shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Background Trend Graphic Accent */}
        <div className="absolute right-8 -bottom-6 opacity-15 dark:opacity-10 pointer-events-none">
          <TrendingUp className="w-56 h-56 text-emerald-500" strokeWidth={1.5} />
        </div>

        {/* Left Content */}
        <div className="space-y-1.5 text-center md:text-left z-10">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {isNepali
              ? "के तपाईं आफ्नो लगानी यात्रा सुरु गर्न तयार हुनुहुन्छ?"
              : "Ready to Start Your Investment Journey?"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isNepali
              ? "NEPSE Sathi प्रयोग गर्ने हजारौं स्मार्ट लगानीकर्ताहरूसँग आजै जोडिनुहोस्।"
              : "Join smart investors making informed decisions with NEPSE Sathi."}
          </p>
        </div>

        {/* Right CTA Button */}
        <div className="flex flex-col items-center md:items-end gap-2 z-10 shrink-0">
          <Link
            href={isLoggedIn ? `/${locale}/dashboard` : `/${locale}/auth/register`}
            className={cn(
              buttonVariants({ size: "default" }),
              "rounded-full gap-2 px-6 h-10 text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 cursor-pointer group transition-all"
            )}
          >
            {isLoggedIn ? (
              <>
                <LayoutDashboard className="w-4 h-4" />
                <span>{isNepali ? "ड्यासबोर्डमा जानुहोस्" : "Go to Dashboard"}</span>
              </>
            ) : (
              <>
                <span>{isNepali ? "निःशुल्क खाता खोल्नुहोस्" : "Get Started Free"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Link>
        </div>
      </div>
    </section>
  );
}
