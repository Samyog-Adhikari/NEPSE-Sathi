"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";

export function Footer() {
  const pathname = usePathname() || "/en";
  const locale = pathname.startsWith("/ne") ? "ne" : "en";
  const isNepali = locale === "ne";
  const [email, setEmail] = React.useState("");
  const [subscribed, setSubscribed] = React.useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const productLinks = [
    { label: isNepali ? "सुविधाहरू" : "Features", href: `/${locale}/features` },
    { label: isNepali ? "मूल्य निर्धारण" : "Pricing", href: `/${locale}/pricing` },
    { label: isNepali ? "डाउनलोड" : "Download", href: `/${locale}/features` },
  ];

  const companyLinks = [
    { label: isNepali ? "हाम्रोबारे" : "About Us", href: `/${locale}/about` },
    { label: isNepali ? "सम्पर्क" : "Contact", href: `/${locale}/contact` },
    { label: isNepali ? "गोपनीयता नीति" : "Privacy Policy", href: `/${locale}/privacy` },
  ];

  const supportLinks = [
    { label: isNepali ? "सहायता केन्द्र" : "Help Center", href: `/${locale}/contact` },
    { label: isNepali ? "प्राय सोधिने प्रश्नहरू" : "FAQs", href: `/${locale}/about` },
    { label: isNepali ? "सेवाका सर्तहरू" : "Terms of Service", href: `/${locale}/terms` },
  ];

  return (
    <footer className="w-full border-t border-border/80 bg-card/60 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <Link href={`/${locale}`} className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="NEPSE Sathi Logo"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
              />
              <span className="font-bold text-lg tracking-tight text-foreground">
                NEPSE<span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Sathi</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {isNepali ? "स्मार्ट विश्लेषण। उत्तम निर्णय।" : "Smarter Insights. Better Decisions."}
            </p>

            {/* Social Icons: X, LinkedIn, Facebook, Instagram */}
            <div className="flex items-center gap-3 pt-2 text-muted-foreground">
              {/* X / Twitter */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X (Twitter)"
                className="w-8 h-8 rounded-full border border-border/70 flex items-center justify-center hover:text-foreground hover:bg-muted transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full border border-border/70 flex items-center justify-center hover:text-foreground hover:bg-muted transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.6a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full border border-border/70 flex items-center justify-center hover:text-foreground hover:bg-muted transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full border border-border/70 flex items-center justify-center hover:text-foreground hover:bg-muted transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product Links (Features, Pricing, Download) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
              {isNepali ? "उत्पादन" : "Product"}
            </h4>
            <ul className="space-y-2 text-xs">
              {productLinks.map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links (About Us, Contact, Privacy Policy) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
              {isNepali ? "कम्पनी" : "Company"}
            </h4>
            <ul className="space-y-2 text-xs">
              {companyLinks.map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links (Help Center, FAQs, Terms of Service) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
              {isNepali ? "सहायता" : "Support"}
            </h4>
            <ul className="space-y-2 text-xs">
              {supportLinks.map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Stay Updated Newsletter Box */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              {isNepali ? "अपडेट रहनुहोस्" : "Stay Updated"}
            </h4>
            <p className="text-xs text-muted-foreground">
              {isNepali ? "ताजा बजार समाचार आफ्नो इनबक्समा पाउनुहोस्।" : "Get the latest news and updates straight to your inbox."}
            </p>

            {subscribed ? (
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 py-1">
                {isNepali ? "धन्यवाद! तपाईं दर्ता हुनुभयो।" : "Thank you for subscribing!"}
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="relative flex items-center">
                <input
                  type="email"
                  required
                  placeholder={isNepali ? "तपाईंको इमेल..." : "Enter your email"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 pr-9 text-xs rounded-xl border border-border/80 bg-background focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="absolute right-1.5 w-6 h-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-3">
          <div>
            © 2026 NEPSE Sathi. All rights reserved.
          </div>
          <div className="text-foreground/80 font-medium">
            Invest Smart. Grow Together.
          </div>
        </div>
      </div>
    </footer>
  );
}
