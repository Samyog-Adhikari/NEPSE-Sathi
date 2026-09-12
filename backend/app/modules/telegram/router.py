from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.telegram_bot import telegram_bot
from app.core.config import settings

router = APIRouter(prefix="/telegram", tags=["Telegram Bot"])

class BroadcastRequest(BaseModel):
    message: str
    chat_id: Optional[str] = None

@router.get("/status")
async def get_telegram_status():
    bot_info = await telegram_bot.get_me() if telegram_bot.is_configured else None
    return {
        "success": True,
        "configured": telegram_bot.is_configured,
        "bot_username": bot_info.get("username") if bot_info else None,
        "bot_name": bot_info.get("first_name") if bot_info else None,
        "polling_active": telegram_bot.is_running,
        "default_chat_id": settings.telegram_chat_id,
        "last_message_at": telegram_bot.last_message_at.isoformat() if telegram_bot.last_message_at else None
    }

@router.post("/test")
async def send_test_telegram():
    if not telegram_bot.is_configured:
        raise HTTPException(status_code=400, detail="Telegram bot token not configured in .env")
    
    msg = (
        "🔔 *NEPSE Sathi Test Notification*\n\n"
        "Your Telegram bot integration is active and communicating with the backend.\n"
        "Live market pipelines, scraper health, and alerts are operational."
    )
    ok = await telegram_bot.send_alert(msg)
    if not ok:
        raise HTTPException(status_code=500, detail="Failed to send message to Telegram")
    return {"success": True, "message": "Test alert successfully sent to Telegram"}

@router.post("/broadcast")
async def broadcast_message(payload: BroadcastRequest):
    chat_id = payload.chat_id or settings.telegram_chat_id
    if not chat_id:
        raise HTTPException(status_code=400, detail="No target chat_id provided")
    ok = await telegram_bot.send_message(chat_id, payload.message)
    if not ok:
        raise HTTPException(status_code=500, detail="Failed to send Telegram message")
    return {"success": True, "message": "Broadcast sent"}
