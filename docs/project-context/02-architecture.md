# FinSight — Architecture

## Repo Structure (target monorepo)
```
finsight/
  Finsight-Backend/        ← existing Next.js API backend
  apps/
    mobile/                ← Expo React Native app (Phase 1)
    web/                   ← Next.js web app (Phase 2)
  packages/
    api-client/            ← typed service layer (shared)
    domain/                ← types, enums, validators, mappers
    ui-tokens/             ← colors, spacing, typography
    utils/                 ← formatters, date helpers, chart transforms
    config/                ← env contracts, feature flags
  docs/
    project-context/       ← THIS folder
```

## Mobile Stack
| Concern | Tool |
|---|---|
| Framework | Expo + React Native + TypeScript |
| Navigation | Expo Router |
| Server state | TanStack Query v5 |
| Local state | Zustand (UI only) |
| Forms | React Hook Form + Zod |
| Charts | Victory Native or Skia-based |
| Styling | NativeWind (Tailwind for RN) |
| Auth | See auth section below |

## Auth Decision (PENDING — must finalize before Milestone 2)
Two options discussed:
- **Option A (current):** WebView-based NextAuth — fast to ship, works with existing backend, but not ideal long-term for mobile
- **Option B (recommended long-term):** OAuth PKCE + short-lived JWT access tokens + refresh token rotation — proper mobile auth, secure storage on device, httpOnly cookies on web

**Status:** Not finalized. Must be decided and logged in `07-decisions.md` before mobile auth implementation.

## State Rules
- Server state → TanStack Query only
- UI state → Zustand (filters, modals, draft forms)
- No business logic inside components — lives in `packages/domain`
- All API calls → `packages/api-client` services, never raw fetch in screens

## Config / Configurability
An `AppConfig` object (from `packages/config`) merges:
1. Build-time env vars
2. Runtime capabilities from `/api/me`
3. User preferences

This drives: currency, locale, enabled integrations, branding, feature visibility, onboarding flow.
