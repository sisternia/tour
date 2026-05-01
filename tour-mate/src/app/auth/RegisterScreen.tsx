import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import FloatingInput from "@/components/ui/FloatingInput";
import { registerUser } from "@/services/auth/userService";
import NotificationModal from "@/components/ui/NotificationModal";

import AuthLayout from "@/components/auth/AuthLayout";

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Notification Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    type: 'info',
    title: '',
    message: ''
  });

  const showNotification = (type: any, title: string, message: string) => {
    setModalConfig({ type, title, message });
    setModalVisible(true);
  };

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      showNotification('error', 'Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (password !== confirmPassword) {
      showNotification('error', 'Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      const result = await registerUser({
        username: username,
        email: email,
        password: password,
      });

      if (result.success) {
        showNotification('success', 'Thành công', 'Đăng ký tài khoản thành công! Vui lòng xác thực email.');
        setTimeout(() => {
          setModalVisible(false);
          router.replace({
            pathname: "/auth/VerifyScreen",
            params: { from: "register", email: email },
          });
        }, 1500);
      } else {
        showNotification('error', 'Đăng ký thất bại', result.message || "Vui lòng thử lại");
      }
    } catch (error) {
      showNotification('error', 'Lỗi', 'Không thể kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Đăng ký">
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
        <TouchableOpacity onPress={() => router.replace("/auth/LoginScreen")}>
          <Text style={styles.loginText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>

      <NotificationModal
        visible={modalVisible}
        {...modalConfig}
        onClose={() => setModalVisible(false)}
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#003d9b",
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
  loginText: { color: "#003d9b", fontWeight: "bold" },
});
