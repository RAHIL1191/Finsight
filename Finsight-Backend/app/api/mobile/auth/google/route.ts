// Backend API endpoint for native Google Sign-In SDK
// Accepts ID token from native SDK, verifies with Google, creates session

import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { idToken } = await req.json();

    if (!idToken) {
      console.error("Mobile Google auth: No ID token provided");
      return NextResponse.json(
        { success: false, error: "ID token required" },
        { status: 400 }
      );
    }

    console.log("Mobile Google auth: Verifying ID token", {
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      clientIdPreview: process.env.GOOGLE_CLIENT_ID?.substring(0, 10)
    });

    // Verify the ID token with Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return NextResponse.json(
        { success: false, error: "Invalid token or missing email" },
        { status: 401 }
      );
    }

    // Find or create user
    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = await User.create({
        name: payload.name || payload.email.split("@")[0],
        email: payload.email,
        image: payload.picture,
        providers: ["google"],
        currency: "CAD",
        timezone: "America/Toronto",
        biometricLockEnabled: false,
        biometricLockTimeout: 5,
        onboardingComplete: false
      });
    } else if (!user.providers.includes("google")) {
      user.providers.push("google");
      await user.save();
    }

    // Create JWT token for mobile
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        image: user.image,
      },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '30d' }
    );

    // Create auth cookie (optional, for web compatibility)
    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image,
        onboardingComplete: user.onboardingComplete,
      }
    });

    // Set session cookie for web compatibility
    response.cookies.set("sessionToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;

  } catch (error) {
    console.error("Mobile Google sign-in error:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : "No stack",
      idTokenLength: (await req.json())?.idToken?.length
    });
    return NextResponse.json(
      { success: false, error: "Authentication failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
