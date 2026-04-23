import * as SecureStore from "expo-secure-store";
import * as Linking from "expo-linking";
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

/**
 * Opens Google sign-in in the device's default browser (NOT Chrome Custom Tabs).
 * This avoids the forced-dark-mode rendering issue in Custom Tabs.
 * The callback comes back via the finsight:// deep link scheme.
 */
export async function signInWithGoogle(): Promise<string> {
    const callbackUrl = `${API_URL}/api/auth/mobile`;
    const authUrl = `${API_URL}/api/auth/mobile/start?callbackUrl=${encodeURIComponent(callbackUrl)}`;

    return new Promise<string>((resolve) => {
        let resolved = false;

        // Listen for the deep link callback from the OAuth flow
        const subscription = Linking.addEventListener("url", (event) => {
            if (resolved) return;

            try {
                const url = new URL(event.url);

                // Only handle our auth callback
                if (!event.url.startsWith("finsight://auth/callback")) return;

                resolved = true;
                subscription.remove();

                const token = url.searchParams.get("token");
                const userJson = url.searchParams.get("user");
                const success = url.searchParams.get("success");

                if ((success === "true" || token) && token && userJson) {
                    SecureStore.setItemAsync("session_token", token);
                    saveSession(JSON.parse(userJson));
                    resolve("success");
                } else {
                    resolve("failure");
                }
            } catch (e) {
                resolved = true;
                subscription.remove();
                resolve("failure");
            }
        });

        // Open in the default browser (not Chrome Custom Tabs)
        Linking.openURL(authUrl);

        // Timeout after 2 minutes — user probably cancelled
        setTimeout(() => {
            if (!resolved) {
                resolved = true;
                subscription.remove();
                resolve("cancel");
            }
        }, 120000);
    });
}

export async function signOut() {
    await clearSession();
    await SecureStore.deleteItemAsync("session_token");
    await fetch(`${API_URL}/api/auth/signout`, {
        method: "POST",
        credentials: "include",
    });
}