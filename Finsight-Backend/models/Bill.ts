// models/Bill.ts

import mongoose, { Schema, Document, Model } from "mongoose";
import type { IBill, BillFrequency, BillStatus } from "@/types";

// ─── Document Interface ───────────────────────────────────────────────────────

export interface IBillDocument
    extends Omit<IBill, "_id" | "createdAt" | "updatedAt">,
    Document { }

// ─── Schema ───────────────────────────────────────────────────────────────────

const BillSchema = new Schema<IBillDocument>(
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
            required: [true, "Bill name is required"],
            trim: true,
            maxlength: [100, "Bill name cannot exceed 100 characters"]
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

        category: {
            type: String,
            required: true,
            trim: true,
            maxlength: [100, "Category cannot exceed 100 characters"],
            index: true
        },

        frequency: {
            type: String,
            enum: ["weekly", "biweekly", "monthly", "quarterly", "yearly"] satisfies BillFrequency[],
            required: true
        },

        dueDay: {
            type: Number,
            min: 1,
            max: 31,
            default: null
        },

        nextDueDate: {
            type: Date,
            required: true,
            index: true
        },

        status: {
            type: String,
            enum: ["active", "paused", "cancelled"] satisfies BillStatus[],
            default: "active",
            index: true
        },

        reminderDaysBefore: {
            type: Number,
            min: 0,
            max: 30,
            default: 3
        },

        payeeName: {
            type: String,
            trim: true,
            maxlength: [200, "Payee name cannot exceed 200 characters"],
            default: null
        },

        notes: {
            type: String,
            trim: true,
            maxlength: [1000, "Notes cannot exceed 1000 characters"],
            default: null
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// For querying upcoming bills and sending reminders.
BillSchema.index({
    userId: 1,
    status: 1,
    nextDueDate: 1
});

// ─── Model (singleton-safe) ───────────────────────────────────────────────────

const Bill: Model<IBillDocument> =
    (mongoose.models.Bill as Model<IBillDocument>) ||
    mongoose.model<IBillDocument>("Bill", BillSchema);

export default Bill;