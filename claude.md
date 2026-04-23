# FinSight — AI Finance Tracker

## Project Overview

Personal finance app with **Expo/React Native mobile frontend** and **Next.js 14 API backend** deployed on Vercel. MongoDB via Mongoose. Google OAuth via NextAuth. Plaid + Gmail for bank sync. Toggle-based light/dark theme.

## Architecture

```
Finsight-Mobile/       # Expo SDK 54, React Native 0.81, expo-router v6
Finsight-Backend/      # Next.js 14 App Router, Vercel, MongoDB/Mongoose
```

### Backend (Next.js 14 — App Router)
- **Auth**: NextAuth v4 + Google OAuth → `lib/auth-options.ts`, `lib/auth.ts`
- **DB**: Mongoose → `lib/mongodb.ts` (singleton connection)
- **Routes**: `app/api/{resource}/route.ts` (GET list, POST create), `app/api/{resource}/[id]/route.ts` (GET one, PUT update, DELETE)
- **Auth guard**: Every route calls `getCurrentUserId()` from `lib/auth.ts`, returns 401 if null
- **Validation**: Zod schemas in `types/api.ts`; always `safeParse` before DB ops
- **Response format**: `ok(data)` / `fail(message, details?)` from `lib/api-response.ts`
- **All responses**: `{ success: true, data: ... }` or `{ success: false, error: "...", details?: ... }`

### Frontend (Expo + NativeWind)
- **Styling**: NativeWind v4 (TailwindCSS for RN) — `tailwind.config.js`, supports `dark:` variant
- **Theme**: Toggle-based light/dark mode via `context/ThemeContext.tsx`, preference saved in AsyncStorage
- **Dark colors**: primary `#6C63FF`, background `#0F0F14`, surface `#1A1A24`, border `#2A2A38`, textPrimary `#FFFFFF`, textSecondary `#8888AA`
- **Light colors**: primary `#6C63FF`, background `#F5F5F7`, surface `#FFFFFF`, border `#E5E5EA`, textPrimary `#1C1C1E`, textSecondary `#8E8E93`
- **Semantic colors** (same both themes): success `#22C55E`, danger `#EF4444`, warning `#F59E0B`
- **Auth**: `context/AuthContext.tsx` (AuthProvider wraps app), `lib/auth.ts` (SecureStore session + WebBrowser OAuth)
- **API client**: `lib/api.ts` — `apiFetch<T>(path, options)` adds Bearer token from SecureStore
- **Navigation**: expo-router file-based. Root `_layout.tsx` → SafeAreaProvider + AuthProvider + Stack
- **Entry**: `app/index.tsx` — checks auth → sign-in / onboarding / (tabs)/home

### Models (Mongoose — 11 collections)
| Model | Key Fields |
|---|---|
| User | name, email, image, currency(CAD), timezone, biometricLock, onboardingComplete |
| Account | name, institution, type(12 types), source(manual/plaid/snaptrade), balance, currency |
| Transaction | amount, type(income/expense/transfer), status(cleared/pending/needs_review), source, category, date, tags |
| Budget | name, category, amount, period(weekly/monthly/yearly), rollover, aiProjectedSpend |
| Bill | name, amount, frequency(5 types), nextDueDate, status(active/paused/cancelled), reminderDaysBefore |
| Goal | name, targetAmount, currentAmount, targetDate, status(active/paused/achieved/cancelled), aiProjectedDate |
| NetWorthSnapshot | date, totalAssets, totalLiabilities, netWorth, breakdown(by account type) |
| MonthlyReport | month(YYYY-MM), totalIncome, totalExpenses, netCashflow, topCategories, aiNarrative |
| AIConversation | title, messages[{role, content}], model |
| AIInsightCard | title, body, type(tip/alert/summary/anomaly/projection), month, dismissed |
| PortfolioPosition | symbol, quantity, averageCost, currentPrice, marketValue, unrealizedGain |

### Existing API Routes
| Route | Methods | Status |
|---|---|---|
| `/api/accounts` | GET, POST | ✅ Built |
| `/api/accounts/[id]` | GET, PUT, DELETE | ✅ Built |
| `/api/transactions` | GET, POST | ✅ Built |
| `/api/transactions/[id]` | GET, PUT, DELETE | ✅ Built |
| `/api/transactions/review` | GET | ✅ Built |
| `/api/budgets` | GET, POST | ✅ Built |
| `/api/budgets/[id]` | GET, PUT, DELETE | ✅ Built |
| `/api/bills` | GET, POST | ✅ Built |
| `/api/bills/[id]` | GET, PUT, DELETE | ✅ Built |
| `/api/goals` | GET, POST | ✅ Built |
| `/api/goals/[id]` | GET, PUT, DELETE | ✅ Built |
| `/api/cashflow` | GET | ✅ Built |
| `/api/net-worth` | GET | ✅ Built |
| `/api/plaid/*` | link, exchange, sync | ✅ Built |
| `/api/gmail/*` | Gmail import | ✅ Built |
| `/api/me` | GET | ✅ Built |
| `/api/auth/mobile` | GET | ✅ Built |

### Existing Mobile Screens
| Screen | Status |
|---|---|
| `app/index.tsx` (splash/router) | ✅ Built |
| `app/(auth)/sign-in.tsx` | ✅ Built |
| `app/(auth)/callback.tsx` | ✅ Built |

---

## Build Rules

1. **Before coding any phase**: Create a `task.md` checklist first, then execute items one by one
2. **Mobile screens** go in `app/(tabs)/` for bottom-tab screens and `app/(modals)/` for full-screen modals
3. **Reusable components** go in `components/` with descriptive names (e.g., `TransactionCard.tsx`, `BudgetProgressBar.tsx`)
4. **Hooks** go in `hooks/` (e.g., `useTransactions.ts`, `useBudgets.ts`) — encapsulate `apiFetch` + state
5. **All API calls** use `apiFetch<T>` from `lib/api.ts` — never raw `fetch` in components
6. **Style with NativeWind** className strings — use the defined color tokens from tailwind.config.js
7. **Theme toggle** — use `bg-background dark:bg-background` pattern. All screens must support both light and dark. Use `useTheme()` hook from `context/ThemeContext.tsx` for the toggle state
8. **Typography**: `text-textPrimary` for primary text, `text-textSecondary` for secondary — colors auto-switch with theme
9. **Every list screen** must have pull-to-refresh + empty state + loading skeleton
10. **Forms**: use controlled inputs, validate client-side before submitting, show inline errors
11. **After finishing a phase**: commit + push to `main` branch
12. **Backend API changes**: If a new endpoint is needed, create route in `Finsight-Backend/app/api/`, add Zod schema in `types/api.ts`, follow existing patterns exactly

---

## Theme System

### Implementation
- **`context/ThemeContext.tsx`**: Provides `{ theme, toggleTheme, isDark }`. Wraps app in `_layout.tsx` alongside AuthProvider. Persists choice to `AsyncStorage` key `finsight_theme` (`"light"` or `"dark"`). Defaults to device system preference via `useColorScheme()`
- **`tailwind.config.js`**: Add `darkMode: 'class'` and define both light/dark color tokens. NativeWind v4 uses the `dark:` variant
- **All components**: Use semantic class names like `bg-background`, `bg-surface`, `text-textPrimary`. NativeWind resolves the correct value based on active theme
- **Toggle control**: Located in Settings (Phase 11) as a prominent switch — "Dark Mode" / "Light Mode" with sun/moon icon

---

## Transaction Sync & Deduplication

Transactions flow in from **three sources**: manual entry, Plaid bank sync, and Gmail email import. The system must never create duplicate records.

### Dedup Strategy
Each source uses a unique external ID stored on the Transaction document:
- **Plaid**: `plaidTransactionId` — Plaid's stable transaction ID. Before inserting, query `Transaction.findOne({ userId, plaidTransactionId })`. Skip if exists
- **Gmail**: `gmailMessageId` — Gmail message ID. Before inserting, query `Transaction.findOne({ userId, gmailMessageId })`. Skip if exists
- **Manual**: No external ID — always created. User is the source of truth
- **Cross-source dedup**: After Gmail/Plaid import, flag imported transactions as `status: "needs_review"` so user can approve/merge if the same transaction came from both sources

### Plaid Sync Flow
1. User connects bank via Plaid Link (Phase 5)
2. Backend calls Plaid `transactions/sync` with stored cursor → gets new/modified/removed transactions
3. For each new transaction: check `plaidTransactionId` doesn't exist → create with `source: "plaid"`, `status: "cleared"`
4. For modified: find by `plaidTransactionId`, update amount/name/date
5. For removed: find by `plaidTransactionId`, delete or mark inactive
6. Store updated cursor on the Account document (`plaidCursor` field)
7. Endpoint: `POST /api/plaid/sync` — already built

### Gmail Sync Flow
1. User authorizes Gmail access (OAuth scope added during sign-in)
2. Backend searches inbox for bank notification emails → parses amount, merchant, date via regex/patterns
3. For each parsed transaction: check `gmailMessageId` doesn't exist → create with `source: "gmail_import"`, `status: "needs_review"`
4. User reviews in Pending Review tab (Phase 4) — can approve, edit category, or delete
5. Endpoint: `POST /api/gmail/sync` — already built

### Sync UI (Mobile)
- **Accounts screen**: "Sync" button per connected account → calls `POST /api/plaid/sync` for that account
- **Settings screen**: "Sync from Email" button → calls `POST /api/gmail/sync`
- **Pull-to-refresh** on Transactions screen triggers sync for all connected accounts
- **Sync status**: Show last synced timestamp per account, loading spinner during sync
- **Review badge**: Tab bar badge on Transactions tab showing count of `needs_review` transactions

---

## PHASE 3 — Home Dashboard

**Tab**: `(tabs)/home.tsx` — the main landing screen after login

### Features
- **Header**: User greeting ("Good morning, {name}"), profile avatar (user.image), notification bell icon
- **Net Worth Card**: Large card showing total net worth from `/api/net-worth`, trend arrow (up/down vs last month), mini sparkline chart (last 6 months)
- **Quick Stats Row**: 3 mini cards — Monthly Income, Monthly Expenses, Net Cashflow — from `/api/cashflow?period=current_month`
- **Recent Transactions**: Last 5 transactions from `/api/transactions?limit=5`, each showing icon+name+amount+date. "See All" link → Transactions tab
- **Upcoming Bills**: Next 3 bills due from `/api/bills?status=active&sort=nextDueDate&limit=3`, showing name+amount+due date+days until due. "See All" link → Bills tab
- **Budget Alerts**: Any budgets over 80% spent shown as warning cards. Query `/api/budgets` + calculate spent from transactions
- **AI Insight Card**: Latest undismissed AIInsightCard from `GET /api/ai/insights?dismissed=false&limit=1` (build this endpoint). Dismissable

### New Backend Needed
- `GET /api/ai/insights` — list insight cards, filter by `dismissed`, sorted by `createdAt desc`
- `PATCH /api/ai/insights/[id]` — toggle `dismissed`
- `GET /api/dashboard/summary` — (optional) single endpoint returning netWorth + cashflow + upcoming bills + budget alerts in one call to reduce mobile API calls

### Components to Build
- `components/NetWorthCard.tsx`
- `components/QuickStatCard.tsx`
- `components/TransactionItem.tsx` (reused in Transactions tab)
- `components/BillItem.tsx` (reused in Bills tab)
- `components/InsightCard.tsx`

---

## PHASE 4 — Transactions

**Tab**: `(tabs)/transactions.tsx`

### Features
- **Search bar**: Filter by name (uses `search` query param)
- **Filter chips**: By type (income/expense/transfer), status (cleared/pending/needs_review), category, date range, source (manual/plaid/gmail_import)
- **Transaction list**: Infinite scroll (page-based pagination). Each item shows: category icon, name, amount (green for income, red for expense), date, account name, source badge (bank icon for plaid, email icon for gmail, pencil for manual)
- **Grouped by date**: Section headers like "Today", "Yesterday", "Apr 20, 2026"
- **Pull to refresh**: Re-fetches page 1 AND triggers sync for all connected Plaid accounts
- **FAB (Floating Action Button)**: "+" to add manual transaction → opens modal
- **Add Transaction Modal** (`(modals)/add-transaction.tsx`): Form with fields — name, amount, type (toggle), category (picker), account (picker from user's accounts), date (date picker), notes, tags
- **Transaction Detail** (`(modals)/transaction-detail.tsx`): Full view + edit + delete. Shows source origin (Plaid/Gmail/Manual). Tap a transaction to open
- **Pending Review Tab**: Filter `status=needs_review`, show with approve/edit/reject actions. This is where Gmail-imported and flagged Plaid transactions land. Approve changes status to `cleared`. Badge count shown on tab bar
- **Sync indicator**: When pull-to-refresh triggers Plaid/Gmail sync, show a subtle "Syncing..." banner at top

### Components to Build
- `components/TransactionItem.tsx` (if not already from Phase 3) — include source icon
- `components/FilterChips.tsx`
- `components/CategoryPicker.tsx`
- `components/AccountPicker.tsx`
- `components/SyncBanner.tsx` — shown during active sync
- `hooks/useTransactions.ts` — pagination, filters, search state
- `hooks/useSync.ts` — triggers Plaid + Gmail sync, tracks loading state

---

## PHASE 5 — Accounts

**Tab**: `(tabs)/accounts.tsx`

### Features
- **Account list grouped by type**: Sections — Cash & Banking (checking, savings, cash), Credit (credit), Investments (investment, rrsp, tfsa, crypto), Loans (mortgage, loan, heloc), Other
- **Each account card**: Name, institution, balance (formatted with currency), last synced date, type icon
- **Total balance per section**: Sum shown in section header
- **Add Account button**: Opens `(modals)/add-account.tsx` — form with name, institution, type (picker), balance, currency
- **Account Detail** (`(modals)/account-detail.tsx`): Shows account info + recent transactions for that account (filtered `/api/transactions?accountId=X`), balance history chart
- **Plaid Link**: Button to connect bank via Plaid — uses `/api/plaid/link` to get link token, opens Plaid Link SDK, exchanges via `/api/plaid/exchange`
- **Swipe actions**: Edit / Archive (set isActive=false)

### Components to Build
- `components/AccountCard.tsx`
- `components/AccountGroupSection.tsx`
- `hooks/useAccounts.ts`

---

## PHASE 6 — Budgets

**Tab**: `(tabs)/budgets.tsx`

### Features
- **Budget list**: Each budget shows — name, category, circular progress ring (spent/limit), amount spent vs limit, period label
- **Progress colors**: Green (<60%), Yellow (60-80%), Red (>80%)
- **Overall summary bar**: Total budgeted vs total spent for current period at top
- **Add Budget**: Opens `(modals)/add-budget.tsx` — name, category, amount, period (weekly/monthly/yearly), rollover toggle
- **Budget Detail** (`(modals)/budget-detail.tsx`): Spending breakdown, list of transactions in this category for current period, daily spending chart, AI projected spend
- **Spent calculation**: Frontend queries `/api/transactions?category=X&from=periodStart&to=periodEnd&type=expense` and sums amounts, OR create a backend endpoint `GET /api/budgets/progress` that returns spent amounts

### New Backend Needed
- `GET /api/budgets/progress` — Returns each active budget with `spent` calculated server-side from transactions in the current period

### Components to Build
- `components/BudgetCard.tsx` — with circular progress ring
- `components/ProgressRing.tsx` — animated SVG circle
- `hooks/useBudgets.ts`

---

## PHASE 7 — Bills

**Tab**: `(tabs)/bills.tsx`

### Features
- **Upcoming bills section**: Sorted by `nextDueDate` ascending, showing days until due with color coding (red if ≤3 days, yellow if ≤7, green otherwise)
- **Calendar strip**: Horizontal scrollable week/month view highlighting days with bills due
- **Bill item**: Name, amount, frequency badge, next due date, status indicator
- **Add Bill**: Opens `(modals)/add-bill.tsx` — name, amount, category, frequency, due day, reminder days, linked account, payee name
- **Bill Detail** (`(modals)/bill-detail.tsx`): Full details, edit, mark as paid (auto-create transaction + advance nextDueDate), pause/cancel
- **Mark as Paid**: When user marks paid → POST to `/api/transactions` (auto-create expense transaction) + PATCH `/api/bills/[id]` to advance `nextDueDate` based on frequency
- **Overdue section**: Bills where nextDueDate < today, shown with red indicator

### New Backend Needed
- `PATCH /api/bills/[id]/mark-paid` — creates corresponding transaction + advances nextDueDate

### Components to Build
- `components/BillItem.tsx` (if not already from Phase 3)
- `components/CalendarStrip.tsx`
- `hooks/useBills.ts`

---

## PHASE 8 — Goals

**Tab**: `(tabs)/goals.tsx`

### Features
- **Goal cards**: Each shows — name, progress bar (currentAmount/targetAmount), percentage, target date with countdown, AI projected date
- **Status badges**: Active (green), Paused (yellow), Achieved (gold with confetti animation)
- **Add Goal**: Opens `(modals)/add-goal.tsx` — name, description, target amount, target date, linked account
- **Goal Detail** (`(modals)/goal-detail.tsx`): Full details, contribution history chart, edit, add contribution (PATCH currentAmount), AI monthly contribution suggestion
- **Add Contribution**: Quick action to increment `currentAmount` — PATCH `/api/goals/[id]` with new currentAmount
- **Completed goals**: Separate section at bottom for achieved goals

### Components to Build
- `components/GoalCard.tsx`
- `components/ProgressBar.tsx` — animated horizontal bar
- `hooks/useGoals.ts`

---

## PHASE 9 — Analytics

**Screen**: `(tabs)/analytics.tsx`

### Features
- **Period selector**: Toggle between weekly / monthly / yearly views
- **Spending by category**: Donut/pie chart — query `/api/transactions?type=expense&from=...&to=...`, aggregate by category client-side or add backend endpoint
- **Income vs Expenses**: Bar chart — monthly comparison for last 6 months from `/api/cashflow`
- **Cash flow trend**: Line chart — net cashflow over time
- **Net worth history**: Line chart — from `/api/net-worth` snapshots
- **Top spending categories**: Ranked list with amounts and percentage of total
- **Monthly comparison**: This month vs last month — income, expenses, savings rate

### New Backend Needed
- `GET /api/analytics/spending-by-category?from=...&to=...` — aggregated category spending
- `GET /api/analytics/monthly-comparison` — current vs previous month stats
- OR compute all client-side from existing endpoints

### Libraries Needed
- `react-native-chart-kit` or `victory-native` or `react-native-gifted-charts` for charts — pick one, install via npm

### Components to Build
- `components/DonutChart.tsx`
- `components/BarChart.tsx`
- `components/LineChart.tsx`
- `components/PeriodSelector.tsx`
- `hooks/useAnalytics.ts`

---

## PHASE 10 — AI Insights

**Screen**: `(tabs)/ai.tsx`

### Features
- **Insight Feed**: List of AIInsightCard documents — tip/alert/summary/anomaly/projection. Each card styled differently by type with appropriate icon
- **Chat Interface**: Full-screen chat with AI. Chat bubble UI — user messages right-aligned (primary color), AI messages left-aligned (surface color)
- **Chat input**: Text input + send button at bottom with keyboard avoiding view
- **Conversation history**: List of past conversations from `/api/ai/conversations`
- **New conversation**: Floating button to start fresh chat

### New Backend Needed
- `GET /api/ai/conversations` — list user's conversations (title, updatedAt, preview), sorted by updatedAt desc
- `POST /api/ai/conversations` — create new conversation
- `GET /api/ai/conversations/[id]` — get full conversation with messages
- `POST /api/ai/conversations/[id]/messages` — send message, get AI response. Backend calls OpenRouter API with user's financial context injected as system prompt
- `GET /api/ai/insights` — (from Phase 3 if not built)
- `PATCH /api/ai/insights/[id]` — dismiss insight

### AI System Prompt Context
The system prompt should inject: user's account balances summary, recent spending patterns, active budgets with progress, upcoming bills, active goals with progress. Keep it concise to fit token limits.

### Components to Build
- `components/InsightCard.tsx` (from Phase 3)
- `components/ChatBubble.tsx`
- `components/ChatInput.tsx`
- `hooks/useAIChat.ts`
- `hooks/useInsights.ts`

---

## PHASE 11 — Settings

**Screen**: `(tabs)/settings.tsx`

### Features
- **Profile section**: Avatar, name, email (from AuthContext user). Tap to edit name
- **Appearance**:
  - **Theme toggle** — prominent switch at top of settings: Dark/Light with sun/moon icon. Uses `useTheme().toggleTheme()`. Saved to AsyncStorage instantly
  - System default option (follow device setting)
- **Preferences**:
  - Currency selector (CAD, USD, EUR, GBP, INR — PATCH `/api/me`)
  - Timezone selector
- **Security**:
  - Biometric lock toggle (uses `expo-local-authentication`)
  - Lock timeout picker (1, 2, 5, 10, 30, 60 min)
- **Notifications**:
  - Bill reminders toggle
  - Budget alerts toggle
  - Weekly summary toggle
- **Connected accounts**: List of Plaid-linked accounts with disconnect option
- **Sync**:
  - "Sync Bank Accounts" button — triggers Plaid sync for all connected accounts
  - "Sync from Email" button — triggers Gmail import
  - Last sync timestamp shown per source
- **Data**:
  - Export data (CSV download)
  - Import transactions (CSV upload)
- **About**: App version, privacy policy link, terms of service link
- **Sign out**: Calls `signOut()` from auth context, clears SecureStore, navigates to sign-in
- **Danger zone**: Delete account (with confirmation modal)

### New Backend Needed
- `PATCH /api/me` — update user profile (name, currency, timezone, biometricLock settings, pushToken)
- `DELETE /api/me` — delete user account + all associated data (cascade delete)
- `GET /api/me/export` — generate CSV of all user data
- `POST /api/me/import` — import transactions from CSV

### Components to Build
- `components/SettingsRow.tsx` — icon + label + right control (toggle/chevron/value)
- `components/SettingsSectionHeader.tsx`
- `components/ThemeToggle.tsx` — themed sun/moon switch

---

## Tab Bar Configuration

The bottom tab bar should be configured in `app/(tabs)/_layout.tsx`:

| Tab | Icon | Label |
|---|---|---|
| home | `home` | Home |
| transactions | `list` | Transactions |
| accounts | `credit-card` | Accounts |
| budgets | `pie-chart` | Budgets |
| ai | `sparkles` | AI |

Bills, Goals, Analytics, and Settings are accessed from the Home screen or via a "More" menu / header icons, not as primary tabs (5 tabs max for mobile UX).

### Navigation Structure
```
app/
├── (tabs)/
│   ├── _layout.tsx          # Tab navigator config
│   ├── home.tsx
│   ├── transactions.tsx
│   ├── accounts.tsx
│   ├── budgets.tsx
│   └── ai.tsx
├── (modals)/
│   ├── add-transaction.tsx
│   ├── transaction-detail.tsx
│   ├── add-account.tsx
│   ├── account-detail.tsx
│   ├── add-budget.tsx
│   ├── budget-detail.tsx
│   ├── add-bill.tsx
│   ├── bill-detail.tsx
│   ├── add-goal.tsx
│   ├── goal-detail.tsx
│   └── settings.tsx
├── bills.tsx
├── goals.tsx
└── analytics.tsx
```

---

## Environment Variables

### Backend (.env.local on Vercel)
```
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET, JWT_SECRET
NEXTAUTH_URL=https://finsight-one-chi.vercel.app
MONGODB_URI
PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV
```

### Mobile (constants/config.ts)
```
API_URL = "https://finsight-one-chi.vercel.app"
```

## Deployment
- Backend: auto-deploys on push to `main` via Vercel
- Mobile: Expo Go for dev, EAS Build for production
- After each phase: `git add . && git commit -m "feat: phase N description" && git push origin main`
