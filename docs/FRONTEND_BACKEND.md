# Frontend ↔ Backend Integration Guide

## Purpose

This guide documents how the current frontend should connect to backend services.  
At the moment, backend interactions are mocked in `js/product-shell.js`, and CSV files are used as local data sources.

## API base URL configuration

Current mode:
- No backend API base URL is required.
- Data sources are local:
  - `GET /data/scenarios.csv`
  - `GET /data/dashboard_graph.csv`

Backend mode (planned):
- Use `FRAUDA_API_BASE_URL` (see `docs/ENV.md`) as the single API root.

## Authentication flow

Current (mock):
- Credentials checked in-browser.
- Auth state persisted in `localStorage` (`frauda_auth`).

Backend-ready target:
1. Send credentials to backend auth endpoint.
2. Receive access token (and optional refresh token).
3. Store and attach access token to protected requests.
4. Refresh token before expiry.
5. On refresh failure, clear auth state and force re-login.

## Existing frontend call points

The frontend currently calls these surfaces:

### 1) Scenario dataset

- Method: `GET`
- Path: `/data/scenarios.csv`
- Source: `FraudaData.ready` in `js/data.js`
- Response: CSV rows for verification flows

### 2) Dashboard dataset

- Method: `GET`
- Path: `/data/dashboard_graph.csv`
- Source: `FraudaData.dashboardReady` in `js/data.js`
- Response: CSV rows for dashboard visualizations

### 3) Custom message submission (mocked)

- Function: `FraudaShell.submitCustomMessage(message)`
- Current response: `{ ok: true, status: 200 }` on valid input
- Side effect: stores to `scenarios_test`

### 4) Profile submission (mocked)

- Function: `FraudaShell.submitUserProfile(profileData)`
- Current response: `{ ok: true, status: 200 }`
- Side effect: updates local profile record

### 5) Scammer report submission (mocked)

- Function: `FraudaShell.submitScammerReport(reportData)`
- Current response: `{ ok: true, status: 200 }`
- Side effect: drives success/failure toast flow in verify page

## Request and response payloads (current frontend contracts)

### Custom message payload

```json
{
  "message": "string"
}
```

Expected frontend success shape:

```json
{
  "ok": true,
  "status": 200
}
```

### Profile payload

```json
{
  "full_name": "string",
  "email": "string",
  "phone": "string",
  "age": "string"
}
```

Expected frontend success shape:

```json
{
  "ok": true,
  "status": 200
}
```

### Scammer report payload

```json
{
  "scammer_identifier": "string",
  "additional_information": "string",
  "incident_datetime": "ISO datetime string"
}
```

Expected frontend responses:
- success: `{ "ok": true, "status": 200 }`
- failure: `{ "ok": false, "status": 400 }` (or other non-2xx)

## Error handling conventions

Frontend behavior should remain:
- user-safe messages only,
- inline validation for form issues,
- explicit success/error state for async actions (e.g., toast on report send).

Backend integration should preserve response normalization to `{ ok, status, message? }`.

## CORS requirements

When backend and frontend are on different origins:
- allow frontend origin explicitly,
- allow methods used by frontend (`GET`, `POST`, plus preflight `OPTIONS`),
- allow headers `Content-Type` and `Authorization`,
- if cookies are used later, configure credentials + same-site policy consistently.

## Integration migration notes

- Replace mock methods in `js/product-shell.js` without changing call signatures used by page modules.
- Keep CSV data fallback for local/dev mode if needed.
- Update this document and `docs/ENV.md` when real backend endpoints are finalized.
