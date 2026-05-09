import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: windowWidth } = Dimensions.get("window");

const MOBILE_NAV_ITEMS = [
  { name: "Trang chủ", icon: "home", route: "/home/HomeScreen" },
  { name: "Tour", icon: "airplane", route: "/tour/TourScreen" },
  { name: "Lịch sử", icon: "time", route: "/history/HistoryBookScreen" },
  {
    name: "Thông báo",
    icon: "notifications",
    route: "/notification/NotificationsScreen",
  },
  { name: "Cá nhân", icon: "person", route: "/profile/ProfileScreen" },
];

const GUIDE_NAV_ITEMS = [
  { name: "Trang chủ", icon: "home", route: "/guide/GuideHomeScreen" },
  { name: "Tour", icon: "airplane", route: "/guide/ManageTourScreen" },
  {
    name: "Thông báo",
    icon: "notifications",
    route: "/notification/NotificationsScreen",
  },
  { name: "Cá nhân", icon: "person", route: "/profile/ProfileScreen" },
];

const WEB_NAV_ITEMS = [
  { name: "Trang chủ", route: "/home/HomeScreen" },
  { name: "Tour", route: "/tour/TourScreen" },
  { name: "Tin tức", route: "/news/NewsScreen" },
  { name: "Liên hệ", route: "/contact/ContactScreen" },
];

export default function NavigationBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web" && width > 768;

  const { isLoggedIn, logout, user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    if (Platform.OS === "web") {
      router.replace("/home/HomeScreen");
    } else {
      router.replace("/auth/LoginScreen");
    }
  };

  const renderMobileNav = () => (
    <View style={[styles.mobileWrapper, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.mobileNavBar}>
        {(user?.role === 'guide' ? GUIDE_NAV_ITEMS : MOBILE_NAV_ITEMS)
          .map((item, index) => {
            let isActive = pathname === item.route;
            
            // Đặc biệt cho vai trò Hướng dẫn viên (Guide)
            if (user?.role === 'guide' && item.name === 'Tour') {
              if (pathname === '/guide/ManageTourScreen' || pathname === '/guide/ManageCustomerScreen') {
                isActive = true;
              }
            }
            
            return (
              <TouchableOpacity
                key={index}
                style={styles.navItem}
                onPress={() => router.replace(item.route as any)}>
                <Ionicons
                  name={(isActive ? item.icon : `${item.icon}-outline`) as any}
                  size={24}
                  color={isActive ? "#003d9b" : "#666"}
                />
                <Text style={[styles.navText, isActive && styles.navTextActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
      </View>
    </View>
  );

  const renderWebNav = () => (
    <View style={styles.webWrapper}>
      <View style={styles.webNavBar}>
        <View style={styles.webNavContent}>
          {/* Left: Brand & Menu */}
          <View style={styles.webLeft}>
            <TouchableOpacity onPress={() => router.push("/home/HomeScreen")}>
              <Text style={styles.brandText}>Tour Mate</Text>
            </TouchableOpacity>
            <View style={styles.webMenu}>
              {(user?.role === 'guide' ? GUIDE_NAV_ITEMS : WEB_NAV_ITEMS).map((item, index) => {
                let isActive = false;
                if (user?.role === 'guide') {
                  if (item.name === 'Tour' && (pathname === '/guide/ManageTourScreen' || pathname === '/guide/ManageCustomerScreen')) {
                    isActive = true;
                  } else {
                    isActive = pathname === item.route;
                  }
                } else {
                  const itemSegment = item.route.split("/")[1];
                  const pathSegment = pathname.split("/")[1];
                  isActive = itemSegment === pathSegment;
                }
                
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => router.push(item.route as any)}
                    style={styles.menuItem}>
                    <Text
                      style={[
                        styles.menuText,
                        isActive && styles.menuTextActive,
                      ]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Right: Actions */}
          <View style={styles.webRight}>
            {isLoggedIn ? (
              <View style={styles.webActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() =>
                    router.push("/notification/NotificationsScreen")
                  }>
                  <Ionicons
                    name="notifications-outline"
                    size={24}
                    color="#333"
                  />
                </TouchableOpacity>

                <View style={styles.profileContainer}>
                  <TouchableOpacity
                    style={styles.profileBtn}
                    onPress={() => setShowDropdown(!showDropdown)}>
                    <View style={styles.avatarCircle}>
                      <Ionicons name="person" size={20} color="#fff" />
                    </View>
                  </TouchableOpacity>

                  {showDropdown && (
                    <View style={styles.dropdown}>
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => {
                          setShowDropdown(false);
                          router.push("/profile/ProfileScreen");
                        }}>
                        <Ionicons
                          name="settings-outline"
                          size={18}
                          color="#333"
                        />
                        <Text style={styles.dropdownText}>Tài khoản</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={handleLogout}>
                        <Ionicons
                          name="log-out-outline"
                          size={18}
                          color="#ba1a1a"
                        />
                        <Text
                          style={[styles.dropdownText, { color: "#ba1a1a" }]}>
                          Đăng xuất
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.authButtons}>
                <TouchableOpacity
                  style={styles.loginBtn}
                  onPress={() => router.push("/auth/LoginScreen")}>
                  <Text style={styles.loginBtnText}>Đăng nhập</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.registerBtn}
                  onPress={() => router.push("/auth/RegisterScreen")}>
                  <Text style={styles.registerBtnText}>Đăng ký</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  return <>{isWeb ? renderWebNav() : renderMobileNav()}</>;
}

const styles = StyleSheet.create({
  mobileWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  mobileNavBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  navText: {
    fontSize: 10,
    marginTop: 4,
    color: "#666",
  },
  navTextActive: {
    color: "#003d9b",
    fontWeight: "bold",
  },
  // Web Styles
  webWrapper: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    // @ts-ignore
    position: Platform.OS === "web" ? "fixed" : "relative",
    top: 0,
    zIndex: 1000,
  },
  webNavBar: {
    maxWidth: 1280,
    width: "100%",
    height: 72,
    alignSelf: "center",
    justifyContent: "center",
  },
  webNavContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  webLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#005bb2",
    marginRight: 40,
    letterSpacing: -0.5,
  },
  webMenu: {
    flexDirection: "row",
    gap: 30,
  },
  menuItem: {
    paddingVertical: 10,
  },
  menuText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#414753",
  },
  menuTextActive: {
    color: "#005bb2",
    fontWeight: "700",
  },
  webRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  webActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#f6f3f2",
  },
  profileContainer: {
    position: "relative",
  },
  profileBtn: {
    padding: 2,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#005bb2",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  dropdown: {
    position: "absolute",
    top: 50,
    right: 0,
    width: 180,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
    borderRadius: 8,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1c1b1b",
  },
  authButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  loginBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  loginBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#005bb2",
  },
  registerBtn: {
    backgroundColor: "#005bb2",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  registerBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});
