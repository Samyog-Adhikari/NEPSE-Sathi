import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.middleware.error_handler import (
    global_exception_handler,
    http_exception_handler,
    validation_exception_handler
)
from app.api.v1.api import api_v1_router
from app.pipeline.runner import (
    run_market_pipeline,
    run_ipo_news_pipeline,
    is_market_hours,
    get_nepal_time
)

setup_logging()

async def background_scheduler():
    """
    Autonomous Background Scheduler for NEPSE Sathi:
    - Runs alongside FastAPI
    - Every 5 minutes during trading hours (11:00 AM - 3:00 PM NPT, Mon-Fri, non-holidays): ingests live market data
    - Every 6 hours (24/7, including holidays): ingests latest IPOs, dividends, and news announcements
    """
    logger.info("NEPSE Sathi Background Scheduler initialized.")
    last_market_run = 0.0
    last_ipo_run = 0.0

    MARKET_INTERVAL = 300  # 5 minutes in seconds
    IPO_INTERVAL = 21600   # 6 hours in seconds

    while True:
        try:
            await asyncio.sleep(60)  # Pulse every 60 seconds
            now_ts = asyncio.get_event_loop().time()

            # 1. Market Scrape (only during trading hours on market days)
            npt = get_nepal_time()
            if is_market_hours(npt):
                if now_ts - last_market_run >= MARKET_INTERVAL:
                    logger.info("Scheduler: Market is OPEN. Triggering 5-minute live market ingestion...")
                    last_market_run = now_ts
                    await run_market_pipeline()

            # 2. IPO & News Scrape (runs every 6 hours 24/7)
            if now_ts - last_ipo_run >= IPO_INTERVAL:
                logger.info("Scheduler: Triggering 6-hour IPO & News ingestion...")
                last_ipo_run = now_ts
                await run_ipo_news_pipeline()

        except asyncio.CancelledError:
            logger.info("Background scheduler successfully shutdown.")
            break
        except Exception as e:
            logger.error(f"Error in background scheduler cycle: {e}", exc_info=True)
            await asyncio.sleep(30)

@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler_task = asyncio.create_task(background_scheduler())
    yield
    scheduler_task.cancel()
    try:
        await scheduler_task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title="NEPSE Sathi API",
    description="Backend service for NEPSE Sathi financial companion platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Standardized Exception Handlers
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

# Root Health Endpoint
@app.get("/health", tags=["Health"])
async def root_health_check():
    npt = get_nepal_time()
    return {
        "success": True,
        "status": "ok",
        "app": "NEPSE Sathi API",
        "environment": settings.environment,
        "nepal_time": npt.strftime("%Y-%m-%d %H:%M:%S"),
        "market_open": is_market_hours(npt)
    }

# Include API v1 routes
app.include_router(api_v1_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.port, reload=True)
