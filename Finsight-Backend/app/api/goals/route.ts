// app/api/goals/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Goal from "@/models/Goal";
import { CreateGoalSchema } from "@/types";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// ─── GET /api/goals ───────────────────────────────────────────────────────────
// List all goals for the current user, ordered by status and targetDate.

export async function GET() {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return NextResponse.json(fail("Unauthorized"), { status: 401 });
        }

        await connectToDatabase();

        const goals = await Goal.find({ userId })
            .sort({ status: 1, targetDate: 1, createdAt: 1 })
            .lean();

        const data = goals.map((g: any) => ({
            ...g,
            id: g._id.toString()
        }));

        return NextResponse.json(ok(data), { status: 200 });
    } catch (error) {
        console.error("GET /api/goals error:", error);
        return NextResponse.json(
            fail("Internal server error"),
            { status: 500 }
        );
    }
}

// ─── POST /api/goals ──────────────────────────────────────────────────────────
// Create a new goal for the current user.

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

        const parsed = CreateGoalSchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json(
                fail("Validation error", parsed.error.flatten()),
                { status: 400 }
            );
        }

        await connectToDatabase();

        const payload = parsed.data;

        const goal = await Goal.create({
            userId,
            accountId: payload.accountId,
            name: payload.name,
            description: payload.description,
            targetAmount: payload.targetAmount,
            currentAmount: payload.currentAmount,
            currency: payload.currency,
            targetDate: payload.targetDate ? new Date(payload.targetDate) : null,
            status: payload.status
        });

        const doc = goal.toObject() as any;

        return NextResponse.json(
            ok({
                ...doc,
                id: doc._id.toString()
            }),
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /api/goals error:", error);
        return NextResponse.json(
            fail("Internal server error"),
            { status: 500 }
        );
    }
}