// models/Account.ts

import mongoose, { Schema, Document, Model } from "mongoose";
import type { IAccount, AccountType, AccountSource } from "@/types";

// ─── Document Interface ───────────────────────────────────────────────────────

export interface IAccountDocument
    extends Omit<IAccount, "_id" | "createdAt" | "updatedAt">,
    Document { }

// ─── Schema ───────────────────────────────────────────────────────────────────

const AccountSchema = new Schema<IAccountDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        name: {
            type: String,
            required: [true, "Account name is required"],
            trim: true,
            maxlength: [100, "Account name cannot exceed 100 characters"]
        },

        institution: {
            type: String,
            trim: true,
            maxlength: [100, "Institution name cannot exceed 100 characters"],
            default: null
        },

        type: {
            type: String,
            enum: [
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
            ] satisfies AccountType[],
            required: true
        },

        source: {
            type: String,
            enum: ["manual", "plaid", "snaptrade"] satisfies AccountSource[],
            required: true
        },

        balance: {
            type: Number,
            required: true,
            default: 0
        },

        currency: {
            type: String,
            required: true,
            default: "CAD",
            uppercase: true,
            minlength: 3,
            maxlength: 3
        },

        // Plaid-specific
        plaidAccessToken: {
            type: String,
            default: null,
            select: false
        },
        plaidItemId: {
            type: String,
            default: null
        },
        plaidAccountId: {
            type: String,
            default: null
        },

        // SnapTrade-specific
        snapTradeAccountId: {
            type: String,
            default: null
        },
        snapTradeBrokerageId: {
            type: String,
            default: null
        },

        lastSyncedAt: {
            type: Date,
            default: null
        },

        isActive: {
            type: Boolean,
            default: true
        },

        sortOrder: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Per-user account listing, ordered by sortOrder
AccountSchema.index({ userId: 1, sortOrder: 1 });

// Fast lookup by Plaid identifiers
AccountSchema.index({ userId: 1, plaidItemId: 1, plaidAccountId: 1 });

// Fast lookup by SnapTrade identifiers
AccountSchema.index({ userId: 1, snapTradeAccountId: 1 });

// ─── Model (singleton-safe) ───────────────────────────────────────────────────

const Account: Model<IAccountDocument> =
    (mongoose.models.Account as Model<IAccountDocument>) ||
    mongoose.model<IAccountDocument>("Account", AccountSchema);

export default Account;