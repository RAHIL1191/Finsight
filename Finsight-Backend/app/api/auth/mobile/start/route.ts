// app/api/auth/mobile/start/route.ts
// Pure server-side redirect for mobile OAuth.
// Fetches CSRF token internally, POSTs to NextAuth's signin endpoint,
// extracts the Google OAuth redirect URL, and redirects the mobile browser
// directly to Google. Zero client-side JavaScript needed.

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const callbackUrl =
        url.searchParams.get("callbackUrl") ||
        `${url.origin}/api/auth/mobile`;

    const origin = url.origin;

    try {
        // Step 1: Get CSRF token from NextAuth
        const csrfRes = await fetch(`${origin}/api/auth/csrf`, {
            headers: { cookie: req.headers.get("cookie") || "" },
        });
        const csrfData = await csrfRes.json();
        const csrfToken = csrfData.csrfToken;

        // Collect any Set-Cookie headers from the CSRF response
        const csrfCookies = csrfRes.headers.getSetCookie?.() || [];

        // Merge incoming cookies with new CSRF cookies for the next request
        const existingCookies = req.headers.get("cookie") || "";
        const newCookiePairs = csrfCookies
            .map((c: string) => c.split(";")[0])
            .join("; ");
        const mergedCookies = [existingCookies, newCookiePairs]
            .filter(Boolean)
            .join("; ");

        // Step 2: POST to NextAuth's Google sign-in endpoint
        // This returns a 302 redirect to Google's OAuth URL
        const signinRes = await fetch(
            `${origin}/api/auth/signin/google`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    cookie: mergedCookies,
                },
                body: new URLSearchParams({
                    csrfToken,
                    callbackUrl,
                }).toString(),
                redirect: "manual", // Don't follow the redirect — we want the Location header
            }
        );

        // Step 3: Extract the Google OAuth URL from the 302 response
        const googleUrl = signinRes.headers.get("location");

        if (!googleUrl) {
            // Fallback: show a simple error page
            return new NextResponse(
                errorPage("Could not start Google sign-in. Please try again."),
                { status: 500, headers: { "Content-Type": "text/html" } }
            );
        }

        // Step 4: Redirect mobile browser directly to Google
        // Pass through all Set-Cookie headers from both responses
        const response = NextResponse.redirect(googleUrl);

        // Forward cookies from CSRF and signin responses
        const signinCookies = signinRes.headers.getSetCookie?.() || [];
        for (const cookie of [...csrfCookies, ...signinCookies]) {
            response.headers.append("Set-Cookie", cookie);
        }

        return response;
    } catch (err) {
        console.error("Mobile auth start error:", err);
        return new NextResponse(
            errorPage("Connection error. Please close and try again."),
            { status: 500, headers: { "Content-Type": "text/html" } }
        );
    }
}

function errorPage(message: string): string {
    return `<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="background:#0F0F14;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui,sans-serif">
<p style="color:#EF4444;font-size:16px;text-align:center;padding:20px">${message}</p>
</body></html>`;
}
