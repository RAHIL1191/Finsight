import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/expo";
import * as SecureStore from "expo-secure-store";


export default function SplashScreen() {
    const router = useRouter();
    const { isLoaded, isSignedIn, userId } = useAuth();
    const [isOnboarded, setIsOnboarded] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    console.log("SplashScreen: State", { isLoaded, isSignedIn, userId, isChecking, isOnboarded });

    useEffect(() => {
        async function checkOnboarding() {
            if (!isLoaded) return;

            if (!userId) {
                setIsChecking(false);
                return;
            }

            setIsChecking(true);

            try {
                // Check local storage first
                const onboarded = await SecureStore.getItemAsync("onboardingComplete");
                if (onboarded) {
                    setIsOnboarded(true);
                }
            } catch (error) {
                console.error("Error checking onboarding:", error);
            } finally {
                setIsChecking(false);
            }
        }

        checkOnboarding();
    }, [isLoaded, userId]);

    useEffect(() => {
        if (!isLoaded || isChecking) return;

        if (!isSignedIn) {
            router.replace("/(auth)/sign-in");
            return;
        }

        // If we are signed in, go home. 
        // (If you want to force onboarding later, you should redirect to an onboarding screen here, NOT sign-in)
        router.replace("/(tabs)/home");
    }, [isLoaded, isSignedIn, isOnboarded, isChecking]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0F0F14' }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
                <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: '#6C63FF', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 36, fontWeight: 'bold' }}>F</Text>
                </View>
                <Text style={{ color: '#FFFFFF', textAlign: 'center', fontSize: 18, fontWeight: 'bold', marginTop: 12 }}>
                    FinSight
                </Text>
                <Text style={{ color: '#8888AA', textAlign: 'center', fontSize: 14, marginTop: 8 }}>
                    Smart • Secure • Simple
                </Text>
            </View>
        </SafeAreaView>
    );
}
