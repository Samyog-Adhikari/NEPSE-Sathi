from fastapi import APIRouter

router = APIRouter(prefix="/admin", tags=["Admin System Control"])

@router.get("/stats")
async def get_admin_stats():
    return {
        "status": "success",
        "total_users": 1520,
        "scrapers_active": 4,
        "database_health": "OPTIMAL",
        "api_response_time_ms": 42
    }
