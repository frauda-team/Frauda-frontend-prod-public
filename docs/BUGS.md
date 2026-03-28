# BUGS.md — Frauda Bug Tracker

## Open Bugs

- [ ] BUG-006: User submissions in `scenarios_test` are not yet included in dashboard analytics (currently intentional separation) — reported: 2026-03-23
- [ ] BUG-007: `favicon.ico` missing causes harmless `404` in local server logs — reported: 2026-03-23
- [ ] BUG-008: Legacy `dashboard.html` path can diverge from SPA dashboard behavior and should be considered deprecated or aligned — reported: 2026-03-24

## Fixed Bugs

- [DONE] BUG-001: Verification output showed only first phrase (`Sveiki`/`Labdien`) due malformed CSV row splitting — fixed: 2026-03-23
- [DONE] BUG-002: Dashboard KPIs changed randomly on refresh (non-deterministic simulated values) — fixed: 2026-03-23
- [DONE] BUG-003: Dashboard total suspicious count defaulted to latest date only (`12`) instead of all records (`25`) — fixed: 2026-03-23
- [DONE] BUG-004: Google Translate dependency in UI (online API widget) replaced with offline i18n — fixed: 2026-03-23
- [DONE] BUG-005: Local dev startup could fail with `Address already in use` on port `8080` due stale server process — fixed/documented: 2026-03-23

---

## Tracking policy

Add new issues under **Open Bugs** with:

```text
- [ ] BUG-XXX: description — reported: YYYY-MM-DD
```

When fixed:
1. Move to **Fixed Bugs**
2. Mark as `[DONE]`
3. Add fixed date
4. Add relevant note to `docs/CHANGELOG.md`
