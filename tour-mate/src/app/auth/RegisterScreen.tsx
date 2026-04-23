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
import { registerUser } from "@/services/auth/userService";

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // 1. Validation cơ bản
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      // 2. Gọi API từ service
      const result = await registerUser({
        username: username,
        email: email,
        password: password,
      });

      if (result.success) {
        Alert.alert("Thành công", "Đăng ký tài khoản thành công!", [
          {
            text: "OK",
            onPress: () =>
              router.push({
                pathname: "/auth/VerifyScreen",
                params: { from: "register", email: email },
              }),
          },
        ]);
      } else {
        Alert.alert("Đăng ký thất bại", result.message || "Vui lòng thử lại");
      }
    } catch (error) {
      Alert.alert("Lỗi kết nối", "Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký</Text>

      <FloatingInput
        label="Tên đăng nhập"
        value={username}
        onChangeText={setUsername}
      />
      <FloatingInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <FloatingInput
        label="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        isPassword
      />
      <FloatingInput
        label="Xác nhận mật khẩu"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        isPassword
      />

      <TouchableOpacity
        style={[styles.button, loading && { backgroundColor: "#ccc" }]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Đăng ký</Text>
        )}
      </TouchableOpacity>

      <View style={styles.loginContainer}>
        <Text>Đã có tài khoản? </Text>
        <TouchableOpacity onPress={() => router.push("/auth/LoginScreen")}>
          <Text style={styles.loginText}>Đăng nhập</Text>
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
  title: { fontSize: 24, fontWeight: "600", marginBottom: 24 },
  button: {
    backgroundColor: "#007BFF",
    height: 56,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginText: { color: "#007BFF", fontWeight: "bold" },
});
