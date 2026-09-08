from fastapi import APIRouter, Query
from app.core.database import db
from app.services.technicals.engine import compute_technicals_for_symbol

router = APIRouter(prefix="/technicals", tags=["Technical Analysis"])


@router.get("/{symbol}")
async def get_technical_indicators(symbol: str):
    """
    Computes and returns technical indicators (RSI, SMA, EMA, MACD) for a stock.
    Results are cached in the technical_indicators table.
    """
    result = await compute_technicals_for_symbol(symbol.upper())
    return {"success": True, **result}


@router.get("/{symbol}/cached")
async def get_cached_indicators(symbol: str):
    """Returns the last computed (cached) technical indicators from the database."""
    data = await db.select(
        "technical_indicators",
        filters={"symbol": f"eq.{symbol.upper()}"},
        order="computed_at.desc"
    )
    return {
        "success": True,
        "symbol": symbol.upper(),
        "count": len(data),
        "indicators": data
    }


@router.get("/signals/scan")
async def scan_signals(limit: int = Query(20, ge=1, le=100)):
    """
    Scans cached technical indicators for notable signals across all stocks.
    Returns stocks with extreme RSI (oversold < 30 or overbought > 70).
    """
    # Get all cached RSI values
    rsi_data = await db.select(
        "technical_indicators",
        filters={"indicator": "eq.RSI_14"},
        order="computed_at.desc",
        limit=500
    )

    signals = []
    for row in rsi_data:
        val = row.get("value", 50)
        if val >= 70:
            signals.append({
                "symbol": row["symbol"],
                "indicator": "RSI_14",
                "value": val,
                "signal": "OVERBOUGHT",
                "reason": row.get("signal", "RSI above 70 — potential reversal zone."),
                "computed_at": row.get("computed_at")
            })
        elif val <= 30:
            signals.append({
                "symbol": row["symbol"],
                "indicator": "RSI_14",
                "value": val,
                "signal": "OVERSOLD",
                "reason": row.get("signal", "RSI below 30 — potential bounce zone."),
                "computed_at": row.get("computed_at")
            })

    signals.sort(key=lambda x: abs(x["value"] - 50), reverse=True)
    return {
        "success": True,
        "count": len(signals[:limit]),
        "risk_warning": "Educational technical output; not a guaranteed forecast.",
        "signals": signals[:limit]
    }
