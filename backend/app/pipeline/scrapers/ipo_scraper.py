import re
from datetime import datetime, timezone
from typing import Any, Dict, List
import httpx
from bs4 import BeautifulSoup
from app.core.database import db
from app.core.logging import logger

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "X-Requested-With": "XMLHttpRequest"
}

def clean_html_text(val: Any) -> str:
    if not val:
        return ""
    if "<" in str(val) and ">" in str(val):
        soup = BeautifulSoup(str(val), "html.parser")
        return soup.get_text(strip=True)
    return str(val).strip()

def clean_float(val: Any, default: float = 0.0) -> float:
    if not val:
        return default
    cleaned = re.sub(r"[^\d.-]", "", str(val))
    try:
        return float(cleaned)
    except ValueError:
        return default

async def scrape_existing_ipos() -> List[Dict[str, Any]]:
    """Scrapes open, coming-soon, and closed IPOs."""
    url = "https://www.sharesansar.com/existing-issues"
    params = {
        "draw": 1,
        "start": 0,
        "length": 50,
        "search[value]": "",
        "search[regex]": "false",
        "type": 1  # 1 = IPO
    }
    headers = dict(HEADERS)
    headers["Referer"] = url

    async with httpx.AsyncClient(timeout=20.0) as client:
        res = await client.get(url, params=params, headers=headers)
        if res.status_code not in (200, 202):
            logger.warning(f"Failed to fetch existing issues: HTTP {res.status_code}")
            return []
        data = res.json().get("data", [])

    items = []
    now_iso = datetime.now(timezone.utc).isoformat()
    for row in data:
        comp = row.get("company", {})
        comp_name = clean_html_text(comp.get("companyname"))
        symbol = clean_html_text(comp.get("symbol"))
        if not comp_name:
            continue

        raw_status = row.get("status")
        if raw_status == 0:
            status = "OPEN"
        elif raw_status in (-1, -2):
            status = "COMING_SOON"
        else:
            status = "CLOSED"

        items.append({
            "company_name": comp_name,
            "symbol": symbol or comp_name[:6].upper(),
            "share_type": row.get("displayable_share_type") or "IPO",
            "units": int(clean_float(row.get("total_units"))),
            "price_per_share": clean_float(row.get("issue_price"), 100.0),
            "open_date": row.get("opening_date") or None,
            "close_date": row.get("closing_date") or None,
            "status": status,
            "last_updated": now_iso
        })

    return items

async def scrape_upcoming_ipos() -> List[Dict[str, Any]]:
    """Scrapes upcoming pipeline IPOs awaiting SEBON approval."""
    url = "https://www.sharesansar.com/upcoming-issue"
    params = {
        "draw": 1,
        "start": 0,
        "length": 50,
        "search[value]": "",
        "search[regex]": "false",
        "type": 1
    }
    headers = dict(HEADERS)
    headers["Referer"] = url

    async with httpx.AsyncClient(timeout=20.0) as client:
        res = await client.get(url, params=params, headers=headers)
        if res.status_code not in (200, 202):
            logger.warning(f"Failed to fetch upcoming issues: HTTP {res.status_code}")
            return []
        data = res.json().get("data", [])

    items = []
    now_iso = datetime.now(timezone.utc).isoformat()
    for row in data:
        comp = row.get("company", {})
        comp_name = clean_html_text(comp.get("companyname"))
        symbol = clean_html_text(comp.get("symbol"))
        if not comp_name:
            continue

        items.append({
            "company_name": comp_name,
            "symbol": symbol or comp_name[:6].upper(),
            "share_type": row.get("displayable_share_type") or "IPO",
            "units": int(clean_float(row.get("total_units"))),
            "price_per_share": 100.0,
            "open_date": row.get("application_date") or None,
            "close_date": row.get("date_sebon") or None,
            "status": "UPCOMING",
            "last_updated": now_iso
        })

    return items

async def ingest_ipos() -> Dict[str, Any]:
    """Scrapes both existing and upcoming IPOs and replaces the Supabase ipos table."""
    logger.info("Starting IPO ingestion...")
    existing = await scrape_existing_ipos()
    upcoming = await scrape_upcoming_ipos()

    all_ipos = existing + upcoming
    if not all_ipos:
        logger.warning("No IPO data scraped.")
        return {"success": False, "count": 0}

    # Data Retention: Clear out older records so Supabase table stays completely clean with zero duplicates
    await db.delete("ipos", filters={"id": "not.is.null"})

    # Insert fresh records in batches
    batch_size = 50
    inserted = 0
    for i in range(0, len(all_ipos), batch_size):
        batch = all_ipos[i:i + batch_size]
        ok = await db.insert("ipos", batch)
        if ok:
            inserted += len(batch)

    open_count = sum(1 for x in all_ipos if x["status"] == "OPEN")
    coming_soon_count = sum(1 for x in all_ipos if x["status"] == "COMING_SOON")
    upcoming_count = sum(1 for x in all_ipos if x["status"] == "UPCOMING")

    logger.info(f"Ingested {inserted} IPO records into Supabase ({open_count} open, {coming_soon_count} coming soon, {upcoming_count} upcoming).")
    return {
        "success": True,
        "total_ingested": inserted,
        "open_count": open_count,
        "coming_soon_count": coming_soon_count,
        "upcoming_count": upcoming_count
    }
