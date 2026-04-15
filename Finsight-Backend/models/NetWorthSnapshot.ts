// models/NetWorthSnapshot.ts

import mongoose, { Schema, Document, Model } from "mongoose";
import type { INetWorthSnapshot } from "@/types";

// ─── Document Interface ───────────────────────────────────────────────────────

export interface INetWorthSnapshotDocument
    extends Omit<INetWorthSnapshot, "_id" | "createdAt">,
    Document { }

// ─── Schema ───────────────────────────────────────────────────────────────────

const NetWorthSnapshotSchema = new Schema<INetWorthSnapshotDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        date: {
            type: Date,
            required: true,
            index: true
        },

        totalAssets: {
            type: Number,
            required: true
        },

        totalLiabilities: {
            type: Number,
            required: true
        },

        netWorth: {
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

        breakdown: {
            checking: { type: Number, required: true, default: 0 },
            savings: { type: Number, required: true, default: 0 },
            investment: { type: Number, required: true, default: 0 },
            rrsp: { type: Number, required: true, default: 0 },
            tfsa: { type: Number, required: true, default: 0 },
            heloc: { type: Number, required: true, default: 0 },
            mortgage: { type: Number, required: true, default: 0 },
            credit: { type: Number, required: true, default: 0 },
            loan: { type: Number, required: true, default: 0 },
            cash: { type: Number, required: true, default: 0 },
            crypto: { type: Number, required: true, default: 0 },
            other: { type: Number, required: true, default: 0 }
        }
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
        versionKey: false
    }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Per-user net worth time series.
NetWorthSnapshotSchema.index({ userId: 1, date: 1 }, { unique: true });

// ─── Model (singleton-safe) ───────────────────────────────────────────────────

const NetWorthSnapshot: Model<INetWorthSnapshotDocument> =
    (mongoose.models.NetWorthSnapshot as Model<INetWorthSnapshotDocument>) ||
    mongoose.model<INetWorthSnapshotDocument>("NetWorthSnapshot", NetWorthSnapshotSchema);

export default NetWorthSnapshot;