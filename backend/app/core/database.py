from typing import Any, Dict, List, Optional
import httpx
from app.core.config import settings
from app.core.logging import logger

class SupabaseDB:
    """
    Lightweight, asynchronous Supabase PostgREST client using httpx.
    Supports queries, filters, inserts, and conflict-safe upserts.
    """

    def __init__(self):
        self.base_url = f"{settings.supabase_url}/rest/v1"
        self.headers = {
            "apikey": settings.supabase_service_role_key,
            "Authorization": f"Bearer {settings.supabase_service_role_key}",
            "Content-Type": "application/json"
        }

    async def select(
        self,
        table: str,
        select: str = "*",
        filters: Optional[Dict[str, str]] = None,
        order: Optional[str] = None,
        limit: Optional[int] = None,
        single: bool = False
    ) -> Any:
        params = {"select": select}
        if filters:
            params.update(filters)
        if order:
            params["order"] = order
        if limit:
            params["limit"] = str(limit)

        headers = dict(self.headers)
        if single:
            headers["Accept"] = "application/vnd.pgrst.object+json"

        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(f"{self.base_url}/{table}", params=params, headers=headers)
            if res.status_code not in (200, 206):
                logger.error(f"Supabase select error on {table}: {res.status_code} - {res.text}")
                return None if single else []
            return res.json()

    async def insert(
        self,
        table: str,
        records: List[Dict[str, Any]] | Dict[str, Any],
        upsert: bool = False,
        on_conflict: Optional[str] = None
    ) -> bool:
        headers = dict(self.headers)
        if upsert:
            headers["Prefer"] = "resolution=merge-duplicates,return=minimal"
        else:
            headers["Prefer"] = "return=minimal"

        url = f"{self.base_url}/{table}"
        params = {}
        if on_conflict:
            params["on_conflict"] = on_conflict

        payload = [records] if isinstance(records, dict) else records

        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.post(url, params=params, json=payload, headers=headers)
            if res.status_code not in (200, 201, 204):
                logger.error(f"Supabase insert/upsert error on {table}: {res.status_code} - {res.text}")
                return False
            return True

    async def upsert(
        self,
        table: str,
        records: List[Dict[str, Any]] | Dict[str, Any],
        on_conflict: Optional[str] = None
    ) -> bool:
        return await self.insert(table, records, upsert=True, on_conflict=on_conflict)

    async def delete(self, table: str, filters: Dict[str, str]) -> bool:
        """Deletes rows matching filters from table."""
        headers = dict(self.headers)
        headers["Prefer"] = "return=minimal"
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.delete(f"{self.base_url}/{table}", params=filters, headers=headers)
            if res.status_code not in (200, 204):
                logger.error(f"Supabase delete error on {table}: {res.status_code} - {res.text}")
                return False
            return True

db = SupabaseDB()
