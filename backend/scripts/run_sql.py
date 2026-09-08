import asyncio
import httpx
import sys
sys.path.insert(0, ".")
from app.core.config import settings

SQL = """
CREATE TABLE IF NOT EXISTS news_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'sharesansar',
    source_url TEXT,
    category TEXT DEFAULT 'general',
    related_symbols TEXT[],
    published_date DATE,
    published_text TEXT,
    summary TEXT,
    importance TEXT DEFAULT 'normal',
    scraped_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_category ON news_items(category);
CREATE INDEX IF NOT EXISTS idx_news_published ON news_items(published_date DESC);

CREATE TABLE IF NOT EXISTS technical_indicators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    symbol TEXT NOT NULL,
    indicator TEXT NOT NULL,
    timeframe TEXT NOT NULL DEFAULT '1D',
    value DOUBLE PRECISION NOT NULL,
    signal TEXT,
    reason TEXT,
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(symbol, indicator, timeframe)
);

CREATE INDEX IF NOT EXISTS idx_technicals_symbol ON technical_indicators(symbol);
"""

async def run():
    url = f"{settings.supabase_url}/rest/v1/rpc/exec_sql"
    headers = {
        "apikey": settings.supabase_service_role_key,
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "Content-Type": "application/json"
    }
    # Try the SQL editor endpoint
    url2 = f"{settings.supabase_url}/pg"
    
    # Use the management API to run SQL
    # Supabase project ref from URL
    ref = settings.supabase_url.replace("https://", "").split(".")[0]
    mgmt_url = f"https://api.supabase.com/v1/projects/{ref}/database/query"
    
    print(f"Project ref: {ref}")
    print("Please run the following SQL in your Supabase Dashboard SQL Editor:")
    print("Go to: https://supabase.com/dashboard/project/" + ref + "/sql/new")
    print()
    print(SQL)

asyncio.run(run())
