import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import FloatingInput from "@/components/ui/FloatingInput";
import { checkEmailAndSendOTP, checkEmailMatchUser } from "@/services/auth/userService";
import NotificationModal from "@/components/ui/NotificationModal";

import AuthLayout from "@/components/auth/AuthLayout";

export default function MailVerifyScreen() {
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();
  const [email, setEmail] = useState("");
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

  const handleSendOTP = async () => {
    if (!email) {
      showNotification('error', 'Lỗi', 'Vui lòng nhập Email');
      return;
    }

    setLoading(true);
    let result;
    
    if (username) {
      // Xác thực tài khoản unverified
      result = await checkEmailMatchUser(username, email);
    } else {
      // Quên mật khẩu hoặc xác thực thông thường
      result = await checkEmailAndSendOTP(email);
    }
    
    setLoading(false);

    if (result.success) {
      showNotification('success', 'Thành công', result.message);
      setTimeout(() => {
        setModalVisible(false);
        router.push({
          pathname: "/auth/VerifyScreen",
          params: { from: "mailverify", email: email },
        });
      }, 1500);
    } else {
      showNotification('error', 'Lỗi', result.message);
    }
  };

  return (
    <AuthLayout title="Xác thực Email">
      <Text style={styles.subTitle}>
        {username 
          ? `Nhập đúng email bạn đã dùng để đăng ký tài khoản ${username}`
          : "Nhập email của bạn để nhận mã xác thực tài khoản"}
      </Text>

      <FloatingInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleSendOTP}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Tiếp tục</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>Quay lại</Text>
      </TouchableOpacity>

      <NotificationModal
        visible={modalVisible}
        {...modalConfig}
        onClose={() => setModalVisible(false)}
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  subTitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#003d9b",
    height: 56,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  backButton: { marginTop: 20, alignItems: "center" },
  backText: { color: "#003d9b" },
});
