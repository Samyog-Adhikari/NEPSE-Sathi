import asyncio
import time
from datetime import datetime, timezone, timedelta
from typing import Any, Dict
import httpx
from app.core.config import settings
from app.core.logging import logger
from app.pipeline.scrapers.stocks_scraper import ingest_stocks
from app.pipeline.scrapers.market_scraper import ingest_market_summary
from app.pipeline.scrapers.floorsheet_scraper import ingest_floorsheet
from app.pipeline.scrapers.ipo_scraper import ingest_ipos
from app.pipeline.scrapers.news_scraper import ingest_news

# ---------- Nepal Time Helpers ----------

NPT_OFFSET = timedelta(hours=5, minutes=45)
NPT_TZ = timezone(NPT_OFFSET)

def get_nepal_time() -> datetime:
    """Returns current time in Nepal Standard Time (UTC+05:45)."""
    return datetime.now(NPT_TZ)

def is_market_day(npt: datetime = None) -> bool:
    """
    Checks if the given date is a NEPSE trading day.
    NEPSE trades Monday–Friday. Public holidays are checked separately.
    """
    if npt is None:
        npt = get_nepal_time()
    weekday = npt.weekday()  # 0=Monday, 6=Sunday
    if weekday >= 5:  # Saturday=5, Sunday=6
        return False

    # Known Nepal public holidays for 2083 BS / 2026-2027 AD
    # These should be updated annually
    public_holidays = {
        # Dashain 2083
        "2026-10-10", "2026-10-11", "2026-10-12", "2026-10-13",
        "2026-10-14", "2026-10-15", "2026-10-16", "2026-10-17",
        # Tihar 2083
        "2026-10-28", "2026-10-29", "2026-10-30", "2026-10-31", "2026-11-01",
        # Chhath
        "2026-11-04",
        # Constitution Day
        "2026-09-19",
        # Teej
        "2026-09-15",
        # Janai Purnima
        "2026-08-22",
        # Buddha Jayanti
        "2027-05-13",
        # Republic Day
        "2027-05-28",
        # Maha Shivaratri
        "2027-02-26",
        # Holi
        "2027-03-14",
        # Nepali New Year 2084
        "2027-04-14",
        # Bisket Jatra
        "2027-04-14", "2027-04-15",
    }

    date_str = npt.strftime("%Y-%m-%d")
    if date_str in public_holidays:
        return False

    return True

def is_market_hours(npt: datetime = None) -> bool:
    """
    Checks if NEPSE market is currently in trading hours.
    NEPSE trades 11:00 AM to 3:00 PM NPT, Monday–Friday.
    """
    if npt is None:
        npt = get_nepal_time()
    if not is_market_day(npt):
        return False
    hour = npt.hour
    minute = npt.minute
    # Market open: 11:00 to 15:00 NPT
    if hour < 11 or hour >= 15:
        return False
    return True


# ---------- Telegram Alerts ----------

async def send_telegram_alert(message: str):
    """Sends a critical alert to the Telegram admin chat if scraping fails."""
    if not settings.telegram_bot_token or not settings.telegram_chat_id:
        return
    url = f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage"
    payload = {
        "chat_id": settings.telegram_chat_id,
        "text": f"🚨 [NEPSE Sathi Scraper Alert]\n\n{message}",
        "parse_mode": "Markdown"
    }
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            await client.post(url, json=payload)
    except Exception as e:
        logger.error(f"Failed to send Telegram alert: {e}")


# ---------- Pipeline Runners ----------

async def run_market_pipeline() -> Dict[str, Any]:
    """
    Runs the LIVE MARKET pipeline (stocks, indices, floorsheet).
    Only runs during market hours on trading days.
    For prototype: designed to run every 5–7 minutes during market hours.
    """
    npt = get_nepal_time()
    if not is_market_hours(npt):
        msg = f"Market is closed (NPT: {npt.strftime('%Y-%m-%d %H:%M')}). Skipping live market scrape."
        logger.info(msg)
        return {"success": True, "skipped": True, "reason": msg}

    start_time = time.perf_counter()
    logger.info(f"Starting Live Market Pipeline (NPT: {npt.strftime('%H:%M')})...")
    results = {}
    errors = []

    # 1. Stocks & price data
    try:
        logger.info("Pipeline Step 1/3: Ingesting Stocks...")
        results["stocks"] = await ingest_stocks()
    except Exception as e:
        err = f"Stocks scraper error: {str(e)}"
        logger.error(err, exc_info=True)
        errors.append(err)
        results["stocks"] = {"success": False, "error": str(e)}

    # 2. Market Summary & Indices
    try:
        logger.info("Pipeline Step 2/3: Ingesting Market Summary & Indices...")
        results["market"] = await ingest_market_summary()
    except Exception as e:
        err = f"Market summary error: {str(e)}"
        logger.error(err, exc_info=True)
        errors.append(err)
        results["market"] = {"success": False, "error": str(e)}

    # 3. Floorsheet & Brokers
    try:
        logger.info("Pipeline Step 3/3: Ingesting Floorsheet & Brokers...")
        results["floorsheet"] = await ingest_floorsheet()
    except Exception as e:
        err = f"Floorsheet scraper error: {str(e)}"
        logger.error(err, exc_info=True)
        errors.append(err)
        results["floorsheet"] = {"success": False, "error": str(e)}

    duration_s = round(time.perf_counter() - start_time, 2)
    has_errors = len(errors) > 0

    if has_errors:
        alert_msg = f"*Market Pipeline errors in {duration_s}s:*\n" + "\n".join(f"• {e}" for e in errors)
        await send_telegram_alert(alert_msg)

    logger.info(f"Market Pipeline finished in {duration_s}s with {len(errors)} errors.")
    return {
        "success": not has_errors,
        "pipeline": "market",
        "duration_seconds": duration_s,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "nepal_time": npt.strftime("%Y-%m-%d %H:%M:%S"),
        "errors": errors,
        "results": results
    }


async def run_ipo_news_pipeline() -> Dict[str, Any]:
    """
    Runs the IPO & News pipeline.
    Runs every 6 hours (including weekends and holidays) since
    companies publish IPO announcements, dividends, and rights any time.
    """
    start_time = time.perf_counter()
    npt = get_nepal_time()
    logger.info(f"Starting IPO & News Pipeline (NPT: {npt.strftime('%H:%M')})...")
    results = {}
    errors = []

    # 1. IPO Center
    try:
        logger.info("IPO Pipeline: Ingesting IPOs...")
        results["ipos"] = await ingest_ipos()
    except Exception as e:
        err = f"IPO scraper error: {str(e)}"
        logger.error(err, exc_info=True)
        errors.append(err)
        results["ipos"] = {"success": False, "error": str(e)}

    # 2. News & Announcements
    try:
        logger.info("IPO/News Pipeline: Ingesting News...")
        results["news"] = await ingest_news()
    except Exception as e:
        err = f"News scraper error: {str(e)}"
        logger.error(err, exc_info=True)
        errors.append(err)
        results["news"] = {"success": False, "error": str(e)}

    duration_s = round(time.perf_counter() - start_time, 2)
    has_errors = len(errors) > 0

    if has_errors:
        alert_msg = f"*IPO/News Pipeline errors in {duration_s}s:*\n" + "\n".join(f"• {e}" for e in errors)
        await send_telegram_alert(alert_msg)

    logger.info(f"IPO/News Pipeline finished in {duration_s}s with {len(errors)} errors.")
    return {
        "success": not has_errors,
        "pipeline": "ipo_news",
        "duration_seconds": duration_s,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "nepal_time": npt.strftime("%Y-%m-%d %H:%M:%S"),
        "errors": errors,
        "results": results
    }


async def run_full_pipeline() -> Dict[str, Any]:
    """
    Runs ALL pipelines together (market + IPO/news).
    Used for manual admin triggers and initial data seeding.
    Ignores market hour checks — forces a complete scrape.
    """
    start_time = time.perf_counter()
    npt = get_nepal_time()
    logger.info(f"Starting Full Pipeline (forced, NPT: {npt.strftime('%H:%M')})...")
    results = {}
    errors = []

    # 1. Stocks
    try:
        logger.info("Full Pipeline 1/5: Ingesting Stocks...")
        results["stocks"] = await ingest_stocks()
    except Exception as e:
        err = f"Stocks scraper error: {str(e)}"
        logger.error(err, exc_info=True)
        errors.append(err)
        results["stocks"] = {"success": False, "error": str(e)}

    # 2. Market Summary & Indices
    try:
        logger.info("Full Pipeline 2/5: Ingesting Market Summary & Indices...")
        results["market"] = await ingest_market_summary()
    except Exception as e:
        err = f"Market summary error: {str(e)}"
        logger.error(err, exc_info=True)
        errors.append(err)
        results["market"] = {"success": False, "error": str(e)}

    # 3. Floorsheet & Brokers
    try:
        logger.info("Full Pipeline 3/5: Ingesting Floorsheet & Brokers...")
        results["floorsheet"] = await ingest_floorsheet()
    except Exception as e:
        err = f"Floorsheet scraper error: {str(e)}"
        logger.error(err, exc_info=True)
        errors.append(err)
        results["floorsheet"] = {"success": False, "error": str(e)}

    # 4. IPOs
    try:
        logger.info("Full Pipeline 4/5: Ingesting IPOs...")
        results["ipos"] = await ingest_ipos()
    except Exception as e:
        err = f"IPO scraper error: {str(e)}"
        logger.error(err, exc_info=True)
        errors.append(err)
        results["ipos"] = {"success": False, "error": str(e)}

    # 5. News & Announcements
    try:
        logger.info("Full Pipeline 5/5: Ingesting News...")
        results["news"] = await ingest_news()
    except Exception as e:
        err = f"News scraper error: {str(e)}"
        logger.error(err, exc_info=True)
        errors.append(err)
        results["news"] = {"success": False, "error": str(e)}

    duration_s = round(time.perf_counter() - start_time, 2)
    has_errors = len(errors) > 0

    if has_errors:
        alert_msg = f"*Full Pipeline errors in {duration_s}s:*\n" + "\n".join(f"• {e}" for e in errors)
        await send_telegram_alert(alert_msg)

    logger.info(f"Full Pipeline finished in {duration_s}s with {len(errors)} errors.")
    return {
        "success": not has_errors,
        "pipeline": "full",
        "duration_seconds": duration_s,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "nepal_time": npt.strftime("%Y-%m-%d %H:%M:%S"),
        "market_open": is_market_hours(npt),
        "trading_day": is_market_day(npt),
        "errors": errors,
        "results": results
    }


if __name__ == "__main__":
    asyncio.run(run_full_pipeline())
