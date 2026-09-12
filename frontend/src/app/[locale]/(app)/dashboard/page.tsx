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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { NepseTradingChart, ChartPoint } from "@/components/dashboard/nepse-trading-chart";
import { PrivateStockCollection } from "@/components/dashboard/private-stock-collection";
import { CompactNewsFeed } from "@/components/dashboard/compact-news-feed";

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
  volume: number;
  turnover: number;
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

export default function DashboardPage() {
  const pathname = usePathname() || "";
  const locale = pathname.startsWith("/ne") ? "ne" : "en";
  const isNepali = locale === "ne";

  // States
  const [userName, setUserName] = React.useState<string>("Investor");
  const [snapshot, setSnapshot] = React.useState<MarketSnapshotData | null>(null);
  const [topMovers, setTopMovers] = React.useState<TopMoversData | null>(null);
  const [marketStatus, setMarketStatus] = React.useState<MarketStatusData | null>(null);
  const [sectors, setSectors] = React.useState<SectorData[]>([]);
  const [chartPoints, setChartPoints] = React.useState<ChartPoint[]>([]);
  const [activeTimeframe, setActiveTimeframe] = React.useState<string>("1D");
  const [activeMoverTab, setActiveMoverTab] = React.useState<"gainers" | "losers">("gainers");
  const [activeVolumeTab, setActiveVolumeTab] = React.useState<"volume" | "turnover" | "active">("turnover");
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isChartLoading, setIsChartLoading] = React.useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = React.useState<Date>(new Date());

  // Supabase User
  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then((res: any) => {
      const user = res?.data?.user;
      if (user) {
        const metaName = user.user_metadata?.full_name || user.user_metadata?.name;
        if (metaName) {
          setUserName(metaName.split(" ")[0]);
        } else if (user.email) {
          setUserName(user.email.split("@")[0]);
        }
      }
    });
  }, []);

  // Fetch Live / Previous Session Market Data
  const loadDashboardData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [dashRes, moversRes, statusRes, sectorRes] = await Promise.all([
        apiFetch<any>("/api/v1/market/dashboard"),
        apiFetch<any>("/api/v1/market/top-movers"),
        apiFetch<any>("/api/v1/market/status"),
        apiFetch<any>("/api/v1/market/sectors"),
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
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Real Chart Data
  const loadChartData = React.useCallback(async (tf: string) => {
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
    loadDashboardData();
    loadChartData(activeTimeframe);

    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadDashboardData, loadChartData, activeTimeframe]);

  const handleTimeframeChange = (tf: string) => {
    setActiveTimeframe(tf);
    loadChartData(tf);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return isNepali ? "शुभ प्रभात" : "Good Morning";
    if (hour < 17) return isNepali ? "शुभ दिउँसो" : "Good Afternoon";
    return isNepali ? "शुभ साँझ" : "Good Evening";
  };

  const currentIndex = snapshot?.index_value || 0;
  const currentChange = snapshot?.point_change || 0;
  const currentPct = snapshot?.percent_change || 0;
  const currentTurnover = snapshot?.turnover || 0;
  const currentShares = snapshot?.total_shares || 0;

  // Helper to render a stock row in movers table
  const renderMoverRow = (stock: StockItem, idx: number) => {
    const isUp = stock.change_percent > 0;
    const isDown = stock.change_percent < 0;
    return (
      <Link
        key={idx}
        href={`/${locale}/stocks?symbol=${stock.symbol}`}
        className="grid grid-cols-[1fr_auto_auto] gap-2 items-center px-2 py-2 rounded-xl hover:bg-muted/40 transition-colors"
      >
        <div className="min-w-0">
          <span className="text-xs font-bold text-foreground block truncate">
            {stock.symbol}
          </span>
        </div>
        <span className="text-xs font-semibold text-foreground text-right font-mono">
          {stock.ltp.toFixed(2)}
        </span>
        <span
          className={cn(
            "text-xs font-bold text-right font-mono w-16",
            isUp && "text-emerald-600 dark:text-emerald-400",
            isDown && "text-red-500",
            !isUp && !isDown && "text-blue-500"
          )}
        >
          {stock.change_percent > 0
            ? `+${stock.change_percent.toFixed(2)}%`
            : `${stock.change_percent.toFixed(2)}%`}
        </span>
      </Link>
    );
  };

  // Volume/turnover row with extra column
  const renderVolumeRow = (stock: StockItem, idx: number, showField: "volume" | "turnover") => {
    const isUp = stock.change_percent > 0;
    const isDown = stock.change_percent < 0;
    return (
      <Link
        key={idx}
        href={`/${locale}/stocks?symbol=${stock.symbol}`}
        className="grid grid-cols-[1fr_auto_auto] gap-2 items-center px-2 py-2 rounded-xl hover:bg-muted/40 transition-colors"
      >
        <div className="min-w-0">
          <span className="text-xs font-bold text-foreground block truncate">
            {stock.symbol}
          </span>
        </div>
        <span className="text-xs font-semibold text-foreground text-right font-mono">
          {showField === "volume"
            ? stock.volume.toLocaleString()
            : `${(stock.turnover / 10000000).toFixed(2)} Cr`}
        </span>
        <span
          className={cn(
            "text-xs font-bold text-right font-mono w-16",
            isUp && "text-emerald-600 dark:text-emerald-400",
            isDown && "text-red-500",
            !isUp && !isDown && "text-blue-500"
          )}
        >
          {stock.change_percent > 0
            ? `+${stock.change_percent.toFixed(2)}%`
            : `${stock.change_percent.toFixed(2)}%`}
        </span>
      </Link>
    );
  };

  return (
    <div className="space-y-5 max-w-[1440px] mx-auto pb-10">
      {/* ─── Top Header & Controls ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              {getGreeting()}, {userName}
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isNepali
              ? "नेपाल स्टक एक्सचेन्ज (NEPSE) को वास्तविक डाटा टर्मिनल।"
              : "Nepal Stock Exchange real-time financial market overview."}
          </p>
        </div>

        {/* Right Session Badge & Refresh */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Market Status Pill */}
          <div
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-semibold shadow-2xs",
              marketStatus?.is_open
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                : "bg-muted/80 text-muted-foreground border-border/70"
            )}
          >
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                marketStatus?.is_open ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/60"
              )}
            />
            <span>
              {marketStatus?.is_open
                ? "Market LIVE"
                : isNepali ? "पछिल्लो बजार सत्र (EOD)" : "Previous Session (EOD)"}
            </span>
          </div>

          <button
            onClick={() => {
              loadDashboardData();
              loadChartData(activeTimeframe);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-2xs"
            title="Refresh market data"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin text-emerald-600")} />
          </button>
        </div>
      </div>

      {/* ─── Market Status & Next Open Banner (If Closed) ─── */}
      {marketStatus && !marketStatus.is_open && (
        <div className="rounded-2xl border border-border/80 bg-card/80 px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shadow-2xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span>{marketStatus.reason}</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-foreground shrink-0 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Next Open: {marketStatus.next_open_human}</span>
          </div>
        </div>
      )}

      {/* ─── 4 Top Key Market Metrics Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: NEPSE Benchmark */}
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="font-semibold">NEPSE Index</span>
            {currentPct !== 0 && (
              <span
                className={cn(
                  "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded",
                  currentPct > 0 ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" : "text-red-500 bg-red-500/10"
                )}
              >
                {currentPct > 0 ? "+" : ""}{currentPct.toFixed(2)}%
              </span>
            )}
          </div>
          <div className="text-xl sm:text-2xl font-black text-foreground font-mono">
            {currentIndex > 0
              ? currentIndex.toLocaleString("en-US", { minimumFractionDigits: 2 })
              : "—"}
          </div>
          <div
            className={cn(
              "text-[11px] font-bold font-mono mt-0.5",
              currentChange > 0 ? "text-emerald-600 dark:text-emerald-400" : currentChange < 0 ? "text-red-500" : "text-blue-500"
            )}
          >
            {currentChange !== 0
              ? `${currentChange > 0 ? "+" : ""}${currentChange.toFixed(2)} pts vs Prev Close`
              : "No change"}
          </div>
        </div>

        {/* Metric 2: Turnover */}
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="font-semibold">{isNepali ? "कुल कारोबार" : "Total Turnover"}</span>
            <span className="text-[10px] text-muted-foreground font-mono">Floor Total</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-foreground font-mono">
            {currentTurnover > 0
              ? `Rs. ${(currentTurnover / 10000000).toFixed(2)} Cr`
              : "—"}
          </div>
          <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
            {currentTurnover > 0
              ? `NPR ${currentTurnover.toLocaleString("en-US")}`
              : "No data"}
          </div>
        </div>

        {/* Metric 3: Traded Shares */}
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="font-semibold">{isNepali ? "कारोबार सेयर" : "Traded Volume"}</span>
            <span className="text-[10px] text-muted-foreground font-mono">Shares</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-foreground font-mono">
            {currentShares > 0 ? currentShares.toLocaleString("en-US") : "—"}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {isNepali ? "सबै सक्रिय उप-समूहहरू" : "Across all active sub-sectors"}
          </div>
        </div>

        {/* Metric 4: Market Breadth */}
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="font-semibold">Market Breadth</span>
            <span className="text-[10px] text-muted-foreground font-mono">Adv / Dec / Unch</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {snapshot?.breadth_advancing ?? 0} ↑
            </span>
            <span className="text-sm font-bold text-red-500 font-mono">
              {snapshot?.breadth_declining ?? 0} ↓
            </span>
            <span className="text-sm font-bold text-blue-500 font-mono">
              {snapshot?.breadth_unchanged ?? 0} =
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Green: Up</span> |{" "}
            <span className="text-red-500 font-semibold">Red: Down</span> |{" "}
            <span className="text-blue-500 font-semibold">Blue: Flat</span>
          </div>
        </div>
      </div>

      {/* ─── Main Two-Column Layout ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left 8 Cols: Trading Chart + Private Stock Collection */}
        <div className="xl:col-span-8 space-y-5">
          {/* Financial Spline Chart */}
          <NepseTradingChart
            initialTimeframe={activeTimeframe}
            onTimeframeChange={handleTimeframeChange}
            indexValue={currentIndex}
            pointChange={currentChange}
            percentChange={currentPct}
            turnover={currentTurnover}
            totalShares={currentShares}
            points={chartPoints}
            isLoading={isChartLoading}
          />

          {/* User's Private Stock Collection (Interactive Watchlist) */}
          <PrivateStockCollection locale={locale} />
        </div>

        {/* Right 4 Cols: Top Movers + Top Volume/Turnover + Sector + News */}
        <div className="xl:col-span-4 space-y-5">
          {/* ── Card 1: Top Gainers & Losers ── */}
          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                {isNepali ? "शीर्ष गतिविधि" : "Top Movers"}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">NEPSE</span>
            </div>

            {/* Gainers/Losers Tabs */}
            <div className="grid grid-cols-2 gap-1 bg-muted/60 rounded-xl p-1 text-xs">
              <button
                onClick={() => setActiveMoverTab("gainers")}
                className={cn(
                  "py-1.5 font-bold rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1",
                  activeMoverTab === "gainers"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <ArrowUpRight className="w-3 h-3" />
                Gainers
              </button>
              <button
                onClick={() => setActiveMoverTab("losers")}
                className={cn(
                  "py-1.5 font-bold rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1",
                  activeMoverTab === "losers"
                    ? "bg-red-600 text-white shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <ArrowDownRight className="w-3 h-3" />
                Losers
              </button>
            </div>

            {/* Table */}
            <div className="space-y-0.5">
              <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-2 pb-1 text-[10px] font-bold uppercase text-muted-foreground border-b border-border/30">
                <span>Symbol</span>
                <span className="text-right">Price</span>
                <span className="text-right w-16">Change</span>
              </div>
              {(topMovers &&
                (activeMoverTab === "gainers" ? topMovers.gainers : topMovers.losers)
              )?.slice(0, 7).map((stock, sIdx) => renderMoverRow(stock, sIdx))}
            </div>
          </div>

          {/* ── Card 2: Top Volume / Turnover / Active ── */}
          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                {isNepali ? "शीर्ष कारोबार" : "Market Activity"}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">By Volume</span>
            </div>

            {/* Volume/Turnover/Active Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-muted/60 rounded-xl p-1 text-xs">
              <button
                onClick={() => setActiveVolumeTab("volume")}
                className={cn(
                  "py-1.5 font-bold rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1",
                  activeVolumeTab === "volume"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <BarChart3 className="w-3 h-3" />
                Volume
              </button>
              <button
                onClick={() => setActiveVolumeTab("turnover")}
                className={cn(
                  "py-1.5 font-bold rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1",
                  activeVolumeTab === "turnover"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <DollarSign className="w-3 h-3" />
                Turnover
              </button>
              <button
                onClick={() => setActiveVolumeTab("active")}
                className={cn(
                  "py-1.5 font-bold rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1",
                  activeVolumeTab === "active"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Activity className="w-3 h-3" />
                Txns
              </button>
            </div>

            {/* Table */}
            <div className="space-y-0.5">
              <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-2 pb-1 text-[10px] font-bold uppercase text-muted-foreground border-b border-border/30">
                <span>Symbol</span>
                <span className="text-right">
                  {activeVolumeTab === "volume" ? "Volume" : activeVolumeTab === "turnover" ? "Turnover" : "Txns"}
                </span>
                <span className="text-right w-16">Change</span>
              </div>
              {topMovers && (
                activeVolumeTab === "volume"
                  ? (topMovers.by_volume || topMovers.active)
                  : activeVolumeTab === "turnover"
                  ? (topMovers.by_turnover || topMovers.active)
                  : topMovers.active
              )?.slice(0, 5).map((stock, sIdx) =>
                renderVolumeRow(stock, sIdx, activeVolumeTab === "volume" ? "volume" : "turnover")
              )}
            </div>
          </div>

          {/* ── Sector Overview (Real Data) ── */}
          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {isNepali ? "क्षेत्रगत अवस्था" : "Sector Summary"}
                </span>
              </div>
              <Link
                href={`/${locale}/market`}
                className="text-[11px] font-semibold text-emerald-600 hover:underline"
              >
                {sectors.length > 0 ? `${sectors.length} Sectors` : "All"} →
              </Link>
            </div>

            <div className="space-y-1.5 text-xs">
              {sectors.length > 0 ? (
                sectors.slice(0, 8).map((sector, idx) => {
                  const isUp = sector.percent_change > 0;
                  const isDown = sector.percent_change < 0;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-1 px-1 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <span className="text-muted-foreground font-medium truncate max-w-[140px]">
                        {sector.sector_name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {sector.index_value > 0 ? sector.index_value.toFixed(1) : ""}
                        </span>
                        <span
                          className={cn(
                            "font-bold font-mono min-w-[50px] text-right",
                            isUp && "text-emerald-600 dark:text-emerald-400",
                            isDown && "text-red-500",
                            !isUp && !isDown && "text-blue-500"
                          )}
                        >
                          {isUp ? "+" : ""}{sector.percent_change.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-center py-2">Loading sectors...</p>
              )}
            </div>
          </div>

          {/* Compact News Dispatches */}
          <CompactNewsFeed locale={locale} />
        </div>
      </div>
    </div>
  );
}
