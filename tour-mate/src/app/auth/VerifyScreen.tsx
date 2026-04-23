import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { verifyOTP, resendOTP } from "@/services/auth/userService"; // Import thêm resendOTP

export default function VerifyScreen() {
  const router = useRouter();
  const { from, email } = useLocalSearchParams<{
    from: string;
    email: string;
  }>();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false); // State riêng cho việc gửi lại mã
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text.length !== 0 && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputs.current[index - 1]?.focus();
      }
    }
  };

  const handleResend = async () => {
    if (!email) return;

    setResending(true);
    try {
      const result = await resendOTP(email);
      if (result.success) {
        Alert.alert("Thông báo", result.message);
        setOtp(["", "", "", "", "", ""]); // Reset lại các ô nhập
        inputs.current[0]?.focus();
      } else {
        Alert.alert("Lỗi", result.message);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể kết nối server");
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length < 6) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ mã OTP 6 số");
      return;
    }
  
    setLoading(true);
    try {
      const purpose = from === "forgotpass" ? "reset_password" : "verify_account";
      
      const result = await verifyOTP(email!, otpString, purpose);
      
      if (result.success) {
        Alert.alert("Thành công", result.message, [
          {
            text: "OK",
            onPress: () => {
              if (from === "forgotpass") {
                router.push({ pathname: "/auth/NewPassScreen", params: { email } });
              } else {
                router.push("/auth/LoginScreen");
              }
            },
          },
        ]);
      } else {
        Alert.alert("Thất bại", result.message);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Kết nối thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Xác thực</Text>
      <Text style={styles.subTitle}>Mã xác thực đã được gửi đến: {email}</Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.otpInput}
            keyboardType="numeric"
            maxLength={1}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            value={digit}
            ref={(el) => {
              inputs.current[index] = el;
            }}
          />
        ))}
      </View>

      <View style={styles.linkRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkTextBlue}>Trở về</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResend} disabled={resending}>
          {resending ? (
            <ActivityIndicator size="small" color="#007BFF" />
          ) : (
            <Text style={styles.linkTextBlue}>Gửi lại</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleVerify}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Xác nhận</Text>
        )}
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
    marginBottom: 10,
    textAlign: "center",
  },
  subTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingHorizontal: 5,
  },
  linkTextBlue: { color: "#007BFF", fontWeight: "500" },
  button: {
    backgroundColor: "#007BFF",
    height: 56,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
