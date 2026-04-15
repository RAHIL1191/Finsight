// types/api.ts

import { z } from "zod";

// ─── Shared Primitives ────────────────────────────────────────────────────────

export const ObjectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

export const ISODateSchema = z.string().datetime({ offset: true });

export const CurrencySchema = z.string().length(3).toUpperCase().default("CAD");

export const PaginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    cursor: z.string().optional() // for infinite scroll
});

export const DateRangeSchema = z.object({
    from: ISODateSchema.optional(),
    to: ISODateSchema.optional()
});

// ─── User ─────────────────────────────────────────────────────────────────────

export const UpdateUserSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    currency: z.string().length(3).toUpperCase().optional(),
    timezone: z.string().min(1).optional(),
    biometricLockEnabled: z.boolean().optional(),
    biometricLockTimeout: z.number().int().min(1).max(60).optional(),
    pushToken: z.string().optional(),
    onboardingComplete: z.boolean().optional()
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

// ─── Account ──────────────────────────────────────────────────────────────────

export const AccountTypeSchema = z.enum([
    "checking",
    "savings",
    "credit",
    "investment",
    "rrsp",
    "tfsa",
    "heloc",
    "mortgage",
    "loan",
    "cash",
    "crypto",
    "other"
]);

export const AccountSourceSchema = z.enum(["manual", "plaid", "snaptrade"]);

export const CreateAccountSchema = z.object({
    name: z.string().min(1).max(100),
    institution: z.string().max(100).optional(),
    type: AccountTypeSchema,
    source: AccountSourceSchema,
    balance: z.number().default(0),
    currency: CurrencySchema,
    isActive: z.boolean().default(true),
    sortOrder: z.number().int().min(0).default(0)
});

export const UpdateAccountSchema = CreateAccountSchema.partial().omit({ source: true });

export const AccountFiltersSchema = z.object({
    type: AccountTypeSchema.optional(),
    source: AccountSourceSchema.optional(),
    isActive: z.coerce.boolean().optional()
});

export type CreateAccountInput = z.infer<typeof CreateAccountSchema>;
export type UpdateAccountInput = z.infer<typeof UpdateAccountSchema>;
export type AccountFilters = z.infer<typeof AccountFiltersSchema>;

// ─── Transaction ──────────────────────────────────────────────────────────────

export const TransactionTypeSchema = z.enum(["income", "expense", "transfer"]);
export const TransactionStatusSchema = z.enum(["cleared", "pending", "needs_review"]);
export const TransactionSourceSchema = z.enum([
    "manual",
    "plaid",
    "gmail_import",
    "csv_import"
]);

export const CreateTransactionSchema = z.object({
    accountId: ObjectIdSchema,
    amount: z.number().positive("Amount must be positive"),
    currency: CurrencySchema,
    type: TransactionTypeSchema,
    status: TransactionStatusSchema.default("cleared"),
    source: TransactionSourceSchema.default("manual"),
    name: z.string().min(1).max(200),
    originalName: z.string().max(200).optional(),
    category: z.string().min(1).max(100),
    subcategory: z.string().max(100).optional(),
    date: ISODateSchema,
    notes: z.string().max(1000).optional(),
    transferAccountId: ObjectIdSchema.optional(),
    tags: z.array(z.string().max(50)).default([]),
    excludeFromBudget: z.boolean().default(false),
    excludeFromNetWorth: z.boolean().default(false),
    attachmentUrl: z.string().url().optional()
});

export const UpdateTransactionSchema = CreateTransactionSchema.partial().omit({
    source: true
});

export const TransactionFiltersSchema = z.object({
    accountId: ObjectIdSchema.optional(),
    type: TransactionTypeSchema.optional(),
    status: TransactionStatusSchema.optional(),
    category: z.string().optional(),
    from: ISODateSchema.optional(),
    to: ISODateSchema.optional(),
    search: z.string().max(200).optional(),
    tags: z.array(z.string()).optional(),
    excludeFromBudget: z.coerce.boolean().optional()
});

export const BulkReviewSchema = z.object({
    transactionIds: z.array(ObjectIdSchema).min(1).max(100),
    action: z.enum(["approve", "reject"])
});

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>;
export type TransactionFilters = z.infer<typeof TransactionFiltersSchema>;
export type BulkReviewInput = z.infer<typeof BulkReviewSchema>;

// ─── Bill ─────────────────────────────────────────────────────────────────────

export const BillFrequencySchema = z.enum([
    "weekly",
    "biweekly",
    "monthly",
    "quarterly",
    "yearly"
]);

export const BillStatusSchema = z.enum(["active", "paused", "cancelled"]);

export const CreateBillSchema = z.object({
    accountId: ObjectIdSchema.optional(),
    name: z.string().min(1).max(100),
    amount: z.number().positive(),
    currency: CurrencySchema,
    category: z.string().min(1).max(100),
    frequency: BillFrequencySchema,
    dueDay: z.number().int().min(1).max(31).optional(),
    nextDueDate: ISODateSchema,
    status: BillStatusSchema.default("active"),
    reminderDaysBefore: z.number().int().min(0).max(30).default(3),
    payeeName: z.string().max(200).optional(),
    notes: z.string().max(1000).optional()
});

export const UpdateBillSchema = CreateBillSchema.partial();

export type CreateBillInput = z.infer<typeof CreateBillSchema>;
export type UpdateBillInput = z.infer<typeof UpdateBillSchema>;

// ─── Budget ───────────────────────────────────────────────────────────────────

export const BudgetPeriodSchema = z.enum(["weekly", "monthly", "yearly"]);

export const CreateBudgetSchema = z.object({
    name: z.string().min(1).max(100),
    category: z.string().min(1).max(100),
    subcategory: z.string().max(100).optional(),
    amount: z.number().positive(),
    currency: CurrencySchema,
    period: BudgetPeriodSchema,
    accountId: ObjectIdSchema.optional(),
    rollover: z.boolean().default(false),
    isActive: z.boolean().default(true)
});

export const UpdateBudgetSchema = CreateBudgetSchema.partial();

export type CreateBudgetInput = z.infer<typeof CreateBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof UpdateBudgetSchema>;

// ─── Goal ─────────────────────────────────────────────────────────────────────

export const GoalStatusSchema = z.enum(["active", "paused", "achieved", "cancelled"]);

export const CreateGoalSchema = z.object({
    accountId: ObjectIdSchema.optional(),
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    targetAmount: z.number().positive(),
    currentAmount: z.number().min(0).default(0),
    currency: CurrencySchema,
    targetDate: ISODateSchema.optional(),
    status: GoalStatusSchema.default("active")
});

export const UpdateGoalSchema = CreateGoalSchema.partial();

export type CreateGoalInput = z.infer<typeof CreateGoalSchema>;
export type UpdateGoalInput = z.infer<typeof UpdateGoalSchema>;

// ─── Net Worth ────────────────────────────────────────────────────────────────

export const NetWorthFiltersSchema = z.object({
    from: ISODateSchema.optional(),
    to: ISODateSchema.optional(),
    limit: z.coerce.number().int().min(1).max(365).default(12)
});

export type NetWorthFilters = z.infer<typeof NetWorthFiltersSchema>;

// ─── Cashflow ─────────────────────────────────────────────────────────────────

export const CashflowQuerySchema = z.object({
    months: z.coerce.number().int().min(1).max(24).default(12),
    accountId: ObjectIdSchema.optional(),
    currency: CurrencySchema
});

export const CalendarQuerySchema = z.object({
    year: z.coerce.number().int().min(2000).max(2100),
    month: z.coerce.number().int().min(1).max(12),
    accountId: ObjectIdSchema.optional()
});

export type CashflowQuery = z.infer<typeof CashflowQuerySchema>;
export type CalendarQuery = z.infer<typeof CalendarQuerySchema>;

// ─── Plaid ────────────────────────────────────────────────────────────────────

export const PlaidExchangeSchema = z.object({
    publicToken: z.string().min(1),
    institutionName: z.string().min(1).max(100).optional(),
    accountIds: z.array(z.string()).optional()
});

export const PlaidSyncSchema = z.object({
    accountId: ObjectIdSchema
});

export type PlaidExchangeInput = z.infer<typeof PlaidExchangeSchema>;
export type PlaidSyncInput = z.infer<typeof PlaidSyncSchema>;

// ─── SnapTrade ────────────────────────────────────────────────────────────────

export const SnapTradeConnectSchema = z.object({
    brokerageId: z.string().min(1)
});

export const SnapTradeSyncSchema = z.object({
    accountId: ObjectIdSchema
});

export type SnapTradeConnectInput = z.infer<typeof SnapTradeConnectSchema>;
export type SnapTradeSyncInput = z.infer<typeof SnapTradeSyncSchema>;

// ─── Gmail Import ─────────────────────────────────────────────────────────────

export const GmailImportSchema = z.object({
    accessToken: z.string().min(1),
    maxMessages: z.number().int().min(1).max(500).default(100)
});

export type GmailImportInput = z.infer<typeof GmailImportSchema>;

// ─── AI Assistant ─────────────────────────────────────────────────────────────

export const AIChatSchema = z.object({
    conversationId: ObjectIdSchema.optional(),
    message: z.string().min(1).max(4000),
    model: z.string().optional()
});

export const AIInsightDismissSchema = z.object({
    insightId: ObjectIdSchema
});

export const AIMonthlyReportSchema = z.object({
    month: z
        .string()
        .regex(/^\d{4}-\d{2}$/, "Month must be in format YYYY-MM")
});

export type AIChatInput = z.infer<typeof AIChatSchema>;
export type AIInsightDismissInput = z.infer<typeof AIInsightDismissSchema>;
export type AIMonthlyReportInput = z.infer<typeof AIMonthlyReportSchema>;

// ─── Push Notifications ───────────────────────────────────────────────────────

export const RegisterPushTokenSchema = z.object({
    token: z.string().min(1).max(500),
    platform: z.enum(["ios", "android"])
});

export type RegisterPushTokenInput = z.infer<typeof RegisterPushTokenSchema>;

// ─── CSV Import ───────────────────────────────────────────────────────────────

export const CSVImportSchema = z.object({
    accountId: ObjectIdSchema,
    /** Raw CSV content as string (upload parsed to string server-side) */
    csv: z.string().min(1),
    /** Column mapping: maps CSV header name → our field name */
    columnMap: z.object({
        date: z.string(),
        amount: z.string(),
        name: z.string(),
        type: z.string().optional(),
        category: z.string().optional(),
        notes: z.string().optional()
    }),
    /** Delimiter character, default comma */
    delimiter: z.string().max(1).default(","),
    /** Skip first N rows (header rows beyond the first) */
    skipRows: z.number().int().min(0).max(10).default(0)
});

export type CSVImportInput = z.infer<typeof CSVImportSchema>;