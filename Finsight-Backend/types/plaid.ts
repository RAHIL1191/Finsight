// types/plaid.ts

import { z } from "zod";

/**
 * Body for POST /api/plaid/exchange
 *
 * {
 *   publicToken: string;
 *   institutionName?: string;
 *   accountIds?: string[];
 * }
 */
export const PlaidExchangeSchema = z.object({
    publicToken: z.string().min(1, "publicToken is required"),
    institutionName: z.string().min(1).optional(),
    accountIds: z.array(z.string().min(1)).optional()
});
export type PlaidExchangeInput = z.infer<typeof PlaidExchangeSchema>;

/**
 * Body for POST /api/plaid/sync
 *
 * {
 *   accountId: string; // our local Account _id
 * }
 */
export const PlaidSyncSchema = z.object({
    accountId: z.string().min(1, "accountId is required")
});
export type PlaidSyncInput = z.infer<typeof PlaidSyncSchema>;