"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Search,
  ExternalLink,
  Check,
  RefreshCw,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

export interface StockInfo {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sector?: string;
  high?: number;
  low?: number;
  volume?: number;
  turnover?: number;
}

export function PrivateStockCollection({ locale = "en" }: { locale?: string }) {
  const [collection, setCollection] = React.useState<StockInfo[]>([]);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [availableStocks, setAvailableStocks] = React.useState<StockInfo[]>([]);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const isNepali = locale === "ne";
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsAddOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Load collection symbols from localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("nepse_pvt_collection");
      if (saved) {
        const parsed = JSON.parse(saved) as StockInfo[];
        setCollection(parsed);
        // Immediately refresh with live data
        refreshStockData(parsed.map((s) => s.symbol));
      }
    } catch {
      setCollection([]);
    }
  }, []);

  // Fetch fresh data for all stocks in the collection
  const refreshStockData = React.useCallback(async (symbols: string[]) => {
    if (symbols.length === 0) return;
    setIsRefreshing(true);
    try {
      const res = await apiFetch<any>("/api/v1/stocks?limit=500");
      if (res.data?.data) {
        const allStocks = res.data.data as any[];
        const symbolSet = new Set(symbols.map((s) => s.toUpperCase()));
        const refreshed: StockInfo[] = [];

        for (const s of allStocks) {
          if (symbolSet.has((s.symbol || "").toUpperCase())) {
            const price = parseFloat(s.ltp || s.current_price || 0);
            const changePercent = parseFloat(s.change_percent || s.percentage_change || 0);
            let change = parseFloat(s.point_change || 0);
            if (change === 0 && changePercent !== 0 && price > 0) {
              change = (price * changePercent) / 100;
            }

            refreshed.push({
              symbol: s.symbol,
              name: s.company_name || s.name || s.symbol,
              price,
              change,
              changePercent,
              sector: s.sector || "Others",
              volume: parseInt(s.volume || 0, 10),
              turnover: parseFloat(s.turnover || 0),
            });
          }
        }

        if (refreshed.length > 0) {
          const refreshedMap = new Map(refreshed.map((r) => [r.symbol, r]));
          const ordered: StockInfo[] = [];
          for (const sym of symbols) {
            const fresh = refreshedMap.get(sym.toUpperCase());
            if (fresh) ordered.push(fresh);
          }
          const finalCollection = ordered.length > 0 ? ordered : refreshed;
          setCollection(finalCollection);
          saveToStorage(finalCollection);
        }
      }
    } catch (err) {
      console.error("Failed to refresh stock data:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Auto-refresh every 30 seconds
  React.useEffect(() => {
    if (collection.length === 0) return;
    const interval = setInterval(() => {
      refreshStockData(collection.map((s) => s.symbol));
    }, 30000);
    return () => clearInterval(interval);
  }, [collection.length, refreshStockData]);

  const saveToStorage = (items: StockInfo[]) => {
    try {
      localStorage.setItem("nepse_pvt_collection", JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  };

  const saveCollection = (newItems: StockInfo[]) => {
    setCollection(newItems);
    saveToStorage(newItems);
  };

  // Fetch all stocks for search dropdown
  React.useEffect(() => {
    apiFetch<any>("/api/v1/stocks?limit=500").then((res) => {
      if (res.data?.data) {
        const mapped: StockInfo[] = res.data.data.map((s: any) => {
          const price = parseFloat(s.ltp || s.current_price || 0);
          const changePercent = parseFloat(s.change_percent || s.percentage_change || 0);
          let change = parseFloat(s.point_change || 0);
          if (change === 0 && changePercent !== 0 && price > 0) {
            change = (price * changePercent) / 100;
          }
          return {
            symbol: s.symbol,
            name: s.company_name || s.name || s.symbol,
            price,
            change,
            changePercent,
            sector: s.sector || "Others",
            volume: parseInt(s.volume || 0, 10),
            turnover: parseFloat(s.turnover || 0),
          };
        });
        setAvailableStocks(mapped);
      }
    });
  }, []);

  const handleAddStock = (stock: StockInfo) => {
    if (!collection.some((s) => s.symbol === stock.symbol)) {
      const updated = [...collection, stock];
      saveCollection(updated);
    }
    setIsAddOpen(false);
    setSearchQuery("");
  };

  const handleRemoveStock = (symbol: string) => {
    const updated = collection.filter((s) => s.symbol !== symbol);
    saveCollection(updated);
  };

  const filteredSearch = availableStocks.filter(
    (s) =>
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="rounded-xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs space-y-3.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
        <div className="flex items-center gap-2.5">
          {/* Ledger Icon */}
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <ScrollText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {isNepali ? "मेरो निजी स्टक खाता (Private Watchlist)" : "My Private Stock Collection"}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {isNepali ? "तपाईंले पछ्याइरहनुभएका व्यक्तिगत शेयरहरूको प्रत्यक्ष खाता" : "Your curated ledger of tracked NEPSE equities"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={() => refreshStockData(collection.map((s) => s.symbol))}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border/60 bg-card hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="Refresh live data"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin text-emerald-600")} />
          </button>

          {/* Add Stock Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsAddOpen(!isAddOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isNepali ? "स्टक थप्नुहोस्" : "Add Stock"}</span>
            </button>

            {/* Add Stock Popup Dropdown */}
            {isAddOpen && (
              <div className="absolute right-0 top-10 w-72 sm:w-80 bg-popover/95 backdrop-blur-md border border-border rounded-xl shadow-xl p-2.5 z-30 space-y-2">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/60 border border-border/60 text-xs">
                  <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    placeholder={isNepali ? "स्टक खोज्नुहोस् (उदा: NABIL, HDL)..." : "Search stocks (e.g. NABIL, HDL)..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none w-full text-xs"
                    autoFocus
                  />
                </div>

                <div className="max-h-56 overflow-y-auto space-y-0.5 pr-1">
                  {filteredSearch.slice(0, 15).map((stk) => {
                    const isAdded = collection.some((s) => s.symbol === stk.symbol);
                    return (
                      <button
                        key={stk.symbol}
                        onClick={() => !isAdded && handleAddStock(stk)}
                        disabled={isAdded}
                        className={cn(
                          "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left",
                          isAdded
                            ? "opacity-50 cursor-not-allowed bg-muted/30"
                            : "hover:bg-muted cursor-pointer"
                        )}
                      >
                        <div>
                          <span className="font-bold text-foreground">{stk.symbol}</span>
                          <span className="text-[10px] text-muted-foreground ml-1.5 truncate max-w-[120px] inline-block align-bottom">
                            {stk.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs">Rs. {stk.price.toFixed(2)}</span>
                          {isAdded ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                  {filteredSearch.length === 0 && searchQuery && (
                    <p className="text-[10px] text-muted-foreground text-center py-3">No stocks found matching &quot;{searchQuery}&quot;</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collection Table */}
      {collection.length === 0 ? (
        <div className="text-center py-8">
          <BookOpen className="w-7 h-7 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground font-medium">
            {isNepali ? "तपाईंको खाता संकलन खाली छ" : "Your private collection is empty"}
          </p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">
            {isNepali ? "माथि 'स्टक थप्नुहोस्' मा क्लिक गरी आफ्नो मनपर्ने शेयरहरू ट्र्याक गर्नुहोस्" : "Click \"Add Stock\" above to start tracking your portfolio interests"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/40 text-[10px] uppercase font-bold text-muted-foreground">
                <th className="text-left pb-2 font-semibold">Symbol & Company</th>
                <th className="text-right pb-2 font-semibold">LTP (NPR)</th>
                <th className="text-right pb-2 font-semibold">Change</th>
                <th className="text-right pb-2 font-semibold">Change %</th>
                <th className="text-right pb-2 font-semibold hidden sm:table-cell">Volume</th>
                <th className="text-right pb-2 font-semibold w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {collection.map((stock) => {
                const isUp = stock.changePercent > 0;
                const isDown = stock.changePercent < 0;
                const displayChange = stock.change !== 0
                  ? stock.change
                  : (stock.price * stock.changePercent) / 100;

                return (
                  <tr key={stock.symbol} className="hover:bg-muted/30 transition-colors group">
                    <td className="py-2">
                      <Link
                        href={`/${locale}/stocks?symbol=${stock.symbol}`}
                        className="font-bold text-foreground hover:text-emerald-600 flex items-center gap-1"
                      >
                        <span>{stock.symbol}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <span className="text-[10px] text-muted-foreground block truncate max-w-[160px]">
                        {stock.name}
                      </span>
                    </td>
                    <td className="py-2 text-right font-mono font-semibold text-foreground">
                      {stock.price > 0 ? stock.price.toFixed(2) : "—"}
                    </td>
                    <td
                      className={cn(
                        "py-2 text-right font-mono font-bold",
                        isUp && "text-emerald-600 dark:text-emerald-400",
                        isDown && "text-red-500",
                        !isUp && !isDown && "text-blue-500"
                      )}
                    >
                      {displayChange > 0
                        ? `+${displayChange.toFixed(2)}`
                        : displayChange < 0
                        ? displayChange.toFixed(2)
                        : "0.00"}
                    </td>
                    <td
                      className={cn(
                        "py-2 text-right font-mono font-bold",
                        isUp && "text-emerald-600 dark:text-emerald-400",
                        isDown && "text-red-500",
                        !isUp && !isDown && "text-blue-500"
                      )}
                    >
                      {stock.changePercent > 0
                        ? `+${stock.changePercent.toFixed(2)}%`
                        : `${stock.changePercent.toFixed(2)}%`}
                    </td>
                    <td className="py-2 text-right font-mono text-muted-foreground hidden sm:table-cell">
                      {stock.volume ? stock.volume.toLocaleString() : "—"}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => handleRemoveStock(stock.symbol)}
                        className="p-1 text-muted-foreground/40 hover:text-red-500 transition-colors cursor-pointer"
                        title="Remove from collection"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
