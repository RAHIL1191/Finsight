import React, { createContext, useContext, useEffect, useState } from "react";
import { getSession, saveSession, clearSession, SessionUser, fetchSessionFromServer } from "@/lib/auth";

type AuthState = {
    user: SessionUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    refreshSession: () => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    refreshSession: async () => { },
    logout: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<SessionUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshSession = async () => {
        setIsLoading(true);
        try {
            // First check local secure store
            const local = await getSession();
            if (local) {
                setUser(local);
                setIsLoading(false);
                return;
            }
            // Then try server
            const server = await fetchSessionFromServer();
            if (server) {
                await saveSession(server);
                setUser(server);
            }
        } catch (e) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        await clearSession();
        setUser(null);
    };

    useEffect(() => {
        refreshSession();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                refreshSession,
                logout,
            }
            }
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);