# FinSight — Design System

## Theme
Dark-first, system toggle. No neons or loud gradients — premium finance aesthetic.

## Color Tokens
```
Background:    #0F1117  (dark surface)
Card:          #1A1D27
Border:        #2A2D3A
Text primary:  #F0F2F8
Text muted:    #8B8FA8

Accent blue:   #2563EB  (primary action)
Success green: #10B981  (positive, income)
Danger red:    #DC2626  (negative, overspend)
Warning amber: #F59E0B  (due soon, at risk)
```

## Typography
- Use system font stack (SF Pro on iOS, Roboto on Android)
- Currency/numbers: tabular figures, monospaced numerals for alignment
- Body: 14-15px, muted for secondary info
- Headers: 18-22px semibold

## Spacing Scale
4 / 8 / 12 / 16 / 24 / 32 / 48

## Component States (required for every data component)
- `loading` → skeleton shimmer
- `empty` → icon + message + CTA button
- `error` → message + retry action
- `success` → normal render

## Finance-specific rules
- Always show currency symbol
- Negative amounts in red, positive in green
- Large numbers use compact notation (1.2K, 3.4M) in cards, full in detail
- Dates: relative in lists ("2 days ago"), absolute in detail ("Apr 14, 2026")

## Cards
All cards use: rounded-2xl, card background, 1px border, 16px padding
KPI cards: icon top-left, value large, label muted, optional trend indicator

## Chart style
- Line charts: single accent color, gradient fill below
- Bar charts: accent for current period, muted for past
- Donut/pie: limited to 5 segments max, rest grouped as "Other"
