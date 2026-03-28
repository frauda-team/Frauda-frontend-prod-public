# Frauda — AI-Powered Fraud Detection

Frauda is an AI-powered fraud detection platform targeting vishing (voice phishing) and smishing (SMS phishing) attacks in Latvia. This frontend application provides real-time risk scoring and automated reporting to CERT.LV.

## Features

- **AI-powered analysis** of suspicious text messages and voice recordings
- **Three input methods**: sample scenarios, custom message with metadata, voice recording upload
- **Real-time risk scoring** with three-level classification (safe / unclear / fraud)
- **Automated report forwarding** to CERT.LV with confirmation flow
- **User profile** with editable personal info and full verification history
- **Bilingual interface** (Latvian / English)
- **Dark and light theme** with animated transitions
- **Privacy by Design** — all data anonymized at ingestion

## Live Demo

**[https://frauda-team.github.io/Frauda-frontend-prod-public/#/](https://frauda-team.github.io/Frauda-frontend-prod-public/#/)**

## Tech Stack

- Vanilla HTML/CSS/JavaScript (no framework)
- Hash-router SPA architecture
- Local CSV datasets (`data/scenarios.csv`)
- Browser `localStorage` for persistence
- HPC infrastructure (RTU) for AI model training
- GitHub Pages hosting

## Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/frauda-team/Frauda-frontend-dev.git
   cd Frauda-frontend-dev
   ```

2. Start a local server:
   ```bash
   python3 -m http.server 8080
   ```

3. Open in browser:
   ```
   http://localhost:8080
   ```

### Test Credentials (Mock Auth)

- Username: `test`
- Password: `test`

## Project Structure

```text
Frauda-frontend-dev/
├── index.html                      # SPA entry point
├── assets/
│   └── frauda-full.png             # Branded logo
├── css/
│   └── style.css                   # Global styles + themes
├── data/
│   ├── scenarios.csv               # Sample fraud scenarios dataset
│   └── dashboard_graph.csv         # Dashboard analytics data
├── js/
│   ├── data.js                     # CSV loading and filtering
│   ├── i18n.js                     # Internationalization (LV/EN)
│   ├── product-shell.js            # Auth, theme, storage
│   ├── router.js                   # SPA router and navbar
│   └── pages/
│       ├── landing.js              # Homepage
│       ├── verify.js               # Message verification
│       ├── dashboard-page.js       # Analytics dashboard
│       └── profile.js              # User profile
└── docs/                           # Documentation
```

## Languages Supported

- **Latvian (LV)** — Primary language
- **English (EN)** — Secondary language

Note: Russian language is **not** supported.

## Documentation

- `docs/CHANGELOG.md` — Change history
- `docs/FRONTEND_BACKEND.md` — API integration contract
- `docs/DATABASE.md` — Data schema
- `docs/DEPLOYMENT.md` — Deployment guide
- `docs/AI_AGENTS.md` — Contributor guide
- `docs/test-cases.md` — QA checklist

## Project Status

This project is under active development as part of a regulatory sandbox application in Latvia.
