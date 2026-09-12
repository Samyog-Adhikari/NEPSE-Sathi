import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Tuple
import httpx
from bs4 import BeautifulSoup
from app.core.database import db
from app.core.logging import logger

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
}

def clean_num(val: str, default: float = 0.0) -> float:
    if not val or val.strip() in ("-", "N/A", ""):
        return default
    cleaned = re.sub(r"[^\d.-]", "", val)
    try:
        return float(cleaned)
    except ValueError:
        return default

def clean_int(val: str, default: int = 0) -> int:
    return int(clean_num(val, float(default)))

async def scrape_latest_stocks() -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Scrapes all live stocks from Merolagani LatestMarket.
    Returns: (stocks_list, market_aggregate)
    """
    url = "https://merolagani.com/LatestMarket.aspx"
    logger.info(f"Scraping live stocks from {url}...")

    async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
        res = await client.get(url, headers=HEADERS)
        if res.status_code != 200:
            raise RuntimeError(f"Failed to fetch {url}: HTTP {res.status_code}")

    soup = BeautifulSoup(res.text, "html.parser")
    table = soup.find("table", class_="table")
    if not table:
        raise RuntimeError("No stocks table found on LatestMarket page")

    tbody = table.find("tbody")
    if not tbody:
        raise RuntimeError("No tbody found in stocks table")

    stocks = []
    total_volume = 0
    total_turnover = 0.0

    # Sector determination map for common NEPSE symbols
    def infer_sector(sym: str) -> str:
        s = sym.upper()
        if any(k in s for k in ("BOK", "EBL", "GBIME", "KBL", "LBL", "MBL", "NABIL", "NBL", "NICA", "NMB", "PRVU", "SANIMA", "SBI", "SBL", "SCB")):
            return "Commercial Banks"
        if "MF" in s or "BSL" in s or "LB" in s or "DDBL" in s or "SKBBL" in s or "CBBL" in s:
            return "Microfinance"
        if any(k in s for k in ("HPC", "HP", "HEP", "HYDEL", "CHCL", "SHPC", "RHPC", "AKPL", "UPPER", "HDHPC", "KPCL")):
            return "Hydropower"
        if "LICN" in s or "NLIC" in s or "PLI" in s or "RNLI" in s or "CLI" in s or "ILI" in s:
            return "Life Insurance"
        if "NICL" in s or "NIL" in s or "PRIN" in s or "SICL" in s or "IGI" in s or "SALICO" in s:
            return "Non Life Insurance"
        if "HATH" in s or "CIT" in s or "NIFRA" in s or "HIDCL" in s or "NRN" in s:
            return "Investment"
        if "HOTEL" in s or "SHL" in s or "OHL" in s or "TRH" in s:
            return "Hotels And Tourism"
        if "UNL" in s or "BNT" in s or "HDL" in s or "SHIVM" in s or "GCIL" in s or "SARBTM" in s:
            return "Manufacturing And Processing"
        return "Others"

    for tr in tbody.find_all("tr"):
        tds = [td.text.strip() for td in tr.find_all("td")]
        if len(tds) < 8:
            continue

        symbol = tds[0].strip().upper()
        if not symbol:
            continue

        ltp = clean_num(tds[1])
        pct_change = clean_num(tds[2])
        open_price = clean_num(tds[3])
        high_price = clean_num(tds[4])
        low_price = clean_num(tds[5])
        volume = clean_int(tds[6])
        pclose = clean_num(tds[7])
        diff = clean_num(tds[8]) if len(tds) > 8 and tds[8].strip() else 0.0

        if (diff == 0.0 or abs(diff) < 0.001) and pct_change != 0.0 and ltp > 0:
            pclose = round(ltp / (1.0 + (pct_change / 100.0)), 2)
            diff = round(ltp - pclose, 2)
        elif pclose == 0.0 and ltp > 0:
            pclose = round(ltp - diff, 2)

        turnover = round(ltp * volume, 2)
        total_volume += volume
        total_turnover += turnover

        company_name = symbol
        a_tag = tr.find("a")
        if a_tag and a_tag.get("title"):
            company_name = a_tag.get("title").strip()

        stocks.append({
            "symbol": symbol,
            "company_name": company_name,
            "sector": infer_sector(symbol),
            "current_price": ltp,
            "point_change": diff,
            "percentage_change": pct_change,
            "open_price": open_price,
            "high_price": high_price,
            "low_price": low_price,
            "previous_close": pclose,
            "volume": volume,
            "turnover": turnover,
            "is_active": True,
            "last_updated": datetime.now(timezone.utc).isoformat()
        })

    aggregate = {
        "total_stocks": len(stocks),
        "total_volume": total_volume,
        "total_turnover": total_turnover
    }

    logger.info(f"Successfully scraped {len(stocks)} stocks. Total volume: {total_volume}, turnover: NPR {total_turnover:,.2f}")
    return stocks, aggregate

async def ingest_stocks() -> Dict[str, Any]:
    """Scrapes and upserts all stocks into Supabase."""
    stocks, agg = await scrape_latest_stocks()
    if not stocks:
        return {"success": False, "error": "No stocks found to ingest"}

    # 1. Save raw payload
    raw_record = {
        "scrape_type": "stocks",
        "source": "merolagani",
        "raw_payload": {
            "count": len(stocks),
            "aggregate": agg,
            "sample": stocks[:5]
        }
    }
    await db.insert("raw_market_scrapes", raw_record)

    # 2. Upsert in batches of 50 to Supabase
    batch_size = 50
    inserted = 0
    for i in range(0, len(stocks), batch_size):
        batch = stocks[i:i + batch_size]
        ok = await db.upsert("stocks", batch, on_conflict="symbol")
        if ok:
            inserted += len(batch)

    # 3. Calculate market breadth & sync aggregates to latest market_summary
    advances = sum(1 for s in stocks if s.get("percentage_change", 0.0) > 0)
    declines = sum(1 for s in stocks if s.get("percentage_change", 0.0) < 0)
    unchanged = sum(1 for s in stocks if s.get("percentage_change", 0.0) == 0)

    try:
        latest_summary = await db.select("market_summary", order="date.desc", limit=1)
        if latest_summary:
            summary_id = latest_summary[0]["id"]
            await db.update(
                "market_summary",
                {
                    "total_turnover": agg["total_turnover"],
                    "total_shares": agg["total_volume"],
                    "advances": advances,
                    "declines": declines,
                    "unchanged": unchanged,
                    "last_updated": datetime.now(timezone.utc).isoformat()
                },
                filters={"id": f"eq.{summary_id}"}
            )
    except Exception as e:
        logger.warning(f"Could not update market_summary aggregates: {e}")

    logger.info(f"Ingested {inserted}/{len(stocks)} stocks into Supabase. Advances: {advances}, Declines: {declines}, Unchanged: {unchanged}")
    return {
        "success": True,
        "total_scraped": len(stocks),
        "total_upserted": inserted,
        "aggregate": agg,
        "breadth": {
            "advances": advances,
            "declines": declines,
            "unchanged": unchanged
        }
    }

