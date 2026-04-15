// models/AIConversation.ts

import mongoose, { Schema, Document, Model } from "mongoose";
import type { IAIConversation, IAIMessage, AIMessageRole } from "@/types";

// ─── Subdocument Interface ────────────────────────────────────────────────────

export interface IAIMessageSubdocument
    extends Omit<IAIMessage, "createdAt">,
    Document {
    createdAt: Date;
}

// ─── Document Interface ───────────────────────────────────────────────────────

export interface IAIConversationDocument
    extends Omit<IAIConversation, "_id" | "createdAt" | "updatedAt" | "messages">,
    Document {
    messages: IAIMessageSubdocument[];
}

// ─── Message Subschema ────────────────────────────────────────────────────────

const AIMessageSchema = new Schema<IAIMessageSubdocument>(
    {
        role: {
            type: String,
            enum: ["user", "assistant", "system"] satisfies AIMessageRole[],
            required: true
        },
        content: {
            type: String,
            required: true,
            maxlength: [8000, "Message content cannot exceed 8000 characters"]
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        _id: true,
        id: false
    }
);

// ─── Conversation Schema ──────────────────────────────────────────────────────

const AIConversationSchema = new Schema<IAIConversationDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        title: {
            type: String,
            trim: true,
            maxlength: [200, "Title cannot exceed 200 characters"],
            default: null
        },

        messages: {
            type: [AIMessageSchema],
            default: []
        },

        model: {
            type: String,
            trim: true,
            default: null
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Per-user conversation listing, newest first.
AIConversationSchema.index({ userId: 1, updatedAt: -1 });

// ─── Model (singleton-safe) ───────────────────────────────────────────────────

const AIConversation: Model<IAIConversationDocument> =
    (mongoose.models.AIConversation as Model<IAIConversationDocument>) ||
    mongoose.model<IAIConversationDocument>("AIConversation", AIConversationSchema);

export default AIConversation;