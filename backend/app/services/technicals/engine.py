"""
Technical Indicators Engine for NEPSE Sathi.
Computes RSI(14), SMA(20/50), EMA(12/26), and MACD from stock price data.
Per BLUEPRINT_CHECKS.md §5.3: computed server-side and cached.
"""
import math
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from app.core.database import db
from app.core.logging import logger


def compute_sma(prices: List[float], period: int) -> Optional[float]:
    """Simple Moving Average over the last `period` closing prices."""
    if len(prices) < period:
        return None
    return round(sum(prices[-period:]) / period, 2)


def compute_ema(prices: List[float], period: int) -> Optional[float]:
    """Exponential Moving Average over the last `period` closing prices."""
    if len(prices) < period:
        return None
    multiplier = 2 / (period + 1)
    ema = sum(prices[:period]) / period  # seed with SMA
    for price in prices[period:]:
        ema = (price - ema) * multiplier + ema
    return round(ema, 2)


def compute_rsi(prices: List[float], period: int = 14) -> Optional[float]:
    """
    Relative Strength Index.
    RSI = 100 - (100 / (1 + RS))
    RS = Average Gain / Average Loss over `period` days.
    """
    if len(prices) < period + 1:
        return None

    changes = [prices[i] - prices[i - 1] for i in range(1, len(prices))]
    gains = [c if c > 0 else 0 for c in changes]
    losses = [-c if c < 0 else 0 for c in changes]

    avg_gain = sum(gains[:period]) / period
    avg_loss = sum(losses[:period]) / period

    # Smooth with Wilder's method
    for i in range(period, len(gains)):
        avg_gain = (avg_gain * (period - 1) + gains[i]) / period
        avg_loss = (avg_loss * (period - 1) + losses[i]) / period

    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return round(rsi, 2)


def compute_macd(prices: List[float]) -> Optional[Dict[str, float]]:
    """
    MACD = EMA(12) - EMA(26)
    Signal Line = EMA(9) of MACD
    Histogram = MACD - Signal
    """
    if len(prices) < 26:
        return None

    ema12 = compute_ema(prices, 12)
    ema26 = compute_ema(prices, 26)
    if ema12 is None or ema26 is None:
        return None

    macd_line = round(ema12 - ema26, 2)

    # Compute MACD series for signal line
    macd_series = []
    for i in range(26, len(prices) + 1):
        sub_prices = prices[:i]
        e12 = compute_ema(sub_prices, 12)
        e26 = compute_ema(sub_prices, 26)
        if e12 is not None and e26 is not None:
            macd_series.append(e12 - e26)

    signal = compute_ema(macd_series, 9) if len(macd_series) >= 9 else None
    histogram = round(macd_line - signal, 2) if signal is not None else None

    return {
        "macd_line": macd_line,
        "signal_line": round(signal, 2) if signal else None,
        "histogram": histogram
    }


def interpret_rsi(rsi: float) -> str:
    """Returns a human-readable RSI interpretation."""
    if rsi >= 70:
        return "Overbought — may be due for a pullback."
    elif rsi >= 60:
        return "Bullish momentum — approaching overbought territory."
    elif rsi >= 40:
        return "Neutral — no strong directional bias."
    elif rsi >= 30:
        return "Bearish momentum — approaching oversold territory."
    else:
        return "Oversold — may be due for a bounce."


def interpret_macd(macd_data: Dict[str, float]) -> str:
    """Returns a human-readable MACD interpretation."""
    if macd_data.get("histogram") is None:
        return "Insufficient data for signal line."
    hist = macd_data["histogram"]
    if hist > 0:
        return "Bullish — MACD is above the signal line."
    elif hist < 0:
        return "Bearish — MACD is below the signal line."
    return "Neutral — MACD is crossing the signal line."


async def compute_technicals_for_symbol(symbol: str) -> Dict[str, Any]:
    """
    Fetches OHLCV history from Supabase and computes all technical indicators.
    Uses stock_prices_ohlcv if available, falls back to current stock data.
    """
    # Try to get OHLCV history
    ohlcv = await db.select(
        "stock_prices_ohlcv",
        filters={"symbol": f"eq.{symbol}"},
        order="date.asc",
        limit=200
    )

    if ohlcv and len(ohlcv) >= 14:
        prices = [float(row["close"]) for row in ohlcv if row.get("close")]
    else:
        # Fallback: use current stock price as single data point
        stock = await db.select(
            "stocks",
            filters={"symbol": f"eq.{symbol}"},
            single=True
        )
        if not stock:
            return {"error": f"Stock {symbol} not found"}
        # With only one price point, we can still return current price but not indicators
        return {
            "symbol": symbol,
            "current_price": stock.get("current_price"),
            "note": "Insufficient historical data for technical analysis. OHLCV history needs to be built up over trading days.",
            "indicators": {}
        }

    current_price = prices[-1] if prices else None
    now_iso = datetime.now(timezone.utc).isoformat()

    # Compute all indicators
    rsi_14 = compute_rsi(prices, 14)
    sma_20 = compute_sma(prices, 20)
    sma_50 = compute_sma(prices, 50)
    ema_12 = compute_ema(prices, 12)
    ema_26 = compute_ema(prices, 26)
    macd_data = compute_macd(prices)

    indicators = {}

    if rsi_14 is not None:
        indicators["RSI_14"] = {
            "value": rsi_14,
            "signal": interpret_rsi(rsi_14),
            "risk_warning": "Educational technical output; not a guaranteed forecast."
        }

    if sma_20 is not None:
        above_sma20 = current_price > sma_20 if current_price else None
        indicators["SMA_20"] = {
            "value": sma_20,
            "signal": f"Price is {'above' if above_sma20 else 'below'} the 20-day SMA." if above_sma20 is not None else "N/A",
            "risk_warning": "Educational technical output; not a guaranteed forecast."
        }

    if sma_50 is not None:
        above_sma50 = current_price > sma_50 if current_price else None
        indicators["SMA_50"] = {
            "value": sma_50,
            "signal": f"Price is {'above' if above_sma50 else 'below'} the 50-day SMA." if above_sma50 is not None else "N/A",
            "risk_warning": "Educational technical output; not a guaranteed forecast."
        }

    if ema_12 is not None:
        indicators["EMA_12"] = {"value": ema_12}

    if ema_26 is not None:
        indicators["EMA_26"] = {"value": ema_26}

    if macd_data is not None:
        indicators["MACD"] = {
            **macd_data,
            "signal": interpret_macd(macd_data),
            "risk_warning": "Educational technical output; not a guaranteed forecast."
        }

    # Cache to technical_indicators table
    cache_rows = []
    for ind_name, ind_data in indicators.items():
        val = ind_data.get("value") or ind_data.get("macd_line", 0)
        cache_rows.append({
            "symbol": symbol,
            "indicator": ind_name,
            "timeframe": "1D",
            "value": val,
            "signal": ind_data.get("signal", ""),
            "reason": ind_data.get("risk_warning", ""),
            "computed_at": now_iso
        })

    if cache_rows:
        await db.upsert("technical_indicators", cache_rows, on_conflict="symbol,indicator,timeframe")

    return {
        "symbol": symbol,
        "current_price": current_price,
        "data_points": len(prices),
        "computed_at": now_iso,
        "indicators": indicators
    }
