import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Màn hình Login */}
      <Stack.Screen name="auth/LoginScreen" />

      {/* Tabs (home, explore, ...) */}
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}