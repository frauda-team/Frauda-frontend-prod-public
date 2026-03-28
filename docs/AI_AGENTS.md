# AI Agent and Contributor Guide

## Project purpose

Frauda is a frontend-first anti-fraud product prototype.  
It provides user-facing flows for message verification, scammer reporting, profile onboarding, and analytics dashboards without a real backend yet.

## Folder layout

```text
/
├── index.html                  # SPA entrypoint
├── dashboard.html              # Legacy standalone dashboard
├── css/style.css               # Global design system and page styling
├── data/
│   ├── scenarios.csv           # Canonical scenario data
│   └── dashboard_graph.csv     # Dashboard dataset
├── js/
│   ├── data.js                 # Data loading/filtering/stats
│   ├── i18n.js                 # Offline dictionaries and translation engine
│   ├── product-shell.js        # Auth/theme/storage + mocked backend methods
│   ├── router.js               # SPA route + nav + global modal handling
│   ├── app.js                  # Legacy verification flow (non-SPA)
│   ├── dashboard.js            # Legacy dashboard flow (non-SPA)
│   └── pages/
│       ├── landing.js
│       ├── verify.js
│       └── dashboard-page.js
└── docs/                       # Project documentation
```

## Naming and conventions

- Keep user-visible strings in `js/i18n.js` keys; do not hardcode new labels in page code.
- Reuse existing key naming groups:
  - `landing.*`
  - `verify.*`
  - `dashboard.*`
  - `common.*`
  - `auth.*`
- Use existing CSS token variables; avoid ad-hoc color literals unless already used in chart palettes.
- Prefer small surgical changes in page modules instead of broad rewrites.

## How to run locally

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## How to validate changes

No formal test runner is currently configured.  
Use manual checks plus syntax parsing:

1. Manual UX smoke test for impacted pages/flows.
2. Optional JS syntax parse (e.g., esprima) for touched JS files.
3. Verify `index.html` and `dashboard.html` return `200` from local server.

Reference test plan:
- `docs/test-cases.md`

## Known gotchas

- `dashboard.html` and `js/dashboard.js` are legacy standalone paths; SPA dashboard uses `js/pages/dashboard-page.js`.
- `prompt.md` is historical context only; do not treat it as current architecture.
- `localStorage` is authoritative for mocked auth/profile/report/testing data.
- Keep transcript/message content unmodified by translation logic.
- When changing language behavior, preserve page state and open panels/modals.

## Editing guidance for AI agents

- Do not invent backend endpoints/fields beyond existing frontend contracts unless explicitly asked.
- Avoid destructive git operations in a dirty tree.
- Keep behavior deterministic for the same CSV/filter inputs.
- Add docs updates when behavior or architecture changes.
- If introducing new user-facing copy, add corresponding i18n keys for LV/EN/RU handling.
