"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  BarChart3,
  DollarSign,
  Activity,
  Layers,
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  Check,
  Plus,
  ExternalLink,
  ChevronRight,
  Sparkles,
  PieChart,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { NepseTradingChart, ChartPoint } from "@/components/dashboard/nepse-trading-chart";

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
  open?: number;
  high?: number;
  low?: number;
  volume: number;
  turnover: number;
  sector?: string;
}

interface TopMoversData {
  gainers: StockItem[];
  losers: StockItem[];
  active: StockItem[];
  by_volume: StockItem[];
  by_turnover: StockItem[];
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

interface SectorData {
  sector_name: string;
  index_value: number;
  point_change: number;
  percent_change: number;
}

export default function LiveMarketHubPage() {
  const pathname = usePathname() || "";
  const locale = pathname.startsWith("/ne") ? "ne" : "en";
  const isNepali = locale === "ne";

  // Data states
  const [snapshot, setSnapshot] = React.useState<MarketSnapshotData | null>(null);
  const [topMovers, setTopMovers] = React.useState<TopMoversData | null>(null);
  const [marketStatus, setMarketStatus] = React.useState<MarketStatusData | null>(null);
  const [sectors, setSectors] = React.useState<SectorData[]>([]);
  const [allStocks, setAllStocks] = React.useState<StockItem[]>([]);
  const [chartPoints, setChartPoints] = React.useState<ChartPoint[]>([]);

  // UI / Filter states
  const [activeTimeframe, setActiveTimeframe] = React.useState<string>("1D");
  const [selectedSector, setSelectedSector] = React.useState<string>("ALL");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [stockFilter, setStockFilter] = React.useState<"all" | "gainers" | "losers" | "unchanged">("all");
  const [activeMoverTab, setActiveMoverTab] = React.useState<"gainers" | "losers" | "turnover" | "volume">("gainers");
  const [sortField, setSortField] = React.useState<keyof StockItem>("turnover");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("desc");
  const [page, setPage] = React.useState<number>(1);
  const pageSize = 20;

  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isChartLoading, setIsChartLoading] = React.useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = React.useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = React.useState<boolean>(true);
  const [addedSymbols, setAddedSymbols] = React.useState<Set<string>>(new Set());

  // Load Watchlist state from localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("nepse_user_watchlist");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setAddedSymbols(new Set(parsed));
        }
      }
    } catch {}
  }, []);

  const toggleWatchlist = (symbol: string) => {
    setAddedSymbols((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) {
        next.delete(symbol);
      } else {
        next.add(symbol);
      }
      try {
        localStorage.setItem("nepse_user_watchlist", JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  // Primary Data Load
  const fetchMarketData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [dashRes, moversRes, statusRes, sectorRes, stocksRes] = await Promise.all([
        apiFetch<any>("/api/v1/market/dashboard"),
        apiFetch<any>("/api/v1/market/top-movers"),
        apiFetch<any>("/api/v1/market/status"),
        apiFetch<any>("/api/v1/market/sectors"),
        apiFetch<any>("/api/v1/stocks?limit=300"),
      ]);

      if (dashRes.data?.snapshot) {
        setSnapshot(dashRes.data.snapshot);
      }
      if (moversRes.data?.data) {
        setTopMovers(moversRes.data.data);
      } else if (dashRes.data?.top_movers) {
        setTopMovers(dashRes.data.top_movers);
      }
      if (statusRes.data) {
        setMarketStatus(statusRes.data);
      }
      if (sectorRes.data?.data) {
        setSectors(sectorRes.data.data);
      } else if (dashRes.data?.sector_performance) {
        setSectors(dashRes.data.sector_performance);
      }
      if (stocksRes.data?.data && Array.isArray(stocksRes.data.data)) {
        setAllStocks(stocksRes.data.data);
      }
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Live market data fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Chart Data
  const fetchChartData = React.useCallback(async (tf: string) => {
    setIsChartLoading(true);
    try {
      const res = await apiFetch<any>(`/api/v1/market/chart?timeframe=${tf}`);
      if (res.data?.points) {
        setChartPoints(res.data.points);
      }
    } catch (err) {
      console.error("Chart load error:", err);
    } finally {
      setIsChartLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchMarketData();
    fetchChartData(activeTimeframe);
  }, [fetchMarketData, fetchChartData, activeTimeframe]);

  // Auto-refresh timer every 30s if enabled
  React.useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchMarketData();
      fetchChartData(activeTimeframe);
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchMarketData, fetchChartData, activeTimeframe]);

  const handleTimeframeChange = (tf: string) => {
    setActiveTimeframe(tf);
    fetchChartData(tf);
  };

  // Format helpers
  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null || isNaN(val)) return "NPR 0.00";
    if (val >= 10000000) {
      return `NPR ${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `NPR ${(val / 100000).toFixed(2)} Lakh`;
    }
    return `NPR ${val.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  };

  const formatNumber = (val?: number) => {
    if (val === undefined || val === null || isNaN(val)) return "0";
    return val.toLocaleString("en-IN");
  };

  // Filter & Sort Stocks
  const filteredStocks = React.useMemo(() => {
    return allStocks.filter((s) => {
      // Sector filter
      if (selectedSector !== "ALL") {
        const sectorMatch = s.sector?.toLowerCase() === selectedSector.toLowerCase() ||
          s.name?.toLowerCase().includes(selectedSector.toLowerCase());
        if (!sectorMatch) return false;
      }
      // Status filter
      if (stockFilter === "gainers" && s.point_change <= 0) return false;
      if (stockFilter === "losers" && s.point_change >= 0) return false;
      if (stockFilter === "unchanged" && s.point_change !== 0) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const symMatch = s.symbol.toLowerCase().includes(q);
        const nameMatch = s.name ? s.name.toLowerCase().includes(q) : false;
        if (!symMatch && !nameMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      let aVal = a[sortField] ?? 0;
      let bVal = b[sortField] ?? 0;
      if (typeof aVal === "string") aVal = (aVal as string).toLowerCase();
      if (typeof bVal === "string") bVal = (bVal as string).toLowerCase();

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [allStocks, selectedSector, stockFilter, searchQuery, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredStocks.length / pageSize) || 1;
  const paginatedStocks = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredStocks.slice(start, start + pageSize);
  }, [filteredStocks, page]);

  const handleSort = (field: keyof StockItem) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const isPositive = (snapshot?.point_change || 0) > 0;
  const isNegative = (snapshot?.point_change || 0) < 0;

  // Breadth calculation
  const totalBreadth = (snapshot?.breadth_advancing || 0) + (snapshot?.breadth_declining || 0) + (snapshot?.breadth_unchanged || 0) || 1;
  const advPct = Math.round(((snapshot?.breadth_advancing || 0) / totalBreadth) * 100);
  const decPct = Math.round(((snapshot?.breadth_declining || 0) / totalBreadth) * 100);
  const unchPct = Math.max(0, 100 - advPct - decPct);

  return (
    <div className="space-y-6 pb-12">
      {/* ── Top Header Banner ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-card/90 via-card to-card/80 border border-border/70 shadow-sm backdrop-blur-md">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>{isNepali ? "लाइभ बजार हब" : "Live Market Hub"}</span>
            </div>

            {/* Session Indicator */}
            {marketStatus?.is_open ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                {isNepali ? "बजार खुला छ" : "Market Open"}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-500 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                {isNepali ? "बजार बन्द छ (अघिल्लो सत्र)" : "Market Closed (Previous Session)"}
              </span>
            )}

            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {marketStatus?.current_nepal_time || "NPT 11:00 - 15:00"}
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isNepali ? "नेपाल स्टक एक्सचेन्ज प्रत्यक्ष कारोबार हब" : "NEPSE Live Market Terminal"}
          </h1>

          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <span>
              {marketStatus?.is_open
                ? (isNepali ? "प्रत्यक्ष टिकर र फ्लो अपडेट हुँदैछ" : "Real-time session ticker and orderflow stream active")
                : marketStatus?.reason || (isNepali ? "कारोबार सत्र सोमबार देखि शुक्रबार ११:०० देखि १५:०० सम्म हुन्छ" : "Trading session is Mon - Fri (11:00 AM - 3:00 PM NPT)")}
            </span>
            {!marketStatus?.is_open && marketStatus?.next_open_human && (
              <span className="font-semibold text-foreground/80">
                • {isNepali ? "खुल्ने समय:" : "Opens in:"} {marketStatus.next_open_human}
              </span>
            )}
          </p>
        </div>

        {/* Controls & Metrics */}
        <div className="flex items-center gap-2.5 self-start lg:self-center">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5",
              autoRefresh
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
            )}
            title="Toggle 30s Auto Refresh"
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", autoRefresh ? "bg-primary animate-pulse" : "bg-muted-foreground")} />
            {autoRefresh ? (isNepali ? "स्वचालित ३० सेकेन्ड" : "Auto Sync (30s)") : (isNepali ? "म्यानुअल" : "Manual")}
          </button>

          <button
            onClick={() => {
              fetchMarketData();
              fetchChartData(activeTimeframe);
            }}
            disabled={isLoading}
            className="p-2 rounded-xl bg-card border border-border/80 text-foreground hover:bg-muted/60 transition-all active:scale-95 disabled:opacity-50"
            title="Refresh Live Data"
          >
            <RefreshCw className={cn("w-4 h-4 text-muted-foreground", isLoading && "animate-spin text-primary")} />
          </button>

          <div className="text-right pl-3 border-l border-border/60 hidden sm:block">
            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              {isNepali ? "अपडेट समय" : "Last Sync"}
            </div>
            <div className="text-xs font-mono font-semibold text-foreground">
              {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Key Market Metric HUD Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: NEPSE Index */}
        <div className="p-4 rounded-xl bg-card border border-border/70 hover:border-border transition-all flex flex-col justify-between">
          <span className="text-xs font-medium text-muted-foreground flex items-center justify-between">
            <span>NEPSE Index</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 font-mono">Main</span>
          </span>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-foreground">
              {snapshot?.index_value ? snapshot.index_value.toFixed(2) : "..."}
            </div>
            <div className={cn(
              "text-xs font-semibold font-mono flex items-center gap-1 mt-0.5",
              isPositive ? "text-emerald-500" : isNegative ? "text-rose-500" : "text-blue-500"
            )}>
              {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : isNegative ? <ArrowDownRight className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
              <span>{isPositive ? "+" : ""}{snapshot?.point_change?.toFixed(2) || "0.00"}</span>
              <span>({isPositive ? "+" : ""}{snapshot?.percent_change?.toFixed(2) || "0.00"}%)</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Turnover */}
        <div className="p-4 rounded-xl bg-card border border-border/70 hover:border-border transition-all flex flex-col justify-between">
          <span className="text-xs font-medium text-muted-foreground flex items-center justify-between">
            <span>{isNepali ? "कुल कारोबार" : "Total Turnover"}</span>
            <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
          </span>
          <div className="mt-2">
            <div className="text-lg font-bold font-mono text-foreground truncate">
              {formatCurrency(snapshot?.turnover)}
            </div>
            <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
              {snapshot?.turnover ? `NPR ${snapshot.turnover.toLocaleString("en-IN")}` : "..."}
            </div>
          </div>
        </div>

        {/* Card 3: Total Shares Traded */}
        <div className="p-4 rounded-xl bg-card border border-border/70 hover:border-border transition-all flex flex-col justify-between">
          <span className="text-xs font-medium text-muted-foreground flex items-center justify-between">
            <span>{isNepali ? "कुल कित्ता" : "Total Shares"}</span>
            <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
          </span>
          <div className="mt-2">
            <div className="text-lg font-bold font-mono text-foreground">
              {formatNumber(snapshot?.total_shares)}
            </div>
            <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
              {isNepali ? "कारोबार भएका कित्ताहरू" : "Units Traded"}
            </div>
          </div>
        </div>

        {/* Card 4: Total Transactions */}
        <div className="p-4 rounded-xl bg-card border border-border/70 hover:border-border transition-all flex flex-col justify-between">
          <span className="text-xs font-medium text-muted-foreground flex items-center justify-between">
            <span>{isNepali ? "कारोबार संख्या" : "Total Trades"}</span>
            <Activity className="w-3.5 h-3.5 text-muted-foreground" />
          </span>
          <div className="mt-2">
            <div className="text-lg font-bold font-mono text-foreground">
              {formatNumber(snapshot?.total_transactions)}
            </div>
            <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
              {isNepali ? "सम्पन्न अर्डरहरू" : "Executed Transactions"}
            </div>
          </div>
        </div>

        {/* Card 5 & 6 (Span 2): Market Breadth Bar */}
        <div className="col-span-2 p-4 rounded-xl bg-card border border-border/70 hover:border-border transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {isNepali ? "बजार चौडाइ (मार्केट ब्रेड्थ)" : "Market Breadth (Adv / Dec / Flat)"}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              {snapshot?.breadth_advancing || 0} / {snapshot?.breadth_declining || 0} / {snapshot?.breadth_unchanged || 0}
            </span>
          </div>

          <div className="mt-2 space-y-1.5">
            {/* Split Progress Bar */}
            <div className="w-full h-2 rounded-full overflow-hidden bg-muted/40 flex">
              <div
                style={{ width: `${advPct}%` }}
                className="h-full bg-emerald-500 transition-all duration-500"
                title={`Advancing: ${snapshot?.breadth_advancing || 0} (${advPct}%)`}
              />
              <div
                style={{ width: `${unchPct}%` }}
                className="h-full bg-blue-500 transition-all duration-500"
                title={`Unchanged: ${snapshot?.breadth_unchanged || 0} (${unchPct}%)`}
              />
              <div
                style={{ width: `${decPct}%` }}
                className="h-full bg-rose-500 transition-all duration-500"
                title={`Declining: ${snapshot?.breadth_declining || 0} (${decPct}%)`}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-emerald-500 font-semibold flex items-center gap-0.5">
                ▲ {snapshot?.breadth_advancing || 0} ({advPct}%)
              </span>
              <span className="text-blue-500 font-semibold flex items-center gap-0.5">
                ■ {snapshot?.breadth_unchanged || 0} ({unchPct}%)
              </span>
              <span className="text-rose-500 font-semibold flex items-center gap-0.5">
                ▼ {snapshot?.breadth_declining || 0} ({decPct}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Workstation: Chart & Top Movers ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Interactive Advanced Trading Chart */}
        <div className="lg:col-span-8">
          <NepseTradingChart
            initialTimeframe={activeTimeframe}
            onTimeframeChange={handleTimeframeChange}
            indexValue={snapshot?.index_value || 0}
            pointChange={snapshot?.point_change || 0}
            percentChange={snapshot?.percent_change || 0}
            turnover={snapshot?.turnover || 0}
            totalShares={snapshot?.total_shares || 0}
            points={chartPoints}
            isLoading={isChartLoading}
          />
        </div>

        {/* Right 4 Cols: Top Movers & Liquidity Leaders */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-card border border-border/70 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h2 className="text-base font-bold text-foreground flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-primary" />
                {isNepali ? "बजारका मुख्य संवाहकहरू" : "Market Leaders"}
              </h2>
            </div>

            {/* Tabs: Gainers / Losers / Turnover / Volume */}
            <div className="grid grid-cols-4 gap-1 p-1 mt-3 bg-muted/40 rounded-xl border border-border/60">
              <button
                onClick={() => setActiveMoverTab("gainers")}
                className={cn(
                  "py-1.5 text-xs font-semibold rounded-lg transition-all",
                  activeMoverTab === "gainers"
                    ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isNepali ? "बढ्ने" : "Gainers"}
              </button>
              <button
                onClick={() => setActiveMoverTab("losers")}
                className={cn(
                  "py-1.5 text-xs font-semibold rounded-lg transition-all",
                  activeMoverTab === "losers"
                    ? "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isNepali ? "घट्ने" : "Losers"}
              </button>
              <button
                onClick={() => setActiveMoverTab("turnover")}
                className={cn(
                  "py-1.5 text-xs font-semibold rounded-lg transition-all",
                  activeMoverTab === "turnover"
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isNepali ? "कारोबार" : "Turnover"}
              </button>
              <button
                onClick={() => setActiveMoverTab("volume")}
                className={cn(
                  "py-1.5 text-xs font-semibold rounded-lg transition-all",
                  activeMoverTab === "volume"
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isNepali ? "कित्ता" : "Volume"}
              </button>
            </div>

            {/* List */}
            <div className="mt-3 divide-y divide-border/50 max-h-[350px] overflow-y-auto pr-1">
              {(() => {
                const currentList =
                  activeMoverTab === "gainers"
                    ? topMovers?.gainers || []
                    : activeMoverTab === "losers"
                    ? topMovers?.losers || []
                    : activeMoverTab === "turnover"
                    ? topMovers?.by_turnover || []
                    : topMovers?.by_volume || [];

                if (currentList.length === 0) {
                  return (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      {isNepali ? "डाटा उपलब्ध छैन" : "No movers data available for current session"}
                    </div>
                  );
                }

                return currentList.slice(0, 6).map((item, idx) => {
                  const itemPositive = item.point_change > 0;
                  const itemNegative = item.point_change < 0;
                  const inWatchlist = addedSymbols.has(item.symbol);

                  return (
                    <div
                      key={item.symbol || idx}
                      className="py-2.5 flex items-center justify-between group hover:bg-muted/30 px-2 rounded-lg transition-all"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          onClick={() => toggleWatchlist(item.symbol)}
                          className={cn(
                            "p-1 rounded transition-all",
                            inWatchlist
                              ? "text-amber-500 hover:text-amber-600"
                              : "text-muted-foreground/40 hover:text-foreground"
                          )}
                          title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                        >
                          <Plus className={cn("w-3.5 h-3.5", inWatchlist && "rotate-45 text-amber-500")} />
                        </button>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs font-mono text-foreground group-hover:text-primary transition-colors">
                              {item.symbol}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate max-w-[90px]">
                              {item.name || ""}
                            </span>
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {activeMoverTab === "turnover"
                              ? formatCurrency(item.turnover)
                              : activeMoverTab === "volume"
                              ? `${formatNumber(item.volume)} shares`
                              : `${formatNumber(item.volume)} vol`}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono text-xs font-bold text-foreground">
                          NPR {item.ltp?.toFixed(1) || "0.0"}
                        </div>
                        <div
                          className={cn(
                            "text-[11px] font-mono font-semibold flex items-center justify-end gap-0.5",
                            itemPositive
                              ? "text-emerald-500"
                              : itemNegative
                              ? "text-rose-500"
                              : "text-blue-500"
                          )}
                        >
                          {itemPositive ? "+" : ""}{item.change_percent?.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          <div className="pt-3 border-t border-border/60">
            <Link
              href="/stocks"
              className="w-full py-2 rounded-xl bg-muted/40 hover:bg-muted border border-border/60 text-xs font-semibold text-foreground flex items-center justify-center gap-1.5 transition-all"
            >
              <span>{isNepali ? "पूर्ण स्क्रिनर खोल्नुहोस्" : "Open Full Stock Screener"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Sector Performance Matrix ── */}
      <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              {isNepali ? "क्षेत्रगत कार्यसम्पादन म्याट्रिक्स" : "Sectoral Performance Matrix"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isNepali
                ? "प्रत्येक उप-इन्डेक्सको प्रत्यक्ष उतारचढाव र प्रतिशत परिवर्तन"
                : "Real-time performance across all 13 official NEPSE industry sub-indices"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedSector("ALL")}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-semibold border transition-all",
                selectedSector === "ALL"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {isNepali ? "सबै देखाउनुहोस्" : "Show All"}
            </button>
          </div>
        </div>

        {/* Sector Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {sectors.map((sec) => {
            const secPositive = sec.percent_change > 0;
            const secNegative = sec.percent_change < 0;
            const isSelected = selectedSector.toLowerCase() === sec.sector_name.toLowerCase();

            return (
              <button
                key={sec.sector_name}
                onClick={() => setSelectedSector(isSelected ? "ALL" : sec.sector_name)}
                className={cn(
                  "p-3 rounded-xl border text-left transition-all relative overflow-hidden group",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                    : "border-border/70 bg-card hover:border-border hover:bg-muted/30"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-foreground truncate max-w-[120px]">
                    {sec.sector_name}
                  </span>
                  {secPositive ? (
                    <ArrowUpRight className="w-3 h-3 text-emerald-500 shrink-0" />
                  ) : secNegative ? (
                    <ArrowDownRight className="w-3 h-3 text-rose-500 shrink-0" />
                  ) : (
                    <Minus className="w-3 h-3 text-blue-500 shrink-0" />
                  )}
                </div>

                <div className="font-mono text-sm font-bold text-foreground">
                  {sec.index_value?.toFixed(2) || "0.00"}
                </div>

                <div
                  className={cn(
                    "text-[11px] font-mono font-semibold mt-0.5",
                    secPositive
                      ? "text-emerald-500"
                      : secNegative
                      ? "text-rose-500"
                      : "text-blue-500"
                  )}
                >
                  {secPositive ? "+" : ""}{sec.point_change?.toFixed(2)} ({secPositive ? "+" : ""}{sec.percent_change?.toFixed(2)}%)
                </div>

                {/* Subtle Accent Bottom Bar */}
                <div
                  className={cn(
                    "absolute bottom-0 left-0 right-0 h-0.5",
                    secPositive ? "bg-emerald-500" : secNegative ? "bg-rose-500" : "bg-blue-500"
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Comprehensive Live Stocks Directory / Screener ── */}
      <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              {isNepali ? "प्रत्यक्ष शेयर मूल्य सूची" : "Live Stocks Screener & Market Depth"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isNepali
                ? `कुल ${filteredStocks.length} सूचीकृत कम्पनीहरूको वास्तविक बजार डेटा`
                : `Showing ${filteredStocks.length} active listed equities with real-time LTP, turnover, and volume`}
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={isNepali ? "सिम्बल वा कम्पनी खोज्नुहोस्..." : "Search symbol or company..."}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-muted/40 border border-border/70 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Gainers / Losers / All Filter */}
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/60">
              <button
                onClick={() => { setStockFilter("all"); setPage(1); }}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all",
                  stockFilter === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                )}
              >
                {isNepali ? "सबै" : "All"}
              </button>
              <button
                onClick={() => { setStockFilter("gainers"); setPage(1); }}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all",
                  stockFilter === "gainers" ? "bg-emerald-500/15 text-emerald-500" : "text-muted-foreground"
                )}
              >
                {isNepali ? "बढेका" : "Gainers"}
              </button>
              <button
                onClick={() => { setStockFilter("losers"); setPage(1); }}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all",
                  stockFilter === "losers" ? "bg-rose-500/15 text-rose-500" : "text-muted-foreground"
                )}
              >
                {isNepali ? "घटेका" : "Losers"}
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th
                  onClick={() => handleSort("symbol")}
                  className="py-3 px-3 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{isNepali ? "सिम्बल" : "Symbol"}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("ltp")}
                  className="py-3 px-3 text-right cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>LTP (NPR)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("point_change")}
                  className="py-3 px-3 text-right cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>{isNepali ? "परिवर्तन" : "Change"}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("change_percent")}
                  className="py-3 px-3 text-right cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>% Change</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("high")}
                  className="py-3 px-3 text-right cursor-pointer hover:text-foreground transition-colors hidden sm:table-cell"
                >
                  <span>{isNepali ? "उच्च" : "High"}</span>
                </th>
                <th
                  onClick={() => handleSort("low")}
                  className="py-3 px-3 text-right cursor-pointer hover:text-foreground transition-colors hidden sm:table-cell"
                >
                  <span>{isNepali ? "न्यून" : "Low"}</span>
                </th>
                <th
                  onClick={() => handleSort("volume")}
                  className="py-3 px-3 text-right cursor-pointer hover:text-foreground transition-colors hidden md:table-cell"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>{isNepali ? "कित्ता" : "Volume"}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("turnover")}
                  className="py-3 px-3 text-right cursor-pointer hover:text-foreground transition-colors hidden lg:table-cell"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>{isNepali ? "कारोबार रकम" : "Turnover (NPR)"}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">{isNepali ? "कार्य" : "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-mono">
              {paginatedStocks.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-xs text-muted-foreground">
                    {isNepali ? "कुनै स्टक फेला परेन" : "No stocks match your search criteria."}
                  </td>
                </tr>
              ) : (
                paginatedStocks.map((stock, idx) => {
                  const itemPos = stock.point_change > 0;
                  const itemNeg = stock.point_change < 0;
                  const inWatchlist = addedSymbols.has(stock.symbol);
                  const rank = (page - 1) * pageSize + idx + 1;

                  return (
                    <tr
                      key={stock.symbol}
                      className="hover:bg-muted/40 transition-colors group"
                    >
                      <td className="py-2.5 px-3 text-center text-muted-foreground text-[11px]">
                        {rank}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleWatchlist(stock.symbol)}
                            className={cn(
                              "p-1 rounded transition-all",
                              inWatchlist
                                ? "text-amber-500"
                                : "text-muted-foreground/30 hover:text-foreground"
                            )}
                            title={inWatchlist ? "In watchlist" : "Add to watchlist"}
                          >
                            <Plus className={cn("w-3.5 h-3.5", inWatchlist && "rotate-45 text-amber-500")} />
                          </button>
                          <div>
                            <span className="font-bold font-mono text-foreground text-xs group-hover:text-primary transition-colors">
                              {stock.symbol}
                            </span>
                            {stock.name && (
                              <span className="text-[10px] text-muted-foreground block truncate max-w-[160px]">
                                {stock.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-foreground">
                        {stock.ltp?.toFixed(1) || "0.0"}
                      </td>
                      <td
                        className={cn(
                          "py-2.5 px-3 text-right font-semibold",
                          itemPos ? "text-emerald-500" : itemNeg ? "text-rose-500" : "text-blue-500"
                        )}
                      >
                        {itemPos ? "+" : ""}{stock.point_change?.toFixed(2) || "0.00"}
                      </td>
                      <td
                        className={cn(
                          "py-2.5 px-3 text-right font-bold",
                          itemPos ? "text-emerald-500" : itemNeg ? "text-rose-500" : "text-blue-500"
                        )}
                      >
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[11px]",
                          itemPos ? "bg-emerald-500/10" : itemNeg ? "bg-rose-500/10" : "bg-blue-500/10"
                        )}>
                          {itemPos ? "+" : ""}{stock.change_percent?.toFixed(2) || "0.00"}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-muted-foreground hidden sm:table-cell">
                        {stock.high ? stock.high.toFixed(1) : "-"}
                      </td>
                      <td className="py-2.5 px-3 text-right text-muted-foreground hidden sm:table-cell">
                        {stock.low ? stock.low.toFixed(1) : "-"}
                      </td>
                      <td className="py-2.5 px-3 text-right text-foreground hidden md:table-cell">
                        {formatNumber(stock.volume)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-foreground hidden lg:table-cell">
                        {formatCurrency(stock.turnover)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <Link
                          href={`/technicals?symbol=${stock.symbol}`}
                          className="px-2 py-1 rounded-md bg-muted/60 hover:bg-primary hover:text-primary-foreground text-[10px] font-sans font-semibold transition-all inline-flex items-center gap-1"
                        >
                          <span>{isNepali ? "चार्ट" : "Chart"}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="text-xs text-muted-foreground">
            {isNepali ? "पृष्ठ" : "Page"} <span className="font-semibold text-foreground">{page}</span> / <span className="font-semibold text-foreground">{totalPages}</span> (
            {filteredStocks.length} {isNepali ? "कम्पनीहरू" : "stocks"})
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-card border border-border/70 hover:bg-muted disabled:opacity-40 transition-all"
            >
              {isNepali ? "अघिल्लो" : "Previous"}
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5 && page > 3) {
                pageNum = page - 3 + i;
                if (pageNum > totalPages) pageNum = totalPages - (4 - i);
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={cn(
                    "w-7 h-7 rounded-lg text-xs font-semibold transition-all",
                    page === pageNum
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border/60 hover:bg-muted text-muted-foreground"
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-card border border-border/70 hover:bg-muted disabled:opacity-40 transition-all"
            >
              {isNepali ? "पछिल्लो" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
