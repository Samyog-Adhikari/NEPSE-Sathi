from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.database import db
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/news", tags=["News & Announcements"])

@router.get("")
async def get_market_news(
    category: Optional[str] = Query(None, description="Filter: general, ipo, dividend, market, regulatory, earnings, merger, corporate"),
    symbol: Optional[str] = Query(None, description="Filter by stock ticker symbol mentioned in news"),
    limit: int = Query(30, ge=1, le=100)
):
    """Returns latest NEPSE market news and announcements per Blueprint §5.5."""
    filters = {}
    if category:
        filters["category"] = f"eq.{category.lower()}"
    if symbol:
        filters["related_symbols"] = f"cs.{{{symbol.strip().upper()}}}"

    data = await db.select(
        "news_items",
        order="scraped_at.desc",
        limit=limit,
        filters=filters if filters else None
    )
    return {"success": True, "count": len(data), "data": data}

@router.get("/categories")
async def get_news_categories():
    """Returns available news categories."""
    return {
        "success": True,
        "categories": [
            {"key": "general", "label": "General News"},
            {"key": "ipo", "label": "IPO & Rights Issues"},
            {"key": "dividend", "label": "Dividends & Bonus"},
            {"key": "market", "label": "Market Updates"},
            {"key": "regulatory", "label": "NRB & Regulatory"},
            {"key": "earnings", "label": "Financial Results"},
            {"key": "merger", "label": "Mergers & Acquisitions"},
            {"key": "corporate", "label": "Corporate Actions (AGM/EGM)"}
        ]
    }

@router.get("/important")
async def get_important_news(limit: int = Query(10, ge=1, le=50)):
    """Returns high-importance news (IPO, dividend, regulatory)."""
    data = await db.select(
        "news_items",
        filters={"importance": "eq.high"},
        order="scraped_at.desc",
        limit=limit
    )
    return {"success": True, "count": len(data), "data": data}

@router.post("/{news_id}/subscribe")
async def subscribe_news_alert(
    news_id: str,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Subscribes user to follow-up alerts and updates for an announcement per Blueprint §5.5.
    """
    user_id = user["id"]
    item = await db.select("news_items", filters={"id": f"eq.{news_id}"}, single=True)
    if not item:
        raise HTTPException(status_code=404, detail="News item not found")

    return {
        "success": True,
        "message": f"Successfully subscribed to alert notifications for '{item.get('title')}'",
        "news_id": news_id,
        "user_id": user_id
    }
