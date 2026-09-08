from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from app.core.database import db
from app.core.logging import logger
from app.middleware.auth import get_current_user
from app.services.market_data import MarketDataProvider, get_market_data_provider

router = APIRouter(prefix="/journal", tags=["Trading Journal"])

class JournalEntryCreate(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=10, description="Stock ticker symbol")
    trade_type: str = Field(..., pattern="^(BUY|SELL|buy|sell)$", description="Type of trade (BUY or SELL)")
    quantity: int = Field(..., gt=0, description="Number of shares traded")
    price: float = Field(..., gt=0, description="Executed price per share")
    rationale: Optional[str] = Field(None, max_length=1000, description="Why did you take this trade?")
    mistakes: Optional[str] = Field(None, max_length=1000, description="Key mistakes or lessons learned")
    entry_date: Optional[str] = Field(None, description="Trade execution date (YYYY-MM-DD)")

class PaperTradeRequest(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=10, description="Stock ticker symbol")
    trade_type: str = Field(..., pattern="^(BUY|SELL|buy|sell)$", description="Simulated trade type")
    quantity: int = Field(..., gt=0, description="Number of shares")
    price: Optional[float] = Field(None, gt=0, description="Execution price (defaults to live LTP if omitted)")
    notes: Optional[str] = Field(None, max_length=500, description="Trade thesis or notes")

@router.get("/entries")
async def get_journal_entries(
    symbol: Optional[str] = Query(None, description="Filter by stock symbol"),
    trade_type: Optional[str] = Query(None, description="Filter by trade type (BUY or SELL)"),
    limit: int = Query(50, ge=1, le=200),
    user: Dict[str, Any] = Depends(get_current_user)
):
    user_id = user["id"]
    filters: Dict[str, str] = {"user_id": f"eq.{user_id}"}

    if symbol:
        filters["symbol"] = f"eq.{symbol.strip().upper()}"
    if trade_type:
        filters["trade_type"] = f"eq.{trade_type.strip().upper()}"

    entries = await db.select(
        "user_journal_entries",
        filters=filters,
        order="entry_date.desc,created_at.desc",
        limit=limit
    )

    return {
        "success": True,
        "count": len(entries),
        "data": entries
    }

@router.post("/entries")
async def create_journal_entry(
    payload: JournalEntryCreate,
    user: Dict[str, Any] = Depends(get_current_user)
):
    user_id = user["id"]
    symbol_clean = payload.symbol.strip().upper()
    trade_type_clean = payload.trade_type.strip().upper()
    entry_date = payload.entry_date or datetime.now(timezone.utc).strftime("%Y-%m-%d")

    record = {
        "user_id": user_id,
        "symbol": symbol_clean,
        "trade_type": trade_type_clean,
        "quantity": payload.quantity,
        "price": round(payload.price, 2),
        "rationale": payload.rationale or "",
        "mistakes": payload.mistakes or "",
        "entry_date": entry_date
    }

    success = await db.insert("user_journal_entries", record)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to save trading journal entry")

    return {
        "success": True,
        "message": f"Journal entry recorded for {symbol_clean}",
        "data": record
    }

@router.delete("/entries/{entry_id}")
async def delete_journal_entry(
    entry_id: str,
    user: Dict[str, Any] = Depends(get_current_user)
):
    user_id = user["id"]
    success = await db.delete(
        "user_journal_entries",
        filters={
            "id": f"eq.{entry_id}",
            "user_id": f"eq.{user_id}"
        }
    )

    if not success:
        raise HTTPException(status_code=404, detail="Journal entry not found or unauthorized")

    return {
        "success": True,
        "message": "Journal entry deleted successfully"
    }

@router.post("/paper-trade")
async def execute_paper_trade(
    payload: PaperTradeRequest,
    user: Dict[str, Any] = Depends(get_current_user),
    provider: MarketDataProvider = Depends(get_market_data_provider)
):
    """
    Simulates paper trading with authentic NEPSE fee structure per Blueprint §5.7.
    Includes tiered broker commission, SEBON regulatory fee (0.015%), and DP charge (NPR 25).
    """
    user_id = user["id"]
    sym = payload.symbol.strip().upper()
    t_type = payload.trade_type.strip().upper()

    # Determine price: use payload price or live price
    if payload.price:
        exec_price = round(payload.price, 2)
    else:
        stock = await provider.get_stock_price(sym)
        if not stock:
            raise HTTPException(status_code=404, detail=f"Stock {sym} not found to fetch current price")
        exec_price = stock.ltp

    gross = round(payload.quantity * exec_price, 2)

    # Real NEPSE Tiered Broker Commission
    if gross <= 50000:
        comm_rate = 0.0040
    elif gross <= 500000:
        comm_rate = 0.0037
    elif gross <= 2000000:
        comm_rate = 0.0034
    elif gross <= 10000000:
        comm_rate = 0.0030
    else:
        comm_rate = 0.0027

    broker_comm = max(10.0, round(gross * comm_rate, 2))
    sebon_fee = round(gross * 0.00015, 2)
    dp_fee = 25.0
    total_fees = round(broker_comm + sebon_fee + dp_fee, 2)

    if t_type == "BUY":
        net_payable = round(gross + total_fees, 2)
    else:
        net_payable = round(gross - total_fees, 2)

    # Automatically record to user journal as a simulated trade
    rationale_note = (
        f"[SIMULATED PAPER TRADE] {payload.notes or 'No notes'}. "
        f"Gross: NPR {gross:,} | Broker Fee ({comm_rate*100:.2f}%): NPR {broker_comm} | "
        f"SEBON Fee (0.015%): NPR {sebon_fee} | DP Fee: NPR {dp_fee} | Net: NPR {net_payable:,}"
    )
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    journal_rec = {
        "user_id": user_id,
        "symbol": sym,
        "trade_type": t_type,
        "quantity": payload.quantity,
        "price": exec_price,
        "rationale": rationale_note,
        "mistakes": "Simulated paper trade (0 real capital risk)",
        "entry_date": today_str
    }
    await db.insert("user_journal_entries", journal_rec)

    return {
        "success": True,
        "paper_trade": {
            "symbol": sym,
            "action": t_type,
            "quantity": payload.quantity,
            "execution_price": exec_price,
            "gross_amount": gross,
            "fee_breakdown": {
                "broker_commission": broker_comm,
                "broker_rate": f"{comm_rate*100:.2f}%",
                "sebon_regulatory_fee": sebon_fee,
                "dp_charge": dp_fee,
                "total_fees": total_fees
            },
            "net_settlement_amount": net_payable,
            "logged_to_journal": True
        }
    }
