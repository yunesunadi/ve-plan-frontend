# VE-Plan Frontend

The single-page web client for VE-Plan, a virtual event planning platform where **organizers**
create events, publish session agendas, approve or invite attendees, and host video meetings, and
**attendees** discover events, register or accept invitations, and join those meetings. Video is
provided by 8x8.vc (Jitsi as a Service).

Built with Angular 22 — fully standalone components, zoneless change detection — Angular Material
(a first-party Material 3 token theme, no Bootstrap), and FullCalendar.

> This is one of two independently deployed apps in the VE-Plan web project. See the umbrella
> repo [`yunesunadi/ve-plan`](https://github.com/yunesunadi/ve-plan) for the overall picture,
> [`PROJECT_SPEC.md`](https://github.com/yunesunadi/ve-plan/blob/main/PROJECT_SPEC.md) for the full
> behavior reference, and
> [`CLAUDE.md`](https://github.com/yunesunadi/ve-plan/blob/main/CLAUDE.md) for code-level
> conventions.

## Features

- **Two role-specific dashboards.** Lazy-loaded feature route trees — `organizer/dashboard/**` and
  `attendee/dashboard/**` — gated by `completeAuthGuard`, which also blocks a signed-in user from
  reaching the other role's tree by URL. Bottom nav for both roles is **Home / Events / My Events /
  Calendar**.
- **Auth.** Email/password with email verification, Google and Facebook OAuth, password reset. The
  JWT lives in `localStorage` under `"token"`; `authInterceptor` attaches it as a bearer header to
  every API request.
- **Events & sessions (organizer).** Create / edit / delete events with cover images, timezone-aware
  times, and a session agenda; search / filter / calendar views.
- **Registration & invitations.** Organizers manage registered users (approve, search, invite);
  attendees register or accept invitations from a single merged "My Events" view segmented
  All / Invited / Registered / Approved / Attending.
- **Video meetings.** Organizers host 8x8.vc meetings; attendees join as participants. Meeting
  analytics dashboard with Chart.js.
- **Real-time notifications.** `socket.io-client` receives live notifications backed by the durable
  server-side store.
- **UI foundation.** ~60 `OnPush` standalone components, a shared component library under
  `src/app/shared/ui/` (`status-chip`, `avatar`, `empty-state`, `error-state`, `skeleton`,
  `page-header`, `breadcrumbs`, `form-error`, `submit-button`, `event-card`, `data-table` — each
  with its own `.spec.ts`), a themed `ConfirmService` dialog replacing every native
  `confirm()` / `alert()`, and a four-severity `CommonService` toast wrapper. **Dark mode is live**
  (Light / Dark / System via the profile menu, no flash on load).

## Architecture

The app is fully standalone: `bootstrapApplication(AppComponent, appConfig)` in `main.ts` — there
is no `AppModule` or `SharedModule`. `app.config.ts` provides the router,
`provideZonelessChangeDetection()` (no `zone.js` in the browser; it remains only as a Karma test
polyfill), animations, the HTTP client with interceptors, and the native date adapter.

**Routing** (`app.routes.ts`) splits into public routes (login, signup, role selection, password
reset, email verification) and the two lazy role trees. `provideRouter` passes
`withComponentInputBinding()`, `withRouterConfig({ paramsInheritanceStrategy: 'always' })`, and
`withNavigationErrorHandler(...)`. Event detail is a persistent shell with routed child tabs
(`…/events/:id/view/{overview,agenda,people}`); `resolvers/event.resolver.ts` loads the event
before the route activates and redirects to a not-found page on `404`.

**Guards** (`guards/`): `authGuard` (JWT presence), `hasRoleGuard` (the `/role` page),
`completeAuthGuard` (`CanMatchFn` gating the lazy trees by sign-in, role assignment, and role
match).

**Interceptors** (`interceptors/`), in order: `authInterceptor` (bearer header),
`errorInterceptor` (rethrows a typed `models/ApiError` from the backend envelope; on `401` clears
the token and navigates to `login`, but does not navigate on `403` / `404`).

**Services** (`services/`) are thin HTTP wrappers, one per backend resource, returning typed
`Observable`s. `caches/` memoizes cross-cutting state for guards. `LayoutService`,
`ConfirmService`, `CommonService`, `BreadcrumbService`, and `ThemeService` are the shared
cross-cutting services.

### Layout

```
src/
├── main.ts, index.html
├── app/
│   ├── app.config.ts, app.routes.ts, app.component.*
│   ├── mod-organizer/        # lazy organizer/dashboard/** route tree
│   ├── mod-attendee/         # lazy attendee/dashboard/** route tree
│   ├── pages/                # shared routed pages (e.g. calendar)
│   ├── shared/               # ui/ component library, event-view shell + store
│   ├── components/           # app-wide components (confirm-dialog, …)
│   ├── layouts/private/      # 100dvh CSS-grid app shell (bottom nav / rail / drawer)
│   ├── core/                 # global-error-handler
│   ├── guards/ interceptors/ resolvers/ caches/ services/ models/
│   └── ...
├── environments/             # environment.ts, .staging.ts, .production.ts
└── styles/                   # _tokens, _theme-colors, _status-tokens, _layout, _utilities, _fonts, …
```

**Styling** (`src/styles/`, `@use`d from the single global `styles.scss`): a first-party Material 3
token theme via `mat.theme()` with `theme-type: color-scheme` (emitting `--mat-sys-*` as
`light-dark(…)`), an app-level token contract (`_tokens.scss`), semantic status tokens, first-party
semantic layout classes (`.stack`, `.cluster`, `.card-grid`, `.form-grid`, `.split`, …) and utility
classes that replaced Bootstrap, self-hosted Ubuntu + Material Icons fonts (no Google Fonts), and a
FullCalendar override block. No Bootstrap import or dependency.

## Prerequisites

- **Node.js** `^22.22.3 || ^24.15.0 || ^26.0.0`
- A running VE-Plan backend (see [`yunesunadi/ve-plan-backend`](https://github.com/yunesunadi/ve-plan-backend))

## Getting started

```bash
npm install
# edit src/environments/environment.ts so apiUrl / socketUrl point at your backend
npm start     # ng serve on http://localhost:4200
```

## Environment configuration

`src/environments/environment.ts` (development), `environment.staging.ts`, and
`environment.production.ts` hold `apiUrl`, `socketUrl` / `socketPath`, the static asset URLs
(`profileUrl` / `coverUrl`), the 8x8.vc `appId` / `meeting_domain`, and the OAuth entry-point URLs
(`google_oauth_url` / `facebook_oauth_url`). Angular swaps in the staging / production file
automatically for those build configurations (`angular.json` `fileReplacements`).

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm start` | Dev server (`ng serve`, development config → `environment.ts`) |
| `npm run start:staging` / `start:prod` | Serve against the staging / production backend |
| `npm run build:staging` / `build:prod` | Production-config builds (clears `dist/` first) |
| `npm test` | Karma/Jasmine unit tests (`ng test --include='**/x.spec.ts'` for one file) |
| `npm run lint` / `lint:fix` | ESLint (flat config) over `src/` — expected to exit 0 |

Nearly every service, guard, and interceptor has a matching `*.spec.ts` — check for one before
assuming a unit needs a new test file.

## Deployment

Build with `npm run build:prod` and serve the contents of `dist/` as static files behind the same
reverse proxy that fronts the API (set `client_max_body_size` to at least 6 MB for cover / profile
uploads).

## Technology stack

Angular 22 (standalone, zoneless) · TypeScript · RxJS · Angular Material + CDK (Material 3) ·
FullCalendar 6 · Chart.js 4 · socket.io-client 4 · ngx-infinite-scroll · date-fns · SCSS
