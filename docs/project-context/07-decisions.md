# FinSight — Decision Log

---

## DEC-001: Mobile-first platform strategy
- **Date:** 2026-04-15
- **Status:** ✅ Accepted
- **Decision:** Build mobile app first (Expo/React Native), add web app later
- **Why:** User's stated priority; mobile gives faster feedback loop and production value
- **Consequences:** Shared packages become critical from day one so web reuse is clean later

---

## DEC-002: Configurable architecture
- **Date:** 2026-04-12
- **Status:** ✅ Accepted
- **Decision:** App must be reusable by anyone — no hardcoded personal data or assumptions
- **Why:** Stated goal is a production-grade, GitHub-shareable product
- **Consequences:** AppConfig object, feature flags, branding tokens are first-class concerns; not an afterthought

---

## DEC-003: Multi-session docs-driven development
- **Date:** 2026-04-16
- **Status:** ✅ Accepted
- **Decision:** Use `docs/project-context/` as persistent project memory across separate chats
- **Why:** Project is too large for one chat; continuity requires a source of truth in the repo
- **Consequences:** Must update `06-feature-status.md`, `07-decisions.md`, `08-next-chat-prompt.md` after every session

---

## DEC-004: Auth strategy
- **Date:** 2026-04-16
- **Status:** ⏳ Pending — must resolve before Milestone 2
- **Options:**
  - A: WebView-based NextAuth (fast, uses existing backend, okay for MVP)
  - B: OAuth PKCE + JWT access token + refresh rotation (proper mobile auth, recommended long-term)
- **Recommendation:** Option B for production-grade mobile + future web
- **Next step:** Rahil to confirm, then update this entry to ✅ Accepted

---

## DEC-005: Monorepo structure
- **Date:** 2026-04-16
- **Status:** ✅ Accepted
- **Decision:** `apps/mobile`, `apps/web`, `packages/api-client`, `packages/domain`, `packages/ui-tokens`, `packages/utils`, `packages/config`
- **Why:** Enables code reuse between mobile and web without duplicating finance logic
- **Consequences:** pnpm workspaces or Turborepo needed; add to setup in Milestone 1
