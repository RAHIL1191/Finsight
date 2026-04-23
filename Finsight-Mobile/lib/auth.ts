import * as SecureStore from "expo-secure-store";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { API_URL } from "@/constants/config";

const SESSION_KEY = "finsight_session";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string;
  onboardingComplete?: boolean;
  currency?: string;
};

export async function saveSession(user: SessionUser) {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(user));
}

export async function getSession(): Promise<SessionUser | null> {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

export async function fetchSessionFromServer(): Promise<SessionUser | null> {
  try {
    const res = await fetch(`${API_URL}/api/auth/session`, {
      credentials: "include",
    });
    const data = await res.json();
    if (data?.user?.email) return data.user;
    return null;
  } catch {
    return null;
  }
}

// Initialize Google Sign-In SDK
GoogleSignin.configure({
  // This comes from Google Cloud Console OAuth 2.0 Client IDs
  // For iOS: com.rahil.finsight (matches app.json bundle identifier)
  // For Android: com.rahil.finsight (matches app.json package)
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'YOUR_WEB_CLIENT_ID_HERE',
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  offlineAccess: true,
  scopes: ['openid', 'profile', 'email'],
});

export async function signInWithGoogle(): Promise<string> {
  try {
    // Check if Google Play Services are available (Android)
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Start native Google Sign-In flow
    const signInResult = await GoogleSignin.signIn();

    const idToken = signInResult.data?.idToken;

    if (!idToken) {
      throw new Error('No ID token received');
    }

    // Send ID token to backend for verification and session creation
    const response = await fetch(`${API_URL}/api/mobile/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idToken,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Authentication failed');
    }

    // Store session data
    if (data.token) {
      await SecureStore.setItemAsync("session_token", data.token);
    }
    if (data.user) {
      await saveSession(data.user);
    }

    return "success";
  } catch (error: any) {
    console.error('Native Google sign-in error:', error);

    // Handle different error codes
    if (error.code === 'SIGN_IN_CANCELLED' || error.code === 'CANCELED') {
      return "cancel";
    }
    if (error.code === 'SIGN_IN_REQUIRED') {
      return "dismiss";
    }

    throw error;
  }
}

export async function signOut() {
  try {
    // Sign out from native SDK
    await GoogleSignin.signOut();
  } catch (error) {
    console.error('Google sign out error:', error);
    // Continue with session cleanup even if native sign out fails
  }

  // Clear local session
  await clearSession();
  await SecureStore.deleteItemAsync("session_token");
  await fetch(`${API_URL}/api/auth/signout`, {
    method: "POST",
    credentials: "include",
  });
}
