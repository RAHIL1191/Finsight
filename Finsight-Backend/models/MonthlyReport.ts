// models/MonthlyReport.ts

import mongoose, { Schema, Document, Model } from "mongoose";
import type { IMonthlyReport } from "@/types";

// ─── Document Interface ───────────────────────────────────────────────────────

export interface IMonthlyReportDocument
    extends Omit<IMonthlyReport, "_id" | "createdAt">,
    Document { }

// ─── Schema ───────────────────────────────────────────────────────────────────

const MonthlyReportSchema = new Schema<IMonthlyReportDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        // e.g. "2026-04"
        month: {
            type: String,
            required: true,
            trim: true,
            match: [/^\d{4}-\d{2}$/, "Month must be in format YYYY-MM"],
            index: true
        },

        totalIncome: {
            type: Number,
            required: true
        },

        totalExpenses: {
            type: Number,
            required: true
        },

        netCashflow: {
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

        topCategories: {
            type: [
                {
                    category: { type: String, required: true },
                    amount: { type: Number, required: true }
                }
            ],
            default: []
        },

        insights: {
            type: [String],
            default: []
        },

        aiNarrative: {
            type: String,
            default: null,
            maxlength: [10000, "AI narrative cannot exceed 10000 characters"]
        },

        emailSent: {
            type: Boolean,
            default: false,
            index: true
        }
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
        versionKey: false
    }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Ensure one report per user per month.
MonthlyReportSchema.index({ userId: 1, month: 1 }, { unique: true });

// ─── Model (singleton-safe) ───────────────────────────────────────────────────

const MonthlyReport: Model<IMonthlyReportDocument> =
    (mongoose.models.MonthlyReport as Model<IMonthlyReportDocument>) ||
    mongoose.model<IMonthlyReportDocument>("MonthlyReport", MonthlyReportSchema);

export default MonthlyReport;