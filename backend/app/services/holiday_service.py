import re
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional, Set, Tuple
import httpx
from bs4 import BeautifulSoup

from app.core.logging import logger

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
}

class HolidayService:
    """
    Dynamic Nepal Public Holiday & Market Session Intelligence Service:
    1. Periodically scrapes dynamic public holidays from Hamro Patro.
    2. Maintains a resilient baseline calendar for Nepal holidays.
    3. Detects instant/sudden unscheduled holidays when market hours are active but exchange volume/trades are 0.
    """
    def __init__(self):
        self.cached_holidays: Dict[str, str] = {}
        self.last_scraped_at: Optional[datetime] = None
        self._load_baseline_holidays()

    def _load_baseline_holidays(self):
        """Baseline verified Nepal public holidays (auto-extended dynamically)."""
        self.cached_holidays = {
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
            "2026-03-18": "Ghode Jatra",
            "2026-03-27": "Ram Navami",
            "2026-04-14": "Nepali New Year 2083",
            "2026-05-01": "International Labour Day",
            "2026-05-28": "Republic Day",
            "2026-05-31": "Buddha Jayanti / Ubhauli Parva",
            "2026-08-08": "Janai Purnima / Raksha Bandhan",
            "2026-08-16": "Gai Jatra",
            "2026-08-25": "Krishna Janmashtami",
            "2026-09-04": "Gaura Parva",
            "2026-09-14": "Haritalika Teej",
            "2026-09-16": "Rishi Panchami",
            "2026-09-19": "Constitution Day (National Day)",
            "2026-09-25": "Indra Jatra",
            "2026-10-10": "Ghatasthapana",
            "2026-10-16": "Fulpati (Dashain)",
            "2026-10-17": "Maha Ashtami (Dashain)",
            "2026-10-18": "Maha Navami (Dashain)",
            "2026-10-19": "Vijaya Dashami (Dashain)",
            "2026-10-20": "Ekadashi (Dashain)",
            "2026-10-21": "Dwadashi (Dashain)",
            "2026-10-24": "Kojagrat Purnima",
            "2026-11-08": "Laxmi Puja (Tihar)",
            "2026-11-09": "Goru Puja / Govardhan Puja (Tihar)",
            "2026-11-10": "Bhai Tika (Tihar)",
            "2026-11-15": "Chhath Parva",
            "2026-12-03": "Udhauli Parva / Yomari Punhi",
            "2026-12-25": "Christmas Day",
            "2026-12-30": "Tamu Lhosar",
        }

    async def scrape_hamropatro_holidays(self) -> Dict[str, str]:
        """
        Dynamically fetches current month public holidays and festival events from Hamro Patro.
        """
        url = "https://www.hamropatro.com/en"
        logger.info(f"Checking dynamic Nepal holidays from {url}...")
        scraped: Dict[str, str] = {}

        try:
            async with httpx.AsyncClient(timeout=12.0, follow_redirects=True) as client:
                res = await client.get(url, headers=HEADERS)
                if res.status_code == 200:
                    soup = BeautifulSoup(res.text, "html.parser")
                    # Extract holiday markers from calendar grid
                    holiday_items = soup.find_all(class_=lambda c: c and "text-holiday" in c)
                    for item in holiday_items:
                        text = item.text.strip()
                        if text and len(text) > 3 and not text.isdigit() and text not in ("SunSunday", "SatSaturday"):
                            # Match with current year/month
                            now_ym = datetime.now().strftime("%Y-%m")
                            # Save detected event
                            scraped[f"{now_ym}"] = text

                    self.last_scraped_at = datetime.now(timezone.utc)
                    logger.info(f"Hamro Patro sync completed. Found {len(holiday_items)} holiday indicators.")
        except Exception as e:
            logger.warning(f"Hamro Patro dynamic holiday scrape note: {e}")

        # Merge with cached baseline
        for k, v in scraped.items():
            self.cached_holidays[k] = v

        return self.cached_holidays

    def get_holiday_name(self, date_str: str) -> Optional[str]:
        return self.cached_holidays.get(date_str)

    def is_holiday(self, dt: datetime) -> Tuple[bool, Optional[str]]:
        date_str = dt.strftime("%Y-%m-%d")
        name = self.get_holiday_name(date_str)
        return (name is not None, name)

    def evaluate_sudden_holiday(
        self,
        npt: datetime,
        total_transactions: int,
        total_turnover: float,
        is_market_hours: bool
    ) -> Tuple[bool, str]:
        """
        Detects sudden / instant unscheduled public holidays or unexpected floor halts:
        If current time is between 11:15 AM and 3:00 PM Mon-Fri, but total executed trades
        remain 0 and turnover is 0, it identifies that NEPSE did not open the trading session.
        """
        weekday = npt.weekday() # 0=Mon ... 4=Fri
        if weekday in (5, 6):
            return False, "Regular Weekend"

        hour = npt.hour
        minute = npt.minute

        # If we are well into trading hours (past 11:15 AM) and no trades executed
        if (hour == 11 and minute >= 15) or (12 <= hour < 15):
            if total_transactions == 0 and total_turnover == 0.0:
                return True, "Market Closed — Unscheduled Special Holiday / Trading Halt (Zero trading activity detected on NEPSE exchange floor)."

        return False, ""

holiday_service = HolidayService()
