import React, { useState, useEffect, useRef } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FloatingInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  isPassword?: boolean;
  [key: string]: any;
}

export default function FloatingInput({
  label,
  value,
  onChangeText,
  isPassword,
  ...props
}: FloatingInputProps) {
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
      <View style={[styles.inputContainer, isFocused && styles.inputFocused]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword ? hidePassword : false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
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

const styles = StyleSheet.create({
  inputWrapper: { marginBottom: 20 },
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
  inputFocused: { borderColor: "#007BFF" },
  input: { flex: 1, fontSize: 16 },
});