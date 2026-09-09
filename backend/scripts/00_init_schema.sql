-- =============================================================================
-- NEPSE Sathi -- Initial Database Schema (Supabase PostgreSQL)
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. RAW SCRAPES (Safety-net for ingestion pipeline)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS raw_market_scrapes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scrape_type TEXT NOT NULL, -- 'summary', 'indices', 'stocks', 'floorsheet', 'ipo'
    source TEXT NOT NULL,      -- 'nepse', 'merolagani', 'sharesansar'
    raw_payload JSONB NOT NULL,
    scraped_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_raw_scrapes_type_time ON raw_market_scrapes (scrape_type, scraped_at DESC);

-- -----------------------------------------------------------------------------
-- 2. MARKET SUMMARY & BENCHMARKS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS market_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
    nepse_index NUMERIC(10, 2) NOT NULL,
    point_change NUMERIC(10, 2) NOT NULL,
    percentage_change NUMERIC(6, 2) NOT NULL,
    total_turnover NUMERIC(18, 2) NOT NULL DEFAULT 0,
    total_shares BIGINT NOT NULL DEFAULT 0,
    total_transactions BIGINT NOT NULL DEFAULT 0,
    market_status TEXT NOT NULL DEFAULT 'CLOSED', -- 'OPEN', 'CLOSED', 'PRE_OPEN'
    data_status TEXT NOT NULL DEFAULT 'live',     -- 'live', 'delayed', 'eod'
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS market_indices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    index_name TEXT UNIQUE NOT NULL,
    current_value NUMERIC(10, 2) NOT NULL,
    point_change NUMERIC(10, 2) NOT NULL DEFAULT 0,
    percentage_change NUMERIC(6, 2) NOT NULL DEFAULT 0,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. STOCKS & OHLCV HISTORICAL DATA
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stocks (
    symbol TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    sector TEXT NOT NULL,
    current_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    point_change NUMERIC(10, 2) NOT NULL DEFAULT 0,
    percentage_change NUMERIC(6, 2) NOT NULL DEFAULT 0,
    high_price NUMERIC(10, 2) DEFAULT 0,
    low_price NUMERIC(10, 2) DEFAULT 0,
    open_price NUMERIC(10, 2) DEFAULT 0,
    previous_close NUMERIC(10, 2) DEFAULT 0,
    volume BIGINT DEFAULT 0,
    turnover NUMERIC(18, 2) DEFAULT 0,
    pe_ratio NUMERIC(8, 2),
    eps NUMERIC(8, 2),
    book_value NUMERIC(10, 2),
    fifty_two_week_high NUMERIC(10, 2),
    fifty_two_week_low NUMERIC(10, 2),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stocks_sector ON stocks (sector);
CREATE INDEX IF NOT EXISTS idx_stocks_pct_change ON stocks (percentage_change DESC);

CREATE TABLE IF NOT EXISTS stock_prices_ohlcv (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL REFERENCES stocks(symbol) ON DELETE CASCADE,
    date DATE NOT NULL,
    open NUMERIC(10, 2) NOT NULL,
    high NUMERIC(10, 2) NOT NULL,
    low NUMERIC(10, 2) NOT NULL,
    close NUMERIC(10, 2) NOT NULL,
    volume BIGINT NOT NULL DEFAULT 0,
    turnover NUMERIC(18, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_stock_ohlcv_symbol_date UNIQUE (symbol, date)
);

CREATE INDEX IF NOT EXISTS idx_stock_ohlcv_symbol_date ON stock_prices_ohlcv (symbol, date DESC);

-- -----------------------------------------------------------------------------
-- 4. FLOORSHEET & BROKER TRACKING
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS brokers (
    broker_no INTEGER PRIMARY KEY,
    broker_name TEXT NOT NULL,
    address TEXT,
    contact TEXT,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS floorsheet_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_no TEXT NOT NULL,
    symbol TEXT NOT NULL,
    buyer_broker INTEGER NOT NULL,
    seller_broker INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    rate NUMERIC(10, 2) NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    trade_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS idx_floorsheet_symbol_date ON floorsheet_records (symbol, date DESC);
CREATE INDEX IF NOT EXISTS idx_floorsheet_buyer ON floorsheet_records (buyer_broker, date DESC);
CREATE INDEX IF NOT EXISTS idx_floorsheet_seller ON floorsheet_records (seller_broker, date DESC);

-- -----------------------------------------------------------------------------
-- 5. IPO CENTER
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ipos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    symbol TEXT,
    share_type TEXT NOT NULL DEFAULT 'Ordinary Shares', -- 'Ordinary', 'Right', 'Debenture', 'Mutual Fund'
    units BIGINT NOT NULL,
    price_per_share NUMERIC(10, 2) NOT NULL DEFAULT 100.0,
    open_date DATE,
    close_date DATE,
    status TEXT NOT NULL DEFAULT 'UPCOMING', -- 'OPEN', 'UPCOMING', 'CLOSED'
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 6. USER PORTFOLIO & WATCHLIST (With Row Level Security)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL REFERENCES stocks(symbol) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    buy_price NUMERIC(10, 2) NOT NULL CHECK (buy_price > 0),
    buy_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_watchlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL REFERENCES stocks(symbol) ON DELETE CASCADE,
    notes TEXT,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_watchlist_symbol UNIQUE (user_id, symbol)
);

CREATE TABLE IF NOT EXISTS user_journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    trade_type TEXT NOT NULL CHECK (trade_type IN ('BUY', 'SELL')),
    quantity INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    rationale TEXT,
    mistakes TEXT,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------

-- Public tables: Read-only for anonymous & authenticated users
ALTER TABLE raw_market_scrapes ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_indices ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_prices_ohlcv ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE floorsheet_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only for market_summary" ON market_summary FOR SELECT USING (true);
CREATE POLICY "Allow public read-only for market_indices" ON market_indices FOR SELECT USING (true);
CREATE POLICY "Allow public read-only for stocks" ON stocks FOR SELECT USING (true);
CREATE POLICY "Allow public read-only for stock_prices_ohlcv" ON stock_prices_ohlcv FOR SELECT USING (true);
CREATE POLICY "Allow public read-only for brokers" ON brokers FOR SELECT USING (true);
CREATE POLICY "Allow public read-only for floorsheet_records" ON floorsheet_records FOR SELECT USING (true);
CREATE POLICY "Allow public read-only for ipos" ON ipos FOR SELECT USING (true);

-- User data tables: Only the owner can select, insert, update, or delete
ALTER TABLE user_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own portfolio" ON user_portfolios
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own watchlist" ON user_watchlists
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own journal" ON user_journal_entries
    FOR ALL USING (auth.uid() = user_id);
