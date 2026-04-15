// app/api/me/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { UpdateUserSchema } from "@/types";
import { ok, fail } from "@/lib/api-response";

// Ensure this route is always dynamic (no static pre-rendering).
export const dynamic = "force-dynamic";

// ─── GET /api/me ──────────────────────────────────────────────────────────────
// Returns the current authenticated user's profile.

export async function GET() {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return NextResponse.json(fail("Unauthorized"), { status: 401 });
        }

        await connectToDatabase();

        const user = await User.findById(userId).lean();
        if (!user) {
            return NextResponse.json(fail("User not found"), { status: 404 });
        }

        // Normalize id to string and hide sensitive fields.
        const { passwordHash, ...safeUser } = user as any;

        return NextResponse.json(
            ok({
                ...safeUser,
                id: user._id.toString()
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("GET /api/me error:", error);
        return NextResponse.json(
            fail("Internal server error"),
            { status: 500 }
        );
    }
}

// ─── PATCH /api/me ────────────────────────────────────────────────────────────
// Updates current user's preferences (currency, timezone, biometric settings, etc.).

export async function PATCH(req: NextRequest) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return NextResponse.json(fail("Unauthorized"), { status: 401 });
        }

        const json = await req.json().catch(() => null);
        if (!json || typeof json !== "object") {
            return NextResponse.json(fail("Invalid JSON body"), { status: 400 });
        }

        const parsed = UpdateUserSchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json(
                fail("Validation error", parsed.error.flatten()),
                { status: 400 }
            );
        }

        await connectToDatabase();

        const update = parsed.data;

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: update },
            { new: true }
        ).lean();

        if (!user) {
            return NextResponse.json(fail("User not found"), { status: 404 });
        }

        const { passwordHash, ...safeUser } = user as any;

        return NextResponse.json(
            ok({
                ...safeUser,
                id: user._id.toString()
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("PATCH /api/me error:", error);
        return NextResponse.json(
            fail("Internal server error"),
            { status: 500 }
        );
    }
}