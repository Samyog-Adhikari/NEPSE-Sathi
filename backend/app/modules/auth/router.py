from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.get("/me")
async def get_current_user_info():
    return {
        "status": "success",
        "user": {
            "id": "demo_user_123",
            "email": "investor@example.com",
            "name": "NEPSE Investor",
            "role": "authenticated"
        }
    }
