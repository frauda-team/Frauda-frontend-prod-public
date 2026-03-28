# Environment Variables

## Current mode

The current project runs as a static frontend and does not require environment variables for local development.

## Planned variables for backend-connected mode

These variables should be introduced when replacing mocked API logic with real backend calls.

| Variable | Type | Example | Required | Description |
|---|---|---|---|---|
| `FRAUDA_API_BASE_URL` | string (URL) | `https://api.frauda.lv` | Yes (backend mode) | Base URL for all API requests from frontend. |
| `FRAUDA_ENV` | string enum | `development` | No | Environment label used for diagnostics/telemetry toggles. |
| `FRAUDA_REQUEST_TIMEOUT_MS` | integer | `10000` | No | Default API timeout in milliseconds for frontend request wrappers. |
| `FRAUDA_ENABLE_MOCK_API` | boolean string | `true` / `false` | No | Enables local mock API behavior for development/testing. |
| `FRAUDA_LOG_LEVEL` | string enum | `info` | No | Frontend logging verbosity (`debug`, `info`, `warn`, `error`). |

## Optional auth-related variables (if auth flow is token-based)

| Variable | Type | Example | Required | Description |
|---|---|---|---|---|
| `FRAUDA_AUTH_STORAGE_KEY` | string | `frauda_auth` | No | Override for auth storage key name if needed by deployment profile. |
| `FRAUDA_TOKEN_REFRESH_MARGIN_S` | integer | `60` | No | Seconds before access token expiry to attempt refresh. |

## `.env.example` suggestion

If the project migrates to a build system, mirror this in `.env.example`:

```env
FRAUDA_API_BASE_URL=https://api.frauda.lv
FRAUDA_ENV=development
FRAUDA_REQUEST_TIMEOUT_MS=10000
FRAUDA_ENABLE_MOCK_API=true
FRAUDA_LOG_LEVEL=info
```

## Notes

- Do not store secrets directly in frontend-exposed variables.
- Any sensitive keys must remain server-side.
- Keep variable names stable across environments to reduce deployment drift.
