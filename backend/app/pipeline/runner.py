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
from app.pipeline.scrapers.reports_scraper import ingest_company_reports

# ---------- Nepal Time Helpers ----------

NPT_OFFSET = timedelta(hours=5, minutes=45)
NPT_TZ = timezone(NPT_OFFSET)

def get_nepal_time() -> datetime:
    """Returns current time in Nepal Standard Time (UTC+05:45)."""
    return datetime.now(NPT_TZ)

def is_market_day(npt: datetime = None) -> bool:
    """
    Checks if the given date is a NEPSE trading day.
    NEPSE trades Sunday through Thursday. Friday and Saturday are weekend holidays.
    """
    if npt is None:
        npt = get_nepal_time()
# Nepal Public Holidays with specific names for 2026-2027
PUBLIC_HOLIDAYS: Dict[str, str] = {
    # 2026
    "2026-01-01": "English New Year",
    "2026-01-11": "Prithvi Jayanti",
    "2026-01-14": "Maghe Sankranti",
    "2026-01-23": "Sonam Lhosar",
    "2026-01-30": "Martyrs' Day",
    "2026-02-16": "Maha Shivaratri",
    "2026-02-18": "Democracy Day",
    "2026-02-27": "Gyalpo Lhosar",
    "2026-03-03": "Holi (Hilly Region)",
    "2026-03-04": "Holi (Terai Region)",
    "2026-03-08": "International Women's Day",
    "2026-03-18": "Ghode Jatra (Kathmandu Valley)",
    "2026-03-27": "Ram Navami",
    "2026-04-14": "Nepali New Year 2083",
    "2026-05-01": "International Labour Day",
    "2026-05-28": "Republic Day",
    "2026-05-31": "Buddha Jayanti / Ubhauli Parva",
    "2026-08-08": "Janai Purnima / Raksha Bandhan",
    "2026-08-16": "Gai Jatra (Kathmandu Valley)",
    "2026-08-25": "Krishna Janmashtami",
    "2026-09-04": "Gaura Parva",
    "2026-09-14": "Haritalika Teej",
    "2026-09-16": "Rishi Panchami",
    "2026-09-19": "Constitution Day (National Day)",
    "2026-09-25": "Indra Jatra",
    # Dashain 2026
    "2026-10-10": "Ghatasthapana",
    "2026-10-16": "Fulpati (Dashain)",
    "2026-10-17": "Maha Ashtami (Dashain)",
    "2026-10-18": "Maha Navami (Dashain)",
    "2026-10-19": "Vijaya Dashami (Dashain)",
    "2026-10-20": "Ekadashi (Dashain)",
    "2026-10-21": "Dwadashi (Dashain)",
    "2026-10-24": "Kojagrat Purnima",
    # Tihar 2026
    "2026-11-08": "Laxmi Puja (Tihar)",
    "2026-11-09": "Goru Puja / Govardhan Puja (Tihar)",
    "2026-11-10": "Bhai Tika (Tihar)",
    "2026-11-15": "Chhath Parva",
    "2026-12-03": "Udhauli Parva / Yomari Punhi",
    "2026-12-25": "Christmas Day",
    "2026-12-30": "Tamu Lhosar",
}

from app.services.holiday_service import holiday_service

def is_market_day(npt: datetime = None) -> bool:
    """
    Checks if the given date is a NEPSE trading day.
    NEPSE regular trading operates Monday through Friday (11:00 AM - 3:00 PM NPT).
    Saturday and Sunday are weekend holidays.
    Checks dynamic Hamro Patro calendar and holiday service.
    """
    if npt is None:
        npt = get_nepal_time()
    weekday = npt.weekday()  # 0=Monday, 1=Tuesday, 2=Wednesday, 3=Thursday, 4=Friday, 5=Saturday, 6=Sunday
    if weekday in (5, 6):  # Saturday=5, Sunday=6 are weekend holidays
        return False

    is_hol, _ = holiday_service.is_holiday(npt)
    if is_hol:
        return False

    return True

def is_market_hours(npt: datetime = None) -> bool:
    """
    Checks if NEPSE market is currently in trading hours.
    NEPSE regular trading hours are 11:00 AM to 3:00 PM NPT, Monday–Friday.
    """
    if npt is None:
        npt = get_nepal_time()
    if not is_market_day(npt):
        return False
    hour = npt.hour
    # Market open: 11:00 to 15:00 NPT
    if hour < 11 or hour >= 15:
        return False
    return True

def get_market_status_detail(live_turnover: float = None, live_transactions: int = None) -> Dict[str, Any]:
    """
    Returns comprehensive market status information:
    - is_open: bool
    - status_label: 'OPEN' | 'CLOSED' | 'PRE_OPEN' | 'POST_CLOSE'
    - reason: Detailed explanation if closed with holiday name
    - current_nepal_time: ISO string
    - next_open_at: ISO string of next market opening
    - next_open_human: Human-readable next open date/time (e.g. 'Monday at 11:00 AM NPT')
    - countdown_seconds: Seconds until next open (or until close if open)
    """
    npt = get_nepal_time()
    date_str = npt.strftime("%Y-%m-%d")
    weekday = npt.weekday()
    hour = npt.hour
    minute = npt.minute

    is_today_trading_day = is_market_day(npt)
    is_open = is_market_hours(npt)
    is_hol, holiday_name = holiday_service.is_holiday(npt)

    # Check for instant/sudden unscheduled holiday during market hours
    is_sudden, sudden_reason = holiday_service.evaluate_sudden_holiday(
        npt=npt,
        total_transactions=live_transactions if live_transactions is not None else 100,
        total_turnover=live_turnover if live_turnover is not None else 1000.0,
        is_market_hours=is_open
    )

    if is_sudden:
        is_open = False

    # Calculate next open date/time
    def find_next_open_dt(current: datetime) -> datetime:
        check = current
        # If current is before 11:00 AM on a trading day, next open is today at 11:00
        if is_market_day(check) and (check.hour < 11):
            return check.replace(hour=11, minute=0, second=0, microsecond=0)
        # Otherwise search next days
        check = check + timedelta(days=1)
        for _ in range(15):
            if is_market_day(check):
                return check.replace(hour=11, minute=0, second=0, microsecond=0)
            check = check + timedelta(days=1)
        return current.replace(hour=11, minute=0, second=0, microsecond=0) + timedelta(days=1)

    next_open_dt = find_next_open_dt(npt)
    
    if is_open:
        status_label = "OPEN"
        close_dt = npt.replace(hour=15, minute=0, second=0, microsecond=0)
        countdown_sec = max(0, int((close_dt - npt).total_seconds()))
        hours_left = countdown_sec // 3600
        mins_left = (countdown_sec % 3600) // 60
        reason = f"Market is actively trading. Regular session ends at 3:00 PM NPT (in {hours_left}h {mins_left}m)."
    else:
        countdown_sec = max(0, int((next_open_dt - npt).total_seconds()))
        if is_sudden:
            status_label = "CLOSED"
            reason = sudden_reason
        elif weekday in (5, 6):
            status_label = "CLOSED"
            day_name = "Saturday" if weekday == 5 else "Sunday"
            reason = f"Market Closed — Weekend ({day_name}). Regular NEPSE trading operates Monday–Friday and resumes Monday at 11:00 AM NPT."
        elif is_hol and holiday_name:
            status_label = "CLOSED"
            reason = f"Market Closed — Public Holiday ({holiday_name}). Regular trading resumes on the next trading day at 11:00 AM NPT."
        elif hour < 11:
            status_label = "PRE_OPEN"
            mins_to_open = (11 * 60) - (hour * 60 + minute)
            reason = f"Pre-Market — Trading session opens today at 11:00 AM NPT (in {mins_to_open // 60}h {mins_to_open % 60}m)."
        else:
            status_label = "POST_CLOSE"
            reason = "Market Closed for the day. Next regular trading session begins on the next business day at 11:00 AM NPT."

    weekday_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    next_day_name = weekday_names[next_open_dt.weekday()]
    if next_open_dt.date() == npt.date():
        next_open_human = "Today at 11:00 AM NPT"
    elif next_open_dt.date() == (npt + timedelta(days=1)).date():
        next_open_human = f"Tomorrow ({next_day_name}) at 11:00 AM NPT"
    else:
        next_open_human = f"{next_day_name}, {next_open_dt.strftime('%b %d')} at 11:00 AM NPT"

    holiday_info = PUBLIC_HOLIDAYS.get(date_str)

    return {
        "is_open": is_open,
        "status_label": status_label,
        "reason": reason,
        "holiday_name": holiday_info,
        "current_nepal_time": npt.strftime("%Y-%m-%d %H:%M:%S"),
        "next_open_at": next_open_dt.isoformat(),
        "next_open_human": next_open_human,
        "countdown_seconds": countdown_sec,
        "trading_hours": "11:00 AM - 3:00 PM NPT (Monday - Friday)",
        "trading_days": "Monday - Friday"
    }


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

    # 3. Company Financial Reports & Audit Analysis
    try:
        logger.info("IPO/News Pipeline: Ingesting Company Reports & Audit Analysis...")
        results["reports"] = await ingest_company_reports()
    except Exception as e:
        err = f"Reports scraper error: {str(e)}"
        logger.error(err, exc_info=True)
        errors.append(err)
        results["reports"] = {"success": False, "error": str(e)}

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
        logger.info("Full Pipeline 5/6: Ingesting News...")
        results["news"] = await ingest_news()
    except Exception as e:
        err = f"News scraper error: {str(e)}"
        logger.error(err, exc_info=True)
        errors.append(err)
        results["news"] = {"success": False, "error": str(e)}

    # 6. Company Past Reports & Statutory Audit Analysis (for RAG)
    try:
        logger.info("Full Pipeline 6/6: Ingesting Company Reports & Audit Analysis...")
        results["reports"] = await ingest_company_reports()
    except Exception as e:
        err = f"Reports scraper error: {str(e)}"
        logger.error(err, exc_info=True)
        errors.append(err)
        results["reports"] = {"success": False, "error": str(e)}

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
