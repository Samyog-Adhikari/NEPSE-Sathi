"use client";

import * as React from "react";
import { Search, Activity, ArrowUpRight, ArrowDownRight, Layers, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DepthOrder {
  orders: number;
  quantity: number;
  price: number;
}

export interface MarketDepthData {
  symbol: string;
  ltp: number;
  point_change: number;
  percent_change: number;
  total_buy_qty: number;
  total_sell_qty: number;
  bids: DepthOrder[];
  asks: DepthOrder[];
}

interface MarketDepthProps {
  initialSymbol?: string;
  className?: string;
}

export function MarketDepth({ initialSymbol = "NABIL", className }: MarketDepthProps) {
  const [symbol, setSymbol] = React.useState(initialSymbol);
  const [searchInput, setSearchInput] = React.useState(initialSymbol);
  const [depthData, setDepthData] = React.useState<MarketDepthData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Generate realistic 5-level Market Depth for active stock
  const fetchDepth = React.useCallback((sym: string) => {
    setIsLoading(true);
    const basePrice = 400 + (Math.abs(hash(sym)) % 1800);
    const isUp = (hash(sym) % 2) === 0;
    const ptChange = round2(((hash(sym) % 35) + 1) * (isUp ? 1 : -1));
    const pctChange = round2((ptChange / basePrice) * 100);

    const bids: DepthOrder[] = [];
    const asks: DepthOrder[] = [];

    let totalBuy = 0;
    let totalSell = 0;

    for (let i = 0; i < 5; i++) {
      const bidP = round2(basePrice - (i + 1) * 0.8);
      const bidQ = 500 + ((Math.abs(hash(sym + "b" + i)) % 40) * 100);
      const bidO = 1 + (Math.abs(hash(sym + "bo" + i)) % 8);
      totalBuy += bidQ;
      bids.push({ orders: bidO, quantity: bidQ, price: bidP });

      const askP = round2(basePrice + (i + 1) * 0.8);
      const askQ = 450 + ((Math.abs(hash(sym + "a" + i)) % 40) * 100);
      const askO = 1 + (Math.abs(hash(sym + "ao" + i)) % 8);
      totalSell += askQ;
      asks.push({ orders: askO, quantity: askQ, price: askP });
    }

    setDepthData({
      symbol: sym.toUpperCase(),
      ltp: basePrice,
      point_change: ptChange,
      percent_change: pctChange,
      total_buy_qty: totalBuy,
      total_sell_qty: totalSell,
      bids,
      asks,
    });
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    fetchDepth(symbol);
  }, [symbol, fetchDepth]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSymbol(searchInput.trim().toUpperCase());
    }
  };

  const buyRatio = depthData
    ? Math.round((depthData.total_buy_qty / (depthData.total_buy_qty + depthData.total_sell_qty || 1)) * 100)
    : 50;
  const sellRatio = 100 - buyRatio;

  return (
    <div className={cn("rounded-xl border border-border/70 bg-card p-3.5 sm:p-4 shadow-xs space-y-3", className)}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
              <span>Market Depth (Order Book)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-mono">
                5 Levels
              </span>
            </h3>
          </div>
        </div>

        {/* Stock Symbol Quick Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-1.5">
          <div className="relative">
            <Search className="w-3 h-3 text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Symbol (e.g. NABIL)"
              className="pl-7 pr-2 py-1 rounded-lg border border-border/70 bg-background text-[11px] font-mono uppercase text-foreground w-28 sm:w-32 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-all cursor-pointer"
          >
            Go
          </button>
        </form>
      </div>

      {depthData && (
        <>
          {/* Active Stock LTP Info */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-muted/40 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-foreground">{depthData.symbol}</span>
              <span className="font-mono font-bold text-foreground">Rs. {depthData.ltp.toFixed(2)}</span>
            </div>
            <div
              className={cn(
                "font-mono text-[11px] font-bold flex items-center gap-0.5",
                depthData.point_change > 0 ? "text-emerald-600 dark:text-emerald-400" : depthData.point_change < 0 ? "text-rose-500" : "text-blue-500"
              )}
            >
              {depthData.point_change > 0 ? "+" : ""}{depthData.point_change.toFixed(2)} ({depthData.percent_change.toFixed(2)}%)
            </div>
          </div>

          {/* Buy vs Sell Ratio Strength Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10.5px] font-mono">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                Buyers: {depthData.total_buy_qty.toLocaleString()} ({buyRatio}%)
              </span>
              <span className="font-bold text-rose-500">
                Sellers: {depthData.total_sell_qty.toLocaleString()} ({sellRatio}%)
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted flex overflow-hidden">
              <div
                className="bg-emerald-500 transition-all duration-300"
                style={{ width: `${buyRatio}%` }}
              />
              <div
                className="bg-rose-500 transition-all duration-300"
                style={{ width: `${sellRatio}%` }}
              />
            </div>
          </div>

          {/* 5-Level Depth Grid: 2 Columns (Bids Left, Asks Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
            {/* Bids Table (Buy Side) */}
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 overflow-hidden">
              <div className="bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                <span>Buy Orders (Bids)</span>
                <span>Total: {depthData.total_buy_qty.toLocaleString()}</span>
              </div>
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="text-[10px] text-muted-foreground border-b border-emerald-500/20">
                    <th className="px-2 py-1 font-semibold">Orders</th>
                    <th className="px-2 py-1 font-semibold text-right">Qty</th>
                    <th className="px-2 py-1 font-semibold text-right text-emerald-600 dark:text-emerald-400">Bid Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-500/10">
                  {depthData.bids.map((b, idx) => (
                    <tr key={idx} className="hover:bg-emerald-500/10 transition-colors">
                      <td className="px-2 py-1 text-muted-foreground">{b.orders}</td>
                      <td className="px-2 py-1 text-right text-foreground font-semibold">{b.quantity.toLocaleString()}</td>
                      <td className="px-2 py-1 text-right text-emerald-600 dark:text-emerald-400 font-bold">{b.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Asks Table (Sell Side) */}
            <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 overflow-hidden">
              <div className="bg-rose-500/15 px-2.5 py-1 text-[10px] font-bold uppercase text-rose-500 flex items-center justify-between">
                <span>Sell Orders (Asks)</span>
                <span>Total: {depthData.total_sell_qty.toLocaleString()}</span>
              </div>
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="text-[10px] text-muted-foreground border-b border-rose-500/20">
                    <th className="px-2 py-1 font-semibold text-rose-500">Ask Price</th>
                    <th className="px-2 py-1 font-semibold text-right">Qty</th>
                    <th className="px-2 py-1 font-semibold text-right">Orders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-500/10">
                  {depthData.asks.map((a, idx) => (
                    <tr key={idx} className="hover:bg-rose-500/10 transition-colors">
                      <td className="px-2 py-1 text-rose-500 font-bold">{a.price.toFixed(2)}</td>
                      <td className="px-2 py-1 text-right text-foreground font-semibold">{a.quantity.toLocaleString()}</td>
                      <td className="px-2 py-1 text-right text-muted-foreground">{a.orders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  }
  return h;
}

function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
