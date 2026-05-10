import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useAuth } from "@/context/AuthContext";
import { getNotifications, markAsRead, markAllAsRead } from "@/services/notification/notificationService";
import { router } from "expo-router";

export default function NotificationsLayout() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web" && width > 1024;
  const { user } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0: All, 1: Unread
  const lastUpdateRef = useRef<string>("");
  const dropdownRef = useRef<View>(null);

  const fetchNotifications = useCallback(async (showLoading = false) => {
    if (!user?._id) return;
    if (showLoading) setLoading(true);
    
    try {
      const res = await getNotifications(user._id);
      if (res.success) {
        const newDataStr = JSON.stringify(res.data);
        if (newDataStr !== lastUpdateRef.current) {
          setNotifications(res.data);
          lastUpdateRef.current = newDataStr;
        }
      }
    } catch (error) {
      console.error("Fetch notifications error:", error);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications(notifications.length === 0);
    }
  }, [isOpen, fetchNotifications]);

  // Real-time polling
  useEffect(() => {
    if (!user?._id) return;
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);
    return () => clearInterval(interval);
  }, [user?._id, fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    try {
      const res = await markAsRead(id);
      if (res.success) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, is_read: true } : n));
        lastUpdateRef.current = "";
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user?._id) return;
    try {
      const res = await markAllAsRead(user._id);
      if (res.success) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        lastUpdateRef.current = "";
      }
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 1) return !n.is_read;
    return true;
  });

  const getIconConfig = (type: string) => {
    switch (type) {
      case "booking_created": return { name: "cart", color: "#1877F2", bgColor: "#E7F3FF" };
      case "booking_paid": return { name: "wallet", color: "#27ae60", bgColor: "#E8F5E9" };
      case "booking_confirmed": return { name: "checkmark-circle", color: "#f39c12", bgColor: "#FEF9E7" };
      case "booking_cancelled": return { name: "close-circle", color: "#e74c3c", bgColor: "#FDEDEC" };
      default: return { name: "notifications", color: "#9b51e0", bgColor: "#F3E5F5" };
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ`;
    return `${Math.floor(diffInSeconds / 86400)} ngày`;
  };

  if (!isWeb) return null;

  return (
    <View style={styles.container}>
      {/* Trigger Bell Button */}
      <TouchableOpacity 
        onPress={() => setIsOpen(!isOpen)}
        style={[styles.bellBtn, isOpen && styles.bellBtnActive]}
      >
        <Ionicons name={isOpen ? "notifications" : "notifications-outline"} size={24} color={isOpen ? "#1877F2" : "#65676B"} />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <Pressable style={styles.overlay} onPress={() => setIsOpen(false)} />
          <Animated.View 
            entering={FadeInUp.duration(200)} 
            exiting={FadeOutUp.duration(150)}
            style={styles.dropdown}
          >
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Thông báo</Text>
              <TouchableOpacity>
                <Ionicons name="ellipsis-horizontal" size={20} color="#65676B" />
              </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
              <TouchableOpacity 
                onPress={() => setActiveTab(0)}
                style={[styles.tab, activeTab === 0 && styles.tabActive]}
              >
                <Text style={[styles.tabText, activeTab === 0 && styles.tabTextActive]}>Tất cả</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setActiveTab(1)}
                style={[styles.tab, activeTab === 1 && styles.tabActive]}
              >
                <Text style={[styles.tabText, activeTab === 1 && styles.tabTextActive]}>Chưa đọc</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Mới nhất</Text>
                <TouchableOpacity onPress={handleMarkAllRead}>
                  <Text style={styles.seeAllText}>Đánh dấu đã đọc</Text>
                </TouchableOpacity>
              </View>

              {loading ? (
                <ActivityIndicator style={{ marginVertical: 20 }} color="#1877F2" />
              ) : filteredNotifications.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>Không có thông báo mới</Text>
                </View>
              ) : (
                filteredNotifications.map((item) => {
                  const iconConfig = getIconConfig(item.type);
                  return (
                    <Pressable 
                      key={item._id} 
                      onPress={() => {
                        handleMarkRead(item._id);
                        if (item.related_id) {
                            // Logic to navigate or show details
                        }
                      }}
                      style={({ hovered }: { hovered: boolean }) => [
                        styles.item,
                        hovered && styles.itemHovered
                      ]}
                    >
                      <View style={[styles.iconCircle, { backgroundColor: iconConfig.bgColor }]}>
                        <Ionicons name={iconConfig.name as any} size={24} color={iconConfig.color} />
                      </View>
                      <View style={styles.itemContent}>
                        <Text style={[styles.itemText, !item.is_read && styles.itemTextUnread]} numberOfLines={3}>
                          <Text style={styles.itemTitle}>{item.title}: </Text>
                          {item.message}
                        </Text>
                        <Text style={[styles.itemTime, !item.is_read && styles.itemTimeUnread]}>{getTimeAgo(item.createdAt)}</Text>
                      </View>
                      {!item.is_read && <View style={styles.unreadDot} />}
                    </Pressable>
                  )
                })
              )}
              
              <TouchableOpacity 
                style={styles.footer}
                onPress={() => {
                  setIsOpen(false);
                  router.push("/notification/NotificationsScreen");
                }}
              >
                <Text style={styles.footerText}>Xem tất cả thông báo</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 1000,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E4E6EB",
    justifyContent: "center",
    alignItems: "center",
  },
  bellBtnActive: {
    backgroundColor: "#E7F3FF",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#E41E3F",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  dropdown: {
    position: "absolute",
    top: 50,
    right: 0,
    width: 360,
    maxHeight: 600,
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#050505",
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tabActive: {
    backgroundColor: "#E7F3FF",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#65676B",
  },
  tabTextActive: {
    color: "#1877F2",
  },
  list: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#050505",
  },
  seeAllText: {
    fontSize: 13,
    color: "#1877F2",
    fontWeight: "500",
  },
  item: {
    flexDirection: "row",
    padding: 8,
    marginHorizontal: 8,
    borderRadius: 8,
    alignItems: "center",
    gap: 12,
  },
  itemHovered: {
    backgroundColor: "#F2F2F2",
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    fontSize: 14,
    color: "#65676B",
    lineHeight: 18,
  },
  itemTextUnread: {
    color: "#050505",
    fontWeight: "500",
  },
  itemTitle: {
    fontWeight: "700",
    color: "#050505",
  },
  itemTime: {
    fontSize: 12,
    color: "#65676B",
    marginTop: 4,
  },
  itemTimeUnread: {
    color: "#1877F2",
    fontWeight: "600",
  },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#1877F2",
  },
  empty: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#65676B",
    fontSize: 14,
  },
  footer: {
    padding: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F0F2F5",
  },
  footerText: {
    color: "#1877F2",
    fontSize: 15,
    fontWeight: "600",
  },
});
