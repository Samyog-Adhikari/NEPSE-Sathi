from fastapi import APIRouter

router = APIRouter(prefix="/watchlist", tags=["Watchlist"])

@router.get("")
async def get_user_watchlist():
    return {
        "status": "success",
        "data": [
            {"symbol": "NABIL", "target_buy": 500.0, "target_sell": 600.0, "notes": "Strong bank fundamentals"},
            {"symbol": "HDL", "target_buy": 1700.0, "target_sell": 2000.0, "notes": "Dividend expected"}
        ]
    }
