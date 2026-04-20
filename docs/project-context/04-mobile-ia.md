# FinSight — Mobile Information Architecture

## Tab Structure
```
Bottom tabs: Home | Transactions | Plan | Insights | Settings
```

## Screen Inventory

### Stack: Auth (no tabs)
| Screen | Route | Description |
|---|---|---|
| Splash | `/splash` | Session restore, app init |
| Welcome | `/welcome` | Intro + sign in CTA |
| Sign In | `/auth/signin` | Auth entry (WebView or native OAuth) |
| Auth Success | `/auth/callback` | Post-auth redirect handler |
| Onboarding | `/onboarding/*` | Multi-step setup: profile, currency, data source |

### Tab: Home
| Screen | Key data |
|---|---|
| Home Dashboard | Net worth card, cashflow summary, budgets at risk, upcoming bills, goals, recent transactions |

### Tab: Transactions
| Screen | Description |
|---|---|
| Transaction List | Search, filter chips, account filter, date presets |
| Transaction Detail | Full record: merchant, category, account, amount, notes |
| Transaction Edit | Inline edit form for category, notes, date, merchant |

### Tab: Plan (segmented: Budgets / Bills / Goals)
| Screen | Description |
|---|---|
| Budgets Overview | All budgets, category spend vs limit, overspend alerts |
| Budget Detail | Progress chart, transaction breakdown, trend |
| Bills Overview | List + calendar toggle, due-soon highlights |
| Bill Detail | Payment schedule, status, linked transactions |
| Goals Overview | All goals, progress bars, target dates |
| Goal Detail | Contribution history, scenario suggestions |

### Tab: Insights
| Screen | Description |
|---|---|
| Insight Feed | AI-generated insight cards |
| Monthly Report | Summary of last month's finances |
| (Future) AI Chat | Conversation assistant |

### Tab: Settings
| Screen | Description |
|---|---|
| Profile | Name, email, avatar |
| Preferences | Currency, locale, fiscal month start |
| Connected Sources | Plaid accounts, Gmail status |
| Notifications | Bill alerts, budget warnings, goal nudges |
| Appearance | Dark/light/system |
| Logout / Account | Sign out, delete account |

### Modals / Sheets (global)
Add Account · Add Transaction · Add Budget · Add Bill · Add Goal
Filter Sheet · Confirm Delete · Error/Reconnect · Import Center

## Navigation Rules
- Modals always stack over current tab
- Detail screens push onto tab stack (not modal)
- Auth stack replaces tab stack until authenticated
- Import Center accessible from Settings > Connected Sources
