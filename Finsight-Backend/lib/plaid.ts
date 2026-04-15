// lib/plaid.ts

import {
    Configuration,
    PlaidApi,
    PlaidEnvironments,
    CountryCode,
    Products,
    LinkTokenCreateRequest,
    ItemPublicTokenExchangeRequest,
    TransactionsSyncRequest
} from "plaid";
import { env, features } from "./env";

let plaidClient: PlaidApi | null = null;

/**
 * Get a singleton Plaid client configured from environment variables.
 */
export function getPlaidClient(): PlaidApi {
    if (!features.plaid.enabled) {
        throw new Error("Plaid is not enabled (missing env config).");
    }

    if (plaidClient) return plaidClient;

    const basePath =
        env.PLAID_ENV === "production"
            ? PlaidEnvironments.production
            : env.PLAID_ENV === "development"
                ? PlaidEnvironments.development
                : PlaidEnvironments.sandbox;

    const configuration = new Configuration({
        basePath,
        baseOptions: {
            headers: {
                "PLAID-CLIENT-ID": env.PLAID_CLIENT_ID!,
                "PLAID-SECRET": env.PLAID_SECRET!,
                "Plaid-Version": "2020-09-14"
            }
        }
    });

    plaidClient = new PlaidApi(configuration);
    return plaidClient;
}

/**
 * Create a Link token for the given user id.
 * The mobile app will open Plaid Link using this token.
 */
export async function createPlaidLinkToken(userId: string): Promise<string> {
    const client = getPlaidClient();

    const request: LinkTokenCreateRequest = {
        user: {
            client_user_id: userId
        },
        client_name: "FinSight",
        products: [Products.Transactions],
        language: "en",
        country_codes: [CountryCode.Ca],
        redirect_uri: env.PLAID_REDIRECT_URI
    };

    const response = await client.linkTokenCreate(request);
    return response.data.link_token;
}

/**
 * Exchange a public token from Plaid Link for an access token and item id.
 */
export async function exchangePublicToken(
    publicToken: string
): Promise<{ accessToken: string; itemId: string }> {
    const client = getPlaidClient();

    const request: ItemPublicTokenExchangeRequest = {
        public_token: publicToken
    };

    const response = await client.itemPublicTokenExchange(request);
    return {
        accessToken: response.data.access_token,
        itemId: response.data.item_id
    };
}

/**
 * Fetch transactions incrementally using Plaid's /transactions/sync API.
 * This is the recommended way to keep up-to-date with changes.
 */
export async function syncPlaidTransactions(params: {
    accessToken: string;
    cursor?: string | null;
}) {
    const client = getPlaidClient();

    let cursor = params.cursor ?? null;

    let added: any[] = [];
    let modified: any[] = [];
    let removed: { transaction_id: string }[] = [];
    let hasMore = true;

    while (hasMore) {
        const request: TransactionsSyncRequest = {
            access_token: params.accessToken,
            cursor: cursor ?? undefined
        };

        const response = await client.transactionsSync(request);
        const data = response.data;

        added = added.concat(data.added);
        modified = modified.concat(data.modified);
        removed = removed.concat(data.removed);
        hasMore = data.has_more;
        cursor = data.next_cursor ?? null;
    }

    return {
        cursor,
        added,
        modified,
        removed
    };
}