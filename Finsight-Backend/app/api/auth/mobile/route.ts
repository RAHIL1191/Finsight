// Finsight-Backend/app/api/auth/mobile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { sign } from "jsonwebtoken";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        // If no session, redirect to backend sign-in
        return NextResponse.redirect(new URL("/api/auth/signin", req.url));
    }

    // Sign a token for the mobile app to use for API calls
    // We use the NEXTAUTH_SECRET as the signing key
    const token = sign(
        {
            id: (session.user as any).id,
            email: session.user.email,
            name: session.user.name,
        },
        process.env.NEXTAUTH_SECRET!,
        { expiresIn: "7d" }
    );

    const user = {
        id: (session.user as any).id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
    };

    // Construct params for the mobile app's custom scheme
    const params = new URLSearchParams({
        success: "true",
        user: JSON.stringify(user),
        token: token,
    });

    // 🚀 Redirect back to the mobile app via custom scheme
    return NextResponse.redirect(`finsight://auth/callback?${params.toString()}`);
}
