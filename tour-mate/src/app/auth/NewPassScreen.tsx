import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { resetPassword } from "@/services/auth/userService";

import FloatingInput from "@/components/ui/FloatingInput";

import AuthLayout from "@/components/auth/AuthLayout";

export default function NewPassScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!password || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ mật khẩu");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(email!, password);

      if (result.success) {
        Alert.alert("Thành công", "Mật khẩu của bạn đã được cập nhật!", [
          {
            text: "Đăng nhập",
            onPress: () => router.replace("/auth/LoginScreen"),
          },
        ]);
      } else {
        Alert.alert("Thất bại", result.message);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể kết nối đến server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Thiết lập mật khẩu mới">
      <Text style={styles.subTitle}>
        Vui lòng nhập mật khẩu mới cho tài khoản: {email}
      </Text>

      <FloatingInput
        label="Mật khẩu mới"
        value={password}
        onChangeText={setPassword}
        isPassword
      />

      <FloatingInput
        label="Xác nhận mật khẩu mới"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        isPassword
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleConfirm}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Xác nhận thay đổi</Text>
        )}
      </TouchableOpacity>

      <View style={styles.backContainer}>
        <TouchableOpacity onPress={() => router.back()} disabled={loading}>
          <Text style={styles.backText}>Trở về</Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  subTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 30,
  },
  backContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  backText: {
    color: "#003d9b",
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#003d9b",
    height: 56,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
