import asyncio, httpx, sys
sys.path.insert(0, ".")
from app.core.config import settings

async def check():
    url = f"{settings.supabase_url}/rest/v1/"
    headers = {
        "apikey": settings.supabase_service_role_key,
        "Authorization": f"Bearer {settings.supabase_service_role_key}"
    }
    async with httpx.AsyncClient() as c:
        r = await c.get(url, headers=headers)
        spec = r.json()
        defs = spec.get("definitions", {})
        for t in defs:
            if "news" in t.lower():
                props = list(defs[t].get("properties", {}).keys())
                print(f"{t}: {props}")

asyncio.run(check())
