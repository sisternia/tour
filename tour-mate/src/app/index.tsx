import { Redirect } from "expo-router";
import { Platform } from "react-native";

export default function Index() {
  // Nếu là Web, hiển thị HomeScreen đầu tiên
  if (Platform.OS === 'web') {
    return <Redirect href="/home/HomeScreen" />;
  }
  
  // Nếu là Mobile (iOS/Android), hiển thị LoginScreen đầu tiên
  return <Redirect href="/auth/LoginScreen" />;
}
