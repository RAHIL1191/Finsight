// app/api/accounts/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Account from "@/models/Account";
import { AccountFiltersSchema, CreateAccountSchema } from "@/types";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// ─── GET /api/accounts ────────────────────────────────────────────────────────
// List all accounts for the current user, with optional filters.

export async function GET(req: NextRequest) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return NextResponse.json(fail("Unauthorized"), { status: 401 });
        }

        const url = new URL(req.url);
        const query = Object.fromEntries(url.searchParams.entries());

        const parsed = AccountFiltersSchema.safeParse(query);
        if (!parsed.success) {
            return NextResponse.json(
                fail("Validation error", parsed.error.flatten()),
                { status: 400 }
            );
        }

        await connectToDatabase();

        const { type, source, isActive } = parsed.data;

        const filter: any = { userId };

        if (type) filter.type = type;
        if (source) filter.source = source;
        if (typeof isActive === "boolean") filter.isActive = isActive;

        const accounts = await Account.find(filter)
            .sort({ sortOrder: 1, createdAt: 1 })
            .lean();

        const data = accounts.map((acc: any) => ({
            ...acc,
            id: acc._id.toString()
        }));

        return NextResponse.json(ok(data), { status: 200 });
    } catch (error) {
        console.error("GET /api/accounts error:", error);
        return NextResponse.json(
            fail("Internal server error"),
            { status: 500 }
        );
    }
}

// ─── POST /api/accounts ───────────────────────────────────────────────────────
// Create a new manual account for the current user.

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

        const parsed = CreateAccountSchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json(
                fail("Validation error", parsed.error.flatten()),
                { status: 400 }
            );
        }

        await connectToDatabase();

        const payload = parsed.data;

        const account = await Account.create({
            userId,
            name: payload.name,
            institution: payload.institution,
            type: payload.type,
            source: payload.source, // "manual" for manual accounts; Plaid/SnapTrade flows will also use this.
            balance: payload.balance,
            currency: payload.currency,
            isActive: payload.isActive,
            sortOrder: payload.sortOrder
        });

        const acc = account.toObject() as any;

        return NextResponse.json(
            ok({
                ...acc,
                id: acc._id.toString()
            }),
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /api/accounts error:", error);
        return NextResponse.json(
            fail("Internal server error"),
            { status: 500 }
        );
    }
}