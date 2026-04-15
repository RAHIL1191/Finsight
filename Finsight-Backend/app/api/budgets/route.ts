// app/api/budgets/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Budget from "@/models/Budget";
import { CreateBudgetSchema } from "@/types";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// ─── GET /api/budgets ─────────────────────────────────────────────────────────
// List all budgets for the current user, ordered by period and category.

export async function GET() {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return NextResponse.json(fail("Unauthorized"), { status: 401 });
        }

        await connectToDatabase();

        const budgets = await Budget.find({ userId })
            .sort({ period: 1, category: 1, subcategory: 1 })
            .lean();

        const data = budgets.map((b: any) => ({
            ...b,
            id: b._id.toString()
        }));

        return NextResponse.json(ok(data), { status: 200 });
    } catch (error) {
        console.error("GET /api/budgets error:", error);
        return NextResponse.json(
            fail("Internal server error"),
            { status: 500 }
        );
    }
}

// ─── POST /api/budgets ────────────────────────────────────────────────────────
// Create a new budget for the current user.

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

        const parsed = CreateBudgetSchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json(
                fail("Validation error", parsed.error.flatten()),
                { status: 400 }
            );
        }

        await connectToDatabase();

        const payload = parsed.data;

        const budget = await Budget.create({
            userId,
            name: payload.name,
            category: payload.category,
            subcategory: payload.subcategory,
            amount: payload.amount,
            currency: payload.currency,
            period: payload.period,
            accountId: payload.accountId,
            rollover: payload.rollover,
            isActive: payload.isActive
        });

        const doc = budget.toObject() as any;

        return NextResponse.json(
            ok({
                ...doc,
                id: doc._id.toString()
            }),
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /api/budgets error:", error);
        return NextResponse.json(
            fail("Internal server error"),
            { status: 500 }
        );
    }
}