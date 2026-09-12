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
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

interface BrokerItem {
  broker_no: number;
  name: string;
  tms_url?: string;
  phone?: string;
  address?: string;
  turnover?: number;
  buy_amount?: number;
  sell_amount?: number;
}

const BROKER_DIRECTORY: BrokerItem[] = [
  { broker_no: 58, name: "Naasa Securities Co. Ltd.", tms_url: "https://tms58.nepalstock.com.np", phone: "+977-1-4444555", address: "Naxal, Kathmandu", turnover: 45200000, buy_amount: 24500000, sell_amount: 20700000 },
  { broker_no: 45, name: "Imperial Securities Co. Pvt. Ltd.", tms_url: "https://tms45.nepalstock.com.np", phone: "+977-1-4221144", address: "Putalisadak, Kathmandu", turnover: 38400000, buy_amount: 19800000, sell_amount: 18600000 },
  { broker_no: 34, name: "Vision Securities Pvt. Ltd.", tms_url: "https://tms34.nepalstock.com.np", phone: "+977-1-4248833", address: "Anamnagar, Kathmandu", turnover: 32100000, buy_amount: 17200000, sell_amount: 14900000 },
  { broker_no: 49, name: "Online Securities Ltd.", tms_url: "https://tms49.nepalstock.com.np", phone: "+977-1-4433221", address: "Putalisadak, Kathmandu", turnover: 29500000, buy_amount: 15300000, sell_amount: 14200000 },
  { broker_no: 28, name: "Sri Hari Securities Pvt. Ltd.", tms_url: "https://tms28.nepalstock.com.np", phone: "+977-1-4255667", address: "New Road, Kathmandu", turnover: 26400000, buy_amount: 14100000, sell_amount: 12300000 },
  { broker_no: 19, name: "Nepal Investment Securities", tms_url: "https://tms19.nepalstock.com.np", phone: "+977-1-4229988", address: "Dillibazar, Kathmandu", turnover: 24800000, buy_amount: 11900000, sell_amount: 12900000 },
  { broker_no: 44, name: "Dynamic Money Managers Securities", tms_url: "https://tms44.nepalstock.com.np", phone: "+977-1-4411223", address: "Kamaladi, Kathmandu", turnover: 21900000, buy_amount: 10800000, sell_amount: 11100000 },
  { broker_no: 57, name: "Aryatara Investment & Securities", tms_url: "https://tms57.nepalstock.com.np", phone: "+977-1-4267744", address: "Anamnagar, Kathmandu", turnover: 19800000, buy_amount: 11200000, sell_amount: 8600000 },
  { broker_no: 38, name: "Dipshikha Dhitopatra Karobar", tms_url: "https://tms38.nepalstock.com.np", phone: "+977-1-4439900", address: "Hattisar, Kathmandu", turnover: 18400000, buy_amount: 9200000, sell_amount: 9200000 },
  { broker_no: 42, name: "Sani Securities Co. Ltd.", tms_url: "https://tms42.nepalstock.com.np", phone: "+977-1-4256677", address: "Sundhara, Kathmandu", turnover: 17200000, buy_amount: 8900000, sell_amount: 8300000 },
  { broker_no: 50, name: "Crystal Securities Co. Ltd.", tms_url: "https://tms50.nepalstock.com.np", phone: "+977-1-4245566", address: "Putalisadak, Kathmandu", turnover: 15600000, buy_amount: 7800000, sell_amount: 7800000 },
  { broker_no: 33, name: "Dakshinkali Securities", tms_url: "https://tms33.nepalstock.com.np", phone: "+977-1-4231122", address: "Bhotahiti, Kathmandu", turnover: 14200000, buy_amount: 6900000, sell_amount: 7300000 },
];

export default function BrokersPage() {
  const pathname = usePathname() || "";
  const locale = pathname.startsWith("/ne") ? "ne" : "en";
  const isNepali = locale === "ne";

  const [searchQuery, setSearchQuery] = React.useState("");
  const [brokers, setBrokers] = React.useState<BrokerItem[]>(BROKER_DIRECTORY);

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
    <div className="space-y-4 max-w-[1400px] mx-auto pb-12 text-xs">
      {/* ── Header Card ── */}
      <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-black text-foreground tracking-tight flex items-center gap-2">
              <span>{isNepali ? "नेप्से ब्रोकर डाइरेक्टरी र टीएमएस" : "NEPSE Broker Directory & TMS"}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                Licensed Brokers
              </span>
            </h1>
            <p className="text-[11px] text-muted-foreground">
              {isNepali
                ? "नेपाल स्टक एक्सचेन्जका अनुमतिप्राप्त ब्रोकर कम्पनीहरू, टीएमएस लगइन र सम्पर्क विवरणहरू"
                : "Official broker profiles, TMS trading portals, contact directories and session flows"}
            </p>
          </div>
        </div>

        <Link
          href={`/${locale}/floorsheet`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/70 bg-background hover:bg-muted text-foreground text-xs font-semibold transition-all shadow-xs"
        >
          <Activity className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isNepali ? "फ्लोरशीट हेर्नुहोस्" : "View Live Floorsheet"}</span>
        </Link>
      </div>

      {/* ── Search Bar ── */}
      <div className="rounded-xl border border-border/70 bg-card p-3 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isNepali ? "ब्रोकर नम्बर वा नाम खोज्नुहोस् (उदा: 58, Naasa)..." : "Search by Broker No. or Name (e.g. 58, Naasa)..."}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border/70 bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <span className="text-[11px] text-muted-foreground font-mono">
          Showing {filteredBrokers.length} broker firms
        </span>
      </div>

      {/* ── Broker Directory Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredBrokers.map((b) => {
          const netFlow = (b.buy_amount || 0) - (b.sell_amount || 0);
          const isNetPositive = netFlow > 0;

          return (
            <div
              key={b.broker_no}
              className="rounded-xl border border-border/70 bg-card p-4 shadow-xs hover:border-emerald-500/40 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-extrabold text-xs flex items-center justify-center border border-emerald-500/20">
                      #{b.broker_no}
                    </span>
                    <div>
                      <h3 className="font-bold text-xs text-foreground leading-snug">{b.name}</h3>
                      <span className="text-[10.5px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {b.address}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Flow metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-[11px] font-mono">
                  <div className="p-2 rounded-lg bg-muted/30">
                    <span className="text-[10px] text-muted-foreground block font-sans">Session Turnover</span>
                    <span className="font-bold text-foreground">
                      Rs. {((b.turnover || 0) / 1e5).toFixed(1)} Lakh
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30">
                    <span className="text-[10px] text-muted-foreground block font-sans">Net Flow</span>
                    <span
                      className={cn(
                        "font-bold",
                        isNetPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
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
                    className="flex-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] flex items-center justify-center gap-1 transition-all shadow-xs"
                  >
                    <span>TMS Login</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {b.phone && (
                  <a
                    href={`tel:${b.phone}`}
                    className="p-1.5 rounded-lg border border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
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
