# FinSight — API Map

Base URL: determined by `NEXT_PUBLIC_API_URL` env var (configurable per deployment)

## Route Table

| Route | Method | Auth | Frontend screen(s) |
|---|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | — | Sign in, session restore |
| `/api/me` | GET | ✅ | Profile, onboarding, app config |
| `/api/me` | PATCH | ✅ | Profile edit |
| `/api/accounts` | GET | ✅ | Accounts list, Home dashboard |
| `/api/accounts` | POST | ✅ | Add account modal |
| `/api/accounts/[id]` | GET | ✅ | Account detail |
| `/api/accounts/[id]` | PATCH | ✅ | Edit account |
| `/api/accounts/[id]` | DELETE | ✅ | Delete account |
| `/api/transactions` | GET | ✅ | Transactions list, Home recents |
| `/api/transactions` | POST | ✅ | Add transaction modal |
| `/api/transactions/[id]` | GET | ✅ | Transaction detail |
| `/api/transactions/[id]` | PATCH | ✅ | Edit transaction |
| `/api/transactions/[id]` | DELETE | ✅ | Delete transaction |
| `/api/budgets` | GET | ✅ | Budgets overview, Plan tab |
| `/api/budgets` | POST | ✅ | Add budget |
| `/api/budgets/[id]` | GET/PATCH/DELETE | ✅ | Budget detail |
| `/api/bills` | GET | ✅ | Bills list, Home upcoming |
| `/api/bills` | POST | ✅ | Add bill |
| `/api/bills/[id]` | GET/PATCH/DELETE | ✅ | Bill detail |
| `/api/goals` | GET | ✅ | Goals overview |
| `/api/goals` | POST | ✅ | Add goal |
| `/api/goals/[id]` | GET/PATCH/DELETE | ✅ | Goal detail |
| `/api/cashflow` | GET | ✅ | Cashflow screen, Home trend |
| `/api/cashflow/calendar` | GET | ✅ | Cashflow calendar heatmap |
| `/api/net-worth` | GET | ✅ | Net worth screen, Home card |
| `/api/plaid` | GET/POST | ✅ | Plaid connect, Import center |
| `/api/gmail/import` | POST | ✅ | Gmail import flow |

## TanStack Query Key Convention
```ts
['me']
['accounts']
['account', id]
['transactions', filterHash]
['transaction', id]
['budgets']
['budget', id]
['bills']
['bill', id]
['goals']
['goal', id]
['cashflow', { range }]
['netWorth', { range }]
['importStatus']
```

## Service Modules in packages/api-client
`authService` · `meService` · `accountsService` · `transactionsService`
`budgetsService` · `billsService` · `goalsService` · `cashflowService`
`netWorthService` · `plaidService` · `gmailImportService` · `insightsService`

## Gaps to fill
- Exact request/response payloads not yet documented here — update this file from actual backend source as each feature is implemented
- Insight and AI endpoints not fully confirmed yet
