from fastapi import APIRouter

router = APIRouter(prefix="/technicals", tags=["Technical Analysis"])

@router.get("/{symbol}/indicators")
async def get_technical_indicators(symbol: str):
    return {
        "status": "success",
        "symbol": symbol.upper(),
        "indicators": {
            "rsi_14": 56.40,
            "macd": {"macd": 3.2, "signal": 2.1, "histogram": 1.1},
            "sma_20": 512.50,
            "sma_50": 505.00,
            "sma_200": 490.00,
            "bollinger": {"upper": 530.0, "middle": 512.5, "lower": 495.0},
            "overall_signal": "BULLISH"
        }
    }

@router.get("/signals")
async def get_market_signals():
    return {
        "status": "success",
        "signals": [
            {"symbol": "NABIL", "signal": "BUY", "reason": "MACD Golden Cross", "confidence": 0.82},
            {"symbol": "HDL", "signal": "STRONG_BUY", "reason": "RSI Breakout above 50", "confidence": 0.91}
        ]
    }
