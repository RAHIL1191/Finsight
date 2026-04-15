// app/api/plaid/link-token/route.ts

import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { features } from "@/lib/env";
import { createPlaidLinkToken } from "@/lib/plaid";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// ─── GET /api/plaid/link-token ────────────────────────────────────────────────
// Returns a Plaid Link token for the current user.

export async function GET() {
    try {
        if (!features.plaid.enabled) {
            return NextResponse.json(
                fail("Plaid is not enabled on this server"),
                { status: 503 }
            );
        }

        const userId = await getCurrentUserId();
        if (!userId) {
            return NextResponse.json(fail("Unauthorized"), { status: 401 });
        }

        const linkToken = await createPlaidLinkToken(userId);

        return NextResponse.json(
            ok({ linkToken }),
            { status: 200 }
        );
    } catch (error) {
        console.error("GET /api/plaid/link-token error:", error);
        return NextResponse.json(
            fail("Internal server error"),
            { status: 500 }
        );
    }
}