import "../global.css";
import { Stack } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ClerkProvider, ClerkLoaded } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import Constants from "expo-constants";

const publishableKey = Constants.expoConfig?.extra?.clerkPublishableKey as string;

if (!publishableKey) {
  throw new Error(
    "Missing publishableKey. Please set clerkPublishableKey in app.json"
  );
}

export default function RootLayout() {
  console.log("RootLayout: Rendering provider");
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaProvider>
    </ClerkProvider>
  );
}
