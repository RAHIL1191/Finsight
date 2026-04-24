// lib/auth.ts

import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "./auth-options";
import { auth as getClerkAuth, verifyToken } from "@clerk/nextjs/server";

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
        const { headers } = await import('next/headers');
        const authHeader = headers().get('authorization');
        
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            
            // Try standard auth() helper first
            const { userId } = getClerkAuth();
            if (userId) return userId;

            // If auth() returns null, manually verify the token
            // This is often needed for mobile Bearer tokens in some Next.js environments
            const clerkSecret = process.env.CLERK_SECRET_KEY;
            if (clerkSecret) {
                try {
                    const verified = await verifyToken(token, {
                        secretKey: clerkSecret,
                    });
                    console.log(`[Auth] Manual Verification Success: ${verified.sub}`);
                    return verified.sub;
                } catch (verifyErr: any) {
                    console.warn(`[Auth] Manual Verification Failed: ${verifyErr.message}`);
                }
            }
        }
    } catch (e: any) {
        console.warn(`[Auth] Clerk processing error: ${e.message}`);
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

    const User = (await import("@/models/User")).default;
    const mongoose = (await import("mongoose")).default;

    // Only query by _id if it's a valid ObjectId to prevent CastError
    const isObjectId = mongoose.Types.ObjectId.isValid(userId);
    
    const query = isObjectId 
        ? { $or: [{ _id: userId }, { clerkId: userId }, { email: userId }] }
        : { $or: [{ clerkId: userId }, { email: userId }] };

    let user = await User.findOne(query);

    // If we found them by email but they didn't have a clerkId, link it now!
    if (user && !user.clerkId && userId.startsWith('user_')) {
        user.clerkId = userId;
        await user.save();
    }

    if (!user) return null;

    return {
        ...user.toObject(),
        id: user._id.toString()
    };
}