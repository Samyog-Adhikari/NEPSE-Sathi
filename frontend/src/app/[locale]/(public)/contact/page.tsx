"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Zap,
  ShieldCheck,
  Heart,
  MessageCircle,
  Lightbulb,
  Bug,
  Users,
  CheckCircle2,
  Lock,
  ArrowRight,
  Plus,
  Minus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ContactPage() {
  const pathname = usePathname() || "/en";
  const locale = pathname.startsWith("/ne") ? "ne" : "en";
  const isNepali = locale === "ne";

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [openFaqs, setOpenFaqs] = React.useState<Record<number, boolean>>({
    0: true,
  });

  const contactEmail = "adhikarisamyog.dev@gmail.com";

  const toggleFaq = (idx: number) => {
    setOpenFaqs((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
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
        subject: "",
        message: "",
      });
    }, 600);
  };

  const faqsList = [
    {
      q: isNepali ? "खाता कसरी सिर्जना गर्ने?" : "How can I create an account?",
      a: isNepali
        ? "तपाईं माथिल्लो नेभिगेसन बारमा रहेको 'Get Started' मा क्लिक गरेर आफ्नो इमेल वा गुगल खाता मार्फत केही सेकेन्डमै निःशुल्क दर्ता गर्न सक्नुहुन्छ।"
        : "You can sign up for free in seconds with your email or Google account by clicking 'Get Started' on the navigation bar.",
    },
    {
      q: isNepali ? "के म नयाँ फिचर सुझाव दिन सक्छु?" : "Can I suggest a new feature?",
      a: isNepali
        ? "अवश्य! हामी समुदायका सुझाव अनुसार नै निरन्तर नयाँ फिचरहरू थप्दैछौं। माथिको सम्पर्क फारममा 'Feature Suggestion' विषय छनौट गरी सन्देश पठाउनुहोस्।"
        : "Yes! We actively build based on community requests. Use the contact form above with 'Feature Suggestion' as the subject.",
    },
    {
      q: isNepali ? "के यो एप प्रयोग गर्न निःशुल्क छ?" : "Is the app free to use?",
      a: isNepali
        ? "NEPSE Sathi को आधारभूत सुविधाहरू (लाइभ क्यान्डलस्टिक चार्ट, इन्डिकेटर, पोर्टफोलियो ट्र्याकिङ) पूर्ण निःशुल्क छन्। उन्नत AI मोडेलहरूका लागि प्रो योजना उपलब्ध छ।"
        : "NEPSE Sathi offers a generous free tier with live technical charts, indicators, and portfolio tracking. Advanced AI predictions are part of our Pro plan.",
    },
    {
      q: isNepali ? "के मेरो डाटा सुरक्षित छ?" : "Is my data safe?",
      a: isNepali
        ? "बिल्कुल। हामी बैंकिङ-स्तरको AES-256 इन्क्रिप्सन प्रयोग गर्छौं र तपाईंको व्यक्तिगत वित्तीय तथ्याङ्क कहिल्यै कसैलाई बेच्दैनौं वा साझेदारी गर्दैनौं।"
        : "Absolutely. We use bank-grade AES-256 encryption for user portfolios and never sell or share your private trading activity.",
    },
    {
      q: isNepali ? "सहायताका लागि कसरी सम्पर्क गर्ने?" : "How do I get in touch for support?",
      a: isNepali
        ? "तपाईं यो फारम भर्न सक्नुहुन्छ, सिधै adhikarisamyog.dev@gmail.com मा इमेल गर्न सक्नुहुन्छ, वा हाम्रो समुदाय डिस्कर्ड/टेलिग्राममा जोडिन सक्नुहुन्छ।"
        : "You can send us a message via the form above, email adhikarisamyog.dev@gmail.com, or reach out to our community Telegram channels.",
    },
    {
      q: isNepali ? "के प्रिमियम योजनाहरू उपलब्ध छन्?" : "Do you offer any premium plans?",
      a: isNepali
        ? "हो, NEPSE Sathi Pro मा गहिरो AI मूल्य चाल भविष्यवाणी, वास्तविक समयको फ्लोरसिट क्लस्टरिङ, र संस्थागत संकलन विश्लेषण उपलब्ध छ।"
        : "Yes, NEPSE Sathi Pro includes deep AI price predictions, real-time floor sheet clustering, and smart money accumulation heatmaps.",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-16 sm:space-y-24">
      {/* ========================================================================= */}
      {/* 1. HERO — Centered, Elegant & Production-Grade (Distinct Layout)          */}
      {/* ========================================================================= */}
      <div className="text-center max-w-3xl mx-auto space-y-5 pt-2 sm:pt-6">
        <Badge
          variant="outline"
          className="px-3.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1.5 shadow-xs mx-auto inline-flex"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>{isNepali ? "सम्पर्क गर्नुहोस्" : "Contact Us"}</span>
        </Badge>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
          {isNepali ? (
            <>
              जिज्ञासा छ?{" "}
              <span className="text-emerald-600 dark:text-emerald-400">
                हामी सहयोग गर्न
              </span>{" "}
              यहाँ छौं।
            </>
          ) : (
            <>
              Got Questions?{" "}
              <span className="text-emerald-600 dark:text-emerald-400">
                We&apos;re Here
              </span>{" "}
              to Help.
            </>
          )}
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
          {isNepali
            ? "कुनै प्रश्न, सुझाव वा नमस्कार मात्र भन्न चाहनुहुन्छ भने पनि हामी तपाईंको कुरा सुन्न चाहन्छौं। हाम्रो टोली सधैं सहयोग गर्न तयार छ।"
            : "Whether you have a question, feedback, or just want to say hello — we'd love to hear from you. Our team is always ready to help and will get back to you as soon as possible."}
        </p>

        {/* 3 Centered Feature Bullets */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-2">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-border/80 text-xs font-medium text-foreground shadow-xs">
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <Zap className="w-3 h-3" />
            </div>
            <span>{isNepali ? "२४ घण्टाभित्र द्रुत जवाफ" : "Quick Response (< 24h)"}</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-border/80 text-xs font-medium text-foreground shadow-xs">
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3 h-3" />
            </div>
            <span>{isNepali ? "मित्रवत प्रत्यक्ष सहयोग" : "Friendly Support"}</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-border/80 text-xs font-medium text-foreground shadow-xs">
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <Heart className="w-3 h-3" />
            </div>
            <span>{isNepali ? "तपाईंको सुझावबाट सुधार" : "Feedback Driven"}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CONTACT INFORMATION (Left) & SEND US A MESSAGE FORM (Right)            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Card: Contact Information */}
        <div className="lg:col-span-5 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-md space-y-6">
          <div className="space-y-2">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {isNepali ? "सम्पर्कमा रहनुहोस्" : "Get in Touch"}
            </div>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
              {isNepali ? "सम्पर्क जानकारी" : "Contact Information"}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {isNepali
                ? "तपाईं निम्न कुनै पनि माध्यमबाट हामीलाई सम्पर्क गर्न सक्नुहुन्छ। हामी छिट्टै सम्पर्क गर्नेछौं।"
                : "You can reach us through any of the following channels. We'll get back to you as soon as possible."}
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {/* Email */}
            <div className="flex items-start gap-3.5 p-3 rounded-2xl hover:bg-muted/40 transition-colors">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Email
                </div>
                <div className="text-xs sm:text-sm font-bold text-foreground font-mono">
                  {contactEmail}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {isNepali ? "हामी प्रायः २४ घण्टाभित्र जवाफ दिन्छौं।" : "We usually reply within 24 hours."}
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3.5 p-3 rounded-2xl hover:bg-muted/40 transition-colors">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Phone
                </div>
                <div className="text-xs sm:text-sm font-bold text-foreground font-mono">
                  +977 98 1234 5678
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {isNepali ? "आइत – शुक्र, १०:०० AM – ६:०० PM (NPT)" : "Mon – Fri, 10:00 AM – 6:00 PM (NPT)"}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3.5 p-3 rounded-2xl hover:bg-muted/40 transition-colors">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Location
                </div>
                <div className="text-xs sm:text-sm font-bold text-foreground">
                  Kathmandu, Nepal
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {isNepali ? "(अनलाइन / रिमोट सहायता उपलब्ध)" : "(Remote / Online Support Available)"}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Alert Link to FAQs */}
          <a
            href="#faqs"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/15 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="space-y-0.5 text-left">
                <div className="text-xs font-bold">
                  {isNepali ? "केही अन्योल छ?" : "Not sure about something?"}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {isNepali
                    ? "FAQ सेक्सन हेर्नुहोस्। त्यहाँ उत्तर भेटिन सक्छ!"
                    : "Check out our FAQ section below for quick answers!"}
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform shrink-0" />
          </a>
        </div>

        {/* Right Card: Send Us a Message Form */}
        <div className="lg:col-span-7 rounded-3xl border border-border/80 bg-card overflow-hidden shadow-md">
          {/* Dark Forest Green Ribbon Header with Cursive */}
          <div className="bg-gradient-to-r from-[#06241b] via-[#093126] to-[#06241b] text-white p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-800/40">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {isNepali ? "हामीलाई सन्देश पठाउनुहोस्" : "Send Us a Message"}
              </h2>
              <p className="text-xs text-white/80">
                {isNepali
                  ? "तलको फारम भर्नुहोस् र हामी छिट्टै सम्पर्क गर्नेछौं।"
                  : "Fill out the form below and we'll get back to you shortly."}
              </p>
            </div>
            <div
              className="text-lg sm:text-xl font-bold text-emerald-300 italic self-end sm:self-center"
              style={{ fontFamily: "'Caveat', 'Segoe Script', cursive" }}
            >
              We&apos;d love to hear from you!
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {submitted ? (
              <div className="py-12 text-center space-y-4 animate-in fade-in duration-300">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-foreground">
                    {isNepali ? "सन्देश पठाइयो!" : "Message Sent Successfully!"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isNepali
                      ? "हाम्रो टोलीले समीक्षा गरी चाँडै जवाफ दिनेछ।"
                      : "Our team will review your message and reply soon."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  {isNepali ? "अर्को सन्देश पठाउनुहोस्" : "Send another message"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {isNepali ? "पूरा नाम" : "Full Name"} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isNepali ? "तपाईंको नाम" : "Your name"}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {isNepali ? "इमेल ठेगाना" : "Email Address"} *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {isNepali ? "विषय" : "Subject"} *
                  </label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all cursor-pointer"
                  >
                    <option value="">{isNepali ? "विषय छनौट गर्नुहोस्" : "Select a subject"}</option>
                    <option value="General Inquiry">{isNepali ? "सामान्य सोधपुछ" : "General Inquiry"}</option>
                    <option value="Technical Support">{isNepali ? "प्राविधिक सहायता" : "Technical Support"}</option>
                    <option value="Feature Suggestion">{isNepali ? "फिचर सुझाव" : "Feature Suggestion"}</option>
                    <option value="Bug Report">{isNepali ? "बग रिपोर्ट" : "Bug Report"}</option>
                    <option value="Partnership">{isNepali ? "साझेदारी" : "Partnership"}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {isNepali ? "सन्देश" : "Message"} *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder={isNepali ? "यहाँ सन्देश लेख्नुहोस्..." : "Type your message here..."}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "w-full rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer h-12"
                  )}
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{isNepali ? "सन्देश पठाउनुहोस्" : "Send Message"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1.5 pt-1">
                  <Lock className="w-3 h-3 text-muted-foreground/70" />
                  <span>{isNepali ? "तपाईंको जानकारी सुरक्षित छ।" : "Your information is safe with us."}</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. 4 SUPPORT CARDS (Clean Minimal Cards - No Action Buttons)              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[
          {
            title: isNepali ? "साधारण प्रश्नहरू?" : "Common Questions?",
            desc: isNepali
              ? "साधारण प्रश्नहरूको द्रुत उत्तरका लागि हाम्रो FAQ हेर्नुहोस्।"
              : "Browse our FAQ section for quick answers to the most common queries.",
            icon: MessageCircle,
            bg: "bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400",
          },
          {
            title: isNepali ? "फिचर सुझावहरू" : "Feature Suggestions",
            desc: isNepali
              ? "एपलाई अझ राम्रो बनाउने कुनै विचार छ? हामी सुन्न चाहन्छौं!"
              : "Have an idea to make our app better? We'd love to hear it!",
            icon: Lightbulb,
            bg: "bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400",
          },
          {
            title: isNepali ? "समस्या रिपोर्ट गर्नुहोस्" : "Report an Issue",
            desc: isNepali
              ? "कुनै बग वा समस्या भेटियो? हामीलाई जानकारी दिनुहोस्।"
              : "Found a bug or facing a problem? Let us know and we'll fix it.",
            icon: Bug,
            bg: "bg-amber-100/90 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400",
          },
          {
            title: isNepali ? "समुदायमा जोडिनुहोस्" : "Join Our Community",
            desc: isNepali
              ? "अपडेट, सुझाव, र नवीनतम समाचारका लागि हामीलाई फलो गर्नुहोस्।"
              : "Follow us for updates, tips and getting the latest news.",
            icon: Users,
            bg: "bg-teal-100/90 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400",
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="group rounded-3xl border border-border/80 bg-card p-6 space-y-3 hover:border-emerald-500/40 hover:shadow-md transition-all duration-200"
            >
              <div
                className={cn(
                  "w-11 h-11 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs",
                  card.bg
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                {card.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {card.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 4. FREQUENTLY ASKED QUESTIONS (Connected by id="faqs")                     */}
      {/* ========================================================================= */}
      <section id="faqs" className="scroll-mt-24 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <Badge
              variant="outline"
              className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1.5 shadow-xs"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{isNepali ? "FAQ" : "FAQ"}</span>
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {isNepali ? "प्राय सोधिने प्रश्नहरू" : "Frequently Asked Questions"}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isNepali
                ? "तपाईंले खोजेको जवाफ भेटिएन? हामीलाई सम्पर्क गर्नुहोस् — हामी सहयोग गर्न खुसी छौं!"
                : "Can't find what you're looking for? Reach out to us — we're happy to help!"}
            </p>
          </div>

          <a
            href="#faqs"
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
          >
            <span>{isNepali ? "सबै प्रश्नहरू" : "View all FAQs"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 2-Column FAQ Grid Accordion */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {faqsList.map((faq, idx) => {
            const isOpen = Boolean(openFaqs[idx]);
            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-border/80 bg-card overflow-hidden transition-all shadow-xs hover:border-emerald-500/30"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 text-sm font-bold text-foreground cursor-pointer hover:text-emerald-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
                    {isOpen ? (
                      <Minus className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-0 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 animate-in fade-in duration-200">
                    <p className="pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
