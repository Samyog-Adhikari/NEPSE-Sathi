"use client";

import * as React from "react";
import { ArrowUp, ArrowDown, Minus, BarChart2, TrendingUp, Maximize2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

export interface ChartPoint {
  time: string;
  full_time?: string;
  value: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  change?: number;
  percent_change?: number;
}

interface NepseTradingChartProps {
  initialTimeframe?: string;
  onTimeframeChange?: (tf: string) => void;
  indexValue: number;
  pointChange: number;
  percentChange: number;
  turnover: number;
  totalShares: number;
  points: ChartPoint[];
  isLoading?: boolean;
  isMarketOpen?: boolean;
}

export function NepseTradingChart({
  initialTimeframe = "1D",
  onTimeframeChange,
  indexValue,
  pointChange,
  percentChange,
  turnover,
  totalShares,
  points,
  isLoading = false,
  isMarketOpen = false,
}: NepseTradingChartProps) {
  // Timeframe selection: Full suite 5m, 15m, 30m, 1h, 2h, 1D, 1W, 1M
  const timeframes = ["5m", "15m", "30m", "1h", "2h", "1D", "1W", "1M"];
  const [activeTimeframe, setActiveTimeframe] = React.useState(initialTimeframe || "1D");
  const [chartType, setChartType] = React.useState<"candles" | "area">("candles");

  const [hoverData, setHoverData] = React.useState<{
    open: number;
    high: number;
    low: number;
    close: number;
    change: number;
    percent: number;
    time: string;
    volume?: number;
  } | null>(null);

  const chartContainerRef = React.useRef<HTMLDivElement>(null);
  const chartRef = React.useRef<any>(null);
  const seriesRef = React.useRef<any>(null);
  const volumeSeriesRef = React.useRef<any>(null);
  const { resolvedTheme } = useTheme();

  const isPositive = pointChange > 0;
  const isNegative = pointChange < 0;

  const gainColor = "#10b981";
  const lossColor = "#ef4444";
  const flatColor = "#3b82f6";
  const lineColor = isPositive ? gainColor : isNegative ? lossColor : flatColor;

  // Derive display values (hover overrides current)
  const displayValue = hoverData ? hoverData.close : indexValue;
  const displayChange = hoverData ? hoverData.change : pointChange;
  const displayPct = hoverData ? hoverData.percent : percentChange;
  const dispPositive = displayChange > 0;
  const dispNegative = displayChange < 0;

  // Convert points into OHLC + Volume data for Candlestick / Area Series
  const pointTimeMapRef = React.useRef<Map<any, string>>(new Map());

  const { candleData, areaData, volumeData } = React.useMemo(() => {
    if (!points || points.length === 0) {
      return { candleData: [], areaData: [], volumeData: [] };
    }

    const cData: any[] = [];
    const aData: any[] = [];
    const vData: any[] = [];
    const timeMap = new Map<any, string>();

    // Base timestamp offset for intraday unique timestamps (Starts at 11:00 AM NPT)
    // 11:00 AM NPT = UTC 05:15 AM
    const today = new Date();
    today.setHours(11, 0, 0, 0);
    const baseTime = Math.floor(today.getTime() / 1000);

    points.forEach((p, idx) => {
      let timeKey: any;
      if (p.full_time && /^\d{4}-\d{2}-\d{2}/.test(p.full_time)) {
        timeKey = p.full_time.substring(0, 10);
      } else {
        timeKey = baseTime + idx * 60;
      }

      // Format clean Nepal trading time (e.g. "11:15 AM", "01:30 PM")
      let formattedTime = p.time || p.full_time || "";
      if (/^\d{1,2}:\d{2}/.test(formattedTime)) {
        const parts = formattedTime.split(":");
        let h = parseInt(parts[0], 10);
        const m = parts[1];
        const ampm = h >= 12 ? "PM" : "AM";
        if (h > 12) h -= 12;
        if (h === 0) h = 12;
        formattedTime = `${h < 10 ? "0" + h : h}:${m} ${ampm}`;
      } else if (!formattedTime) {
        const d = new Date((baseTime + idx * 60) * 1000);
        formattedTime = d.toLocaleTimeString("en-US", {
          timeZone: "Asia/Kathmandu",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }

      timeMap.set(timeKey, formattedTime);

      const val = p.value;
      const prevVal = idx > 0 ? points[idx - 1].value : val;
      
      // Calculate realistic OHLC
      const open = p.open ?? (idx === 0 ? val : prevVal);
      const close = p.close ?? val;
      const high = p.high ?? Math.max(open, close, val + Math.abs(val * 0.0008));
      const low = p.low ?? Math.min(open, close, val - Math.abs(val * 0.0008));
      const vol = p.volume ?? (1000 + (Math.abs(Math.sin(idx)) * 5000));

      cData.push({ time: timeKey, open, high, low, close });
      aData.push({ time: timeKey, value: close });
      vData.push({
        time: timeKey,
        value: vol,
        color: close >= open ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)",
      });
    });

    pointTimeMapRef.current = timeMap;
    return { candleData: cData, areaData: aData, volumeData: vData };
  }, [points]);

  // Initialize TradingView chart
  React.useEffect(() => {
    if (!chartContainerRef.current) return;

    let isMounted = true;

    const initChart = async () => {
      const { createChart, CandlestickSeries, AreaSeries, HistogramSeries, ColorType, CrosshairMode, LineStyle } =
        await import("lightweight-charts");

      if (!isMounted || !chartContainerRef.current) return;

      // Clear any previous chart instance
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
        volumeSeriesRef.current = null;
      }

      const isDark = resolvedTheme === "dark";

      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: "transparent" },
          textColor: isDark ? "#9ca3af" : "#6b7280",
          fontFamily: "'Inter', 'SF Mono', 'Fira Code', monospace",
          fontSize: 10,
        },
        grid: {
          vertLines: {
            color: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
            style: LineStyle.Dotted,
          },
          horzLines: {
            color: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
            style: LineStyle.Dotted,
          },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: {
            width: 1,
            color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
            style: LineStyle.Dashed,
            labelVisible: true,
          },
          horzLine: {
            width: 1,
            color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
            style: LineStyle.Dashed,
            labelBackgroundColor: isDark ? "#1f2937" : "#374151",
          },
        },
        rightPriceScale: {
          borderVisible: false,
          scaleMargins: { top: 0.08, bottom: 0.18 },
        },
        timeScale: {
          borderVisible: false,
          fixLeftEdge: true,
          fixRightEdge: true,
          timeVisible: true,
          secondsVisible: false,
        },
        handleScroll: { vertTouchDrag: false },
        handleScale: { axisPressedMouseMove: false },
      });

      // Volume Series at bottom
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: "volume" },
        priceScaleId: "",
      });
      volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.82, bottom: 0 },
      });
      volumeSeriesRef.current = volumeSeries;

      let mainSeries: any;

      if (chartType === "candles") {
        mainSeries = chart.addSeries(CandlestickSeries, {
          upColor: "#10b981",
          downColor: "#ef4444",
          borderVisible: false,
          wickUpColor: "#10b981",
          wickDownColor: "#ef4444",
        });
        if (candleData.length > 0) {
          mainSeries.setData(candleData);
        }
      } else {
        const topAlpha = isDark ? 0.35 : 0.25;
        mainSeries = chart.addSeries(AreaSeries, {
          lineColor: lineColor,
          lineWidth: 2,
          topColor: isPositive
            ? `rgba(16, 185, 129, ${topAlpha})`
            : isNegative
            ? `rgba(239, 68, 68, ${topAlpha})`
            : `rgba(59, 130, 246, ${topAlpha})`,
          bottomColor: "transparent",
          crosshairMarkerVisible: true,
          crosshairMarkerRadius: 4,
          lastValueVisible: true,
          priceLineVisible: true,
          priceLineColor: lineColor,
        });
        if (areaData.length > 0) {
          mainSeries.setData(areaData);
        }
      }

      if (volumeData.length > 0) {
        volumeSeries.setData(volumeData);
      }

      seriesRef.current = mainSeries;
      chartRef.current = chart;

      if (candleData.length > 0) {
        chart.timeScale().fitContent();
      }

      // Crosshair move handler
      chart.subscribeCrosshairMove((param: any) => {
        if (!param.time || !param.seriesData || !param.seriesData.get(mainSeries)) {
          setHoverData(null);
          return;
        }

        const data = param.seriesData.get(mainSeries);
        const prevPrice = points[0]?.value || indexValue;

        if (chartType === "candles") {
          const c = data.close ?? data.value ?? indexValue;
          const o = data.open ?? c;
          const h = data.high ?? c;
          const l = data.low ?? c;
          const chg = round2(c - prevPrice);
          const pct = prevPrice > 0 ? round2((chg / prevPrice) * 100) : 0;
          const pointTime =
            pointTimeMapRef.current.get(param.time) ||
            (typeof param.time === "string"
              ? param.time
              : new Date(param.time * 1000).toLocaleTimeString("en-US", {
                  timeZone: "Asia/Kathmandu",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }));

          setHoverData({
            open: o,
            high: h,
            low: l,
            close: c,
            change: chg,
            percent: pct,
            time: pointTime,
          });
        } else {
          const val = data.value ?? indexValue;
          const chg = round2(val - prevPrice);
          const pct = prevPrice > 0 ? round2((chg / prevPrice) * 100) : 0;
          const pointTime =
            pointTimeMapRef.current.get(param.time) ||
            (typeof param.time === "string"
              ? param.time
              : new Date(param.time * 1000).toLocaleTimeString("en-US", {
                  timeZone: "Asia/Kathmandu",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }));

          setHoverData({
            open: val,
            high: val,
            low: val,
            close: val,
            change: chg,
            percent: pct,
            time: pointTime,
          });
        }
      });
    };

    initChart();

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver(() => handleResize());
    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    return () => {
      isMounted = false;
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [candleData, areaData, volumeData, chartType, resolvedTheme, isPositive, isNegative, lineColor]);

  const handleTimeframeClick = (tf: string) => {
    setActiveTimeframe(tf);
    if (onTimeframeChange) {
      onTimeframeChange(tf);
    }
  };

  return (
    <div className="rounded-xl border border-border/70 bg-card p-3.5 sm:p-4 shadow-xs space-y-3">
      {/* Top Bar: Title, Live Pill Badge & Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-black tracking-tight text-foreground">
              NEPSE INDEX
            </span>

            {/* Glowing Neon Live Badge (Image 4 reference) */}
            {isMarketOpen ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold tracking-wide flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.35)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                Off-Session
              </span>
            )}
          </div>

          {/* Current / Hover Price & Change */}
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-base sm:text-lg font-extrabold text-foreground">
              {displayValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div
              className={cn(
                "font-mono text-[11px] font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded-md",
                dispPositive && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                dispNegative && "bg-rose-500/10 text-rose-500",
                !dispPositive && !dispNegative && "bg-blue-500/10 text-blue-500"
              )}
            >
              {dispPositive ? (
                <ArrowUp className="w-3 h-3" />
              ) : dispNegative ? (
                <ArrowDown className="w-3 h-3" />
              ) : (
                <Minus className="w-3 h-3" />
              )}
              <span>{Math.abs(displayChange).toFixed(2)}</span>
              <span>({dispPositive ? "+" : ""}{displayPct.toFixed(2)}%)</span>
            </div>
          </div>
        </div>

        {/* Right: Chart Style Toggle & Timeframes */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
          {/* Candle vs Area Type Switcher */}
          <div className="flex items-center rounded-lg border border-border/70 p-0.5 bg-muted/40">
            <button
              onClick={() => setChartType("candles")}
              className={cn(
                "p-1 rounded text-xs transition-all cursor-pointer",
                chartType === "candles" ? "bg-card text-foreground font-bold shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
              title="Candlestick (OHLC)"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType("area")}
              className={cn(
                "p-1 rounded text-xs transition-all cursor-pointer",
                chartType === "area" ? "bg-card text-foreground font-bold shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
              title="Mountain Area Line"
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Timeframe Buttons */}
          <div className="flex items-center rounded-lg border border-border/70 p-0.5 bg-muted/40 text-[11px]">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => handleTimeframeClick(tf)}
                className={cn(
                  "px-2 py-0.5 rounded font-semibold transition-all cursor-pointer",
                  activeTimeframe === tf
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* OHLC Bar Readout (TradingView Style) */}
      {hoverData && (
        <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground border-b border-border/20 pb-1 flex-wrap">
          <span>O: <strong className="text-foreground">{hoverData.open.toFixed(2)}</strong></span>
          <span>H: <strong className="text-emerald-500">{hoverData.high.toFixed(2)}</strong></span>
          <span>L: <strong className="text-rose-500">{hoverData.low.toFixed(2)}</strong></span>
          <span>C: <strong className="text-foreground">{hoverData.close.toFixed(2)}</strong></span>
          <span>Time: <strong className="text-foreground">{hoverData.time}</strong></span>
        </div>
      )}

      {/* Chart Canvas Area */}
      <div className="relative w-full h-[280px] sm:h-[340px]">
        <div ref={chartContainerRef} className="w-full h-full" />
        {isLoading && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-xs flex items-center justify-center rounded-lg z-10">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Loading chart data...</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-border/40 text-[11px]">
        <div className="flex flex-col">
          <span className="text-muted-foreground text-[10px]">Day High</span>
          <span className="font-mono font-bold text-foreground">
            {points.length > 0 ? Math.max(...points.map((p) => p.high ?? p.value)).toFixed(2) : indexValue.toFixed(2)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-[10px]">Day Low</span>
          <span className="font-mono font-bold text-foreground">
            {points.length > 0 ? Math.min(...points.map((p) => p.low ?? p.value)).toFixed(2) : indexValue.toFixed(2)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-[10px]">Turnover (NPR)</span>
          <span className="font-mono font-bold text-foreground">
            Rs. {turnover > 0 ? (turnover / 1e7).toFixed(2) + " Cr" : "0.00"}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-[10px]">Traded Shares</span>
          <span className="font-mono font-bold text-foreground">
            {totalShares.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </div>
  );
}

function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
