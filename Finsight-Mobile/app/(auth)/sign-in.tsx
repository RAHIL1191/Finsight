import { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Alert,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { signInWithGoogle } from "@/lib/auth";
import { API_URL } from "@/constants/config";

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
    const [loading, setLoading] = useState(false);
    const { refreshSession } = useAuth();
    const router = useRouter();

    // sign-in.tsx — fix handleGoogleSignIn
    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            const result = await signInWithGoogle();

            if (result === "success") {
                await new Promise((r) => setTimeout(r, 500));
                await refreshSession();
                router.replace("/");
            } else if (result === "cancel" || result === "dismiss") {
                // User closed browser — do nothing
            } else {
                Alert.alert("Sign In Failed", "OAuth flow did not complete.");
            }
        } catch (e: any) {
            Alert.alert("Sign In Failed", e?.message || "Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-background px-6 justify-between py-16">
            {/* Top — Logo & Title */}
            <View className="items-center mt-16">
                <View className="w-20 h-20 rounded-3xl bg-primary items-center justify-center mb-6">
                    <Text className="text-white text-4xl font-bold">F</Text>
                </View>
                <Text className="text-white text-4xl font-bold tracking-tight">
                    FinSight
                </Text>
                <Text className="text-textSecondary text-base mt-3 text-center">
                    Your AI-powered personal finance{"\n"}companion
                </Text>
            </View>

            {/* Middle — Feature Highlights */}
            <View className="gap-4">
                {[
                    { emoji: "📊", title: "Smart Insights", desc: "AI-powered spending analysis" },
                    { emoji: "🏦", title: "All Accounts", desc: "Connect banks via Plaid" },
                    { emoji: "🎯", title: "Goals & Budgets", desc: "Stay on track effortlessly" },
                ].map((item) => (
                    <View key={item.title} className="flex-row items-center gap-4 bg-surface rounded-2xl p-4">
                        <Text className="text-3xl">{item.emoji}</Text>
                        <View>
                            <Text className="text-white font-semibold">{item.title}</Text>
                            <Text className="text-textSecondary text-sm">{item.desc}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Bottom — Sign In Button */}
            <View className="gap-4">
                <TouchableOpacity
                    onPress={handleGoogleSignIn}
                    disabled={loading}
                    className="bg-white rounded-2xl py-4 flex-row items-center justify-center gap-3"
                >
                    {loading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <>
                            <Text className="text-2xl">G</Text>
                            <Text className="text-black font-semibold text-base">
                                Continue with Google
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                <Text className="text-textSecondary text-xs text-center">
                    By continuing, you agree to our Terms of Service{"\n"}and Privacy Policy
                </Text>
            </View>
        </View>
    );
}