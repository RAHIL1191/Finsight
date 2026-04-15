// app/api/accounts/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Account from "@/models/Account";
import { ObjectIdSchema, UpdateAccountSchema } from "@/types";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseIdFromParams(params: { id?: string }) {
    const id = params.id;
    const parsed = ObjectIdSchema.safeParse(id);
    if (!parsed.success) return null;
    return parsed.data;
}

// ─── PATCH /api/accounts/[id] ────────────────────────────────────────────────
// Update an existing account (name, institution, balance, isActive, sortOrder, etc.).

export async function PATCH(
    req: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return NextResponse.json(fail("Unauthorized"), { status: 401 });
        }

        const accountId = parseIdFromParams(context.params);
        if (!accountId) {
            return NextResponse.json(fail("Invalid account id"), { status: 400 });
        }

        const json = await req.json().catch(() => null);
        if (!json || typeof json !== "object") {
            return NextResponse.json(fail("Invalid JSON body"), { status: 400 });
        }

        const parsed = UpdateAccountSchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json(
                fail("Validation error", parsed.error.flatten()),
                { status: 400 }
            );
        }

        await connectToDatabase();

        const update = parsed.data;

        const account = await Account.findOneAndUpdate(
            { _id: accountId, userId },
            { $set: update },
            { new: true }
        ).lean();

        if (!account) {
            return NextResponse.json(fail("Account not found"), { status: 404 });
        }

        const acc = account as any;

        return NextResponse.json(
            ok({
                ...acc,
                id: acc._id.toString()
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("PATCH /api/accounts/[id] error:", error);
        return NextResponse.json(
            fail("Internal server error"),
            { status: 500 }
        );
    }
}

// ─── DELETE /api/accounts/[id] ───────────────────────────────────────────────
// Soft delete / hide an account by setting isActive = false.

export async function DELETE(
    _req: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return NextResponse.json(fail("Unauthorized"), { status: 401 });
        }

        const accountId = parseIdFromParams(context.params);
        if (!accountId) {
            return NextResponse.json(fail("Invalid account id"), { status: 400 });
        }

        await connectToDatabase();

        const account = await Account.findOneAndUpdate(
            { _id: accountId, userId },
            { $set: { isActive: false } },
            { new: true }
        ).lean();

        if (!account) {
            return NextResponse.json(fail("Account not found"), { status: 404 });
        }

        const acc = account as any;

        return NextResponse.json(
            ok({
                ...acc,
                id: acc._id.toString()
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("DELETE /api/accounts/[id] error:", error);
        return NextResponse.json(
            fail("Internal server error"),
            { status: 500 }
        );
    }
}