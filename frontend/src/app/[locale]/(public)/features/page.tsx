"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  TrendingUp,
  Activity,
  Search,
  ArrowRight,
  PieChart,
  BarChart3,
  Calculator,
  Layers,
  BookOpen,
  LineChart,
  Clock,
  Target,
  History,
  Sparkles,
  Play,
  ShieldCheck,
  CheckCircle2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { CtaBanner } from "@/components/cta-banner";
import { cn } from "@/lib/utils";

export default function FeaturesPage() {
  const pathname = usePathname() || "/en";
  const locale = pathname.startsWith("/ne") ? "ne" : "en";
  const isNepali = locale === "ne";

  // 12 Concrete, Verified NEPSE Sathi Platform Features
  const featuresList = [
    {
      num: "01",
      tag: isNepali ? "संस्थागत संकलन ट्र्याकर" : "Smart Money Tracker",
      title: isNepali ? "प्रत्यक्ष फ्लोरशीट र ब्रोकर एनालिटिक्स" : "Live Floorsheet & Broker Analytics",
      tagline: isNepali
        ? "शीर्ष ५० ब्रोकरहरूको खरीद-बिक्री प्रवाह र संस्थागत संकलन ट्र्याक गर्नुहोस्।"
        : "Track top 50 broker buy/sell flows, accumulation zones, and block deals in real time.",
      description: isNepali
        ? "नेपालका सम्पूर्ण ब्रोकर हाउसहरूको दैनिक कारोबारलाई प्रत्यक्ष विश्लेषण गरी कुन ब्रोकरले कुन सेयरमा ठूलो लगानी गरिरहेका छन् भन्ने स्पष्ट दृश्य पाउनुहोस्।"
        : "Unmask institutional footprints. Real-time transaction filtering by stock symbol or broker number with live net accumulation heatmaps.",
      chips: isNepali
        ? ["शीर्ष ५० ब्रोकर खरिद/बिक्री", "कम्पनी र ब्रोकर फिल्टर", "ठूला ब्लक अर्डर अलर्ट", "ऐतिहासिक होल्डिङ विश्लेषण"]
        : ["Top 50 Broker Flow", "Net Buy/Sell Breakdown", "Bulk Block Trade Alerts", "Historical Accumulation"],
      href: `/${locale}/floorsheet`,
      icon: Activity,
    },
    {
      num: "02",
      tag: isNepali ? "एआई-सञ्चालित आउटलुक" : "Multi-Model AI",
      title: isNepali ? "एआई प्राविधिक विश्लेषण र बजार आउटलुक" : "AI Technical Intelligence & Outlook",
      tagline: isNepali
        ? "RSI, MACD, र EMA Ribbons को स्वचालित व्याख्या तथा नीतिगत प्रभाव।"
        : "Automated indicator confluence, momentum scoring, and NRB policy synthesis.",
      description: isNepali
        ? "घण्टौं लाग्ने चार्ट विश्लेषणलाई एआईले केही सेकेन्डमै संक्षेप गर्दछ। क्यान्डलस्टिक ढाँचा, मुभिङ एभरेज र राष्ट्र बैंकका नीतिको प्रभाव स्पष्ट बुझाउँछ।"
        : "Save hours of manual charting. Our neural engine evaluates multi-timeframe candlestick patterns, RSI divergences, and macro circulars instantly.",
      chips: isNepali
        ? ["स्वचालित EMA रिबन", "RSI/MACD डायभर्जेन्स", "राष्ट्र बैंक नीति सारांश", "दैनिक बिहानी विश्लेषण"]
        : ["EMA 20/50/200 Ribbons", "RSI Divergences", "NRB Policy Synthesis", "Daily Morning Briefs"],
      href: `/${locale}/ai`,
      icon: Sparkles,
    },
    {
      num: "03",
      tag: isNepali ? "सटीक हिसाब र कर" : "Exact Accounting & CGT",
      title: isNepali ? "स्मार्ट WACC, लाभांश र कर व्यवस्थापन" : "Smart WACC, Dividends & CGT Ledger",
      tagline: isNepali
        ? "नाफा-नोक्सान, बोनस सेयर, हकप्रद र पूँजीगत लाभकरको स्वचालित हिसाब।"
        : "Automate true WACC, bonus/right adjustments, dividend yields, and CGT deductions.",
      description: isNepali
        ? "झन्झटिला एक्सेल सिटहरू बिना आफ्नो सम्पूर्ण सेयरको भारित औसत लागत (WACC), बोनस र हकप्रद समायोजन, र पूँजीगत लाभकर (CGT) को सही हिसाब राख्नुहोस्।"
        : "Replace spreadsheets with an automated ledger. Recalculates exact WACC, factors in SEBON fees and brokerage, and estimates your net Capital Gains Tax.",
      chips: isNepali
        ? ["वास्तविक WACC हिसाब", "बोनस/हकप्रद समायोजन", "पूँजीगत लाभकर (५%/७.५%)", "नाफा-नोक्सान सारांश"]
        : ["Automated WACC", "Bonus/Right Accounting", "CGT (5% / 7.5%) Deductions", "Realized vs Unrealized PnL"],
      href: `/${locale}/portfolio`,
      icon: PieChart,
    },
    {
      num: "04",
      tag: isNepali ? "१-क्लिक सामूहिक नतिजा" : "1-Click Bulk Checker",
      title: isNepali ? "आईपीओ हब र सामूहिक नतिजा जाँच" : "IPO Hub & Bulk BOID Checker",
      tagline: isNepali
        ? "साधारण सेयर, हकप्रदको स्वीकृति क्यालेन्डर र सम्पूर्ण परिवारको नतिजा जाँच।"
        : "Track SEBON pipeline status and verify allotments for entire family BOIDs in 1 click.",
      description: isNepali
        ? "नेपालको प्राथमिक बजारका सबै अवसरहरू ट्र्याक गर्नुहोस्। साधारण सेयर (IPO), हकप्रद, ऋणपत्रको समयतालिका र एकै क्लिकमा परिवारका सबै डिम्याटको नतिजा हेर्नुहोस्।"
        : "Track upcoming public offerings from SEBON pipeline to allotment. Check results for all family BOIDs simultaneously with zero lag.",
      chips: isNepali
        ? ["सामूहिक BOID नतिजा जाँच", "सेबोन स्वीकृति पाइपलाइन", "इक्रा क्रेडिट रेटिङ", "आवेदन खुल्ने/बन्द मिति"]
        : ["1-Click Bulk Family BOID", "SEBON Pipeline Tracker", "Credit Ratings Breakdown", "Opening/Closing Alerts"],
      href: `/${locale}/ipo`,
      icon: Layers,
    },
    {
      num: "05",
      tag: isNepali ? "ट्रेडिङभ्यु चार्टिङ" : "TradingView Grade",
      title: isNepali ? "इन्टरएक्टिभ क्यान्डलस्टिक र प्राविधिक चार्ट" : "Interactive Candlestick & Technical Charts",
      tagline: isNepali
        ? "बहु-समयसीमा क्यान्डलस्टिक, स्वचालित समर्थन र अवरोध स्तरहरू।"
        : "Dynamic support/resistance pivot zones, EMA overlays, and volume breakout alerts.",
      description: isNepali
        ? "इन्टरएक्टिभ क्यान्डलस्टिक चार्टिङ मार्फत बजारको समर्थन (Support) र अवरोध (Resistance) विन्दुहरू पत्ता लगाउनुहोस् र भोल्युम ब्रेकआउटहरू पहिचान गर्नुहोस्।"
        : "Interactive charting engine equipped with automated pivot zones, multi-timeframe overlays, and volume indicators tailored for NEPSE securities.",
      chips: isNepali
        ? ["TradingView क्यान्डलस्टिक", "स्वचालित समर्थन/अवरोध", "भोल्युम ब्रेकआउट अलर्ट", "सेक्टर स्ट्रेन्थ स्कोर"]
        : ["TradingView Candlesticks", "Automated S&R Pivots", "Volume Breakout Signals", "Sector Strength Matrix"],
      href: `/${locale}/technicals`,
      icon: LineChart,
    },
    {
      num: "06",
      tag: isNepali ? "बजार पूर्वानुमान" : "Predictive Modeling",
      title: isNepali ? "प्रि-ओपन तथा बजार बन्द हुने दायरा पूर्वानुमान" : "Pre-Open & Market Close Forecast",
      tagline: isNepali
        ? "विगतको डाटा र प्रि-ओपन तरलताको आधारमा सम्भावित बजार दायरा अनुमान।"
        : "Predict probable opening gaps and closing bands based on pre-open depth & cycles.",
      description: isNepali
        ? "बजार खुल्नु अगाडिको अर्डर बुक असन्तुलन र विगत १० वर्षको समान ढाँचाहरूको अध्ययन गरी नेप्से परिसूचक कस्तो दायरामा खुल्न वा बन्द हुन सक्छ भन्ने अनुमान पाउनुहोस्।"
        : "Gain clarity before the bell rings. Analyzes pre-open depth imbalances and historical volatility to project intraday trading bands.",
      chips: isNepali
        ? ["प्रि-ओपन अर्डर बुक राडार", "अपेक्षित क्लोजिङ दायरा", "बजार सेन्टिमेन्ट स्कोर", "८०%+ सम्भाव्यता मोडेल"]
        : ["Pre-Open Depth Imbalance", "Expected Trading Band", "Sentiment Oscillator", "Confidence Modeling"],
      href: `/${locale}/market`,
      icon: Clock,
    },
    {
      num: "07",
      tag: isNepali ? "ट्रेडिङ मनोविज्ञान" : "Trading Psychology",
      title: isNepali ? "गोपनीय ट्रेड जर्नल र मनोविज्ञान डायरी" : "Disciplined Trade Journal & R:R Log",
      tagline: isNepali
        ? "प्रत्येक ट्रेडको कारण, जोखिम-प्रतिफल (R:R), र जित्ने दर (Win Rate) ट्र्याक गर्नुहोस्।"
        : "Log trade rationale, validate Risk-to-Reward setups, and analyze win-rate performance.",
      description: isNepali
        ? "सफल लगानीकर्ता बन्न आफ्ना निर्णयहरूको अभिलेख राख्नुहोस्। किन सेयर किनियो, स्टप-लस कहाँ थियो, र कस्तो नतिजा आयो भन्ने कुरा नोट गरी अनुशासन विकास गर्नुहोस्।"
        : "Mastery in trading comes from reflection. Document entry/exit rationale, validate Risk-to-Reward ratios, and analyze win rate and profit factor.",
      chips: isNepali
        ? ["जोखिम-प्रतिफल (R:R) हिसाब", "ट्रेड जित्ने दर (Win Rate)", "प्रि-ट्रेड नियम चेकलिस्ट", "ट्रेडिङ गल्तीहरूको समीक्षा"]
        : ["Risk-to-Reward (R:R) Log", "Win-Rate Analytics", "Pre-Trade Checklist", "Psychology Notes"],
      href: `/${locale}/journal`,
      icon: Target,
    },
    {
      num: "08",
      tag: isNepali ? "३००+ कम्पनी विवरण" : "300+ Listed Equities",
      title: isNepali ? "स्मार्ट स्टक स्क्रिनर र कम्पनी प्रोफाइल" : "Multi-Metric Stock Screener & Fundamentals",
      tagline: isNepali
        ? "P/E, P/B, EPS, ROE, र १० वर्षको लाभांश इतिहासको आधारमा कम्पनी छनौट।"
        : "Screen 300+ listed equities by valuation multiples, quarterly growth, and dividend payouts.",
      description: isNepali
        ? "नेप्सेमा सूचीकृत सबै कम्पनीहरूको वित्तीय स्वास्थ्य जाँच गर्नुहोस्। प्रति सेयर आम्दानी (EPS), मूल्य-आम्दानी अनुपात (P/E), नेटवर्थ र लाभांश इतिहासको आधारमा बलिया कम्पनीहरू खोज्नुहोस्।"
        : "Discover high-conviction opportunities. Filter listed companies by P/E, EPS growth, Return on Equity (ROE), 52-week price ranges, and 10-year dividend ledgers.",
      chips: isNepali
        ? ["P/E, EPS, ROE स्क्रिनिङ", "१० वर्षे लाभांश इतिहास", "त्रैमासिक वित्तीय विवरण", "प्रत्यक्ष अर्डर बुक डेप्थ"]
        : ["Multi-Metric Screener", "10-Year Dividend History", "Quarterly Statement Comparison", "Top 5 Order Depth"],
      href: `/${locale}/stocks`,
      icon: BarChart3,
    },
    {
      num: "09",
      tag: isNepali ? "१३ उप-समूह हब" : "13 Sector Heatmaps",
      title: isNepali ? "लाइभ बजार हब र १३ सेक्टर हिटम्याप" : "Live Market Hub & 13 Sector Heatmaps",
      tagline: isNepali
        ? "नेप्से, सेन्सेटिभ, फ्लोट र सबै १३ सेक्टरहरूको प्रत्यक्ष गतिशीलता।"
        : "Real-time index updates, turnover velocity, advance/decline ratios, and market depth.",
      description: isNepali
        ? "नेप्से इन्डेक्स, बैंकिङ, जलविद्युत, उत्पादन, माइक्रोफाइनान्स लगायत सबै १३ वटा उप-समूहहरूको प्रत्यक्ष अवस्था, कारोबार रकमको गति, र बजारको चौडाइ एउटै स्क्रिनमा हेर्नुहोस्।"
        : "Monitor the entire heartbeat of the Nepali market. Track real-time index values, sector rotation momentum, market turnover velocity, and top gainers/losers.",
      chips: isNepali
        ? ["१३ वटै सेक्टरको प्रत्यक्ष सूचक", "शीर्ष कमाउने/गुमाउने सूची", "कारोबार रकमको गतिशीलता", "बजार स्थिति (LIVE, EOD)"]
        : ["13 Sub-Sector Heatmaps", "Top Gainers & Losers", "Turnover Barometer", "Live Data Status (11AM-3PM)"],
      href: `/${locale}/market`,
      icon: Activity,
    },
    {
      num: "10",
      tag: isNepali ? "विगत १० वर्षको सिकाई" : "10-Year Replay Lab",
      title: isNepali ? "ऐतिहासिक चक्र ल्याब र नीतिगत सिकाई" : "Historical Cycle Lab & Policy Learning",
      tagline: isNepali
        ? "२०१६ र २०२१ का बजार चक्र, राष्ट्र बैंकका नीति र सेयरको प्रतिक्रिया बुझ्नुहोस्।"
        : "Learn from historic bull/bear cycles: how stocks reacted to interest rates and credit caps.",
      description: isNepali
        ? "नयाँ लगानीकर्ताहरूलाई बजारको उतार-चढाव बुझ्न मद्दत गर्न, NEPSE Sathi ले विगत १० वर्षका बुल र बियर चक्रहरूको सिकाई प्रदान गर्दछ। ब्याजदर परिवर्तनले सेयरमा पारेको प्रभाव सजिलै सिक्नुहोस्।"
        : "Avoid classic retail traps. Explore interactive replays of historic NEPSE bull runs and corrections, and understand how bank interest rate cycles impact stock valuations.",
      chips: isNepali
        ? ["२०१६/२०२१ चक्र तुलना", "ब्याजदर र बजार सम्बन्ध", "नयाँ लगानीकर्ता गाइड", "ऐतिहासिक मूल्य प्रतिक्रिया"]
        : ["2016 vs 2021 Cycle Overlays", "Interest Rate Correlation", "Retail Trap Prevention", "Historical Price Reactions"],
      href: `/${locale}/ai`,
      icon: History,
    },
    {
      num: "11",
      tag: isNepali ? "सूचना र समाचार" : "Timely Disclosures",
      title: isNepali ? "वित्तीय समाचार, लाभांश र एजीएम सूचना" : "Financial News, Dividends & AGM Alerts",
      tagline: isNepali
        ? "नेपालका प्रमुख वित्तीय पोर्टल र सेबोनका आधिकारिक सूचनाहरू एकै ठाउँमा।"
        : "Aggregated market news, dividend announcements, book closures, and regulatory filings.",
      description: isNepali
        ? "ShareSansar, Merolagani लगायतका विश्वसनीय स्रोतहरूबाट संकलित ताजा बजार समाचार, लाभांश घोषणा (Dividend Declaration), हकप्रद सेयर स्वीकृति, र वार्षिक साधारण सभा (AGM) का सूचनाहरू तत्काल पाउनुहोस्।"
        : "Never miss a critical market catalyst. Aggregated validated financial news from leading Nepali portals alongside official company disclosures and dividend book closure dates.",
      chips: isNepali
        ? ["लाभांश घोषणा सूचना", "बुक क्लोज र AGM मिति", "सेबोन/NRB परिपत्र अलर्ट", "समाचार सेन्टिमेन्ट ट्यागिङ"]
        : ["Dividend Declarations", "Book Closure Dates", "SEBON Circulars", "AI Impact Sentiment"],
      href: `/${locale}/news`,
      icon: BookOpen,
    },
    {
      num: "12",
      tag: isNepali ? "वित्तीय हिसाब" : "100% Tax Compliant",
      title: isNepali ? "ब्रोकर कमिसन, कर र SIP क्यालकुलेटर" : "Brokerage, Tax (CGT) & SIP Suite",
      tagline: isNepali
        ? "सेबोन शुल्क, डिपी शुल्क, व्यक्तिगत/संस्थागत कर र लाभांश समायोजनको हिसाब।"
        : "Calculate exact net buy/sell costs, SEBON/DP fees, bonus adjustments, and SIP returns.",
      description: isNepali
        ? "सेयर खरिद वा बिक्री गर्दा लाग्ने प्रत्येक रुपैयाँको सही हिसाब गर्नुहोस्। ब्रोकर कमिसन स्ल्याब, सेबोन ०.०१५% शुल्क, डिपि रु. २५, पूँजीगत लाभकर, र हकप्रदपछिको समायोजित मूल्य तुरुन्तै निकाल्नुहोस्।"
        : "Complete financial transparency. Calculate tiered brokerage commissions, SEBON regulatory fees, Demat charges, individual vs corporate CGT, and post-bonus price adjustments.",
      chips: isNepali
        ? ["आधिकारिक ब्रोकर स्ल्याब", "५% र ७.५% लाभकर हिसाब", "हकप्रद/बोनस समायोजन", "SIP चक्रबृद्धि प्रक्षेपण"]
        : ["Tiered Brokerage Fees", "5% vs 7.5% CGT Solver", "Right Share Adjustment Price", "SIP Compound Simulator"],
      href: `/${locale}/tools`,
      icon: Calculator,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-20 sm:space-y-24">
      {/* ========================================================================= */}
      {/* 1. HERO SHOWCASE SECTION (Clean, Balanced & Modern Emerald Aesthetic)     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center pt-2 sm:pt-6">
        {/* Left Column: Heading, Subtitle & Action Buttons */}
        <div className="lg:col-span-6 space-y-6">
          <Badge
            variant="outline"
            className="px-3.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1.5 shadow-xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{isNepali ? "सुविधाहरू" : "Features"}</span>
          </Badge>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.12]">
            {isNepali ? (
              <>
                स्मार्ट लगानीका लागि <br />
                <span className="text-emerald-600 dark:text-emerald-400">आवश्यक सबै १२ सुविधाहरू</span>
              </>
            ) : (
              <>
                Everything You Need to <br />
                <span className="text-emerald-600 dark:text-emerald-400">Trade Smarter</span>
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg">
            {isNepali
              ? "नेप्से साथीले प्रत्यक्ष फ्लोरशीट, एआई प्राविधिक विश्लेषण, WACC पोर्टफोलियो, सामूहिक आईपीओ नतिजा, र स्टक स्क्रिनरलाई एउटै उच्च-गतिको प्लेटफर्ममा एकीकृत गरेको छ।"
              : "Nepse Sathi brings you institutional floorsheet flows, AI technical intelligence, exact WACC accounting, bulk IPO checking, and stock screening — all unified in one high-performance interface."}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={`/${locale}/auth/register`}
              className={cn(
                buttonVariants({ size: "lg" }),
                "rounded-full gap-2 px-6 h-11 text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 cursor-pointer transition-all"
              )}
            >
              <span>{isNepali ? "निःशुल्क सुरु गर्नुहोस्" : "Get Started Free"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={`/${locale}/technicals`}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-full gap-2 px-5 h-11 text-xs sm:text-sm font-semibold border-border hover:bg-muted text-foreground cursor-pointer"
              )}
            >
              <Play className="w-3.5 h-3.5 fill-current text-emerald-600 dark:text-emerald-400" />
              <span>{isNepali ? "लाइभ चार्ट हेर्नुहोस्" : "Explore Live Charts"}</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Floating Visual Preview Widgets */}
        <div className="lg:col-span-6 relative">
          {/* Ambient Glow */}
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Decorative Upward Green Arrow in background */}
          <div className="absolute -top-4 right-2 text-emerald-500/20 dark:text-emerald-400/20 select-none pointer-events-none hidden sm:block">
            <TrendingUp className="w-24 h-24 stroke-[1.5]" />
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
            {/* Center Card: Live NEPSE Stock & Gainers Card */}
            <div className="sm:col-span-7 rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-lg space-y-4">
              {/* Search bar */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/40 border border-border/60 text-xs text-muted-foreground">
                <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-[11px] truncate">Search 300+ NEPSE stocks...</span>
              </div>

              {/* NEPSE Index Box */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-[10px] font-bold">
                      N
                    </div>
                    <span className="text-xs font-bold text-foreground">NEPSE Index</span>
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-foreground tracking-tight font-mono">
                  2,748.36
                </div>
                <div className="text-[11px] font-bold text-emerald-600 font-mono">
                  +32.45 (1.19%)
                </div>
              </div>

              {/* Sparkline curve */}
              <div className="h-12 w-full">
                <svg viewBox="0 0 240 50" className="w-full h-full" preserveAspectRatio="none">
                  <path
                    d="M 0 42 Q 40 40 80 28 T 160 16 T 240 8"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Timeframe filters */}
              <div className="flex justify-between items-center text-[10px] font-semibold text-muted-foreground border-t border-border/40 pt-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[9px]">1D</span>
                <span>1W</span>
                <span>1M</span>
                <span>3M</span>
                <span>1Y</span>
                <span>ALL</span>
              </div>

              {/* Mini Top Gainers Table */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold text-foreground">Top Gainers (Live)</div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center justify-between text-muted-foreground text-[10px] pb-0.5 border-b border-border/40 font-medium">
                    <span>Symbol</span>
                    <span>LTP</span>
                    <span>Change%</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span className="font-bold text-foreground">NABIL</span>
                    <span className="text-muted-foreground font-mono">1,620.00</span>
                    <span className="font-bold text-emerald-600 font-mono">+4.21%</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span className="font-bold text-foreground">NRIC</span>
                    <span className="text-muted-foreground font-mono">1,280.50</span>
                    <span className="font-bold text-emerald-600 font-mono">+3.76%</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span className="font-bold text-foreground">SICL</span>
                    <span className="text-muted-foreground font-mono">703.00</span>
                    <span className="font-bold text-emerald-600 font-mono">+3.12%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side Stacked Mini Cards */}
            <div className="sm:col-span-5 space-y-4">
              {/* Market Overview Card */}
              <div className="rounded-3xl border border-border/80 bg-card p-4 shadow-md space-y-2.5">
                <div className="text-xs font-bold text-foreground">Market Overview</div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Total Turnover</span>
                    <span className="font-bold text-foreground font-mono">8.42B</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Total Traded Shares</span>
                    <span className="font-bold text-foreground font-mono">12.56M</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Total Transactions</span>
                    <span className="font-bold text-foreground font-mono">68,342</span>
                  </div>
                </div>
              </div>

              {/* Top Sectors Card */}
              <div className="rounded-3xl border border-border/80 bg-card p-4 shadow-md space-y-2">
                <div className="text-xs font-bold text-foreground">Top Sectors</div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between py-0.5">
                    <span className="flex items-center gap-1.5 text-foreground font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Banking</span>
                    </span>
                    <span className="font-bold text-emerald-600 font-mono">+2.41%</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span className="flex items-center gap-1.5 text-foreground font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Hydro</span>
                    </span>
                    <span className="font-bold text-emerald-600 font-mono">+3.76%</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span className="flex items-center gap-1.5 text-foreground font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Insurance</span>
                    </span>
                    <span className="font-bold text-emerald-600 font-mono">+2.98%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 12 POWERFUL FEATURES GRID (Clean & Cohesive 3x4 Layout)                 */}
      {/* ========================================================================= */}
      <div className="space-y-10">
        {/* Section Header */}
        <div className="space-y-2">
          <Badge
            variant="outline"
            className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1.5 shadow-xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{isNepali ? "हाम्रा सुविधाहरू" : "Our Features"}</span>
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {isNepali ? "१२ शक्तिशाली र उपयोगी सुविधाहरू" : "12 Powerful Features"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isNepali
              ? "तपाईंको लगानी विश्लेषण, ट्र्याकिङ र वृद्धिका लागि आवश्यक सबै कुरा—एउटै सरल ठाउँमा।"
              : "Everything you need to analyze, track, and grow your investments — simplified in one place."}
          </p>
        </div>

        {/* 3x4 Grid of 12 Streamlined Compact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuresList.map((f) => (
            <div
              key={f.num}
              className="group rounded-2xl border border-border/80 bg-card hover:bg-card/90 p-5 sm:p-6 flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-lg transition-all duration-200"
            >
              <div className="space-y-3.5">
                {/* Card Top: Icon, Tag Badge, Number */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200 shrink-0">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 border-emerald-500/20">
                      {f.tag}
                    </Badge>
                    <span className="text-xs font-mono font-bold text-muted-foreground/40 group-hover:text-emerald-600 transition-colors">
                      {f.num}
                    </span>
                  </div>
                </div>

                {/* Title & Concise Summary */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                    {f.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {f.tagline}
                  </p>
                </div>

                {/* Micro Capabilities Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {f.chips.slice(0, 3).map((chip, cIdx) => (
                    <span
                      key={cIdx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-muted/60 text-muted-foreground group-hover:text-foreground group-hover:bg-emerald-500/5 transition-colors"
                    >
                      <span className="w-1 h-1 rounded-full bg-emerald-500" />
                      <span>{chip}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Link */}
              <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                <Link
                  href={f.href}
                  className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform"
                >
                  <span>{isNepali ? "सुरु गर्नुहोस्" : "Explore Tool"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>{isNepali ? "निःशुल्क" : "Free Access"}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2.5 TRADITIONAL PORTALS vs. NEPSE SATHI COMPARISON MATRIX               */}
      {/* ========================================================================= */}
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <Badge
            variant="outline"
            className="px-3.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1.5 shadow-xs mx-auto"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{isNepali ? "किन NEPSE Sathi?" : "Why NEPSE Sathi?"}</span>
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {isNepali ? "परम्परागत पोर्टल vs. NEPSE Sathi" : "Traditional Portals vs. NEPSE Sathi"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
            {isNepali
              ? "५ वटा फरक पोर्टल, म्यानुअल एक्सेल, र ढिलो फिडहरू जुगल गर्न छोड्नुहोस्।"
              : "Stop juggling 5 disconnected portals, manual spreadsheets, and delayed feeds."}
          </p>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-lg">
          {/* Table Header */}
          <div className="grid grid-cols-12 text-xs font-bold uppercase tracking-wider border-b border-border/60">
            <div className="col-span-6 sm:col-span-5 px-5 sm:px-6 py-4 text-muted-foreground">
              {isNepali ? "सुविधा / क्षमता" : "Feature / Capability"}
            </div>
            <div className="col-span-3 sm:col-span-4 px-3 sm:px-4 py-4 text-center text-muted-foreground">
              {isNepali ? "छुट्टा पोर्टलहरू" : "Fragmented Portals"}
            </div>
            <div className="col-span-3 px-3 sm:px-4 py-4 text-center text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
              NEPSE Sathi Pro
            </div>
          </div>

          {/* Comparison Rows */}
          {[
            {
              feature: isNepali ? "प्रत्यक्ष फ्लोरशीट र ब्रोकर एनालिटिक्स" : "Live Floorsheet & Broker Analytics",
              old: isNepali ? "छुट्टा डाटा स्रोतहरू" : "Fragmented Data Sources",
              sathi: isNepali ? "एकीकृत प्रत्यक्ष विश्लेषण" : "Unified Real-time Analytics",
            },
            {
              feature: isNepali ? "एआई प्राविधिक विश्लेषण" : "AI Technical Analysis & Outlook",
              old: isNepali ? "म्यानुअल चार्ट हेर्ने" : "Manual Chart Reading",
              sathi: isNepali ? "स्वचालित AI-सञ्चालित सारांश" : "AI-Powered Auto Summary",
            },
            {
              feature: isNepali ? "स्मार्ट WACC र कर हिसाब" : "Smart WACC & CGT Calculation",
              old: isNepali ? "एक्सेल स्प्रेडशीट" : "Excel Spreadsheets",
              sathi: isNepali ? "स्वचालित पोर्टफोलियो लेजर" : "Automated Portfolio Ledger",
            },
            {
              feature: isNepali ? "सामूहिक IPO नतिजा जाँच" : "Bulk IPO Result Checking",
              old: isNepali ? "एक-एक गरी BOID जाँच" : "One-by-one BOID Check",
              sathi: isNepali ? "१-क्लिकमा परिवार सबै BOID" : "1-Click Family BOID Check",
            },
            {
              feature: isNepali ? "इन्टरएक्टिभ क्यान्डलस्टिक चार्ट" : "Interactive Candlestick Charts",
              old: isNepali ? "स्थिर स्क्रिनशट" : "Static Screenshots",
              sathi: isNepali ? "TradingView-ग्रेड इन्टरएक्टिभ" : "TradingView-Grade Interactive",
            },
            {
              feature: isNepali ? "बजार पूर्वानुमान र प्रि-ओपन" : "Market Forecast & Pre-Open Data",
              old: isNepali ? "उपलब्ध छैन" : "Not Available",
              sathi: isNepali ? "AI-सञ्चालित पूर्वानुमान" : "AI-Powered Predictions",
            },
            {
              feature: isNepali ? "ट्रेड जर्नल र मनोविज्ञान" : "Trade Journal & Psychology Diary",
              old: isNepali ? "उपलब्ध छैन" : "Not Available",
              sathi: isNepali ? "बिल्ट-इन R:R ट्र्याकर" : "Built-in R:R Tracker",
            },
            {
              feature: isNepali ? "१३ सेक्टर हिटम्याप" : "13 Sector Heatmaps",
              old: isNepali ? "आंशिक सेक्टर डाटा" : "Partial Sector Data",
              sathi: isNepali ? "सम्पूर्ण प्रत्यक्ष हिटम्याप" : "Full Real-time Heatmaps",
            },
          ].map((row, idx) => (
            <div
              key={idx}
              className={`grid grid-cols-12 text-xs sm:text-sm border-b border-border/40 last:border-0 ${
                idx % 2 === 0 ? "" : "bg-muted/20"
              }`}
            >
              <div className="col-span-6 sm:col-span-5 px-5 sm:px-6 py-3.5 font-medium text-foreground">
                {row.feature}
              </div>
              <div className="col-span-3 sm:col-span-4 px-3 sm:px-4 py-3.5 flex items-center justify-center gap-1.5 text-muted-foreground">
                <X className="w-4 h-4 text-red-500 shrink-0" />
                <span className="hidden sm:inline text-xs">{row.old}</span>
              </div>
              <div className="col-span-3 px-3 sm:px-4 py-3.5 flex items-center justify-center gap-1.5 bg-emerald-500/5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="hidden sm:inline text-xs font-medium text-emerald-700 dark:text-emerald-400">{row.sathi}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. READY TO START YOUR INVESTMENT JOURNEY? CTA BANNER                    */}
      {/* ========================================================================= */}
      <CtaBanner locale={locale} noPadding />
    </div>
  );
}
