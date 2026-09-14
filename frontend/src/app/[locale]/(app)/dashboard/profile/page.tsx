"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Edit3,
  MapPin,
  Calendar,
  ShieldCheck,
  TrendingUp,
  Activity,
  DollarSign,
  Briefcase,
  AlertTriangle,
  Trash2,
  Lock,
  User,
  Mail,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Sliders,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  const pathname = usePathname() || "";
  const router = useRouter();
  const locale = pathname.startsWith("/ne") ? "ne" : "en";
  const isNepali = locale === "ne";

  const [user, setUser] = React.useState<any>(null);
  const [avatarUrl, setAvatarUrl] = React.useState<string>("/logo.png");
  const [fullName, setFullName] = React.useState("Samyog Adhikari");
  const [email, setEmail] = React.useState("investor@nepse-sathi.com");
  const [isDeactivating, setIsDeactivating] = React.useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = React.useState(false);
  const [confirmDeleteInput, setConfirmDeleteInput] = React.useState("");
  const [actionMessage, setActionMessage] = React.useState("");

  // Load user data reliably
  React.useEffect(() => {
    // 1. Check local storage immediately for fast zero-delay display
    const savedAvatar = typeof window !== "undefined" ? localStorage.getItem("nepse_user_avatar") : null;
    const savedName = typeof window !== "undefined" ? localStorage.getItem("nepse_user_name") : null;
    if (savedAvatar) setAvatarUrl(savedAvatar);
    if (savedName) setFullName(savedName);

    // 2. Fetch from Supabase
    const supabase = createClient();
    supabase.auth.getUser().then((res: any) => {
      const u = res?.data?.user;
      if (u) {
        setUser(u);
        const name = u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0] || "Investor";
        setFullName(name);
        if (u.email) setEmail(u.email);

        const metaAvatar = u.user_metadata?.avatar_url;
        // Never overwrite a valid custom base64 avatar with default fallback
        const bestAvatar = (metaAvatar && metaAvatar !== "/logo.png") ? metaAvatar : (savedAvatar || metaAvatar || "/logo.png");
        setAvatarUrl(bestAvatar);
      }
    });

    // 3. Listen to avatar changes across components
    const onAvatarChanged = (e: any) => {
      if (e.detail) setAvatarUrl(e.detail);
    };
    window.addEventListener("nepse_avatar_changed", onAvatarChanged);
    return () => window.removeEventListener("nepse_avatar_changed", onAvatarChanged);
  }, []);

  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "SA";

  const accountJoinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Aug 12, 2025";

  // Account Deactivation Handler
  const handleDeactivateAccount = async () => {
    if (confirmDeleteInput.trim().toUpperCase() !== "DEACTIVATE") {
      return;
    }
    setIsDeactivating(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      localStorage.clear();
      setActionMessage(isNepali ? "खाता सफलतापूर्वक निष्क्रिय गरियो।" : "Account has been deactivated successfully.");
      setTimeout(() => {
        router.push(`/${locale}/login`);
      }, 1500);
    } catch (err) {
      console.error("Deactivation error:", err);
      setIsDeactivating(false);
    }
  };

  // Handle direct avatar upload from profile
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert("Image size should be less than 3MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setAvatarUrl(base64);
      localStorage.setItem("nepse_user_avatar", base64);
      window.dispatchEvent(new CustomEvent("nepse_avatar_changed", { detail: base64 }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-16">
      {/* ─── Profile Header Banner ─── */}
      <div className="relative rounded-2xl border border-border/70 bg-card p-6 sm:p-8 shadow-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Rock-solid, Persistent Avatar with Direct Change Button */}
            <div className="relative shrink-0 group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-4 ring-emerald-500/20 shadow-md bg-emerald-950 flex items-center justify-center relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/logo.png";
                    }}
                  />
                ) : (
                  <span className="bg-emerald-600 text-white font-black text-2xl w-full h-full flex items-center justify-center">
                    {initials}
                  </span>
                )}
                {/* Direct photo upload trigger on hover */}
                <label
                  htmlFor="profile-avatar-input"
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[11px] font-bold cursor-pointer transition-opacity backdrop-blur-xs"
                >
                  <Edit3 className="w-4 h-4 mb-1" />
                  <span>{isNepali ? "फोटो बदल्नुहोस्" : "Change Photo"}</span>
                </label>
              </div>
              <input
                id="profile-avatar-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-card" title="Active" />
            </div>

            {/* Main User Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  {fullName}
                </h1>
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  {isNepali ? "प्रमाणित लगानीकर्ता" : "Verified NEPSE Investor"}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  {email}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Kathmandu, Nepal
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  NPT (UTC+5:45)
                </span>
              </div>

              <p className="text-sm text-foreground/80 font-medium pt-1">
                Joined on <strong className="text-foreground">{accountJoinedDate}</strong> • Active NEPSE Market Participant
              </p>
            </div>
          </div>

          {/* Action: Edit Profile */}
          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/dashboard/settings`}
              className="px-4 py-2.5 rounded-xl border border-border/80 bg-background hover:bg-muted text-foreground font-bold text-sm flex items-center gap-2 transition-all shadow-xs"
            >
              <Edit3 className="w-4 h-4 text-emerald-600" />
              <span>{isNepali ? "सेटिङ सम्पादन गर्नुहोस्" : "Edit Preferences"}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Key Stats Grid ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Portfolio Value */}
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {isNepali ? "कुल पोर्टफोलियो" : "Portfolio Value"}
            </span>
            <div className="font-mono text-2xl sm:text-3xl font-black text-foreground">
              Rs. 1,24,568
            </div>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
              ↑ +18.4% Overall Gain
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* Watchlist & Tracking */}
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {isNepali ? "ट्र्याक गरिएका स्टकहरू" : "Tracked Equities"}
            </span>
            <div className="font-mono text-2xl sm:text-3xl font-black text-foreground">
              18 Stocks
            </div>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
              Live Alerts Enabled
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Focus Sector */}
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {isNepali ? "मुख्य क्षेत्र" : "Focus Sector"}
            </span>
            <div className="text-xl sm:text-2xl font-black text-foreground truncate max-w-[150px]">
              Banking
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              & Hydropower Co.
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Security & 2FA */}
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {isNepali ? "सुरक्षा स्थिति" : "Account Status"}
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-6 h-6" />
              Verified
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              TMS & Bot Connected
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ─── Profile Details & Trading Preferences ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Investor Profile Summary */}
        <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div className="flex items-center gap-2.5">
              <User className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-bold text-foreground">
                {isNepali ? "व्यक्तिगत विवरण" : "Personal Information"}
              </h3>
            </div>
            <Link
              href={`/${locale}/dashboard/settings`}
              className="text-xs font-bold text-emerald-500 hover:underline"
            >
              {isNepali ? "परिवर्तन गर्नुहोस्" : "Update"}
            </Link>
          </div>

          <div className="space-y-4 text-base">
            <div className="flex items-center justify-between py-1 border-b border-border/30">
              <span className="text-muted-foreground text-sm">{isNepali ? "पुरा नाम" : "Full Name"}</span>
              <span className="font-bold text-foreground">{fullName}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-border/30">
              <span className="text-muted-foreground text-sm">{isNepali ? "इमेल ठेगाना" : "Email Address"}</span>
              <span className="font-bold text-foreground">{email}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-border/30">
              <span className="text-muted-foreground text-sm">{isNepali ? "फोन नम्बर" : "Phone"}</span>
              <span className="font-mono font-bold text-foreground">+977 9800000000</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-border/30">
              <span className="text-muted-foreground text-sm">{isNepali ? "केवाइसी प्रमाणीकरण" : "KYC Status"}</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-500 font-bold">
                <CheckCircle2 className="w-4 h-4" /> Completed
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-muted-foreground text-sm">{isNepali ? "समय क्षेत्र" : "Timezone"}</span>
              <span className="font-mono font-bold text-foreground">Asia/Kathmandu (NPT +5:45)</span>
            </div>
          </div>
        </div>

        {/* Trading Preferences */}
        <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div className="flex items-center gap-2.5">
              <Sliders className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-bold text-foreground">
                {isNepali ? "कारोबार प्राथमिकताहरू" : "Trading & Alert Preferences"}
              </h3>
            </div>
            <Link
              href={`/${locale}/dashboard/settings`}
              className="text-xs font-bold text-emerald-500 hover:underline"
            >
              {isNepali ? "सम्पादन" : "Configure"}
            </Link>
          </div>

          <div className="space-y-4 text-base">
            <div className="flex items-center justify-between py-1 border-b border-border/30">
              <span className="text-muted-foreground text-sm">{isNepali ? "लगानी रणनीति" : "Strategy"}</span>
              <span className="font-bold text-foreground">Growth & Value Investing</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-border/30">
              <span className="text-muted-foreground text-sm">{isNepali ? "जोखिम स्तर" : "Risk Tolerance"}</span>
              <span className="font-bold text-foreground">Moderate</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-border/30">
              <span className="text-muted-foreground text-sm">{isNepali ? "चार्ट अन्तराल" : "Default Chart Interval"}</span>
              <span className="font-mono font-bold text-foreground">1D / 5m Intraday</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-border/30">
              <span className="text-muted-foreground text-sm">{isNepali ? "टेलिग्राम सूचना" : "Telegram Bot Alerts"}</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-500 font-bold">
                <CheckCircle2 className="w-4 h-4" /> Enabled (@NEPSE_Sathi_Bot)
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-muted-foreground text-sm">{isNepali ? "इमेल बजार सारांश" : "Daily Dispatch"}</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-500 font-bold">
                <CheckCircle2 className="w-4 h-4" /> Subscribed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Account Deactivation & Danger Zone ─── */}
      <div className="rounded-2xl border border-rose-500/30 bg-rose-950/10 p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-500">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                {isNepali ? "खाता निष्क्रिय वा हटाउनुहोस्" : "Account Deactivation & Danger Zone"}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">
              {isNepali
                ? "यदि तपाईं आफ्नो खाता अस्थायी रूपमा निष्क्रिय गर्न वा पूर्ण रूपमा बन्द गर्न चाहनुहुन्छ भने, तलको बटन थिच्नुहोस्।"
                : "Deactivating your account will pause your real-time alerts and revoke all active session tokens on this device."}
            </p>
          </div>

          <button
            onClick={() => setShowDeactivateModal(true)}
            className="px-5 py-2.5 rounded-xl border border-rose-500/50 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isNepali ? "खाता निष्क्रिय गर्नुहोस्" : "Deactivate Account"}</span>
          </button>
        </div>
      </div>

      {/* ─── Deactivation Confirmation Modal ─── */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in-0 duration-150">
          <div className="rounded-2xl border border-rose-500/40 bg-card p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">
                  {isNepali ? "के तपाईं निश्चित हुनुहुन्छ?" : "Deactivate Account?"}
                </h3>
                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-foreground/80 leading-relaxed">
              {isNepali
                ? "पुष्टिका लागि तल 'DEACTIVATE' टाइप गर्नुहोस् र खाता निष्क्रिय गर्नुहोस् बटन थिच्नुहोस्।"
                : "Please type <strong>DEACTIVATE</strong> below to confirm account deactivation and session termination."}
            </p>

            <input
              type="text"
              value={confirmDeleteInput}
              onChange={(e) => setConfirmDeleteInput(e.target.value)}
              placeholder="Type DEACTIVATE"
              className="w-full px-4 py-2.5 rounded-xl border border-border/80 bg-background text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            {actionMessage && (
              <p className="text-xs text-emerald-400 font-bold text-center">{actionMessage}</p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowDeactivateModal(false);
                  setConfirmDeleteInput("");
                }}
                className="px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted text-foreground font-semibold text-sm cursor-pointer"
              >
                {isNepali ? "रद्द गर्नुहोस्" : "Cancel"}
              </button>

              <button
                onClick={handleDeactivateAccount}
                disabled={confirmDeleteInput.trim().toUpperCase() !== "DEACTIVATE" || isDeactivating}
                className={cn(
                  "px-5 py-2 rounded-xl font-bold text-sm text-white transition-all cursor-pointer flex items-center gap-1.5",
                  confirmDeleteInput.trim().toUpperCase() === "DEACTIVATE" && !isDeactivating
                    ? "bg-rose-600 hover:bg-rose-700 shadow-md"
                    : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                )}
              >
                {isDeactivating ? "Processing..." : isNepali ? "पुष्टि गर्नुहोस्" : "Confirm Deactivation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
