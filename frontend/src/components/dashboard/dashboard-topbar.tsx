"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Check,
  TrendingUp,
  Activity,
  AlertCircle,
  Clock,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getStockBrand } from "@/lib/logos";

interface DashboardTopbarProps {
  onMobileMenuToggle: () => void;
}

interface StockSearchResult {
  symbol: string;
  name?: string;
  ltp: number;
  point_change: number;
  change_percent: number;
  sector?: string;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "market" | "alert" | "system";
  href?: string;
}

export function DashboardTopbar({ onMobileMenuToggle }: DashboardTopbarProps) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const locale = pathname.startsWith("/ne") ? "ne" : "en";
  const isNepali = locale === "ne";

  // Search states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchFocused, setSearchFocused] = React.useState(false);
  const [allStocks, setAllStocks] = React.useState<StockSearchResult[]>([]);
  const [isSearchLoading, setIsSearchLoading] = React.useState(false);

  // Popover states
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);

  // User state
  const [userProfile, setUserProfile] = React.useState<{ name: string; email: string; avatarUrl: string }>({
    name: "Samyog Adhikari",
    email: "investor@nepse-sathi.com",
    avatarUrl: "/logo.png",
  });

  const [notifications, setNotifications] = React.useState<NotificationItem[]>([
    {
      id: "1",
      title: isNepali ? "नेप्से बजार सत्र अपडेट" : "NEPSE Market Session Update",
      description: isNepali ? "नियमित कारोबार सत्र सोमबार देखि शुक्रबार बिहान ११:०० देखि दिउँसो ३:०० बजे सम्म सक्रिय रहन्छ।" : "Regular NEPSE trading session operates Mon-Fri 11:00 AM – 3:00 PM NPT.",
      time: "10m ago",
      read: false,
      type: "market",
      href: `/${locale}/market`,
    },
    {
      id: "2",
      title: isNepali ? "टेलिग्राम बट सक्रिय" : "Telegram Bot Connected",
      description: isNepali ? "तपाईंको टेलिग्राम बट @NEPSE_Sathi_Bot मार्फत प्रत्यक्ष सूचनाहरू प्राप्त गर्न सक्नुहुन्छ।" : "Real-time market alerts and stock lookups are live via @NEPSE_Sathi_Bot.",
      time: "35m ago",
      read: false,
      type: "system",
    },
    {
      id: "3",
      title: isNepali ? "बजार संवाहक विश्लेषण" : "Market Movers Refreshed",
      description: isNepali ? "शीर्ष कमाउने र गुमाउने कम्पनीहरूको तथ्याङ्क अद्यावधिक गरिएको छ।" : "Top gainers, losers, and turnover leaders updated with fresh scrapings.",
      time: "1h ago",
      read: true,
      type: "alert",
      href: `/${locale}/dashboard`,
    },
  ]);

  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const notifRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLDivElement>(null);

  // Fetch stocks for instant search
  React.useEffect(() => {
    setIsSearchLoading(true);
    apiFetch<any>("/api/v1/stocks?limit=500")
      .then((res) => {
        const raw = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
        if (raw.length > 0) {
          setAllStocks(raw);
        } else {
          // Fallback to /market/stocks
          apiFetch<any>("/api/v1/market/stocks").then((mRes) => {
            const mRaw = Array.isArray(mRes.data) ? mRes.data : (Array.isArray(mRes.data?.data) ? mRes.data.data : []);
            if (mRaw.length > 0) setAllStocks(mRaw);
          });
        }
      })
      .catch((err) => {
        console.error("Search stocks load error:", err);
        apiFetch<any>("/api/v1/market/stocks").then((mRes) => {
          const mRaw = Array.isArray(mRes.data) ? mRes.data : (Array.isArray(mRes.data?.data) ? mRes.data.data : []);
          if (mRaw.length > 0) setAllStocks(mRaw);
        });
      })
      .finally(() => setIsSearchLoading(false));
  }, []);

  // Fetch logged in user details & avatar
  React.useEffect(() => {
    // Initial local read for instant render without flicker
    const savedAvatar = typeof window !== "undefined" ? localStorage.getItem("nepse_user_avatar") : null;
    const savedName = typeof window !== "undefined" ? localStorage.getItem("nepse_user_name") : null;
    if (savedAvatar || savedName) {
      setUserProfile((prev) => ({
        ...prev,
        avatarUrl: savedAvatar || prev.avatarUrl,
        name: savedName || prev.name,
      }));
    }

    supabase.auth.getUser().then((res: any) => {
      const u = res?.data?.user;
      if (u) {
        const name = u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0] || "Investor";
        const email = u.email || "";
        const metaAvatar = u.user_metadata?.avatar_url;
        const finalAvatar = (metaAvatar && metaAvatar !== "/logo.png") ? metaAvatar : (savedAvatar || metaAvatar || "/logo.png");
        setUserProfile({ name, email, avatarUrl: finalAvatar });
      }
    });

    const handleAvatarUpdate = (e: any) => {
      if (e.detail) {
        setUserProfile((prev) => ({ ...prev, avatarUrl: e.detail }));
      }
    };
    window.addEventListener("nepse_avatar_changed", handleAvatarUpdate);
    return () => window.removeEventListener("nepse_avatar_changed", handleAvatarUpdate);
  }, []);

  // Close dropdowns on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Filtered search stocks
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return allStocks
      .filter((s) => s.symbol.toLowerCase().includes(q) || (s.name && s.name.toLowerCase().includes(q)))
      .slice(0, 8);
  }, [allStocks, searchQuery]);

  const handleSelectStock = (symbol: string) => {
    setSearchQuery("");
    setSearchFocused(false);
    router.push(`/${locale}/technicals?symbol=${symbol}`);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (searchResults.length > 0) {
        handleSelectStock(searchResults[0].symbol);
      } else if (searchQuery.trim()) {
        router.push(`/${locale}/stocks?search=${encodeURIComponent(searchQuery.trim())}`);
        setSearchFocused(false);
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}/auth/login`);
  };

  const userInitials = userProfile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "SA";

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border/50 bg-background/85 backdrop-blur-xl px-4 lg:px-6 h-14">
      {/* Left: Mobile menu + Interactive Stock Search */}
      <div className="flex items-center gap-3 flex-1">
        {/* Mobile hamburger */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Live Search Bar */}
        <div className="relative max-w-sm w-full" ref={searchRef}>
          <div className="relative flex items-center w-full">
            <Search className="absolute left-2.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder={isNepali ? "स्टक खोज्नुहोस् (उदा: NABIL, SHIVM)..." : "Search stocks (e.g. NABIL, SHIVM)..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-border/60 bg-muted/30 placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:bg-background transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchFocused && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 top-full mt-1.5 w-full sm:w-96 rounded-xl border border-border/70 bg-popover/95 shadow-xl backdrop-blur-xl p-2 z-50 animate-in fade-in-0 zoom-in-95 duration-150 space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 flex items-center justify-between">
                <span>{isNepali ? "स्टक खोज नतिजा" : "Stock Search Results"}</span>
                <span>{searchResults.length} found</span>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-0.5 pr-0.5">
                {searchResults.length === 0 ? (
                  <div className="py-4 text-center text-xs text-muted-foreground">
                    {isNepali ? "कुनै स्टक फेला परेन" : `No stocks found matching "${searchQuery}"`}
                  </div>
                ) : (
                  searchResults.map((stk) => {
                    const isUp = stk.point_change > 0;
                    const isDown = stk.point_change < 0;
                    const brand = getStockBrand(stk.symbol);
                    return (
                      <button
                        key={stk.symbol}
                        onClick={() => handleSelectStock(stk.symbol)}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-muted/60 transition-colors text-left group cursor-pointer"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-foreground group-hover:text-emerald-500 transition-colors">
                              {stk.symbol}
                            </span>
                            {stk.sector && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-sans truncate max-w-[120px]">
                                {stk.sector}
                              </span>
                            )}
                          </div>
                          {stk.name && (
                            <span className="text-xs text-muted-foreground block truncate max-w-[200px] mt-0.5">
                              {stk.name}
                            </span>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-mono text-xs font-bold text-foreground">
                            Rs. {stk.ltp ? stk.ltp.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "0.0"}
                          </div>
                          <div
                            className={cn(
                              "text-[10px] font-mono font-semibold flex items-center justify-end gap-0.5",
                              isUp ? "text-emerald-500" : isDown ? "text-rose-500" : "text-sky-500"
                            )}
                          >
                            {isUp ? "+" : ""}{stk.change_percent?.toFixed(2)}%
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Language Switcher, Theme Toggle, Notifications, User Avatar */}
      <div className="flex items-center gap-1.5">
        {/* Language Switcher inside dashboard */}
        <LanguageSwitcher />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className={cn(
              "relative w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer",
              notifOpen && "bg-muted text-foreground"
            )}
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-border/70 bg-popover/95 shadow-xl backdrop-blur-xl p-3 z-50 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-foreground">
                    {isNepali ? "सूचनाहरू" : "Notifications"}
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>{isNepali ? "सबै पढियो" : "Mark all read"}</span>
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 divide-y divide-border/30">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    {isNepali ? "कुनै सूचना छैन" : "No notifications yet."}
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={cn(
                        "pt-2 first:pt-0 pb-1.5 px-2 rounded-lg transition-colors cursor-pointer text-left",
                        notif.read ? "opacity-75 hover:bg-muted/30" : "bg-emerald-500/5 hover:bg-emerald-500/10 border-l-2 border-emerald-500"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {notif.type === "market" ? (
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : notif.type === "alert" ? (
                            <Activity className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          ) : (
                            <Activity className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          )}
                          <span className="font-semibold text-xs text-foreground">
                            {notif.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                        {notif.description}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-border/40 text-center">
                <Link
                  href={`/${locale}/market`}
                  onClick={() => setNotifOpen(false)}
                  className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center justify-center gap-1"
                >
                  <span>{isNepali ? "प्रत्यक्ष बजार हब हेर्नुहोस्" : "View Live Market Hub"}</span>
                  <ChevronDown className="w-3 h-3 -rotate-90" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-1.5 pr-1 py-1 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer"
          >
            <Avatar size="default" className="w-7 h-7">
              <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} />
              <AvatarFallback className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-xs font-semibold text-foreground leading-tight">{userProfile.name}</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Investor</span>
            </div>
            <ChevronDown className={cn(
              "hidden sm:block w-3 h-3 text-muted-foreground transition-transform",
              dropdownOpen && "rotate-180"
            )} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border/60 bg-popover/95 shadow-xl backdrop-blur-xl py-1 z-50 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150">
              <Link
                href={`/${locale}/dashboard/profile`}
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>{isNepali ? "मेरो प्रोफाइल" : "My Profile"}</span>
              </Link>
              <Link
                href={`/${locale}/dashboard/settings`}
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{isNepali ? "सेटिङहरू" : "Settings"}</span>
              </Link>
              <div className="my-1 border-t border-border/40" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isNepali ? "बाहिरिनुहोस्" : "Sign Out"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
