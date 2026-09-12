"use client";

import * as React from "react";
import Link from "next/link";
import { Newspaper, ArrowRight, Clock } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

interface NewsItem {
  id?: string;
  title: string;
  source?: string;
  published_at?: string;
  url?: string;
}

export function CompactNewsFeed({ locale = "en" }: { locale?: string }) {
  const [news, setNews] = React.useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const isNepali = locale === "ne";

  React.useEffect(() => {
    setIsLoading(true);
    apiFetch<any>("/api/v1/news?limit=5")
      .then((res) => {
        if (res.data?.data && res.data.data.length > 0) {
          setNews(res.data.data);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "Today";
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Today";
    }
  };

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
            {isNepali ? "बजार समाचार" : "Market Dispatches"}
          </h4>
        </div>
        <Link
          href={`/${locale}/news`}
          className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          <span>{isNepali ? "सबै" : "View all"}</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* News List */}
      <div className="space-y-1">
        {isLoading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse p-2">
                <div className="h-3 bg-muted rounded w-full mb-1.5" />
                <div className="h-2 bg-muted rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : news.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">
            {isNepali ? "समाचार उपलब्ध छैन" : "No news available"}
          </p>
        ) : (
          news.slice(0, 5).map((item, idx) => (
            <a
              key={idx}
              href={item.url || `/${locale}/news`}
              target={item.url ? "_blank" : "_self"}
              rel="noreferrer"
              className="group flex items-start gap-2.5 p-2 rounded-xl hover:bg-muted/50 transition-colors"
            >
              {/* Accent indicator */}
              <div
                className={cn(
                  "w-0.5 h-full min-h-[28px] rounded-full shrink-0 mt-0.5",
                  idx === 0 ? "bg-emerald-500" : "bg-border"
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground font-mono">
                  <span className="font-semibold text-foreground/70">{item.source || "NEPSE"}</span>
                  <span className="text-border">•</span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {formatTime(item.published_at)}
                  </span>
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
