import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { GmailTokenUpdateSchema } from "@/types";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

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

        const parsed = GmailTokenUpdateSchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json(
                fail("Validation error", parsed.error.flatten()),
                { status: 400 }
            );
        }

        await connectToDatabase();

        const { accessToken, refreshToken, expiresAt } = parsed.data;

        await User.findByIdAndUpdate(userId, {
            $set: {
                gmailAccessToken: accessToken,
                ...(refreshToken ? { gmailRefreshToken: refreshToken } : {}),
                ...(expiresAt ? { gmailTokenExpiresAt: new Date(expiresAt) } : {})
            }
        });

        return NextResponse.json(ok({ message: "Gmail tokens linked successfully" }), { status: 200 });
    } catch (error) {
        console.error("POST /api/me/gmail error:", error);
        return NextResponse.json(fail("Internal server error"), { status: 500 });
    }
}
