import json
import re
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.ai.cascade import ai_cascade
from app.core.database import db
from app.core.logging import logger

router = APIRouter(prefix="/ai", tags=["AI Outlook & RAG Explainer"])

SYSTEM_PROMPT = """You are a senior financial equity research analyst specializing in the Nepal Stock Exchange (NEPSE).
Provide an objective, structured market outlook for the requested stock symbol.
You MUST respond with valid JSON ONLY, strictly adhering to this structure:
{
  "timeframe": "1-4 Weeks",
  "confidence": 0.82,
  "outlook": "BULLISH_BIAS",
  "factors": [
    "Key driver 1",
    "Key driver 2",
    "Key driver 3"
  ],
  "summary": "2-3 concise sentences explaining the technical and fundamental outlook."
}
Outlook MUST be one of: BULLISH_BIAS, NEUTRAL, BEARISH_BIAS.
Confidence MUST be a float between 0.0 and 1.0.
Do not output markdown code blocks or any other text before or after the JSON."""

class ExplainerRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=500, description="Investor query regarding NEPSE stocks, technicals, or announcements")
    symbol: Optional[str] = Field(None, max_length=10, description="Optional stock ticker context")
    locale: str = Field(default="ne", pattern="^(ne|en)$", description="Response language: 'ne' for Nepali, 'en' for English")

@router.get("/outlook/{symbol}")
async def get_ai_outlook(symbol: str):
    sym = symbol.strip().upper()

    # 1. Fetch real live stock data from Supabase
    stock = await db.select("stocks", filters={"symbol": f"eq.{sym}"}, single=True)
    if not stock:
        raise HTTPException(
            status_code=404,
            detail={"code": "STOCK_NOT_FOUND", "message": f"Stock symbol {sym} was not found in NEPSE directory."}
        )

    company = stock.get("company_name", sym)
    sector = stock.get("sector", "Commercial Banks")
    ltp = stock.get("current_price", 0.0)
    change = stock.get("point_change", 0.0)
    pct = stock.get("percentage_change", 0.0)
    vol = stock.get("volume", 0)
    turnover = stock.get("turnover", 0.0)
    high_52 = stock.get("fifty_two_week_high", 0.0)
    low_52 = stock.get("fifty_two_week_low", 0.0)

    prompt = f"""Analyze NEPSE stock {sym} ({company}) in sector '{sector}'.
Live Market Metrics:
- Last Traded Price (LTP): NPR {ltp}
- Day Change: {change} ({pct}%)
- Session Traded Volume: {vol} shares
- Session Turnover: NPR {turnover}
- 52-Week Range: NPR {low_52} - NPR {high_52}

Provide current risk assessment, technical trend bias, and institutional trading context based on these real metrics."""

    try:
        res = await ai_cascade.generate(prompt=prompt, system_prompt=SYSTEM_PROMPT)
        raw_text = res["content"].strip()

        # Clean any potential markdown block wrappers
        clean_text = re.sub(r"^```(?:json)?\s*", "", raw_text, flags=re.MULTILINE)
        clean_text = re.sub(r"\s*```$", "", clean_text, flags=re.MULTILINE).strip()

        try:
            parsed = json.loads(clean_text)
        except Exception:
            parsed = {
                "timeframe": "1-4 Weeks",
                "confidence": 0.75,
                "outlook": "NEUTRAL",
                "factors": ["Market volatility in current session", "Awaiting fresh technical confirmation"],
                "summary": clean_text[:300]
            }

        return {
            "success": True,
            "symbol": sym,
            "timeframe": parsed.get("timeframe", "1-4 Weeks"),
            "confidence": parsed.get("confidence", 0.75),
            "outlook": parsed.get("outlook", "NEUTRAL"),
            "factors": parsed.get("factors", []),
            "summary": parsed.get("summary", ""),
            "ai_metadata": {
                "provider": res["provider"],
                "model": res["model"],
                "latency_ms": res["latency_ms"],
                "fallbacks_triggered": len(res.get("fallback_history", []))
            },
            "warning": "NOT FINANCIAL ADVICE. Stock investments in NEPSE are subject to market risk. Past performance does not guarantee future results."
        }

    except Exception as e:
        logger.error(f"Failed to generate AI outlook for {sym}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "code": "AI_INFERENCE_ERROR",
                "message": f"Unable to generate AI outlook for {sym}: {str(e)}"
            }
        )

@router.post("/explainer")
async def explain_query(payload: ExplainerRequest):
    """
    RAG-grounded explainer per Blueprint §11b.
    Retrieves live NEPSE data, recent announcements, and formats an objective explanation in Nepali or English.
    """
    context_items = []
    sources = []

    # 1. If symbol provided, retrieve stock data
    if payload.symbol:
        sym = payload.symbol.strip().upper()
        stock = await db.select("stocks", filters={"symbol": f"eq.{sym}"}, single=True)
        if stock:
            context_items.append(
                f"Stock {sym}: LTP={stock.get('current_price')}, Change={stock.get('point_change')} ({stock.get('percent_change')}%), High={stock.get('high_price')}, Low={stock.get('low_price')}, Volume={stock.get('volume')}"
            )
            sources.append(f"NEPSE Official Live Feed ({sym})")

    # 2. Retrieve recent news items
    recent_news = await db.select("news_items", order="scraped_at.desc", limit=5)
    if recent_news:
        news_summaries = []
        for n in recent_news:
            news_summaries.append(f"- [{n.get('category', 'market')}] {n.get('title')} ({n.get('source', 'Sharesansar')})")
            sources.append(n.get("title", ""))
        context_items.append("Recent Market News & Notices:\n" + "\n".join(news_summaries))

    # 3. Formulate RAG prompt
    language_instr = "Respond in clear, professional Nepali language (नेपाली भाषा)." if payload.locale == "ne" else "Respond in clear, professional English."
    
    rag_system_prompt = f"""You are 'NEPSE Sathi', an educational AI assistant for the Nepal Stock Exchange.
{language_instr}
Ground your answer STRICTLY in the provided NEPSE context and verified market knowledge.
Never invent price points, dates, or false rumors. Separate observed market facts from educational interpretation.
Always end with a one-sentence educational reminder that trading involves financial risk."""

    full_prompt = f"""Context:\n{chr(10).join(context_items) if context_items else "No specific stock context available."}

User Question: {payload.query}

Please provide an objective and thorough explanation based on the context."""

    try:
        res = await ai_cascade.generate(prompt=full_prompt, system_prompt=rag_system_prompt)
        return {
            "success": True,
            "query": payload.query,
            "locale": payload.locale,
            "explanation": res["content"].strip(),
            "sources_cited": sources[:5],
            "ai_metadata": {
                "provider": res["provider"],
                "model": res["model"],
                "latency_ms": res["latency_ms"]
            },
            "warning": "Educational technical output; not a guaranteed forecast. Always consult a SEBON-licensed advisor before making investment decisions."
        }
    except Exception as e:
        logger.error(f"Failed in AI explainer: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "code": "AI_EXPLAINER_ERROR",
                "message": f"Unable to process explainer query: {str(e)}"
            }
        )
