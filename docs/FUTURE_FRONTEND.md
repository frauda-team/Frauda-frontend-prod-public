# Future Frontend Planning

## Current stack assessment

Frauda is currently a static, frontend-only SPA implemented with vanilla HTML, CSS, and JavaScript. Routing is hash-based (`js/router.js`), page rendering is module-based (`js/pages/*`), and state is split between in-memory module state and `localStorage`. Data is loaded from local CSV files (`data/scenarios.csv`, `data/dashboard_graph.csv`) through `js/data.js`.

Strengths:
- Very low runtime complexity and no framework lock-in.
- Fast local iteration and simple hosting.
- Clear separation between shell, routing, data, and page modules.

Current limitations:
- No compile-time typing or module bundling.
- Limited component reuse patterns as UI grows.
- Manual state synchronization across modules/events.
- Manual test burden and higher regression risk.

## JavaScript framework migration decision

### Should the project migrate?

Yes, but only when backend integration is stable enough to justify the cost. The current vanilla architecture is acceptable for the prototype stage, while long-term product growth (auth flows, profile management, reporting workflows, dashboard complexity, i18n expansion) favors a framework.

### Option comparison

#### Next.js
- Excellent ecosystem maturity and hiring market.
- Strong SSR/SSG/ISR support and SEO story.
- First-class deployment support and middleware patterns.
- Slightly heavier abstraction and React ecosystem complexity.

#### Nuxt
- Strong DX and conventions for Vue teams.
- SSR/SSG coverage is good.
- Smaller talent pool relative to React in many markets.

#### SvelteKit
- Lean runtime and strong perceived performance.
- Pleasant authoring model and smaller bundle potential.
- Smaller ecosystem and fewer enterprise-standard integrations.

#### Remix
- Strong web standards alignment and nested routing model.
- Great for data-loading discipline.
- Smaller ecosystem footprint than Next.js.

### Recommendation

Recommend **Next.js** for migration due to ecosystem maturity, broad SSR/SSG capabilities, robust operational tooling, and easier long-term staffing.

### Migration path and timeline

Use a milestone-based migration path:
1. Stabilize current API contracts and i18n keys in the existing app.
2. Rebuild shell/navigation and verification page as first Next.js routes.
3. Port dashboard and shared data adapters.
4. Replace hash routing with file-based routing and remove legacy router.
5. Decommission static vanilla SPA once feature parity is validated.

## Impact on existing website

### Routing and page structure

Current hash routes (`#/`, `#/verify`, `#/dashboard`) would move to framework routes (e.g., `/`, `/verify`, `/dashboard`) with route-level data loading and middleware for auth guards.

### Existing component/UI code

String-template rendering in `js/pages/*` would be rewritten as framework components. Existing UX structure, labels, and behavior should be preserved to avoid user-facing drift.

### CSS and styling approach

Current shared CSS can be reused initially as a global stylesheet, then gradually modularized (CSS modules or scoped component styles) where beneficial.

### Build and deployment pipeline

A framework introduces a formal build step, type checking (if TS is adopted), and artifact-based deployments. This improves consistency but increases CI responsibilities.

## Hosting implications

### Static vs server-rendered deployment

- Current app is static-only and can run from any static host.
- A framework migration may use:
  - static export mode for mostly static pages, or
  - server/edge rendering for authenticated and dynamic flows.

### Suitable hosting platforms

- **Vercel**: best default for Next.js operational simplicity.
- **Netlify**: strong static + serverless workflows.
- **Cloudflare Pages**: good edge footprint and cost profile.
- **Self-hosted**: valid for compliance-heavy environments, with higher ops cost.

### Environment variable and secrets management

Current frontend has no required runtime secrets. After backend integration, environment-based API configuration and token handling must be injected via platform-managed environment variables and protected secrets stores.

### CI/CD changes

Add stages for lint/test/build, preview deployments for pull requests, and environment-specific deploy jobs (dev/stage/prod) with guarded secrets.

## Mobile / phone access

### Responsive design strategy

Keep desktop-first layout but continue progressive responsive hardening:
- navigation collapse and action priority on small screens,
- scalable dashboard cards/charts,
- form usability and touch target checks.

### Progressive Web App (PWA)

PWA support is a practical next step:
- installable shell,
- offline-safe fallbacks for read-only areas,
- controlled caching strategy for static assets and non-sensitive data.

### Native wrapper options

If mobile-native distribution is needed later, evaluate:
- Capacitor wrapping the web app for faster delivery,
- React Native Web only if a broader React-native ecosystem strategy is planned.

## Backend and API connectivity

### API client strategy

Current code uses native `fetch` and local mock services. For production-scale backend integration:
- keep `fetch` for low complexity, or
- adopt React Query / SWR for cache + retries + stale handling once framework migration happens.

### Authentication token handling and refresh logic

Current auth is localStorage-only mock state. Production flow should include:
- short-lived access token + refresh token model,
- secure storage strategy,
- centralized refresh and retry behavior,
- forced logout on invalid refresh.

### API versioning and error conventions

Define versioning at API boundary (`/v1/...`) and normalize frontend error handling into user-safe messages with retry semantics and telemetry hooks.

### Environment-based API URL management

Use explicit environment configuration for API base URL per environment, with strict fallback rules and build-time validation.

## State management at scale

### Local vs global state

Current event-driven local state is sufficient for prototype scope. At scale:
- keep local state for component-scoped UI,
- introduce lightweight global store for auth/session/profile/report context.

### Server state caching

For backend-connected views (dashboard, report history, profile), use structured server-state caching to avoid duplicate requests and reduce UI jitter.

## Testing strategy

### Unit tests

Adopt unit tests for:
- data parsing/normalization (`js/data.js` equivalent),
- risk/status mapping utilities,
- i18n key resolution.

### Component tests

Cover critical UI behaviors:
- verification submit modes,
- profile onboarding modal,
- language-switch state preservation,
- dashboard filter and export behavior.

### End-to-end tests

Run E2E tests for:
- first-run onboarding,
- login/logout and guarded actions,
- report creation and history details,
- dashboard filtering and CSV export.

## Accessibility and internationalization

### Internationalization roadmap

Current app has offline LV/EN/RU support (RU currently mirrored from EN). Next steps:
- complete full native RU strings,
- enforce translation-key completeness checks,
- standardize formatting helpers for date/number localization.

### Accessibility roadmap

Progress toward WCAG compliance should include:
- keyboard-only navigation validation,
- robust focus states and focus order,
- contrast audits in both themes,
- semantic labels/roles for dynamic panels and alerts.

## Open questions

- Should migration happen before or after real backend auth is introduced?
- Is SSR needed for core pages, or is static + API hydration sufficient?
- Should TypeScript be introduced during migration or after parity?
- Which hosting target is primary for production operations?
- What telemetry/observability stack is required for frontend incidents?
