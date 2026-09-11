"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  TrendingUp,
  Sprout,
  Users,
  Code2,
  Palette,
  BarChart3,
  Headphones,
  MapPin,
  CheckCircle2,
  Shield,
  GraduationCap,
  Sparkles,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AboutPage() {
  const pathname = usePathname() || "/en";
  const locale = pathname.startsWith("/ne") ? "ne" : "en";
  const isNepali = locale === "ne";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-24 sm:space-y-32">
      {/* ========================================================================= */}
      {/* 1. HERO — "Built for Nepal's Investors, by People Who Care."              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center pt-2 sm:pt-6">
        {/* Left column */}
        <div className="lg:col-span-6 space-y-6">
          <Badge
            variant="outline"
            className="px-3.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1.5 shadow-xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{isNepali ? "NEPSE Sathi बारे" : "About NEPSE Sathi"}</span>
          </Badge>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.12]">
            {isNepali ? (
              <>
                नेपालका लगानीकर्ताका लागि,
                <br />
                <span className="text-emerald-600 dark:text-emerald-400">
                  साँच्चै माया गर्ने मानिसहरूबाट।
                </span>
              </>
            ) : (
              <>
                Built for Nepal&apos;s
                <br />
                Investors, by People
                <br />
                <span className="text-emerald-600 dark:text-emerald-400">
                  Who Care.
                </span>
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg">
            {isNepali
              ? "NEPSE Sathi एक आधुनिक लगानी साथी हो जसले सेयर बजारलाई सरल, पहुँचयोग्य, र सबैका लागि — नयाँदेखि अनुभवी लगानीकर्तासम्म — अन्तरदृष्टिपूर्ण बनाउँछ।"
              : "NEPSE Sathi is a modern investment companion designed to make the stock market simple, accessible, and insightful for everyone — from beginners to experienced investors."}
          </p>

          {/* Bullet highlights */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-foreground pt-1">
            <span className="flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span className="font-medium">
                {isNepali ? "स्मार्ट अन्तरदृष्टि" : "Smarter insights"}
              </span>
            </span>
            <span className="text-muted-foreground/50">/</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-medium">
                {isNepali ? "उत्तम निर्णय" : "Better decisions"}
              </span>
            </span>
            <span className="text-muted-foreground/50">/</span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" />
              <span className="font-medium">
                {isNepali
                  ? "बलियो लगानी समुदाय"
                  : "A stronger investing community"}
              </span>
            </span>
          </div>
        </div>

        {/* Right column — Real Kathmandu Temple & Himalayas image + floating elements */}
        <div className="lg:col-span-6 relative">
          {/* Ambient glow */}
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Main illustration container with real photograph */}
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-border/70 shadow-2xl bg-muted group">
            <Image
              src="/images/about/kathmandu-temple.jpg"
              alt="Kathmandu Pagoda Temple with Himalayan Mountains"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />

            {/* Subtle gradient vignette to blend beautifully */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

            {/* Floating NEPSE Index card in top right */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 rounded-2xl border border-white/30 dark:border-white/15 bg-card/90 dark:bg-card/85 backdrop-blur-md p-3.5 sm:p-4 shadow-2xl space-y-1 min-w-[155px] transform transition-transform hover:-translate-y-0.5">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                NEPSE Index
              </div>
              <div className="text-xl sm:text-2xl font-black text-foreground tracking-tight font-mono">
                2,748.36
              </div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-3 h-3" />
                ▲ +32.45 (1.19%)
              </div>
              {/* Mini sparkline */}
              <svg
                viewBox="0 0 120 28"
                className="w-full h-5 mt-1"
                preserveAspectRatio="none"
              >
                <path
                  d="M 0 24 Q 25 20 45 16 T 85 9 T 120 4"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Floating location badge on bottom right */}
            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-card/90 dark:bg-card/85 backdrop-blur-md border border-white/30 dark:border-white/15 shadow-lg text-xs font-semibold text-foreground">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Kathmandu, Nepal</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. OUR MISSION — "Democratizing Stock Market Knowledge in Nepal."         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
        {/* Left: Text */}
        <div className="lg:col-span-5 space-y-5">
          <Badge
            variant="outline"
            className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1.5 shadow-xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{isNepali ? "हाम्रो उद्देश्य" : "Our Mission"}</span>
          </Badge>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            {isNepali ? (
              <>
                नेपालमा सेयर बजार
                <br />
                ज्ञानको लोकतन्त्रीकरण।
              </>
            ) : (
              <>
                Democratizing
                <br />
                Stock Market Knowledge
                <br />
                in Nepal.
              </>
            )}
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {isNepali
              ? "हामी विश्वास गर्दछौं कि प्रत्येक व्यक्ति भरपर्दो जानकारी, शक्तिशाली उपकरण, र सजिलो अन्तरदृष्टिको हकदार छ। हाम्रो उद्देश्य सेयर बजार अनुभवलाई सरल बनाउनु र तपाईंलाई स्मार्ट, डाटा-आधारित निर्णय गर्न मद्दत गर्नु हो — तपाईंको यात्रा जहाँ भए पनि।"
              : "We believe that everyone deserves access to reliable information, powerful tools, and easy-to-understand insights. Our mission is to simplify the stock market experience and help you make smarter, data-driven decisions — no matter where you are in your journey."}
          </p>

          {/* Cursive "Grow Together" accent with decorative underline */}
          <div className="pt-2 inline-block">
            <span
              className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 italic block"
              style={{ fontFamily: "'Caveat', 'Segoe Script', 'Brush Script MT', cursive" }}
            >
              {isNepali ? "सँगै बढौं" : "Grow Together"}
            </span>
            <svg
              className="w-32 h-3 text-emerald-600 dark:text-emerald-400 mt-1"
              viewBox="0 0 128 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 2 8 C 30 2, 70 2, 126 7 C 90 9, 45 10, 10 10"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Right: App Preview photo with overlapping Goal card */}
        <div className="lg:col-span-7 relative">
          {/* Main App Mockup Image Container */}
          <div className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden border border-border/80 shadow-2xl bg-muted group">
            <Image
              src="/images/about/app-mockup.jpg"
              alt="NEPSE Sathi App Dashboard on Laptop and Mobile"
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Soft border gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Overlapping Goal Quote Card */}
          <div className="mt-4 sm:mt-0 sm:absolute sm:-bottom-6 sm:-right-4 md:-right-6 rounded-2xl border border-white/40 dark:border-white/10 bg-card/95 dark:bg-card/90 backdrop-blur-md p-4 sm:p-5 shadow-2xl space-y-2.5 max-w-xs transition-transform hover:-translate-y-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Target className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed">
              {isNepali
                ? "हाम्रो लक्ष्य सरल छ — प्रत्येक नेपाली लगानीकर्तालाई सही समयमा सही जानकारी दिएर सशक्त बनाउनु।"
                : "Our goal is simple — empower every Nepali investor with the right information at the right time."}
            </p>
            <Link
              href={`/${locale}/features`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:translate-x-1 transition-transform group"
            >
              <span>{isNepali ? "सुविधाहरू हेर्नुहोस्" : "Explore Features"}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. OUR VALUES — "What Drives Us"                                          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left text */}
        <div className="lg:col-span-4 space-y-4">
          <Badge
            variant="outline"
            className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1.5 shadow-xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{isNepali ? "हाम्रा मूल्यहरू" : "Our Values"}</span>
          </Badge>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {isNepali ? "हामीलाई के चलाउँछ" : "What Drives Us"}
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {isNepali
              ? "हामी एउटा एपभन्दा बढी हौं — हामी पारदर्शिता, शिक्षा, समुदाय, र नवप्रवर्तनमा विश्वास गर्ने टोली हौं — नेपालको बलियो वित्तीय भविष्यको लागि।"
              : "We're more than just an app — we're a team that believes in transparency, education, and a stronger financial future for Nepal."}
          </p>
        </div>

        {/* Right: 2x2 values grid */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            {
              icon: Shield,
              title: isNepali ? "पारदर्शिता" : "Transparency",
              description: isNepali
                ? "तपाईंले विश्वास गर्न सक्ने वास्तविक, निष्पक्ष डाटा र अन्तरदृष्टि।"
                : "Real, unbiased data and insights you can trust.",
            },
            {
              icon: GraduationCap,
              title: isNepali ? "शिक्षा" : "Education",
              description: isNepali
                ? "हामी लगानीलाई सरल र बुझ्न सजिलो बनाउँछौं।"
                : "We make investing simple and easy to understand.",
            },
            {
              icon: Users,
              title: isNepali ? "समुदाय" : "Community",
              description: isNepali
                ? "नेपाली लगानीकर्ताहरू बीच सहकार्य र साझा वृद्धि प्रवर्द्धन।"
                : "Fostering collaboration and shared growth across Nepali traders.",
            },
            {
              icon: Sparkles,
              title: isNepali ? "नवप्रवर्तन" : "Innovation",
              description: isNepali
                ? "नेपालको बजारका लागि विशेष रूपमा तयार गरिएको अत्याधुनिक प्रविधि।"
                : "State-of-the-art AI technology tailored for Nepal's market mechanics.",
            },
          ].map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="group rounded-2xl border border-border/80 bg-card/60 dark:bg-card/40 hover:bg-card hover:border-emerald-500/40 p-5 sm:p-6 transition-all duration-200 shadow-sm hover:shadow-md space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  {v.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {v.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. JOURNEY STATS BANNER                                                   */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white p-8 sm:p-12 shadow-2xl border border-emerald-800/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-6 text-center">
          {[
            {
              value: "99.8%",
              label: isNepali ? "डाटा विश्वसनीयता" : "Data Uptime",
              desc: isNepali ? "अविरल बजार फिड" : "Continuous market feed",
            },
            {
              value: "10M+",
              label: isNepali ? "विश्लेषण गरिएका क्यान्डलहरू" : "Candles Analyzed",
              desc: isNepali ? "ऐतिहासिक NEPSE रेकर्ड" : "Historical NEPSE records",
            },
            {
              value: "< 50ms",
              label: isNepali ? "स्ट्रिमिङ गति" : "Streaming Latency",
              desc: isNepali ? "द्रुत WebSocket अपडेट" : "Real-time WebSocket engine",
            },
            {
              value: "100%",
              label: isNepali ? "नेपालका लागि" : "Made for Nepal",
              desc: isNepali ? "स्थानीय बजार समर्पित" : "Tailored for NEPSE traders",
            },
          ].map((stat) => (
            <div key={stat.label} className="space-y-1.5">
              <div className="text-2xl sm:text-4xl font-black text-emerald-300 font-mono tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-bold text-white/90">
                {stat.label}
              </div>
              <div className="text-[11px] text-emerald-200/70 hidden sm:block">
                {stat.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. TEAM & DISCIPLINES                                                     */}
      {/* ========================================================================= */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge
            variant="outline"
            className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1.5 shadow-xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{isNepali ? "हाम्रो टोली" : "Built With Passion"}</span>
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {isNepali ? "इन्जिनियरिङ र अनुसन्धान" : "Engineering & Quantitative Research"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isNepali
              ? "नेपाली बजारलाई राम्ररी बुझ्ने प्राविधिक र वित्तीय विश्लेषकहरूको समर्पित टोली।"
              : "A dedicated multidisciplinary team passionate about building Nepal's premier financial intelligence stack."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              role: isNepali ? "क्वान्टिटेटिभ अनुसन्धान" : "Quantitative Modeling",
              icon: BarChart3,
              desc: isNepali
                ? "LSTM र XGBoost मोडेलहरू NEPSE मूल्य चाल भविष्यवाणी गर्न।"
                : "Predictive neural networks & technical anomaly detection for NEPSE.",
            },
            {
              role: isNepali ? "वितरित प्रणाली" : "Full-Stack Architecture",
              icon: Code2,
              desc: isNepali
                ? "द्रुत डेटा इन्जेसन, क्यासिङ, र वास्तविक समय WebSocket स्ट्रिमिङ।"
                : "High-throughput data pipelines, caching, and low-latency WebSockets.",
            },
            {
              role: isNepali ? "उत्पादन डिजाइन" : "Product & Data Viz",
              icon: Palette,
              desc: isNepali
                ? "ट्रेडिङभ्यू-ग्रेड अन्तरक्रियात्मक चार्टिङ र सहज नेपाली यूआई।"
                : "TradingView-grade charting, responsive UI, and intuitive visual cues.",
            },
            {
              role: isNepali ? "समुदाय र समर्थन" : "Community & Support",
              icon: Headphones,
              desc: isNepali
                ? "लगानीकर्ता प्रतिक्रिया संकलन र निरन्तर सहायता सेवा।"
                : "Direct trader feedback loops, educational guides, and platform support.",
            },
          ].map((member) => {
            const Icon = member.icon;
            return (
              <div
                key={member.role}
                className="group rounded-2xl border border-border/80 bg-card p-5 sm:p-6 space-y-3 hover:border-emerald-500/40 hover:shadow-md transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  {member.role}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {member.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. CALL TO ACTION                                                         */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-emerald-500/10 to-transparent p-8 sm:p-12 text-center space-y-6">
        <div className="max-w-xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            {isNepali
              ? "स्मार्ट लगानीको यात्रा आजै सुरु गर्नुहोस्"
              : "Start Your Smarter Trading Journey Today"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isNepali
              ? "NEPSE Sathi का शक्तिशाली सुविधाहरू प्रयोग गरी आफ्नो पोर्टफोलियो सुरक्षित र लाभदायक बनाउनुहोस्।"
              : "Experience AI predictions, floor sheet analytics, and real-time market depth built specifically for NEPSE."}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/${locale}/register`}
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 px-6 font-semibold"
            )}
          >
            {isNepali ? "निःशुल्क दर्ता गर्नुहोस्" : "Get Started Free"}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
          <Link
            href={`/${locale}/features`}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-border/80 hover:bg-muted font-semibold px-6"
            )}
          >
            {isNepali ? "सबै सुविधाहरू हेर्नुहोस्" : "Explore All Features"}
          </Link>
        </div>
      </div>
    </div>
  );
}
