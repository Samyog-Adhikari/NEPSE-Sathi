from fastapi import APIRouter

from app.modules.market.router import router as market_router
from app.modules.stocks.router import router as stocks_router
from app.modules.technicals.router import router as technicals_router
from app.modules.ipo.router import router as ipo_router
from app.modules.floorsheet.router import router as floorsheet_router
from app.modules.brokers.router import router as brokers_router
from app.modules.portfolio.router import router as portfolio_router
from app.modules.watchlist.router import router as watchlist_router
from app.modules.news.router import router as news_router
from app.modules.auth.router import router as auth_router
from app.modules.admin.router import router as admin_router
from app.modules.ai.router import router as ai_router
from app.modules.journal.router import router as journal_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(market_router)
api_v1_router.include_router(stocks_router)
api_v1_router.include_router(technicals_router)
api_v1_router.include_router(ipo_router)
api_v1_router.include_router(floorsheet_router)
api_v1_router.include_router(brokers_router)
api_v1_router.include_router(portfolio_router)
api_v1_router.include_router(watchlist_router)
api_v1_router.include_router(journal_router)
api_v1_router.include_router(news_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(admin_router)
api_v1_router.include_router(ai_router)

@api_v1_router.get("/health", tags=["Health"])
async def api_health_check():
    return {
        "status": "ok",
        "app": "NEPSE Insight API v1",
        "version": "1.0.0"
    }
