# FinSight — Milestones

Each milestone = one or more focused chats. Each chat = one feature or sub-feature.

---

## M1 — Foundation ← current
- [ ] Finalize auth decision (DEC-004)
- [ ] Initialize monorepo with pnpm workspaces
- [ ] Create `packages/domain` with all shared types from backend models
- [ ] Create `packages/config` with AppConfig contract
- [ ] Update docs post-setup

**Start prompt:** "Help me set up the FinSight monorepo with pnpm workspaces and scaffold the shared packages"

---

## M2 — Mobile Shell
- [ ] Expo app with Expo Router
- [ ] Bottom tab navigation (Home, Transactions, Plan, Insights, Settings)
- [ ] NativeWind + theme tokens
- [ ] Auth flow (after DEC-004 resolved)
- [ ] Splash + session restore
- [ ] `packages/api-client` with base request config

**Start prompt:** "Set up the Expo mobile app shell for FinSight with Expo Router tabs and NativeWind theme"

---

## M3 — Accounts & Transactions
- [ ] accountsService + hooks
- [ ] Accounts list screen
- [ ] Account detail screen
- [ ] transactionsService + hooks
- [ ] Transactions list with filters
- [ ] Transaction detail + edit
- [ ] Home tab with real data

**Start prompt:** "Build the Accounts and Transactions screens for FinSight mobile using the API map"

---

## M4 — Planning
- [ ] budgetsService + bills + goals services
- [ ] Budgets overview + detail
- [ ] Bills list + calendar + detail
- [ ] Goals overview + detail
- [ ] Plan tab segmented nav

**Start prompt:** "Build the Plan tab (Budgets, Bills, Goals) for FinSight mobile"

---

## M5 — Analytics
- [ ] cashflowService + netWorthService
- [ ] Cashflow screen with bar chart
- [ ] Net worth screen with line chart
- [ ] Dashboard analytics cards

**Start prompt:** "Build the Cashflow and Net Worth analytics screens for FinSight"

---

## M6 — Import Center
- [ ] Import center screen
- [ ] Plaid connect WebView/flow
- [ ] Gmail import request flow

**Start prompt:** "Build the Import Center screen and Plaid/Gmail connect flows for FinSight"

---

## M7 — Insights
- [ ] insightsService
- [ ] Insight card feed
- [ ] Monthly report screen

**Start prompt:** "Build the Insights tab with AI insight cards and monthly report for FinSight"

---

## M8 — Web App
- [ ] Confirm shared packages are stable
- [ ] Plan web navigation and layout
- [ ] Build web client consuming same api-client package

**Start prompt:** "Start the FinSight web app using the existing api-client and domain packages"
