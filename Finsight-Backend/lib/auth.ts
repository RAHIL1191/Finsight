// lib/auth.ts

import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "./auth-options";
import User from "@/models/User";
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
 */
export async function getCurrentUserId(): Promise<string | null> {
    // 1. Try Clerk first (handles Bearer tokens from Mobile)
    try {
        const { userId } = getClerkAuth();
        console.log(`[Auth] Clerk User ID: ${userId || 'null'}`);
        if (userId) return userId;
    } catch (e: any) {
        console.warn(`[Auth] Clerk error: ${e.message}`);
    }

    // 2. Fallback to NextAuth (handles cookies from Web)
    const session = await getAuthSession();
    const id = (session?.user as any)?.id as string | undefined;
    
    return id ?? null;
}

/**
 * Get the current authenticated user document (or null if unauthenticated).
 */
export async function getCurrentUser() {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    // We assume the Clerk userId or NextAuth userId maps to our MongoDB _id or a common identifier
    // For simplicity, we'll try to find by _id or a linked clerkId if you have one.
    // Tip: Ensure your User model has a clerkId field or that _id matches!
    const user = await User.findOne({ 
        $or: [
            { _id: userId },
            { clerkId: userId },
            { email: userId } // Some setups use email as ID
        ]
    }).lean();

    if (!user) return null;

    return {
        ...user,
        id: user._id.toString()
    };
}