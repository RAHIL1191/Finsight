// app/api/plaid/exchange/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { features } from "@/lib/env";
import { exchangePublicToken, getPlaidClient } from "@/lib/plaid";
import Account from "@/models/Account";
import { PlaidExchangeSchema } from "@/types";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// ─── POST /api/plaid/exchange ────────────────────────────────────────────────
// Body:
// {
//   "publicToken": "...",
//   "institutionName": "Bank name", // optional
//   "accountIds": ["..."]          // optional: limit to selected Plaid accounts
// }

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

        const parsed = PlaidExchangeSchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json(
                fail("Validation error", parsed.error.flatten()),
                { status: 400 }
            );
        }

        const { publicToken, institutionName, accountIds } = parsed.data;

        await connectToDatabase();

        // 1. Exchange public token for access token + item id.
        const { accessToken, itemId } = await exchangePublicToken(publicToken);

        // 2. Fetch Plaid accounts for this item.
        const plaid = getPlaidClient();
        const accountsRes = await plaid.accountsGet({
            access_token: accessToken
        });

        const plaidAccounts = accountsRes.data.accounts;

        const createdOrUpdated: any[] = [];

        for (const pa of plaidAccounts) {
            // If caller provided specific accountIds, skip others.
            if (accountIds && accountIds.length > 0 && !accountIds.includes(pa.account_id)) {
                continue;
            }

            // Map Plaid subtype/type to our AccountType.
            const accountType = mapPlaidToAccountType(pa.type, pa.subtype);

            const existing = await Account.findOne({
                userId,
                plaidItemId: itemId,
                plaidAccountId: pa.account_id
            });

            const balance =
                pa.balances.current ??
                pa.balances.available ??
                pa.balances.limit ??
                0;

            const currency = pa.balances.iso_currency_code ?? "CAD";

            if (existing) {
                existing.name = pa.name || existing.name;
                existing.institution = institutionName ?? existing.institution;
                existing.type = accountType;
                existing.source = "plaid";
                existing.balance = balance;
                existing.currency = currency;
                existing.isActive = true;
                existing.plaidAccessToken = accessToken;
                existing.plaidItemId = itemId;
                existing.plaidAccountId = pa.account_id;

                await existing.save();

                const doc = existing.toObject() as any;
                createdOrUpdated.push({
                    ...doc,
                    id: doc._id.toString()
                });
            } else {
                const account = await Account.create({
                    userId,
                    name: pa.name || pa.official_name || "Plaid account",
                    institution: institutionName ?? pa.official_name ?? null,
                    type: accountType,
                    source: "plaid",
                    balance,
                    currency,
                    plaidAccessToken: accessToken,
                    plaidItemId: itemId,
                    plaidAccountId: pa.account_id,
                    isActive: true,
                    sortOrder: 0
                });

                const doc = account.toObject() as any;
                createdOrUpdated.push({
                    ...doc,
                    id: doc._id.toString()
                });
            }
        }

        return NextResponse.json(
            ok({
                itemId,
                accounts: createdOrUpdated
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("POST /api/plaid/exchange error:", error);
        return NextResponse.json(
            fail("Internal server error"),
            { status: 500 }
        );
    }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapPlaidToAccountType(
    type?: string | null,
    subtype?: string | null
): string {
    // Basic mapping tuned for Canadian accounts; adjust as needed.
    if (type === "depository") {
        if (subtype === "savings") return "savings";
        if (subtype === "checking") return "checking";
        return "checking";
    }

    if (type === "credit") {
        if (subtype === "credit card") return "credit";
        return "credit";
    }

    if (type === "loan") {
        if (subtype === "student") return "loan";
        if (subtype === "mortgage") return "mortgage";
        if (subtype === "home equity") return "heloc";
        return "loan";
    }

    if (type === "investment") {
        return "investment";
    }

    return "other";
}