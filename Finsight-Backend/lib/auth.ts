// lib/auth.ts

import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "./auth-options";
import User from "@/models/User";

/**
 * Get the current NextAuth session on the server.
 * Works in App Router route handlers and server components.
 */
export async function getAuthSession(): Promise<Session | null> {
    return getServerSession(authOptions);
}

/**
 * Get the current authenticated user document (or null if unauthenticated).
 * This is what API routes should use to enforce auth and get userId.
 */
export async function getCurrentUser() {
    const session = await getAuthSession();
    if (!session?.user?.email) return null;

    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user) return null;

    return {
        ...user,
        id: user._id.toString()
    };
}

/**
 * Get the current authenticated userId string, or null.
 */
export async function getCurrentUserId(): Promise<string | null> {
    const session = await getAuthSession();
    const id = (session?.user as any)?.id as string | undefined;
    return id ?? null;
}