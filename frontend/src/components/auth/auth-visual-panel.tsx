"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  TrendingUp,
  PieChart,
  Bell,
  ShieldCheck,
} from "lucide-react";

interface AuthVisualPanelProps {
  locale: string;
  isNepali?: boolean;
}

export function AuthVisualPanel({ locale, isNepali = false }: AuthVisualPanelProps) {
  const [activeTab, setActiveTab] = React.useState<"1D" | "1W" | "1M" | "1Y" | "ALL">("1D");

  const topGainers = [
    { symbol: "NRIC", change: "+6.21%" },
    { symbol: "NABIL", change: "+4.32%" },
    { symbol: "SBI", change: "+3.87%" },
    { symbol: "NICA", change: "+3.12%" },
    { symbol: "LBBL", change: "+2.76%" },
  ];

  return (
    <div className="hidden lg:flex lg:w-1/2 relative bg-[#031512] text-white overflow-hidden flex-col justify-between p-10 xl:p-14 selection:bg-emerald-500/30">
      {/* Background Gradients & Glows */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#06241e]/90 via-[#031512] to-[#020e0c] pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-emerald-500/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-[450px] h-[450px] bg-teal-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 left-1/4 w-[400px] h-[400px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Subtle Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #10b981 1px, transparent 1px), linear-gradient(to bottom, #10b981 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* 1. TOP BAR: Logo + Tagline */}
      <div className="relative z-10 flex items-center justify-between">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg"
        >
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <Image
              src="/logo.png"
              alt="NEPSE Sathi Logo"
              width={40}
              height={40}
              className="w-10 h-10 object-contain group-hover:scale-105 transition-transform"
              priority
            />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            NEPSE<span className="text-emerald-400 font-extrabold">Sathi</span>
          </span>
        </Link>

        <div className="text-xs text-emerald-300/80 font-medium tracking-wide">
          <span>{isNepali ? "स्मार्ट लगानी" : "Smarter Investing"}</span>
          <span className="mx-2 text-emerald-600">/</span>
          <span className="text-emerald-400">{isNepali ? "उज्यालो भविष्य" : "Brighter Future"}</span>
        </div>
      </div>

      {/* 2. CENTER CONTENT: Headlines + 3 Bullets + 3D Device Card */}
      <div className="relative z-10 my-auto py-6 space-y-7 max-w-xl">
        {/* Headlines */}
        <div className="space-y-2.5">
          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
            <span>{isNepali ? "तपाईंको सारथी" : "Your Partner in"}</span>{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(16,185,129,0.35)]">
              {isNepali ? "स्मार्ट लगानीको लागि" : "Smarter Investing"}
            </span>
          </h2>
          <p className="text-sm text-emerald-100/75 leading-relaxed max-w-md">
            {isNepali
              ? "NEPSE बजार ट्र्याक गर्नुहोस्, कम्पनीहरूको विश्लेषण गर्नुहोस् र सही निर्णय लिनुहोस् — सबै एकै ठाउँमा।"
              : "Track the NEPSE market, analyze stocks, and make better decisions — all in one place."}
          </p>
        </div>

        {/* 3 Feature Bullets */}
        <div className="space-y-3">
          {/* Bullet 1 */}
          <div className="flex items-center gap-3.5 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:border-emerald-400/60 transition-colors shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-tight">
                {isNepali ? "प्रत्यक्ष बजार तथ्याङ्क" : "Real-time Market Data"}
              </div>
              <div className="text-[11px] text-emerald-200/60">
                {isNepali ? "प्रत्यक्ष अपडेटहरू र सही चार्टहरू" : "Live updates, accurate charts"}
              </div>
            </div>
          </div>

          {/* Bullet 2 */}
          <div className="flex items-center gap-3.5 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:border-emerald-400/60 transition-colors shadow-sm">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-tight">
                {isNepali ? "पोर्टफोलियो ट्र्याकिङ" : "Portfolio Tracking"}
              </div>
              <div className="text-[11px] text-emerald-200/60">
                {isNepali ? "आफ्नो सम्पूर्ण लगानी निगरानी गर्नुहोस्" : "Monitor your investments"}
              </div>
            </div>
          </div>

          {/* Bullet 3 */}
          <div className="flex items-center gap-3.5 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:border-emerald-400/60 transition-colors shadow-sm">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-tight">
                {isNepali ? "स्मार्ट अलर्टहरू" : "Smart Alerts"}
              </div>
              <div className="text-[11px] text-emerald-200/60">
                {isNepali ? "महत्त्वपूर्ण मूल्य परिवर्तन कहिल्यै नछुटाउनुहोस्" : "Never miss important changes"}
              </div>
            </div>
          </div>
        </div>

        {/* 3D FLOATING DEVICE & TOP GAINERS COMPOSITION */}
        <div className="relative pt-3 pb-2">
          {/* Main Tilted Glass Tablet */}
          <div className="relative w-full max-w-[370px] rounded-2xl bg-[#06201b]/90 border border-emerald-500/30 backdrop-blur-xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.7)] transition-transform hover:-translate-y-1 duration-300">
            {/* Tablet Header */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-300/80 tracking-wider">NEPSE</span>
                <div className="text-2xl font-extrabold font-mono text-white tracking-tight mt-0.5">
                  2,748.36
                </div>
                <div className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                  <span>+32.45 (1.19%)</span>
                </div>
              </div>
            </div>

            {/* Glowing Rising Stock Chart SVG */}
            <div className="h-28 w-full mt-2 relative">
              <svg
                viewBox="0 0 340 100"
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="chartGlowArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                    <stop offset="60%" stopColor="#10b981" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="chartStrokeGlow" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="50%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                  <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Area Fill */}
                <path
                  d="M 0 85 Q 40 78, 80 82 T 150 68 T 220 54 T 270 38 T 340 12 L 340 100 L 0 100 Z"
                  fill="url(#chartGlowArea)"
                />

                {/* Glowing Line */}
                <path
                  d="M 0 85 Q 40 78, 80 82 T 150 68 T 220 54 T 270 38 T 340 12"
                  fill="none"
                  stroke="url(#chartStrokeGlow)"
                  strokeWidth="2.5"
                  filter="url(#neonGlow)"
                />

                {/* Endpoint Pulsing Dot */}
                <circle cx="340" cy="12" r="4.5" fill="#34d399" className="animate-pulse" />
                <circle cx="340" cy="12" r="8" fill="#10b981" opacity="0.35" />
              </svg>
            </div>

            {/* Timeframe Selectors */}
            <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-emerald-500/20 text-[11px] font-mono">
              {(["1D", "1W", "1M", "1Y", "ALL"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-2.5 py-0.5 rounded-md font-medium transition-all ${
                    activeTab === tab
                      ? "bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-500/30"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Floating Companion Card: Top Gainers */}
          <div className="absolute -right-2 sm:right-2 -bottom-4 w-44 rounded-xl bg-[#041d18]/95 border border-emerald-500/35 backdrop-blur-xl p-3 shadow-[0_15px_35px_rgba(0,0,0,0.8)] z-20 space-y-2">
            <div className="text-[11px] font-bold text-white flex items-center justify-between pb-1.5 border-b border-emerald-500/20">
              <span>{isNepali ? "शीर्ष लाभकर्ता" : "Top Gainers"}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="space-y-1 font-mono text-[10px]">
              {topGainers.map((stock) => (
                <div key={stock.symbol} className="flex items-center justify-between py-0.5">
                  <span className="font-semibold text-white/90">{stock.symbol}</span>
                  <span className="text-emerald-400 font-bold">{stock.change}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM FOOTER: Secure & Reliable */}
      <div className="relative z-10 pt-4 flex items-center gap-3 text-xs text-emerald-200/80">
        <div className="w-8 h-8 rounded-lg bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <div className="font-bold text-white text-xs">
            {isNepali ? "सुरक्षित र भरपर्दो" : "Secure & Reliable"}
          </div>
          <div className="text-[11px] text-emerald-300/60">
            {isNepali ? "तपाईंको डाटा सधैं सुरक्षित छ" : "Your data is always protected"}
          </div>
        </div>
      </div>
    </div>
  );
}
