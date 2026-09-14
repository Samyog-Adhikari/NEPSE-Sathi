"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Search,
  ExternalLink,
  Phone,
  MapPin,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { ALL_NEPSE_BROKERS, NepseBroker } from "@/lib/brokers-data";
import { BROKER_BRAND_MAP, getBrokerTmsUrl } from "@/lib/logos";
import { cn } from "@/lib/utils";

export default function BrokersPage() {
  const pathname = usePathname() || "";
  const locale = pathname.startsWith("/ne") ? "ne" : "en";
  const isNepali = locale === "ne";

  const [searchQuery, setSearchQuery] = React.useState("");
  const [brokers] = React.useState<NepseBroker[]>(ALL_NEPSE_BROKERS);

  const filteredBrokers = React.useMemo(() => {
    if (!searchQuery.trim()) return brokers;
    const q = searchQuery.trim().toLowerCase();
    return brokers.filter(
      (b) =>
        b.broker_no.toString().includes(q) ||
        b.name.toLowerCase().includes(q) ||
        (b.address && b.address.toLowerCase().includes(q))
    );
  }, [brokers, searchQuery]);

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto pb-16 text-xs">
      {/* ── Header Card ── */}
      <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-foreground tracking-tight flex items-center gap-2">
              <span>{isNepali ? "नेप्से ब्रोकर डाइरेक्टरी र टीएमएस" : "NEPSE Broker Directory & TMS"}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                Official NepseTMS
              </span>
            </h1>
            <p className="text-xs text-muted-foreground">
              {isNepali
                ? "नेपाल स्टक एक्सचेन्जका अनुमतिप्राप्त ब्रोकर कम्पनीहरू, आधिकारिक टीएमएस लगइन र सम्पर्क विवरणहरू"
                : "Official broker profiles, https://tms*.nepsetms.com.np/ trading portals, and contact directories"}
            </p>
          </div>
        </div>

        <Link
          href={`/${locale}/floorsheet`}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border/70 bg-background hover:bg-muted text-foreground text-xs font-semibold transition-all shadow-xs"
        >
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>{isNepali ? "फ्लोरशीट हेर्नुहोस्" : "View Live Floorsheet"}</span>
        </Link>
      </div>

      {/* ── Search Bar ── */}
      <div className="rounded-2xl border border-border/70 bg-card p-3.5 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isNepali ? "ब्रोकर नम्बर वा नाम खोज्नुहोस् (उदा: 58, Naasa)..." : "Search by Broker No. or Name (e.g. 58, Naasa)..."}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-border/70 bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          Showing {filteredBrokers.length} broker firms
        </span>
      </div>

      {/* ── Broker Directory Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredBrokers.map((b) => {
          const netFlow = (b.buy_amount || 0) - (b.sell_amount || 0);
          const isNetPositive = netFlow > 0;
          const brand = BROKER_BRAND_MAP[b.broker_no] || { bg: "#065f46", color: "#10b981" };

          return (
            <div
              key={b.broker_no}
              className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs hover:border-emerald-500/40 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-xs shrink-0"
                      style={{ backgroundColor: brand.bg }}
                    >
                      #{b.broker_no}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-foreground leading-snug">{b.name}</h3>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {b.address}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Flow metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs font-mono tabular-nums">
                  <div className="p-2 rounded-xl bg-muted/30">
                    <span className="text-[10px] text-muted-foreground block font-sans">Session Turnover</span>
                    <span className="font-bold text-foreground">
                      Rs. {((b.turnover || 0) / 1e5).toFixed(1)} Lakh
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-muted/30">
                    <span className="text-[10px] text-muted-foreground block font-sans">Net Flow</span>
                    <span
                      className={cn(
                        "font-bold",
                        isNetPositive ? "text-emerald-400" : "text-rose-400"
                      )}
                    >
                      {isNetPositive ? "+" : ""}{(netFlow / 1e5).toFixed(1)} Lakh
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                {b.tms_url && (
                  <a
                    href={b.tms_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <span>TMS Login ({b.broker_no})</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {b.phone && (
                  <a
                    href={`tel:${b.phone}`}
                    className="p-2 rounded-xl border border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                    title={b.phone}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
