// lib/auth.ts

import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "./auth-options";
import { auth as getClerkAuth } from "@clerk/nextjs/server";

/**
 * Get the current NextAuth session on the server.
 */
export async function getAuthSession(): Promise<Session | null> {
    return getServerSession(authOptions);
}

/**
 * Get the current authenticated userId string, or null.
 * Supports BOTH NextAuth (Web) and Clerk (Mobile).
 * This function is LIGHTWEIGHT and does not touch the database.
 */
export async function getCurrentUserId(): Promise<string | null> {
    // 1. Try Clerk first (handles Bearer tokens from Mobile)
    try {
        // Log Authorization header presence for debugging
        const { headers } = await import('next/headers');
        const authHeader = headers().get('authorization');
        console.log(`[Auth] Auth Header: ${authHeader ? 'Bearer ' + authHeader.substring(7, 15) + '...' : 'MISSING'}`);

        const { userId } = getClerkAuth();
        console.log(`[Auth] Clerk User ID: ${userId || 'null'}`);
        if (userId) return userId;
    } catch (e: any) {
        console.warn(`[Auth] Clerk error: ${e.message}`);
    }

    // 2. Fallback to NextAuth (handles cookies from Web)
    try {
        const session = await getAuthSession();
        const id = (session?.user as any)?.id as string | undefined;
        return id ?? null;
    } catch (e) {
        return null;
    }
}

/**
 * Get the current authenticated user document (or null if unauthenticated).
 */
export async function getCurrentUser() {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    // Use dynamic import for the model to prevent premature DB connection
    const User = (await import("@/models/User")).default;

    const user = await User.findOne({ 
        $or: [
            { _id: userId },
            { clerkId: userId },
            { email: userId }
        ]
    }).lean();

    if (!user) return null;

    return {
        ...user,
        id: user._id.toString()
    };
}