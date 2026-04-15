// models/PortfolioPosition.ts

import mongoose, { Schema, Document, Model } from "mongoose";
import type { IPortfolioPosition } from "@/types";

// ─── Document Interface ───────────────────────────────────────────────────────

export interface IPortfolioPositionDocument
    extends Omit<IPortfolioPosition, "_id" | "createdAt" | "updatedAt">,
    Document { }

// ─── Schema ───────────────────────────────────────────────────────────────────

const PortfolioPositionSchema = new Schema<IPortfolioPositionDocument>(
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

        symbol: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            maxlength: [50, "Symbol cannot exceed 50 characters"],
            index: true
        },

        description: {
            type: String,
            trim: true,
            maxlength: [200, "Description cannot exceed 200 characters"],
            default: null
        },

        quantity: {
            type: Number,
            required: true
        },

        averageCost: {
            type: Number,
            required: true
        },

        currentPrice: {
            type: Number,
            required: true
        },

        marketValue: {
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

        unrealizedGain: {
            type: Number,
            required: true
        },

        unrealizedGainPercent: {
            type: Number,
            required: true
        },

        snapTradePositionId: {
            type: String,
            index: true,
            sparse: true,
            default: null
        },

        lastUpdatedAt: {
            type: Date,
            required: true,
            index: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Per-user, per-account portfolio listing sorted by symbol.
PortfolioPositionSchema.index({ userId: 1, accountId: 1, symbol: 1 });

// Fast lookups by SnapTrade position id for sync/dedup.
PortfolioPositionSchema.index({ userId: 1, snapTradePositionId: 1 });

// ─── Model (singleton-safe) ───────────────────────────────────────────────────

const PortfolioPosition: Model<IPortfolioPositionDocument> =
    (mongoose.models.PortfolioPosition as Model<IPortfolioPositionDocument>) ||
    mongoose.model<IPortfolioPositionDocument>("PortfolioPosition", PortfolioPositionSchema);

export default PortfolioPosition;