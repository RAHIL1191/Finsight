import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
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

export async function signInWithGoogle(): Promise<string> {
    const callbackUrl = `${API_URL}/api/auth/mobile`;
    const authUrl = `${API_URL}/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`;
    const redirectUri = "finsight://auth/callback";

    const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri
    );

    if (result.type === "success" && result.url) {
        const url = new URL(result.url);
        const token = url.searchParams.get("token");
        const userJson = url.searchParams.get("user");

        if (token) {
            await SecureStore.setItemAsync("session_token", token);
        }
        if (userJson) {
            await saveSession(JSON.parse(userJson));
        }
    }

    return result.type;
}

export async function signOut() {
    await clearSession();
    await SecureStore.deleteItemAsync("session_token");
    await fetch(`${API_URL}/api/auth/signout`, {
        method: "POST",
        credentials: "include",
    });
}