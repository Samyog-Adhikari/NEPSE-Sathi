from typing import Any, Dict, Optional
from fastapi import Header, HTTPException
import jwt
from app.core.config import settings
from app.core.logging import logger

DEMO_USER_ID = "30281af4-b030-4f9f-a3b1-0189f9684920"
DEMO_USER_EMAIL = "demo@nepsesathi.com"

def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    Validates Supabase JWT access token per Blueprint §4 & §7.
    Extracts user_id (sub), email, and role.
    In development environment, provides a fallback demo user when no token is supplied.
    """
    if not authorization:
        if settings.environment == "development":
            return {
                "id": DEMO_USER_ID,
                "email": DEMO_USER_EMAIL,
                "role": "authenticated",
                "is_demo": True
            }
        raise HTTPException(
            status_code=401,
            detail={"code": "UNAUTHORIZED", "message": "Authorization header missing"}
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail={"code": "UNAUTHORIZED", "message": "Invalid authorization scheme, must be Bearer"}
        )

    token = authorization.removeprefix("Bearer ").strip()

    # Development convenience token
    if settings.environment == "development" and token in ("demo", "demo-token"):
        return {
            "id": DEMO_USER_ID,
            "email": DEMO_USER_EMAIL,
            "role": "authenticated",
            "is_demo": True
        }

    try:
        # Supabase issues HS256 JWTs signed with SUPABASE_JWT_SECRET
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=401,
                detail={"code": "TOKEN_INVALID", "message": "Missing user ID in token payload"}
            )
        return {
            "id": user_id,
            "email": payload.get("email"),
            "role": payload.get("role", "authenticated"),
            "is_demo": False
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail={"code": "TOKEN_EXPIRED", "message": "Access token has expired"}
        )
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid JWT received: {str(e)}")
        raise HTTPException(
            status_code=401,
            detail={"code": "TOKEN_INVALID", "message": f"Token verification failed: {str(e)}"}
        )
