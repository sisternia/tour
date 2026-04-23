import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";

const { width } = Dimensions.get("window");

const NAV_ITEMS = [
  { name: "Trang chủ", icon: "home", route: "/home/HomeScreen" },
  { name: "Tour", icon: "airplane", route: "/tour/TourScreen" },
  { name: "Lịch sử", icon: "time", route: "/(tabs)/history" },
  { name: "Thông báo", icon: "notifications", route: "/notification/NotificationsScreen" },
  { name: "Cá nhân", icon: "person", route: "/profile/ProfileScreen" },
];

export default function NavigationBar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.safeAreaContainer}>
      <View style={styles.navBar}>
        {NAV_ITEMS.map((item, index) => {
          // Kiểm tra active chính xác hơn cho các route tab
          const isActive = pathname === item.route || (item.route === "/(tabs)/" && pathname === "/");

          return (
            <TouchableOpacity
              key={index}
              style={styles.navItem}
              onPress={() => router.replace(item.route as any)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={(isActive ? item.icon : `${item.icon}-outline`) as any}
                size={24}
                color={isActive ? "#007BFF" : "#8E8E93"}
              />
              <Text style={[styles.navText, isActive && styles.activeText]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    position: "absolute",
    bottom: 0,
    backgroundColor: "white",
    width: width,
    paddingBottom: Platform.OS === "ios" ? 35 : 15,
    borderTopWidth: 0.5,
    borderTopColor: "#E5E5E5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 10,
  },
  navBar: {
    flexDirection: "row",
    height: 60,
    backgroundColor: "white",
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: { alignItems: "center", justifyContent: "center", flex: 1 },
  navText: { fontSize: 10, marginTop: 4, color: "#8E8E93" },
  activeText: { color: "#007BFF", fontWeight: "bold" },
});