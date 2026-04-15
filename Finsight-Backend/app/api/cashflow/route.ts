// app/api/cashflow/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import { CashflowQuerySchema } from "@/types";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// ─── GET /api/cashflow ────────────────────────────────────────────────────────
// Returns monthly income vs expenses for the last N months (default 12).
// Response shape:
// {
//   items: [
//     { month: "2026-01", income: 1234, expenses: 567, net: 667 },
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

        const parsed = CashflowQuerySchema.safeParse(queryObj);
        if (!parsed.success) {
            return NextResponse.json(
                fail("Validation error", parsed.error.flatten()),
                { status: 400 }
            );
        }

        const { months, accountId, currency } = parsed.data;

        await connectToDatabase();

        const now = new Date();
        const start = new Date(now);
        start.setMonth(start.getMonth() - (months - 1));
        start.setHours(0, 0, 0, 0);

        const match: any = {
            userId,
            date: { $gte: start, $lte: now },
            excludeFromBudget: false,
            currency
        };

        if (accountId) {
            match.accountId = accountId;
        }

        // Group by month (YYYY-MM) and transaction type.
        const pipeline = [
            { $match: match },
            {
                $group: {
                    _id: {
                        month: {
                            $dateToString: { format: "%Y-%m", date: "$date" }
                        },
                        type: "$type"
                    },
                    total: { $sum: "$amount" }
                }
            },
            {
                $group: {
                    _id: "$_id.month",
                    income: {
                        $sum: {
                            $cond: [{ $eq: ["$_id.type", "income"] }, "$total", 0]
                        }
                    },
                    expenses: {
                        $sum: {
                            $cond: [{ $eq: ["$_id.type", "expense"] }, "$total", 0]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id",
                    income: 1,
                    expenses: 1,
                    net: { $subtract: ["$income", "$expenses"] }
                }
            },
            { $sort: { month: 1 } }
        ];

        const results = (await Transaction.aggregate(pipeline)) as {
            month: string;
            income: number;
            expenses: number;
            net: number;
        }[];

        return NextResponse.json(
            ok({
                currency,
                months,
                accountId: accountId ?? null,
                items: results
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("GET /api/cashflow error:", error);
        return NextResponse.json(
            fail("Internal server error"),
            { status: 500 }
        );
    }
}