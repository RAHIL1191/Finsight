// models/User.ts

import mongoose, { Schema, Document, Model } from "mongoose";
import type { IUser, AuthProvider } from "@/types";

// ─── Document Interface ───────────────────────────────────────────────────────

export interface IUserDocument extends Omit<IUser, "_id" | "createdAt" | "updatedAt">, Document { }

// ─── Schema ───────────────────────────────────────────────────────────────────

const UserSchema = new Schema<IUserDocument>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxlength: [100, "Name cannot exceed 100 characters"]
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Invalid email address"]
        },

        image: {
            type: String,
            default: null
        },

        providers: {
            type: [String],
            enum: ["google", "github", "email"] satisfies AuthProvider[],
            default: []
        },

        passwordHash: {
            type: String,
            default: null,
            select: false // never returned in queries unless explicitly requested
        },

        currency: {
            type: String,
            default: "CAD",
            uppercase: true,
            minlength: 3,
            maxlength: 3
        },

        timezone: {
            type: String,
            default: "America/Toronto"
        },

        biometricLockEnabled: {
            type: Boolean,
            default: false
        },

        biometricLockTimeout: {
            type: Number,
            default: 5,
            min: 1,
            max: 60
        },

        pushToken: {
            type: String,
            default: null
        },
        
        gmailAccessToken: {
            type: String,
            default: null
        },

        gmailRefreshToken: {
            type: String,
            default: null
        },

        gmailTokenExpiresAt: {
            type: Date,
            default: null
        },

        onboardingComplete: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true, // auto-manages createdAt + updatedAt
        versionKey: false
    }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

UserSchema.index({ email: 1 }, { unique: true });

// ─── Model (singleton-safe for Next.js hot reload) ────────────────────────────

const User: Model<IUserDocument> =
    (mongoose.models.User as Model<IUserDocument>) ||
    mongoose.model<IUserDocument>("User", UserSchema);

export default User;