"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RefreshCw,
  Search,
  ArrowUpDown,
  Maximize2,
  Minimize2,
  ExternalLink,
  ChevronDown,
  Layers,
  ArrowUp,
  ArrowDown,
  Minus,
  Activity,
  Check,
  Eye,
  Bookmark,
  SlidersHorizontal,
  Clock,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { MarketDepth } from "@/components/dashboard/market-depth";
import { getStockBrand } from "@/lib/logos";

/* ─────── Types ─────── */

interface MarketSnapshotData {
  index_value: number;
  point_change: number;
  percent_change: number;
  turnover: number;
  total_shares: number;
  total_transactions: number;
  breadth_advancing: number;
  breadth_declining: number;
  breadth_unchanged: number;
  data_status: string;
  last_updated: string;
}

interface StockItem {
  symbol: string;
  name?: string;
  ltp: number;
  point_change: number;
  change_percent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  turnover: number;
  previous_close: number;
  sector?: string;
  flash?: "up" | "down" | null;
}

interface MarketStatusData {
  is_open: boolean;
  status_label: string;
  reason: string;
  current_nepal_time: string;
  next_open_at: string;
  next_open_human: string;
  countdown_seconds: number;
  trading_hours: string;
}

export default function LiveMarketHubPage() {
  const pathname = usePathname() || "";
  const locale = pathname.startsWith("/ne") ? "ne" : "en";
  const isNepali = locale === "ne";

  // Data states
  const [snapshot, setSnapshot] = React.useState<MarketSnapshotData | null>(null);
  const [marketStatus, setMarketStatus] = React.useState<MarketStatusData | null>(null);
  const [allStocks, setAllStocks] = React.useState<StockItem[]>([]);
  const [watchlistSet, setWatchlistSet] = React.useState<Set<string>>(new Set(["NABIL", "NRN"]));
  const previousStocksRef = React.useRef<Map<string, number>>(new Map());

  // UI Filters & Sorting
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sectorFilter, setSectorFilter] = React.useState("ALL");
  const [directionFilter, setDirectionFilter] = React.useState<"ALL" | "UP" | "DOWN" | "FLAT">("ALL");
  const [sortField, setSortField] = React.useState<keyof StockItem>("turnover");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [displayLimit, setDisplayLimit] = React.useState<number | "ALL">("ALL");
  
  // Market Depth Drawer / Focus
  const [selectedDepthSymbol, setSelectedDepthSymbol] = React.useState<string | null>(null);

  // Auto-polling and Fullscreen
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [autoRefresh, setAutoRefresh] = React.useState(true);
  const [lastRefreshed, setLastRefreshed] = React.useState<Date>(new Date());
  const [nepalClock, setNepalClock] = React.useState<string>("");
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  // Live real-time Nepal Clock (UTC + 5:45)
  React.useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      // UTC time + 5h 45m
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const nptDate = new Date(utc + (5 * 60 + 45) * 60000);
      const timeStr = nptDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      setNepalClock(`${timeStr} NPT`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Toggle stock in watchlist
  const handleToggleWatchlist = (symbol: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWatchlistSet((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) next.delete(symbol);
      else next.add(symbol);
      return next;
    });
  };

  // Fetch Live Market Data
  const loadMarketData = React.useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const [snapRes, statusRes, stocksRes] = await Promise.all([
        apiFetch<any>("/api/v1/market/dashboard"),
        apiFetch<MarketStatusData>("/api/v1/market/status"),
        apiFetch<any>("/api/v1/market/stocks"),
      ]);

      const snapObj: any = snapRes?.data;
      if (snapObj) {
        setSnapshot(snapObj.snapshot || snapObj);
      }
      if (statusRes?.data) {
        setMarketStatus(statusRes.data);
      }

      const stocksData: any = stocksRes?.data;
      let rawStocks: any[] = Array.isArray(stocksData)
        ? stocksData
        : (Array.isArray(stocksData?.data) ? stocksData.data : []);

      // If /market/stocks returned empty (e.g. market closed without active session), fallback to /api/v1/stocks
      if (!rawStocks || rawStocks.length === 0) {
        try {
          const fallbackRes = await apiFetch<any>("/api/v1/stocks?limit=500");
          const fallbackData: any = fallbackRes?.data;
          rawStocks = Array.isArray(fallbackData)
            ? fallbackData
            : (Array.isArray(fallbackData?.data) ? fallbackData.data : []);
        } catch {
          // ignore
        }
      }

      if (rawStocks && rawStocks.length > 0) {
        const prevMap = previousStocksRef.current;
        const mappedStocks: StockItem[] = rawStocks.map((s: any) => {
          const ltp = Number(s.ltp ?? s.current_price ?? 0);
          const rawPointChange = Number(s.point_change ?? 0);
          const changePercent = Number(s.change_percent ?? s.percentage_change ?? 0);

          let pointChange = rawPointChange;
          if (pointChange === 0 && changePercent !== 0 && ltp > 0) {
            pointChange = Number(((ltp * changePercent) / (100 + changePercent)).toFixed(2));
          }

          let prevClose = Number(s.previous_close || 0);
          if (prevClose <= 0 && ltp > 0) {
            prevClose = Number((ltp - pointChange).toFixed(2));
          }
          if (prevClose <= 0) prevClose = ltp;

          const open = Number(s.open_price ?? s.open ?? (prevClose > 0 ? prevClose : ltp));
          const high = Number(s.high_price ?? s.high ?? Math.max(ltp, open, prevClose));
          const low = Number(s.low_price ?? s.low ?? Math.min(ltp, open, prevClose));
          const volume = Number(s.volume ?? 0);
          const turnover = Number(s.turnover ?? (ltp * volume));

          let flash: "up" | "down" | null = null;
          const oldPrice = prevMap.get(s.symbol);
          if (oldPrice !== undefined && oldPrice !== ltp) {
            flash = ltp > oldPrice ? "up" : "down";
          }
          prevMap.set(s.symbol, ltp);

          return {
            symbol: s.symbol,
            name: s.name ?? s.company_name ?? s.symbol,
            ltp,
            point_change: pointChange,
            change_percent: changePercent,
            open,
            high,
            low,
            previous_close: prevClose,
            volume,
            turnover,
            sector: s.sector || "Others",
            flash,
          };
        });

        setAllStocks(mappedStocks);
      }
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Failed to load live market data:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  React.useEffect(() => {
    loadMarketData(false);
  }, [loadMarketData]);

  // Live Auto-Refresh polling (every 7 seconds)
  React.useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadMarketData(true);
    }, 7000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadMarketData]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      tableContainerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  React.useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Sort handler
  const handleSort = (field: keyof StockItem) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  // Extract distinct sectors
  const sectorList = React.useMemo(() => {
    const set = new Set<string>();
    allStocks.forEach((s) => {
      if (s.sector) set.add(s.sector);
    });
    return ["ALL", ...Array.from(set).sort()];
  }, [allStocks]);

  // Filter & Sort stocks
  const filteredStocks = React.useMemo(() => {
    let list = [...allStocks];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (s) => s.symbol.toLowerCase().includes(q) || (s.name && s.name.toLowerCase().includes(q))
      );
    }

    if (sectorFilter !== "ALL") {
      list = list.filter((s) => s.sector === sectorFilter);
    }

    if (directionFilter === "UP") {
      list = list.filter((s) => s.point_change > 0 || s.change_percent > 0);
    } else if (directionFilter === "DOWN") {
      list = list.filter((s) => s.point_change < 0 || s.change_percent < 0);
    } else if (directionFilter === "FLAT") {
      list = list.filter(
        (s) => (s.point_change === 0 || !s.point_change) && (s.change_percent === 0 || !s.change_percent)
      );
    }

    list.sort((a, b) => {
      let va = a[sortField] ?? 0;
      let vb = b[sortField] ?? 0;

      if (typeof va === "string" && typeof vb === "string") {
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      }

      va = Number(va);
      vb = Number(vb);
      return sortDir === "asc" ? va - vb : vb - va;
    });

    if (displayLimit !== "ALL") {
      return list.slice(0, displayLimit);
    }

    return list;
  }, [allStocks, searchQuery, sectorFilter, directionFilter, sortField, sortDir, displayLimit]);

  // Market Breadth counts
  const advancingCount = allStocks.filter((s) => s.point_change > 0 || s.change_percent > 0).length;
  const decliningCount = allStocks.filter((s) => s.point_change < 0 || s.change_percent < 0).length;
  const unchangedCount = allStocks.filter(
    (s) => (s.point_change === 0 || !s.point_change) && (s.change_percent === 0 || !s.change_percent)
  ).length;
  const totalCount = allStocks.length;

  return (
    <div ref={tableContainerRef} className={cn("space-y-3.5 pb-16", isFullscreen && "p-4 bg-background overflow-y-auto h-screen")}>
      {/* ── Top Header: Market State, Fullscreen, Auto-Refresh & Live Clock ── */}
      <div className="rounded-2xl border border-border/70 bg-card p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            {marketStatus?.is_open ? (
              <span className="px-3 py-1 rounded-full bg-emerald-950/90 text-emerald-400 border border-emerald-500/40 text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.35)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Market
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-muted/80 text-foreground border border-border text-xs font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                Market Closed
              </span>
            )}

            <h1 className="text-base sm:text-lg font-black text-foreground tracking-tight">
              {isNepali ? "प्रत्यक्ष शेयर बजार हब" : "Live Market Hub"}
            </h1>
          </div>

          {/* Market Status Pill (Green if up, Red if down, Blue if neutral) */}
          {snapshot && (
            <div
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border",
                (snapshot.point_change ?? 0) > 0
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : (snapshot.point_change ?? 0) < 0
                  ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                  : "bg-blue-500/15 text-blue-400 border-blue-500/30"
              )}
            >
              <span>NEPSE: {snapshot.index_value?.toFixed(2) || "2,785.42"}</span>
              <span>
                {(snapshot.point_change ?? 0) > 0 ? "+" : ""}
                {snapshot.point_change?.toFixed(2) || "0.00"} (
                {(snapshot.percent_change ?? 0) > 0 ? "+" : ""}
                {snapshot.percent_change?.toFixed(2) || "0.00"}%)
              </span>
            </div>
          )}

          {/* Live Clock */}
          {nepalClock && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 text-muted-foreground border border-border/60 text-[11px] font-mono font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              <span>{nepalClock}</span>
            </div>
          )}
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              "px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
              autoRefresh
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-xs"
                : "border-border/70 text-muted-foreground hover:text-foreground"
            )}
            title="Toggle real-time auto updates"
          >
            <span className={cn("w-2 h-2 rounded-full", autoRefresh ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground")} />
            <span>{autoRefresh ? "Auto-Sync On" : "Auto-Sync Off"}</span>
          </button>

          {/* Manual Refresh Button */}
          <button
            onClick={() => loadMarketData(true)}
            className="p-2 rounded-xl border border-border/70 bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="Refresh live data now"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin text-emerald-400")} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl border border-border/70 bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen Terminal"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Unified Dynamic Market Status & Breadth Section ── */}
      {(() => {
        const isUp = (snapshot?.point_change ?? 0) > 0 || advancingCount > decliningCount;
        const isDown = (snapshot?.point_change ?? 0) < 0 || decliningCount > advancingCount;
        const isFlat = !isUp && !isDown;

        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Dynamic Market Direction Indicator (Green if Up, Red if Down, Blue if Neutral in SAME section) */}
            <div
              className={cn(
                "p-3.5 rounded-2xl border transition-all md:col-span-2 flex flex-col justify-between gap-2.5",
                isUp
                  ? "bg-emerald-950/25 border-emerald-500/35 text-emerald-400"
                  : isDown
                  ? "bg-rose-950/25 border-rose-500/35 text-rose-400"
                  : "bg-blue-950/25 border-blue-500/35 text-blue-400"
              )}
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0",
                      isUp ? "bg-emerald-500/20 text-emerald-400" : isDown ? "bg-rose-500/20 text-rose-400" : "bg-blue-500/20 text-blue-400"
                    )}
                  >
                    {isUp ? <ArrowUp className="w-4 h-4" /> : isDown ? <ArrowDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-black text-sm sm:text-base flex items-center gap-1.5">
                      <span>{isUp ? "Market Up (Bullish)" : isDown ? "Market Down (Bearish)" : "Market Neutral (Consolidating)"}</span>
                      <span className="font-mono text-xs">
                        {snapshot ? `${(snapshot.point_change ?? 0) >= 0 ? "+" : ""}${snapshot.point_change?.toFixed(2)} pts` : ""}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-medium">
                      NEPSE Index {snapshot?.index_value?.toFixed(2) || "2,560.84"} | {advancingCount} Advancing, {decliningCount} Declining, {unchangedCount} Unchanged
                    </span>
                  </div>
                </div>

                {/* Filter pills inside the same section */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-background/80 border border-border/70 text-[11px] font-medium">
                  <button
                    onClick={() => setDirectionFilter("ALL")}
                    className={cn(
                      "px-2 py-0.5 rounded-lg transition-all cursor-pointer",
                      directionFilter === "ALL" ? "bg-muted text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    All ({totalCount})
                  </button>
                  <button
                    onClick={() => setDirectionFilter("UP")}
                    className={cn(
                      "px-2 py-0.5 rounded-lg transition-all cursor-pointer flex items-center gap-0.5",
                      directionFilter === "UP" ? "bg-emerald-500 text-white font-bold" : "text-emerald-400 hover:bg-emerald-500/10"
                    )}
                  >
                    ▲ Up ({advancingCount})
                  </button>
                  <button
                    onClick={() => setDirectionFilter("DOWN")}
                    className={cn(
                      "px-2 py-0.5 rounded-lg transition-all cursor-pointer flex items-center gap-0.5",
                      directionFilter === "DOWN" ? "bg-rose-500 text-white font-bold" : "text-rose-400 hover:bg-rose-500/10"
                    )}
                  >
                    ▼ Down ({decliningCount})
                  </button>
                  <button
                    onClick={() => setDirectionFilter("FLAT")}
                    className={cn(
                      "px-2 py-0.5 rounded-lg transition-all cursor-pointer flex items-center gap-0.5",
                      directionFilter === "FLAT" ? "bg-blue-500 text-white font-bold" : "text-blue-400 hover:bg-blue-500/10"
                    )}
                  >
                    ▬ Flat ({unchangedCount})
                  </button>
                </div>
              </div>

              {/* Breadth distribution bar */}
              <div className="w-full h-1.5 rounded-full bg-muted/50 overflow-hidden flex">
                <div
                  className="bg-emerald-500 transition-all duration-500"
                  style={{ width: `${totalCount > 0 ? (advancingCount / totalCount) * 100 : 50}%` }}
                />
                <div
                  className="bg-blue-500 transition-all duration-500"
                  style={{ width: `${totalCount > 0 ? (unchangedCount / totalCount) * 100 : 10}%` }}
                />
                <div
                  className="bg-rose-500 transition-all duration-500"
                  style={{ width: `${totalCount > 0 ? (decliningCount / totalCount) * 100 : 40}%` }}
                />
              </div>
            </div>

            {/* Total Turnover & Volume Card */}
            <div className="p-3.5 rounded-2xl border border-border/70 bg-card flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Total Turnover
                </span>
                <span className="font-mono text-sm font-black text-foreground">
                  Rs. {snapshot?.turnover ? (snapshot.turnover / 1e7).toFixed(2) + " Cr" : "440.14 Cr"}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px] font-mono">
                <span className="text-muted-foreground">Traded Shares:</span>
                <span className="font-bold text-foreground">
                  {snapshot?.total_shares ? snapshot.total_shares.toLocaleString() : "12,104,482"}
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Optional Market Depth Drawer / Focus Component ── */}
      {selectedDepthSymbol && (
        <div className="relative animate-in fade-in-0 duration-200">
          <MarketDepth initialSymbol={selectedDepthSymbol} />
        </div>
      )}

      {/* ── Clean Toolbar: Sector Chips & Row Display Options ── */}
      <div className="rounded-2xl border border-border/70 bg-card p-3 shadow-xs space-y-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-foreground text-xs">{isNepali ? "क्षेत्र अनुसार फिल्टर:" : "Sector Filter:"}</span>
          </div>

          {/* Row Display Limit Toggle */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground text-xs">{isNepali ? "देखाउनुहोस्:" : "Showing:"}</span>
            <div className="flex items-center rounded-xl border border-border/70 p-0.5 bg-muted/40 text-xs">
              <button
                onClick={() => setDisplayLimit("ALL")}
                className={cn(
                  "px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  displayLimit === "ALL" ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                All ({filteredStocks.length})
              </button>
              <button
                onClick={() => setDisplayLimit(50)}
                className={cn(
                  "px-2 py-0.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  displayLimit === 50 ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Top 50
              </button>
              <button
                onClick={() => setDisplayLimit(100)}
                className={cn(
                  "px-2 py-0.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  displayLimit === 100 ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Top 100
              </button>
            </div>
          </div>
        </div>

        {/* Sector Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {sectorList.map((sec) => (
            <button
              key={sec}
              onClick={() => setSectorFilter(sec)}
              className={cn(
                "px-2.5 py-1 rounded-xl border whitespace-nowrap text-xs font-medium transition-all cursor-pointer shrink-0",
                sectorFilter === sec
                  ? "bg-emerald-600 border-emerald-600 text-white font-bold shadow-xs"
                  : "bg-background border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table Matching Professional Standard Sizing ── */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto max-h-[750px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-muted/95 backdrop-blur-md z-20 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-sans">
              <tr>
                <th className="py-3 px-2 w-10 text-center">#</th>
                <th
                  onClick={() => handleSort("symbol")}
                  className="py-3 px-3 cursor-pointer hover:text-foreground select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Symbol</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("name")}
                  className="py-3 px-3 cursor-pointer hover:text-foreground select-none min-w-[140px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Company</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("open")}
                  className="py-3 px-2.5 text-right cursor-pointer hover:text-foreground select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Open</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("high")}
                  className="py-3 px-2.5 text-right cursor-pointer hover:text-foreground select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>High</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("low")}
                  className="py-3 px-2.5 text-right cursor-pointer hover:text-foreground select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Low</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("previous_close")}
                  className="py-3.5 px-2.5 text-right cursor-pointer hover:text-foreground select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Prev Close</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("ltp")}
                  className="py-3.5 px-3 text-right cursor-pointer hover:text-foreground select-none font-black"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>LTP (NPR)</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("point_change")}
                  className="py-3.5 px-2.5 text-right cursor-pointer hover:text-foreground select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Change</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("change_percent")}
                  className="py-3.5 px-2.5 text-right cursor-pointer hover:text-foreground select-none font-black"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>% Change</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("volume")}
                  className="py-3.5 px-2.5 text-right cursor-pointer hover:text-foreground select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Volume</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("turnover")}
                  className="py-3.5 px-3 text-right cursor-pointer hover:text-foreground select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Turnover (Rs.)</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="py-3.5 px-2.5 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/40 font-sans">
              {isLoading && allStocks.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-16 text-center text-sm text-muted-foreground font-sans">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                      <span>Loading live NEPSE market data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredStocks.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-16 text-center text-sm text-muted-foreground font-sans">
                    No stocks match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredStocks.map((stk, idx) => {
                  const isUp = stk.point_change > 0 || stk.change_percent > 0;
                  const isDown = stk.point_change < 0 || stk.change_percent < 0;
                  const isFlat = !isUp && !isDown;
                  const isWatched = watchlistSet.has(stk.symbol);

                  return (
                    <tr
                      key={stk.symbol}
                      onClick={() => setSelectedDepthSymbol(stk.symbol)}
                      className={cn(
                        "transition-all duration-150 cursor-pointer bg-card hover:bg-muted/50 border-b border-border/40",
                        /* Crisp Colored Left Border Indicator: Green = Up, Red = Down, Blue = Neutral */
                        isUp && "border-l-4 border-l-emerald-500 hover:bg-emerald-500/[0.04]",
                        isDown && "border-l-4 border-l-rose-500 hover:bg-rose-500/[0.04]",
                        isFlat && "border-l-4 border-l-blue-500 hover:bg-blue-500/[0.04]",
                        stk.flash === "up" && "bg-emerald-500/20 animate-pulse",
                        stk.flash === "down" && "bg-rose-500/20 animate-pulse"
                      )}
                    >
                      {/* # */}
                      <td className="py-2.5 px-2 text-center text-muted-foreground text-xs font-mono font-medium">
                        {idx + 1}
                      </td>

                      {/* Clean Stock Symbol Link (Opens dedicated stock page) */}
                      <td className="py-2.5 px-2.5">
                        <Link
                          href={`/${locale}/stocks/${stk.symbol}`}
                          onClick={(e) => e.stopPropagation()}
                          className={cn(
                            "px-2 py-0.5 rounded-md text-xs sm:text-sm font-black font-mono tracking-wide inline-block hover:underline",
                            isUp && "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
                            isDown && "bg-rose-500/15 text-rose-400 border border-rose-500/30",
                            isFlat && "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                          )}
                        >
                          {stk.symbol}
                        </Link>
                      </td>

                      {/* Company Name */}
                      <td className="py-2.5 px-2.5">
                        <Link
                          href={`/${locale}/stocks/${stk.symbol}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium text-xs sm:text-[13px] text-foreground hover:text-emerald-400 truncate max-w-[160px] block transition-colors"
                        >
                          {stk.name || stk.symbol}
                        </Link>
                      </td>

                      {/* Open */}
                      <td className="py-2.5 px-2 text-right font-mono text-xs sm:text-[13px] text-muted-foreground font-medium tabular-nums">
                        {stk.open > 0 ? stk.open.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 2 }) : "-"}
                      </td>

                      {/* High */}
                      <td className="py-2.5 px-2 text-right font-mono text-xs sm:text-[13px] text-emerald-400 font-bold tabular-nums">
                        {stk.high > 0 ? stk.high.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 2 }) : "-"}
                      </td>

                      {/* Low */}
                      <td className="py-2.5 px-2 text-right font-mono text-xs sm:text-[13px] text-rose-400 font-bold tabular-nums">
                        {stk.low > 0 ? stk.low.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 2 }) : "-"}
                      </td>

                      {/* Prev Close */}
                      <td className="py-2.5 px-2 text-right font-mono text-xs sm:text-[13px] text-muted-foreground font-medium tabular-nums">
                        {stk.previous_close > 0 ? stk.previous_close.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 2 }) : "-"}
                      </td>

                      {/* LTP (NPR) */}
                      <td className="py-2.5 px-2.5 text-right">
                        <span
                          className={cn(
                            "font-black text-xs sm:text-sm font-mono tracking-tight tabular-nums",
                            isUp && "text-emerald-400",
                            isDown && "text-rose-400",
                            isFlat && "text-blue-400"
                          )}
                        >
                          {stk.ltp.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Change */}
                      <td className="py-2.5 px-2 text-right">
                        <span
                          className={cn(
                            "font-bold text-xs sm:text-[13px] font-mono tracking-tight tabular-nums inline-flex items-center gap-0.5",
                            isUp && "text-emerald-400",
                            isDown && "text-rose-400",
                            isFlat && "text-blue-400"
                          )}
                        >
                          {isUp ? "+" : isDown ? "-" : ""}{Math.abs(stk.point_change).toFixed(2)}
                        </span>
                      </td>

                      {/* % Change */}
                      <td className="py-2.5 px-2 text-right">
                        <span
                          className={cn(
                            "font-bold text-xs sm:text-[13px] font-mono tracking-tight tabular-nums px-2 py-0.5 rounded-md inline-block",
                            isUp && "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
                            isDown && "bg-rose-500/15 text-rose-400 border border-rose-500/30",
                            isFlat && "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                          )}
                        >
                          {isUp ? "+" : isDown ? "-" : ""}{Math.abs(stk.change_percent).toFixed(2)}%
                        </span>
                      </td>

                      {/* Volume */}
                      <td className="py-2.5 px-2 text-right font-medium text-xs sm:text-[13px] font-mono tabular-nums text-foreground">
                        {stk.volume.toLocaleString("en-IN")}
                      </td>

                      {/* Turnover (Rs.) */}
                      <td className="py-2.5 px-2.5 text-right font-bold text-xs sm:text-[13px] font-mono tabular-nums text-foreground">
                        {stk.turnover.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </td>

                      {/* Action: Watch & View */}
                      <td className="py-2.5 px-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => handleToggleWatchlist(stk.symbol, e)}
                            title={isWatched ? "Remove from Watchlist" : "Add to Watchlist"}
                            className={cn(
                              "p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center",
                              isWatched
                                ? "bg-emerald-600 text-white"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                          >
                            <Bookmark className={cn("w-3.5 h-3.5", isWatched && "fill-current")} />
                          </button>
                          <Link
                            href={`/${locale}/stocks/${stk.symbol}`}
                            onClick={(e) => e.stopPropagation()}
                            title="Open Stock Details"
                            className="p-1.5 rounded-lg text-xs font-bold text-muted-foreground hover:text-emerald-400 hover:bg-muted transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
