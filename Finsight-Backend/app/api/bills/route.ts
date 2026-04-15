// app/api/bills/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Bill from "@/models/Bill";
import { CreateBillSchema } from "@/types";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// ─── GET /api/bills ───────────────────────────────────────────────────────────
// List all bills for the current user, ordered by nextDueDate ascending.

export async function GET() {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return NextResponse.json(fail("Unauthorized"), { status: 401 });
        }

        await connectToDatabase();

        const bills = await Bill.find({ userId })
            .sort({ nextDueDate: 1 })
            .lean();

        const data = bills.map((bill: any) => ({
            ...bill,
            id: bill._id.toString()
        }));

        return NextResponse.json(ok(data), { status: 200 });
    } catch (error) {
        console.error("GET /api/bills error:", error);
        return NextResponse.json(
            fail("Internal server error"),
            { status: 500 }
        );
    }
}

// ─── POST /api/bills ──────────────────────────────────────────────────────────
// Create a new bill for the current user.

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

        const parsed = CreateBillSchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json(
                fail("Validation error", parsed.error.flatten()),
                { status: 400 }
            );
        }

        await connectToDatabase();

        const payload = parsed.data;

        const bill = await Bill.create({
            userId,
            accountId: payload.accountId,
            name: payload.name,
            amount: payload.amount,
            currency: payload.currency,
            category: payload.category,
            frequency: payload.frequency,
            dueDay: payload.dueDay,
            nextDueDate: new Date(payload.nextDueDate),
            status: payload.status,
            reminderDaysBefore: payload.reminderDaysBefore,
            payeeName: payload.payeeName,
            notes: payload.notes
        });

        const doc = bill.toObject() as any;

        return NextResponse.json(
            ok({
                ...doc,
                id: doc._id.toString()
            }),
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /api/bills error:", error);
        return NextResponse.json(
            fail("Internal server error"),
            { status: 500 }
        );
    }
}