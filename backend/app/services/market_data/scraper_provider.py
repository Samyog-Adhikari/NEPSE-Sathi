from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from app.core.database import db
from app.core.logging import logger
from app.pipeline.runner import is_market_hours
from .base import (
    DataStatus,
    MarketDataProvider,
    MarketSnapshot,
    SectorPerformance,
    StockPricePoint,
    Timeframe,
    TopMovers
)

class ScraperMarketDataProvider(MarketDataProvider):
    """
    Concrete implementation of MarketDataProvider backed by Supabase tables
    populated by the autonomous ingestion scrapers.
    """

    def source_name(self) -> str:
        return "scraper"

    def _determine_status(self) -> DataStatus:
        return DataStatus.live if is_market_hours() else DataStatus.eod

    async def get_market_snapshot(self) -> MarketSnapshot:
        status = self._determine_status()
        summary = await db.select("market_summary", order="date.desc", limit=1)

        if not summary:
            return MarketSnapshot(
                index_value=2560.84,
                point_change=0.0,
                percent_change=0.0,
                turnover=0.0,
                data_status=status,
                last_updated=datetime.now(timezone.utc)
            )

        row = summary[0]
        last_updated = datetime.now(timezone.utc)
        if row.get("last_updated"):
            try:
                last_updated = datetime.fromisoformat(row["last_updated"].replace("Z", "+00:00"))
            except Exception:
                pass

        return MarketSnapshot(
            index_value=float(row.get("nepse_index", 2560.84)),
            point_change=float(row.get("point_change", 0.0)),
            percent_change=float(row.get("percentage_change", 0.0)),
            turnover=float(row.get("total_turnover", 0.0)),
            total_shares=int(row.get("total_shares", 0)),
            total_transactions=int(row.get("total_transactions", 0)),
            breadth_advancing=int(row.get("advances", 0)),
            breadth_declining=int(row.get("declines", 0)),
            breadth_unchanged=int(row.get("unchanged", 0)),
            data_status=status,
            last_updated=last_updated
        )

    async def get_sector_performance(self) -> List[SectorPerformance]:
        status = self._determine_status()
        indices = await db.select("market_indices", order="index_name.asc", limit=30)
        sectors = []
        for idx in indices:
            name = idx.get("index_name", "")
            if "Index" in name and name != "NEPSE Index":
                sectors.append(
                    SectorPerformance(
                        sector_name=name.replace(" Index", ""),
                        index_value=float(idx.get("current_value", 0.0)),
                        point_change=float(idx.get("point_change", 0.0)),
                        percent_change=float(idx.get("percentage_change", 0.0)),
                        data_status=status
                    )
                )
        return sectors

    async def get_top_movers(self) -> TopMovers:
        status = self._determine_status()
        gainers_raw = await db.select("stocks", order="percentage_change.desc", limit=5)
        losers_raw = await db.select("stocks", order="percentage_change.asc", limit=5)
        active_raw = await db.select("stocks", order="turnover.desc", limit=5)

        def to_point(r: Dict[str, Any]) -> StockPricePoint:
            return StockPricePoint(
                symbol=r.get("symbol", ""),
                name=r.get("company_name"),
                ltp=float(r.get("current_price", 0.0)),
                point_change=float(r.get("point_change", 0.0)),
                change_percent=float(r.get("percentage_change", 0.0)),
                volume=int(r.get("volume", 0)),
                turnover=float(r.get("turnover", 0.0)),
                data_status=status,
                last_updated=datetime.now(timezone.utc)
            )

        return TopMovers(
            gainers=[to_point(r) for r in gainers_raw],
            losers=[to_point(r) for r in losers_raw],
            active=[to_point(r) for r in active_raw]
        )

    async def get_stock_price(self, symbol: str) -> Optional[StockPricePoint]:
        status = self._determine_status()
        res = await db.select("stocks", filters={"symbol": f"eq.{symbol.upper()}"}, single=True)
        if not res:
            return None

        return StockPricePoint(
            symbol=res["symbol"],
            name=res.get("company_name"),
            ltp=float(res.get("current_price", 0.0)),
            point_change=float(res.get("point_change", 0.0)),
            change_percent=float(res.get("percentage_change", 0.0)),
            open_price=float(res.get("open_price")) if res.get("open_price") is not None else None,
            high_price=float(res.get("high_price")) if res.get("high_price") is not None else None,
            low_price=float(res.get("low_price")) if res.get("low_price") is not None else None,
            volume=int(res.get("volume", 0)),
            turnover=float(res.get("turnover", 0.0)),
            data_status=status,
            last_updated=datetime.now(timezone.utc)
        )

    async def get_all_stocks(self) -> List[StockPricePoint]:
        status = self._determine_status()
        stocks = await db.select("stocks", order="symbol.asc", limit=500)
        return [
            StockPricePoint(
                symbol=s["symbol"],
                name=s.get("company_name"),
                ltp=float(s.get("current_price", 0.0)),
                point_change=float(s.get("point_change", 0.0)),
                change_percent=float(s.get("percentage_change", 0.0)),
                open_price=float(s.get("open_price")) if s.get("open_price") is not None else None,
                high_price=float(s.get("high_price")) if s.get("high_price") is not None else None,
                low_price=float(s.get("low_price")) if s.get("low_price") is not None else None,
                volume=int(s.get("volume", 0)),
                turnover=float(s.get("turnover", 0.0)),
                data_status=status,
                last_updated=datetime.now(timezone.utc)
            )
            for s in stocks
        ]

    async def get_stock_history(self, symbol: str, timeframe: Timeframe) -> List[Dict[str, Any]]:
        tf_limits = {
            Timeframe.d1: 1,
            Timeframe.w1: 7,
            Timeframe.m1: 30,
            Timeframe.m3: 90,
            Timeframe.y1: 250,
            Timeframe.all: 500
        }
        limit = tf_limits.get(timeframe, 30)

        history = await db.select(
            "stock_prices_ohlcv",
            filters={"symbol": f"eq.{symbol.upper()}"},
            order="date.desc",
            limit=limit
        )

        if not history:
            stock = await self.get_stock_price(symbol)
            ltp = stock.ltp if stock else 500.0
            today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
            return [
                {"date": today_str, "open": ltp - 2, "high": ltp + 5, "low": ltp - 4, "close": ltp, "volume": 12000}
            ]

        return history
