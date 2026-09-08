from fastapi import APIRouter, Query, HTTPException

router = APIRouter(prefix="/stocks", tags=["Stocks"])

@router.get("")
async def list_stocks(
    search: str = Query(None, description="Search stock by symbol or company name"),
    sector: str = Query(None, description="Filter by sector")
):
    return {
        "status": "success",
        "data": [
            {"symbol": "NABIL", "name": "Nabil Bank Limited", "sector": "Commercial Banks", "ltp": 520.0, "change": 4.0},
            {"symbol": "HDL", "name": "Himalayan Distillery Ltd.", "sector": "Manufacturing", "ltp": 1850.0, "change": 168.0},
            {"symbol": "SHIVM", "name": "Shivam Cements Ltd.", "sector": "Manufacturing", "ltp": 540.0, "change": 49.0},
            {"symbol": "CIT", "name": "Citizen Investment Trust", "sector": "Investment", "ltp": 2100.0, "change": 15.0}
        ]
    }

@router.get("/{symbol}")
async def get_stock_detail(symbol: str):
    symbol_upper = symbol.upper()
    return {
        "status": "success",
        "data": {
            "symbol": symbol_upper,
            "name": f"{symbol_upper} Security",
            "sector": "Commercial Banks",
            "ltp": 520.0,
            "change": 4.0,
            "percent_change": 0.78,
            "open": 516.0,
            "high": 525.0,
            "low": 512.0,
            "volume": 45000,
            "turnover": 23400000.0,
            "52_week_high": 680.0,
            "52_week_low": 480.0,
            "eps": 24.50,
            "pe_ratio": 21.22,
            "book_value": 210.0,
            "pbv": 2.47
        }
    }

@router.get("/{symbol}/history")
async def get_stock_history(symbol: str, timeframe: str = "1Y"):
    return {
        "status": "success",
        "symbol": symbol.upper(),
        "timeframe": timeframe,
        "data": [
            {"date": "2026-09-01", "open": 510.0, "high": 515.0, "low": 508.0, "close": 512.0, "volume": 12000},
            {"date": "2026-09-02", "open": 512.0, "high": 520.0, "low": 510.0, "close": 516.0, "volume": 15000},
            {"date": "2026-09-03", "open": 516.0, "high": 525.0, "low": 512.0, "close": 520.0, "volume": 18000}
        ]
    }

@router.get("/{symbol}/orderbook")
async def get_stock_orderbook(symbol: str):
    return {
        "status": "success",
        "symbol": symbol.upper(),
        "bids": [
            {"price": 519.0, "quantity": 500, "orders": 3},
            {"price": 518.0, "quantity": 1200, "orders": 5}
        ],
        "asks": [
            {"price": 520.0, "quantity": 300, "orders": 2},
            {"price": 521.0, "quantity": 800, "orders": 4}
        ]
    }
