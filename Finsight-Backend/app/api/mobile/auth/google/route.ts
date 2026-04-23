// Backend API endpoint for native Google Sign-In SDK
// Accepts ID token from native SDK, verifies with Google, creates session

import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from 'google-auth-library';
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { createSessionToken } from "@/lib/session";
import { encode } from "@/lib/jwt";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json(
        { success: false, error: "ID token required" },
        { status: 400 }
      );
    }

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

    // Create session token
    const sessionToken = createSessionToken(user._id.toString());

    // Create JWT for mobile
    const token = await encode({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      image: user.image,
    });

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

    // Set session cookie (same pattern as existing auth)
    response.cookies.set("sessionToken", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;

  } catch (error) {
    console.error("Mobile Google sign-in error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 500 }
    );
  }
}
