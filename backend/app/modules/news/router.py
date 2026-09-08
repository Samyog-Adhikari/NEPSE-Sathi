from fastapi import APIRouter

router = APIRouter(prefix="/news", tags=["News & Announcements"])

@router.get("")
async def get_market_news():
    return {
        "status": "success",
        "data": [
            {
                "id": "1",
                "title": "Nabil Bank proposes 10% bonus share and 5% cash dividend",
                "summary": "Nabil Bank has announced dividends for fiscal year 2081/82 subject to NRB approval.",
                "published_at": "2026-09-08T10:30:00+05:45",
                "source": "Sharesansar"
            }
        ]
    }
