// app/api/cashflow/calendar/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import { CalendarQuerySchema } from "@/types";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// ─── GET /api/cashflow/calendar ──────────────────────────────────────────────
// Returns daily expense totals for a given year + month.
// Query: year, month, optional accountId
// Response shape:
// {
//   year: 2026,
//   month: 4,
//   accountId: "...",
//   days: [
//     { date: "2026-04-01", totalExpenses: 123.45 },
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

        const parsed = CalendarQuerySchema.safeParse(queryObj);
        if (!parsed.success) {
            return NextResponse.json(
                fail("Validation error", parsed.error.flatten()),
                { status: 400 }
            );
        }

        const { year, month, accountId } = parsed.data;

        await connectToDatabase();

        const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
        const end = new Date(year, month, 0, 23, 59, 59, 999); // last day of month

        const match: any = {
            userId,
            type: "expense",
            excludeFromBudget: false,
            date: { $gte: start, $lte: end }
        };

        if (accountId) {
            match.accountId = accountId;
        }

        const pipeline = [
            { $match: match },
            {
                $group: {
                    _id: {
                        date: {
                            $dateToString: { format: "%Y-%m-%d", date: "$date" }
                        }
                    },
                    totalExpenses: { $sum: "$amount" }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id.date",
                    totalExpenses: 1
                }
            },
            { $sort: { date: 1 } }
        ];

        const results = (await Transaction.aggregate(pipeline)) as {
            date: string;
            totalExpenses: number;
        }[];

        return NextResponse.json(
            ok({
                year,
                month,
                accountId: accountId ?? null,
                days: results
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("GET /api/cashflow/calendar error:", error);
        return NextResponse.json(
            fail("Internal server error"),
            { status: 500 }
        );
    }
}