from fastapi import APIRouter

router = APIRouter(prefix="/portfolio", tags=["Portfolio Manager"])

@router.get("")
async def get_user_portfolio():
    return {
        "status": "success",
        "summary": {
            "total_investment": 500000.0,
            "current_value": 560000.0,
            "total_profit_loss": 60000.0,
            "percent_profit_loss": 12.0
        },
        "holdings": [
            {
                "symbol": "NABIL",
                "units": 500,
                "buy_price": 480.0,
                "current_price": 520.0,
                "investment": 240000.0,
                "current_value": 260000.0,
                "profit_loss": 20000.0
            }
        ]
    }
