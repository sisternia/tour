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
import { loginUser } from "@/services/auth/userService";
import NotificationModal from "@/components/ui/NotificationModal";
import { useAuth } from "@/context/AuthContext";

import AuthLayout from "@/components/auth/AuthLayout";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Notification Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    actionText?: string;
    onAction?: () => void;
  }>({
    type: 'info',
    title: '',
    message: ''
  });

  const showNotification = (type: any, title: string, message: string, actionText?: string, onAction?: () => void) => {
    setModalConfig({ type, title, message, actionText, onAction });
    setModalVisible(true);
  };

  const handleLogin = async () => {
    if (!username || !password) {
      showNotification('error', 'Lỗi', 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      const result = await loginUser({ username, password });

      if (result.success) {
        await login(result.data);
        showNotification('success', 'Thành công', 'Đăng nhập thành công!');
        setTimeout(() => {
          setModalVisible(false);
          router.replace("/(tabs)");
        }, 1500);
      } else {
        if (result.email) {
          // Unverified account
          showNotification(
            'warning', 
            'Chưa xác thực', 
            result.message, 
            'Xác thực ngay', 
            () => {
              setModalVisible(false);
              router.replace({
                pathname: "/auth/MailVerifyScreen",
                params: { username: username } // Chỉ truyền username, bắt nhập mail thủ công
              });
            }
          );
        } else {
          showNotification('error', 'Thất bại', result.message);
        }
      }
    } catch (error) {
      console.error("Login catch error:", error);
      showNotification('error', 'Lỗi', 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Đăng nhập">
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
        style={[styles.button, loading && { backgroundColor: "#ccc" }]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Đăng nhập</Text>
        )}
      </TouchableOpacity>

      <View style={styles.forgotContainer}>
        <TouchableOpacity onPress={() => router.replace("/auth/ForgotPassScreen")}>
          <Text style={styles.forgotText}>Quên mật khẩu?</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.registerContainer}>
        <Text>Chưa có tài khoản? </Text>
        <TouchableOpacity onPress={() => router.replace("/auth/RegisterScreen")}>
          <Text style={styles.registerText}>Đăng ký ngay</Text>
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
  forgotContainer: { alignItems: "flex-end", marginBottom: 20 },
  forgotText: { color: "#003d9b" },
  button: {
    backgroundColor: "#003d9b",
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
  registerText: { color: "#003d9b", fontWeight: "bold" },
});
