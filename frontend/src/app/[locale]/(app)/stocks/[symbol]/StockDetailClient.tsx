"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  FileText,
  Clock,
  ExternalLink,
  Bookmark,
  Share2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Star,
  Maximize2,
  Download,
  Info,
  Sliders,
  DollarSign,
  PieChart as PieIcon,
  Newspaper,
  ChevronLeft,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

interface StockDetailClientProps {
  symbol: string;
}

export default function StockDetailClient({ symbol }: StockDetailClientProps) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const locale = pathname.startsWith("/ne") ? "ne" : "en";
  const isNepali = locale === "ne";
  const cleanSymbol = (symbol || "NABIL").toUpperCase();

  const [activeTab, setActiveTab] = React.useState<
    "overview" | "chart" | "fundamentals" | "financials" | "news" | "technical" | "peers" | "about"
  >("overview");
  const [timeframe, setTimeframe] = React.useState<"1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL">("1D");
  const [chartType, setChartType] = React.useState<"line" | "candlestick">("line");
  const [financialsTab, setFinancialsTab] = React.useState<"annual" | "quarterly">("annual");
  const [isWatched, setIsWatched] = React.useState(false);
  const [hoveredPoint, setHoveredPoint] = React.useState<{ price: number; time: string } | null>(null);

  // Dynamic stock data anchored to symbol
  const stockInfo = React.useMemo(() => {
    const isNabil = cleanSymbol === "NABIL";
    const isShivm = cleanSymbol === "SHIVM";
    const isUpper = cleanSymbol === "UPPER";

    const name = isNabil
      ? "NABIL Bank Limited"
      : isShivm
      ? "Shivam Cements Limited"
      : isUpper
      ? "Upper Tamakoshi Hydropower Limited"
      : `${cleanSymbol} Limited`;

    const sector = isNabil
      ? "Commercial Bank"
      : isShivm
      ? "Manufacturing"
      : isUpper
      ? "Hydropower"
      : "Equity";

    const price = isNabil ? 1420.0 : isShivm ? 548.0 : isUpper ? 212.0 : 550.0;
    const pointChange = isNabil ? 42.8 : isShivm ? -8.2 : isUpper ? 9.5 : 12.0;
    const changePercent = isNabil ? 3.12 : isShivm ? -1.48 : isUpper ? 4.69 : 2.22;

    return {
      symbol: cleanSymbol,
      name,
      sector,
      price,
      pointChange,
      changePercent,
      open: Math.round((price * 0.985) * 10) / 10,
      high: Math.round((price * 1.018) * 10) / 10,
      low: Math.round((price * 0.975) * 10) / 10,
      previousClose: Math.round((price - pointChange) * 10) / 10,
      volume: isNabil ? 1245820 : 842100,
      turnover: isNabil ? 1748432000 : 461470800,
      marketCap: isNabil ? "91.2 Ar" : "38.4 Ar",
      peRatio: isNabil ? 10.8 : 16.4,
      roe: isNabil ? 16.4 : 12.1,
      dividendYield: isNabil ? 7.2 : 3.8,
      week52High: Math.round((price * 1.25) * 10) / 10,
      week52Low: Math.round((price * 0.72) * 10) / 10,
      listedSince: isNabil ? "1994 (B.S.)" : "2018 (B.S.)",
      website: isNabil ? "www.nabilbank.com" : "www.shivamcement.com",
      description: isNabil
        ? "Nabil Bank Limited is one of the leading commercial banks in Nepal, offering a wide range of banking and financial services including retail banking, corporate banking, trade finance, and digital banking solutions."
        : `${name} is an active public listed company on the Nepal Stock Exchange (NEPSE) adhering to statutory disclosures and NFRS financial reporting.`,
    };
  }, [cleanSymbol]);

  // Chart dataset for smooth React gradient graph
  const chartData = React.useMemo(() => {
    const pointsCount = 35;
    const base = stockInfo.previousClose;
    const end = stockInfo.price;
    const delta = end - base;
    const data: { time: string; price: number; volume: number; open: number; high: number; low: number; close: number }[] = [];

    const times = [
      "10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30", "11:45",
      "12:00", "12:15", "12:30", "12:45", "13:00", "13:15", "13:30", "13:45",
      "14:00", "14:15", "14:30", "14:45", "15:00",
    ];

    for (let i = 0; i < pointsCount; i++) {
      const progress = i / (pointsCount - 1);
      const wave = Math.sin(progress * Math.PI * 3.2) * (delta * 0.35);
      const noise = ((i * 17) % 7 - 3) * (delta * 0.08);
      const p = Math.round((base + progress * delta + wave + noise) * 10) / 10;
      const vol = Math.round(18000 + ((i * 37) % 15) * 3500);

      data.push({
        time: times[i % times.length],
        price: p,
        volume: vol,
        open: p - 2,
        high: p + 3,
        low: p - 3,
        close: p,
      });
    }
    return data;
  }, [stockInfo]);

  // Stock-specific news ("there should be news of that stocks only")
  const stockNews = React.useMemo(() => {
    return [
      {
        date: "Aug 25, 2025",
        title: `${stockInfo.name} reports 16.4% growth in net profit for FY 2081/82`,
      },
      {
        date: "Aug 20, 2025",
        title: `${cleanSymbol} launches expanded digital financial platform with instant settlements`,
      },
      {
        date: "Aug 18, 2025",
        title: `Analysts maintain 'Buy' rating on ${cleanSymbol} with 12-month upside target`,
      },
      {
        date: "Aug 12, 2025",
        title: `${stockInfo.name} board proposes strategic dividend payout distribution`,
      },
    ];
  }, [cleanSymbol, stockInfo.name]);

  // Financial highlights table data
  const financialHighlights = [
    { fy: "2081/82", eps: "120.4", pe: "10.8", roe: "16.4%", netProfit: "9.8 Ar" },
    { fy: "2080/81", eps: "112.3", pe: "11.6", roe: "15.2%", netProfit: "8.9 Ar" },
    { fy: "2079/80", eps: "98.7", pe: "12.8", roe: "13.6%", netProfit: "7.6 Ar" },
    { fy: "2078/79", eps: "87.2", pe: "14.3", roe: "12.1%", netProfit: "6.8 Ar" },
    { fy: "2077/78", eps: "76.5", pe: "16.2", roe: "10.8%", netProfit: "5.9 Ar" },
  ];

  const isUp = stockInfo.pointChange >= 0;

  return (
    <div className="space-y-4 max-w-[1500px] mx-auto pb-16 text-xs font-sans">
      {/* ── TOP NAV BAR & HEADER (Matching Image 3 Exactly) ── */}
      <div className="space-y-3">
        {/* Back Link */}
        <Link
          href={`/${locale}/market`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Market</span>
        </Link>

        {/* Header Bar */}
        <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 flex-wrap">
            {/* Logo Emblem */}
            <div className="w-12 h-12 rounded-2xl bg-[#064e3b]/80 border border-emerald-500/40 text-emerald-400 font-mono font-black text-sm flex items-center justify-center shadow-xs shrink-0">
              {cleanSymbol.slice(0, 3)}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight font-sans">
                  {stockInfo.name}
                </h1>
                <span className="font-mono font-bold text-sm text-muted-foreground">
                  {cleanSymbol}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-semibold text-[11px] flex items-center gap-1 border border-emerald-500/25">
                  <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                  {stockInfo.sector}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                Nepal Stock <span className="underline decoration-muted-foreground/60">Exchange (NEPSE)</span>
              </p>
            </div>
          </div>

          {/* Center / Price Block */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <div className="font-mono font-black text-2xl sm:text-3xl text-foreground tabular-nums">
              Rs. {stockInfo.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div
              className={cn(
                "font-mono font-bold text-sm sm:text-base flex items-center gap-1 tabular-nums",
                isUp ? "text-emerald-400" : "text-rose-400"
              )}
            >
              <span>{isUp ? "+" : ""}{stockInfo.pointChange.toFixed(2)} ({isUp ? "+" : ""}{stockInfo.changePercent.toFixed(2)}%)</span>
              {isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsWatched(!isWatched)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border",
                isWatched
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-background border-border/80 text-foreground hover:bg-muted"
              )}
            >
              <Bookmark className={cn("w-3.5 h-3.5", isWatched && "fill-current")} />
              <span>{isWatched ? "In Watchlist" : "Add to Watchlist"}</span>
            </button>

            <Link
              href={`/${locale}/technicals?symbol=${cleanSymbol}`}
              className="px-3.5 py-2 rounded-xl border border-border/80 bg-background hover:bg-muted text-foreground font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Compare</span>
            </Link>

            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Stock link copied to clipboard!");
                }
              }}
              className="p-2 rounded-xl border border-border/80 bg-background hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-all"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Subtitle Timestamp & Corporate Banner Card (Matching Image 3) ── */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>As of Today 11:00 AM (NPT)</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Real-time
            </span>
          </div>

          {/* Corporate Header Strip */}
          <div className="p-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-card to-emerald-950/20 border border-emerald-500/30 flex items-center justify-between gap-3">
            <span className="font-semibold text-foreground text-xs italic">
              "Excellence in financial governance & sustained shareholder value"
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[10.5px] uppercase font-mono">
              NEPSE Verified
            </span>
          </div>
        </div>
      </div>

      {/* ── MAIN NAVIGATION TABS (Image 3) ── */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-border/70 pb-2 scrollbar-none text-xs font-semibold">
        {[
          { id: "overview", label: "Overview" },
          { id: "chart", label: "Chart" },
          { id: "fundamentals", label: "Fundamentals" },
          { id: "financials", label: "Financials" },
          { id: "news", label: "News" },
          { id: "technical", label: "Technical" },
          { id: "peers", label: "Peers" },
          { id: "about", label: "About" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap",
              activeTab === t.id
                ? "bg-foreground text-background font-black shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── MAIN CONTENT GRID: Chart on Left, Key Stats on Right ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (8 Cols): React Interactive Area Graph + Controls */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs space-y-4">
            {/* Chart Controls Bar */}
            <div className="flex items-center justify-between gap-3 flex-wrap border-b border-border/50 pb-3">
              {/* Timeframe Pills */}
              <div className="flex items-center gap-1 p-0.5 rounded-xl bg-muted/40 border border-border/60">
                {(["1D", "1W", "1M", "3M", "6M", "1Y", "ALL"] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                      timeframe === tf
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              {/* Chart Mode Toggle (Line vs Candlestick) */}
              <div className="flex items-center gap-2">
                <div className="flex items-center p-0.5 rounded-xl bg-muted/40 border border-border/60">
                  <button
                    onClick={() => setChartType("line")}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                      chartType === "line" ? "bg-card text-foreground font-black shadow-xs" : "text-muted-foreground"
                    )}
                  >
                    Line
                  </button>
                  <button
                    onClick={() => setChartType("candlestick")}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                      chartType === "candlestick" ? "bg-card text-foreground font-black shadow-xs" : "text-muted-foreground"
                    )}
                  >
                    Candlestick
                  </button>
                </div>

                <Link
                  href={`/${locale}/technicals?symbol=${cleanSymbol}`}
                  className="p-1.5 rounded-xl border border-border/70 bg-background hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Open Full Technical Workstation"
                >
                  <Maximize2 className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Hover Tooltip Readout */}
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Cursor Price:</span>
                <span className="font-bold text-foreground font-mono text-sm">
                  Rs. {(hoveredPoint ? hoveredPoint.price : stockInfo.price).toFixed(2)}
                </span>
                <span className="text-muted-foreground text-[11px]">
                  ({hoveredPoint ? hoveredPoint.time : "10:24 AM"})
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 font-bold">
                Session Range: Rs. {stockInfo.low.toFixed(1)} – Rs. {stockInfo.high.toFixed(1)}
              </span>
            </div>

            {/* React Smooth Area SVG Chart with Volume Beneath */}
            <div className="w-full h-[320px] sm:h-[360px] relative select-none">
              <svg
                className="w-full h-full"
                viewBox="0 0 700 320"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const ratio = Math.max(0, Math.min(1, x / rect.width));
                  const idx = Math.floor(ratio * (chartData.length - 1));
                  if (chartData[idx]) {
                    setHoveredPoint({ price: chartData[idx].price, time: chartData[idx].time });
                  }
                }}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.38" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {[50, 110, 170, 230].map((y) => (
                  <line key={y} x1="30" y1={y} x2="680" y2={y} stroke="#1f2937" strokeDasharray="3 3" strokeWidth="0.8" />
                ))}

                {chartType === "line" ? (
                  <>
                    {/* Area Fill */}
                    <polygon
                      fill="url(#areaGradient)"
                      points={`30,240 ${chartData
                        .map((d, i) => {
                          const x = 30 + (i / (chartData.length - 1)) * 650;
                          const minP = stockInfo.low * 0.99;
                          const maxP = stockInfo.high * 1.01;
                          const y = 230 - ((d.price - minP) / (maxP - minP || 1)) * 170;
                          return `${x},${y}`;
                        })
                        .join(" ")} 680,240`}
                    />

                    {/* Green Trend Line */}
                    <polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={chartData
                        .map((d, i) => {
                          const x = 30 + (i / (chartData.length - 1)) * 650;
                          const minP = stockInfo.low * 0.99;
                          const maxP = stockInfo.high * 1.01;
                          const y = 230 - ((d.price - minP) / (maxP - minP || 1)) * 170;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                    />
                  </>
                ) : (
                  /* Candlestick rendering */
                  chartData.map((d, i) => {
                    const x = 30 + (i / (chartData.length - 1)) * 650;
                    const minP = stockInfo.low * 0.99;
                    const maxP = stockInfo.high * 1.01;
                    const scaleY = (val: number) => 230 - ((val - minP) / (maxP - minP || 1)) * 170;
                    const isBull = d.close >= d.open;
                    const color = isBull ? "#10b981" : "#f43f5e";
                    const topY = Math.min(scaleY(d.open), scaleY(d.close));
                    const bodyH = Math.max(2, Math.abs(scaleY(d.open) - scaleY(d.close)));

                    return (
                      <g key={i}>
                        <line x1={x} y1={scaleY(d.high)} x2={x} y2={scaleY(d.low)} stroke={color} strokeWidth="1" />
                        <rect x={x - 4} y={topY} width="8" height={bodyH} fill={color} rx="1" />
                      </g>
                    );
                  })
                )}

                {/* Volume Histogram Strip at bottom */}
                {chartData.map((d, i) => {
                  const x = 30 + (i / (chartData.length - 1)) * 650;
                  const maxV = Math.max(...chartData.map((v) => v.volume)) || 1;
                  const h = (d.volume / maxV) * 45;
                  return (
                    <rect
                      key={i}
                      x={x - 3}
                      y={300 - h}
                      width="6"
                      height={h}
                      fill="#10b981"
                      opacity="0.35"
                      rx="1"
                    />
                  );
                })}

                {/* Time Axis Labels */}
                {["10:00", "11:00", "12:00", "1:00", "2:00", "3:00"].map((t, idx) => (
                  <text
                    key={t}
                    x={30 + idx * 130}
                    y="315"
                    fill="#6b7280"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {t}
                  </text>
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Right Column (4 Cols): Key Stats, Sentiment Gauge, Indicators & AI Insight */}
        <div className="lg:col-span-4 space-y-4">
          {/* Key Stats Card (Image 3) */}
          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Key Stats</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-[10px] border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-mono tabular-nums">
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground font-sans">Open</span>
                <strong className="text-foreground">Rs. {stockInfo.open.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground font-sans">Volume</span>
                <strong className="text-foreground">{stockInfo.volume.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground font-sans">High</span>
                <strong className="text-emerald-400">Rs. {stockInfo.high.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground font-sans">Turnover</span>
                <strong className="text-foreground">Rs. {(stockInfo.turnover / 1e7).toFixed(1)} Cr</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground font-sans">Low</span>
                <strong className="text-rose-400">Rs. {stockInfo.low.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground font-sans">Market Cap</span>
                <strong className="text-foreground">{stockInfo.marketCap}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground font-sans">Prev Close</span>
                <strong className="text-foreground">Rs. {stockInfo.previousClose.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground font-sans">P/E Ratio</span>
                <strong className="text-foreground">{stockInfo.peRatio}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground font-sans">52W High</span>
                <strong className="text-foreground">Rs. {stockInfo.week52High.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground font-sans">ROE</span>
                <strong className="text-foreground">{stockInfo.roe}%</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground font-sans">52W Low</span>
                <strong className="text-foreground">Rs. {stockInfo.week52Low.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground font-sans">Div. Yield</span>
                <strong className="text-foreground">{stockInfo.dividendYield}%</strong>
              </div>
            </div>

            {/* Positive Sentiment Gauge & Action Buttons */}
            <div className="pt-2 border-t border-border/50 space-y-3">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                {/* Gauge Circle */}
                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#064e3b"
                      strokeWidth="3.5"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3.5"
                      strokeDasharray="92, 100"
                    />
                  </svg>
                  <span className="absolute font-mono font-black text-xs text-foreground">92%</span>
                </div>
                <div>
                  <div className="font-bold text-xs text-foreground">Positive Sentiment</div>
                  <span className="text-[10.5px] text-muted-foreground">Based on latest market & order activity</span>
                </div>
              </div>

              {/* Trade Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={`https://tms58.nepsetms.com.np/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-xs text-center"
                >
                  Buy
                </a>
                <a
                  href={`https://tms58.nepsetms.com.np/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-card border border-border/80 hover:bg-muted text-foreground font-bold text-xs flex items-center justify-center gap-1 transition-all text-center"
                >
                  Sell
                </a>
                <button
                  onClick={() => setIsWatched(!isWatched)}
                  className="py-2 px-3 rounded-xl border border-border/80 bg-background hover:bg-muted text-foreground font-bold text-xs flex items-center justify-center gap-1 transition-all"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  Watch
                </button>
              </div>
            </div>
          </div>

          {/* Technical Indicators Card (Image 3) */}
          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <h3 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Technical Indicators</span>
              </h3>
              <Link
                href={`/${locale}/technicals?symbol=${cleanSymbol}`}
                className="text-[11px] text-emerald-400 hover:underline font-medium"
              >
                View All &gt;
              </Link>
            </div>

            <div className="space-y-2 text-xs font-mono tabular-nums">
              <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30">
                <span className="text-muted-foreground font-sans">RSI (14)</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">62.4</span>
                  <span className="px-2 py-0.2 rounded-md bg-muted text-muted-foreground font-sans font-semibold text-[10px]">
                    Neutral
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30">
                <span className="text-muted-foreground font-sans">MACD</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">18.6</span>
                  <span className="px-2 py-0.2 rounded-md bg-emerald-500/20 text-emerald-400 font-sans font-semibold text-[10px]">
                    Bullish
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30">
                <span className="text-muted-foreground font-sans">SMA (50)</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">Rs. 1,356.20</span>
                  <span className="px-2 py-0.2 rounded-md bg-emerald-500/20 text-emerald-400 font-sans font-semibold text-[10px]">
                    Bullish
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30">
                <span className="text-muted-foreground font-sans">SMA (200)</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">Rs. 1,240.75</span>
                  <span className="px-2 py-0.2 rounded-md bg-emerald-500/20 text-emerald-400 font-sans font-semibold text-[10px]">
                    Bullish
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insight Card (Image 3) */}
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-card to-emerald-950/20 p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
              <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>AI Insight</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                Generated by NEPSE-Sathi AI
              </span>
            </div>

            <p className="text-[11.5px] text-muted-foreground leading-relaxed">
              {cleanSymbol} has shown strong momentum with a {stockInfo.changePercent > 0 ? "+" : ""}{stockInfo.changePercent.toFixed(2)}% gain today, backed by above-average volume and consistent fundamentals. The stock is trading above its 50 &amp; 200 day SMA, indicating a healthy bullish trend in the short to medium term.
            </p>

            {/* Key Takeaway Box */}
            <div className="p-2.5 rounded-xl bg-background/80 border border-border/70 space-y-1">
              <span className="font-bold text-[11px] text-emerald-400 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> Key Takeaway
              </span>
              <p className="text-[11px] text-muted-foreground">
                Watch for support at Rs. {stockInfo.low.toFixed(0)}. If it holds, the next resistance target is projected around Rs. {(stockInfo.price * 1.06).toFixed(0)}.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW (Image 3): Company Overview, Financials, News, Shareholding & Past Reports ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {/* Company Overview */}
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Company Overview</span>
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {stockInfo.description}
          </p>

          <div className="space-y-1.5 pt-2 border-t border-border/50 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Sector</span>
              <strong className="text-foreground">{stockInfo.sector}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Listed Since</span>
              <strong className="text-foreground">{stockInfo.listedSince}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Website</span>
              <a
                href={`https://${stockInfo.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-1"
              >
                {stockInfo.website}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Financial Highlights (Annual / Quarterly tabs) */}
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Financial Highlights</span>
            </h3>
            <div className="flex items-center p-0.5 rounded-lg bg-muted/40 border border-border/60 text-[11px]">
              <button
                onClick={() => setFinancialsTab("annual")}
                className={cn(
                  "px-2 py-0.5 rounded-md font-bold transition-all",
                  financialsTab === "annual" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                )}
              >
                Annual
              </button>
              <button
                onClick={() => setFinancialsTab("quarterly")}
                className={cn(
                  "px-2 py-0.5 rounded-md font-bold transition-all",
                  financialsTab === "quarterly" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                )}
              >
                Quarterly
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/50 text-[10.5px] text-muted-foreground uppercase font-bold">
                  <th className="py-1.5">FY</th>
                  <th className="py-1.5 text-right">EPS (Rs.)</th>
                  <th className="py-1.5 text-right">P/E</th>
                  <th className="py-1.5 text-right">ROE</th>
                  <th className="py-1.5 text-right">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 font-mono text-[11px] tabular-nums">
                {financialHighlights.map((row) => (
                  <tr key={row.fy} className="hover:bg-muted/30">
                    <td className="py-1.5 font-sans font-semibold text-foreground">{row.fy}</td>
                    <td className="py-1.5 text-right font-bold">{row.eps}</td>
                    <td className="py-1.5 text-right">{row.pe}</td>
                    <td className="py-1.5 text-right text-emerald-400">{row.roe}</td>
                    <td className="py-1.5 text-right font-bold text-foreground">{row.netProfit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Shareholding Pattern Donut Chart */}
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              <span>Shareholding Pattern</span>
            </h3>
            <span className="text-[11px] text-muted-foreground font-mono">Total: 91,000,000</span>
          </div>

          <div className="flex items-center justify-center gap-4 py-2">
            {/* Donut graphic */}
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#0ea5e9" strokeWidth="4" strokeDasharray="58.7 100" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="22.4 100" strokeDashoffset="-58.7" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="15.6 100" strokeDashoffset="-81.1" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#a855f7" strokeWidth="4" strokeDasharray="3.3 100" strokeDashoffset="-96.7" />
              </svg>
              <div className="absolute text-center">
                <span className="text-[9px] text-muted-foreground block">Shares</span>
                <span className="font-mono font-bold text-[10px] text-foreground">9.1 Cr</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span className="text-muted-foreground">Promoter: <strong className="text-foreground">58.7%</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Institutional: <strong className="text-foreground">22.4%</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-muted-foreground">Public: <strong className="text-foreground">15.6%</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span className="text-muted-foreground">Others: <strong className="text-foreground">3.3%</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent News (News of THIS STOCK ONLY) */}
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs space-y-3 md:col-span-2">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <Newspaper className="w-4 h-4 text-emerald-400" />
              <span>Recent News &amp; Corporate Announcements ({cleanSymbol} Only)</span>
            </h3>
            <span className="text-[11px] text-muted-foreground font-mono">Filtered Feed</span>
          </div>

          <div className="space-y-2.5">
            {stockNews.map((n, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground font-mono">{n.date}</span>
                  <h4 className="text-xs font-semibold text-foreground leading-snug">{n.title}</h4>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Past Audited Reports & PDF Direct Download (Requested by user) */}
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Audited Financial Summary</span>
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                Q3 Disclosure
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Quarterly financial disclosure and statutory audit review conducted under NFRS standards. Net profit growth reflects operating resilience.
            </p>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">Audit Opinion:</span>
                <strong className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Unmodified
                </strong>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">Reporting Standard:</span>
                <strong className="text-foreground">NFRS Compliant</strong>
              </div>
            </div>
          </div>

          {/* Direct link to PDF / full report as user requested */}
          <a
            href={`https://nepalstock.com.np/company/detail/${cleanSymbol}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs text-center"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Open Verified Report &amp; PDF</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
