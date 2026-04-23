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

export default function ForgotPassScreen() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (activeTab === "email") {
      if (!email) {
        Alert.alert("Lỗi", "Vui lòng nhập email");
        return;
      }
      setLoading(true);
      const result = await checkEmailAndSendOTP(email);
      setLoading(false);

      if (result.success) {
        router.push({
          pathname: "/auth/VerifyScreen",
          params: { from: "forgotpass", email: email },
        });
      } else {
        Alert.alert("Lỗi", result.message);
      }
    } else {
      Alert.alert("Thông báo", "Tính năng qua số điện thoại đang phát triển");
    }
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Quên mật khẩu</Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "phone" && styles.activeTab]}
          onPress={() => setActiveTab("phone")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "phone" && styles.activeTabText,
            ]}
          >
            Số điện thoại
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "email" && styles.activeTab]}
          onPress={() => setActiveTab("email")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "email" && styles.activeTabText,
            ]}
          >
            Email
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "phone" ? (
        <FloatingInput
          label="Số điện thoại"
          value={phone}
          onChangeText={setPhone}
          keyboardType="numeric"
        />
      ) : (
        <FloatingInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleNext}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Xác nhận</Text>
        )}
      </TouchableOpacity>

      {/* Back button */}
      <TouchableOpacity
        style={styles.backContainer}
        onPress={() => router.push("/auth/LoginScreen")}
      >
        <Text style={styles.backText}>Trở về</Text>
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
    fontWeight: "600",
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderColor: "#007BFF",
  },
  tabText: {
    color: "#666",
  },
  activeTabText: {
    color: "#007BFF",
    fontWeight: "bold",
  },
  backContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  backText: {
    color: "#007BFF",
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#007BFF",
    height: 56,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
