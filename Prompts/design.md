# NEPSE Insight — Merged Design System Blueprint & Theme Specification

This document synthesizes the visual identity and UI design system for **NEPSE Insight**, merging concepts from:
1. `DarkMode_Idea .png` (Chainx dark mode dashboard)
2. `Landing_Page.png` (Skymetrics modern SaaS landing page)
3. `LightMode_Dashboard.png` (Traden financial light mode interface)
4. `To Use Anywhere .png` (Corely dark theme widget layout & gauges)

---

## 1. Visual Identity & Design Principles

- **Financial Clarity & Premium Aesthetics**: Clean typography, high-contrast metrics, tabular figures (`font-mono` / `tabular-nums`) for currency values and price percentages.
- **Dual Mode Excellence**:
  - **Dark Mode**: Rich obsidian background (`#090B10`), dark indigo card surfaces (`#141824`), electric violet accent (`#6366F1`), neon lime indicators (`#22C55E` / `#84CC16`), and gradient highlights for AI features.
  - **Light Mode**: Crisp soft off-white background (`#F8FAFC`), pure white card surfaces (`#FFFFFF`), subtle slate borders (`#E2E8F0`), high-contrast dark slate accents (`#0F172A`) or warm coral (`#F97316`), and pastel pill metric badges.
- **Component Architecture**: Built on top of **shadcn/ui** primitives with custom Tailwind token definitions and block templates (including `dashboard-01`).

---

## 2. Color System & Design Tokens

### Dark Mode Palette
| Token | Hex Value | Usage |
| --- | --- | --- |
| `--bg-base` | `#090B10` | Main application canvas background |
| `--bg-surface` | `#141824` | Primary widget container / card surface |
| `--bg-surface-elevated` | `#1B2030` | Hover states, dropdowns, modal dialogs |
| `--border-subtle` | `rgba(255, 255, 255, 0.08)` | Card borders, dividers |
| `--text-primary` | `#F8FAFC` | Main headings, primary labels |
| `--text-secondary` | `#94A3B8` | Subtitles, muted labels, timestamps |
| `--accent-primary` | `#6366F1` | Primary CTA buttons, active state indicators |
| `--accent-ai-gradient` | `from-indigo-900/60 to-purple-900/60` | AI Robo Advisor highlight card background |
| `--bullish-lime` | `#22C55E` / `#84CC16` | Positive price change, green candle, gain indicator |
| `--bearish-rose` | `#EF4444` | Negative price change, red candle, loss indicator |

### Light Mode Palette
| Token | Hex Value | Usage |
| --- | --- | --- |
| `--bg-base` | `#F8FAFC` | Main background canvas |
| `--bg-surface` | `#FFFFFF` | Main card/widget containers |
| `--bg-surface-elevated` | `#F1F5F9` | Hover states, active tabs |
| `--border-subtle` | `#E2E8F0` | Dividers, subtle card borders |
| `--text-primary` | `#0F172A` | Primary text and headings |
| `--text-secondary` | `#64748B` | Secondary text, labels |
| `--accent-primary` | `#0F172A` / `#F97316` | Main action buttons |
| `--bullish-soft` | `bg-emerald-50 text-emerald-700 border-emerald-200` | Gain pill badge |
| `--bearish-soft` | `bg-rose-50 text-rose-700 border-rose-200` | Loss pill badge |

---

## 3. Top-Level Layout Anatomy

```
+-----------------------------------------------------------------------------------+
|  [Header Ticker Bar] Live NEPSE Ticker: NEPSE 2,450.5 (+1.2%) | BANKING 1,420 (-0.4%) ...|
+-------------------+---------------------------------------------------------------+
|                   |  [Top App Bar] Search stock (⌘K), Notifications, Profile, Language |
|  [Sidebar Nav]    +---------------------------------------------------------------+
|  - Dashboard      |  [Main Content Workspace]                                     |
|  - Market Summary |  +--------------------------+  +-------------------------------+  |
|  - Portfolio      |  | Total Portfolio Value    |  | Market Highlights / Chart     |  |
|  - Stocks         |  | NPR 325,980.65 (+12%)    |  | Interactive TradingView Chart |  |
|  - Technicals     |  +--------------------------+  +-------------------------------+  |
|  - IPO Center     |  +--------------------------+  +-------------------------------+  |
|  - News & Floosht |  | AI Robo Advisor Insight  |  | Top Gainers / Losers Widget   |  |
|  - AI Outlook     |  | (Glowing Violet Card)    |  | (Tabular figures)             |  |
|  - Settings       |  +--------------------------+  +-------------------------------+  |
+-------------------+---------------------------------------------------------------+
```

---

## 4. Key Component Specifications

1. **Header Ticker Bar**:
   - Scrolling horizontally or pinned key index pills (NEPSE, Sensitive, Float, Banking, Hydropower, Microfinance).
   - Each ticker item displays: Logo/Icon + Symbol + Current Index + Change % (Green arrow for bullish, Red arrow for bearish).

2. **Market Summary & KPI Cards**:
   - Large bold currency display with tabular numbers.
   - Trend pill badge (`+12%`, `+NPR 38,112.45 in this year`).
   - Distribution bar charts & progress indicators (e.g. Stocks 65%, Bonds 25%, Mutual Funds 10%).

3. **AI Robo-Advisor Card (`DarkMode_Idea .png`)**:
   - Gradient backdrop with glowing purple orb icon.
   - Text: *"Invest Smarter with Our AI Market Advisor — Get automated management, real-time insights, and personalized NEPSE advice."*
   - CTA button: *"Try Outlook"* with subtle glow hover effect.

4. **Data Freshness Badges**:
   - **LIVE**: Green pulsing dot + `"LIVE"` (Market hours 11:00 AM - 3:00 PM NST).
   - **DELAYED**: Amber dot + `"15m DELAYED"`.
   - **EOD**: Blue dot + `"EOD (As of [Date])"`.

---

## 5. shadcn/ui & Theme Integration

- Configure `components.json` with style `default` or `new-york`.
- Add `dashboard-01` components via `npx shadcn@latest add dashboard-01` during Phase 0 setup.
- Custom extensions added to `frontend/src/components/ui/` for financial sparklines, order books, and floorsheet tables.