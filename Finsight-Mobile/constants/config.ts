export const API_URL = "https://finsight-one-chi.vercel.app";

export const ENDPOINTS = {
    auth: {
        providers: `${API_URL}/api/auth/providers`,
        signIn: `${API_URL}/api/auth/signin`,
        signOut: `${API_URL}/api/auth/signout`,
        session: `${API_URL}/api/auth/session`,
        googleSignIn: `${API_URL}/api/auth/signin/google`,
        callbackUrl: `${API_URL}/api/auth/callback/google`,
    },
    me: `${API_URL}/api/me`,
};