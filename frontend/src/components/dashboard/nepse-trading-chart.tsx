"use client";

import * as React from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChartPoint {
  time: string;
  full_time?: string;
  value: number;
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
}

// Generate smooth cubic bezier SVG path
function getSmoothPath(coords: { x: number; y: number }[]) {
  if (coords.length === 0) return "";
  if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;

  let d = `M ${coords[0].x.toFixed(2)} ${coords[0].y.toFixed(2)}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[Math.max(0, i - 1)];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[Math.min(coords.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
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
}: NepseTradingChartProps) {
  const [activeTimeframe, setActiveTimeframe] = React.useState(initialTimeframe);
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  const timeframes = ["1D", "1W", "1M", "3M", "1Y", "ALL"];

  const isPositive = pointChange > 0;
  const isNegative = pointChange < 0;
  const isNeutral = pointChange === 0;

  const gainColor = "#10b981";
  const lossColor = "#ef4444";
  const flatColor = "#3b82f6";
  const lineColor = isPositive ? gainColor : isNegative ? lossColor : flatColor;

  // Compute Min & Max for Y-axis scale
  const values = points.map((p) => p.value);
  const rawMin = values.length > 0 ? Math.min(...values) : indexValue - 20;
  const rawMax = values.length > 0 ? Math.max(...values) : indexValue + 20;

  const padding = Math.max(4, (rawMax - rawMin) * 0.18);
  const minY = Math.floor((rawMin - padding) / 5) * 5;
  const maxY = Math.ceil((rawMax + padding) / 5) * 5;
  const rangeY = Math.max(1, maxY - minY);

  // SVG dimensions
  const width = 800;
  const height = 300;
  const chartPaddingTop = 18;
  const chartPaddingBottom = 32;
  const chartPaddingLeft = 10;
  const chartPaddingRight = 58;

  const plotWidth = width - chartPaddingLeft - chartPaddingRight;
  const plotHeight = height - chartPaddingTop - chartPaddingBottom;

  // Opening reference value (first point)
  const openValue = points.length > 0 ? points[0].value : indexValue - pointChange;

  // Map data to SVG coordinates
  const coords = React.useMemo(() => {
    if (points.length === 0) return [];
    if (points.length === 1) {
      return [{ x: chartPaddingLeft + plotWidth / 2, y: chartPaddingTop + plotHeight / 2 }];
    }
    return points.map((p, i) => {
      const x = chartPaddingLeft + (i / (points.length - 1)) * plotWidth;
      const y = chartPaddingTop + plotHeight - ((p.value - minY) / rangeY) * plotHeight;
      return { x, y };
    });
  }, [points, minY, rangeY, plotWidth, plotHeight]);

  // Smooth bezier curve path
  const linePath = React.useMemo(() => getSmoothPath(coords), [coords]);

  // Area fill below curve
  const areaPath = React.useMemo(() => {
    if (coords.length === 0 || !linePath) return "";
    const first = coords[0];
    const last = coords[coords.length - 1];
    const bottomY = chartPaddingTop + plotHeight;
    return `${linePath} L ${last.x.toFixed(2)} ${bottomY} L ${first.x.toFixed(2)} ${bottomY} Z`;
  }, [coords, linePath, plotHeight]);

  // Opening line Y position
  const openLineY = React.useMemo(() => {
    return chartPaddingTop + plotHeight - ((openValue - minY) / rangeY) * plotHeight;
  }, [openValue, minY, rangeY, plotHeight]);

  // Y-axis tick labels (6 ticks for better resolution)
  const yTicks = React.useMemo(() => {
    const ticks = [];
    const step = rangeY / 5;
    for (let i = 0; i <= 5; i++) {
      ticks.push(Math.round(minY + step * i));
    }
    return ticks;
  }, [minY, rangeY]);

  // Hover interactions
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || coords.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;

    let closestIdx = 0;
    let minDiff = Infinity;
    coords.forEach((pt, idx) => {
      const diff = Math.abs(pt.x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });
    setHoverIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const activePoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;
  const activeCoord = hoverIndex !== null && coords[hoverIndex] ? coords[hoverIndex] : null;

  const displayValue = activePoint ? activePoint.value : indexValue;
  const displayChange = activePoint && activePoint.change !== undefined ? activePoint.change : pointChange;
  const displayPct = activePoint && activePoint.percent_change !== undefined ? activePoint.percent_change : percentChange;

  const dispPositive = displayChange > 0;
  const dispNegative = displayChange < 0;

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-3">
      {/* Header matching NEPSE Portal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/40 pb-3">
        {/* Left: Index Title, Live Price & % Change */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              NEPSE Index
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="flex items-baseline gap-2.5 flex-wrap">
            <span className="text-2xl sm:text-3xl font-black text-foreground tracking-tight font-mono">
              {displayValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>

            <div
              className={cn(
                "inline-flex items-center gap-1 text-xs font-bold font-mono px-2 py-0.5 rounded-md",
                dispPositive && "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
                dispNegative && "text-red-500 dark:text-red-400 bg-red-500/10",
                !dispPositive && !dispNegative && "text-blue-500 dark:text-blue-400 bg-blue-500/10"
              )}
            >
              {dispPositive && <ArrowUp className="w-3 h-3 stroke-[3]" />}
              {dispNegative && <ArrowDown className="w-3 h-3 stroke-[3]" />}
              {!dispPositive && !dispNegative && <Minus className="w-3 h-3 stroke-[3]" />}
              <span>
                {displayChange > 0 ? `+${displayChange.toFixed(2)}` : displayChange.toFixed(2)}
              </span>
              <span>
                ({displayPct > 0 ? `+${displayPct.toFixed(2)}%` : `${displayPct.toFixed(2)}%`})
              </span>
            </div>
          </div>
        </div>

        {/* Right: Turnover & Traded Shares + Timeframe switches */}
        <div className="flex flex-col md:items-end gap-2">
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
            <span>
              Turnover:{" "}
              <strong className="text-foreground font-semibold">
                {turnover > 0
                  ? `Rs. ${(turnover / 10000000).toFixed(2)} Cr`
                  : "—"}
              </strong>
            </span>
            <span className="text-border">|</span>
            <span>
              Vol:{" "}
              <strong className="text-foreground font-semibold">
                {totalShares > 0 ? totalShares.toLocaleString("en-US") : "—"}
              </strong>
            </span>
          </div>

          {/* Timeframe Buttons */}
          <div className="flex items-center gap-1 bg-muted/60 rounded-xl p-0.5 self-start md:self-end">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => {
                  setActiveTimeframe(tf);
                  onTimeframeChange?.(tf);
                }}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                  activeTimeframe === tf
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SVG Interactive Financial Area Chart */}
      <div className="relative w-full h-64 sm:h-72 select-none">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-xs flex items-center justify-center z-20">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full cursor-crosshair overflow-visible"
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Gain gradient (green) */}
            <linearGradient id="areaGradGain" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gainColor} stopOpacity="0.35" />
              <stop offset="50%" stopColor={gainColor} stopOpacity="0.12" />
              <stop offset="100%" stopColor={gainColor} stopOpacity="0.02" />
            </linearGradient>
            {/* Loss gradient (red) */}
            <linearGradient id="areaGradLoss" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lossColor} stopOpacity="0.35" />
              <stop offset="50%" stopColor={lossColor} stopOpacity="0.12" />
              <stop offset="100%" stopColor={lossColor} stopOpacity="0.02" />
            </linearGradient>
            {/* Flat gradient (blue) */}
            <linearGradient id="areaGradFlat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={flatColor} stopOpacity="0.30" />
              <stop offset="50%" stopColor={flatColor} stopOpacity="0.10" />
              <stop offset="100%" stopColor={flatColor} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines & Y-axis labels */}
          {yTicks.map((val, idx) => {
            const y = chartPaddingTop + plotHeight - ((val - minY) / rangeY) * plotHeight;
            return (
              <g key={idx}>
                <line
                  x1={chartPaddingLeft}
                  y1={y}
                  x2={width - chartPaddingRight}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.07"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={width - chartPaddingRight + 8}
                  y={y + 4}
                  fill="currentColor"
                  className="text-[9px] font-mono fill-muted-foreground font-semibold"
                  textAnchor="start"
                >
                  {val.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Opening Reference Dashed Line */}
          {points.length > 1 && (
            <g>
              <line
                x1={chartPaddingLeft}
                y1={openLineY}
                x2={width - chartPaddingRight}
                y2={openLineY}
                stroke={lineColor}
                strokeOpacity="0.3"
                strokeWidth="1"
                strokeDasharray="6 4"
              />
              <text
                x={width - chartPaddingRight + 8}
                y={openLineY + 3}
                fill={lineColor}
                className="text-[8px] font-mono font-bold"
                textAnchor="start"
                opacity="0.6"
              >
                Open
              </text>
            </g>
          )}

          {/* Area Fill */}
          {areaPath && (
            <path
              d={areaPath}
              fill={
                isPositive
                  ? "url(#areaGradGain)"
                  : isNegative
                  ? "url(#areaGradLoss)"
                  : "url(#areaGradFlat)"
              }
            />
          )}

          {/* Spline Line Path */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={lineColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Apex Dot at latest point when not hovering */}
          {hoverIndex === null && coords.length > 0 && (
            <g>
              <circle
                cx={coords[coords.length - 1].x}
                cy={coords[coords.length - 1].y}
                r="3.5"
                fill={lineColor}
              />
              <circle
                cx={coords[coords.length - 1].x}
                cy={coords[coords.length - 1].y}
                r="7"
                fill={lineColor}
                fillOpacity="0.25"
                className="animate-ping"
              />
            </g>
          )}

          {/* Crosshair & Hover Tooltip */}
          {activeCoord && activePoint && (
            <g className="transition-all duration-75">
              {/* Vertical Crosshair */}
              <line
                x1={activeCoord.x}
                y1={chartPaddingTop}
                x2={activeCoord.x}
                y2={chartPaddingTop + plotHeight}
                stroke="currentColor"
                strokeOpacity="0.30"
                strokeWidth="1"
                strokeDasharray="2 2"
              />

              {/* Horizontal Crosshair */}
              <line
                x1={chartPaddingLeft}
                y1={activeCoord.y}
                x2={width - chartPaddingRight}
                y2={activeCoord.y}
                stroke="currentColor"
                strokeOpacity="0.30"
                strokeWidth="1"
                strokeDasharray="2 2"
              />

              {/* Point Dot */}
              <circle
                cx={activeCoord.x}
                cy={activeCoord.y}
                r="4.5"
                fill={lineColor}
                stroke="white"
                strokeWidth="2"
              />

              {/* Y-axis label at crosshair */}
              <rect
                x={width - chartPaddingRight + 2}
                y={activeCoord.y - 8}
                width="52"
                height="16"
                rx="3"
                fill={lineColor}
                fillOpacity="0.9"
              />
              <text
                x={width - chartPaddingRight + 28}
                y={activeCoord.y + 3}
                fill="white"
                className="text-[9px] font-mono font-bold"
                textAnchor="middle"
              >
                {activePoint.value.toFixed(2)}
              </text>

              {/* Tooltip Box */}
              <foreignObject
                x={Math.min(width - 190, Math.max(10, activeCoord.x - 90))}
                y={Math.max(5, activeCoord.y - 68)}
                width="180"
                height="58"
                className="overflow-visible pointer-events-none"
              >
                <div className="bg-popover/95 backdrop-blur-md border border-border/90 shadow-lg rounded-xl p-2 text-center text-xs space-y-0.5">
                  <div className="flex items-center justify-center gap-1.5 font-bold text-foreground">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lineColor }} />
                    <span>NEPSE: {activePoint.value.toFixed(2)}</span>
                    <span
                      className={cn(
                        "text-[10px]",
                        (activePoint.change || 0) > 0 ? "text-emerald-500" : (activePoint.change || 0) < 0 ? "text-red-500" : "text-blue-500"
                      )}
                    >
                      {(activePoint.change || 0) > 0 ? "+" : ""}
                      {(activePoint.change || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    {activePoint.full_time || activePoint.time}
                  </div>
                </div>
              </foreignObject>
            </g>
          )}

          {/* Time axis text labels at bottom */}
          {points.length > 0 &&
            [0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const pIdx = Math.min(points.length - 1, Math.floor(pct * (points.length - 1)));
              const pt = points[pIdx];
              const x = chartPaddingLeft + pct * plotWidth;
              return (
                <text
                  key={idx}
                  x={x}
                  y={height - 8}
                  fill="currentColor"
                  className="text-[9px] font-mono fill-muted-foreground font-semibold"
                  textAnchor="middle"
                >
                  {pt?.time}
                </text>
              );
            })}
        </svg>
      </div>
    </div>
  );
}
