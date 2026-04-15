// app/api/goals/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Goal from "@/models/Goal";
import { ObjectIdSchema, UpdateGoalSchema } from "@/types";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseIdFromParams(params: { id?: string }) {
    const id = params.id;
    const parsed = ObjectIdSchema.safeParse(id);
    if (!parsed.success) return null;
    return parsed.data;
}

// ─── PATCH /api/goals/[id] ───────────────────────────────────────────────────
// Update an existing goal.

export async function PATCH(
    req: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return NextResponse.json(fail("Unauthorized"), { status: 401 });
        }

        const goalId = parseIdFromParams(context.params);
        if (!goalId) {
            return NextResponse.json(fail("Invalid goal id"), { status: 400 });
        }

        const json = await req.json().catch(() => null);
        if (!json || typeof json !== "object") {
            return NextResponse.json(fail("Invalid JSON body"), { status: 400 });
        }

        const parsed = UpdateGoalSchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json(
                fail("Validation error", parsed.error.flatten()),
                { status: 400 }
            );
        }

        await connectToDatabase();

        const update = parsed.data;

        if (update.targetDate) {
            (update as any).targetDate = new Date(update.targetDate as any);
        }

        const goal = await Goal.findOneAndUpdate(
            { _id: goalId, userId },
            { $set: update },
            { new: true }
        ).lean();

        if (!goal) {
            return NextResponse.json(fail("Goal not found"), { status: 404 });
        }

        const doc = goal as any;

        return NextResponse.json(
            ok({
                ...doc,
                id: doc._id.toString()
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("PATCH /api/goals/[id] error:", error);
        return NextResponse.json(
            fail("Internal server error"),
            { status: 500 }
        );
    }
}

// ─── DELETE /api/goals/[id] ──────────────────────────────────────────────────
// Permanently delete a goal.

export async function DELETE(
    _req: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return NextResponse.json(fail("Unauthorized"), { status: 401 });
        }

        const goalId = parseIdFromParams(context.params);
        if (!goalId) {
            return NextResponse.json(fail("Invalid goal id"), { status: 400 });
        }

        await connectToDatabase();

        const goal = await Goal.findOneAndDelete({
            _id: goalId,
            userId
        }).lean();

        if (!goal) {
            return NextResponse.json(fail("Goal not found"), { status: 404 });
        }

        const doc = goal as any;

        return NextResponse.json(
            ok({
                ...doc,
                id: doc._id.toString()
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("DELETE /api/goals/[id] error:", error);
        return NextResponse.json(
            fail("Internal server error"),
            { status: 500 }
        );
    }
}