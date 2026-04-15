// models/Goal.ts

import mongoose, { Schema, Document, Model } from "mongoose";
import type { IGoal, GoalStatus } from "@/types";

// ─── Document Interface ───────────────────────────────────────────────────────

export interface IGoalDocument
    extends Omit<IGoal, "_id" | "createdAt" | "updatedAt">,
    Document { }

// ─── Schema ───────────────────────────────────────────────────────────────────

const GoalSchema = new Schema<IGoalDocument>(
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
            default: null
        },

        name: {
            type: String,
            required: [true, "Goal name is required"],
            trim: true,
            maxlength: [100, "Goal name cannot exceed 100 characters"]
        },

        description: {
            type: String,
            trim: true,
            maxlength: [500, "Description cannot exceed 500 characters"],
            default: null
        },

        targetAmount: {
            type: Number,
            required: true
        },

        currentAmount: {
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

        targetDate: {
            type: Date,
            default: null
        },

        status: {
            type: String,
            enum: ["active", "paused", "achieved", "cancelled"] satisfies GoalStatus[],
            default: "active",
            index: true
        },

        aiProjectedDate: {
            type: Date,
            default: null
        },

        aiProjectedAt: {
            type: Date,
            default: null
        },

        aiRequiredMonthlyContribution: {
            type: Number,
            default: null
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// For querying active goals and sorting by target date.
GoalSchema.index({ userId: 1, status: 1, targetDate: 1 });

// ─── Model (singleton-safe) ───────────────────────────────────────────────────

const Goal: Model<IGoalDocument> =
    (mongoose.models.Goal as Model<IGoalDocument>) ||
    mongoose.model<IGoalDocument>("Goal", GoalSchema);

export default Goal;