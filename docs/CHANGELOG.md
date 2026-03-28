# Documentation and Planning Changelog

## [Unreleased] — 2026-03-28

### Added
- Voice recording upload tab on Verify page (test mode)
- Metadata fields for custom message submission (suspicious links, sender number, date/time, language, additional info)
- Report scammer confirmation flow with CERT.LV forwarding
- Conditional report button behavior based on risk score
- Profile page with personal information editor and verification history table
- Form validation for custom message and voice recording submissions
- Animated theme transitions
- Localized homepage demo card (EN/LV)

### Changed
- Unified homepage background (single gradient, no alternating blocks)
- Navbar redesign with themed background and consistent button styling
- Scaled up all typography and spacing by ~20–25%
- Smooth gradient transitions between homepage sections
- Updated README.md with current feature descriptions and live demo link

### Fixed
- Logo rendering artifacts in navbar (now uses assets/frauda-full.png)
- Report modal transparent background
- Report scammer button text overflow
- Profile history table showing 0% for all risk scores
- Form submitting without required data

---

## [Previous]

### Part 3 documentation audit decisions

- **Updated** `README.md`  
  Rewritten to reflect current SPA architecture, product status, setup, and docs index.

- **Updated** `docs/CHANGELOG.md`  
  Repurposed from feature-only notes into documentation audit/change tracking for this phase.

- **Archived** `docs/CLAUDE.md` → `docs/archive/CLAUDE.md`  
  Replaced by broader and current `docs/AI_AGENTS.md`.

- **Updated** `docs/test-cases.md`  
  Will be retained as manual QA checklist with references aligned to current SPA behavior.

- **Updated** `docs/BUGS.md`  
  Retained; status and scope aligned with current known issues.

- **Updated** `docs/VERSIONS.md`  
  Retained; release timeline entry added for documentation completion.

- **Added** `docs/FRONTEND_BACKEND.md`  
  Frontend ↔ backend connection contract and endpoint catalog.

- **Added** `docs/DATABASE.md`  
  Current local storage schema + backend-ready SQL model mapping.

- **Added** `docs/ENV.md`  
  Environment variable contract for backend-enabled deployments.

- **Added** `docs/AI_AGENTS.md`  
  Project structure, conventions, workflows, and gotchas for AI contributors.

- **Added** `docs/DEPLOYMENT.md`  
  Local, static-host, and CI/CD deployment guidance.

- **Added** `docs/FUTURE_FRONTEND.md` (Part 2)  
  Long-term migration and architecture planning document.

- **Archived** `prompt.md` → `docs/archive/prompt.md`  
  Historical bootstrap prompt no longer reflects current architecture.

## [0.3.0] — 2026-03-24

- Completed Part 1 UX/product behavior corrections and pushed.
- Added `docs/FUTURE_FRONTEND.md` (Part 2) and pushed.
- Completed docs audit and full documentation refresh (Part 3).
