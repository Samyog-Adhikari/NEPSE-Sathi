"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const isNepali = pathname?.startsWith("/ne");

  // Direct toggle on click between EN and NE
  const toggleLanguage = () => {
    if (!pathname) return;
    const targetLang = isNepali ? "en" : "ne";
    let nextPath = `/${targetLang}`;
    if (pathname.startsWith("/ne") || pathname.startsWith("/en")) {
      nextPath = pathname.replace(/^\/(ne|en)/, `/${targetLang}`);
    } else {
      nextPath = `/${targetLang}${pathname}`;
    }
    router.push(nextPath);
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "rounded-full gap-1.5 px-2.5 h-7 text-xs font-medium border-border/80 bg-background/80 hover:bg-accent cursor-pointer transition-transform duration-150 active:scale-95"
      )}
      title={isNepali ? "Switch to English" : "नेपालीमा हेर्नुहोस्"}
      aria-label="Toggle language"
    >
      <Globe className="w-3.5 h-3.5 text-muted-foreground" />
      <span>{isNepali ? "नेपाली" : "EN"}</span>
    </button>
  );
}
