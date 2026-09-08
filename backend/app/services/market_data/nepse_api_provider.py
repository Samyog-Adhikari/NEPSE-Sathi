from typing import Any, Dict, List, Optional
from .base import (
    DataStatus,
    MarketDataProvider,
    MarketSnapshot,
    SectorPerformance,
    StockPricePoint,
    Timeframe,
    TopMovers
)

class NepseApiMarketDataProvider(MarketDataProvider):
    """
    Placeholder for official NEPSE API integration per Blueprint §13.1.
    Activated by setting MARKET_DATA_PROVIDER=nepse_api in .env when official API key is provided.
    """

    def source_name(self) -> str:
        return "nepse_official_api"

    async def get_market_snapshot(self) -> MarketSnapshot:
        raise NotImplementedError("Official NEPSE API access not yet configured.")

    async def get_sector_performance(self) -> List[SectorPerformance]:
        raise NotImplementedError("Official NEPSE API access not yet configured.")

    async def get_top_movers(self) -> TopMovers:
        raise NotImplementedError("Official NEPSE API access not yet configured.")

    async def get_stock_price(self, symbol: str) -> Optional[StockPricePoint]:
        raise NotImplementedError("Official NEPSE API access not yet configured.")

    async def get_all_stocks(self) -> List[StockPricePoint]:
        raise NotImplementedError("Official NEPSE API access not yet configured.")

    async def get_stock_history(self, symbol: str, timeframe: Timeframe) -> List[Dict[str, Any]]:
        raise NotImplementedError("Official NEPSE API access not yet configured.")
