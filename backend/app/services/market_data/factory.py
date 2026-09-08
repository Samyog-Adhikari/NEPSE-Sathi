from functools import lru_cache
from app.core.config import settings
from .base import MarketDataProvider
from .scraper_provider import ScraperMarketDataProvider
from .nepse_api_provider import NepseApiMarketDataProvider

@lru_cache
def get_market_data_provider() -> MarketDataProvider:
    """
    Dependency injector for MarketDataProvider per Blueprint §13.1.
    Switches between ScraperMarketDataProvider and NepseApiMarketDataProvider via config.
    """
    if getattr(settings, "market_data_provider", "scraper") == "nepse_api":
        return NepseApiMarketDataProvider()
    return ScraperMarketDataProvider()
