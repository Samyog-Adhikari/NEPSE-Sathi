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

# Common NEPSE stock symbols to detect related stocks in headlines
COMMON_SYMBOLS = {
    "NABIL", "NICA", "SBI", "EBL", "GBIME", "KBL", "MBL", "NBL", "NMB", "PRVU",
    "SANIMA", "SBL", "SCB", "ADBL", "NLIC", "PLIC", "SHPC", "UPPER", "CHCL",
    "NIFRA", "NTC", "SHIVM", "UNL", "BFC", "HIDCL", "API", "HDL", "BENI"
}


def infer_category(title: str) -> str:
    """Infers news category from headline text."""
    t = title.lower()
    if any(w in t for w in ("ipo", "fpo", "right share", "right issue", "auction")):
        return "ipo"
    if any(w in t for w in ("dividend", "bonus", "cash dividend", "bonus share")):
        return "dividend"
    if any(w in t for w in ("agm", "annual general", "egm", "meeting")):
        return "corporate"
    if any(w in t for w in ("nepse", "index", "turnover", "market", "trading")):
        return "market"
    if any(w in t for w in ("nrb", "central bank", "monetary", "policy", "regulation")):
        return "regulatory"
    if any(w in t for w in ("merger", "acquisition", "merge")):
        return "merger"
    if any(w in t for w in ("quarterly", "profit", "loss", "earnings", "financial result")):
        return "earnings"
    return "general"


def extract_related_symbols(title: str) -> List[str]:
    """Extracts stock symbols mentioned in the headline."""
    words = re.findall(r'\b[A-Z]{2,10}\b', title)
    return [w for w in words if w in COMMON_SYMBOLS]


def parse_date(date_text: str):
    """Tries to parse various date formats from Sharesansar."""
    if not date_text:
        return None
    # Try common formats
    for fmt in ["%A, %B %d, %Y", "%B %d, %Y", "%Y-%m-%d", "%d %B %Y"]:
        try:
            return datetime.strptime(date_text.strip(), fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None


async def scrape_sharesansar_news() -> List[Dict[str, Any]]:
    """Scrapes latest news from Sharesansar."""
    url = "https://www.sharesansar.com/category/latest"
    logger.info(f"Scraping news from {url}...")

    async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
        res = await client.get(url, headers=HEADERS)
        if res.status_code != 200:
            logger.warning(f"Failed to fetch news: HTTP {res.status_code}")
            return []

    soup = BeautifulSoup(res.text, "html.parser")
    articles = soup.find_all("div", class_="featured-news-list")

    items = []
    now_iso = datetime.now(timezone.utc).isoformat()

    for art in articles:
        # Extract link and title
        link_tag = art.find("a")
        if not link_tag:
            continue

        href = link_tag.get("href", "")
        if not href:
            continue

        # Make absolute URL
        if href.startswith("/"):
            href = f"https://www.sharesansar.com{href}"

        # Get title from the link text or heading inside
        heading = art.find(["h4", "h3", "h2", "h5"])
        title = ""
        if heading:
            title = heading.get_text(strip=True)
        if not title:
            title = link_tag.get_text(strip=True)
        if not title:
            # Try extracting from URL slug
            slug = href.split("/")[-1] if "/" in href else ""
            title = slug.replace("-", " ").title()[:100]

        if not title or len(title) < 5:
            continue

        # Get date
        date_tag = art.find("span", class_="text-muted")
        if not date_tag:
            date_tag = art.find("span")
        date_text = date_tag.get_text(strip=True) if date_tag else ""
        published_date = parse_date(date_text)

        # Get summary/description if available
        desc_tag = art.find("p")
        summary = desc_tag.get_text(strip=True)[:300] if desc_tag else None

        category = infer_category(title)
        related = extract_related_symbols(title)

        items.append({
            "title": title[:500],
            "source": "sharesansar",
            "source_url": href,
            "category": category,
            "related_symbols": related if related else None,
            "published_date": published_date,
            "published_text": date_text[:100] if date_text else None,
            "summary": summary,
            "importance": "high" if category in ("ipo", "regulatory", "dividend") else "normal",
            "scraped_at": now_iso
        })

    logger.info(f"Scraped {len(items)} news articles from Sharesansar.")
    return items


async def ingest_news() -> Dict[str, Any]:
    """Scrapes and stores news articles. Clears old news and inserts fresh batch."""
    logger.info("Starting News ingestion...")
    articles = await scrape_sharesansar_news()

    if not articles:
        logger.warning("No news articles scraped.")
        return {"success": False, "count": 0}

    # Data Retention: Clear older news to keep DB lean
    await db.delete("news_items", filters={"id": "not.is.null"})

    # Insert fresh articles
    ok = await db.insert("news_items", articles)
    count = len(articles) if ok else 0

    categories = {}
    for a in articles:
        cat = a["category"]
        categories[cat] = categories.get(cat, 0) + 1

    logger.info(f"Ingested {count} news articles. Categories: {categories}")
    return {
        "success": ok,
        "total_ingested": count,
        "categories": categories
    }
