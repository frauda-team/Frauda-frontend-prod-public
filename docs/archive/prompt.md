# FRAUDA — Project Setup & Restructure Prompt

## Context

You are working on **Frauda** — an AI-powered financial fraud detection web app built for the "Icebreakers" festival 10 000 EUR grant competition at the University of Latvia. The app detects vishing (voice fraud) and smishing (SMS fraud) using neural network models. The project currently consists of:

- `index.html` — main app (vibecoded, all-in-one file)
- `dashboard.html` — analytics dashboard (vibecoded, all-in-one file)
- `README.md` — placeholder only, delete it

**Do NOT change the existing visual design unless absolutely structurally necessary.**

---

## Task: Restructure & Scaffold the Project

### 1. Folder Structure

Reorganize the project into this structure:

```
frauda/
├── index.html
├── dashboard.html
├── assets/
│   └── logo.jpg              ← save the Frauda shield logo here
├── css/
│   └── style.css             ← extract ALL shared CSS from both HTML files
├── js/
│   ├── data.js               ← loads and exposes scenario data from CSV
│   ├── app.js                ← logic extracted from index.html
│   └── dashboard.js          ← logic extracted from dashboard.html
├── data/
│   └── scenarios.csv         ← single source of truth for all data
├── docs/
│   ├── CLAUDE.md             ← instructions for Claude on how to work on this project
│   ├── BUGS.md               ← bug tracker (Claude fixes bugs here and marks done)
│   ├── CHANGELOG.md          ← log of all changes Claude makes
│   └── VERSIONS.md           ← version history
└── README.md                 ← proper project readme
```

---

### 2. CSV Data File (`data/scenarios.csv`)

Create **25 realistic fraud scenarios** (mix of voice/vishing and SMS/smishing, plus some legitimate ones). Each row must include:

| Field | Description |
|---|---|
| `id` | Unique ID (1–25) |
| `timestamp` | ISO datetime of when the incident occurred |
| `duration_seconds` | Call or message duration in seconds |
| `type` | `voice` or `sms` |
| `channel` | `vishing` or `smishing` |
| `score` | Fraud probability 0–100 |
| `risk` | `red`, `yellow`, or `green` |
| `risk_label` | Latvian label |
| `caller` | Phone number or sender ID |
| `caller_origin` | e.g. `LV (VoIP)`, `LT (Mobile)` |
| `lang` | Language spoken: `lv`, `ru`, `en` |
| `age` | Victim age |
| `gender` | `male` or `female` |
| `occupation` | `student`, `IT`, `finance`, `pensioner`, `unemployed`, `healthcare`, `retail`, `legal` |
| `fraud_type` | e.g. `otp_theft`, `phishing_link`, `bank_impersonation`, `investment_scam`, `legitimate` |
| `institution_impersonated` | e.g. `SEB banka`, `Tele2 Latvija`, `Latvijas Pasts`, `none` |
| `summary` | Short Latvian summary |
| `indicators` | Pipe-separated list of red flags |
| `transcript_key` | Reference key like `voice_001`, `sms_003` |

---

### 3. Data Layer (`js/data.js`)

- Parse `scenarios.csv` using `fetch()` + manual CSV parse (no external libraries)
- Expose a global `FraudaData` object with:
  - `FraudaData.scenarios` — full array
  - `FraudaData.getById(id)`
  - `FraudaData.filterBy({ type, risk, occupation, lang })`
  - `FraudaData.stats()` — returns aggregates used by dashboard
- Both `index.html` and `dashboard.html` load data exclusively through `FraudaData`
- No hardcoded case data inside any `.html` or `.js` file — CSV is the only source

---

### 4. HTML Files

- Extract all `<style>` blocks → `css/style.css`, link via `<link>`
- Extract all `<script>` blocks → respective `.js` files, load via `<script src="">`
- Replace all hardcoded scenario data references with `FraudaData` calls
- Add `<img src="assets/logo.jpg">` for the logo in the navbar (replace any inline SVG or text logo)
- Add `translate="no"` attribute to ALL text elements that must not be auto-translated by Google Translate (navbar brand, app labels, risk badges, indicator text, transcript content). Also add `<meta name="google" content="notranslate">` to `<head>` of both HTML files.
- Ensure full **mobile responsiveness**: test that navbar, cards, transcript bubbles, and buttons all work on 375px viewport width

---

### 5. Docs Files to Create

**`docs/CLAUDE.md`** — Instructions for Claude working on this project:
- Project purpose summary (Frauda fraud detection)
- File structure explanation
- Rule: never hardcode data — always use `scenarios.csv` via `FraudaData`
- Rule: never change design unless explicitly asked
- Rule: log every change in `CHANGELOG.md`
- Rule: when fixing bugs from `BUGS.md`, mark them `[DONE]` with date
- Rule: bump version in `VERSIONS.md` after each session
- Rule: all user-facing text must have `translate="no"` where appropriate

**`docs/BUGS.md`** — Bug tracker template:
```
## Open Bugs
- [ ] BUG-001: [description] — reported: YYYY-MM-DD

## Fixed Bugs
- [DONE] BUG-XXX: [description] — fixed: YYYY-MM-DD
```

**`docs/CHANGELOG.md`** — Change log:
```
## [Unreleased]
## [0.1.0] - YYYY-MM-DD
- Initial restructure from vibecoded single files
```

**`docs/VERSIONS.md`** — Version file:
```
Current: 0.1.0
0.1.0 — Initial structured scaffold
```

**`README.md`** — Proper readme with: project description, tech stack, folder structure, how to run locally, how to add new scenarios (edit CSV), how to report bugs (edit BUGS.md)

---

### 6. Rules for This Session

- Preserve all existing visual design exactly — colors, fonts, layout, components
- Mobile compatibility is required — use `@media (max-width: 480px)` breakpoints where needed
- No npm, no bundlers, no frameworks — vanilla HTML/CSS/JS only
- No external JS libraries except Google Fonts (already used)
- After completing all tasks, append a summary entry to `docs/CHANGELOG.md` and bump `docs/VERSIONS.md` to `0.1.0`
