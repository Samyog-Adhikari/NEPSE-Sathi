from fastapi import APIRouter

router = APIRouter(prefix="/market", tags=["Market Data"])

@router.get("/summary")
async def get_market_summary():
    return {
        "status": "success",
        "data": {
            "nepse_index": 2045.60,
            "change": 12.40,
            "percent_change": 0.61,
            "total_turnover": 4521098234.0,
            "total_volume": 12345678,
            "market_status": "CLOSED",
            "last_updated": "2026-09-08T15:00:00+05:45"
        }
    }

@router.get("/indices")
async def get_market_indices():
    return {
        "status": "success",
        "data": [
            {"name": "NEPSE Index", "value": 2045.60, "change": 12.40, "percent_change": 0.61},
            {"name": "Sensitive Index", "value": 365.20, "change": 1.85, "percent_change": 0.51},
            {"name": "Float Index", "value": 142.10, "change": 0.90, "percent_change": 0.64},
            {"name": "Banking", "value": 1120.40, "change": 5.20, "percent_change": 0.47},
            {"name": "Hydropower", "value": 2450.80, "change": -15.30, "percent_change": -0.62}
        ]
    }

@router.get("/top-gainers")
async def get_top_gainers():
    return {
        "status": "success",
        "data": [
            {"symbol": "HDL", "name": "Himalayan Distillery", "ltp": 1850.0, "change": 168.0, "percent_change": 9.99},
            {"symbol": "SHIVM", "name": "Shivam Cements", "ltp": 540.0, "change": 49.0, "percent_change": 9.98}
        ]
    }

@router.get("/top-losers")
async def get_top_losers():
    return {
        "status": "success",
        "data": [
            {"symbol": "UPPER", "name": "Upper Tamakoshi", "ltp": 195.0, "change": -18.0, "percent_change": -8.45}
        ]
    }

@router.get("/live-ticker")
async def get_live_ticker():
    return {
        "status": "success",
        "data": {
            "freshness": "delayed",
            "delayed_minutes": 15,
            "ticker": [
                {"symbol": "NEPSE", "value": 2045.60, "change": 12.40},
                {"symbol": "NABIL", "value": 520.0, "change": 4.0},
                {"symbol": "GBIME", "value": 210.0, "change": -1.5}
            ]
        }
    }
