import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Pressable,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FloatingInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  isPassword?: boolean;
  [key: string]: any;
}

export default function FloatingInput(props: FloatingInputProps) {
  const { label, value, onChangeText, isPassword, style, ...otherProps } = props;
  const [isFocused, setIsFocused] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;
  const inputRef = useRef<TextInput>(null);

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
    color: isFocused ? "#003d9b" : "#666",
    backgroundColor: "#fff",
    paddingHorizontal: 6,
    zIndex: 10,
    ...Platform.select({
      web: {
        outlineStyle: "none",
        userSelect: "none",
      } as any,
    }),
  };

  // Separate container-related styles from text-related styles
  const containerStyle = style ? {
    height: (style as any).height,
    width: (style as any).width,
    marginTop: (style as any).marginTop,
    marginBottom: (style as any).marginBottom,
    marginLeft: (style as any).marginLeft,
    marginRight: (style as any).marginRight,
  } : {};

  const textInputStyle = style ? { ...style } : {};
  if ((textInputStyle as any).height) delete (textInputStyle as any).height;

  return (
    <View style={styles.inputWrapper}>
      <Animated.Text pointerEvents="none" style={labelStyle}>
        {label}
      </Animated.Text>
      <Pressable
        onPress={() => inputRef.current?.focus()}
        style={[
          styles.inputContainer,
          containerStyle,
          isFocused && styles.inputFocused,
          isFocused && styles.shadowEffect,
          Platform.OS === 'web' && { outlineStyle: 'none' } as any,
        ]}
      >
        <TextInput
          ref={inputRef}
          style={[
            styles.input, 
            textInputStyle,
            otherProps.multiline && { paddingTop: 12, textAlignVertical: 'top' }
          ]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword ? hidePassword : false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#999"
          {...otherProps}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setHidePassword(!hidePassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={hidePassword ? "eye-outline" : "eye-off-outline"}
              size={22}
              color={isFocused ? "#003d9b" : "#666"}
            />
          </TouchableOpacity>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: { 
    marginBottom: 24,
    ...Platform.select({
      web: { outlineStyle: 'none' } as any
    })
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 60,
    backgroundColor: "#fff",
  },
  inputFocused: {
    borderColor: "#003d9b",
  },
  shadowEffect: {
    ...Platform.select({
      ios: {
        shadowColor: "#003d9b",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: "0 4px 12px rgba(0, 61, 155, 0.1)",
      },
    }),
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    height: "100%",
    ...Platform.select({
      web: {
        outlineStyle: "none",
        // Prevent browser autofill blue background
        WebkitBoxShadow: '0 0 0px 1000px white inset',
        WebkitTextFillColor: '#333',
      } as any,
    }),
  },
  eyeIcon: {
    padding: 8,
  },
});