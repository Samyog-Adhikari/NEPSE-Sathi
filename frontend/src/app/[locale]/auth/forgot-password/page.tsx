"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowLeft, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function ForgotPasswordPage() {
  const pathname = usePathname() || "/en";
  const locale = pathname.startsWith("/ne") ? "ne" : "en";
  const isNepali = locale === "ne";

  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between px-6 py-6 sm:px-12 bg-background">
      {/* Top Navigation */}
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
        <Link
          href={`/${locale}/auth/login`}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 border border-border/70 transition-all group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>{isNepali ? "लगइनमा फर्कनुहोस्" : "Back to Login"}</span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="inline-flex items-center gap-3 mb-6">
            <div className="relative w-11 h-11 flex items-center justify-center">
              <Image src="/logo.png" alt="NEPSE Sathi" width={44} height={44} className="w-11 h-11 object-contain" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">
              NEPSE<span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Sathi</span>
            </span>
          </Link>

          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isNepali ? "पासवर्ड रिसेट गर्नुहोस्" : "Reset your password"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
            {isNepali
              ? "तपाईंको खाताको इमेल प्रविष्ट गर्नुहोस् र हामी रिसेट लिङ्क पठाउनेछौं।"
              : "Enter your registered email address and we will send you a password reset link."}
          </p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-foreground">
              {isNepali ? "इमेल पठाइयो!" : "Reset Link Sent!"}
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isNepali
                ? `हामीले ${email} मा पासवर्ड रिसेट लिङ्क पठाएका छौं। कृपया इनबक्स जाँच गर्नुहोस्।`
                : `We've sent a password reset link to ${email}. Please check your inbox and spam folder.`}
            </p>
            <Link
              href={`/${locale}/auth/login`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline pt-2"
            >
              <span>{isNepali ? "लगइनमा फर्कनुहोस्" : "Return to sign in"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="investor@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/80 bg-card text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all shadow-2xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <span>{isNepali ? "पठाउँदै..." : "Sending..."}</span>
              ) : (
                <>
                  <span>{isNepali ? "रिसेट लिङ्क पठाउनुहोस्" : "Send Reset Link"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      <div className="w-full flex items-center justify-center gap-2 text-[11px] text-muted-foreground/80 py-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>Secured with 256-bit encryption.</span>
      </div>
    </div>
  );
}
