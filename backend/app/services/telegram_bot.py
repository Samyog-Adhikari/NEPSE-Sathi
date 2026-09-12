import asyncio
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import httpx

from app.core.config import settings
from app.core.database import db
from app.core.logging import logger
from app.pipeline.runner import get_market_status_detail

class TelegramBotService:
    def __init__(self):
        self.token = settings.telegram_bot_token
        self.default_chat_id = settings.telegram_chat_id
        self.is_running = False
        self.offset = 0
        self.bot_info: Optional[Dict[str, Any]] = None
        self.last_message_at: Optional[datetime] = None

    @property
    def is_configured(self) -> bool:
        return bool(self.token)

    async def get_me(self) -> Optional[Dict[str, Any]]:
        if not self.is_configured:
            return None
        url = f"https://api.telegram.org/bot{self.token}/getMe"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    if data.get("ok"):
                        self.bot_info = data.get("result")
                        return self.bot_info
        except Exception as e:
            logger.error(f"Failed to get Telegram bot info: {e}")
        return None

    async def send_message(self, chat_id: str | int, text: str, parse_mode: str = "Markdown") -> bool:
        if not self.is_configured:
            return False
        url = f"https://api.telegram.org/bot{self.token}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": parse_mode,
            "disable_web_page_preview": True
        }
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200 and res.json().get("ok"):
                    return True
                else:
                    logger.warning(f"Telegram sendMessage returned: {res.text}")
        except Exception as e:
            logger.error(f"Telegram send_message failed: {e}")
        return False

    async def send_alert(self, text: str) -> bool:
        """Sends a notification or alert to the default configured admin/channel chat ID."""
        if not self.default_chat_id:
            logger.warning("Telegram default_chat_id not configured")
            return False
        return await self.send_message(self.default_chat_id, text)

    async def handle_update(self, update: Dict[str, Any]):
        """Processes an incoming Telegram update/message."""
        message = update.get("message") or update.get("edited_message")
        if not message:
            return

        chat = message.get("chat", {})
        chat_id = chat.get("id")
        text = (message.get("text") or "").strip()
        user = message.get("from", {})
        user_name = user.get("first_name", "Investor")

        if not chat_id or not text:
            return

        self.last_message_at = datetime.now(timezone.utc)
        logger.info(f"Telegram Bot received message from {user_name} (chat_id: {chat_id}): {text}")

        # Command parsing
        text_lower = text.lower()

        if text_lower in ("/start", "/help", "help"):
            reply = (
                f"🇳🇵 *Namaste, {user_name}! Welcome to NEPSE Sathi Bot*\n\n"
                f"Your intelligent companion for the Nepal Stock Exchange (NEPSE).\n\n"
                f"*Available Commands:*\n"
                f"• `/nepse` or `/market` — Live NEPSE Index & market status\n"
                f"• `/gainers` or `/top` — Top 5 gainers of the session\n"
                f"• `/losers` — Top 5 losers of the session\n"
                f"• `/sectors` — Sectoral index performance\n"
                f"• `/stock <SYMBOL>` — Check live price (e.g. `/stock NABIL`)\n"
                f"• Or just type any stock symbol (e.g. `NICA`, `SHIVM`, `HDL`)\n\n"
                f"🌐 *Web Terminal:* [Open NEPSE Sathi](https://nepse-sathi.vercel.app)"
            )
            await self.send_message(chat_id, reply)
            return

        if text_lower in ("/nepse", "/market", "nepse", "market"):
            await self._reply_market_summary(chat_id)
            return

        if text_lower in ("/gainers", "/top", "gainers", "top"):
            await self._reply_movers(chat_id, is_gainers=True)
            return

        if text_lower in ("/losers", "losers"):
            await self._reply_movers(chat_id, is_gainers=False)
            return

        if text_lower in ("/sectors", "sectors"):
            await self._reply_sectors(chat_id)
            return

        # Handle /stock <SYMBOL> or single ticker input (e.g. "NABIL", "SHIVM")
        match = re.match(r"^/stock\s+([A-Za-z0-9]+)$", text, re.IGNORECASE)
        symbol_query = match.group(1).upper() if match else None

        if not symbol_query and len(text.split()) == 1 and text.isalnum() and len(text) <= 10:
            symbol_query = text.upper()

        if symbol_query:
            await self._reply_stock_quote(chat_id, symbol_query)
            return

        # Fallback response
        fallback = (
            f"❓ I didn't recognize that command.\n\n"
            f"Try `/nepse` for market overview, `/gainers` for top stocks, or type a stock symbol like `NABIL`."
        )
        await self.send_message(chat_id, fallback)

    async def _reply_market_summary(self, chat_id: str | int):
        try:
            status_info = get_market_status_detail()
            rows = await db.select("market_summary", order="date.desc", limit=1)
            summary = rows[0] if rows else {}

            index_val = float(summary.get("nepse_index", 2560.84))
            pt_change = float(summary.get("point_change", 18.07))
            pct_change = float(summary.get("percentage_change", 0.71))
            turnover = float(summary.get("turnover", 4401371756.0))

            sign = "+" if pt_change > 0 else ""
            status_emoji = "🟢" if status_info.get("is_open") else "🔴"
            status_text = "OPEN" if status_info.get("is_open") else "CLOSED"

            turnover_fmt = (
                f"Rs. {(turnover / 10000000):.2f} Cr"
                if turnover >= 10000000
                else f"Rs. {(turnover / 100000):.2f} Lakh"
            )

            reply = (
                f"📈 *NEPSE Market Summary*\n\n"
                f"• *Index:* `{index_val:.2f}` ({sign}{pt_change:.2f} / {sign}{pct_change:.2f}%)\n"
                f"• *Status:* {status_emoji} *{status_text}*\n"
                f"• *Turnover:* {turnover_fmt}\n"
                f"• *Session Time:* {status_info.get('current_nepal_time', '11:00-15:00 NPT')}\n\n"
                f"ℹ️ _{status_info.get('reason', '')}_\n\n"
                f"👉 Type a symbol like `NABIL` for stock details."
            )
            await self.send_message(chat_id, reply)
        except Exception as e:
            logger.error(f"Telegram _reply_market_summary error: {e}")
            await self.send_message(chat_id, "⚠️ Failed to fetch market summary. Please try again.")

    async def _reply_stock_quote(self, chat_id: str | int, symbol: str):
        try:
            res = await db.select("stocks", filters={"symbol": f"eq.{symbol.upper()}"}, single=True)
            if not res:
                # Try fuzzy matching
                all_s = await db.select("stocks", limit=500)
                matched = [s for s in all_s if symbol in s.get("symbol", "").upper()]
                if matched:
                    res = matched[0]
                else:
                    await self.send_message(chat_id, f"❌ Stock `{symbol}` was not found in the NEPSE directory.")
                    return

            sym = res.get("symbol")
            name = res.get("company_name", sym)
            ltp = float(res.get("current_price", 0.0))
            pt_change = float(res.get("point_change", 0.0))
            pct_change = float(res.get("percentage_change", 0.0))
            high = float(res.get("high_price") or ltp)
            low = float(res.get("low_price") or ltp)
            open_p = float(res.get("open_price") or ltp)
            volume = int(res.get("volume", 0))
            turnover = float(res.get("turnover", 0.0))

            sign = "+" if pt_change > 0 else ""
            indicator = "🟢" if pt_change > 0 else "🔴" if pt_change < 0 else "🔵"

            reply = (
                f"{indicator} *{sym}* — {name}\n\n"
                f"• *LTP:* `Rs. {ltp:.2f}`\n"
                f"• *Change:* `{sign}{pt_change:.2f}` (`{sign}{pct_change:.2f}%`)\n"
                f"• *Range:* `Rs. {low:.2f}` – `Rs. {high:.2f}`\n"
                f"• *Open:* `Rs. {open_p:.2f}`\n"
                f"• *Volume:* `{volume:,}` shares\n"
                f"• *Turnover:* `Rs. {turnover:,.2f}`\n\n"
                f"📊 [View Chart & Technicals](https://nepse-sathi.vercel.app/en/technicals?symbol={sym})"
            )
            await self.send_message(chat_id, reply)
        except Exception as e:
            logger.error(f"Telegram _reply_stock_quote error: {e}")
            await self.send_message(chat_id, f"⚠️ Error loading stock `{symbol}`.")

    async def _reply_movers(self, chat_id: str | int, is_gainers: bool):
        try:
            order = "percentage_change.desc" if is_gainers else "percentage_change.asc"
            rows = await db.select("stocks", order=order, limit=5)
            title = "🚀 *Top 5 Gainers*" if is_gainers else "📉 *Top 5 Losers*"

            lines = [title, ""]
            for r in rows:
                sym = r.get("symbol")
                ltp = float(r.get("current_price", 0.0))
                pct = float(r.get("percentage_change", 0.0))
                sign = "+" if pct > 0 else ""
                lines.append(f"• *{sym}:* `Rs. {ltp:.2f}` ({sign}{pct:.2f}%)")

            lines.append("\n👉 Type any symbol to see full order details.")
            await self.send_message(chat_id, "\n".join(lines))
        except Exception as e:
            logger.error(f"Telegram _reply_movers error: {e}")
            await self.send_message(chat_id, "⚠️ Failed to fetch top movers.")

    async def _reply_sectors(self, chat_id: str | int):
        try:
            indices = await db.select("market_indices", order="index_name.asc", limit=20)
            lines = ["📊 *NEPSE Sector Indices*", ""]
            for idx in indices:
                name = idx.get("index_name", "")
                if name in ("NEPSE Index", "nepse_index"):
                    continue
                val = float(idx.get("current_value", 0.0))
                pct = float(idx.get("percentage_change", 0.0))
                sign = "+" if pct > 0 else ""
                lines.append(f"• *{name.replace(' Index', '')}:* `{val:.2f}` ({sign}{pct:.2f}%)")

            await self.send_message(chat_id, "\n".join(lines))
        except Exception as e:
            logger.error(f"Telegram _reply_sectors error: {e}")
            await self.send_message(chat_id, "⚠️ Failed to fetch sector performance.")

    async def start_polling(self):
        """Asynchronous long-polling loop for Telegram updates."""
        if not self.is_configured:
            logger.info("Telegram Bot token not set. Skipping polling.")
            return

        bot = await self.get_me()
        if not bot:
            logger.warning("Could not authenticate Telegram Bot. Polling disabled.")
            return

        logger.info(f"Telegram Bot @{bot.get('username')} started polling...")
        self.is_running = True

        while self.is_running:
            try:
                url = f"https://api.telegram.org/bot{self.token}/getUpdates"
                params = {"offset": self.offset, "timeout": 20}
                async with httpx.AsyncClient(timeout=30.0) as client:
                    res = await client.get(url, params=params)
                    if res.status_code == 200:
                        data = res.json()
                        if data.get("ok"):
                            updates = data.get("result", [])
                            for update in updates:
                                self.offset = update["update_id"] + 1
                                asyncio.create_task(self.handle_update(update))
                    elif res.status_code == 409:
                        # Another instance polling, sleep
                        await asyncio.sleep(5)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Telegram polling exception: {e}")
                await asyncio.sleep(5)

    def stop_polling(self):
        self.is_running = False

telegram_bot = TelegramBotService()
