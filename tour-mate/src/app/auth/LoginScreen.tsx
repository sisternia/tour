import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import FloatingInput from "@/components/ui/FloatingInput";
import { loginUser } from "@/services/auth/userService";

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);
    try {
      const result = await loginUser({ username, password });

      if (result.success) {
        router.replace("/(tabs)");
      } else {
        if (result.email) {
          Alert.alert("Thông báo", result.message, [
            {
              text: "Xác thực ngay",
              onPress: () => router.push("/auth/MailVerifyScreen"),
            },
            { text: "Để sau", style: "cancel" },
          ]);
        } else {
          Alert.alert("Thất bại", result.message);
        }
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>Tour Mate</Text>
      <Text style={styles.title}>Đăng nhập</Text>

      <FloatingInput
        label="Tên đăng nhập"
        value={username}
        onChangeText={setUsername}
      />

      <FloatingInput
        label="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        isPassword
      />

      <TouchableOpacity
        style={styles.forgotContainer}
        onPress={() => router.push("/auth/ForgotPassScreen")}
      >
        <Text style={styles.forgotText}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Đăng nhập</Text>
        )}
      </TouchableOpacity>

      <View style={styles.registerContainer}>
        <Text>Chưa có tài khoản? </Text>
        <TouchableOpacity onPress={() => router.push("/auth/RegisterScreen")}>
          <Text style={styles.registerText}>Đăng ký</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#007BFF",
  },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 20 },
  forgotContainer: { alignItems: "flex-end", marginBottom: 20 },
  forgotText: { color: "#007BFF" },
  button: {
    backgroundColor: "#007BFF",
    height: 56,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  registerText: { color: "#007BFF", fontWeight: "bold" },
});
