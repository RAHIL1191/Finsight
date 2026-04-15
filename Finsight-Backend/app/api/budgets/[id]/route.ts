// app/api/budgets/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Budget from "@/models/Budget";
import { ObjectIdSchema, UpdateBudgetSchema } from "@/types";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseIdFromParams(params: { id?: string }) {
    const id = params.id;
    const parsed = ObjectIdSchema.safeParse(id);
    if (!parsed.success) return null;
    return parsed.data;
}

// ─── PATCH /api/budgets/[id] ─────────────────────────────────────────────────
// Update an existing budget.

export async function PATCH(
    req: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return NextResponse.json(fail("Unauthorized"), { status: 401 });
        }

        const budgetId = parseIdFromParams(context.params);
        if (!budgetId) {
            return NextResponse.json(fail("Invalid budget id"), { status: 400 });
        }

        const json = await req.json().catch(() => null);
        if (!json || typeof json !== "object") {
            return NextResponse.json(fail("Invalid JSON body"), { status: 400 });
        }

        const parsed = UpdateBudgetSchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json(
                fail("Validation error", parsed.error.flatten()),
                { status: 400 }
            );
        }

        await connectToDatabase();

        const update = parsed.data;

        const budget = await Budget.findOneAndUpdate(
            { _id: budgetId, userId },
            { $set: update },
            { new: true }
        ).lean();

        if (!budget) {
            return NextResponse.json(fail("Budget not found"), { status: 404 });
        }

        const doc = budget as any;

        return NextResponse.json(
            ok({
                ...doc,
                id: doc._id.toString()
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("PATCH /api/budgets/[id] error:", error);
        return NextResponse.json(
            fail("Internal server error"),
            { status: 500 }
        );
    }
}

// ─── DELETE /api/budgets/[id] ────────────────────────────────────────────────
// Permanently delete a budget.

export async function DELETE(
    _req: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return NextResponse.json(fail("Unauthorized"), { status: 401 });
        }

        const budgetId = parseIdFromParams(context.params);
        if (!budgetId) {
            return NextResponse.json(fail("Invalid budget id"), { status: 400 });
        }

        await connectToDatabase();

        const budget = await Budget.findOneAndDelete({
            _id: budgetId,
            userId
        }).lean();

        if (!budget) {
            return NextResponse.json(fail("Budget not found"), { status: 404 });
        }

        const doc = budget as any;

        return NextResponse.json(
            ok({
                ...doc,
                id: doc._id.toString()
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("DELETE /api/budgets/[id] error:", error);
        return NextResponse.json(
            fail("Internal server error"),
            { status: 500 }
        );
    }
}