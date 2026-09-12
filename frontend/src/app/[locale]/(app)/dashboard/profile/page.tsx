"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Edit3,
  MapPin,
  Calendar,
  Target,
  ArrowRight,
  TrendingUp,
  Briefcase,
  BarChart3,
  Star,
  Newspaper,
  Clock,
  ShieldCheck,
  Mail,
  PieChart,
  Activity,
  Layers,
  Lock,
  Smartphone,
  Check,
  Upload,
  Globe,
  Bell,
  Sliders,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  const pathname = usePathname() || "";
  const locale = pathname.startsWith("/ne") ? "ne" : "en";
  const isNepali = locale === "ne";

  const [user, setUser] = React.useState<any>(null);
  const [activeTab, setActiveTab] = React.useState<"Overview" | "Security & Details" | "Trading Preferences">("Overview");
  const [avatarUrl, setAvatarUrl] = React.useState("/logo.png");
  const [is2FaEnabled, setIs2FaEnabled] = React.useState(false);

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then((res: any) => {
      const u = res?.data?.user;
      if (u) {
        setUser(u);
        if (u.user_metadata?.avatar_url) {
          setAvatarUrl(u.user_metadata.avatar_url);
        }
      }
    });

    const savedAvatar = localStorage.getItem("nepse_user_avatar");
    if (savedAvatar) setAvatarUrl(savedAvatar);

    const saved2Fa = localStorage.getItem("nepse_user_2fa");
    if (saved2Fa === "true") setIs2FaEnabled(true);
  }, []);

  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Samyog Adhikari";

  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "SA";

  const accountOpenedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(isNepali ? "ne-NP" : "en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "September 2026";

  const profileTabs = [
    { id: "Overview" as const, label: isNepali ? "सिंहावलोकन (Overview)" : "Overview", icon: Activity },
    { id: "Security & Details" as const, label: isNepali ? "सुरक्षा र विवरण (Security & Details)" : "Security & Details", icon: ShieldCheck },
    { id: "Trading Preferences" as const, label: isNepali ? "ट्रेडिङ प्राथमिकताहरू (Trading Preferences)" : "Trading Preferences", icon: Sliders },
  ];

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-12">
      {/* ─── Profile Header Card ─── */}
      <div className="rounded-xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <Avatar className="w-16 h-16 sm:w-20 sm:h-20 ring-2 ring-emerald-500/20 shadow-xs">
                <AvatarImage src={avatarUrl} alt={fullName} />
                <AvatarFallback className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-card" />
            </div>

            {/* User Info */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                  {fullName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{isNepali ? "प्रमाणित लगानीकर्ता" : "Verified Member"}</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {user?.email || "investor@nepse-sathi.com"}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span>Kathmandu, Nepal</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span>Joined {accountOpenedDate}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Edit Profile Action */}
          <Link
            href={`/${locale}/dashboard/settings`}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isNepali ? "सेटिङ सम्पादन गर्नुहोस्" : "Edit in Settings"}</span>
          </Link>
        </div>
      </div>

      {/* ─── Profile Navigation Tabs ─── */}
      <div className="flex items-center gap-1 border-b border-border/60 pb-px overflow-x-auto">
        {profileTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap",
              activeTab === tab.id
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 rounded-t-lg"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ─── Tab 1: Overview ─── */}
      {activeTab === "Overview" && (
        <div className="space-y-5 animate-in fade-in-0 duration-150">
          {/* 3 Overview Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-xl border border-border/70 bg-card shadow-xs">
              <span className="text-xs text-muted-foreground font-medium flex items-center justify-between">
                <span>{isNepali ? "खाता स्थिति" : "Account Status"}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </span>
              <div className="text-base font-bold text-foreground mt-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Active & Verified</span>
              </div>
              <span className="text-[11px] text-muted-foreground mt-0.5 block">Full NEPSE data access</span>
            </div>

            <div className="p-4 rounded-xl border border-border/70 bg-card shadow-xs">
              <span className="text-xs text-muted-foreground font-medium flex items-center justify-between">
                <span>{isNepali ? "वाचलिस्ट स्टकहरू" : "Watchlist Equities"}</span>
                <BarChart3 className="w-4 h-4 text-primary" />
              </span>
              <div className="text-base font-bold text-foreground mt-2 font-mono">
                Live Tracking Active
              </div>
              <span className="text-[11px] text-muted-foreground mt-0.5 block">Private stock ledger connected</span>
            </div>

            <div className="p-4 rounded-xl border border-border/70 bg-card shadow-xs">
              <span className="text-xs text-muted-foreground font-medium flex items-center justify-between">
                <span>{isNepali ? "२-तह सुरक्षा (2FA)" : "Security Level"}</span>
                <Lock className="w-4 h-4 text-amber-500" />
              </span>
              <div className="text-base font-bold text-foreground mt-2">
                {is2FaEnabled ? "High (2FA Active)" : "Standard"}
              </div>
              <span className="text-[11px] text-muted-foreground mt-0.5 block">
                {is2FaEnabled ? "Authenticator verified" : "2FA recommended"}
              </span>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="p-5 rounded-xl border border-border/70 bg-card shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-foreground">
              {isNepali ? "टर्मिनलका द्रुत लिङ्कहरू" : "Platform Terminal Links"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href={`/${locale}/dashboard`}
                className="p-3 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/60 transition-all flex items-center justify-between text-xs font-semibold text-foreground group"
              >
                <span>{isNepali ? "मुख्य ड्यासबोर्ड" : "Main Terminal Dashboard"}</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href={`/${locale}/market`}
                className="p-3 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/60 transition-all flex items-center justify-between text-xs font-semibold text-foreground group"
              >
                <span>{isNepali ? "लाइभ बजार हब" : "Live Market Hub"}</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href={`/${locale}/technicals`}
                className="p-3 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/60 transition-all flex items-center justify-between text-xs font-semibold text-foreground group"
              >
                <span>{isNepali ? "प्राविधिक चार्टहरू" : "Technical Charts"}</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab 2: Security & Details ─── */}
      {activeTab === "Security & Details" && (
        <div className="p-5 rounded-xl border border-border/70 bg-card shadow-xs space-y-4 animate-in fade-in-0 duration-150 text-xs">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {isNepali ? "सुरक्षा विवरण र लगइन जानकारी" : "Security & Authentication Details"}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {isNepali ? "तपाईंको खाताको लगइन सुरक्षा, सत्र र प्रमाणिकरण स्थिति।" : "Overview of account credentials, active sessions, and multi-factor status."}
            </p>
          </div>

          <div className="divide-y divide-border/40 space-y-3">
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="font-semibold text-foreground block">Primary Email</span>
                <span className="text-muted-foreground text-[11px]">{user?.email || "investor@nepse-sathi.com"}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">
                Verified
              </span>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="font-semibold text-foreground block">Two-Factor Authentication (2FA)</span>
                <span className="text-muted-foreground text-[11px]">
                  {is2FaEnabled ? "TOTP Authenticator enabled" : "Not configured yet"}
                </span>
              </div>
              <Link
                href={`/${locale}/dashboard/settings`}
                className="px-2.5 py-1 rounded-md border border-border/80 hover:bg-muted font-semibold text-[11px]"
              >
                {is2FaEnabled ? "Manage 2FA" : "Configure 2FA"}
              </Link>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="font-semibold text-foreground block">Password Status</span>
                <span className="text-muted-foreground text-[11px]">Last updated recently</span>
              </div>
              <Link
                href={`/${locale}/dashboard/settings`}
                className="px-2.5 py-1 rounded-md border border-border/80 hover:bg-muted font-semibold text-[11px]"
              >
                Change Password
              </Link>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="font-semibold text-foreground block">Active Browser Session</span>
                <span className="text-muted-foreground text-[11px]">Logged in via Supabase Authentication (JWT)</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold text-[10px]">
                Active Now
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab 3: Trading Preferences ─── */}
      {activeTab === "Trading Preferences" && (
        <div className="p-5 rounded-xl border border-border/70 bg-card shadow-xs space-y-4 animate-in fade-in-0 duration-150 text-xs">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {isNepali ? "ट्रेडिङ र बजार प्राथमिकताहरू" : "Trading Terminal Preferences"}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {isNepali ? "तपाईंको पूर्वनिर्धारित चार्ट, क्षेत्र र सूचना कन्फिगरेसन।" : "Terminal configuration and alert delivery channels."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div className="p-3.5 rounded-lg bg-muted/20 border border-border/50 space-y-1">
              <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">
                Default Timeframe
              </span>
              <span className="text-sm font-bold text-foreground font-mono">1D (Intraday 5-min Spline)</span>
            </div>

            <div className="p-3.5 rounded-lg bg-muted/20 border border-border/50 space-y-1">
              <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">
                Primary Watch Sector
              </span>
              <span className="text-sm font-bold text-foreground">Commercial Banking & Hydropower</span>
            </div>

            <div className="p-3.5 rounded-lg bg-muted/20 border border-border/50 space-y-1">
              <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">
                Telegram Bot Alerts
              </span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Connected (@NEPSE_Sathi_Bot)</span>
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-muted/20 border border-border/50 space-y-1">
              <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">
                Market Calendar & Hours
              </span>
              <span className="text-sm font-bold text-foreground">
                Mon - Fri (11:00 AM - 3:00 PM NPT)
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href={`/${locale}/dashboard/settings`}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold inline-flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Sliders className="w-3 h-3" />
              <span>{isNepali ? "प्राथमिकताहरू परिवर्तन गर्नुहोस्" : "Change Preferences in Settings"}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
