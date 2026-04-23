import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import NavigationBar from "@/components/ui/NavigationBar";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(
    null
  );
  const [address, setAddress] = useState("Đang xác định...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setAddress("Quyền bị từ chối");
        setLoading(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      let geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocode.length > 0) {
        const place = geocode[0];
        setAddress(`${place.subregion || place.city || "Vị trí của bạn"}`);
      }
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        );
        const data = await response.json();
        setWeather({
          temp: Math.round(data.current_weather.temperature),
          code: data.current_weather.weathercode,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getWeatherDesc = (code: number) => {
    if (code === 0) return "Trời quang";
    if (code <= 3) return "Nhiều mây";
    if (code >= 51 && code <= 67) return "Đang có mưa";
    return "Thời tiết hiện tại";
  };

  const getWeatherIcon = (code: number) => {
    if (code === 0) return "sunny";
    if (code <= 3) return "partly-sunny";
    return "cloudy";
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>Chào mừng trở lại,</Text>
            <Text style={styles.headerTitle}>Sẵn sàng khám phá?</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Weather Card */}
        <View style={styles.weatherCard}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <View style={styles.weatherLeft}>
                <Ionicons
                  name={weather ? getWeatherIcon(weather.code) : "sunny"}
                  size={40}
                  color="#FFD700"
                />
                <View style={styles.weatherTextGroup}>
                  <Text style={styles.tempText}>
                    {weather ? `${weather.temp}°C` : "--°C"}
                  </Text>
                  <Text style={styles.weatherDesc}>
                    {weather ? getWeatherDesc(weather.code) : "Đang tải..."}
                  </Text>
                </View>
              </View>
              <View style={styles.weatherRight}>
                <View style={styles.locationContainer}>
                  <Ionicons name="location-sharp" size={16} color="white" />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {address}
                  </Text>
                </View>
                <Text style={styles.dateText}>
                  Hôm nay,{" "}
                  {new Date().toLocaleDateString("vi-VN", {
                    day: "numeric",
                    month: "short",
                  })}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Quick Action Icons */}
        <View style={styles.actionRow}>
          {[
            {
              name: "notifications-outline",
              label: "Alerts",
              color: "#FF7E5F",
            },
            {
              name: "chatbubble-ellipses-outline",
              label: "Ask AI",
              color: "#4facfe",
            },
            { name: "help-buoy-outline", label: "Support", color: "#9b51e0" },
            {
              name: "navigate-circle-outline",
              label: "My Trips",
              color: "#27ae60",
            },
          ].map((item, index) => (
            <TouchableOpacity key={index} style={styles.actionItem}>
              <View style={styles.actionIconContainer}>
                <Ionicons
                  name={item.name as any}
                  size={24}
                  color={item.color}
                />
              </View>
              <Text style={styles.actionLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Categories / Tabs */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tìm kiếm chuyến đi kế tiếp</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {["Tất cả", "Bãi biển", "Núi non", "Thành phố", "Rừng núi"].map(
            (cat, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.categoryBtn,
                  i === 0 && styles.categoryBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    i === 0 && styles.categoryTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>

        {/* Trending Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Xu hướng hiện nay</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.trendingScroll}
        >
          <TouchableOpacity style={styles.trendingCard}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1537996194471-e657df975ab4",
              }}
              style={styles.trendingImage}
            />
            <View style={styles.trendingRating}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}> 4.8</Text>
            </View>
            <View style={styles.trendingOverlay}>
              <Text style={styles.trendingTitle}>Nghỉ dưỡng Bali</Text>
              <Text style={styles.trendingLocation}>Indonesia</Text>
              <View style={styles.trendingPriceRow}>
                <Text style={styles.trendingPrice}>Từ $450</Text>
                <View style={styles.trendingGoBtn}>
                  <Ionicons name="arrow-forward" size={16} color="white" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.trendingCard}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
              }}
              style={styles.trendingImage}
            />
            <View style={styles.trendingRating}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}> 4.9</Text>
            </View>
            <View style={styles.trendingOverlay}>
              <Text style={styles.trendingTitle}>Kỳ nghỉ Paris</Text>
              <Text style={styles.trendingLocation}>Pháp</Text>
              <View style={styles.trendingPriceRow}>
                <Text style={styles.trendingPrice}>Từ $600</Text>
                <View style={styles.trendingGoBtn}>
                  <Ionicons name="arrow-forward" size={16} color="white" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Recommended Section */}
        <Text style={styles.sectionTitle}>Gợi ý cho bạn</Text>
        <TouchableOpacity style={styles.recommendCard}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1505576391880-b3f9d713dc4f",
            }}
            style={styles.recommendImage}
          />
          <View style={styles.recommendContent}>
            <View style={styles.recommendHeader}>
              <View style={styles.dealBadge}>
                <Text style={styles.dealText}>ƯU ĐÃI</Text>
              </View>
              <View style={styles.row}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}> 4.8</Text>
              </View>
            </View>
            <Text style={styles.recommendTitle}>Khám phá Thung lũng Napa</Text>
            <Text style={styles.recommendDesc}>
              Trải nghiệm thưởng thức rượu vang...
            </Text>
            <View style={styles.recommendFooter}>
              <Text style={styles.recommendPrice}>$320 / người</Text>
              <TouchableOpacity style={styles.bookBtn}>
                <Text style={styles.bookBtnText}>Đặt ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      <NavigationBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: {
    backgroundColor: "#007BFF",
    padding: 24,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    paddingTop: 60,
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
  weatherCard: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 25,
    padding: 18,
    marginTop: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  weatherLeft: { flexDirection: "row", alignItems: "center" },
  weatherTextGroup: { marginLeft: 12 },
  tempText: { color: "white", fontSize: 32, fontWeight: "bold" },
  weatherDesc: { color: "white", fontSize: 14, opacity: 0.9 },
  weatherRight: { alignItems: "flex-end" },
  locationContainer: { flexDirection: "row", alignItems: "center" },
  locationText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
    maxWidth: 120,
    marginLeft: 4,
  },
  dateText: { color: "white", fontSize: 12, opacity: 0.7, marginTop: 4 },
  content: { padding: 20 },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  actionItem: { alignItems: "center" },
  actionIconContainer: {
    backgroundColor: "#F0F5FF",
    padding: 15,
    borderRadius: 20,
    marginBottom: 8,
  },
  actionLabel: { fontSize: 12, color: "#666", fontWeight: "600" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  seeAll: { color: "#007BFF", fontWeight: "600" },
  categoryScroll: { marginBottom: 20 },
  categoryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    marginRight: 10,
  },
  categoryBtnActive: { backgroundColor: "#007BFF" },
  categoryText: { color: "#888", fontWeight: "600" },
  categoryTextActive: { color: "white" },
  trendingScroll: { marginBottom: 25 },
  trendingCard: {
    width: 200,
    height: 280,
    borderRadius: 30,
    overflow: "hidden",
    marginRight: 15,
  },
  trendingImage: { width: "100%", height: "100%" },
  trendingRating: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "rgba(0,0,0,0.4)",
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignItems: "center",
  },
  ratingText: { color: "white", fontSize: 12, fontWeight: "bold" },
  trendingOverlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  trendingTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  trendingLocation: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginBottom: 10,
  },
  trendingPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  trendingPrice: { color: "white", fontSize: 16, fontWeight: "bold" },
  trendingGoBtn: { backgroundColor: "#007BFF", padding: 8, borderRadius: 12 },
  recommendCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 25,
    padding: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  recommendImage: { width: 100, height: 100, borderRadius: 20 },
  recommendContent: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "space-between",
  },
  recommendHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dealBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dealText: { color: "#007BFF", fontSize: 10, fontWeight: "bold" },
  recommendTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 4,
  },
  recommendDesc: { fontSize: 12, color: "#888" },
  recommendFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  recommendPrice: { fontSize: 14, fontWeight: "bold", color: "#333" },
  bookBtn: {
    backgroundColor: "#007BFF",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
  },
  bookBtnText: { color: "white", fontSize: 12, fontWeight: "bold" },
  row: { flexDirection: "row", alignItems: "center" },
});
