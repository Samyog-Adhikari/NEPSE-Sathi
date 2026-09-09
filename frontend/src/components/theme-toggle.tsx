"use client";

import * as React from "react";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }), "rounded-full opacity-60")}>
        <Sun className="h-3.5 w-3.5" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  // Direct toggle on click (no dropdown box)
  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        buttonVariants({ variant: "outline", size: "icon-sm" }),
        "rounded-full relative border-border/80 bg-background/80 hover:bg-accent cursor-pointer transition-transform duration-200 active:scale-95"
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Sun className={cn("h-3.5 w-3.5 transition-all text-amber-500", isDark ? "rotate-90 scale-0 absolute" : "rotate-0 scale-100")} />
      <Moon className={cn("h-3.5 w-3.5 transition-all text-slate-300", isDark ? "rotate-0 scale-100" : "-rotate-90 scale-0 absolute")} />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
