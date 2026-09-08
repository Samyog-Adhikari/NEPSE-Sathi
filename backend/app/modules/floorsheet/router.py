from fastapi import APIRouter

router = APIRouter(prefix="/floorsheet", tags=["Floorsheet Analysis"])

@router.get("")
async def get_floorsheet(symbol: str = None, broker_id: int = None):
    return {
        "status": "success",
        "data": [
            {
                "contract_no": "20260908012345",
                "symbol": "NABIL",
                "buyer_broker": 58,
                "seller_broker": 45,
                "quantity": 500,
                "rate": 520.0,
                "amount": 260000.0,
                "time": "14:52:10"
            }
        ]
    }
