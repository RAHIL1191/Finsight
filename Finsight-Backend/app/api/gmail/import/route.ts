// app/api/gmail/import/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { GmailImportSchema } from "@/types";
import { ok, fail } from "@/lib/api-response";
import { fetchRecentGmailMessages } from "@/lib/gmail";
import { features } from "@/lib/env";

export const dynamic = "force-dynamic";

// ─── POST /api/gmail/import ───────────────────────────────────────────────────
// Imports potential transactions from Gmail using an OAuth access token.
// Body:
// {
//   "accessToken": "...",
//   "maxMessages": 100
// }

export async function POST(req: NextRequest) {
    try {
        if (!features.gmailImport) {
            return NextResponse.json(
                fail("Gmail import is not enabled on this server"),
                { status: 503 }
            );
        }

        const userId = await getCurrentUserId();
        if (!userId) {
            return NextResponse.json(fail("Unauthorized"), { status: 401 });
        }

        const json = await req.json().catch(() => null);
        if (!json || typeof json !== "object") {
            return NextResponse.json(fail("Invalid JSON body"), { status: 400 });
        }

        const parsed = GmailImportSchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json(
                fail("Validation error", parsed.error.flatten()),
                { status: 400 }
            );
        }

        const input = parsed.data;

        await connectToDatabase();

        let accessToken = input.accessToken;
        const clerkUserId = (input as any).clerkUserId;

        // If no token, but we have a Clerk User ID, fetch token from Clerk API
        if (!accessToken && clerkUserId) {
            const clerkSecret = process.env.CLERK_SECRET_KEY;
            if (!clerkSecret) {
                console.warn("[Clerk] Missing CLERK_SECRET_KEY in environment - Please add it to .env.local");
            } else {
                try {
                    console.log(`[Clerk] Fetching OAuth token for user: ${clerkUserId}`);
                    const clerkRes = await fetch(
                        `https://api.clerk.com/v1/users/${clerkUserId}/oauth_access_tokens/oauth_google`,
                        {
                            headers: {
                                Authorization: `Bearer ${clerkSecret}`,
                                "Content-Type": "application/json"
                            }
                        }
                    );
                    const clerkData = await clerkRes.json();
                    if (Array.isArray(clerkData) && clerkData.length > 0) {
                        accessToken = clerkData[0].token;
                        console.log("[Clerk] Token retrieved successfully from Clerk API");
                    } else {
                        console.error("[Clerk] Failed to retrieve OAuth token:", clerkData);
                    }
                } catch (err) {
                    console.error("[Clerk] API Error:", err);
                }
            }
        }

        // Fallback to legacy database check
        if (!accessToken) {
            const User = (await import("@/models/User")).default;
            const user = await User.findById(userId).select("+gmailAccessToken +gmailRefreshToken").lean();
            if (user?.gmailAccessToken) {
                accessToken = user.gmailAccessToken;
            }
        }

        if (!accessToken) {
            return NextResponse.json(fail("No Google/Gmail tokens found. Check Clerk Dashboard and .env.local keys."), { status: 400 });
        }

        console.log(`[Gmail] Starting sync for user: ${userId}`);

        // Fetch recent Gmail messages (lightly parsed).
        const messages = await fetchRecentGmailMessages({ ...input, accessToken });
        console.log(`[Gmail] Found ${messages.length} messages to analyze.`);

        if (messages.length === 0) {
            return NextResponse.json(
                ok({
                    imported: 0,
                    skippedExisting: 0,
                    totalMessages: 0
                }),
                { status: 200 }
            );
        }

        let imported = 0;
        let skippedExisting = 0;
        const Transaction = (await import("@/models/Transaction")).default;

        for (const msg of messages) {
            // Deduplicate by gmailMessageId per user.
            const existing = await Transaction.findOne({
                userId,
                gmailMessageId: msg.gmailMessageId
            })
                .select({ _id: 1 })
                .lean();

            if (existing) {
                skippedExisting += 1;
                continue;
            }

            // Simple heuristic: we only import when we detect an amount pattern.
            const body = msg.textPlain || msg.textHtml || msg.snippet || "";
            const amountMatch = body.match(/([+-]?\d+[\.,]\d{2})/);

            if (!amountMatch) {
                continue;
            }

            const rawAmount = amountMatch[1].replace(",", ".");
            const amount = Number(rawAmount);

            if (!Number.isFinite(amount) || amount === 0) {
                continue;
            }

            // Very naive classification: treat positive as income, negative as expense.
            const type = amount > 0 ? "income" : "expense";

            await Transaction.create({
                userId,
                // Let the mobile app attach accountId later via editing / review.
                accountId: null,
                amount: Math.abs(amount),
                currency: "CAD",
                type,
                status: "needs_review",
                source: "gmail_import",
                name: msg.subject || "Imported from email",
                originalName: msg.subject,
                category: "Uncategorized",
                subcategory: undefined,
                date: msg.date,
                notes: `From: ${msg.from}\nSnippet: ${msg.snippet}`,
                transferAccountId: undefined,
                plaidTransactionId: undefined,
                gmailMessageId: msg.gmailMessageId,
                tags: [],
                excludeFromBudget: false,
                excludeFromNetWorth: false,
                attachmentUrl: undefined
            });

            console.log(`[Gmail] ✅ Imported: ${msg.subject} ($${amount})`);
            imported += 1;
        }

        console.log(`[Gmail] Sync complete. Imported: ${imported}, Skipped: ${skippedExisting}`);

        return NextResponse.json(
            ok({
                imported,
                skippedExisting,
                totalMessages: messages.length
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("POST /api/gmail/import error:", error);
        return NextResponse.json(
            fail("Internal server error"),
            { status: 500 }
        );
    }
}