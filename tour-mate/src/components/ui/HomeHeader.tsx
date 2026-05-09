import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HomeHeaderProps {
  welcomeText: string;
  title: string;
  showChat?: boolean;
  children?: React.ReactNode;
}

export default function HomeHeader({ 
  welcomeText, 
  title, 
  showChat = true, 
  children 
}: HomeHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.header}>
      <Image
        source={{
          uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDEOPe24hlP-rPCedHni68ajIr6kSEnlt3I8--QLSfbjSjS46j84RtiiLzdBeI1srNCAPvXagcMYEgMuWKHGr785ff8hbrxzutKAynABBFHgQFKubE7rMnM_C8mXnM4y6D64P9HXLhSFJoE3eyneP0pRB-m7XTQyaLOtN9oLHsE3zGp034otB1mV3LqLfqBA7shza20LtCmZNX4QZvyrvjuUmfwPqZkOijtvccx8OHP2eVsuw_bfxJgVtDCz5yZyHqNTlgTXnTb7M0",
        }}
        style={styles.headerImage}
      />
      <View style={styles.headerOverlay} />

      <View style={[styles.headerContentWrapper, { paddingTop: Math.max(insets.top, 20) }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>{welcomeText}</Text>
            <Text style={styles.headerTitle}>{title}</Text>
          </View>
          {showChat && (
            <TouchableOpacity 
              style={styles.notificationBtn}
              onPress={() => router.push('/chat/ChatScreen')}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 250,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    overflow: "hidden",
    position: "relative",
  },
  headerImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  headerOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 61, 155, 0.6)",
  },
  headerContentWrapper: {
    padding: 24,
    flex: 1,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: { color: "rgba(255,255,255,0.8)", fontSize: 15 },
  headerTitle: { color: "white", fontSize: 26, fontWeight: "bold" },
  notificationBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 10,
    borderRadius: 15,
  },
});
