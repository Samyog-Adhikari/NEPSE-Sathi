"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { AuthVisualPanel } from "@/components/auth/auth-visual-panel";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const pathname = usePathname() || "/en";
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const locale = pathname.startsWith("/ne") ? "ne" : "en";
  const isNepali = locale === "ne";

  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(
          error.message === "Invalid login credentials"
            ? isNepali
              ? "गलत इमेल वा पासवर्ड। कृपया पुनः प्रयास गर्नुहोस्।"
              : "Invalid email or password. Please check your credentials."
            : error.message
        );
        setIsLoading(false);
        return;
      }

      if (data.session) {
        setSuccessMsg(isNepali ? "सफलतापूर्वक लगइन भयो! पुनर्निर्देशन हुँदैछ..." : "Login successful! Redirecting...");
        setTimeout(() => {
          router.push(`/${locale}${redirectPath.startsWith("/") ? redirectPath : `/${redirectPath}`}`);
        }, 600);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const redirectUrl = `${window.location.origin}/${locale}/dashboard`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) {
        setErrorMsg(error.message);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Could not initialize Google authentication.");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background">
      {/* 1. LEFT PANE: BOMBASTIC VISUAL SHOWCASE */}
      <AuthVisualPanel locale={locale} isNepali={isNepali} />

      {/* 2. RIGHT PANE: LOGIN FORM (MATCHING DESIGN MOCKUP) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between px-6 py-8 sm:px-12 lg:px-14 xl:px-20 min-h-screen bg-background">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between w-full">
          {/* Back to Home Button */}
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 border border-border/70 transition-all group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>{isNepali ? "गृहपृष्ठ" : "Back to Home"}</span>
          </Link>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        {/* Center Main Form */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-8">
          {/* Form Header */}
          <div className="mb-7 text-left space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {isNepali ? "पुनः स्वागत छ" : "Welcome Back"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {isNepali
                ? "तपाईंको NEPSE Sathi खातामा लगइन गर्नुहोस् र लगानी व्यवस्थापन जारी राख्नुहोस्।"
                : "Log in to your NEPSE Sathi account to continue tracking and managing your investments."}
            </p>
          </div>

          {/* Alert Messages */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-snug">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-snug font-medium">{successMsg}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isNepali ? "इमेल ठेगाना" : "Email Address"}
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isNepali ? "तपाईंको इमेल ठेगाना प्रविष्ट गर्नुहोस्" : "Enter your email address"}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/90 bg-muted/20 focus:bg-background text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-foreground">
                  {isNepali ? "पासवर्ड" : "Password"}
                </label>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isNepali ? "तपाईंको पासवर्ड प्रविष्ट गर्नुहोस्" : "Enter your password"}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border/90 bg-muted/20 focus:bg-background text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                />
                <span className="text-muted-foreground font-medium">
                  {isNepali ? "मलाई सम्झनुहोस्" : "Remember me"}
                </span>
              </label>

              <Link
                href={`/${locale}/auth/forgot-password`}
                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {isNepali ? "पासवर्ड बिर्सनुभयो?" : "Forgot password?"}
              </Link>
            </div>

            {/* Primary Log In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 active:scale-[0.99] text-white text-xs font-semibold shadow-md shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <span>{isNepali ? "लगइन हुँदैछ..." : "Logging in..."}</span>
              ) : (
                <>
                  <span>{isNepali ? "लगइन गर्नुहोस्" : "Log In"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-border/80 w-full" />
            <span className="bg-background px-3 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              {isNepali ? "वा" : "OR"}
            </span>
            <div className="border-t border-border/80 w-full" />
          </div>

          {/* Continue with Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-border/90 bg-card hover:bg-muted/50 text-xs font-semibold text-foreground transition-all cursor-pointer shadow-2xs active:scale-[0.99]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.14 0 9.99 0 12s.45 3.86 1.24 5.42l4.04-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{isNepali ? "Google मार्फत जारी राख्नुहोस्" : "Continue with Google"}</span>
          </button>

          {/* Bottom Switch to Sign Up */}
          <div className="mt-7 text-center text-xs text-muted-foreground flex items-center justify-center">
            <span>{isNepali ? "खाता छैन?" : "Don't have an account?"}</span>
            <Link
              href={`/${locale}/auth/register`}
              className="ml-1.5 font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 hover:underline inline-flex items-center gap-1"
            >
              <span>{isNepali ? "दर्ता गर्नुहोस्" : "Sign Up"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Bottom Terms Footnote */}
        <div className="w-full text-center text-[11px] text-muted-foreground/80 py-2">
          {isNepali ? (
            <span>
              जारी राखेर, तपाईं हाम्रा{" "}
              <Link href={`/${locale}/terms`} className="underline hover:text-foreground">
                सेवाका सर्तहरू
              </Link>{" "}
              र{" "}
              <Link href={`/${locale}/privacy`} className="underline hover:text-foreground">
                गोपनीयता नीति
              </Link>{" "}
              मा सहमत हुनुहुन्छ।
            </span>
          ) : (
            <span>
              By continuing, you agree to our{" "}
              <Link href={`/${locale}/terms`} className="underline hover:text-foreground">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href={`/${locale}/privacy`} className="underline hover:text-foreground">
                Privacy Policy
              </Link>
              .
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
