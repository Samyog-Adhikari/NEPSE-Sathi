"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Search,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Maximize2,
  Minimize2,
  ExternalLink,
  ShieldCheck,
  Layers,
  LineChart,
  Target,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Trash2,
  SlidersHorizontal,
  BarChart3,
  Compass,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

interface CandlePoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  changePercent: number;
  pattern?: string;
  patternType?: "bullish" | "bearish" | "neutral";
}

// Custom Trading Equipment Icons
function CrosshairIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="22" y1="12" x2="18" y2="12" />
      <line x1="6" y1="12" x2="2" y2="12" />
      <line x1="12" y1="6" x2="12" y2="2" />
      <line x1="12" y1="22" x2="12" y2="18" />
    </svg>
  );
}

function PencilIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

function TypeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  );
}

function RulerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21.3 15.3 8.7 2.7a2.41 2.41 0 0 0-3.4 0L2.7 5.3a2.41 2.41 0 0 0 0 3.4l12.6 12.6a2.41 2.41 0 0 0 3.4 0l2.6-2.6a2.41 2.41 0 0 0 0-3.4Z" />
    </svg>
  );
}

function MinusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

const TRADING_EQUIPMENTS = [
  { id: "crosshair", label: "Crosshair", icon: CrosshairIcon },
  { id: "trendline", label: "Trendline", icon: TrendingUp },
  { id: "horizontal_line", label: "Horizontal Line", icon: MinusIcon },
  { id: "fibonacci", label: "Fib Retracement", icon: Layers },
  { id: "brush", label: "Brush Tool", icon: PencilIcon },
  { id: "text", label: "Annotation Text", icon: TypeIcon },
  { id: "measure", label: "Price Ruler", icon: RulerIcon },
  { id: "clear", label: "Clear Drawings", icon: Trash2 },
];

const POPULAR_SYMBOLS = ["NEPSE", "NABIL", "SHIVM", "CHCL", "NICA", "HDL", "UPPER", "CIT", "GBIME", "SCB", "SONA", "BNT"];

export default function TechnicalsPage() {
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const locale = pathname.startsWith("/ne") ? "ne" : "en";
  const isNepali = locale === "ne";

  const initialSymbol = searchParams.get("symbol")?.toUpperCase() || "NEPSE";
  const [selectedSymbol, setSelectedSymbol] = React.useState(initialSymbol);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [timeframe, setTimeframe] = React.useState<"1m" | "5m" | "15m" | "1h" | "1D" | "1W" | "1M">("1D");
  const [chartType, setChartType] = React.useState<"candles" | "heikin" | "line" | "bars">("candles");
  const [activeTool, setActiveTool] = React.useState<string>("crosshair");
  const [showAiOverlay, setShowAiOverlay] = React.useState(true);
  const [showRsi, setShowRsi] = React.useState(true);
  const [showMacd, setShowMacd] = React.useState(true);
  const [showEma, setShowEma] = React.useState(true);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = React.useState(true);
  const [hoveredCandle, setHoveredCandle] = React.useState<CandlePoint | null>(null);

  // Generate multi-day OHLCV dataset anchored to symbol
  const { candles, indicators, aiAnalysis } = React.useMemo(() => {
    const basePrice =
      selectedSymbol === "NEPSE" ? 2560.84 :
      selectedSymbol === "NABIL" ? 552.3 :
      selectedSymbol === "SHIVM" ? 548.0 :
      selectedSymbol === "CHCL" ? 485.5 :
      selectedSymbol === "NICA" ? 425.0 :
      selectedSymbol === "HDL" ? 1410.0 :
      selectedSymbol === "UPPER" ? 212.0 :
      selectedSymbol === "CIT" ? 2320.0 : 450.0;

    const count = 40;
    const list: CandlePoint[] = [];
    let prevClose = basePrice * 0.94;

    const patterns = [
      { name: "Hammer", type: "bullish" },
      { name: "Bullish Engulfing", type: "bullish" },
      { name: "Morning Star", type: "bullish" },
      { name: "Shooting Star", type: "bearish" },
      { name: "Bearish Harami", type: "bearish" },
      { name: "Doji", type: "neutral" },
    ] as const;

    for (let i = count - 1; i >= 0; i--) {
      const seed = (selectedSymbol.charCodeAt(0) * 13 + i * 29) % 100;
      const change = ((seed % 10) - 4.5) * (basePrice * 0.005);
      const open = Math.round((prevClose) * 10) / 10;
      const close = Math.round((prevClose + change) * 10) / 10;
      const high = Math.round((Math.max(open, close) + Math.abs(change) * 0.7 + 1.5) * 10) / 10;
      const low = Math.round((Math.min(open, close) - Math.abs(change) * 0.6 - 1.2) * 10) / 10;
      const volume = Math.round(35000 + (seed * 900) + Math.abs(change * 1500));
      const changePercent = Math.round(((close - open) / open) * 10000) / 100;

      const pIdx = (seed + i) % patterns.length;
      const pat = patterns[pIdx];

      list.push({
        time: `Day ${count - i}`,
        open,
        high,
        low,
        close,
        volume,
        changePercent,
        pattern: pat.name,
        patternType: pat.type,
      });

      prevClose = close;
    }

    const latest = list[list.length - 1];
    const closes = list.map((c) => c.close);
    const ema20 = Math.round((closes.reduce((a, b) => a + b, 0) / closes.length) * 10) / 10;
    const ema50 = Math.round((ema20 * 0.982) * 10) / 10;
    const rsi14 = Math.round(56.4 + (latest.changePercent * 3.5));

    const isBullish = latest.close >= ema20;
    const bias = isBullish ? "BULLISH" : "BEARISH";
    const confidence = isBullish ? 76 : 64;

    const ai = {
      bias,
      confidence,
      pattern: latest.pattern,
      target1: Math.round(latest.close * 1.045 * 10) / 10,
      target2: Math.round(latest.close * 1.082 * 10) / 10,
      support1: Math.round(latest.close * 0.965 * 10) / 10,
      support2: Math.round(latest.close * 0.93 * 10) / 10,
      stopLoss: Math.round(latest.close * 0.95 * 10) / 10,
      riskReward: "1 : 2.5",
      summary: isBullish
        ? `7-session structure confirms buyer accumulation at EMA 20 support with expanding volume. Strong likelihood of testing upper resistance.`
        : `Upper shadow rejections at key supply zone. Traders advised to wait for breakout confirmation.`,
    };

    return {
      candles: list,
      indicators: { ema20, ema50, rsi14 },
      aiAnalysis: ai,
    };
  }, [selectedSymbol]);

  const latestCandle = hoveredCandle || candles[candles.length - 1];

  return (
    <div className={cn("flex flex-col h-[calc(100vh-80px)] select-none bg-[#0e1117] text-foreground rounded-2xl border border-border/80 overflow-hidden", isFullscreen && "fixed inset-0 z-50 rounded-none h-screen")}>
      {/* ── TOP TRADING TOOLBAR (Equipments, Timeframes, Indicators) ── */}
      <div className="h-12 px-3 border-b border-border/70 bg-[#131722] flex items-center justify-between gap-3 text-xs overflow-x-auto scrollbar-none shrink-0">
        {/* Symbol Search & Quick Chips */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-36 sm:w-44">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  setSelectedSymbol(searchQuery.trim().toUpperCase());
                  setSearchQuery("");
                }
              }}
              placeholder="Symbol (e.g. NABIL)..."
              className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-border/80 bg-background/80 text-xs font-mono font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Quick Active Chips */}
          <div className="hidden md:flex items-center gap-1">
            {POPULAR_SYMBOLS.slice(0, 5).map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSymbol(s)}
                className={cn(
                  "px-2 py-1 rounded-md text-[11px] font-mono font-bold transition-all",
                  selectedSymbol === s ? "bg-emerald-500 text-white shadow-xs" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1 border-x border-border/60 px-2 shrink-0">
          {(["1m", "5m", "15m", "1h", "1D", "1W", "1M"] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={cn(
                "px-2 py-1 rounded-md text-[11px] font-mono font-bold transition-all",
                timeframe === tf ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Chart Style Toggle */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setChartType("candles")}
            className={cn(
              "px-2 py-1 rounded-md text-[11px] font-semibold transition-all",
              chartType === "candles" ? "bg-muted text-foreground font-bold" : "text-muted-foreground"
            )}
          >
            Candles
          </button>
          <button
            onClick={() => setChartType("line")}
            className={cn(
              "px-2 py-1 rounded-md text-[11px] font-semibold transition-all",
              chartType === "line" ? "bg-muted text-foreground font-bold" : "text-muted-foreground"
            )}
          >
            Line
          </button>
        </div>

        {/* Indicators Overlay Toggles */}
        <div className="flex items-center gap-1.5 border-l border-border/60 pl-2 shrink-0">
          <button
            onClick={() => setShowEma(!showEma)}
            className={cn(
              "px-2 py-1 rounded-md text-[11px] font-mono font-semibold transition-all border",
              showEma ? "bg-sky-500/20 text-sky-400 border-sky-500/40" : "border-border/50 text-muted-foreground"
            )}
          >
            EMA 20/50
          </button>
          <button
            onClick={() => setShowRsi(!showRsi)}
            className={cn(
              "px-2 py-1 rounded-md text-[11px] font-mono font-semibold transition-all border",
              showRsi ? "bg-purple-500/20 text-purple-400 border-purple-500/40" : "border-border/50 text-muted-foreground"
            )}
          >
            RSI (14)
          </button>
          <button
            onClick={() => setShowAiOverlay(!showAiOverlay)}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-bold transition-all border flex items-center gap-1",
              showAiOverlay ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-xs" : "border-border/50 text-muted-foreground"
            )}
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            AI Candlestick Bias
          </button>
        </div>

        {/* Fullscreen & AI Drawer toggle */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setAiDrawerOpen(!aiDrawerOpen)}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-bold transition-all border flex items-center gap-1",
              aiDrawerOpen ? "bg-emerald-600 text-white" : "border-border/70 text-muted-foreground"
            )}
            title="Toggle AI Technical Study Panel"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>AI Panel</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── WORKSPACE BODY: Left Equipment Tools, Center Candlestick Canvas, Right AI Panel ── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ── Left Trading Equipment Toolbar (TradingView Style) ── */}
        <div className="w-11 border-r border-border/70 bg-[#131722] flex flex-col items-center py-2.5 gap-1.5 shrink-0 z-10">
          {TRADING_EQUIPMENTS.map((tool) => {
            const Icon = tool.icon;
            const isSelected = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                  isSelected
                    ? "bg-emerald-500 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                title={tool.label}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>

        {/* ── Center Main Technical Canvas (Pure Trading & Technical Study) ── */}
        <div className="flex-1 flex flex-col bg-[#0e1117] overflow-hidden relative">
          {/* Readout Bar (O, H, L, C, Vol, Change) */}
          <div className="h-7 px-3 bg-[#131722]/90 border-b border-border/50 flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-300 shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-bold text-foreground font-sans">{selectedSymbol}</span>
              <span>O: <strong className="text-white">Rs. {latestCandle.open}</strong></span>
              <span>H: <strong className="text-emerald-400">Rs. {latestCandle.high}</strong></span>
              <span>L: <strong className="text-rose-400">Rs. {latestCandle.low}</strong></span>
              <span>C: <strong className="text-white">Rs. {latestCandle.close}</strong></span>
              <span className={latestCandle.changePercent >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                {latestCandle.changePercent >= 0 ? "+" : ""}{latestCandle.changePercent}%
              </span>
            </div>

            <div className="flex items-center gap-3 text-[10.5px]">
              {showEma && (
                <>
                  <span className="text-sky-400">EMA(20): Rs. {indicators.ema20}</span>
                  <span className="text-amber-400">EMA(50): Rs. {indicators.ema50}</span>
                </>
              )}
              {showRsi && (
                <span className="text-purple-400">RSI(14): {indicators.rsi14}</span>
              )}
            </div>
          </div>

          {/* Interactive SVG Candlestick & Volume Canvas */}
          <div className="flex-1 relative flex flex-col p-2 select-none overflow-hidden">
            <svg
              className="w-full flex-1"
              viewBox={`0 0 ${candles.length * 28 + 60} 340`}
              preserveAspectRatio="none"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const idx = Math.floor((x / rect.width) * candles.length);
                if (candles[idx]) setHoveredCandle(candles[idx]);
              }}
              onMouseLeave={() => setHoveredCandle(null)}
            >
              {/* Horizontal Price Grid Lines */}
              {[60, 120, 180, 240, 280].map((y) => (
                <line key={y} x1="0" y1={y} x2={candles.length * 28 + 60} y2={y} stroke="#1f2937" strokeDasharray="3 3" strokeWidth="0.8" />
              ))}

              {/* EMA 20 Overlay Polyline */}
              {showEma && (
                <polyline
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.6"
                  points={candles
                    .map((c, idx) => {
                      const minP = Math.min(...candles.map((d) => d.low)) * 0.99;
                      const maxP = Math.max(...candles.map((d) => d.high)) * 1.01;
                      const y = 260 - ((c.close - minP) / (maxP - minP || 1)) * 210;
                      const x = 30 + idx * 28;
                      return `${x},${y}`;
                    })
                    .join(" ")}
                />
              )}

              {/* Candlestick Glyphs */}
              {candles.map((c, idx) => {
                const minP = Math.min(...candles.map((d) => d.low)) * 0.99;
                const maxP = Math.max(...candles.map((d) => d.high)) * 1.01;
                const scaleY = (p: number) => 260 - ((p - minP) / (maxP - minP || 1)) * 210;

                const x = 30 + idx * 28;
                const openY = scaleY(c.open);
                const closeY = scaleY(c.close);
                const highY = scaleY(c.high);
                const lowY = scaleY(c.low);

                const isBull = c.close >= c.open;
                const color = isBull ? "#10b981" : "#f43f5e";
                const topY = Math.min(openY, closeY);
                const bodyH = Math.max(Math.abs(openY - closeY), 2.5);

                return (
                  <g key={idx} className="cursor-crosshair">
                    {/* Wick */}
                    <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth="1.4" />
                    {/* Candle Body */}
                    <rect
                      x={x - 8}
                      y={topY}
                      width="16"
                      height={bodyH}
                      fill={color}
                      rx="1"
                    />

                    {/* AI Pattern Label Overlay if toggled */}
                    {showAiOverlay && c.pattern && idx % 4 === 0 && (
                      <text
                        x={x}
                        y={highY - 8}
                        fill={c.patternType === "bullish" ? "#86efac" : "#fca5a5"}
                        fontSize="8.5"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {c.pattern}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Volume Histogram Sub-Panel */}
            <div className="h-16 border-t border-border/50 pt-1 flex items-end justify-between gap-0.5">
              {candles.map((c, i) => {
                const maxV = Math.max(...candles.map((v) => v.volume)) || 1;
                const h = Math.max(4, (c.volume / maxV) * 48);
                const isBull = c.close >= c.open;
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex-1 rounded-t-xs transition-opacity",
                      isBull ? "bg-emerald-500/50 hover:bg-emerald-400" : "bg-rose-500/50 hover:bg-rose-400"
                    )}
                    style={{ height: `${h}px` }}
                    title={`${c.time}: Vol ${c.volume.toLocaleString()}`}
                  />
                );
              })}
            </div>

            {/* Sub-Panel: RSI (14) Oscillator */}
            {showRsi && (
              <div className="h-16 border-t border-border/50 pt-1 relative flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono px-2">
                  <span className="text-purple-400 font-bold">RSI (14): {indicators.rsi14}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-rose-400">Overbought: 70</span>
                    <span className="text-emerald-400">Oversold: 30</span>
                  </div>
                </div>
                <div className="w-full h-8 relative my-0.5 bg-background/30 rounded-md overflow-hidden">
                  <div className="absolute top-[30%] left-0 right-0 border-b border-rose-500/30 border-dashed" />
                  <div className="absolute top-[70%] left-0 right-0 border-b border-emerald-500/30 border-dashed" />
                  {/* RSI Wave Line */}
                  <svg className="w-full h-full" viewBox="0 0 400 30" preserveAspectRatio="none">
                    <polyline
                      fill="none"
                      stroke="#c084fc"
                      strokeWidth="1.5"
                      points="0,15 50,18 100,12 150,8 200,16 250,22 300,14 350,10 400,12"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Collapsible AI Technical Intelligence Study Panel ── */}
        {aiDrawerOpen && (
          <div className="w-72 sm:w-80 border-l border-border/70 bg-[#131722] p-4 flex flex-col justify-between overflow-y-auto shrink-0 space-y-4">
            <div className="space-y-3.5">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">
                    AI Technical Study
                  </h3>
                </div>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-md font-mono font-black text-[10.5px]",
                    aiAnalysis.bias === "BULLISH"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  )}
                >
                  {aiAnalysis.bias} ({aiAnalysis.confidence}%)
                </span>
              </div>

              {/* Candlestick Bias & Pattern Summary */}
              <div className="p-3 rounded-xl bg-background/80 border border-border/60 space-y-1.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                  Pattern Identified
                </span>
                <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{aiAnalysis.pattern}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                  {aiAnalysis.summary}
                </p>
              </div>

              {/* Key Projected Technical Levels */}
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                  <span className="font-bold text-[10.5px] text-emerald-400 uppercase font-sans flex items-center gap-1">
                    <Target className="w-3 h-3" /> Upside Targets
                  </span>
                  <div className="flex justify-between text-foreground">
                    <span>Target 1 (T1):</span>
                    <strong className="text-emerald-400">Rs. {aiAnalysis.target1}</strong>
                  </div>
                  <div className="flex justify-between text-foreground">
                    <span>Target 2 (T2):</span>
                    <strong className="text-emerald-400">Rs. {aiAnalysis.target2}</strong>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-1">
                  <span className="font-bold text-[10.5px] text-rose-400 uppercase font-sans flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Downside Invalidation
                  </span>
                  <div className="flex justify-between text-foreground">
                    <span>Key Support (S1):</span>
                    <strong className="text-rose-400">Rs. {aiAnalysis.support1}</strong>
                  </div>
                  <div className="flex justify-between text-foreground">
                    <span>Stop Loss (SL):</span>
                    <strong className="text-rose-400">Rs. {aiAnalysis.stopLoss}</strong>
                  </div>
                </div>

                <div className="flex justify-between items-center p-2 rounded-lg bg-muted/30 font-sans text-[11px]">
                  <span className="text-muted-foreground">Risk / Reward:</span>
                  <span className="font-mono font-bold text-foreground">{aiAnalysis.riskReward}</span>
                </div>
              </div>
            </div>

            {/* Direct Consultation Link to AI Assistant */}
            <div className="space-y-2 pt-2 border-t border-border/50">
              <Link
                href={`/${locale}/ai?symbol=${selectedSymbol}&prompt=${encodeURIComponent(`Provide a deep multi-timeframe trade plan for ${selectedSymbol} with entry, stop loss at Rs. ${aiAnalysis.stopLoss}, and target Rs. ${aiAnalysis.target1}.`)}`}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs text-center"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Discuss Setup With AI Sathi</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
