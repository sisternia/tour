import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  RefreshControl,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInRight, Layout } from "react-native-reanimated";
import NavigationBar from "@/components/ui/NavigationBar";
import { useAuth } from "@/context/AuthContext";
import { getNotifications, markAsRead, markAllAsRead } from "@/services/notification/notificationService";

const CATEGORIES = ["Tất cả", "Đơn hàng", "Hệ thống"];

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const lastUpdateRef = useRef<string>("");

  const fetchNotifications = async (showLoading = false) => {
    if (!user?._id) return;
    if (showLoading) setLoading(true);
    
    try {
      const res = await getNotifications(user._id);
      if (res.success) {
        let fetchedData = res.data;
        const newDataStr = JSON.stringify(fetchedData);
        if (newDataStr !== lastUpdateRef.current) {
          setNotifications(fetchedData);
          lastUpdateRef.current = newDataStr;
        }
      }
    } catch (error) {
      console.error("Fetch notifications error:", error);
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications(true);

    // Real-time polling every 3 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 3000);

    return () => clearInterval(interval);
  }, [user?._id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, [user?._id]);

  const handleMarkRead = async (id: string) => {
    try {
      const res = await markAsRead(id);
      if (res.success) {
        setNotifications(prev => 
          prev.map(n => n._id === id ? { ...n, is_read: true } : n)
        );
        lastUpdateRef.current = ""; // Force update on next poll
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

  const getIconConfig = (type: string) => {
    switch (type) {
      case "booking_created":
      case "booking_created_custom":
        return { name: "cart", color: "#4facfe", bgColor: "#E3F2FD" };
      case "booking_paid":
      case "booking_paid_custom":
        return { name: "wallet", color: "#27ae60", bgColor: "#E8F5E9" };
      case "booking_confirmed":
      case "booking_confirmed_custom":
        return { name: "checkmark-circle", color: "#f39c12", bgColor: "#FEF9E7" };
      case "booking_cancelled":
      case "booking_cancelled_custom":
        return { name: "close-circle", color: "#e74c3c", bgColor: "#FDEDEC" };
      default:
        return { name: "notifications", color: "#9b51e0", bgColor: "#F3E5F5" };
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}p`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)} ngày`;
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeCategory === 0) return true;
    if (activeCategory === 1) return n.type.startsWith("booking_");
    if (activeCategory === 2) return n.type === "system";
    return true;
  });

  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web" && width > 768;

  const renderItem = (item: any, index: number) => {
    const iconConfig = getIconConfig(item.type);
    return (
      <Animated.View 
        key={item._id} 
        entering={FadeInRight.delay(index * 50).springify()}
        layout={Layout.springify()}
      >
        <TouchableOpacity 
          style={[
            styles.notificationCard, 
            !item.is_read && styles.unreadCard,
            isWeb && styles.notificationCardWeb
          ]}
          onPress={() => !item.is_read && handleMarkRead(item._id)}
        >
          <View style={[styles.iconCircle, { backgroundColor: iconConfig.bgColor }, isWeb && styles.iconCircleWeb]}>
            <Ionicons name={iconConfig.name as any} size={isWeb ? 28 : 24} color={iconConfig.color} />
          </View>
          <View style={styles.textContainer}>
            <View style={styles.rowBetween}>
              <Text style={[styles.notifTitle, !item.is_read && styles.unreadTitle, isWeb && styles.notifTitleWeb]}>
                {item.title}
              </Text>
              <View style={styles.row}>
                <Text style={styles.timeText}>{getTimeAgo(item.createdAt)}</Text>
                {!item.is_read && <View style={styles.unreadDot} />}
              </View>
            </View>
            <Text style={[styles.notifDesc, !item.is_read && styles.unreadDesc, isWeb && styles.notifDescWeb]} numberOfLines={3}>
              {item.message}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <SafeAreaView style={[styles.safeArea, isWeb && styles.safeAreaWeb]}>
        <View style={[styles.header, isWeb && styles.headerWeb]}>
          <View style={[styles.headerTop, isWeb && styles.headerTopWeb]}>
            <Text style={[styles.headerTitle, isWeb && styles.headerTitleWeb]}>Thông báo</Text>
            <TouchableOpacity onPress={handleMarkAllRead}>
              <Text style={styles.markReadText}>Đọc tất cả</Text>
            </TouchableOpacity>
          </View>

          {/* Categories Tabs */}
          <View style={[styles.categoryContainer, isWeb && styles.categoryContainerWeb]}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.categoryContent, isWeb && styles.categoryContentWeb]}
            >
                {CATEGORIES.map((cat, i) => (
                <TouchableOpacity
                    key={i}
                    onPress={() => setActiveCategory(i)}
                    style={[styles.categoryBtn, activeCategory === i && styles.categoryBtnActive, isWeb && styles.categoryBtnWeb]}
                >
                    <Text style={[styles.categoryText, activeCategory === i && styles.categoryTextActive]}>
                    {cat}
                    </Text>
                </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#007BFF" />
          </View>
        ) : (
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            style={[styles.content, isWeb && styles.contentWeb]}
            contentContainerStyle={isWeb && { alignItems: 'center', width: '100%' }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View style={isWeb ? styles.webListContainer : { width: '100%' }}>
                {filteredNotifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="notifications-off-outline" size={80} color="#DDD" />
                    <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
                </View>
                ) : (
                filteredNotifications.map((item, index) => renderItem(item, index))
                )}
            </View>
            
            <View style={{ height: 100 }} />
          </ScrollView>
        )}
      </SafeAreaView>
      
      <NavigationBar />
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingBottom: 20,
    paddingTop: Platform.OS === "android" ? 40 : 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: "black" 
  },
  markReadText: { 
    color: "#007BFF", 
    fontSize: 14, 
    fontWeight: "600",
  },
  categoryContainer: {
    marginTop: 0,
  },
  categoryContent: {
    paddingHorizontal: 20,
  },
  categoryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: "#e4e6eb",
    marginRight: 10,
  },
  categoryBtnActive: { 
    backgroundColor: "#007BFF" 
  },
  categoryText: { 
    color: "black", 
    fontWeight: "600",
    fontSize: 14 
  },
  categoryTextActive: { 
    color: "white" 
  },
  content: { 
    flex: 1,
    paddingHorizontal: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 15,
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  unreadCard: {
    backgroundColor: "#EDF5FF",
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: { 
    flex: 1, 
    marginLeft: 15 
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  row: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  notifTitle: { 
    fontSize: 16, 
    color: "#333",
    flexShrink: 1,
    fontWeight: "500",
  },
  unreadTitle: {
    fontWeight: "bold",
    color: "#000",
  },
  notifDesc: { 
    fontSize: 14, 
    color: "#666", 
    lineHeight: 20 
  },
  unreadDesc: {
    color: "#333",
    fontWeight: "500",
  },
  timeText: { 
    fontSize: 12, 
    color: "#999" 
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007BFF",
    marginLeft: 8,
  },
  // Web Styles
  safeAreaWeb: {
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
  },
  headerWeb: {
    width: '100%',
    maxWidth: 900,
    backgroundColor: 'white',
    marginTop: 80,
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTopWeb: {
    paddingHorizontal: 30,
  },
  headerTitleWeb: {
    fontSize: 32,
  },
  categoryContainerWeb: {
    marginTop: 10,
  },
  categoryContentWeb: {
    paddingHorizontal: 30,
  },
  categoryBtnWeb: {
    backgroundColor: '#F2F2F2',
  },
  contentWeb: {
    width: '100%',
    maxWidth: 900,
    marginTop: 16,
  },
  webListContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationCardWeb: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
    borderRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
    marginBottom: 0,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  iconCircleWeb: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  notifTitleWeb: {
    fontSize: 18,
  },
  notifDescWeb: {
    fontSize: 15,
  },
});