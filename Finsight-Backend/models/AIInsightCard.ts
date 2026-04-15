// models/AIInsightCard.ts

import mongoose, { Schema, Document, Model } from "mongoose";
import type { IAIInsightCard } from "@/types";

// ─── Document Interface ───────────────────────────────────────────────────────

export interface IAIInsightCardDocument
    extends Omit<IAIInsightCard, "_id" | "createdAt">,
    Document { }

// ─── Schema ───────────────────────────────────────────────────────────────────

const AIInsightCardSchema = new Schema<IAIInsightCardDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: [200, "Title cannot exceed 200 characters"]
        },

        body: {
            type: String,
            required: true,
            maxlength: [4000, "Body cannot exceed 4000 characters"]
        },

        type: {
            type: String,
            enum: ["tip", "alert", "summary", "anomaly", "projection"],
            required: true,
            index: true
        },

        // e.g., "2026-04" for a monthly insight; optional for generic tips/alerts
        month: {
            type: String,
            trim: true,
            match: [/^\d{4}-\d{2}$/, "Month must be in format YYYY-MM"],
            default: null,
            index: true
        },

        dismissed: {
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

// Per-user insight listing, newest first.
AIInsightCardSchema.index({ userId: 1, createdAt: -1 });

// ─── Model (singleton-safe) ───────────────────────────────────────────────────

const AIInsightCard: Model<IAIInsightCardDocument> =
    (mongoose.models.AIInsightCard as Model<IAIInsightCardDocument>) ||
    mongoose.model<IAIInsightCardDocument>("AIInsightCard", AIInsightCardSchema);

export default AIInsightCard;