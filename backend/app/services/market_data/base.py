from abc import ABC, abstractmethod
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class DataStatus(str, Enum):
    live = "live"
    delayed = "delayed"
    eod = "eod"

class Timeframe(str, Enum):
    d1 = "1D"
    w1 = "1W"
    m1 = "1M"
    m3 = "3M"
    y1 = "1Y"
    all = "ALL"

class MarketSnapshot(BaseModel):
    index_value: float
    point_change: float = 0.0
    percent_change: float = 0.0
    turnover: float
    total_shares: int = 0
    total_transactions: int = 0
    breadth_advancing: int = 0
    breadth_declining: int = 0
    breadth_unchanged: int = 0
    data_status: DataStatus
    last_updated: datetime

class StockPricePoint(BaseModel):
    symbol: str
    name: Optional[str] = None
    ltp: float
    point_change: float = 0.0
    change_percent: float = 0.0
    open_price: Optional[float] = None
    high_price: Optional[float] = None
    low_price: Optional[float] = None
    volume: int = 0
    turnover: float = 0.0
    data_status: DataStatus
    last_updated: datetime

class SectorPerformance(BaseModel):
    sector_name: str
    index_value: float
    point_change: float
    percent_change: float
    data_status: DataStatus

class TopMovers(BaseModel):
    gainers: List[StockPricePoint]
    losers: List[StockPricePoint]
    active: List[StockPricePoint]
    by_volume: List[StockPricePoint] = []
    by_turnover: List[StockPricePoint] = []

class MarketDataProvider(ABC):
    """
    Abstract interface for NEPSE market data.
    Implemented by ScraperMarketDataProvider today, and by NepseApiMarketDataProvider
    once official API access exists. Modules depend on this interface only.
    """

    @abstractmethod
    async def get_market_snapshot(self) -> MarketSnapshot:
        ...

    @abstractmethod
    async def get_sector_performance(self) -> List[SectorPerformance]:
        ...

    @abstractmethod
    async def get_top_movers(self) -> TopMovers:
        ...

    @abstractmethod
    async def get_stock_price(self, symbol: str) -> Optional[StockPricePoint]:
        ...

    @abstractmethod
    async def get_all_stocks(self) -> List[StockPricePoint]:
        ...

    @abstractmethod
    async def get_stock_history(self, symbol: str, timeframe: Timeframe) -> List[Dict[str, Any]]:
        ...

    @abstractmethod
    def source_name(self) -> str:
        """'scraper' or 'nepse_official_api'"""
        ...
