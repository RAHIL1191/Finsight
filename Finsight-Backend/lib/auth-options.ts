// lib/auth-options.ts

import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { env, features } from "./env";
import { connectToDatabase } from "./mongodb";
import User from "@/models/User";

// NOTE: We use the official MongoDB Adapter, but with our own Mongoose connection.
// The adapter expects a `Promise<MongoClient>`, so we will lazily create a client.
// To keep this file focused, we use the native driver, separate from our Mongoose models.

import { MongoClient } from "mongodb";

let mongoClientPromise: Promise<MongoClient> | null = null;

async function getMongoClient(): Promise<MongoClient> {
    if (!env.MONGODB_URI) {
        throw new Error("MONGODB_URI is required for NextAuth MongoDBAdapter");
    }

    if (!mongoClientPromise) {
        mongoClientPromise = MongoClient.connect(env.MONGODB_URI);
    }

    return mongoClientPromise;
}

export const authOptions: NextAuthOptions = {
    secret: env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "/auth/signin",
    },
    adapter: features.database
        ? MongoDBAdapter(getMongoClient())
        : undefined,
    providers: [
        ...(features.auth.google
            ? [
                GoogleProvider({
                    clientId: env.GOOGLE_CLIENT_ID!,
                    clientSecret: env.GOOGLE_CLIENT_SECRET!,
                    authorization: {
                        params: {
                            prompt: "consent",
                            access_type: "offline",
                            response_type: "code"
                        }
                    }
                })
            ]
            : []),
        ...(features.auth.github
            ? [
                GithubProvider({
                    clientId: env.GITHUB_ID!,
                    clientSecret: env.GITHUB_SECRET!
                })
            ]
            : []),
        ...(features.auth.email
            ? [
                EmailProvider({
                    server: {
                        host: env.EMAIL_SERVER_HOST!,
                        port: env.EMAIL_SERVER_PORT!,
                        auth: {
                            user: env.EMAIL_SERVER_USER!,
                            pass: env.EMAIL_SERVER_PASSWORD!
                        }
                    },
                    from: env.EMAIL_FROM!
                })
            ]
            : [])
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            // Ensure our User collection has the provider tracked.
            try {
                await connectToDatabase();

                if (!user.email) return false;

                const existing = await User.findOne({ email: user.email });

                const providerId = account?.provider as
                    | "google"
                    | "github"
                    | "email"
                    | undefined;

                if (!existing) {
                    await User.create({
                        name: user.name || user.email.split("@")[0],
                        email: user.email,
                        image: user.image,
                        providers: providerId ? [providerId] : [],
                        currency: "CAD",
                        timezone: "America/Toronto",
                        biometricLockEnabled: false,
                        biometricLockTimeout: 5,
                        onboardingComplete: false
                    });
                } else if (
                    providerId &&
                    !existing.providers.includes(providerId)
                ) {
                    existing.providers.push(providerId);
                    await existing.save();
                }

                return true;
            } catch (err) {
                console.error("Error in signIn callback:", err);
                return false;
            }
        },
        async jwt({ token, user, account }) {
            // On first sign-in, attach user id.
            if (user && user.email) {
                await connectToDatabase();
                const existing = await User.findOne({ email: user.email });
                if (existing) {
                    token.userId = existing._id.toString();
                }
            }
            return token;
        },
        async session({ session, token }) {
            // Expose userId on session.user for server-side usage.
            if (session.user && token.userId) {
                (session.user as any).id = token.userId;
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            // Allow custom schemes for mobile app redirection
            if (url.startsWith("finsight://")) return url;
            // Allows relative callback URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            // Allows callback URLs on the same origin
            else if (new URL(url).origin === baseUrl) return url;
            return baseUrl;
        }
    }
};