import re
from datetime import datetime, timezone
from typing import Any, Dict, List
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

async def scrape_floorsheet(pages: int = 2) -> List[Dict[str, Any]]:
    """
    Scrapes live floorsheet transactions from Merolagani.
    """
    records = []
    logger.info(f"Scraping floorsheet records (pages: {pages})...")

    async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
        for page in range(1, pages + 1):
            url = f"https://merolagani.com/Floorsheet.aspx?page={page}"
            try:
                res = await client.get(url, headers=HEADERS)
                if res.status_code != 200:
                    continue

                soup = BeautifulSoup(res.text, "html.parser")
                table = soup.find("table", class_="table")
                if not table:
                    continue

                tbody = table.find("tbody")
                if not tbody:
                    continue

                for tr in tbody.find_all("tr"):
                    tds = [td.text.strip() for td in tr.find_all("td")]
                    # Format: ['1', '2026090705010817', 'AHL', '45', '53', '10', '360.00', '3,600.00']
                    if len(tds) < 8:
                        continue

                    contract_no = tds[1]
                    symbol = tds[2].upper()
                    buyer = clean_int(tds[3])
                    seller = clean_int(tds[4])
                    qty = clean_int(tds[5])
                    rate = clean_num(tds[6])
                    amount = clean_num(tds[7])

                    if not symbol or buyer == 0:
                        continue

                    records.append({
                        "contract_no": contract_no,
                        "symbol": symbol,
                        "buyer_broker": buyer,
                        "seller_broker": seller,
                        "quantity": qty,
                        "rate": rate,
                        "amount": amount,
                        "trade_time": datetime.now(timezone.utc).isoformat(),
                        "date": str(datetime.now().date())
                    })
            except Exception as e:
                logger.warning(f"Error scraping floorsheet page {page}: {e}")

    logger.info(f"Scraped {len(records)} floorsheet transactions.")
    return records

async def ingest_floorsheet() -> Dict[str, Any]:
    """Scrapes and upserts floorsheet records and registered brokers into Supabase."""
    records = await scrape_floorsheet(pages=2)
    if not records:
        return {"success": False, "error": "No floorsheet records found"}

    # 1. Extract unique brokers from buyer and seller numbers
    unique_broker_nos = set()
    for r in records:
        if r["buyer_broker"]:
            unique_broker_nos.add(r["buyer_broker"])
        if r["seller_broker"]:
            unique_broker_nos.add(r["seller_broker"])

    broker_rows = [
        {
            "broker_no": b_no,
            "broker_name": f"Broker {b_no}",
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
        for b_no in unique_broker_nos
    ]

    await db.upsert("brokers", broker_rows, on_conflict="broker_no")

    # 2. Data Retention: Clean out older floorsheet trades so Supabase storage stays lean and fast
    logger.info("Pruning previous floorsheet records to retain only the latest batch...")
    await db.delete("floorsheet_records", filters={"id": "not.is.null"})

    # 3. Insert latest floorsheet records
    await db.insert("floorsheet_records", records)

    logger.info(f"Ingested {len(records)} floorsheet trades and {len(broker_rows)} brokers into Supabase.")
    return {
        "success": True,
        "total_trades": len(records),
        "brokers_count": len(broker_rows)
    }
