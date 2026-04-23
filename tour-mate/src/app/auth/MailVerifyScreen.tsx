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
import { checkEmailAndSendOTP } from "@/services/auth/userService";

export default function MailVerifyScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert("Lỗi", "Vui lòng nhập Email");
      return;
    }

    setLoading(true);
    const result = await checkEmailAndSendOTP(email);
    setLoading(false);

    if (result.success) {
      router.push({
        pathname: "/auth/VerifyScreen",
        params: { from: "mailverify", email: email },
      });
    } else {
      Alert.alert("Lỗi", result.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Xác thực Email</Text>
      <Text style={styles.subTitle}>
        Nhập email của bạn để nhận mã xác thực tài khoản
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#007BFF",
    height: 56,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  backButton: { marginTop: 20, alignItems: "center" },
  backText: { color: "#007BFF" },
});
