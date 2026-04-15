// app/api/transactions/review/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import { BulkReviewSchema } from "@/types";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// ─── POST /api/transactions/review ────────────────────────────────────────────
// Bulk approve or reject transactions in "needs_review" status.
// Body:
// {
//   "transactionIds": ["..."],
//   "action": "approve" | "reject"
// }

export async function POST(req: NextRequest) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return NextResponse.json(fail("Unauthorized"), { status: 401 });
        }

        const json = await req.json().catch(() => null);
        if (!json || typeof json !== "object") {
            return NextResponse.json(fail("Invalid JSON body"), { status: 400 });
        }

        const parsed = BulkReviewSchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json(
                fail("Validation error", parsed.error.flatten()),
                { status: 400 }
            );
        }

        const { transactionIds, action } = parsed.data;

        await connectToDatabase();

        const newStatus = action === "approve" ? "cleared" : "pending";

        const result = await Transaction.updateMany(
            {
                _id: { $in: transactionIds },
                userId,
                status: "needs_review"
            },
            {
                $set: { status: newStatus }
            }
        );

        return NextResponse.json(
            ok({
                matched: result.matchedCount,
                modified: result.modifiedCount,
                status: newStatus
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("POST /api/transactions/review error:", error);
        return NextResponse.json(
            fail("Internal server error"),
            { status: 500 }
        );
    }
}