"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Activity,
  BarChart3,
  LineChart,
  Cpu,
  Star,
  PieChart,
  Layers,
  Target,
  Newspaper,
  Calculator,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Globe2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavGroup {
  groupName: string;
  items: {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

export function DashboardSidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: DashboardSidebarProps) {
  const pathname = usePathname() || "";
  const locale = pathname.startsWith("/ne") ? "ne" : "en";
  const isNepali = locale === "ne";

  // 12 Concrete NEPSE Sathi Platform Features + Dashboard & Account
  const navGroups: NavGroup[] = [
    {
      groupName: isNepali ? "मुख्य टर्मिनल" : "Main Terminal",
      items: [
        {
          label: isNepali ? "ड्यासबोर्ड" : "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          label: isNepali ? "लाइभ बजार हब" : "Live Market Hub",
          href: "/market",
          icon: TrendingUp,
          badge: "Live",
        },
        {
          label: isNepali ? "फ्लोरशीट र ब्रोकर" : "Floorsheet & Brokers",
          href: "/floorsheet",
          icon: Activity,
        },
        {
          label: isNepali ? "स्टक स्क्रिनर" : "Stock Screener",
          href: "/stocks",
          icon: BarChart3,
        },
        {
          label: isNepali ? "प्राविधिक चार्ट" : "Technical Charts",
          href: "/technicals",
          icon: LineChart,
        },
      ],
    },
    {
      groupName: isNepali ? "इन्टेलिजेन्स र उपकरणहरू" : "Intelligence & Tools",
      items: [
        {
          label: isNepali ? "एआई विश्लेषण र आउटलुक" : "AI Intelligence",
          href: "/ai",
          icon: Cpu,
        },
        {
          label: isNepali ? "वाचलिस्ट" : "Watchlist",
          href: "/watchlist",
          icon: Star,
        },
        {
          label: isNepali ? "स्मार्ट WACC र पोर्टफोलियो" : "Smart Portfolio & WACC",
          href: "/portfolio",
          icon: PieChart,
        },
        {
          label: isNepali ? "आईपीओ हब र BOID" : "IPO Hub & BOID",
          href: "/ipo",
          icon: Layers,
        },
        {
          label: isNepali ? "ट्रेड जर्नल र R:R" : "Trade Journal",
          href: "/journal",
          icon: Target,
        },
        {
          label: isNepali ? "समाचार र सूचना" : "News & Disclosures",
          href: "/news",
          icon: Newspaper,
        },
        {
          label: isNepali ? "कर र SIP क्यालकुलेटर" : "Financial Suite",
          href: "/tools",
          icon: Calculator,
        },
      ],
    },
    {
      groupName: isNepali ? "खाता" : "Account",
      items: [
        {
          label: isNepali ? "प्रयोगकर्ता प्रोफाइल" : "Profile",
          href: "/dashboard/profile",
          icon: User,
        },
        {
          label: isNepali ? "सेटिङ्हरू" : "Settings",
          href: "/dashboard/settings",
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-30 flex flex-col border-r border-border/60 bg-card/95 backdrop-blur-xl transition-all duration-300 ease-in-out",
          collapsed ? "lg:w-[72px]" : "lg:w-[260px]",
          mobileOpen ? "translate-x-0 w-[280px]" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border/40 shrink-0">
          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center gap-3 group"
          >
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
              <Image
                src="/logo.png"
                alt="NEPSE Sathi"
                width={40}
                height={40}
                className="w-10 h-10 object-contain group-hover:scale-105 transition-transform"
                priority
              />
            </div>
            {!collapsed && (
              <span className="font-bold text-lg tracking-tight text-foreground whitespace-nowrap">
                NEPSE<span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Sathi</span>
              </span>
            )}
          </Link>

          {/* Mobile close */}
          <button
            onClick={onMobileClose}
            className="lg:hidden w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggle}
            className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links — Full 12 Features */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!collapsed && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-1">
                  {group.groupName}
                </p>
              )}
              {group.items.map((item) => {
                const fullHref = `/${locale}${item.href}`;
                const isActive =
                  pathname === fullHref ||
                  (item.href !== "/dashboard" && pathname.startsWith(fullHref));

                return (
                  <Link
                    key={item.href}
                    href={fullHref}
                    onClick={onMobileClose}
                    className={cn(
                      "group flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150",
                      collapsed && "lg:justify-center lg:px-0",
                      isActive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        isActive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    {!collapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom: Connect With Us */}
        <div
          className={cn(
            "border-t border-border/40 px-4 py-3 shrink-0 bg-card/50",
            collapsed && "lg:px-2 text-center"
          )}
        >
          {!collapsed ? (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                {isNepali ? "हामीसँग जोडिनुहोस्" : "Connect With Us"}
              </h4>
              <div className="flex items-center gap-2">
                {/* Official NEPSE Portal */}
                <a
                  href="https://www.nepalstock.com"
                  target="_blank"
                  rel="noreferrer"
                  title="Nepal Stock Exchange (Official)"
                  aria-label="Nepal Stock Exchange"
                  className="w-7 h-7 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-emerald-500 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all"
                >
                  <Globe2 className="w-3.5 h-3.5" />
                </a>
                {/* Discord Community */}
                <a
                  href="https://discord.gg"
                  target="_blank"
                  rel="noreferrer"
                  title="Discord Community"
                  aria-label="Discord"
                  className="w-7 h-7 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-emerald-500 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                  </svg>
                </a>
                {/* X / Twitter */}
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                  title="X (Twitter)"
                  aria-label="X (Twitter)"
                  className="w-7 h-7 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-emerald-500 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <a
                href="https://www.nepalstock.com"
                target="_blank"
                rel="noreferrer"
                title="Nepal Stock Exchange"
                aria-label="NEPSE"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-emerald-500 transition-all"
              >
                <Globe2 className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
