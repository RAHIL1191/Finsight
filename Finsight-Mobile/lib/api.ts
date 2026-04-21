import * as SecureStore from "expo-secure-store";
import { API_URL } from "@/constants/config";

export async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const token = await SecureStore.getItemAsync("session_token");

    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
        credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.error || "API request failed");
    }

    return data;
}