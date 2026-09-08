from fastapi import APIRouter

router = APIRouter(prefix="/brokers", tags=["Broker Analysis"])

@router.get("")
async def list_brokers():
    return {
        "status": "success",
        "data": [
            {"broker_id": 58, "name": "Naasa Securities", "code": "58"},
            {"broker_id": 45, "name": "Imperial Securities", "code": "45"},
            {"broker_id": 34, "name": "Vision Securities", "code": "34"}
        ]
    }

@router.get("/{broker_id}/analytics")
async def get_broker_analytics(broker_id: int):
    return {
        "status": "success",
        "broker_id": broker_id,
        "name": f"Broker No. {broker_id}",
        "top_bought": [{"symbol": "NABIL", "total_amount": 15000000.0}],
        "top_sold": [{"symbol": "GBIME", "total_amount": 12000000.0}]
    }
