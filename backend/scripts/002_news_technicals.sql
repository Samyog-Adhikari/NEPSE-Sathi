-- News & Announcements table for NEPSE Sathi
-- Per BLUEPRINT_CHECKS.md §5.5: headline, source, timestamp, category, related symbols, original link

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

-- Index for fast lookups by category and date
CREATE INDEX IF NOT EXISTS idx_news_category ON news_items(category);
CREATE INDEX IF NOT EXISTS idx_news_published ON news_items(published_date DESC);

-- Technical indicators cache table for NEPSE Sathi
-- Per BLUEPRINT_CHECKS.md §5.3: SMA, EMA, RSI, MACD, Bollinger Bands computed server-side

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
