import { Redirect } from "expo-router";
import { Platform } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { isLoggedIn, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#003d9b" />
      </View>
    );
  }

  // Nếu đã đăng nhập, chuyển hướng theo role
  if (isLoggedIn && user) {
    if (user.role === 'guide') {
      return <Redirect href="/guide/GuideHomeScreen" />;
    }
    return <Redirect href="/home/HomeScreen" />;
  }

  // Nếu là Web, hiển thị HomeScreen đầu tiên (cho khách vãng lai)
  if (Platform.OS === 'web') {
    return <Redirect href="/home/HomeScreen" />;
  }
  
  // Nếu là Mobile (iOS/Android), hiển thị LoginScreen đầu tiên
  return <Redirect href="/auth/LoginScreen" />;
}
