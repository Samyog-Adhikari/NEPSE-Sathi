from fastapi import APIRouter

router = APIRouter(prefix="/ai", tags=["AI Outlook & RAG Explainer"])

@router.get("/outlook/{symbol}")
async def get_ai_outlook(symbol: str):
    return {
        "status": "success",
        "symbol": symbol.upper(),
        "timeframe": "1-4 Weeks",
        "confidence": 0.78,
        "outlook": "BULLISH_BIAS",
        "factors": [
            "Consistent accumulation by major brokers (Broker 58 & 34)",
            "MACD line crossed above signal line on daily time-frame",
            "Strong Q4 earnings report with EPS growth of +15%"
        ],
        "warning": "NOT FINANCIAL ADVICE. Stock investments are subject to market risk. Past performance does not guarantee future results."
    }
