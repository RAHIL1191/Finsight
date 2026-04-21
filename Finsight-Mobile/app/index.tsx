import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function SplashScreen() {
    const { isLoading, isAuthenticated, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            router.replace("/(auth)/sign-in");
            return;
        }

        if (!user?.onboardingComplete) {
            router.replace("/(onboarding)/welcome");
            return;
        }

        router.replace("/(tabs)/home");
    }, [isLoading, isAuthenticated, user]);

    return (
        <View className="flex-1 bg-background items-center justify-center">
            <ActivityIndicator size="large" color="#6C63FF" />
        </View>
    );
}