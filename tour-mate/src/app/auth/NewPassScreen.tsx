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

function FloatingInput({ label, value, onChangeText, isPassword }: any) {
  const [isFocused, setIsFocused] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);

  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused || value ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    position: "absolute" as const,
    left: 12,
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -10],
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: isFocused ? "#007BFF" : "#666",
    backgroundColor: "#fff",
    paddingHorizontal: 6,
    zIndex: 10,
  };

  return (
    <View style={styles.inputWrapper}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword ? hidePassword : false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
            <Ionicons
              name={hidePassword ? "eye" : "eye-off"}
              size={22}
              color="#666"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

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
    <View style={styles.container}>
      <Text style={styles.title}>Thiết lập mật khẩu mới</Text>
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
    marginBottom: 8,
    textAlign: "left",
  },
  subTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 30,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 56,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  backContainer: {
    flexDirection: "row",
    justifyContent: "center",
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
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
