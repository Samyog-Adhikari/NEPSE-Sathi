from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query
from app.services.market_data import (
    MarketDataProvider,
    get_market_data_provider
)

router = APIRouter(prefix="/market", tags=["Market Data"])

@router.get("/dashboard")
@router.get("/summary")
async def get_market_dashboard(
    provider: MarketDataProvider = Depends(get_market_data_provider)
):
    snapshot = await provider.get_market_snapshot()
    sectors = await provider.get_sector_performance()
    movers = await provider.get_top_movers()

    return {
        "success": True,
        "source": provider.source_name(),
        "data_status": snapshot.data_status,
        "last_updated": snapshot.last_updated.isoformat(),
        "snapshot": snapshot.model_dump(),
        "sector_performance": [s.model_dump() for s in sectors],
        "top_movers": movers.model_dump()
    }

@router.get("/sectors")
async def get_market_sectors(
    provider: MarketDataProvider = Depends(get_market_data_provider)
):
    sectors = await provider.get_sector_performance()
    snapshot = await provider.get_market_snapshot()
    return {
        "success": True,
        "data_status": snapshot.data_status,
        "last_updated": snapshot.last_updated.isoformat(),
        "count": len(sectors),
        "data": [s.model_dump() for s in sectors]
    }

@router.get("/top-movers")
async def get_top_movers(
    provider: MarketDataProvider = Depends(get_market_data_provider)
):
    movers = await provider.get_top_movers()
    snapshot = await provider.get_market_snapshot()
    return {
        "success": True,
        "data_status": snapshot.data_status,
        "last_updated": snapshot.last_updated.isoformat(),
        "data": movers.model_dump()
    }

@router.get("/top-gainers")
async def get_top_gainers(
    provider: MarketDataProvider = Depends(get_market_data_provider)
):
    movers = await provider.get_top_movers()
    snapshot = await provider.get_market_snapshot()
    return {
        "success": True,
        "data_status": snapshot.data_status,
        "last_updated": snapshot.last_updated.isoformat(),
        "count": len(movers.gainers),
        "data": [g.model_dump() for g in movers.gainers]
    }

@router.get("/top-losers")
async def get_top_losers(
    provider: MarketDataProvider = Depends(get_market_data_provider)
):
    movers = await provider.get_top_movers()
    snapshot = await provider.get_market_snapshot()
    return {
        "success": True,
        "data_status": snapshot.data_status,
        "last_updated": snapshot.last_updated.isoformat(),
        "count": len(movers.losers),
        "data": [l.model_dump() for l in movers.losers]
    }

@router.get("/indices")
async def get_market_indices(
    provider: MarketDataProvider = Depends(get_market_data_provider)
):
    sectors = await provider.get_sector_performance()
    snapshot = await provider.get_market_snapshot()
    return {
        "success": True,
        "data_status": snapshot.data_status,
        "last_updated": snapshot.last_updated.isoformat(),
        "count": len(sectors),
        "data": [s.model_dump() for s in sectors]
    }

@router.get("/live-ticker")
async def get_live_ticker(
    provider: MarketDataProvider = Depends(get_market_data_provider)
):
    snapshot = await provider.get_market_snapshot()
    stocks = await provider.get_all_stocks()

    # Sort by highest turnover for ticker visibility
    top_ticker = sorted(stocks, key=lambda s: s.turnover, reverse=True)[:15]

    return {
        "success": True,
        "data_status": snapshot.data_status,
        "last_updated": snapshot.last_updated.isoformat(),
        "nepse_index": snapshot.index_value,
        "point_change": snapshot.point_change,
        "percent_change": snapshot.percent_change,
        "ticker_items": [s.model_dump() for s in top_ticker]
    }
