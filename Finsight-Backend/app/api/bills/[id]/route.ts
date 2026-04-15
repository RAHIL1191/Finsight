// app/api/bills/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Bill from "@/models/Bill";
import { ObjectIdSchema, UpdateBillSchema } from "@/types";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseIdFromParams(params: { id?: string }) {
    const id = params.id;
    const parsed = ObjectIdSchema.safeParse(id);
    if (!parsed.success) return null;
    return parsed.data;
}

// ─── PATCH /api/bills/[id] ───────────────────────────────────────────────────
// Update an existing bill.

export async function PATCH(
    req: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return NextResponse.json(fail("Unauthorized"), { status: 401 });
        }

        const billId = parseIdFromParams(context.params);
        if (!billId) {
            return NextResponse.json(fail("Invalid bill id"), { status: 400 });
        }

        const json = await req.json().catch(() => null);
        if (!json || typeof json !== "object") {
            return NextResponse.json(fail("Invalid JSON body"), { status: 400 });
        }

        const parsed = UpdateBillSchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json(
                fail("Validation error", parsed.error.flatten()),
                { status: 400 }
            );
        }

        await connectToDatabase();

        const update = parsed.data;

        // Convert date fields if present
        if (update.nextDueDate) {
            (update as any).nextDueDate = new Date(update.nextDueDate as any);
        }

        const bill = await Bill.findOneAndUpdate(
            { _id: billId, userId },
            { $set: update },
            { new: true }
        ).lean();

        if (!bill) {
            return NextResponse.json(fail("Bill not found"), { status: 404 });
        }

        const doc = bill as any;

        return NextResponse.json(
            ok({
                ...doc,
                id: doc._id.toString()
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("PATCH /api/bills/[id] error:", error);
        return NextResponse.json(
            fail("Internal server error"),
            { status: 500 }
        );
    }
}

// ─── DELETE /api/bills/[id] ──────────────────────────────────────────────────
// Permanently delete a bill.

export async function DELETE(
    _req: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return NextResponse.json(fail("Unauthorized"), { status: 401 });
        }

        const billId = parseIdFromParams(context.params);
        if (!billId) {
            return NextResponse.json(fail("Invalid bill id"), { status: 400 });
        }

        await connectToDatabase();

        const bill = await Bill.findOneAndDelete({
            _id: billId,
            userId
        }).lean();

        if (!bill) {
            return NextResponse.json(fail("Bill not found"), { status: 404 });
        }

        const doc = bill as any;

        return NextResponse.json(
            ok({
                ...doc,
                id: doc._id.toString()
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("DELETE /api/bills/[id] error:", error);
        return NextResponse.json(
            fail("Internal server error"),
            { status: 500 }
        );
    }
}