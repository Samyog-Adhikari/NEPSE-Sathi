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
  SlidersHorizontal,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { MarketDepth } from "@/components/dashboard/market-depth";

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
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const tableContainerRef = React.useRef<HTMLDivElement>(null);

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
      const rawStocks: any[] = Array.isArray(stocksData)
        ? stocksData
        : (Array.isArray(stocksData?.data) ? stocksData.data : []);

      if (rawStocks && rawStocks.length > 0) {
        const prevMap = previousStocksRef.current;
        const mappedStocks: StockItem[] = rawStocks.map((s: any) => {
          const ltp = Number(s.ltp ?? s.current_price ?? 0);
          const rawPointChange = Number(s.point_change ?? 0);
          const changePercent = Number(s.change_percent ?? s.percentage_change ?? 0);

          // If point_change is 0 but percent change is present, calculate exact point delta
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

          // Check if price changed since last poll for flash animation
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

    // Search query (if provided via props/topbar)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (s) => s.symbol.toLowerCase().includes(q) || (s.name && s.name.toLowerCase().includes(q))
      );
    }

    // Sector filter
    if (sectorFilter !== "ALL") {
      list = list.filter((s) => s.sector === sectorFilter);
    }

    // Direction filter (UP / DOWN / FLAT)
    if (directionFilter === "UP") {
      list = list.filter((s) => s.point_change > 0 || s.change_percent > 0);
    } else if (directionFilter === "DOWN") {
      list = list.filter((s) => s.point_change < 0 || s.change_percent < 0);
    } else if (directionFilter === "FLAT") {
      list = list.filter(
        (s) => (s.point_change === 0 || !s.point_change) && (s.change_percent === 0 || !s.change_percent)
      );
    }

    // Sorting
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

    // Display limit (All stocks vs limited)
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
    <div ref={tableContainerRef} className={cn("space-y-3 pb-12", isFullscreen && "p-4 bg-background overflow-y-auto h-screen")}>
      {/* ── Top Header: Market State, Fullscreen, Auto-Refresh & Live Indicator ── */}
      <div className="rounded-xl border border-border/70 bg-card p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            {/* Glowing Neon Live Badge */}
            {marketStatus?.is_open ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/90 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold tracking-wide flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.35)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Market
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 text-[11px] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-zinc-400" />
                Market Closed
              </span>
            )}

            <h1 className="text-sm sm:text-base font-black text-foreground tracking-tight">
              {isNepali ? "प्रत्यक्ष शेयर बजार हब" : "Live Market Hub"}
            </h1>
          </div>

          <span className="text-[11px] text-muted-foreground font-mono">
            ({totalCount > 0 ? totalCount : "360+"} {isNepali ? "कम्पनीहरू" : "Equities Available"})
          </span>
        </div>

        {/* Right Tools: Auto-poll toggle, Manual refresh, Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              "px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
              autoRefresh
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "border-border/70 text-muted-foreground hover:text-foreground"
            )}
            title="Toggle real-time auto updates"
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", autoRefresh ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground")} />
            <span>{autoRefresh ? "Auto-Sync On" : "Auto-Sync Off"}</span>
          </button>

          {/* Manual Refresh Button */}
          <button
            onClick={() => loadMarketData(true)}
            className="p-1.5 rounded-lg border border-border/70 bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="Refresh live data now"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin text-emerald-600")} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg border border-border/70 bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen Terminal"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ── Market Breadth Summary Bar (Advances, Declines, Unchanged) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {/* Advances (Up - Green) */}
        <button
          onClick={() => setDirectionFilter(directionFilter === "UP" ? "ALL" : "UP")}
          className={cn(
            "p-2.5 rounded-xl border transition-all text-left cursor-pointer",
            directionFilter === "UP"
              ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500"
              : "bg-card border-border/70 hover:border-emerald-500/40"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <ArrowUp className="w-3 h-3" /> Advances (Up)
            </span>
            <span className="font-mono text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
              {advancingCount}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {totalCount > 0 ? ((advancingCount / totalCount) * 100).toFixed(1) : 0}% of market
          </p>
        </button>

        {/* Declines (Down - Red) */}
        <button
          onClick={() => setDirectionFilter(directionFilter === "DOWN" ? "ALL" : "DOWN")}
          className={cn(
            "p-2.5 rounded-xl border transition-all text-left cursor-pointer",
            directionFilter === "DOWN"
              ? "bg-rose-500/15 border-rose-500 text-rose-500 ring-1 ring-rose-500"
              : "bg-card border-border/70 hover:border-rose-500/40"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1">
              <ArrowDown className="w-3 h-3" /> Declines (Down)
            </span>
            <span className="font-mono text-sm font-extrabold text-rose-500">
              {decliningCount}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {totalCount > 0 ? ((decliningCount / totalCount) * 100).toFixed(1) : 0}% of market
          </p>
        </button>

        {/* Unchanged (Neutral - Blue) */}
        <button
          onClick={() => setDirectionFilter(directionFilter === "FLAT" ? "ALL" : "FLAT")}
          className={cn(
            "p-2.5 rounded-xl border transition-all text-left cursor-pointer",
            directionFilter === "FLAT"
              ? "bg-blue-500/15 border-blue-500 text-blue-500 ring-1 ring-blue-500"
              : "bg-card border-border/70 hover:border-blue-500/40"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1">
              <Minus className="w-3 h-3" /> Unchanged (Neutral)
            </span>
            <span className="font-mono text-sm font-extrabold text-blue-500">
              {unchangedCount}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {totalCount > 0 ? ((unchangedCount / totalCount) * 100).toFixed(1) : 0}% of market
          </p>
        </button>

        {/* Total Turnover */}
        <div className="p-2.5 rounded-xl border border-border/70 bg-card">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Turnover
            </span>
            <span className="font-mono text-xs font-extrabold text-foreground">
              Rs. {snapshot?.turnover ? (snapshot.turnover / 1e7).toFixed(2) + " Cr" : "0.00"}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Vol: {snapshot?.total_shares ? snapshot.total_shares.toLocaleString() : "0"}
          </p>
        </div>
      </div>

      {/* ── Optional Market Depth Drawer / Focus Component ── */}
      {selectedDepthSymbol && (
        <div className="relative animate-in fade-in-0 duration-200">
          <MarketDepth initialSymbol={selectedDepthSymbol} />
          <button
            onClick={() => setSelectedDepthSymbol(null)}
            className="absolute top-3 right-3 text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Close Depth
          </button>
        </div>
      )}

      {/* ── Clean Toolbar: Sector Chips & Row Display Options (No Duplicate Search) ── */}
      <div className="rounded-xl border border-border/70 bg-card p-3 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold text-foreground">{isNepali ? "क्षेत्र अनुसार फिल्टर:" : "Sector Filter:"}</span>
          </div>

          {/* Row Display Limit Toggle (All vs 50 vs 100) */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground text-[11px]">{isNepali ? "देखाउनुहोस्:" : "Showing:"}</span>
            <div className="flex items-center rounded-lg border border-border/70 p-0.5 bg-muted/40 text-[11px]">
              <button
                onClick={() => setDisplayLimit("ALL")}
                className={cn(
                  "px-2.5 py-0.5 rounded font-bold transition-all cursor-pointer",
                  displayLimit === "ALL" ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                All ({filteredStocks.length})
              </button>
              <button
                onClick={() => setDisplayLimit(50)}
                className={cn(
                  "px-2 py-0.5 rounded font-semibold transition-all cursor-pointer",
                  displayLimit === 50 ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Top 50
              </button>
              <button
                onClick={() => setDisplayLimit(100)}
                className={cn(
                  "px-2 py-0.5 rounded font-semibold transition-all cursor-pointer",
                  displayLimit === 100 ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Top 100
              </button>
            </div>
          </div>
        </div>

        {/* Sector Filter Chips Horizontal Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
          {sectorList.map((sec) => (
            <button
              key={sec}
              onClick={() => setSectorFilter(sec)}
              className={cn(
                "px-2.5 py-1 rounded-lg border whitespace-nowrap font-medium transition-all cursor-pointer shrink-0",
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

      {/* ── Data-Dense Live Market Table (All Stocks on One Page) ── */}
      <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto max-h-[750px] overflow-y-auto divide-y divide-border/40">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-muted/95 backdrop-blur-md z-20 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th
                  onClick={() => handleSort("symbol")}
                  className="py-2.5 px-3 cursor-pointer hover:text-foreground select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Symbol</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("ltp")}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-foreground select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>LTP (NPR)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("point_change")}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-foreground select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Change</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("change_percent")}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-foreground select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>% Change</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("open")}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-foreground select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Open</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("high")}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-foreground select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>High</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("low")}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-foreground select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Low</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("previous_close")}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-foreground select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Prev. Close</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("volume")}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-foreground select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Qty (Vol)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("turnover")}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-foreground select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Turnover</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-center">Depth</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/25 font-mono">
              {isLoading && allStocks.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-xs text-muted-foreground font-sans">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                      <span>Loading live NEPSE market data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredStocks.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-xs text-muted-foreground font-sans">
                    No stocks match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredStocks.map((stk, idx) => {
                  const isUp = stk.point_change > 0 || stk.change_percent > 0;
                  const isDown = stk.point_change < 0 || stk.change_percent < 0;
                  const isFlat = !isUp && !isDown;

                  return (
                    <tr
                      key={stk.symbol}
                      className={cn(
                        "transition-colors duration-150 border-b border-border/40",
                        /* High-contrast easily separable row styling: Green if UP, Red if DOWN, Blue if NOT TOUCHED */
                        isUp && "bg-emerald-950/25 hover:bg-emerald-900/40 border-l-4 border-l-emerald-500",
                        isDown && "bg-rose-950/25 hover:bg-rose-900/40 border-l-4 border-l-rose-500",
                        isFlat && "bg-blue-950/25 hover:bg-blue-900/40 border-l-4 border-l-blue-500",
                        stk.flash === "up" && "bg-emerald-500/35 animate-pulse",
                        stk.flash === "down" && "bg-rose-500/35 animate-pulse"
                      )}
                    >
                      {/* # SN */}
                      <td className="py-2.5 px-3 text-center text-muted-foreground text-[10px] font-mono">
                        {idx + 1}
                      </td>

                      {/* Symbol & Name */}
                      <td className="py-2.5 px-3 font-sans">
                        <Link
                          href={`/${locale}/stocks/${stk.symbol}`}
                          className="font-mono font-bold text-xs text-foreground hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
                        >
                          <span className={cn(
                            "font-black tracking-wide",
                            isUp && "text-emerald-400",
                            isDown && "text-rose-400",
                            isFlat && "text-blue-400"
                          )}>{stk.symbol}</span>
                          {stk.sector && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-normal truncate max-w-[90px]">
                              {stk.sector}
                            </span>
                          )}
                        </Link>
                        {stk.name && stk.name !== stk.symbol && (
                          <span className="block text-[10px] text-muted-foreground truncate max-w-[160px]">
                            {stk.name}
                          </span>
                        )}
                      </td>

                      {/* LTP (NPR) */}
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={cn(
                            "font-black text-xs font-mono",
                            isUp && "text-emerald-400",
                            isDown && "text-rose-400",
                            isFlat && "text-blue-400"
                          )}
                        >
                          {stk.ltp.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Point Change */}
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={cn(
                            "font-bold text-xs font-mono inline-flex items-center gap-0.5",
                            isUp && "text-emerald-400",
                            isDown && "text-rose-400",
                            isFlat && "text-blue-400"
                          )}
                        >
                          {isUp ? "+" : ""}{stk.point_change.toFixed(2)}
                        </span>
                      </td>

                      {/* % Change Pill */}
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-md text-[11px] font-extrabold font-mono inline-block min-w-[56px] text-center shadow-xs",
                            isUp && "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
                            isDown && "bg-rose-500/20 text-rose-300 border border-rose-500/40",
                            isFlat && "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                          )}
                        >
                          {isUp ? "+" : ""}{stk.change_percent.toFixed(2)}%
                        </span>
                      </td>

                      {/* Open */}
                      <td className="py-2.5 px-3 text-right text-muted-foreground font-mono text-xs">
                        {stk.open > 0 ? stk.open.toFixed(2) : "-"}
                      </td>

                      {/* High */}
                      <td className="py-2.5 px-3 text-right text-emerald-400 font-mono font-semibold text-xs">
                        {stk.high > 0 ? stk.high.toFixed(2) : "-"}
                      </td>

                      {/* Low */}
                      <td className="py-2.5 px-3 text-right text-rose-400 font-mono font-semibold text-xs">
                        {stk.low > 0 ? stk.low.toFixed(2) : "-"}
                      </td>

                      {/* Prev Close */}
                      <td className="py-2.5 px-3 text-right text-muted-foreground font-mono text-xs">
                        {stk.previous_close > 0 ? stk.previous_close.toFixed(2) : stk.ltp.toFixed(2)}
                      </td>

                      {/* Volume */}
                      <td className="py-2.5 px-3 text-right text-foreground font-medium font-mono text-xs">
                        {stk.volume.toLocaleString("en-IN")}
                      </td>

                      {/* Turnover */}
                      <td className="py-2.5 px-3 text-right text-foreground font-bold font-mono text-xs">
                        {stk.turnover > 1e7
                          ? `Rs. ${(stk.turnover / 1e7).toFixed(2)} Cr`
                          : `Rs. ${stk.turnover.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                      </td>

                      {/* Market Depth Trigger */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => setSelectedDepthSymbol(stk.symbol)}
                          className="px-2.5 py-1 rounded-md text-[10px] font-sans font-bold bg-muted/80 hover:bg-emerald-500/20 hover:text-emerald-400 text-muted-foreground transition-all cursor-pointer border border-border/50"
                          title="Open Market Depth Order Book"
                        >
                          Depth
                        </button>
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
