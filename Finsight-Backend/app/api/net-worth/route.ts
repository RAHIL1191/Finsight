// app/api/net-worth/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import NetWorthSnapshot from "@/models/NetWorthSnapshot";
import { NetWorthFiltersSchema } from "@/types";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// ─── GET /api/net-worth ───────────────────────────────────────────────────────
// Returns net worth snapshots for the current user.
// Query: from?, to?, limit? (max number of points, default 12).
// Response shape:
// {
//   items: [
//     {
//       date: "2026-04-01T00:00:00.000Z",
//       totalAssets: 100000,
//       totalLiabilities: 40000,
//       netWorth: 60000,
//       currency: "CAD",
//       breakdown: { rrsp: ..., tfsa: ..., heloc: ..., ... }
//     },
//     ...
//   ]
// }

export async function GET(req: NextRequest) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return NextResponse.json(fail("Unauthorized"), { status: 401 });
        }

        const url = new URL(req.url);
        const queryObj = Object.fromEntries(url.searchParams.entries());

        const parsed = NetWorthFiltersSchema.safeParse(queryObj);
        if (!parsed.success) {
            return NextResponse.json(
                fail("Validation error", parsed.error.flatten()),
                { status: 400 }
            );
        }

        const { from, to, limit } = parsed.data;

        await connectToDatabase();

        const filter: any = { userId };

        if (from || to) {
            filter.date = {};
            if (from) filter.date.$gte = new Date(from);
            if (to) filter.date.$lte = new Date(to);
        }

        const snapshots = await NetWorthSnapshot.find(filter)
            .sort({ date: 1 })
            .limit(limit)
            .lean();

        const items = snapshots.map((s: any) => ({
            ...s,
            id: s._id.toString()
        }));

        return NextResponse.json(
            ok({
                items
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("GET /api/net-worth error:", error);
        return NextResponse.json(
            fail("Internal server error"),
            { status: 500 }
        );
    }
}