from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.services.market_data import (
    MarketDataProvider,
    Timeframe,
    get_market_data_provider
)

router = APIRouter(prefix="/stocks", tags=["Stocks"])

@router.get("")
async def list_stocks(
    search: Optional[str] = Query(None, description="Search stock by symbol or company name"),
    limit: int = Query(100, ge=1, le=500),
    provider: MarketDataProvider = Depends(get_market_data_provider)
):
    all_stocks = await provider.get_all_stocks()

    if search:
        s_upper = search.strip().upper()
        filtered = [s for s in all_stocks if s_upper in s.symbol.upper() or (s.name and s_upper in s.name.upper())]
    else:
        filtered = all_stocks

    return {
        "success": True,
        "count": len(filtered[:limit]),
        "data": [s.model_dump() for s in filtered[:limit]]
    }

@router.get("/{symbol}")
async def get_stock_detail(
    symbol: str,
    provider: MarketDataProvider = Depends(get_market_data_provider)
):
    sym_upper = symbol.strip().upper()
    stock = await provider.get_stock_price(sym_upper)

    if not stock:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "STOCK_NOT_FOUND",
                "message": f"Stock symbol {sym_upper} was not found in NEPSE directory."
            }
        )

    return {
        "success": True,
        "data": stock.model_dump()
    }

@router.get("/{symbol}/history")
async def get_stock_history(
    symbol: str,
    timeframe: Timeframe = Query(Timeframe.m1, description="Strict timeframe enum per Blueprint §5.2"),
    provider: MarketDataProvider = Depends(get_market_data_provider)
):
    sym_upper = symbol.strip().upper()
    history = await provider.get_stock_history(sym_upper, timeframe)

    return {
        "success": True,
        "symbol": sym_upper,
        "timeframe": timeframe.value,
        "data": history
    }

@router.get("/{symbol}/compare")
async def compare_stock(
    symbol: str,
    against: str = Query("index", pattern="^(sector|index)$", description="Compare against benchmark index or sector"),
    provider: MarketDataProvider = Depends(get_market_data_provider)
):
    """
    Compares stock performance against sector or NEPSE index per Blueprint §5.2.
    """
    sym_upper = symbol.strip().upper()
    stock = await provider.get_stock_price(sym_upper)
    if not stock:
        raise HTTPException(status_code=404, detail=f"Stock {sym_upper} not found")

    snapshot = await provider.get_market_snapshot()
    sectors = await provider.get_sector_performance()

    comparison_target = "NEPSE Index"
    target_change = snapshot.percent_change

    if against == "sector":
        # Match sector
        sector_match = next((s for s in sectors if s.sector_name.upper() in (stock.name or "").upper()), None)
        if sector_match:
            comparison_target = sector_match.sector_name
            target_change = sector_match.percent_change

    alpha = round(stock.change_percent - target_change, 2)

    return {
        "success": True,
        "symbol": sym_upper,
        "stock_change_percent": stock.change_percent,
        "compared_against": comparison_target,
        "target_change_percent": target_change,
        "relative_outperformance_alpha": alpha,
        "summary": f"{sym_upper} is {'outperforming' if alpha > 0 else 'underperforming'} {comparison_target} by {abs(alpha)}% in the current session."
    }

@router.get("/{symbol}/orderbook")
async def get_stock_orderbook(
    symbol: str,
    provider: MarketDataProvider = Depends(get_market_data_provider)
):
    sym_upper = symbol.strip().upper()
    stock = await provider.get_stock_price(sym_upper)
    ltp = stock.ltp if stock else 500.0

    # Simulated orderbook depth
    buy_orders = [
        {"order_no": 1, "quantity": 300, "price": round(ltp - 1.0, 1)},
        {"order_no": 2, "quantity": 550, "price": round(ltp - 2.0, 1)},
        {"order_no": 3, "quantity": 1200, "price": round(ltp - 3.5, 1)},
    ]
    sell_orders = [
        {"order_no": 1, "quantity": 250, "price": round(ltp + 1.0, 1)},
        {"order_no": 2, "quantity": 400, "price": round(ltp + 2.5, 1)},
        {"order_no": 3, "quantity": 900, "price": round(ltp + 4.0, 1)},
    ]

    return {
        "success": True,
        "symbol": sym_upper,
        "ltp": ltp,
        "orderbook": {
            "buy_orders": buy_orders,
            "sell_orders": sell_orders,
            "total_buy_qty": sum(o["quantity"] for o in buy_orders),
            "total_sell_qty": sum(o["quantity"] for o in sell_orders)
        }
    }
