# Deployment Guide

## Build for production

Current project has no bundler or build pipeline.  
Production artifact is the repository static assets:
- `index.html`
- `css/`
- `js/`
- `data/`
- `assets/`

## Local verification before deploy

```bash
python3 -m http.server 8080
```

Smoke-check:
- open `/` and run through key flows,
- verify `/dashboard` route in SPA,
- verify language/theme persistence,
- verify report and profile interactions.

## Manual deployment (static hosting)

Any static host can serve the app:
- Nginx / Apache
- Netlify
- Vercel (static mode)
- Cloudflare Pages
- GitHub Pages (if path/routing is adjusted for hash mode)

Deployment steps:
1. Pull latest `main`.
2. Copy static project files to hosting target.
3. Ensure `index.html` is served as default document.
4. Keep `data/*.csv` publicly readable.

## CI/CD deployment approach

Recommended pipeline stages:
1. Checkout repository.
2. Run lightweight validation:
   - JS syntax parse for changed files,
   - optional markdown lint/docs checks.
3. Publish static files to hosting environment.

Example CI concerns:
- ensure cache invalidation for `js/*` and `css/*`,
- preserve `data/*.csv` updates as part of deploy artifact.

## Environment-specific configuration

Current static mode:
- No required runtime environment variables.

Backend-enabled mode (future):
- inject `FRAUDA_API_BASE_URL` and related config (see `docs/ENV.md`),
- set CORS and auth headers appropriately,
- define dev/stage/prod endpoints per environment.

## Routing considerations

SPA uses hash routing, so most static hosts work without rewrite rules.  
If routing is changed away from hashes in future, add host rewrite rules to serve `index.html` for app routes.

## Rollback strategy

Because deployment is static:
- keep previous artifact snapshot,
- rollback by redeploying prior commit/static bundle,
- verify data file compatibility (`scenarios.csv`, `dashboard_graph.csv`) with rolled-back JS.
