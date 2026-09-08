from fastapi import APIRouter, Query
from typing import Optional
from app.core.database import db

router = APIRouter(prefix="/ipo", tags=["IPO Center"])


@router.get("")
async def get_all_ipos(
    status: Optional[str] = Query(None, description="Filter by status: OPEN, CLOSED, COMING_SOON, UPCOMING"),
    limit: int = Query(50, ge=1, le=200)
):
    """Returns all IPO listings, optionally filtered by status."""
    filters = {}
    if status:
        filters["status"] = f"eq.{status.upper()}"

    data = await db.select(
        "ipos",
        order="last_updated.desc",
        limit=limit,
        filters=filters if filters else None
    )
    return {"success": True, "count": len(data), "data": data}


@router.get("/open")
async def get_open_ipos():
    """Returns currently open IPOs accepting applications."""
    data = await db.select(
        "ipos",
        filters={"status": "eq.OPEN"},
        order="close_date.asc"
    )
    return {"success": True, "count": len(data), "data": data}


@router.get("/upcoming")
async def get_upcoming_ipos():
    """Returns upcoming IPOs in the SEBON pipeline."""
    data = await db.select(
        "ipos",
        filters={"status": "eq.UPCOMING"},
        order="open_date.desc",
        limit=50
    )
    return {"success": True, "count": len(data), "data": data}


@router.get("/coming-soon")
async def get_coming_soon_ipos():
    """Returns IPOs that are announced but not yet open."""
    data = await db.select(
        "ipos",
        filters={"status": "eq.COMING_SOON"},
        order="open_date.asc"
    )
    return {"success": True, "count": len(data), "data": data}


@router.get("/closed")
async def get_closed_ipos():
    """Returns recently closed IPOs."""
    data = await db.select(
        "ipos",
        filters={"status": "eq.CLOSED"},
        order="close_date.desc",
        limit=30
    )
    return {"success": True, "count": len(data), "data": data}
