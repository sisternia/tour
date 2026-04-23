import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NavigationBar from "@/components/ui/NavigationBar";

const CATEGORIES = ["Tất cả", "Bookings", "Promos", "Account"];

const NOTIFICATIONS = {
  today: [
    {
      id: 1,
      title: "Flight to Bali delayed",
      desc: "Attention: Flight GA890 is delayed by 30 mins due to weather conditions.",
      time: "2m",
      icon: "airplane",
      iconColor: "#FF7E5F",
      bgColor: "#FFF0ED",
      unread: true,
    },
    {
      id: 2,
      title: "Booking Confirmed",
      desc: "Great news! Your 'Paris Night Tour' is confirmed and ready for you.",
      time: "2h",
      icon: "ticket",
      iconColor: "#27ae60",
      bgColor: "#E8F5E9",
      unread: true,
    },
  ],
  yesterday: [
    {
      id: 3,
      title: "20% Off Japan Trips",
      desc: "Limited time offer for your next adventure to Tokyo and Kyoto. 🇯🇵",
      time: "1d",
      icon: "pricetag",
      iconColor: "#9b51e0",
      bgColor: "#F3E5F5",
      unread: false,
    },
    {
      id: 4,
      title: "Password changed",
      desc: "Your account password was successfully updated.",
      time: "1d",
      icon: "refresh",
      iconColor: "#4facfe",
      bgColor: "#E3F2FD",
      unread: false,
    },
  ],
};

export default function NotificationsScreen() {
  const renderItem = (item: any) => (
    <TouchableOpacity key={item.id} style={styles.notificationCard}>
      <View style={[styles.iconCircle, { backgroundColor: item.bgColor }]}>
        <Ionicons name={item.icon as any} size={22} color={item.iconColor} />
      </View>
      <View style={styles.textContainer}>
        <View style={styles.rowBetween}>
          <Text style={[styles.notifTitle, item.unread && styles.unreadTitle]}>
            {item.title}
          </Text>
          <View style={styles.row}>
            <Text style={styles.timeText}>{item.time}</Text>
            {item.unread && <View style={styles.unreadDot} />}
          </View>
        </View>
        <Text style={styles.notifDesc} numberOfLines={2}>
          {item.desc}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Thông báo</Text>
            <TouchableOpacity>
              <Text style={styles.markReadText}>Đánh dấu đã đọc</Text>
            </TouchableOpacity>
          </View>

          {/* Categories Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContent}
          >
            {CATEGORIES.map((cat, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.categoryBtn, i === 0 && styles.categoryBtnActive]}
              >
                <Text style={[styles.categoryText, i === 0 && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
          <Text style={styles.sectionTitle}>Mới nhất</Text>
          {NOTIFICATIONS.today.map(renderItem)}

          <Text style={styles.sectionTitle}>Trước đó</Text>
          {NOTIFICATIONS.yesterday.map(renderItem)}
          
          {/* Khoảng trống để không bị NavigationBar che mất nội dung cuối */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
      
      {/* NavigationBar luôn ở dưới cùng */}
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
    color: "black", 
    fontSize: 14, 
    fontWeight: "500",
    opacity: 0.9 
  },
  categoryContent: {
    paddingHorizontal: 20,
  },
  categoryBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#e4e6eb",
    marginRight: 10,
  },
  categoryBtnActive: { 
    backgroundColor: "#e7f3ff" 
  },
  categoryText: { 
    color: "black", 
    fontWeight: "600",
    fontSize: 14 
  },
  categoryTextActive: { 
    color: "#007BFF" 
  },
  content: { 
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 15,
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
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: { 
    flex: 1, 
    marginLeft: 12 
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  row: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  notifTitle: { 
    fontSize: 15, 
    color: "#333",
    flexShrink: 1,
  },
  unreadTitle: {
    fontWeight: "bold",
  },
  notifDesc: { 
    fontSize: 13, 
    color: "#666", 
    marginTop: 2, 
    lineHeight: 18 
  },
  timeText: { 
    fontSize: 12, 
    color: "#999" 
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007BFF",
    marginLeft: 8,
  },
});