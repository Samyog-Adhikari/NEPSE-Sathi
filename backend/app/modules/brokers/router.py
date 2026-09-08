from fastapi import APIRouter, HTTPException, status
from app.core.database import db

router = APIRouter(prefix="/brokers", tags=["Broker Analysis"])

@router.get("")
async def list_brokers():
    brokers = await db.select(
        table="brokers",
        order="broker_no.asc"
    )

    return {
        "success": True,
        "count": len(brokers),
        "data": brokers
    }

@router.get("/{broker_id}/analytics")
async def get_broker_analytics(broker_id: int):
    # Query buy trades where buyer_broker = broker_id
    buy_trades = await db.select(
        table="floorsheet_records",
        select="symbol,quantity,amount",
        filters={"buyer_broker": f"eq.{broker_id}"},
        limit=200
    )

    # Query sell trades where seller_broker = broker_id
    sell_trades = await db.select(
        table="floorsheet_records",
        select="symbol,quantity,amount",
        filters={"seller_broker": f"eq.{broker_id}"},
        limit=200
    )

    total_buy_amount = sum(float(t.get("amount", 0)) for t in buy_trades)
    total_sell_amount = sum(float(t.get("amount", 0)) for t in sell_trades)
    total_turnover = round(total_buy_amount + total_sell_amount, 2)

    # Aggregate by symbol
    bought_symbols = {}
    for t in buy_trades:
        sym = t["symbol"]
        bought_symbols[sym] = bought_symbols.get(sym, 0.0) + float(t.get("amount", 0))

    sold_symbols = {}
    for t in sell_trades:
        sym = t["symbol"]
        sold_symbols[sym] = sold_symbols.get(sym, 0.0) + float(t.get("amount", 0))

    top_bought = sorted([{"symbol": k, "amount": round(v, 2)} for k, v in bought_symbols.items()], key=lambda x: x["amount"], reverse=True)[:5]
    top_sold = sorted([{"symbol": k, "amount": round(v, 2)} for k, v in sold_symbols.items()], key=lambda x: x["amount"], reverse=True)[:5]

    return {
        "success": True,
        "broker_no": broker_id,
        "broker_name": f"Broker {broker_id}",
        "total_turnover": total_turnover,
        "total_buy_amount": round(total_buy_amount, 2),
        "total_sell_amount": round(total_sell_amount, 2),
        "buy_trades_count": len(buy_trades),
        "sell_trades_count": len(sell_trades),
        "top_bought": top_bought,
        "top_sold": top_sold
    }
