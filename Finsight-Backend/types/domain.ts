// types/domain.ts

/**
 * FinSight — Core Domain Types
 * All interfaces here mirror Mongoose documents exactly.
 * Use these as the canonical shape across API routes and mobile app.
 */

import { Types } from "mongoose";

// ─── Shared ─────────────────────────────────────────────────────────────────

export type ObjectIdLike = Types.ObjectId | string;

/** ISO 8601 date string or Date object. */
export type ISODateString = string | Date;

// ─── User ────────────────────────────────────────────────────────────────────

export type AuthProvider = "google" | "github" | "email";

export interface IUser {
    _id: ObjectIdLike;
    name: string;
    email: string;
    image?: string;
    providers: AuthProvider[];

    /** hashed password, only set when using magic link / credentials */
    passwordHash?: string;

    /** Preferred currency; defaults to CAD */
    currency: string;

    /** IANA timezone string, e.g. "America/Toronto" */
    timezone: string;

    /** Biometric lock: if true, mobile app enforces Face/Touch ID on launch */
    biometricLockEnabled: boolean;

    /** Minutes of inactivity before the app re-locks. Default: 5 */
    biometricLockTimeout: number;

    /** FCM / Expo push token */
    pushToken?: string;

    /** Whether the user has completed onboarding */
    onboardingComplete: boolean;

    createdAt: ISODateString;
    updatedAt: ISODateString;
}

// ─── Account ─────────────────────────────────────────────────────────────────

export type AccountType =
    | "checking"
    | "savings"
    | "credit"
    | "investment"
    | "rrsp"
    | "tfsa"
    | "heloc"
    | "mortgage"
    | "loan"
    | "cash"
    | "crypto"
    | "other";

export type AccountSource = "manual" | "plaid" | "snaptrade";

export interface IAccount {
    _id: ObjectIdLike;
    userId: ObjectIdLike;

    name: string;
    institution?: string;
    type: AccountType;
    source: AccountSource;

    /** Current balance in account's native currency */
    balance: number;
    currency: string;

    /** Plaid-specific fields */
    plaidAccessToken?: string;
    plaidItemId?: string;
    plaidAccountId?: string;

    /** SnapTrade-specific fields */
    snapTradeAccountId?: string;
    snapTradeBrokerageId?: string;

    /** ISO timestamp of last successful sync */
    lastSyncedAt?: ISODateString;

    /** If false, account is hidden from main views */
    isActive: boolean;

    /** Display order (lower = first) */
    sortOrder: number;

    createdAt: ISODateString;
    updatedAt: ISODateString;
}

// ─── Transaction ─────────────────────────────────────────────────────────────

export type TransactionType = "income" | "expense" | "transfer";

export type TransactionStatus = "cleared" | "pending" | "needs_review";

export type TransactionSource = "manual" | "plaid" | "gmail_import" | "csv_import";

export interface ITransaction {
    _id: ObjectIdLike;
    userId: ObjectIdLike;
    accountId: ObjectIdLike;

    amount: number;
    currency: string;

    type: TransactionType;
    status: TransactionStatus;
    source: TransactionSource;

    /** User-facing description (editable) */
    name: string;

    /** Raw description from bank / email */
    originalName?: string;

    category: string;
    subcategory?: string;

    /** ISO date of when the transaction occurred */
    date: ISODateString;

    /** Notes or memo */
    notes?: string;

    /** For transfers: the counterpart account */
    transferAccountId?: ObjectIdLike;

    /** Plaid transaction id for deduplication */
    plaidTransactionId?: string;

    /** Gmail message id for deduplication */
    gmailMessageId?: string;

    /** Tags for custom grouping */
    tags: string[];

    /** If true, excluded from budget / cashflow calculations */
    excludeFromBudget: boolean;

    /** If true, excluded from net worth calculations */
    excludeFromNetWorth: boolean;

    /** Attachment / receipt URL */
    attachmentUrl?: string;

    createdAt: ISODateString;
    updatedAt: ISODateString;
}

// ─── Bill ────────────────────────────────────────────────────────────────────

export type BillFrequency =
    | "weekly"
    | "biweekly"
    | "monthly"
    | "quarterly"
    | "yearly";

export type BillStatus = "active" | "paused" | "cancelled";

export interface IBill {
    _id: ObjectIdLike;
    userId: ObjectIdLike;
    accountId?: ObjectIdLike;

    name: string;
    amount: number;
    currency: string;
    category: string;

    frequency: BillFrequency;

    /** Day of month (1–31) for monthly/quarterly/yearly bills */
    dueDay?: number;

    /** ISO date of the next due date */
    nextDueDate: ISODateString;

    status: BillStatus;

    /** How many days before due to send a push notification reminder */
    reminderDaysBefore: number;

    /** Auto-linked Plaid payee name for auto-matching */
    payeeName?: string;

    notes?: string;

    createdAt: ISODateString;
    updatedAt: ISODateString;
}

// ─── Budget ──────────────────────────────────────────────────────────────────

export type BudgetPeriod = "weekly" | "monthly" | "yearly";

export interface IBudget {
    _id: ObjectIdLike;
    userId: ObjectIdLike;

    name: string;
    category: string;
    subcategory?: string;

    amount: number;
    currency: string;
    period: BudgetPeriod;

    /** If set, budget only applies to this account */
    accountId?: ObjectIdLike;

    /** AI-projected spend for this period, refreshed periodically */
    aiProjectedSpend?: number;
    aiProjectedAt?: ISODateString;

    /** Rollover unused amount to next period */
    rollover: boolean;

    isActive: boolean;

    createdAt: ISODateString;
    updatedAt: ISODateString;
}

// ─── Goal ────────────────────────────────────────────────────────────────────

export type GoalStatus = "active" | "paused" | "achieved" | "cancelled";

export interface IGoal {
    _id: ObjectIdLike;
    userId: ObjectIdLike;
    accountId?: ObjectIdLike;

    name: string;
    description?: string;

    targetAmount: number;
    currentAmount: number;
    currency: string;

    /** Target date to reach the goal (ISO date) */
    targetDate?: ISODateString;

    status: GoalStatus;

    /** AI-projected completion date, refreshed periodically */
    aiProjectedDate?: ISODateString;
    aiProjectedAt?: ISODateString;

    /** Monthly contribution required to hit target, per AI */
    aiRequiredMonthlyContribution?: number;

    createdAt: ISODateString;
    updatedAt: ISODateString;
}

// ─── Net Worth Snapshot ───────────────────────────────────────────────────────

export interface INetWorthSnapshot {
    _id: ObjectIdLike;
    userId: ObjectIdLike;

    /** ISO date this snapshot was taken */
    date: ISODateString;

    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
    currency: string;

    /** Breakdown by account type */
    breakdown: {
        checking: number;
        savings: number;
        investment: number;
        rrsp: number;
        tfsa: number;
        heloc: number;
        mortgage: number;
        credit: number;
        loan: number;
        cash: number;
        crypto: number;
        other: number;
    };

    createdAt: ISODateString;
}

// ─── Portfolio Position ───────────────────────────────────────────────────────

export interface IPortfolioPosition {
    _id: ObjectIdLike;
    userId: ObjectIdLike;
    accountId: ObjectIdLike;

    symbol: string;
    description?: string;

    quantity: number;
    averageCost: number;
    currentPrice: number;
    marketValue: number;
    currency: string;

    /** Unrealized gain/loss */
    unrealizedGain: number;
    unrealizedGainPercent: number;

    /** SnapTrade position id for deduplication */
    snapTradePositionId?: string;

    lastUpdatedAt: ISODateString;

    createdAt: ISODateString;
    updatedAt: ISODateString;
}

// ─── AI Chat ─────────────────────────────────────────────────────────────────

export type AIMessageRole = "user" | "assistant" | "system";

export interface IAIMessage {
    role: AIMessageRole;
    content: string;
    createdAt: ISODateString;
}

export interface IAIConversation {
    _id: ObjectIdLike;
    userId: ObjectIdLike;

    title?: string;
    messages: IAIMessage[];

    /** OpenRouter model used for this conversation */
    model?: string;

    createdAt: ISODateString;
    updatedAt: ISODateString;
}

export interface IAIInsightCard {
    _id: ObjectIdLike;
    userId: ObjectIdLike;

    title: string;
    body: string;
    type: "tip" | "alert" | "summary" | "anomaly" | "projection";

    /** ISO month string this insight covers, e.g. "2026-04" */
    month?: string;

    /** Whether the user has dismissed this card */
    dismissed: boolean;

    createdAt: ISODateString;
}

// ─── Monthly Report ───────────────────────────────────────────────────────────

export interface IMonthlyReport {
    _id: ObjectIdLike;
    userId: ObjectIdLike;

    /** e.g. "2026-04" */
    month: string;

    totalIncome: number;
    totalExpenses: number;
    netCashflow: number;
    currency: string;

    topCategories: { category: string; amount: number }[];
    insights: string[];

    /** Markdown body generated by AI */
    aiNarrative?: string;

    /** Whether email was sent to user */
    emailSent: boolean;

    createdAt: ISODateString;
}

// ─── API Response Helpers ─────────────────────────────────────────────────────

export interface ApiSuccess<T> {
    success: true;
    data: T;
}

export interface ApiError {
    success: false;
    error: string;
    details?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;