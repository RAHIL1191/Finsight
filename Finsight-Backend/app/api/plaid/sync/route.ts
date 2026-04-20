// app/api/plaid/sync/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { features } from "@/lib/env";
import { getPlaidClient, syncPlaidTransactions } from "@/lib/plaid";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import { PlaidSyncSchema } from "@/types";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// ─── POST /api/plaid/sync ─────────────────────────────────────────────────────
// Body:
// {
//   "accountId": "local-account-id" // required: our Account _id
// }
//
// Uses the Account's plaidAccessToken + plaidCursor to:
// - Call Plaid /transactions/sync
// - Upsert added/modified transactions
// - Mark removed transactions as deleted
// - Update Account balance + plaidCursor + lastSyncedAt

export async function POST(req: NextRequest) {
    try {
        if (!features.plaid.enabled) {
            return NextResponse.json(
                fail("Plaid is not enabled on this server"),
                { status: 503 }
            );
        }

        const userId = await getCurrentUserId();
        if (!userId) {
            return NextResponse.json(fail("Unauthorized"), { status: 401 });
        }

        const json = await req.json().catch(() => null);
        if (!json || typeof json !== "object") {
            return NextResponse.json(fail("Invalid JSON body"), { status: 400 });
        }

        const parsed = PlaidSyncSchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json(
                fail("Validation error", parsed.error.flatten()),
                { status: 400 }
            );
        }

        const { accountId } = parsed.data;

        await connectToDatabase();

        const account = await Account.findOne({
            _id: accountId,
            userId,
            source: "plaid",
            isActive: true
        });

        if (!account) {
            return NextResponse.json(
                fail("Account not found"),
                { status: 404 }
            );
        }

        if (!account.plaidAccessToken || !account.plaidAccountId) {
            return NextResponse.json(
                fail("Account is missing Plaid credentials"),
                { status: 400 }
            );
        }

        const accessToken = account.plaidAccessToken as string;
        const plaidAccountId = account.plaidAccountId as string;
        const cursor = account.plaidCursor ?? null;

        // 1. Call our Plaid helper to run /transactions/sync loop.
        const { cursor: newCursor, added, modified, removed } =
            await syncPlaidTransactions({
                accessToken,
                cursor
            });

        // 2. Filter to this specific Plaid account id.
        const addedForAccount = added.filter(
            (t: any) => t.account_id === plaidAccountId
        );
        const modifiedForAccount = modified.filter(
            (t: any) => t.account_id === plaidAccountId
        );
        const removedIds = removed.map((r: any) => r.transaction_id);

        // 3. Upsert added transactions.
        for (const t of addedForAccount) {
            await upsertPlaidTransaction(userId, accountId, t);
        }

        // 4. Upsert modified transactions.
        for (const t of modifiedForAccount) {
            await upsertPlaidTransaction(userId, accountId, t);
        }

        // 5. Soft-delete removed transactions.
        if (removedIds.length > 0) {
            await Transaction.updateMany(
                {
                    userId,
                    accountId,
                    plaidTransactionId: { $in: removedIds }
                },
                {
                    $set: { isDeleted: true }
                }
            );
        }

        // 6. Refresh account balance from Plaid accounts endpoint (optional but nice).
        const plaid = getPlaidClient();
        const accountsRes = await plaid.accountsGet({
            access_token: accessToken
        });

        const pa = accountsRes.data.accounts.find(
            (a) => a.account_id === plaidAccountId
        );

        if (pa) {
            const balance =
                pa.balances.current ??
                pa.balances.available ??
                pa.balances.limit ??
                0;

            const currency = pa.balances.iso_currency_code ?? "CAD";

            account.balance = balance;
            account.currency = currency;
        }

        // 7. Persist cursor + lastSyncedAt.
        account.plaidCursor = newCursor;
        account.lastSyncedAt = new Date();
        await account.save();

        return NextResponse.json(
            ok({
                accountId: account.id,
                added: addedForAccount.length,
                modified: modifiedForAccount.length,
                removed: removedIds.length,
                cursor: newCursor
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("POST /api/plaid/sync error:", error);
        return NextResponse.json(
            fail("Internal server error"),
            { status: 500 }
        );
    }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function upsertPlaidTransaction(
    userId: string,
    accountId: string,
    t: any
) {
    const pf = t.personal_finance_category;

    const category =
        pf?.detailed ??
        pf?.primary ??
        null;

    const existing = await Transaction.findOne({
        userId,
        accountId,
        plaidTransactionId: t.transaction_id
    });

    const base = {
        userId,
        accountId,
        plaidTransactionId: t.transaction_id,
        date: t.date,
        name: t.name,
        merchantName: t.merchant_name ?? null,
        amount: Math.abs(t.amount),
        isDebit: t.amount < 0,
        currency: t.iso_currency_code ?? "CAD",
        plaidCategory: category,
        plaidRaw: t,
        isDeleted: false
    };

    if (existing) {
        Object.assign(existing, base);
        await existing.save();
    } else {
        await Transaction.create(base);
    }
}