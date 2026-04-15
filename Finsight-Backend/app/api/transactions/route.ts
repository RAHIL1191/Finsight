// app/api/transactions/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import {
    TransactionFiltersSchema,
    PaginationSchema,
    CreateTransactionSchema
} from "@/types";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// ─── GET /api/transactions ────────────────────────────────────────────────────
// Returns transactions for the current user, with optional filters:
// - accountId, type, status, category, from, to, search, tags, excludeFromBudget
// Sorted by date desc, then createdAt desc for stable infinite scroll.

export async function GET(req: NextRequest) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return NextResponse.json(fail("Unauthorized"), { status: 401 });
        }

        const url = new URL(req.url);
        const queryEntries = Object.fromEntries(url.searchParams.entries());

        const filtersParsed = TransactionFiltersSchema.safeParse(queryEntries);
        if (!filtersParsed.success) {
            return NextResponse.json(
                fail("Validation error", filtersParsed.error.flatten()),
                { status: 400 }
            );
        }

        // Pagination: page + limit (simple page-based for now; easy to adapt to cursor).
        const paginationParsed = PaginationSchema.safeParse(queryEntries);
        if (!paginationParsed.success) {
            return NextResponse.json(
                fail("Pagination validation error", paginationParsed.error.flatten()),
                { status: 400 }
            );
        }

        const filters = filtersParsed.data;
        const { page, limit } = paginationParsed.data;

        await connectToDatabase();

        const mongoFilter: any = { userId };

        if (filters.accountId) {
            mongoFilter.accountId = filters.accountId;
        }
        if (filters.type) {
            mongoFilter.type = filters.type;
        }
        if (filters.status) {
            mongoFilter.status = filters.status;
        }
        if (filters.category) {
            mongoFilter.category = filters.category;
        }
        if (typeof filters.excludeFromBudget === "boolean") {
            mongoFilter.excludeFromBudget = filters.excludeFromBudget;
        }
        if (filters.from || filters.to) {
            mongoFilter.date = {};
            if (filters.from) {
                mongoFilter.date.$gte = new Date(filters.from);
            }
            if (filters.to) {
                mongoFilter.date.$lte = new Date(filters.to);
            }
        }
        if (filters.tags && filters.tags.length > 0) {
            mongoFilter.tags = { $all: filters.tags };
        }
        if (filters.search) {
            mongoFilter.$or = [
                { name: { $regex: filters.search, $options: "i" } },
                { originalName: { $regex: filters.search, $options: "i" } },
                { notes: { $regex: filters.search, $options: "i" } }
            ];
        }

        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            Transaction.find(mongoFilter)
                .sort({ date: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Transaction.countDocuments(mongoFilter)
        ]);

        const data = items.map((tx: any) => ({
            ...tx,
            id: tx._id.toString()
        }));

        return NextResponse.json(
            ok({
                items: data,
                page,
                limit,
                total
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("GET /api/transactions error:", error);
        return NextResponse.json(
            fail("Internal server error"),
            { status: 500 }
        );
    }
}

// ─── POST /api/transactions ──────────────────────────────────────────────────
// Creates a new manual transaction for the current user.

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

        const parsed = CreateTransactionSchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json(
                fail("Validation error", parsed.error.flatten()),
                { status: 400 }
            );
        }

        await connectToDatabase();

        const payload = parsed.data;

        const tx = await Transaction.create({
            userId,
            accountId: payload.accountId,
            amount: payload.amount,
            currency: payload.currency,
            type: payload.type,
            status: payload.status,
            source: payload.source,
            name: payload.name,
            originalName: payload.originalName,
            category: payload.category,
            subcategory: payload.subcategory,
            date: new Date(payload.date),
            notes: payload.notes,
            transferAccountId: payload.transferAccountId,
            tags: payload.tags,
            excludeFromBudget: payload.excludeFromBudget,
            excludeFromNetWorth: payload.excludeFromNetWorth,
            attachmentUrl: payload.attachmentUrl
        });

        const created = tx.toObject() as any;

        return NextResponse.json(
            ok({
                ...created,
                id: created._id.toString()
            }),
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /api/transactions error:", error);
        return NextResponse.json(
            fail("Internal server error"),
            { status: 500 }
        );
    }
}