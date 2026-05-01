import React from "react";
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Platform,
  ScrollView,
  Image,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

import Svg, { Path } from "react-native-svg";

export default function AuthLayout({ children, title }: AuthLayoutProps) {
  const { width, height: windowHeight } = useWindowDimensions();
  const router = useRouter();
  const isWeb = Platform.OS === "web" && width > 768;

  const SocialLogin = () => (
    <View style={styles.socialContainer as any}>
      <View style={styles.socialDividerContainer}>
        <View style={styles.socialLine} />
        <Text style={styles.socialText}>Hoặc tiếp tục với</Text>
        <View style={styles.socialLine} />
      </View>
      <View style={styles.socialButtons}>
        <TouchableOpacity style={styles.socialButton}>
          <View style={styles.socialIconWrapper}>
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <Path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <Path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <Path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </Svg>
          </View>
          <Text style={styles.socialButtonText}> Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <View style={styles.socialIconWrapper}>
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Path
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                fill="#1877F2"
              />
            </Svg>
          </View>
          <Text style={styles.socialButtonText}> Facebook</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isWeb) {
    const showBranding = width > 1000;
    return (
      <View style={styles.webOverlay as any}>
        <View style={[styles.webModal as any, !showBranding && { maxWidth: 500, height: 'auto', minHeight: 600 }]}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.webCloseBtn as any}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>

          <View style={styles.webModalContent as any}>
            {/* Left Side: Branding (Hidden on smaller web screens) */}
            {showBranding && (
              <View style={styles.leftSide as any}>
                <Image
                  source={require("@/assets/images/auth-bg.png")}
                  style={styles.backgroundImage as any}
                />
                <View style={styles.overlay as any} />

                <View style={styles.brandContainer as any}>
                  <View style={styles.logoBadge as any}>
                    <Text style={styles.brandLogo as any}>✈️</Text>
                  </View>
                  <Text style={styles.appName as any}>Tour Mate</Text>
                  <View style={styles.divider as any} />
                  <Text style={styles.brandSlogan as any}>Connect your journey.</Text>
                </View>
              </View>
            )}

            {/* Right Side: Form */}
            <View style={[styles.rightSide as any, !showBranding && { flex: 1 }]}>
              <ScrollView contentContainerStyle={styles.formScroll as any} showsVerticalScrollIndicator={false}>
                <View style={styles.formWrapper as any}>
                  <Text style={styles.title as any}>{title}</Text>
                  {children}
                  <SocialLogin />
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.mobileContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.mobileHeader}>
          <Text style={styles.mobileAppName}>Tour Mate</Text>
          <Text style={styles.mobileTitle}>{title}</Text>
        </View>
        {children}
        <SocialLogin />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  webOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    ...Platform.select({
      web: {
        height: "100vh",
        // @ts-ignore
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      } as any,
      default: { height: "100%" } as any,
    }),
  },
  webModal: {
    width: "90%",
    maxWidth: 1100,
    height: 750, // Fixed height for consistency
    maxHeight: "90%",
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 15,
  },
  webCloseBtn: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 100,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    padding: 5,
  },
  webModalContent: {
    flex: 1,
    flexDirection: "row",
  },
  leftSide: {
    flex: 1,
    backgroundColor: "#003d9b",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    padding: 40,
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 61, 155, 0.75)",
  },
  rightSide: {
    flex: 1,
    backgroundColor: "#fff",
  },
  brandContainer: {
    alignItems: "center",
    zIndex: 10,
    maxWidth: 500,
  },
  logoBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  brandLogo: {
    fontSize: 60,
  },
  appName: {
    fontSize: 56,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    letterSpacing: 1,
  },
  divider: {
    width: 60,
    height: 4,
    backgroundColor: "#ffcc00",
    borderRadius: 2,
    marginBottom: 20,
  },
  brandSlogan: {
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    marginBottom: 15,
  },
  brandDescription: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 24,
  },
  footerBranding: {
    position: "absolute",
    bottom: 40,
    zIndex: 10,
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 14,
  },
  formScroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 30,
    paddingHorizontal: 50,
  },
  formWrapper: {
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#1a1a1a",
  },
  decorationCircle1: {
    position: "absolute",
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: "rgba(0, 86, 210, 0.4)",
    top: -150,
    left: -150,
  },
  decorationCircle2: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: "rgba(0, 123, 255, 0.2)",
    bottom: -100,
    right: -100,
  },
  decorationCircle3: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    top: "20%",
    right: "-10%",
  },
  mobileContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "flex-start",
    backgroundColor: "#fff",
    paddingTop: 60,
  },
  mobileHeader: {
    marginBottom: 40,
  },
  mobileAppName: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    color: "#003d9b",
    marginBottom: 10,
  },
  mobileTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: "#333",
  },
  socialContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  socialDividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  socialLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  socialText: {
    marginHorizontal: 10,
    color: "#999",
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  socialButton: {
    flex: 0.48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  socialIconWrapper: {
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});
