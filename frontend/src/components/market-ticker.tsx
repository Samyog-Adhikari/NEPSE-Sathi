"use client";

import * as React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TickerItem {
  symbol: string;
  price: string;
  change: string;
  isUp: boolean;
}

const DEFAULT_TICKERS: TickerItem[] = [
  { symbol: "NEPSE", price: "2,842.15", change: "+1.15%", isUp: true },
  { symbol: "Sensitive", price: "492.30", change: "+0.84%", isUp: true },
  { symbol: "Float", price: "198.40", change: "+1.02%", isUp: true },
  { symbol: "Banking", price: "1,520.60", change: "+1.45%", isUp: true },
  { symbol: "Hydropower", price: "3,140.20", change: "-0.32%", isUp: false },
  { symbol: "PURE", price: "Rs 460.00", change: "+15.00%", isUp: true },
  { symbol: "GMFBS", price: "Rs 1,420.00", change: "+7.35%", isUp: true },
  { symbol: "SAIL", price: "Rs 520.00", change: "+6.26%", isUp: true },
  { symbol: "SHIVM", price: "Rs 540.00", change: "+2.80%", isUp: true },
  { symbol: "NICA", price: "Rs 480.00", change: "-0.80%", isUp: false },
  { symbol: "GBIME", price: "Rs 240.00", change: "+0.50%", isUp: true },
  { symbol: "HDL", price: "Rs 1,820.00", change: "+1.10%", isUp: true },
];

export function MarketTicker() {
  return (
    <div className="w-full bg-muted/30 border-y border-border/70 py-2.5 overflow-hidden">
      <div className="flex gap-8 whitespace-nowrap animate-marquee">
        {[...DEFAULT_TICKERS, ...DEFAULT_TICKERS].map((item, idx) => (
          <div key={idx} className="inline-flex items-center gap-2 text-xs">
            <span className="font-semibold text-foreground">{item.symbol}</span>
            <span className="text-muted-foreground">{item.price}</span>
            <span
              className={`inline-flex items-center gap-0.5 font-medium ${
                item.isUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {item.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {item.change}
            </span>
            <span className="text-border ml-2">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
