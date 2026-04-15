// models/Budget.ts

import mongoose, { Schema, Document, Model } from "mongoose";
import type { IBudget, BudgetPeriod } from "@/types";

// ─── Document Interface ───────────────────────────────────────────────────────

export interface IBudgetDocument
    extends Omit<IBudget, "_id" | "createdAt" | "updatedAt">,
    Document { }

// ─── Schema ───────────────────────────────────────────────────────────────────

const BudgetSchema = new Schema<IBudgetDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        name: {
            type: String,
            required: [true, "Budget name is required"],
            trim: true,
            maxlength: [100, "Budget name cannot exceed 100 characters"]
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

        period: {
            type: String,
            enum: ["weekly", "monthly", "yearly"] satisfies BudgetPeriod[],
            required: true,
            index: true
        },

        accountId: {
            type: Schema.Types.ObjectId,
            ref: "Account",
            default: null
        },

        aiProjectedSpend: {
            type: Number,
            default: null
        },

        aiProjectedAt: {
            type: Date,
            default: null
        },

        rollover: {
            type: Boolean,
            default: false
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Per-user, per-period budgets for fast aggregation and progress calculations.
BudgetSchema.index({ userId: 1, period: 1, category: 1, subcategory: 1 });

// ─── Model (singleton-safe) ───────────────────────────────────────────────────

const Budget: Model<IBudgetDocument> =
    (mongoose.models.Budget as Model<IBudgetDocument>) ||
    mongoose.model<IBudgetDocument>("Budget", BudgetSchema);

export default Budget;