import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Màn hình Auth (Modal) */}
        <Stack.Screen 
          name="auth/LoginScreen" 
          options={{ presentation: 'transparentModal', animation: 'fade' }} 
        />
        <Stack.Screen 
          name="auth/RegisterScreen" 
          options={{ presentation: 'transparentModal', animation: 'fade' }} 
        />
        <Stack.Screen 
          name="auth/MailVerifyScreen" 
          options={{ presentation: 'transparentModal', animation: 'fade' }} 
        />
        <Stack.Screen 
          name="auth/VerifyScreen" 
          options={{ presentation: 'transparentModal', animation: 'fade' }} 
        />

        {/* Tabs (home, explore, ...) */}
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AuthProvider>
  );
}