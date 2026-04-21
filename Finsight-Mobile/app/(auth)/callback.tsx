import { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function AuthCallback() {
    const { refreshSession } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const complete = async () => {
            await refreshSession();
            router.replace("/");
        };
        complete();
    }, []);

    return (
        <View className="flex-1 bg-background items-center justify-center gap-4">
            <ActivityIndicator size="large" color="#6C63FF" />
            <Text className="text-textSecondary">Completing sign in...</Text>
        </View>
    );
}