# FinSight — Product Overview

## What it is
A mobile-first personal finance planning app. Track money, plan budgets/goals/bills, import transactions via Plaid or Gmail, and get AI-powered insights.

## Platform strategy
- **Phase 1:** React Native (Expo) mobile app
- **Phase 2:** Web app (Next.js) using the same backend and shared packages

## Who it's for
Anyone who wants a configurable, self-hostable finance planner — not locked to one person's data. The app should work for any user with their own accounts and data sources.

## Backend
Next.js 14 App Router API backend. Repo: https://github.com/RAHIL1191/Finsight/tree/main/Finsight-Backend

Backend domains already built:
- `auth` — NextAuth with OAuth (Google/GitHub)
- `me` — user profile
- `accounts` — bank/manual accounts
- `transactions` — income/expense records
- `budgets` — category-based spending limits
- `bills` — recurring obligations
- `goals` — savings/debt targets
- `cashflow` — monthly income vs expenses analytics
- `net-worth` — asset/liability time-series
- `plaid` — bank sync integration
- `gmail/import` — email-based transaction extraction
- `AIInsightCard`, `AIConversation`, `MonthlyReport` — AI layer

## Design bar
Premium feel. Think Monarch Money or Copilot — calm, trustworthy, data-dense but readable. Dark-first, system toggle.
