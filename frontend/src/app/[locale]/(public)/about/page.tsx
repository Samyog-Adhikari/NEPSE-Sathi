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
  BarChart3,
  Lightbulb,
  Heart,
  MapPin,
  CheckCircle2,
  Shield,
  GraduationCap,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CtaBanner } from "@/components/cta-banner";
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
      {/* 2. OUR MISSION — Alternating Layout (Image Left, Narrative Right)          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
        {/* Left: App Preview photo with overlapping Goal card */}
        <div className="lg:col-span-7 relative order-2 lg:order-1">
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

          {/* Overlapping Goal Quote Card on Image */}
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

        {/* Right: Text Narrative */}
        <div className="lg:col-span-5 space-y-5 order-1 lg:order-2">
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
      </div>

      {/* ========================================================================= */}
      {/* 3. OUR VALUES — "What Drives Us" (Exact Match to Mockup Design)            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left text */}
        <div className="lg:col-span-4 space-y-4">
          <div className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {isNepali ? "हाम्रा मूल्यहरू" : "Our Values"}
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            {isNepali ? "हामीलाई के चलाउँछ" : "What Drives Us"}
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {isNepali
              ? "हामी एउटा एपभन्दा बढी हौं — हामी पारदर्शिता, शिक्षा, समुदाय, र नवप्रवर्तनमा विश्वास गर्ने टोली हौं — नेपालको बलियो वित्तीय भविष्यको लागि।"
              : "We're more than just an app — we're a team that believes in transparency, education, and a stronger financial future for Nepal."}
          </p>
        </div>

        {/* Right: 2x2 values grid */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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
                ? "सहयोगी लगानीकर्ता समुदायसँग सँगै बढ्दै।"
                : "Growing together with a supportive investor community.",
            },
            {
              icon: TrendingUp,
              title: isNepali ? "नवप्रवर्तन" : "Innovation",
              description: isNepali
                ? "तपाईंलाई उत्कृष्ट उपकरण र सुविधाहरू दिन निरन्तर सुधार गर्दै।"
                : "Constantly improving to bring you the best tools and features.",
            },
          ].map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="group rounded-3xl border border-border/80 bg-card/60 dark:bg-card/40 hover:bg-card hover:border-emerald-500/40 p-5 sm:p-6 transition-all duration-200 shadow-xs hover:shadow-md flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-foreground">
                    {v.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {v.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. OUR JOURNEY BANNER — "Making an Impact" (Exact Match to Mockup Design)  */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#06241b] via-[#093126] to-[#06241b] text-white p-6 sm:p-10 shadow-2xl border border-emerald-800/40">
        {/* Subtle mountain backdrop overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/15 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          {/* Left Narrative */}
          <div className="lg:col-span-5 space-y-2">
            <div className="text-xs sm:text-sm font-semibold text-emerald-400">
              {isNepali ? "हाम्रो यात्रा" : "Our Journey"}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isNepali ? "सकारात्मक प्रभाव पार्दै" : "Making an Impact"}
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-sm">
              {isNepali
                ? "हामी भर्खरै सुरु गर्दैछौं, तर प्रयोगकर्ताहरूको विश्वास र साथ हाम्रो लागि ठूलो प्रेरणा हो।"
                : "We're just getting started, but the support and trust from our users already mean a lot."}
            </p>
          </div>

          {/* Right 4 Stats Grid with Divider Lines */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-2">
            {[
              {
                value: "10K+",
                label: isNepali ? "सक्रिय प्रयोगकर्ता" : "Active Users",
                tag: isNepali ? "(चाँडै आउँदैछ)" : "(Coming Soon)",
              },
              {
                value: "4.8 ★",
                label: isNepali ? "प्रयोगकर्ता मूल्याङ्कन" : "User Rating",
                tag: isNepali ? "(चाँडै आउँदैछ)" : "(Coming Soon)",
              },
              {
                value: "1M+",
                label: isNepali ? "बजार डाटा पोइन्टहरू" : "Market Data Points",
                tag: isNepali ? "(चाँडै आउँदैछ)" : "(Coming Soon)",
              },
              {
                value: "100%",
                label: isNepali ? "नेपाल केन्द्रित" : "Nepal Focused",
                tag: isNepali ? "(सधैं)" : "(Always)",
              },
            ].map((stat, idx) => (
              <div
                key={stat.label}
                className={cn(
                  "space-y-1 py-1",
                  idx > 0 && "sm:border-l sm:border-white/15 sm:pl-4"
                )}
              >
                <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs font-semibold text-white/95">
                  {stat.label}
                </div>
                <div className="text-[11px] text-white/50">
                  {stat.tag}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. OUR TEAM — "Passionate People, Real Purpose." (Exact Match to Mockup)   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left text & Our Story button */}
        <div className="lg:col-span-4 space-y-4">
          <div className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {isNepali ? "हाम्रो टोली" : "Our Team"}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
            {isNepali ? (
              <>
                समर्पित व्यक्तिहरू,
                <br />
                वास्तविक उद्देश्य।
              </>
            ) : (
              <>
                Passionate People,
                <br />
                Real Purpose.
              </>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {isNepali
              ? "हामी विद्यार्थी, विकासकर्ता र उत्साहीहरूको एउटा सानो टोली हौं जसले प्रविधिको शक्तिमा विश्वास गर्छौं। NEPSE Sathi स्मार्ट र बलियो नेपाल निर्माणमा हाम्रो सानो योगदान हो।"
              : "We're a small team of students, developers, and enthusiasts who believe in the power of technology to create real change. NEPSE Sathi is our way of contributing to a smarter and stronger Nepal."}
          </p>
          <div className="pt-2">
            <Link
              href={`/${locale}/features`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-emerald-500/50 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            >
              <span>{isNepali ? "हाम्रो कथा" : "Our Story"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right: 4 Horizontal Disciplines Cards with Soft Pastel Squircles */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              role: isNepali ? "विकासकर्ताहरू" : "Developers",
              desc: isNepali
                ? "सहज र भरपर्दो अनुभव निर्माण गर्दै।"
                : "Building a seamless and reliable experience.",
              icon: Users,
              bg: "bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400",
            },
            {
              role: isNepali ? "डिजाइनरहरू" : "Designers",
              desc: isNepali
                ? "सफा र सहज इन्टरफेस सिर्जना गर्दै।"
                : "Crafting a clean and intuitive interface.",
              icon: Lightbulb,
              bg: "bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400",
            },
            {
              role: isNepali ? "अनुसन्धानकर्ताहरू" : "Researchers",
              desc: isNepali
                ? "तथ्याङ्कलाई अर्थपूर्ण अन्तरदृष्टिमा रूपान्तरण गर्दै।"
                : "Turning data into meaningful insights.",
              icon: BarChart3,
              bg: "bg-sky-100/90 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400",
            },
            {
              role: isNepali ? "सहयोग" : "Support",
              desc: isNepali
                ? "तपाईंका प्रश्नहरूका लागि सधैं तयार।"
                : "Always here for your questions.",
              icon: Heart,
              bg: "bg-purple-100/90 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400",
            },
          ].map((member) => {
            const Icon = member.icon;
            return (
              <div
                key={member.role}
                className="group rounded-3xl border border-border/70 bg-card p-5 space-y-3 hover:border-emerald-500/40 hover:shadow-md transition-all duration-200"
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs",
                    member.bg
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  {member.role}
                </h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                  {member.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. CALL TO ACTION (Reused Home Page Component)                            */}
      {/* ========================================================================= */}
      <CtaBanner locale={locale} noPadding />
    </div>
  );
}
