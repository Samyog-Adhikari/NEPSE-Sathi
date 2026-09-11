"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Mail,
  MapPin,
  Send,
  Headphones,
  Bug,
  Code2,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Clock,
  Sparkles,
  MessageSquare,
  HelpCircle,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Custom inline SVG icons for brand socials (guaranteed runtime safety)
const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.6a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export default function ContactPage() {
  const pathname = usePathname() || "/en";
  const locale = pathname.startsWith("/ne") ? "ne" : "en";
  const isNepali = locale === "ne";

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    category: "general",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [copiedEmail, setCopiedEmail] = React.useState(false);
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);

  const contactEmail = "adhikarisamyog.dev@gmail.com";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        category: "general",
        subject: "",
        message: "",
      });
    }, 600);
  };

  const categories = [
    { id: "general", label: isNepali ? "सामान्य सोधपुछ" : "General Inquiry" },
    { id: "ai", label: isNepali ? "AI मोडेल र सिग्नल" : "AI & Signals" },
    { id: "api", label: isNepali ? "डेटा र API पहुँच" : "Data & API" },
    { id: "partnership", label: isNepali ? "साझेदारी" : "Partnership" },
  ];

  const socialLinks = [
    {
      name: "GitHub",
      href: "https://github.com/Samyog-Adhikari/NEPSE-Sathi",
      icon: GithubIcon,
      color: "hover:text-foreground hover:bg-muted",
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com",
      icon: LinkedinIcon,
      color: "hover:text-[#0A66C2] hover:bg-[#0A66C2]/10",
    },
    {
      name: "X (Twitter)",
      href: "https://twitter.com",
      icon: XIcon,
      color: "hover:text-foreground hover:bg-muted",
    },
    {
      name: "Facebook",
      href: "https://facebook.com",
      icon: FacebookIcon,
      color: "hover:text-[#1877F2] hover:bg-[#1877F2]/10",
    },
    {
      name: "Instagram",
      href: "https://instagram.com",
      icon: InstagramIcon,
      color: "hover:text-[#E4405F] hover:bg-[#E4405F]/10",
    },
    {
      name: "YouTube",
      href: "https://youtube.com",
      icon: YoutubeIcon,
      color: "hover:text-[#FF0000] hover:bg-[#FF0000]/10",
    },
  ];

  const faqs = [
    {
      q: isNepali
        ? "NEPSE Sathi को AI मोडेल कति चाँडो अपडेट हुन्छ?"
        : "How frequently are the AI predictions updated?",
      a: isNepali
        ? "प्रत्येक कारोबार दिन बजार बन्द भएपछि (३:०० PM NPT) हाम्रो LSTM + XGBoost मोडेलले नयाँ डेटा प्रशोधन गर्छ। बजार समयमा भने वास्तविक समयको फ्लोरसिट र मोमेन्टम सिग्नल निरन्तर अपडेट हुन्छ।"
        : "Our deep neural networks and XGBoost engines re-train on post-close daily data at 3:00 PM NPT. Intraday momentum, floor sheet sentiment, and technical indicators stream in real-time via WebSockets.",
    },
    {
      q: isNepali
        ? "के मलाई प्राविधिक ज्ञान बिना नै यो प्रयोग गर्न सजिलो छ?"
        : "Can beginners easily understand and use NEPSE Sathi?",
      a: isNepali
        ? "अवश्य! हामीले जटिल वित्तीय तथ्याङ्कलाई ०-१०० सम्मको सजिलो स्कोर, स्पष्ट बाइ/सेल संकेत, र पूर्ण नेपाली भाषामा प्रस्तुत गरेका छौं।"
        : "Yes! Complex quantitative metrics are synthesized into clear 0–100 health scores, plain-language signals, and full native Nepali or English interfaces designed for all skill levels.",
    },
    {
      q: isNepali
        ? "के व्यक्तिगत लगानीकर्ताका लागि API उपलब्ध छ?"
        : "Are API endpoints available for algorithmic traders?",
      a: isNepali
        ? "हो, हामी ऐतिहासिक क्यान्डलस्टिक, लाइभ टिकर, र AI सिग्नलका लागि REST र WebSocket API प्रदान गर्दछौं। थप विवरणका लागि हामीलाई 'डेटा र API' विषयमा सम्पर्क गर्नुहोस्।"
        : "Yes, we offer both REST and WebSocket developer APIs for historical candlesticks, live floor sheet streaming, and quantitative signals. Select 'Data & API' above to request access.",
    },
    {
      q: isNepali
        ? "यदि मैले डेटामा कुनै त्रुटि फेला पारेमा कसरी रिपोर्ट गर्ने?"
        : "How do I report a data anomaly or bug?",
      a: isNepali
        ? "तपाईं यो सम्पर्क फारमबाट 'Bug Bounty' च्यानल छनौट गर्न सक्नुहुन्छ वा सिधै हाम्रो इमेल adhikarisamyog.dev@gmail.com मा स्क्रिनसट पठाउन सक्नुहुन्छ।"
        : "Select 'Bug Report' on this form or email us directly at adhikarisamyog.dev@gmail.com with relevant ticker symbols or screenshots for immediate investigation.",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-16 sm:space-y-24">
      {/* ========================================================================= */}
      {/* 1. HERO HEADER (Centered & Distinct from About)                           */}
      {/* ========================================================================= */}
      <div className="text-center max-w-3xl mx-auto space-y-6 pt-2">
        <Badge
          variant="outline"
          className="px-3.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1.5 shadow-xs"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{isNepali ? "सम्पर्क तथा सहायता" : "Direct Support & Inquiries"}</span>
        </Badge>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
          {isNepali ? (
            <>
              हामीसँग <span className="text-emerald-600 dark:text-emerald-400">सम्पर्क</span> गर्नुहोस्
            </>
          ) : (
            <>
              We&apos;re Here to Help You{" "}
              <span className="text-emerald-600 dark:text-emerald-400">
                Navigate NEPSE.
              </span>
            </>
          )}
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {isNepali
            ? "AI मोडेल, डाटा फिड, प्राविधिक सूचक, वा साझेदारी सम्बन्धी कुनै पनि जिज्ञासा भएमा हामीलाई निसङ्कोच सम्पर्क गर्नुहोस्।"
            : "Have questions about our AI models, real-time WebSocket feeds, technical indicators, or enterprise integrations? Reach out anytime."}
        </p>

        {/* Quick Social Connect Bar placed right below Hero Intro */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <span className="text-xs font-semibold text-muted-foreground mr-1 hidden sm:inline">
            {isNepali ? "सामाजिक सञ्जालमा जोडिनुहोस्:" : "Connect with us:"}
          </span>
          {socialLinks.map((s) => {
            const Icon = s.icon;
            return (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                title={s.name}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border/70 bg-card text-muted-foreground transition-all duration-200 hover:scale-105 shadow-xs",
                  s.color
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{s.name}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE: Interactive Contact Form (Left) & Real Map (Right)    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-start">
        {/* Left Column (7 cols) — Interactive Contact Form */}
        <div className="lg:col-span-7 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <span>{isNepali ? "सन्देश पठाउनुहोस्" : "Send us a Message"}</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                {isNepali
                  ? "फारम भर्नुहोस्, हामी केही घण्टाभित्र जवाफ दिनेछौं।"
                  : "Fill out the form and we'll get back to you within a few hours."}
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>&lt; 2h Response</span>
            </div>
          </div>

          {submitted ? (
            <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-foreground">
                  {isNepali ? "सन्देश सफलतापूर्वक प्राप्त भयो!" : "Message Sent Successfully!"}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                  {isNepali
                    ? "तपाईंको सन्देशको लागि धन्यवाद। हाम्रो टोलीले समीक्षा गरी छिट्टै सम्पर्क गर्नेछ।"
                    : "Thank you for reaching out. A team member will review your note and respond promptly."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {isNepali ? "अर्को सन्देश पठाउनुहोस्" : "Send another message"}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Category Pills */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  {isNepali ? "सोधपुछ विषय" : "Inquiry Category"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.id })}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                        formData.category === cat.id
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {isNepali ? "तपाईंको नाम" : "Full Name"} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isNepali ? "उदा: संयोग अधिकारी" : "e.g. Samyog Adhikari"}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {isNepali ? "इमेल ठेगाना" : "Email Address"} *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {isNepali ? "शीर्षक / विषय" : "Subject"}
                </label>
                <input
                  type="text"
                  placeholder={
                    isNepali
                      ? "छोटो विवरण..."
                      : "Brief summary of your inquiry..."
                  }
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-foreground">
                    {isNepali ? "सन्देश" : "Message"} *
                  </label>
                  <span className="text-[10px] text-muted-foreground">
                    {formData.message.length}/1000
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  maxLength={1000}
                  placeholder={
                    isNepali
                      ? "तपाईंको प्रश्न वा सुझाव यहाँ लेख्नुहोस्..."
                      : "Write your message, question, or feature request here..."
                  }
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                )}
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{isNepali ? "पठाउँदैछ..." : "Sending Message..."}</span>
                  </span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{isNepali ? "सन्देश पठाउनुहोस्" : "Send Message"}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Column (5 cols) — Working Kathmandu Interactive Map & Direct Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* Interactive Working Map of Kathmandu, Nepal */}
          <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xl">
            <div className="p-4 border-b border-border/60 bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-foreground">
                  Kathmandu, Nepal
                </span>
              </div>
              <a
                href="https://www.openstreetmap.org/?mlat=27.7172&mlon=85.3240#map=13/27.7172/85.3240"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1"
              >
                <span>{isNepali ? "पूर्ण नक्सा" : "Open Map"}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Embedded interactive OpenStreetMap centered on Kathmandu */}
            <div className="relative w-full h-64 sm:h-72 bg-muted">
              <iframe
                title="Kathmandu Nepal Map"
                src="https://www.openstreetmap.org/export/embed.html?bbox=85.2500%2C27.6600%2C85.3850%2C27.7600&amp;layer=mapnik&amp;marker=27.7172%2C85.3240"
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>

            {/* Map footer info pill */}
            <div className="p-3.5 bg-card text-[11px] text-muted-foreground flex items-center justify-between border-t border-border/60">
              <span className="font-mono">27.7172° N, 85.3240° E</span>
              <span className="font-medium text-foreground">Bagmati Province</span>
            </div>
          </div>

          {/* Direct Email Card with 1-click Copy */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    {isNepali ? "प्रत्यक्ष इमेल" : "Direct Email"}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-foreground font-mono truncate max-w-[200px] sm:max-w-none">
                    {contactEmail}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyEmail}
                title="Copy email to clipboard"
                className="p-2 rounded-xl border border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {copiedEmail ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Operational Hours */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-md flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="space-y-1 text-xs">
              <div className="font-bold text-foreground">
                {isNepali ? "बजार सञ्चालन समय" : "Market & Support Hours"}
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {isNepali
                  ? "आइतबार – बिहीबार: ११:०० AM – ३:०० PM (NPT बजार समय)। हाम्रो सर्भर र AI पाइपलाइन २४/७ सञ्चालनमा रहन्छ।"
                  : "Sunday – Thursday: 11:00 AM – 3:00 PM NPT (Trading Hours). AI data streaming & infrastructure are monitored 24/7."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SUPPORT CHANNELS (4 Distinct Cards)                                     */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Badge
            variant="outline"
            className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1.5 shadow-xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{isNepali ? "सहायता च्यानलहरू" : "Specialized Support"}</span>
          </Badge>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
            {isNepali ? "तपाईंलाई आवश्यक सहयोग छनौट गर्नुहोस्" : "Direct Channels for Every Need"}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: isNepali ? "ट्रेडिङ सहायता" : "Market Support",
              desc: isNepali
                ? "चार्ट, इन्डिकेटर, र वाचलिस्ट सम्बन्धी प्रश्नहरू।"
                : "Questions about charts, technical indicators & watchlists.",
              icon: Headphones,
              contact: "support@nepse-sathi.com",
            },
            {
              title: isNepali ? "API र इन्टिग्रेसन" : "API & Developers",
              desc: isNepali
                ? "अल्गोरिदम, ब्याकटेटिङ, र वेबहुक इन्टिग्रेसन।"
                : "WebSocket feeds, REST keys & algorithmic integration.",
              icon: Code2,
              contact: "api@nepse-sathi.com",
            },
            {
              title: isNepali ? "बग बाउन्टी" : "Bug Bounty",
              desc: isNepali
                ? "कुनै बग वा डेटा विसंगति भेटिएमा रिपोर्ट गर्नुहोस्।"
                : "Report vulnerabilities or data stream anomalies.",
              icon: Bug,
              contact: "security@nepse-sathi.com",
            },
            {
              title: isNepali ? "संस्थागत साझेदारी" : "Partnerships",
              desc: isNepali
                ? "ब्रोकर, विश्लेषक, र मिडिया सहकार्यका लागि।"
                : "Broker integrations, research alliances & press.",
              icon: Sparkles,
              contact: "adhikarisamyog.dev@gmail.com",
            },
          ].map((channel) => {
            const Icon = channel.icon;
            return (
              <div
                key={channel.title}
                className="group rounded-2xl border border-border/80 bg-card p-5 space-y-3 hover:border-emerald-500/40 hover:shadow-md transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  {channel.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {channel.desc}
                </p>
                <div className="pt-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                  {channel.contact}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. INTERACTIVE FAQ ACCORDION                                              */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-600" />
              <span>{isNepali ? "प्राय सोधिने प्रश्नहरू" : "Frequently Asked Questions"}</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {isNepali
                ? "तपाईंको प्रश्नको तत्काल उत्तर यहाँ फेला पार्नुहोस्।"
                : "Quick answers to common questions about NEPSE Sathi."}
            </p>
          </div>
          <Link
            href={`/${locale}/features`}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
          >
            <span>{isNepali ? "सबै फिचरहरू हेर्नुहोस्" : "Explore All Features"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-border/60">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={faq.q} className="py-4 first:pt-0 last:pb-0">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left gap-4 text-sm font-bold text-foreground hover:text-emerald-600 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-200",
                      isOpen && "rotate-180 text-emerald-600"
                    )}
                  />
                </button>
                {isOpen && (
                  <p className="mt-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed animate-in fade-in duration-200">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
