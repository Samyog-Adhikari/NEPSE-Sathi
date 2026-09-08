import csv
import io
from collections import defaultdict
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query, Response
from app.core.database import db

router = APIRouter(prefix="/floorsheet", tags=["Floorsheet Analysis"])

@router.get("")
async def get_floorsheet(
    symbol: Optional[str] = Query(None, description="Filter by stock symbol"),
    buyer_broker: Optional[int] = Query(None, description="Filter by buyer broker number"),
    seller_broker: Optional[int] = Query(None, description="Filter by seller broker number"),
    limit: int = Query(50, ge=1, le=500)
):
    filters = {}
    if symbol:
        filters["symbol"] = f"eq.{symbol.strip().upper()}"
    if buyer_broker:
        filters["buyer_broker"] = f"eq.{buyer_broker}"
    if seller_broker:
        filters["seller_broker"] = f"eq.{seller_broker}"

    records = await db.select(
        table="floorsheet_records",
        filters=filters,
        order="trade_time.desc",
        limit=limit
    )

    return {
        "success": True,
        "count": len(records),
        "data": records
    }

@router.get("/{symbol}/summary")
async def get_floorsheet_symbol_summary(symbol: str):
    """
    Floorsheet volume and broker concentration summary per Blueprint §5.8.
    All text adheres strictly to neutral reporting without implying manipulation.
    """
    sym = symbol.strip().upper()
    records = await db.select(
        table="floorsheet_records",
        filters={"symbol": f"eq.{sym}"},
        limit=1000
    )

    if not records:
        return {
            "success": True,
            "symbol": sym,
            "trade_count": 0,
            "total_shares": 0,
            "total_turnover": 0.0,
            "buyer_concentration": [],
            "seller_concentration": [],
            "note": f"No floorsheet records available in the current session for {sym}."
        }

    total_shares = sum(int(r.get("quantity", 0)) for r in records)
    total_turnover = sum(float(r.get("amount", 0.0)) for r in records)

    buyer_counts = defaultdict(int)
    seller_counts = defaultdict(int)

    for r in records:
        b = r.get("buyer_broker")
        s = r.get("seller_broker")
        qty = int(r.get("quantity", 0))
        if b:
            buyer_counts[b] += qty
        if s:
            seller_counts[s] += qty

    # Sort brokers by volume
    top_buyers = sorted(
        [{"broker_no": b, "shares": q, "percent_of_traded_volume": round((q / total_shares * 100), 2) if total_shares > 0 else 0.0}
         for b, q in buyer_counts.items()],
        key=lambda x: x["shares"],
        reverse=True
    )[:5]

    top_sellers = sorted(
        [{"broker_no": s, "shares": q, "percent_of_traded_volume": round((q / total_shares * 100), 2) if total_shares > 0 else 0.0}
         for s, q in seller_counts.items()],
        key=lambda x: x["shares"],
        reverse=True
    )[:5]

    return {
        "success": True,
        "symbol": sym,
        "trade_count": len(records),
        "total_shares": total_shares,
        "total_turnover": round(total_turnover, 2),
        "top_buyer_brokers": top_buyers,
        "top_seller_brokers": top_sellers,
        "distribution_commentary": "Broker concentration reflects observed market participant volume. Data is provided for informational and liquidity analysis purposes."
    }

@router.get("/{symbol}/large-transactions")
async def get_large_transactions(
    symbol: str,
    min_quantity: int = Query(500, ge=100, description="Minimum trade quantity threshold"),
    limit: int = Query(50, ge=1, le=200)
):
    """
    Returns large block transactions for a symbol per Blueprint §5.8.
    """
    sym = symbol.strip().upper()
    records = await db.select(
        table="floorsheet_records",
        filters={
            "symbol": f"eq.{sym}",
            "quantity": f"gte.{min_quantity}"
        },
        order="quantity.desc",
        limit=limit
    )

    return {
        "success": True,
        "symbol": sym,
        "filter_min_quantity": min_quantity,
        "count": len(records),
        "data": records
    }

@router.get("/{symbol}/export")
async def export_symbol_floorsheet_csv(symbol: str):
    """
    Exports symbol floorsheet trades to CSV per Blueprint §5.8.
    """
    sym = symbol.strip().upper()
    records = await db.select(
        table="floorsheet_records",
        filters={"symbol": f"eq.{sym}"},
        order="trade_time.desc",
        limit=2000
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Contract No", "Stock Symbol", "Buyer Broker", "Seller Broker", "Quantity", "Rate", "Amount", "Trade Time"])

    for r in records:
        writer.writerow([
            r.get("contract_no"),
            r.get("symbol"),
            r.get("buyer_broker"),
            r.get("seller_broker"),
            r.get("quantity"),
            r.get("rate"),
            r.get("amount"),
            r.get("trade_time")
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={sym}_floorsheet.csv"}
    )
