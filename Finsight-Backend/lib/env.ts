// lib/env.ts

import { z } from "zod";

/**
 * Base schema for all environment variables.
 * Everything is optional here; we derive boolean feature flags from presence.
 * For secrets we never expose to the client, we keep them server-only.
 */
const EnvSchema = z.object({
    // Core
    NODE_ENV: z.enum(["development", "test", "production"]).optional(),
    NEXTAUTH_URL: z.string().url().optional(),
    NEXTAUTH_SECRET: z.string().min(1).optional(),

    // Database
    MONGODB_URI: z.string().url().optional(),

    // NextAuth providers
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GITHUB_ID: z.string().optional(),
    GITHUB_SECRET: z.string().optional(),
    EMAIL_SERVER_HOST: z.string().optional(),
    EMAIL_SERVER_PORT: z
        .string()
        .transform((v) => (v ? Number(v) : undefined))
        .pipe(z.number().int().positive().optional())
        .optional(),
    EMAIL_SERVER_USER: z.string().optional(),
    EMAIL_SERVER_PASSWORD: z.string().optional(),
    EMAIL_FROM: z.string().email().optional(),

    // Resend
    RESEND_API_KEY: z.string().optional(),

    // OpenRouter AI
    OPENROUTER_API_KEY: z.string().optional(),
    OPENROUTER_MODEL: z.string().optional(),

    // Plaid (Canadian focus)
    PLAID_CLIENT_ID: z.string().optional(),
    PLAID_SECRET: z.string().optional(),
    PLAID_ENV: z.enum(["sandbox", "development", "production"]).optional(),
    PLAID_REDIRECT_URI: z.string().url().optional(),

    // SnapTrade
    SNAPTRADE_CLIENT_ID: z.string().optional(),
    SNAPTRADE_CONSUMER_KEY: z.string().optional(),
    SNAPTRADE_REDIRECT_URI: z.string().url().optional(),

    // Gmail OAuth for email transaction import
    GMAIL_CLIENT_ID: z.string().optional(),
    GMAIL_CLIENT_SECRET: z.string().optional(),
    GMAIL_REDIRECT_URI: z.string().url().optional(),

    // Push notifications / misc (server-side pieces, if any)
    PUSH_NOTIFICATIONS_WEBHOOK_SECRET: z.string().optional()
});

// Parse and validate the process.env snapshot once at startup.
const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
    // In production, we fail fast; in dev, we log but keep going.
    const isProd = process.env.NODE_ENV === "production";

    console.error("❌ Invalid environment variables:", parsed.error.format());

    if (isProd) {
        throw new Error("Invalid environment variables. See log for details.");
    }
}

/**
 * Raw strongly-typed env object.
 * Note: values can be undefined; use the feature flags below to gate integrations.
 */
export const env = parsed.success ? parsed.data : ({} as z.infer<typeof EnvSchema>);

/**
 * Feature flags derived from env presence.
 * This is what the rest of the codebase should use to decide whether to enable an integration.
 */
export const features = {
    database: !!env.MONGODB_URI,

    auth: {
        nextAuth: !!env.NEXTAUTH_SECRET,
        google: !!env.GOOGLE_CLIENT_ID && !!env.GOOGLE_CLIENT_SECRET,
        github: !!env.GITHUB_ID && !!env.GITHUB_SECRET,
        emailMagicLink:
            !!env.EMAIL_SERVER_HOST &&
            !!env.EMAIL_SERVER_PORT &&
            !!env.EMAIL_SERVER_USER &&
            !!env.EMAIL_SERVER_PASSWORD &&
            !!env.EMAIL_FROM
    },

    email: {
        resend: !!env.RESEND_API_KEY
    },

    ai: {
        openRouter: !!env.OPENROUTER_API_KEY
    },

    plaid: {
        enabled: !!env.PLAID_CLIENT_ID && !!env.PLAID_SECRET && !!env.PLAID_ENV
    },

    snapTrade: {
        enabled:
            !!env.SNAPTRADE_CLIENT_ID &&
            !!env.SNAPTRADE_CONSUMER_KEY &&
            !!env.SNAPTRADE_REDIRECT_URI
    },

    gmailImport: {
        enabled:
            !!env.GMAIL_CLIENT_ID &&
            !!env.GMAIL_CLIENT_SECRET &&
            !!env.GMAIL_REDIRECT_URI
    },

    pushNotifications: {
        webhook: !!env.PUSH_NOTIFICATIONS_WEBHOOK_SECRET
    }
};

export type Env = typeof env;
export type Features = typeof features;