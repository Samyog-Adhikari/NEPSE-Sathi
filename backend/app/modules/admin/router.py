from fastapi import APIRouter, BackgroundTasks
from app.core.database import db
from app.pipeline.runner import (
    run_full_pipeline,
    run_market_pipeline,
    run_ipo_news_pipeline,
    get_nepal_time,
    is_market_day,
    is_market_hours
)

router = APIRouter(prefix="/admin", tags=["Admin System Control"])


@router.get("/stats")
async def get_admin_stats():
    """Dashboard stats for the admin panel."""
    stocks = await db.select("stocks", select="symbol")
    trades = await db.select("floorsheet_records", select="id")
    brokers = await db.select("brokers", select="broker_no")
    ipos = await db.select("ipos", select="id")
    news = await db.select("news_items", select="id")
    indicators = await db.select("technical_indicators", select="id")
    summary = await db.select("market_summary", limit=1)

    return {
        "success": True,
        "database": {
            "status": "HEALTHY",
            "total_stocks_indexed": len(stocks),
            "total_floorsheet_trades": len(trades),
            "total_brokers_registered": len(brokers),
            "total_ipos_tracked": len(ipos),
            "total_news_indexed": len(news),
            "total_technicals_cached": len(indicators),
            "latest_nepse_index": summary[0].get("nepse_index") if summary else None
        }
    }


@router.get("/market-status")
async def get_market_status():
    """Returns current NEPSE market status: open/closed, trading day, Nepal time."""
    npt = get_nepal_time()
    return {
        "success": True,
        "nepal_time": npt.strftime("%Y-%m-%d %H:%M:%S"),
        "weekday": npt.strftime("%A"),
        "is_trading_day": is_market_day(npt),
        "is_market_hours": is_market_hours(npt),
        "market_hours": "11:00 AM - 3:00 PM NPT",
        "trading_days": "Monday - Friday"
    }


@router.post("/scrape-now")
async def trigger_full_pipeline(background_tasks: BackgroundTasks):
    """Trigger the FULL pipeline (market + IPO). Ignores market hour checks."""
    background_tasks.add_task(run_full_pipeline)
    return {
        "success": True,
        "message": "Full NEPSE ingestion pipeline has been queued in the background."
    }


@router.post("/scrape-market")
async def trigger_market_pipeline(background_tasks: BackgroundTasks):
    """Trigger only the live market pipeline (stocks, indices, floorsheet). Respects market hours."""
    background_tasks.add_task(run_market_pipeline)
    return {
        "success": True,
        "message": "Market pipeline has been queued. Will skip if market is closed."
    }


@router.post("/scrape-ipo")
async def trigger_ipo_pipeline(background_tasks: BackgroundTasks):
    """Trigger only the IPO & news pipeline. Runs anytime (including holidays)."""
    background_tasks.add_task(run_ipo_news_pipeline)
    return {
        "success": True,
        "message": "IPO/News pipeline has been queued in the background."
    }
