# CLAUDE.md — Contributor Notes for Frauda

## Project summary

Frauda is a frontend-only fraud-analysis prototype.  
It intentionally uses mock/local data and browser storage instead of a real backend.

## Core architecture

- `index.html` — verification workflow + schema form + local reports + user submissions
- `dashboard.html` — analytics from CSV datasets
- `js/data.js` — scenario and dashboard dataset loading + normalization
- `js/product-shell.js` — onboarding, theme, auth, and local storage services
- `js/app.js` — index page interactions
- `js/dashboard.js` — dashboard rendering logic
- `js/i18n.js` — offline LV/EN i18n dictionaries + language switching
- `css/style.css` — shared styling and theme variables

## Data sources and storage

### File datasets
- `data/scenarios.csv` — base scenario data.
- `data/dashboard_graph.csv` — dashboard-specific derived rows.

### localStorage keys
- `frauda_lang` — current UI language.
- `frauda_theme` — `light` / `dark`.
- `frauda_onboarded` — first-visit completion flag.
- `frauda_auth` — mock auth state.
- `frauda_reports` — local report history.
- `scenarios_test` — user test submissions (text or voice `.mp4` filename).

## Mock authentication

- Credentials are fixed:
  - username: `test`
  - password: `test`
- Used to protect report history and first submission continuation.
- No server-side verification exists.

## Contributor rules

1. Do not introduce backend dependencies unless explicitly requested.
2. Keep UI changes incremental; preserve current design language.
3. Reuse existing helpers and storage patterns.
4. Keep dashboard deterministic for identical filters.
5. Preserve transcript/source text content (do not auto-translate user message content).
6. Update docs (`README`, `CHANGELOG`, `VERSIONS`, `test-cases`, `BUGS`) when behavior changes.

## CSV handling constraint

`scenarios.csv` may contain malformed rows where commas appear unquoted in `transcript_text`.  
`js/data.js` already normalizes this by merging overflow columns into `transcript_text`.  
Any new data ingestion logic must preserve this behavior.

## Validation workflow (manual)

Before finalizing changes, verify:
- onboarding first-run behavior,
- theme persistence,
- auth success/failure/logout,
- form validation blocking,
- report creation/status transitions,
- user submission persistence in `scenarios_test`,
- dashboard totals/charts consistency.
