// lib/gmail.ts

import { google } from "googleapis";
import type { gmail_v1 } from "googleapis";
import { env, features } from "./env";
import type { GmailImportInput } from "@/types";

/**
 * Minimal Gmail client wrapper using an OAuth2 access token.
 * The mobile app is responsible for obtaining the access token via OAuth.
 */
export function getGmailClient(accessToken: string) {
    if (!features.gmailImport) {
        throw new Error("Gmail import is not enabled (missing env config).");
    }

    const oAuth2Client = new google.auth.OAuth2(
        env.GMAIL_CLIENT_ID,
        env.GMAIL_CLIENT_SECRET,
        env.GMAIL_REDIRECT_URI
    );

    oAuth2Client.setCredentials({ access_token: accessToken });

    const client = google.gmail({
        version: "v1",
        auth: oAuth2Client
    });

    return client;
}

export interface ParsedGmailTransaction {
    gmailMessageId: string;
    date: Date;
    subject: string;
    from: string;
    to: string;
    snippet: string;
    textPlain?: string;
    textHtml?: string;
}

/**
 * Fetches a list of recent Gmail messages and returns a light parsed structure.
 * You will still apply your own parsing heuristics to turn these into transactions.
 */
export async function fetchRecentGmailMessages(
    input: GmailImportInput
): Promise<ParsedGmailTransaction[]> {
    const { accessToken, maxMessages } = input;

    const gmail = getGmailClient(accessToken);

    const listRes = await gmail.users.messages.list({
        userId: "me",
        maxResults: maxMessages,
        q: "category:primary newer_than:365d" // basic filter; adjust as needed
    });

    const messages = listRes.data.messages ?? [];
    if (messages.length === 0) return [];

    const results: ParsedGmailTransaction[] = [];

    for (const msg of messages) {
        if (!msg.id) continue;

        const res = await gmail.users.messages.get({
            userId: "me",
            id: msg.id,
            format: "full"
        });

        const data = res.data;

        const headers = (data.payload?.headers ?? []) as gmail_v1.Schema$MessagePartHeader[];
        const subject = headers.find((h) => h.name?.toLowerCase() === "subject")?.value ?? "";
        const from = headers.find((h) => h.name?.toLowerCase() === "from")?.value ?? "";
        const to = headers.find((h) => h.name?.toLowerCase() === "to")?.value ?? "";
        const snippet = data.snippet ?? "";

        const internalDateMs = data.internalDate
            ? Number(data.internalDate)
            : Date.now();
        const date = new Date(internalDateMs);

        const { textPlain, textHtml } = extractMessageBody(data);

        results.push({
            gmailMessageId: data.id!,
            date,
            subject,
            from,
            to,
            snippet,
            textPlain,
            textHtml
        });
    }

    return results;
}

/**
 * Extracts plain text and HTML bodies from a Gmail message.
 */
function extractMessageBody(
    message: gmail_v1.Schema$Message
): { textPlain?: string; textHtml?: string } {
    const payload = message.payload;
    if (!payload) return {};

    const parts = flattenParts(payload);

    let textPlain: string | undefined;
    let textHtml: string | undefined;

    for (const part of parts) {
        if (!part.mimeType || !part.body) continue;
        if (!part.body.data) continue;

        const data = Buffer.from(part.body.data, "base64").toString("utf8");

        if (part.mimeType === "text/plain" && !textPlain) {
            textPlain = data;
        }
        if (part.mimeType === "text/html" && !textHtml) {
            textHtml = data;
        }
    }

    return { textPlain, textHtml };
}

/**
 * Recursively flattens the parts tree of a Gmail message payload.
 */
function flattenParts(
    payload: gmail_v1.Schema$MessagePart
): gmail_v1.Schema$MessagePart[] {
    const parts: gmail_v1.Schema$MessagePart[] = [];
    if (payload.parts && payload.parts.length > 0) {
        for (const p of payload.parts) {
            parts.push(...flattenParts(p));
        }
    } else {
        parts.push(payload);
    }
    return parts;
}