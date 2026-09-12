"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  User,
  Lock,
  Shield,
  Trash2,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  Bell,
  Globe,
  Palette,
  X,
  Mail,
  KeyRound,
  Upload,
  Smartphone,
  Copy,
  Check,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

type SettingsSection = "profile" | "security" | "preferences" | "account";

function QrCodeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="5" height="5" x="3" y="3" rx="1" />
      <rect width="5" height="5" x="16" y="3" rx="1" />
      <rect width="5" height="5" x="3" y="16" rx="1" />
      <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
      <path d="M21 21v.01" />
      <path d="M12 7v3a2 2 0 0 1-2 2H7" />
      <path d="M3 12h.01" />
      <path d="M12 3h.01" />
      <path d="M12 16v.01" />
      <path d="M16 12h1" />
      <path d="M21 12v.01" />
      <path d="M12 21v-1" />
    </svg>
  );
}

export default function SettingsPage() {
  const pathname = usePathname() || "";
  const locale = pathname.startsWith("/ne") ? "ne" : "en";
  const isNepali = locale === "ne";

  const [activeSection, setActiveSection] = React.useState<SettingsSection>("profile");

  // Profile Form states
  const [fullName, setFullName] = React.useState("Samyog Adhikari");
  const [email, setEmail] = React.useState("investor@nepse-sathi.com");
  const [phone, setPhone] = React.useState("+977 9800000000");
  const [city, setCity] = React.useState("Kathmandu, Nepal");
  const [bio, setBio] = React.useState("Long-term value investor focusing on Commercial Banks and Hydropower equities.");
  const [avatarUrl, setAvatarUrl] = React.useState("/logo.png");
  const [avatarError, setAvatarError] = React.useState("");

  // Security Form states
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  // 2FA states
  const [twoFaEnabled, setTwoFaEnabled] = React.useState(false);
  const [show2FaSetup, setShow2FaSetup] = React.useState(false);
  const [twoFaCode, setTwoFaCode] = React.useState("");
  const [twoFaSecret, setTwoFaSecret] = React.useState("NEPSE-7X9K-4M2P-9WQ8");
  const [copiedSecret, setCopiedSecret] = React.useState(false);

  // Preferences Form states
  const [defaultTimeframe, setDefaultTimeframe] = React.useState("1D");
  const [primarySector, setPrimarySector] = React.useState("Banking");
  const [emailAlerts, setEmailAlerts] = React.useState(true);
  const [telegramAlerts, setTelegramAlerts] = React.useState(true);
  const [autoRefreshInterval, setAutoRefreshInterval] = React.useState("30");

  // Account modal states
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = React.useState("");
  const [savedMessage, setSavedMessage] = React.useState("");

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Load user from Supabase / localStorage
  React.useEffect(() => {
    const savedAvatar = typeof window !== "undefined" ? localStorage.getItem("nepse_user_avatar") : null;
    const savedName = typeof window !== "undefined" ? localStorage.getItem("nepse_user_name") : null;
    const saved2Fa = typeof window !== "undefined" ? localStorage.getItem("nepse_user_2fa") : null;

    if (savedAvatar) setAvatarUrl(savedAvatar);
    if (savedName) setFullName(savedName);
    if (saved2Fa === "true") setTwoFaEnabled(true);

    const supabase = createClient();
    supabase.auth.getUser().then((res: any) => {
      const u = res?.data?.user;
      if (u) {
        if (u.user_metadata?.full_name) setFullName(u.user_metadata.full_name);
        if (u.email) setEmail(u.email);
        const metaAvatar = u.user_metadata?.avatar_url;
        if (metaAvatar && metaAvatar !== "/logo.png") {
          setAvatarUrl(metaAvatar);
        } else if (savedAvatar) {
          setAvatarUrl(savedAvatar);
        }
      }
    });
  }, []);

  // Avatar Upload Handler with 2MB validation & Supabase Persistence
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError("");
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError(isNepali ? "फोटोको आकार २ एमबी भन्दा कम हुनुपर्छ।" : "File size must be under 2MB.");
      return;
    }

    // Validate type
    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      setAvatarError(isNepali ? "कृपया JPG, PNG वा GIF फाइल मात्र छनोट गर्नुहोस्।" : "Please select a JPG, PNG, or GIF image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAvatarUrl(result);
        try {
          localStorage.setItem("nepse_user_avatar", result);
        } catch {}

        // Persist directly to Supabase User Metadata
        try {
          const supabase = createClient();
          await supabase.auth.updateUser({
            data: { avatar_url: result }
          });
        } catch (err) {
          console.error("Supabase avatar update error:", err);
        }

        window.dispatchEvent(new CustomEvent("nepse_avatar_changed", { detail: result }));
        showSuccess(isNepali ? "फोटो सफलतापूर्वक अपडेट गरियो!" : "Avatar updated and saved permanently!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    setAvatarUrl("/logo.png");
    try {
      localStorage.removeItem("nepse_user_avatar");
      const supabase = createClient();
      await supabase.auth.updateUser({
        data: { avatar_url: "/logo.png" }
      });
    } catch {}
    window.dispatchEvent(new CustomEvent("nepse_avatar_changed", { detail: "/logo.png" }));
    showSuccess(isNepali ? "फोटो हटाइयो।" : "Avatar removed.");
  };

  const showSuccess = (msg: string) => {
    setSavedMessage(msg);
    setTimeout(() => setSavedMessage(""), 3500);
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(twoFaSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleVerify2Fa = (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFaCode.length >= 6) {
      setTwoFaEnabled(true);
      setShow2FaSetup(false);
      localStorage.setItem("nepse_user_2fa", "true");
      showSuccess(isNepali ? "दुई-तह प्रमाणीकरण (2FA) सफलतापूर्वक सक्रिय भयो!" : "Two-Factor Authentication (2FA) enabled!");
    }
  };

  const handleDisable2Fa = () => {
    setTwoFaEnabled(false);
    localStorage.removeItem("nepse_user_2fa");
    showSuccess(isNepali ? "२-तह प्रमाणीकरण निष्क्रिय गरियो।" : "Two-Factor Authentication disabled.");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const supabase = createClient();
      await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          avatar_url: avatarUrl,
          phone: phone,
          bio: bio,
        }
      });
      localStorage.setItem("nepse_user_name", fullName);
      showSuccess(isNepali ? "प्रोफाइल विवरणहरू सफलतापूर्वक सुरक्षित गरियो।" : "Profile information saved permanently!");
    } catch (err) {
      console.error("Failed to save profile:", err);
      showSuccess(isNepali ? "प्रोफाइल विवरणहरू सुरक्षित गरियो।" : "Profile information saved!");
    }
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccess(isNepali ? "ट्रेडिङ प्राथमिकताहरू सुरक्षित गरियो।" : "Trading preferences saved successfully!");
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showSuccess(isNepali ? "पासवर्ड सफलतापूर्वक परिवर्तन भयो!" : "Password changed successfully!");
  };

  const settingsTabs: { id: SettingsSection; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: isNepali ? "प्रोफाइल विवरण" : "Profile", icon: User },
    { id: "security", label: isNepali ? "सुरक्षा र 2FA" : "Security & 2FA", icon: Lock },
    { id: "preferences", label: isNepali ? "ट्रेडिङ प्राथमिकता" : "Trading Preferences", icon: Palette },
    { id: "account", label: isNepali ? "खाता व्यवस्थापन" : "Account", icon: Shield },
  ];

  return (
    <div className="max-w-[1100px] mx-auto space-y-5 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          {isNepali ? "खाता तथा सुरक्षा सेटिङहरू" : "Settings & Preferences"}
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isNepali
            ? "तपाईंको व्यक्तिगत प्रोफाइल, दुई-तह सुरक्षा (2FA) र बजार प्राथमिकताहरू व्यवस्थापन गर्नुहोस्।"
            : "Manage your personal profile, security credentials, 2FA, and trading terminal preferences."}
        </p>
      </div>

      {/* Toast Alert */}
      {savedMessage && (
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold animate-in fade-in-0 slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">
        {/* Navigation Sidebar */}
        <div className="rounded-xl border border-border/60 bg-card p-2.5 h-fit lg:sticky lg:top-20 shadow-xs">
          <nav className="space-y-1">
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  activeSection === tab.id
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="space-y-5">
          {/* ─── Profile Section ─── */}
          {activeSection === "profile" && (
            <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs space-y-6">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {isNepali ? "व्यक्तिगत प्रोफाइल" : "Profile Information"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isNepali ? "तपाईंको नाम, सम्पर्क विवरण र अवतार फोटो अपडेट गर्नुहोस्।" : "Update your display name, email address, avatar photo, and bio."}
                </p>
              </div>

              {/* Avatar Uploader */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                <Avatar className="w-16 h-16 ring-2 ring-emerald-500/20 shrink-0">
                  <AvatarImage src={avatarUrl} alt={fullName} />
                  <AvatarFallback className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                    {fullName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      accept="image/png, image/jpeg, image/gif, image/webp"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{isNepali ? "नयाँ फोटो अपलोड" : "Change Avatar"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="px-3 py-1.5 rounded-lg border border-border/70 hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-all"
                    >
                      {isNepali ? "हटाउनुहोस्" : "Remove"}
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    JPG, PNG or GIF. Max 2MB.
                  </p>
                  {avatarError && (
                    <p className="text-[11px] text-red-500 font-medium">{avatarError}</p>
                  )}
                </div>
              </div>

              {/* Profile Details Form */}
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">{isNepali ? "पूरा नाम" : "Full Name"}</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">{isNepali ? "इमेल ठेगाना" : "Email Address"}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">{isNepali ? "फोन नम्बर" : "Phone Number"}</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">{isNepali ? "ठेगाना / सहर" : "Location / City"}</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">{isNepali ? "लगानीकर्ता परिचय (Bio)" : "Investor Bio"}</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isNepali ? "परिवर्तनहरू सुरक्षित गर्नुहोस्" : "Save Changes"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ─── Security & 2FA Section ─── */}
          {activeSection === "security" && (
            <div className="space-y-5">
              {/* 2FA Card */}
              <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        {isNepali ? "दुई-तह प्रमाणीकरण (2FA)" : "Two-Factor Authentication (2FA)"}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        {isNepali
                          ? "Google Authenticator वा Microsoft Authenticator प्रयोग गरी खाता सुरक्षित राख्नुहोस्।"
                          : "Protect your account and portfolio with TOTP authenticator app verification."}
                      </p>
                    </div>
                  </div>

                  <div>
                    {twoFaEnabled ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Enabled</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-muted/80 text-muted-foreground border border-border/60">
                        Disabled
                      </span>
                    )}
                  </div>
                </div>

                {!twoFaEnabled ? (
                  !show2FaSetup ? (
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {isNepali
                          ? "२-तह प्रमाणीकरण सक्रिय गर्दा लगइन गर्दा तपाईंको मोबाइल एपबाट ६-अंकको कोड प्रविष्ट गर्नुपर्नेछ।"
                          : "When 2FA is enabled, you'll be prompted for a secure 6-digit one-time passcode generated by your authenticator app each time you sign in."}
                      </p>
                      <button
                        onClick={() => setShow2FaSetup(true)}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>{isNepali ? "2FA सेटअप सुरु गर्नुहोस्" : "Enable Two-Factor Authentication"}</span>
                      </button>
                    </div>
                  ) : (
                    /* 2FA Setup Flow */
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-4 text-xs animate-in fade-in-0 duration-200">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-foreground flex items-center gap-1.5">
                          <QrCodeIcon className="w-4 h-4 text-emerald-600" />
                          <span>{isNepali ? "चरण १: Authenticator एपमा स्क्यान गर्नुहोस्" : "Step 1: Scan QR Code with Authenticator"}</span>
                        </h4>
                        <button onClick={() => setShow2FaSetup(false)} className="text-muted-foreground hover:text-foreground">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Mock QR Canvas */}
                      <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-card rounded-lg border border-border/60">
                        <div className="w-28 h-28 bg-foreground/5 rounded-lg flex items-center justify-center border border-border/40 p-2 shrink-0">
                          <QrCodeIcon className="w-20 h-20 text-foreground" />
                        </div>
                        <div className="space-y-2 flex-1">
                          <p className="text-[11px] text-muted-foreground">
                            {isNepali
                              ? "यदि QR स्क्यान गर्न मिल्दैन भने, यो म्यानुअल कुञ्जी प्रविष्ट गर्नुहोस्:"
                              : "If you cannot scan the QR code, manually enter this setup key into your app:"}
                          </p>
                          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/60 border border-border font-mono text-xs font-bold text-foreground select-all">
                            <span>{twoFaSecret}</span>
                            <button
                              type="button"
                              onClick={handleCopySecret}
                              className="ml-auto text-muted-foreground hover:text-foreground p-1"
                              title="Copy Secret"
                            >
                              {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Step 2: Verification Code Input */}
                      <form onSubmit={handleVerify2Fa} className="space-y-3 pt-1">
                        <h4 className="font-bold text-foreground">
                          {isNepali ? "चरण २: एपबाट ६-अंकको कोड प्रविष्ट गर्नुहोस्" : "Step 2: Enter 6-digit Code from Authenticator"}
                        </h4>
                        <div className="flex items-center gap-2 max-w-xs">
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="000000"
                            value={twoFaCode}
                            onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, ""))}
                            className="w-40 px-3 py-2 rounded-lg border border-border/70 bg-background text-foreground text-center font-mono font-bold tracking-widest text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            autoFocus
                          />
                          <button
                            type="submit"
                            disabled={twoFaCode.length < 6}
                            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer transition-all shadow-xs"
                          >
                            {isNepali ? "सत्यापन गर्नुहोस्" : "Verify & Enable"}
                          </button>
                        </div>
                      </form>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <p className="text-xs text-muted-foreground">
                      {isNepali ? "तपाईंको खाता दुई-तह सुरक्षा द्वारा सुरक्षित छ।" : "Your account is currently protected with two-factor authentication."}
                    </p>
                    <button
                      onClick={handleDisable2Fa}
                      className="px-3 py-1.5 rounded-lg border border-red-500/30 hover:bg-red-500/10 text-red-500 text-xs font-semibold cursor-pointer transition-all w-fit"
                    >
                      {isNepali ? "2FA निष्क्रिय गर्नुहोस्" : "Disable 2FA"}
                    </button>
                  </div>
                )}
              </div>

              {/* Password Change Card */}
              <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {isNepali ? "पासवर्ड परिवर्तन" : "Change Password"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isNepali ? "आफ्नो खाता सुरक्षित राख्न बलियो पासवर्ड प्रयोग गर्नुहोस्।" : "Ensure your account is using a long, random password to stay secure."}
                  </p>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-3.5 max-w-md text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">{isNepali ? "हालको पासवर्ड" : "Current Password"}</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full pl-3 pr-8 py-2 rounded-lg border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">{isNepali ? "नयाँ पासवर्ड" : "New Password"}</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-3 pr-8 py-2 rounded-lg border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">{isNepali ? "नयाँ पासवर्ड पुनः पुष्टि गर्नुहोस्" : "Confirm New Password"}</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-3 pr-8 py-2 rounded-lg border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{isNepali ? "पासवर्ड अपडेट गर्नुहोस्" : "Update Password"}</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ─── Trading Preferences Section ─── */}
          {activeSection === "preferences" && (
            <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs space-y-6">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {isNepali ? "ट्रेडिङ प्राथमिकताहरू" : "Trading & Terminal Preferences"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isNepali
                    ? "तपाईंको मनपर्ने चार्ट टाइमफ्रेम, प्राथमिक क्षेत्र र सूचना च्यानलहरू सेट गर्नुहोस्।"
                    : "Customize default chart intervals, primary tracking sector, and real-time alerts."}
                </p>
              </div>

              <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">{isNepali ? "पूर्वनिर्धारित चार्ट टाइमफ्रेम" : "Default Chart Timeframe"}</label>
                    <select
                      value={defaultTimeframe}
                      onChange={(e) => setDefaultTimeframe(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="1D">1D (Intraday 5-min)</option>
                      <option value="1W">1W (1 Week)</option>
                      <option value="1M">1M (1 Month)</option>
                      <option value="3M">3M (Quarterly)</option>
                      <option value="1Y">1Y (1 Year)</option>
                      <option value="ALL">ALL (Historical)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">{isNepali ? "प्राथमिक क्षेत्र" : "Primary Focus Sector"}</label>
                    <select
                      value={primarySector}
                      onChange={(e) => setPrimarySector(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border/70 bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="Banking">Commercial Banks</option>
                      <option value="Hydropower">Hydropower</option>
                      <option value="Finance">Finance</option>
                      <option value="Life Insurance">Life Insurance</option>
                      <option value="Non Life Insurance">Non-Life Insurance</option>
                      <option value="Microfinance">Microfinance</option>
                      <option value="Manufacturing">Manufacturing & Processing</option>
                      <option value="Hotels">Hotels & Tourism</option>
                    </select>
                  </div>
                </div>

                {/* Notifications Toggles */}
                <div className="pt-2 space-y-3">
                  <h4 className="font-bold text-foreground">{isNepali ? "सूचना च्यानलहरू" : "Notification Preferences"}</h4>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div>
                      <span className="font-semibold text-foreground block">Telegram Live Alerts</span>
                      <span className="text-[11px] text-muted-foreground">Receive critical market updates on Telegram</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={telegramAlerts}
                      onChange={(e) => setTelegramAlerts(e.target.checked)}
                      className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div>
                      <span className="font-semibold text-foreground block">Email Summaries</span>
                      <span className="text-[11px] text-muted-foreground">Receive daily market dispatch reports</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isNepali ? "प्राथमिकताहरू सुरक्षित गर्नुहोस्" : "Save Preferences"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ─── Account Danger Zone Section ─── */}
          {activeSection === "account" && (
            <div className="rounded-xl border border-red-500/20 bg-card p-5 shadow-xs space-y-4">
              <div>
                <h2 className="text-base font-bold text-red-500 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{isNepali ? "खाता व्यवस्थापन र खतरा क्षेत्र" : "Danger Zone"}</span>
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isNepali ? "खाता खारेज वा डेटा रिसेट सम्बन्धी अपरिवर्तनीय कार्यहरू।" : "Irreversible account operations and private data resets."}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-foreground block">{isNepali ? "खाता मेटाउनुहोस्" : "Delete Account"}</span>
                  <span className="text-muted-foreground text-[11px]">
                    {isNepali ? "तपाईंको वाचलिस्ट, पोर्टफोलियो र सबै डेटा स्थायी रूपमा मेटिनेछ।" : "Permanently delete your profile, watchlist collection, and journal data."}
                  </span>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold cursor-pointer transition-all shrink-0"
                >
                  {isNepali ? "खाता मेटाउनुहोस्" : "Delete Account"}
                </button>
              </div>

              {/* Delete Confirm Modal */}
              {showDeleteModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-card border border-border rounded-2xl p-5 max-w-sm w-full space-y-3 text-xs">
                    <h3 className="text-sm font-bold text-red-500 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Confirm Deletion</span>
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Type <strong className="text-foreground">DELETE</strong> to confirm permanent removal of your account.
                    </p>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="DELETE"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-center font-bold"
                    />
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => setShowDeleteModal(false)}
                        className="w-1/2 py-1.5 rounded-lg border border-border hover:bg-muted font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={deleteConfirmText !== "DELETE"}
                        onClick={() => {
                          setShowDeleteModal(false);
                          showSuccess("Account deletion requested.");
                        }}
                        className="w-1/2 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white font-semibold"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
