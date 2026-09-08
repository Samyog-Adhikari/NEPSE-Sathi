from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from app.core.database import db
from app.core.logging import logger
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/watchlist", tags=["Watchlist"])

class WatchlistAdd(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=10, description="Stock ticker symbol")
    notes: Optional[str] = Field(None, max_length=500, description="Personal investment thesis or notes")

@router.get("")
async def get_user_watchlist(user: Dict[str, Any] = Depends(get_current_user)):
    user_id = user["id"]

    # 1. Fetch user watchlist items
    items = await db.select(
        "user_watchlists",
        filters={"user_id": f"eq.{user_id}"},
        order="added_at.desc"
    )

    if not items:
        return {
            "success": True,
            "count": 0,
            "data": []
        }

    # 2. Get latest market prices for watched symbols
    symbols = list({item["symbol"].upper() for item in items if item.get("symbol")})
    stocks_map = {}
    if symbols:
        stocks_data = await db.select(
            "stocks",
            select="symbol,name,current_price,point_change,percent_change,volume,open_price,high_price,low_price",
            filters={"symbol": f"in.({','.join(symbols)})"}
        )
        for s in stocks_data:
            stocks_map[s["symbol"].upper()] = s

    # 3. Combine watchlist notes with live market numbers
    result = []
    for item in items:
        sym = item.get("symbol", "").upper()
        s_info = stocks_map.get(sym, {})
        result.append({
            "id": item.get("id"),
            "symbol": sym,
            "name": s_info.get("name") or sym,
            "current_price": s_info.get("current_price"),
            "point_change": s_info.get("point_change"),
            "percent_change": s_info.get("percent_change"),
            "volume": s_info.get("volume"),
            "notes": item.get("notes"),
            "added_at": item.get("added_at")
        })

    return {
        "success": True,
        "count": len(result),
        "data": result
    }

@router.post("")
async def add_to_watchlist(
    payload: WatchlistAdd,
    user: Dict[str, Any] = Depends(get_current_user)
):
    user_id = user["id"]
    symbol_clean = payload.symbol.strip().upper()

    # Check if already in user's watchlist
    existing = await db.select(
        "user_watchlists",
        filters={
            "user_id": f"eq.{user_id}",
            "symbol": f"eq.{symbol_clean}"
        },
        limit=1
    )

    if existing:
        return {
            "success": True,
            "message": f"{symbol_clean} is already in your watchlist",
            "data": existing[0]
        }

    record = {
        "user_id": user_id,
        "symbol": symbol_clean,
        "notes": payload.notes or ""
    }

    success = await db.insert("user_watchlists", record)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to add stock to watchlist")

    return {
        "success": True,
        "message": f"Added {symbol_clean} to watchlist",
        "data": record
    }

@router.delete("/{symbol}")
async def remove_from_watchlist(
    symbol: str,
    user: Dict[str, Any] = Depends(get_current_user)
):
    user_id = user["id"]
    symbol_clean = symbol.strip().upper()

    success = await db.delete(
        "user_watchlists",
        filters={
            "user_id": f"eq.{user_id}",
            "symbol": f"eq.{symbol_clean}"
        }
    )

    if not success:
        raise HTTPException(status_code=404, detail="Symbol not found in watchlist or unauthorized")

    return {
        "success": True,
        "message": f"Removed {symbol_clean} from watchlist"
    }
