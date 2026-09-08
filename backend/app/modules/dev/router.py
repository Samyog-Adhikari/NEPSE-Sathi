from datetime import datetime, timezone
from typing import Any, Dict
import httpx
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from app.core.config import settings

router = APIRouter(prefix="/dev", tags=["Developer & Health Harness"])

class EchoPayload(BaseModel):
    message: str = Field(..., min_length=1, max_length=500)
    data: Dict[str, Any] = Field(default_factory=dict)

@router.get("/ping")
async def ping():
    return {
        "success": True,
        "message": "pong",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "server": "FastAPI",
        "cors_origins": settings.cors_origin_list
    }

@router.post("/echo")
async def echo(payload: EchoPayload):
    return {
        "success": True,
        "echoed": payload.model_dump(),
        "received_at": datetime.now(timezone.utc).isoformat()
    }

@router.get("/error-test")
async def error_test():
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail={
            "code": "DEV_TEST_ERROR",
            "message": "This is an intentional test error to verify standard error formatting."
        }
    )

@router.get("/services-check")
async def services_check():
    """Live connectivity test for Supabase, all 4 AI providers, and Telegram."""
    results = {}
    
    # 1. Supabase Check
    try:
        headers = {
            "apikey": settings.supabase_service_role_key,
            "Authorization": f"Bearer {settings.supabase_service_role_key}"
        }
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{settings.supabase_url}/rest/v1/", headers=headers)
            results["supabase"] = {
                "status": "connected" if r.status_code == 200 else f"http_{r.status_code}",
                "url": settings.supabase_url
            }
    except Exception as e:
        results["supabase"] = {"status": "error", "message": str(e)}

    # 2. Priority 1 AI: Google Gemini
    if settings.gemini_api_key:
        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                r = await client.get(
                    f"https://generativelanguage.googleapis.com/v1beta/models?key={settings.gemini_api_key}"
                )
                results["ai_priority_1_gemini"] = {
                    "status": "connected" if r.status_code == 200 else f"http_{r.status_code}",
                    "model": "gemini-3.6-flash"
                }
        except Exception as e:
            results["ai_priority_1_gemini"] = {"status": "error", "message": str(e)}
    else:
        results["ai_priority_1_gemini"] = {"status": "not_configured"}

    # 3. Priority 2 AI: Groq
    if settings.groq_api_key:
        try:
            headers = {"Authorization": f"Bearer {settings.groq_api_key}"}
            async with httpx.AsyncClient(timeout=6.0) as client:
                r = await client.get("https://api.groq.com/openai/v1/models", headers=headers)
                results["ai_priority_2_groq"] = {
                    "status": "connected" if r.status_code == 200 else f"http_{r.status_code}",
                    "model": "openai/gpt-oss-120b"
                }
        except Exception as e:
            results["ai_priority_2_groq"] = {"status": "error", "message": str(e)}
    else:
        results["ai_priority_2_groq"] = {"status": "not_configured"}

    # 4. Priority 3 AI: NVIDIA NIM
    if settings.nvidia_nim_api_key:
        try:
            headers = {"Authorization": f"Bearer {settings.nvidia_nim_api_key}"}
            async with httpx.AsyncClient(timeout=6.0) as client:
                r = await client.get("https://integrate.api.nvidia.com/v1/models", headers=headers)
                results["ai_priority_3_nvidia_nim"] = {
                    "status": "connected" if r.status_code == 200 else f"http_{r.status_code}",
                    "model": "meta/llama-3.2-11b-vision-instruct"
                }
        except Exception as e:
            results["ai_priority_3_nvidia_nim"] = {"status": "error", "message": str(e)}
    else:
        results["ai_priority_3_nvidia_nim"] = {"status": "not_configured"}

    # 5. Priority 4 AI: OpenRouter
    if settings.openrouter_api_key:
        try:
            headers = {"Authorization": f"Bearer {settings.openrouter_api_key}"}
            async with httpx.AsyncClient(timeout=6.0) as client:
                r = await client.get("https://openrouter.ai/api/v1/models", headers=headers)
                results["ai_priority_4_openrouter"] = {
                    "status": "connected" if r.status_code == 200 else f"http_{r.status_code}",
                    "model": "nvidia/nemotron-3.5-lightning:free"
                }
        except Exception as e:
            results["ai_priority_4_openrouter"] = {"status": "error", "message": str(e)}
    else:
        results["ai_priority_4_openrouter"] = {"status": "not_configured"}

    # 6. Telegram Bot Check
    if settings.telegram_bot_token:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                r = await client.get(f"https://api.telegram.org/bot{settings.telegram_bot_token}/getMe")
                data = r.json()
                results["telegram_bot"] = {
                    "status": "connected" if r.status_code == 200 else "error",
                    "bot_name": data.get("result", {}).get("first_name", "unknown")
                }
        except Exception as e:
            results["telegram_bot"] = {"status": "error", "message": str(e)}
    else:
        results["telegram_bot"] = {"status": "not_configured"}

    return {
        "success": True,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": results
    }
