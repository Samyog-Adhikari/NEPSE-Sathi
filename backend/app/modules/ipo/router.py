from fastapi import APIRouter

router = APIRouter(prefix="/ipo", tags=["IPO Center"])

@router.get("/open")
async def get_open_ipos():
    return {
        "status": "success",
        "data": [
            {
                "company_name": "Sanima Reliance Insurance Ltd.",
                "symbol": "SRI",
                "issue_type": "IPO",
                "units": 3000000,
                "price_per_unit": 100,
                "opening_date": "2026-09-05",
                "closing_date": "2026-09-10",
                "status": "OPEN"
            }
        ]
    }

@router.get("/upcoming")
async def get_upcoming_ipos():
    return {
        "status": "success",
        "data": [
            {
                "company_name": "Upper Trishuli Hydro Power",
                "issue_type": "IPO",
                "units": 5000000,
                "price_per_unit": 100,
                "status": "UPCOMING"
            }
        ]
    }

@router.get("/result")
async def check_ipo_result(boid: str = None, company_id: str = None):
    return {
        "status": "success",
        "boid": boid,
        "allotted": True,
        "allotted_units": 10,
        "company_name": "Sanima Reliance Insurance Ltd."
    }
