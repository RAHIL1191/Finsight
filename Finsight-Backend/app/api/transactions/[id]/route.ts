// app/api/transactions/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import { ObjectIdSchema, UpdateTransactionSchema } from "@/types";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseIdFromParams(params: { id?: string }) {
    const id = params.id;
    const parsed = ObjectIdSchema.safeParse(id);
    if (!parsed.success) return null;
    return parsed.data;
}

// ─── PATCH /api/transactions/[id] ─────────────────────────────────────────────
// Update an existing transaction.

export async function PATCH(
    req: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return NextResponse.json(fail("Unauthorized"), { status: 401 });
        }

        const txId = parseIdFromParams(context.params);
        if (!txId) {
            return NextResponse.json(fail("Invalid transaction id"), { status: 400 });
        }

        const json = await req.json().catch(() => null);
        if (!json || typeof json !== "object") {
            return NextResponse.json(fail("Invalid JSON body"), { status: 400 });
        }

        const parsed = UpdateTransactionSchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json(
                fail("Validation error", parsed.error.flatten()),
                { status: 400 }
            );
        }

        await connectToDatabase();

        const update = parsed.data;

        // If date is provided as ISO string, convert to Date.
        if (update.date) {
            (update as any).date = new Date(update.date as any);
        }

        const tx = await Transaction.findOneAndUpdate(
            { _id: txId, userId },
            { $set: update },
            { new: true }
        ).lean();

        if (!tx) {
            return NextResponse.json(fail("Transaction not found"), { status: 404 });
        }

        const t = tx as any;

        return NextResponse.json(
            ok({
                ...t,
                id: t._id.toString()
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("PATCH /api/transactions/[id] error:", error);
        return NextResponse.json(
            fail("Internal server error"),
            { status: 500 }
        );
    }
}

// ─── DELETE /api/transactions/[id] ────────────────────────────────────────────
// Permanently delete a transaction.

export async function DELETE(
    _req: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return NextResponse.json(fail("Unauthorized"), { status: 401 });
        }

        const txId = parseIdFromParams(context.params);
        if (!txId) {
            return NextResponse.json(fail("Invalid transaction id"), { status: 400 });
        }

        await connectToDatabase();

        const tx = await Transaction.findOneAndDelete({
            _id: txId,
            userId
        }).lean();

        if (!tx) {
            return NextResponse.json(fail("Transaction not found"), { status: 404 });
        }

        const t = tx as any;

        return NextResponse.json(
            ok({
                ...t,
                id: t._id.toString()
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("DELETE /api/transactions/[id] error:", error);
        return NextResponse.json(
            fail("Internal server error"),
            { status: 500 }
        );
    }
}