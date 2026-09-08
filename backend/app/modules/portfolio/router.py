import csv
import io
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, File, HTTPException, Query, Response, UploadFile
from pydantic import BaseModel, Field
from app.core.database import db
from app.core.logging import logger
from app.middleware.auth import get_current_user
from app.services.market_data import MarketDataProvider, get_market_data_provider

router = APIRouter(prefix="/portfolio", tags=["Portfolio Manager"])

class TransactionCreate(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=10, description="Stock ticker symbol")
    quantity: int = Field(..., gt=0, description="Number of shares bought")
    buy_price: float = Field(..., gt=0, description="Purchase price per share in NPR")
    buy_date: Optional[str] = Field(None, description="Purchase date (YYYY-MM-DD)")

@router.get("")
async def get_user_portfolio(
    user: Dict[str, Any] = Depends(get_current_user),
    provider: MarketDataProvider = Depends(get_market_data_provider)
):
    user_id = user["id"]

    # 1. Fetch user transactions from Supabase
    rows = await db.select(
        "user_portfolios",
        filters={"user_id": f"eq.{user_id}"},
        order="created_at.desc"
    )

    if not rows:
        return {
            "success": True,
            "summary": {
                "total_investment": 0.0,
                "current_value": 0.0,
                "total_profit_loss": 0.0,
                "percent_profit_loss": 0.0,
                "total_holdings": 0
            },
            "holdings": []
        }

    # 2. Get distinct symbols to fetch live prices
    symbols = list({r["symbol"].upper() for r in rows if r.get("symbol")})
    stocks_map = {}
    if symbols:
        stocks_data = await db.select(
            "stocks",
            select="symbol,current_price,point_change,percent_change",
            filters={"symbol": f"in.({','.join(symbols)})"}
        )
        for s in stocks_data:
            stocks_map[s["symbol"].upper()] = s

    # 3. Compute per-holding & portfolio performance
    holdings = []
    total_investment = 0.0
    total_current_value = 0.0

    for r in rows:
        sym = r.get("symbol", "").upper()
        qty = int(r.get("quantity", 0))
        buy_p = float(r.get("buy_price", 0.0))
        stock_info = stocks_map.get(sym, {})
        
        current_p = float(stock_info.get("current_price")) if stock_info.get("current_price") is not None else buy_p
        
        investment = round(qty * buy_p, 2)
        curr_val = round(qty * current_p, 2)
        pnl = round(curr_val - investment, 2)
        pnl_pct = round((pnl / investment * 100), 2) if investment > 0 else 0.0

        total_investment += investment
        total_current_value += curr_val

        holdings.append({
            "id": r.get("id"),
            "symbol": sym,
            "quantity": qty,
            "buy_price": buy_p,
            "buy_date": r.get("buy_date"),
            "current_price": current_p,
            "investment": investment,
            "current_value": curr_val,
            "profit_loss": pnl,
            "profit_loss_percent": pnl_pct,
            "day_change": stock_info.get("point_change"),
            "day_change_percent": stock_info.get("percent_change")
        })

    tot_pnl = round(total_current_value - total_investment, 2)
    tot_pnl_pct = round((tot_pnl / total_investment * 100), 2) if total_investment > 0 else 0.0

    return {
        "success": True,
        "summary": {
            "total_investment": round(total_investment, 2),
            "current_value": round(total_current_value, 2),
            "total_profit_loss": tot_pnl,
            "percent_profit_loss": tot_pnl_pct,
            "total_holdings": len(holdings)
        },
        "holdings": holdings
    }

@router.post("/transactions")
async def add_portfolio_transaction(
    payload: TransactionCreate,
    user: Dict[str, Any] = Depends(get_current_user)
):
    user_id = user["id"]
    symbol_clean = payload.symbol.strip().upper()
    buy_date = payload.buy_date or datetime.now(timezone.utc).strftime("%Y-%m-%d")

    record = {
        "user_id": user_id,
        "symbol": symbol_clean,
        "quantity": payload.quantity,
        "buy_price": round(payload.buy_price, 2),
        "buy_date": buy_date
    }

    success = await db.insert("user_portfolios", record)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to save transaction to database")

    return {
        "success": True,
        "message": f"Successfully added {payload.quantity} shares of {symbol_clean}",
        "data": record
    }

@router.delete("/transactions/{transaction_id}")
async def delete_portfolio_transaction(
    transaction_id: str,
    user: Dict[str, Any] = Depends(get_current_user)
):
    user_id = user["id"]
    success = await db.delete(
        "user_portfolios",
        filters={
            "id": f"eq.{transaction_id}",
            "user_id": f"eq.{user_id}"
        }
    )
    if not success:
        raise HTTPException(status_code=404, detail="Transaction not found or unauthorized")

    return {
        "success": True,
        "message": "Transaction deleted successfully"
    }

@router.post("/import")
async def import_portfolio_csv(
    file: UploadFile = File(...),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Server-side CSV import per Blueprint §5.6.
    Enforces strict column validation and row cap (500 rows).
    Rejects the entire file if any row is malformed.
    """
    user_id = user["id"]
    if not file.filename.endswith((".csv", ".txt")):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a .csv file.")

    content = await file.read()
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File encoding must be UTF-8.")

    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        raise HTTPException(status_code=400, detail="CSV file is empty or missing header row.")

    # Normalize headers
    headers = [h.strip().lower() for h in reader.fieldnames]
    required = {"symbol", "quantity", "buy_price"}
    if not required.issubset(set(headers)):
        raise HTTPException(
            status_code=400,
            detail=f"Missing required CSV columns. Required: {required}. Found: {headers}"
        )

    records = []
    MAX_ROWS = 500
    row_count = 0

    for idx, row in enumerate(reader, start=2):  # line 2 is first data row
        row_count += 1
        if row_count > MAX_ROWS:
            raise HTTPException(
                status_code=400,
                detail=f"Row cap exceeded. Maximum allowed rows is {MAX_ROWS}."
            )

        # Map case-insensitive keys
        row_clean = {k.strip().lower(): v.strip() for k, v in row.items() if k}
        sym = row_clean.get("symbol", "").upper()
        qty_str = row_clean.get("quantity", "")
        price_str = row_clean.get("buy_price", "")
        buy_date = row_clean.get("buy_date") or datetime.now(timezone.utc).strftime("%Y-%m-%d")

        if not sym or len(sym) > 10:
            raise HTTPException(status_code=400, detail=f"Row {idx}: Invalid or empty stock symbol '{sym}'")

        try:
            qty = int(qty_str)
            if qty <= 0:
                raise ValueError()
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Row {idx}: Invalid quantity '{qty_str}'. Must be a positive integer.")

        try:
            price = float(price_str)
            if price <= 0:
                raise ValueError()
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Row {idx}: Invalid buy price '{price_str}'. Must be a positive number.")

        records.append({
            "user_id": user_id,
            "symbol": sym,
            "quantity": qty,
            "buy_price": round(price, 2),
            "buy_date": buy_date
        })

    if not records:
        raise HTTPException(status_code=400, detail="CSV contains no data rows.")

    # Insert batch
    success = await db.insert("user_portfolios", records)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to import portfolio batch to database.")

    return {
        "success": True,
        "message": f"Successfully imported {len(records)} portfolio positions.",
        "imported_count": len(records)
    }

@router.get("/export")
async def export_portfolio_csv(
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Exports user portfolio to CSV per Blueprint §5.6.
    """
    user_id = user["id"]
    rows = await db.select("user_portfolios", filters={"user_id": f"eq.{user_id}"})

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Symbol", "Quantity", "Buy Price (NPR)", "Buy Date", "Created At"])

    for r in rows:
        writer.writerow([
            r.get("symbol"),
            r.get("quantity"),
            r.get("buy_price"),
            r.get("buy_date"),
            r.get("created_at")
        ])

    csv_data = output.getvalue()
    today_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=nepse_portfolio_{today_str}.csv"}
    )
