// models/Transaction.ts

import mongoose, { Schema, Document, Model } from "mongoose";
import type {
    ITransaction,
    TransactionType,
    TransactionStatus,
    TransactionSource
} from "@/types";

// ─── Document Interface ───────────────────────────────────────────────────────

export interface ITransactionDocument
    extends Omit<ITransaction, "_id" | "createdAt" | "updatedAt">,
    Document { }

// ─── Schema ───────────────────────────────────────────────────────────────────

const TransactionSchema = new Schema<ITransactionDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        accountId: {
            type: Schema.Types.ObjectId,
            ref: "Account",
            required: true,
            index: true
        },

        amount: {
            type: Number,
            required: true
        },

        currency: {
            type: String,
            required: true,
            default: "CAD",
            uppercase: true,
            minlength: 3,
            maxlength: 3
        },

        type: {
            type: String,
            enum: ["income", "expense", "transfer"] satisfies TransactionType[],
            required: true
        },

        status: {
            type: String,
            enum: ["cleared", "pending", "needs_review"] satisfies TransactionStatus[],
            default: "cleared",
            index: true
        },

        source: {
            type: String,
            enum: [
                "manual",
                "plaid",
                "gmail_import",
                "csv_import"
            ] satisfies TransactionSource[],
            default: "manual",
            index: true
        },

        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: [200, "Transaction name cannot exceed 200 characters"]
        },

        originalName: {
            type: String,
            trim: true,
            maxlength: [200, "Original name cannot exceed 200 characters"],
            default: null
        },

        category: {
            type: String,
            required: true,
            trim: true,
            maxlength: [100, "Category cannot exceed 100 characters"],
            index: true
        },

        subcategory: {
            type: String,
            trim: true,
            maxlength: [100, "Subcategory cannot exceed 100 characters"],
            default: null
        },

        date: {
            type: Date,
            required: true,
            index: true
        },

        notes: {
            type: String,
            trim: true,
            maxlength: [1000, "Notes cannot exceed 1000 characters"],
            default: null
        },

        transferAccountId: {
            type: Schema.Types.ObjectId,
            ref: "Account",
            default: null
        },

        plaidTransactionId: {
            type: String,
            index: true,
            sparse: true,
            default: null
        },

        gmailMessageId: {
            type: String,
            index: true,
            sparse: true,
            default: null
        },

        tags: {
            type: [String],
            default: []
        },

        excludeFromBudget: {
            type: Boolean,
            default: false,
            index: true
        },

        excludeFromNetWorth: {
            type: Boolean,
            default: false
        },

        attachmentUrl: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// For Transactions tab filtering: by user, account, date, type, and status.
TransactionSchema.index({
    userId: 1,
    accountId: 1,
    date: -1,
    type: 1,
    status: 1
});

// For cashflow and calendar heatmap: user + date range queries.
TransactionSchema.index({ userId: 1, date: -1 });

// For Pending Review sub-tab.
TransactionSchema.index({ userId: 1, status: 1, date: -1 });

// For fast de-duplication of Plaid and Gmail imports.
TransactionSchema.index({ userId: 1, plaidTransactionId: 1 });
TransactionSchema.index({ userId: 1, gmailMessageId: 1 });

// ─── Model (singleton-safe) ───────────────────────────────────────────────────

const Transaction: Model<ITransactionDocument> =
    (mongoose.models.Transaction as Model<ITransactionDocument>) ||
    mongoose.model<ITransactionDocument>("Transaction", TransactionSchema);

export default Transaction;