# NEPSE Insight — Agent Execution Playbook

> **STATUS UPDATE (Frontend Phase 2 & Phase 3 COMPLETED):**
> - **Backend (100% Completed & Verified)**: Autonomous scraping pipeline, `MarketDataProvider`, all 14 domain modules live against Supabase.
> - **Frontend Phase 2 (Completed)**: Theme system, design tokens, dark/light mode, mobile navigation, responsive layouts, unified CTA banners, and brand logo sizing.
> - **Frontend Phase 3 (Completed)**:
>   - Public marketing & informational pages (Home, Features, About Us with alternating rhythm, Contact with FAQ anchor, Terms, Privacy).
>   - Supabase Auth: Split-pane Login & Register pages matching the design mockup, Google OAuth integration, password recovery, route protection.
>   - Full bilingual support (`/en` and `/ne`) with language switcher.
> - **CURRENT ACTIVE FOCUS: Phase 4 (User Dashboard & Core Features)**:
>   - Building the interactive User Dashboard (`/dashboard`), Market Overview (`/market`), Stock Analysis (`/stocks`), Floorsheet (`/floorsheet`), and Portfolio tools, followed by the Admin Panel (`/admin`).

> **Companion document:** `BLUEPRINT_CHECKS.md` — this file tells the agent *what order to do things in and when to stop*; `BLUEPRINT_CHECKS.md` tells it *exactly how* to build each piece (code patterns, schemas, security checklists, module reference). Every phase below points back to specific sections of `BLUEPRINT_CHECKS.md`. Read `BLUEPRINT_CHECKS.md` in full before Phase 0. `BLUEPRINT_CHECKS.md` is now self-contained — it was originally formalized from `prd.md`/`trd.md`, which have since been removed; do not treat this playbook as depending on files that no longer exist.

This is a **production-readiness** playbook, not a prototype playbook. It is intentionally long and phase-heavy — a financial-data app handling user portfolios, AI-generated market outlooks, and scraped third-party data has a wide attack surface and a real cost to getting security, data-freshness, or the "not financial advice" boundary wrong. Fifteen phases (0–14) is the right size for that: each phase is scoped to one thing that can be fully verified before the next thing is allowed to depend on it. Collapsing phases to hit a smaller number would just mean bundling unrelated verification together and losing the ability to catch a problem before it's buried under three more phases of code built on top of it.

---

## 1. How to use this file

This is a **phase-gated** playbook. The rules are absolute:

1. **Never start a phase until the previous phase's Definition of Done is fully met and the person has confirmed the manual check for that phase.** Not "mostly done" — fully done. If something in a phase is blocked, say so explicitly and stop; do not skip ahead to unblock yourself by starting later-phase work.
2. **At the end of every phase**, stop and output a **Manual Check** block (format below) telling the person exactly what to open, click, run, or look at, and what a passing result looks like. Then wait for their confirmation before touching Phase N+1. If the coding environment (e.g. Antigravity or any other agentic IDE) shows its own "approve to proceed" prompt on top of this, that is expected and correct — it is a second, independent gate, not a duplicate of this one, and it should never be suppressed, auto-approved, or configured away. Two people/systems asking "are you sure" is a feature in a production build, not friction to remove.
3. If new work is discovered mid-phase that wasn't anticipated (a missing dependency, a config gap, a bug in something already "done"), fix it within the current phase rather than deferring it silently — but don't let it become an excuse to wander into later-phase scope.
4. Every phase's actual technical standard — schemas, security rules, error shapes, folder locations — comes from `BLUEPRINT_CHECKS.md`. This file does not restate that content; it references the section number. If the two ever conflict, `BLUEPRINT_CHECKS.md` wins on *how*, this file wins on *order and gating*.
5. **Capacitor/mobile work (BLUEPRINT_CHECKS.md §16) is explicitly out of scope for every phase below except Phase 14.** Do not propose it, scaffold `android/`/`ios/`, or add Capacitor dependencies unless the person explicitly says they're starting that final-stage conversion after the web app is fully shipped.

### Manual Check block format (use exactly this shape at the end of every phase)

```
## ✅ Phase <N> complete — manual check required before Phase <N+1>

**What I built:** <1–2 sentence summary>

**Check this yourself:**
1. <specific action — command to run, URL to open, button to click>
   → Expect: <what a pass looks like>
2. <next check>
   → Expect: <...>

**Do not proceed to Phase <N+1> until you confirm these pass.** Reply "confirmed" or tell me what's broken.
```

---

## 2. Standing rules that apply in every phase

- **Python: venv only, always.** Before any `pip install` or backend command, verify a virtual environment is active (`backend/.venv`). If it isn't, create it (`python -m venv .venv`) and activate it first. Never install a Python package globally, and never let `requirements.txt` get installed outside the venv — check `which python`/`which pip` resolves inside `.venv` before running anything.
- **One theme, applied everywhere, from the first page onward.** The design tokens, typography scale, and component primitives established in Phase 2 are the only ones used for the rest of the project. No page introduces its own colors, spacing scale, font, or one-off component style. If a new UI need arises later that the existing token system doesn't cover, extend the token system itself (in the shared theme file) rather than styling around it locally in one page.
- **Version safety rule applies throughout** — see `BLUEPRINT_CHECKS.md`'s opening section. Never hardcode a dependency version from memory; verify before installing.
- **Bilingual is not a later bolt-on.** From the phase it's introduced (Phase 3) onward, every new page/route/component built in every subsequent phase must work correctly in both `/ne` and `/en` before that phase is considered done — this is part of each phase's Definition of Done, not a separate cleanup pass at the end.
- **No broker credentials, ever, in any phase.** If any phase's work would require storing a broker username/password/OTP, stop and flag it — that's a hard product boundary, not an implementation detail to solve.
- **Live/delayed/EOD market data is fetched only through the `MarketDataProvider` interface** (`BLUEPRINT_CHECKS.md` §13.1) — no module ever imports the scraper (or, later, an official NEPSE API client) directly. This is what makes the data source swappable later without touching module code, so it is enforced from the module's very first line, not cleaned up afterward.
- **Security is not a phase you visit once.** Every phase below has its own "Security checklist for this phase" line pulling specific items from `BLUEPRINT_CHECKS.md` §7/§10. Phase 8 (Full-Stack Security Hardening Pass) is a formal, adversarial *re-verification* of everything already built — it is not the first time security gets addressed.

---

## 3. Non-negotiable rules for this audit pass

These rules exist so that "done" always means actually done, and so nothing here can be quietly bypassed by the AI's own judgment call in the moment. They override convenience every time. If following one of them would make a task slower, the rule still wins.

1. **No phase, module, or checklist item is ever marked complete on the AI's own assertion alone.** Every Definition of Done claim must be backed by an actual command run with its real output shown (test output, `curl` response, audit tool output), not a description of what should happen. "This should work now" is not done.
2. **The person's explicit confirmation is required before starting the next phase or module, every single time, with no exceptions** — not for phases that feel small, not for "obviously safe" fixes, not under time pressure. If Antigravity (or any other tool) pops up its own approval prompt before proceeding, approve it and move on — that prompt doing its job every time is correct behavior, not a bug to route around. It exists for the same reason this file's Manual Check blocks exist.
3. **Security items belonging to a specific phase are implemented in that phase, not deferred wholesale to Phase 8.** Env/secrets hygiene in Phase 0, CORS/auth-header correctness in Phase 1, real auth/session security in Phase 3, RLS/ownership/input-validation per module in Phase 4, and so on — Phase 8 re-verifies and adversarially probes all of it, it doesn't introduce it for the first time.
4. **No dependency version is ever taken from memory or copied out of this file or `BLUEPRINT_CHECKS.md`.** Every install verifies the current version per the Version Safety Rule, every time, even for packages that feel obviously stable.
5. **No RLS policy, ownership check, CORS allowlist entry, rate limit, or input validation is ever removed, loosened, or worked around to make a feature pass faster or a test go green.** If a feature genuinely cannot work without weakening one of these, stop and flag it to the person as a real design conflict — never silently ship the weaker version.
6. **Broker credentials (username, password, OTP, session token) are never stored, logged, or added as a schema field, in any phase, for any reason — including "just temporarily to test."** This is enforced by the schema never having the columns, not by a runtime check someone could bypass.
7. **Mock/placeholder data is always visibly labeled as such in the UI and never silently presented as live data** outside the phases where it is explicitly allowed as a stand-in (before Phase 5 ships real scraped data).
8. **The AI outlook/explainer's required disclaimer text and response fields (timeframe, confidence, factors, warning) are never shortened, removed, or made conditional** to save space, simplify a response shape, or pass a test faster. They ship on every single response, unconditionally.
9. **Any conflict between what the blueprint specifies and what would be faster or simpler to build is resolved in the blueprint's favor**, or is raised to the person as an explicit deviation request with a reason — never silently resolved by quietly picking the easier path and moving on.
10. **If a phase's Definition of Done cannot be fully met, that is stated plainly** ("X is blocked because Y, here's what I need") — it is never marked complete with the gap buried as a caveat inside the Manual Check block instead.
11. **Findings from `pip-audit`/`npm audit`/manual pen-test-style checks are never explained away or downgraded in severity without the person independently confirming that assessment.** "It's probably fine because it's dev-only" is a hypothesis to bring to the person, not a decision the AI makes unilaterally.

---

## Phase 0 — Environment & Repository Setup

**Goal:** A clean, correctly structured, empty-but-runnable skeleton. No features yet.

**Tasks** (per `BLUEPRINT_CHECKS.md` §2, §3):
- Create the full repository folder structure from §2 (`frontend`, `backend`, `.github/workflows`, `postman`, `docs`) — empty module folders are fine at this stage, just the skeleton.
- Initialize git, add the `.gitignore` from §2 exactly as specified.
- Backend: create `backend/.venv`, activate it, initialize `requirements.txt`/`pyproject.toml`, install FastAPI + the core dependencies needed to boot an empty app (verify latest versions per the Version Safety Rule — do not copy any number from `BLUEPRINT_CHECKS.md`).
- Frontend: scaffold Next.js (App Router) in `frontend/` (with admin route integrated under `/admin`). Install core dependencies (Tailwind, TanStack Query, Zod, React Hook Form, DOMPurify) — again, verify current versions, don't hardcode.
- Create `.env.example` for `backend/` and `frontend/` exactly matching §3's field lists (placeholder values only).
- Create real local `.env` files (gitignored) with actual dev-time values the person supplies (Supabase project URL/keys, etc.) — ask for these if not already provided.
- Wire up the Pydantic Settings (`backend/app/core/config.py`) and Zod env validation (`frontend/src/lib/env.ts`) from §3 so both apps crash loudly on misconfiguration rather than running with bad env.
- Confirm both apps boot: FastAPI serves `/health` returning `200`; Next.js dev server renders the dashboard and `/admin` routes cleanly.

**Security checklist for this phase** (§7 "Environment & Configuration"): zero secrets hardcoded in source; `.env`/`.env.*` correctly gitignored with only `.env.example` committed; env validated at startup so both apps fail loudly on bad config; confirm `SUPABASE_SERVICE_ROLE_KEY` is only ever referenced in `backend/`, never in `frontend/`, from the very first commit.

**Definition of Done:**
- Folder structure matches §2 exactly.
- `git status` shows no `.env`, no `node_modules/`, no `.venv/` tracked.
- Backend boots inside its venv, `GET /health` returns `200`.
- Frontend dev server boots with no console errors.
- Both `.env.example` files committed with placeholders only.

**Manual Check for the person:**
1. Run `git status` — confirm no secrets/dependencies are staged.
2. Run the backend inside its venv and hit `/health` in a browser or `curl` — confirm `200`.
3. Run the frontend dev server and open it — confirm it loads with no red console errors.
4. Open `.env.example` in both apps — confirm every variable listed in `BLUEPRINT_CHECKS.md` §3 is present with a placeholder, and confirm the real `.env` files are *not* visible in `git status`.
5. `grep -r "SUPABASE_SERVICE_ROLE" frontend` — confirm zero matches.

---

## Phase 1 — API/Route Connectivity Harness

**Goal:** Before building a single real feature, prove the two servers can actually talk to each other, auth headers pass through correctly, and CORS is configured right — with a simple, visual UI to check it, not just terminal `curl` calls.

This phase exists specifically because a stack split across two servers (Next.js + FastAPI) fails silently in a dozen small ways (CORS misconfig, env pointing at the wrong port, JWT header not attached) — better to catch all of that now, on a throwaway screen, than while debugging a real feature later.

**Tasks:**
- Backend: add 3–4 trivial test routes beyond `/health` — e.g. `GET /api/v1/dev/ping` (no auth), `GET /api/v1/dev/whoami` (auth required, echoes the decoded JWT claims), `POST /api/v1/dev/echo` (validates a small Pydantic body and echoes it back), one intentionally-erroring route to confirm the standard error shape (§6) renders correctly end to end.
- Frontend: build one simple, clean internal page — e.g. `/dev/api-check` — that is **not** part of the real product UI (plain, functional, not themed with product branding since Phase 2 hasn't happened yet) with:
  - A button per test route, showing request status, response body, and timing.
  - A visible pass/fail indicator per route (green check / red X), not just raw JSON dumped on screen.
  - A section that calls the *auth-required* route both logged-out (expect `401 UNAUTHORIZED`) and logged-in (expect `200` with echoed claims) — this proves the Supabase JWT is actually reaching FastAPI correctly.
  - A section that deliberately triggers the error-shape test route and asserts the response matches the `{ success: false, error: { code, message } }` shape from §6.
- Confirm CORS is correctly scoped (§4, §7) — the check page should fail loudly and clearly if CORS is misconfigured, not hang or give an opaque browser error.

**Security checklist for this phase** (§7 "API Security" / "Authentication & Authorization", relevant items only): CORS uses an explicit origin allowlist, never `*` with credentials; JWTs are verified against the real Supabase secret (not merely decoded/trusted); the auth-required test route correctly distinguishes `TOKEN_EXPIRED`/`TOKEN_INVALID`/`UNAUTHORIZED` rather than collapsing everything to a generic 401.

**Definition of Done:**
- Every test route is reachable from the check page with a clear pass/fail state.
- Auth-required route correctly returns `401` unauthenticated and `200` with correct claims when authenticated.
- Error-shape route confirms the standard error JSON shape end to end.
- CORS works with no console errors when frontend and backend run on their expected local ports.

**Manual Check for the person:**
1. Open `/dev/api-check` in the browser with the backend running.
2. Click through every test button — confirm each shows a clear pass/fail, not just raw output you have to interpret.
3. Log out and click the auth-required test — confirm it shows `401` clearly. Log in and click it again — confirm it shows `200` with your correct user info echoed back.
4. Open browser dev tools → Network tab — confirm no CORS errors appear on any request.
5. Confirm this page is honestly ugly/utilitarian right now — that's correct for this phase; it gets no visual polish until Phase 2's theme exists, and it should never be reachable from the real product navigation later.

---

## Phase 2 — Design System & Theme Foundation

**Goal:** Establish the single source of visual truth for the entire app before any real page is built, so nothing downstream ever has to invent its own styling.

**Tasks** (per `BLUEPRINT_CHECKS.md` §1, TRD §2 as referenced there):
- Define the design token system on top of shadcn/ui primitives — color palette (including live/delayed/EOD and up/down semantic colors, since those carry real information per the blueprint's design direction), typography scale with a proper Devanagari-capable font pairing, spacing scale, radius, and a tabular-figure numeral treatment for prices.
- Build this as a single themeable layer (Tailwind config + a small number of shared primitive components) that every future feature imports from — not a per-page style choice.
- Build a small internal **style guide / component showcase page** (e.g. `/dev/style-guide`, also not part of real product nav) rendering every primitive (buttons, cards, price tiles with live/delayed/EOD states, form inputs, the data-freshness badge type from §8) so the person can visually confirm the whole system in one place before it's used anywhere real.
- Apply the theme to the layout shell (header/nav/footer) that every real page will sit inside from Phase 4 onward.
- Do **not** yet build real feature pages — this phase is the foundation only.

**Security checklist for this phase:** none of §7/§10's items land specifically here, but start the Content-Security-Policy header scaffolding now (even loosely scoped) in `next.config.js`/hosting config, since retrofitting a CSP after dozens of pages exist is far more painful than starting it while the shell is still small (§10 will tighten and verify it fully).

**Definition of Done:**
- One Tailwind/token config drives all colors, type, and spacing — no hardcoded hex/px values scattered in components.
- Style guide page renders every core primitive correctly, including the required live/delayed/EOD and up/down states.
- Base layout shell (nav/header/footer) is themed and reusable.

**Manual Check for the person:**
1. Open `/dev/style-guide` — visually confirm the look matches what you want for a NEPSE-focused product (not a generic template), per the "must not look vibe-coded" direction.
2. Confirm Devanagari text renders correctly and legibly next to Latin text in the type samples.
3. Confirm price/number samples use aligned tabular figures, not a proportional font that makes columns of numbers jagged.
4. Confirm the live/delayed/EOD and up/down color treatments are visually distinct and make sense at a glance.
5. This is the moment to request any visual changes — once later phases start building real pages on top of this theme, changing it becomes a bigger job. Confirm you're happy with it now.

---

## Phase 3 — Auth & Bilingual Infrastructure

**Goal:** The two cross-cutting systems every later feature depends on — authentication and locale routing — working correctly, before any feature module is built on top of them.

**Tasks** (per `BLUEPRINT_CHECKS.md` §8 for auth, §12 for bilingual):
- Wire up Supabase Auth: `AuthProvider`, `RequireAuth`, login/signup/logout pages using the themed components from Phase 2.
- Wire up `next-intl` with `/ne` and `/en` locale-prefixed routing, applied to the base layout shell from Phase 2.
- Decide and document the Nepali numerals/BS-calendar vs. Arabic numerals/AD-dates question from §12 — this is a real decision, make it now since date/number components built in every later phase depend on it.
- Build a locale switcher in the themed nav.
- Re-run the Phase 1 API check page in both locales and both auth states to confirm nothing regressed.

**Security checklist for this phase** (§7 "Authentication & Authorization", §10): JWTs verified on every protected route with correct error-code distinctions carried through from Phase 1; `RequireAuth` wrapper actually blocks render (not just redirects after a flash of protected content); no session token or auth object ever hits `console.log`, including in dev-mode debug output; logout actually invalidates the client-side session rather than just clearing local UI state.

**Definition of Done:**
- Login/signup/logout works against Supabase.
- `RequireAuth` correctly blocks unauthenticated access to a placeholder protected route.
- `/ne` and `/en` both render the base layout shell correctly, with a working locale switcher.
- Numerals/date-format decision is made and written down (append it to `BLUEPRINT_CHECKS.md` §12 as a note, since that section currently flags it as an open decision).

**Manual Check for the person:**
1. Sign up, log out, log back in — confirm the flow works and errors (wrong password, etc.) display cleanly in the Phase 2 theme.
2. Visit a protected placeholder route logged out — confirm you're redirected, not shown a broken page even briefly.
3. Switch between `/ne` and `/en` — confirm the whole shell (nav, buttons, placeholder text) actually changes language, not just some of it.
4. Confirm the numerals/date decision reads correctly to you as a Nepali-market user — this is the point to override it if the default choice feels wrong.
5. Open dev tools console during login/logout — confirm no token, session object, or claim data is ever printed.

---

## Phase 4 — Module Build-Out (one module at a time)

**Goal:** Build each PRD-defined module completely, one at a time, in the order below — never two in parallel, never starting the next before the current one's Definition of Done is met.

**Order** (per `BLUEPRINT_CHECKS.md` §5 backend / §9 frontend numbering, sequenced by dependency — market data first since almost everything else displays or references it):

1. **4.1 — Market Dashboard** (§5.1 / §9.1)
2. **4.2 — Stock Detail** (§5.2 / §9.2)
3. **4.3 — Technical Analysis** (§5.3 / §9.3)
4. **4.4 — IPO Center** (§5.4 / §9.4)
5. **4.5 — News & Announcements** (§5.5 / §9.5)
6. **4.6 — Portfolio Tracker** (§5.6 / §9.6)
7. **4.7 — Trading Journal & Paper Trading** (§5.7 / §9.7)
8. **4.8 — Floorsheet Analyzer** (§5.8 / §9.8)
9. **4.9 — AI Outlook & Explainer** (§11, §5.9/§9.9) — this module gets an additional dedicated hardening pass in Phase 7; building it here only needs to meet the standard module checklist below, not the full AI-specific security bar yet.

**Before 4.1:** confirm `backend/app/services/market_data/base.py`'s `MarketDataProvider` interface (§13.1) exists with a minimal placeholder implementation (fixed, realistic sample data — not random/nonsense values, since Phase 2's style guide and every price component need something plausible to render against). Modules 4.1, 4.2, and 4.3 depend on `get_market_data_provider()` for all price/index data — never on the scraper directly, which doesn't get built until Phase 5.

**For each module, run this identical sub-checklist** (this is `BLUEPRINT_CHECKS.md` §17.3's Module Build Prompt, restated as the gate for this playbook):

- [ ] Supabase table(s) created with RLS policies (§4's reference pattern) if user-owned data is involved
- [ ] FastAPI router + Pydantic schemas under `backend/app/modules/<module>/`
- [ ] Standard error shape and error codes used (§6)
- [ ] Next.js feature folder under `apps/web/src/features/<module>/` using the Phase 2 theme exclusively — no new colors/spacing/fonts introduced
- [ ] Data-freshness fields (`dataStatus`/`lastUpdated`) present on any price-bearing response, enforced at the type level
- [ ] Works correctly in both `/ne` and `/en`
- [ ] pytest tests written, including an ownership/RLS cross-user test if the module touches user data
- [ ] API documentation entry added following §6's template
- [ ] Postman collection folder added with at least one request per endpoint and a passing Tests script
- [ ] Module-specific business rules from its §5/§9 subsection are implemented (e.g. floorsheet's neutral-wording rule, IPO's required `source_url`, portfolio's CSV validation)

**Security checklist for this phase, applied per module** (§7 "Authentication & Authorization" / "API Security", §10): RLS policy tested with a genuine second test-user account, not just the owner account, for every module touching user data; `assert_ownership()` called before any read/write by ID (no IDOR); every Supabase query filters by `user_id` even though RLS is present (belt and suspenders per §7); Pydantic validation on every request body/query/param; portfolio CSV import specifically enforces a row cap and strict column validation, rejecting the whole file on malformed input rather than partially importing.

**Definition of Done for Phase 4 as a whole:** all nine modules above individually pass their sub-checklist.

**Manual Check — run after *each individual module*, not just once at the end of Phase 4:**
```
## ✅ Module <name> complete — manual check required before the next module

**Check this yourself:**
1. Open the module's real page in the app (both /ne and /en) — confirm it looks and behaves correctly and matches the established theme.
2. Try it logged out and logged in if it's an auth-required module — confirm the right thing happens in both states.
3. Open the Postman folder for this module — run each request, confirm passing tests.
4. Run `pytest backend/tests/test_<module>.py` — confirm all pass, including the cross-user RLS test if present.
5. If this module touches user data: log in as a *second* test account and confirm it cannot see or modify the first account's data via direct ID manipulation (e.g. editing a URL/request param).

**Do not start the next module until you confirm these pass.**
```

---

## Phase 5 — Scraping Pipeline & Scheduled Jobs

**Goal:** The data pipeline that every module above actually depends on for real (non-placeholder) data, running reliably and safely on a schedule.

**Tasks** (per `BLUEPRINT_CHECKS.md` §13.1, §13.2):
- Build the scrapers themselves, keeping raw and normalized data in separate tables.
- Implement `ScraperMarketDataProvider` (§13.1) satisfying the `MarketDataProvider` interface Phase 4 already depends on — this is the swap from placeholder to real data, and it must not require touching any code in `modules/market`, `modules/stocks`, or `modules/technicals`. If it does, the interface leaked somewhere in Phase 4 and that's a bug to fix now, not a one-off exception to wave through.
- Set `MARKET_DATA_PROVIDER=scraper` (the default) in `.env` and confirm the factory (§13.1) actually resolves to `ScraperMarketDataProvider`.
- Implement stale-data detection and the `STALE_DATA`/`DATA_SOURCE_UNAVAILABLE` error paths.
- Wire up Telegram failure alerting.
- Set up the GitHub Actions scheduled workflows (market data, news/IPO, Supabase keep-alive) from §13.2's example YAML, adapted to real NEPSE trading-hours scheduling.
- Confirm every module built in Phase 4 correctly reflects real scraped data (not the placeholder/mock data used while building those modules), including correct `live/delayed/eod` labeling.
- Leave `nepse_api_provider.py` as the documented stub from §13.1 — do not implement it now. It gets built for real only once official NEPSE (or licensed vendor) API access actually exists; at that point it's a config flip (`MARKET_DATA_PROVIDER=nepse_api`) plus one new class, not a re-opening of this phase or any module built in Phase 4. Note this migration path exists but do not start it without the person explicitly confirming API access has been granted.

**Security checklist for this phase** (§7 "Data & Privacy" / "Infrastructure"): raw scraped payloads and normalized data stay in genuinely separate tables so a parsing bug can never silently corrupt or destroy the reprocessable source; GitHub Actions secrets (Telegram token, any scrape-related keys) are stored as repo/environment secrets and never appear in workflow YAML in plaintext; scraped text that will later render as HTML anywhere in the frontend is flagged now for the DOMPurify pass it needs in Phase 8/§10 — don't let raw scraped HTML reach a component unsanitized even temporarily.

**Definition of Done:**
- Scheduled workflows run successfully in GitHub Actions (not just locally).
- A deliberately-broken scrape (simulate a source site change) correctly triggers a Telegram alert and a visible `STALE_DATA`/`DATA_SOURCE_UNAVAILABLE` response rather than silently serving old data.
- All Phase 4 modules now show real data end to end.

**Manual Check for the person:**
1. Check the GitHub Actions tab — confirm the scheduled workflows have run and succeeded at least once.
2. Open the app and confirm real NEPSE data appears (not the placeholder data from earlier phases).
3. Confirm the freshness labels on the dashboard correctly reflect actual scrape recency.
4. Confirm you received a Telegram alert during the deliberate-failure test, and that the app showed a clear stale/unavailable state instead of stale-but-labeled-fresh data.
5. Open the GitHub Actions workflow YAML files directly — confirm no secret values appear in plaintext anywhere in them.
6. `grep -rn "from app.pipeline.scrapers" backend/app/modules` — confirm zero matches. Modules must only ever reach market data through `get_market_data_provider()`, never a direct scraper import — this is what keeps the future NEPSE-API swap a one-file change.

---

## Phase 6 — Observability, Logging & Alerting

**Goal:** Make the running system legible — so that when something breaks in production later, the answer to "what happened" is a dashboard/log query, not a guess.

**Tasks:**
- Configure Sentry (or the chosen equivalent) on `apps/web`, `apps/admin`, and `backend`, each with its own DSN, and confirm a deliberately-thrown test error actually appears in the Sentry project for each.
- Configure `before_send` scrubbing on every Sentry client so tokens, API keys, and raw PII never leave the app in an error report (§7 "Infrastructure").
- Implement structured logging in the backend (JSON logs with request ID, route, status, latency) — no `print()` debugging left in production code paths.
- Add `GET /ready` (readiness — includes a real DB round-trip) alongside the existing `GET /health` (liveness — no DB call), both excluded from aggressive rate limiting.
- Consolidate the Telegram alerting from Phase 5 into a general alerting channel — scrape failures, unhandled 5xx spikes, and CI failures should all route somewhere the person will actually see them, not just live in a dashboard nobody checks.
- Set up basic uptime monitoring against the deployed `/health` endpoint (even a free-tier external pinger) so downtime is detected within minutes, not when a user reports it.

**Security checklist for this phase** (§7 "Infrastructure"): confirm by direct inspection — not by assuming the config is right — that no token, API key, or raw PII appears in either the structured logs or a live Sentry error report; confirm log output volume and retention won't itself become a cost/compliance problem at production scale.

**Definition of Done:**
- All three apps report errors to Sentry with scrubbing confirmed working, not just configured.
- `/health` and `/ready` both respond correctly and are excluded from strict rate limits.
- A real alert (Telegram or equivalent) fires from a deliberately-triggered failure.
- Uptime monitoring is live against the (staging or local-tunnel) `/health` endpoint.

**Manual Check for the person:**
1. Trigger a deliberate error in each app (throw in a dev route) and confirm it appears in the corresponding Sentry project within a minute or two.
2. Open one of those Sentry error reports and grep it yourself for anything that looks like a token, key, or personal data — confirm scrubbing actually worked, don't just trust the config.
3. Hit `/health` and `/ready` directly — confirm `/ready` fails clearly if you temporarily point it at a bad DB connection string, and recovers once fixed.
4. Confirm the uptime monitor shows a status page or notification channel you can actually see.

---

## Phase 7 — AI Subsystem Security Hardening

**Goal:** A dedicated, adversarial pass on the AI outlook/explainer module specifically — this is the highest-novelty risk surface in the app (prompt injection via scraped content, hallucinated financial claims, missing disclaimers) and deserves its own gate rather than being folded into general security hardening.

**Tasks** (per `BLUEPRINT_CHECKS.md` §7 "AI-Specific Security", §11, §17.1 items 8–11):
- Confirm the AI explainer never concatenates unsanitized free text (including scraped news/report content flowing through RAG) directly into the system prompt sent to the LLM provider.
- Confirm RAG-retrieved document content is explicitly treated as untrusted data — write and run a manual test where a piece of seeded "malicious" retrieved content tries to override the system prompt's instructions, and confirm it fails to do so.
- Confirm every AI outlook response is validated against the Pydantic response model requiring `timeframe`/`confidence`/`factors`/`warning` — try to construct a response that's missing one of these and confirm the API rejects it rather than passing it through.
- Confirm every AI signal (both correct and incorrect predictions, not just the ones that look good) is logged to the `signals` table before being shown to any user.
- Verify LiteLLM (or whichever LLM routing library is in use) is on a current patched version against live advisories — do not trust any version number written in this file or the blueprint by the time you read it.
- Confirm the required disclaimer text (PRD §10) renders unmodified everywhere AI output appears, including edge cases like empty-state and error-state renders of the outlook component.

**Security checklist for this phase:** this phase *is* the §7 "AI-Specific Security" checklist, run adversarially rather than just read off as a checkbox — actually attempt the prompt-injection test rather than reasoning about whether it would work.

**Definition of Done:**
- The seeded prompt-injection attempt fails to alter model behavior, with the test and its result documented.
- A response missing a required field is rejected by schema validation, demonstrated with an actual failing request.
- Every signal (win or loss) is confirmed present in the `signals` table after a test prediction cycle.
- Disclaimer text is confirmed present, verbatim, in every AI-output render state.

**Manual Check for the person:**
1. Ask to see the actual prompt-injection test case and its result — confirm it was a real attempt, not a description of one.
2. Try submitting a request that should trigger a schema-validation failure yourself and confirm you get a clear rejection, not a partially-valid response.
3. Query the `signals` table directly (or ask for a query result) and confirm both correct and incorrect past predictions are present.
4. Look at the AI outlook UI in a loading state, an error state, and a normal state — confirm the disclaimer text is identical and present in all three.

---

## Phase 8 — Full-Stack Security Hardening Pass

**Goal:** A formal, adversarial re-verification of everything built in Phases 0–7 against the complete `BLUEPRINT_CHECKS.md` §7 and §10 checklists — not spot-checks, and not a re-read of what was already claimed done phase by phase.

**Tasks:** Work through `BLUEPRINT_CHECKS.md` §7 (backend) and §10 (frontend) checklists item by item, plus §17.1/§17.2's audit prompts, across the *entire* app built in Phases 0–7. Beyond re-checking each item, actually attempt to break it:
- Attempt an IDOR: as one authenticated user, try to read/modify another user's portfolio/journal record by editing the ID in a request.
- Attempt an RLS bypass: query a user-data table directly with the anon key and confirm it's correctly restricted.
- Attempt a rate-limit bypass on the AI-explainer and auth routes specifically.
- Confirm the admin panel's auth is genuinely separate from — and stricter than — the public app's, by attempting to reach an admin route with a valid public-app token.

**Definition of Done:**
- Every item in §7 and §10 is checked off, with the specific code/config that satisfies it identified (not just checked from memory).
- Every adversarial attempt above is documented with its actual result (blocked, or fixed if it wasn't).
- `pip-audit` and `npm audit` (both `apps/web` and `apps/admin`) show zero high/critical.

**Manual Check for the person:**
1. Ask for the completed §7 and §10 checklists with a one-line note per item on what satisfies it — review it yourself rather than trusting a bare "done."
2. Run `pip-audit` and `npm audit` yourself and confirm zero high/critical.
3. Spot-check 2–3 items yourself directly in the code (e.g. open an actual RLS policy in Supabase, confirm a `.env.example` has no real secrets) rather than relying solely on the report.
4. Ask to see the actual result of each adversarial attempt (IDOR, RLS bypass, rate-limit bypass, admin-auth bypass) — confirm each was genuinely attempted and genuinely blocked.

---

## Phase 9 — Performance & Load Testing

**Goal:** Confirm the app behaves acceptably under realistic load before it meets real users, not after.

**Tasks:**
- Identify the highest-traffic endpoints (market dashboard, stock detail, technicals) and run a basic load test against a staging-equivalent environment (e.g. `locust`, `k6`, or an equivalent tool — verify current tooling per the Version Safety Rule).
- Confirm database queries on hot paths use appropriate indexes — check actual query plans on the largest realistic tables (`stock_prices`, `floorsheet_transactions`), not just assumptions about what should be indexed.
- Confirm rate limiting behaves sanely under load (returns clean `429`s, doesn't crash the process).
- Check bundle size and initial load performance on the frontend (Lighthouse or equivalent) for the dashboard and stock-detail pages specifically, since those are the highest-traffic entry points.
- Identify and document any known bottleneck that's acceptable to ship with (vs. one that blocks launch) — this is a judgment call for the person, not the AI, to make.

**Definition of Done:**
- Load test results exist and are reviewed, with any P95/P99 latency concerns documented.
- Hot-path queries confirmed indexed via actual query plan inspection.
- Frontend performance numbers exist for the highest-traffic pages.

**Manual Check for the person:**
1. Review the load test results and confirm the numbers are acceptable for expected real-world traffic.
2. Review the query plan output for the hot-path queries yourself.
3. Review the Lighthouse (or equivalent) scores for the dashboard and stock-detail pages.
4. Decide, together with the AI's documented findings, whether any bottleneck found here blocks launch or is acceptable to ship with and revisit post-launch.

---

## Phase 10 — Full Test Suite & CI

**Goal:** Everything from earlier phases now enforced automatically, not just manually verified once.

**Tasks** (per `BLUEPRINT_CHECKS.md` §14, §15):
- Ensure the full pytest suite, frontend tests, and AI golden-set tests all exist and pass.
- Stand up the `ci.yml` GitHub Actions workflow from §15, covering lint, type-check, test, and both audit tools for both apps.
- Confirm a PR with a deliberately broken test actually fails CI (proves CI is wired correctly, not just present).

**Definition of Done:**
- CI passes on a clean PR.
- CI correctly fails on a deliberately broken PR, then passes again once fixed.

**Manual Check for the person:**
1. Open a real PR (even a trivial one) and confirm CI runs and passes.
2. Open a throwaway PR with a deliberately failing test and confirm CI catches it and blocks merge.

---

## Phase 11 — Staging Deploy & User Acceptance Testing

**Goal:** Run the full app in a real, deployed, production-like environment — with real infrastructure but non-production data — before touching the actual production deployment.

**Tasks:**
- Deploy the current state to a staging environment (separate Vercel project/Render-Fly instance and a separate Supabase project from both local dev and eventual production).
- Run every module's manual checklist again, this time against the staging deployment rather than localhost — some class of bugs (env misconfig, cold-start behavior, real network latency) only shows up once things are actually deployed.
- Walk through every module end to end as a fresh user would: sign up, explore the dashboard, add a portfolio transaction, read an AI outlook, switch locale — in one continuous session, not module-by-module in isolation.
- Confirm scheduled GitHub Actions jobs correctly target the staging Supabase project, not production or local.

**Definition of Done:**
- Staging is live at its own URL, fully functional, using its own isolated database.
- A full fresh-user walkthrough completes with no broken flows.
- Nothing in staging is silently pointed at production infrastructure.

**Manual Check for the person:**
1. Visit the staging URL yourself and do a full walkthrough as a brand-new user — sign up, use several modules, switch locale.
2. Confirm the staging Supabase dashboard shows the activity you just generated, and that this is clearly a separate project from whatever will become production.
3. Note anything that felt slow, confusing, or broken only in this deployed environment — this is the point to catch that, before real users do.

---

## Phase 12 — Backup, Disaster Recovery & Rollback Plan

**Goal:** A production financial-data app needs a documented answer to "what do we do when something goes badly wrong" before it goes live, not improvised in the moment.

**Tasks:**
- Confirm Supabase's automated backup settings for the (soon-to-be) production project and document the actual recovery point objective (how much data could be lost) and recovery time objective (how long a restore takes).
- Run one real restore drill against a throwaway project — actually take a backup and actually restore it — rather than assuming backups work because they're configured.
- Document a rollback procedure for a bad deploy: how to revert `apps/web` (Vercel) and `backend` (Render/Fly) to the previous known-good release quickly.
- Document who gets alerted and what the first response steps are if the Telegram/uptime alerting from Phase 6 fires in production.

**Definition of Done:**
- A restore drill has actually been performed and its result documented, not just backup settings screenshotted.
- A written rollback procedure exists and has been sanity-checked (even if not executed live) against how the hosting platforms actually behave.
- An incident-response note exists: who is alerted, and what they do first.

**Manual Check for the person:**
1. Review the restore drill results — confirm it was a genuine restore, not just a backup-exists confirmation.
2. Review the rollback procedure and confirm it matches how you'd actually want to respond to a bad production deploy.
3. Confirm you're comfortable being the person who gets the Telegram alert, or designate who should be instead.

---

## Phase 13 — Pre-Launch & Production Deployment

**Goal:** Ship the web app for real.

**Tasks:** Work through `BLUEPRINT_CHECKS.md` §18 (Pre-Launch Production Checklist) in full, then deploy: frontend to Vercel, backend to Render/Fly, confirm Supabase production project is correctly configured (separate from both local dev and the Phase 11 staging project).

**Definition of Done:** Every item in §18 checked off; app is live at a real URL; smoke-tested in production for both locales and both auth states.

**Manual Check for the person:**
1. Review the completed §18 checklist.
2. Visit the live production URL yourself — test login, one full module (e.g. portfolio), the AI outlook disclaimer text, and both locales.
3. Confirm the required PRD disclaimer text appears correctly and unmodified in production.
4. Confirm Sentry, uptime monitoring, and Telegram alerting (Phase 6) are all live and pointed at the production project, not staging.

---

## Phase 14 — Capacitor Mobile Conversion (deferred — do not start without explicit go-ahead)

This phase is intentionally last and intentionally not detailed here. When — and only when — the person explicitly says they're ready to convert to mobile, follow `BLUEPRINT_CHECKS.md` §16 in full, starting from §16.2's numbered steps, and apply §16.3's checklist as this phase's Definition of Done. Do not begin any part of this phase, including scaffolding `android/`/`ios/` folders or adding Capacitor as a dependency, until that explicit go-ahead is given.

---

## Quick reference — phase → blueprint section map

| Phase | BLUEPRINT_CHECKS.md sections |
| --- | --- |
| 0 — Setup | §2, §3, §7 (env/config) |
| 1 — API Check Harness | §4, §6, §7 (CORS/auth parts) |
| 2 — Theme | §1, referenced TRD §2 design direction |
| 3 — Auth & Bilingual | §8, §12, §7 (auth), §10 |
| 4 — Modules | §5, §6, §9, §17.3, §7 (RLS/ownership), §10, §13.1 (provider interface) |
| 5 — Scraping | §13.1 (real provider), §13.2, §7 (data/infra) |
| 6 — Observability & Alerting | §7 (infrastructure) |
| 7 — AI Security Hardening | §7 (AI-specific), §11, §17.1 |
| 8 — Full-Stack Security Pass | §7, §10, §17.1, §17.2 |
| 9 — Performance & Load Testing | (cross-cutting — no dedicated blueprint section) |
| 10 — Testing & CI | §14, §15 |
| 11 — Staging & UAT | (cross-cutting — no dedicated blueprint section) |
| 12 — Backup & DR | (cross-cutting — no dedicated blueprint section) |
| 13 — Launch | §18 |
| 14 — Mobile (deferred) | §16 |