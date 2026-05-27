import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import HomeHeader from "@/components/ui/HomeHeader";
import NavigationBar from "@/components/ui/NavigationBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { getToursByGuide } from "@/services/guide/guideTourService";

const { width } = Dimensions.get("window");

export default function GuideHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState("All");
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null);
  const [address, setAddress] = useState("Đang xác định...");
  const [loadingWeather, setLoadingWeather] = useState(true);
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    totalGuests: 0,
    totalIncome: 0,
    averageRating: 0,
    totalTours: 0
  });

  const [chartData, setChartData] = useState<{ m: string; vTours: number; vGuests: number; month: number; year: number }[]>([]);

  const filters = ["All", "Upcoming", "Ongoing", "Completed"];

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setAddress("Quyền bị từ chối");
        setLoadingWeather(false);
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
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`,
        );
        const data = await response.json();
        setWeather({
          temp: Math.round(data.current_weather.temperature),
          code: data.current_weather.weathercode,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingWeather(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (user?._id) {
      getToursByGuide(user._id).then(res => {
        if (res?.data) {
          const tours = res.data;
          let guests = 0;
          let income = 0;
          let ratingSum = 0;
          
          // Generate last 6 months structure
          const monthsData: { m: string; vTours: number; vGuests: number; month: number; year: number }[] = [];
          for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            monthsData.push({
              m: `Th${d.getMonth() + 1}`,
              vTours: 0,
              vGuests: 0,
              month: d.getMonth(),
              year: d.getFullYear()
            });
          }
          
          tours.forEach((t: any) => {
            // Rough estimation for stats if backend doesn't provide it
            const capacity = t.price?.tour_capacity || 0;
            guests += capacity; 
            income += (t.price?.price_adult || 0) * 0.1; // 10% commission mock
            ratingSum += 4.5; // Mock rating per tour
            
            const tDate = new Date(t.time?.date_start || t.createdAt || new Date());
            const match = monthsData.find(m => m.month === tDate.getMonth() && m.year === tDate.getFullYear());
            if (match) {
              match.vTours += 1;
              match.vGuests += capacity;
            }
          });
          
          setChartData(monthsData);
          
          setStats({
            totalGuests: guests,
            totalIncome: income,
            averageRating: tours.length > 0 ? (ratingSum / tours.length).toFixed(1) as any : 0,
            totalTours: tours.length
          });
        }
      }).catch(err => console.log(err));
    }
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 10) return "Chào buổi sáng";
    if (hour < 14) return "Chào buổi trưa";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const getWeatherInfo = (code: number) => {
    if (code === 0) return { icon: "sunny", label: "Trời nắng", color: "#FFD700" };
    if (code <= 3) return { icon: "partly-sunny", label: "Nhiều mây", color: "#FFD700" };
    if (code >= 45 && code <= 48) return { icon: "cloudy", label: "Có sương mù", color: "#cbd5e1" };
    if (code >= 51 && code <= 55) return { icon: "rainy", label: "Mưa phùn", color: "#60a5fa" };
    if (code >= 61 && code <= 67) return { icon: "rainy", label: "Mưa", color: "#3b82f6" };
    if (code >= 80 && code <= 82) return { icon: "rainy", label: "Mưa rào", color: "#2563eb" };
    if (code >= 95) return { icon: "thunderstorm", label: "Có bão", color: "#f59e0b" };
    return { icon: "cloudy", label: "Thời tiết hiện tại", color: "#cbd5e1" };
  };

  const weatherInfo = weather ? getWeatherInfo(weather.code) : { icon: "sunny", label: "Đang tải...", color: "#FFD700" };

  return (
    <View style={styles.container}>
      <HomeHeader
        welcomeText={getGreeting()}
        title="Bảng điều khiển HDV"
        showChat={true}
      >
        <View style={styles.weatherCard}>
          {loadingWeather ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <View style={styles.weatherLeft}>
                <Ionicons
                  name={weatherInfo.icon as any}
                  size={40}
                  color={weatherInfo.color}
                />
                <View style={styles.weatherTextGroup}>
                  <Text style={styles.tempText}>
                    {weather ? `${weather.temp}°C` : "--°C"}
                  </Text>
                  <Text style={styles.weatherDesc}>
                    {weatherInfo.label}
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
      </HomeHeader>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Performance Section */}
        <View style={styles.performanceCard}>
          <View style={styles.perfHeader}>
            <Text style={styles.perfTitle}>Hiệu suất hàng tuần</Text>
            <Ionicons name="trending-up" size={24} color="rgba(255,255,255,0.6)" />
          </View>
          <Text style={styles.perfSubtitle}>Bạn đã hướng dẫn {stats.totalGuests} người cho {stats.totalTours} tour!</Text>

          <View style={styles.perfStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalIncome.toLocaleString()}đ</Text>
              <Text style={styles.statLabel}>THU NHẬP ƯỚC TÍNH</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.averageRating}</Text>
              <Text style={styles.statLabel}>ĐÁNH GIÁ TB</Text>
            </View>
          </View>
        </View>

        {/* Statistics Section */}
        <Text style={styles.sectionTitle}>Thống kê hoạt động</Text>

        {/* Tours Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Số lượng Tour</Text>
              <Text style={styles.chartSubtitle}>6 tháng gần nhất</Text>
            </View>
            <View style={styles.chartLegend}>
              <View style={[styles.legendDot, { backgroundColor: "#005baf" }]} />
              <Text style={styles.legendText}>Tours</Text>
            </View>
          </View>

          <View style={styles.barChartContainer}>
            {chartData.map((item, idx) => (
              <View key={idx} style={styles.barWrapper}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { height: `${Math.min((item.vTours / (Math.max(...chartData.map(d => d.vTours)) || 1)) * 100, 100)}%` }
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{item.m}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Travelers Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Số lượng Khách</Text>
              <Text style={styles.chartSubtitle}>6 tháng gần nhất</Text>
            </View>
            <View style={styles.chartLegend}>
              <View style={[styles.legendDot, { backgroundColor: "#964400" }]} />
              <Text style={styles.legendText}>Khách</Text>
            </View>
          </View>

          <View style={styles.barChartContainer}>
            {chartData.map((item, idx) => (
              <View key={idx} style={styles.barWrapper}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${Math.min((item.vGuests / (Math.max(...chartData.map(d => d.vGuests)) || 1)) * 100, 100)}%`,
                        backgroundColor: "#964400"
                      }
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{item.m}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <NavigationBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9ff",
  },
  content: {
    flex: 1,
    padding: 16,
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
  filterScroll: {
    marginVertical: 15,
  },
  filterContainer: {
    gap: 10,
    paddingRight: 20,
  },
  filterBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: "#ebedf7",
  },
  filterBtnActive: {
    backgroundColor: "#005baf",
    elevation: 4,
    shadowColor: "#005baf",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  filterText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#414753",
  },
  filterTextActive: {
    color: "white",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#181c22",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  tourCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e2ec",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  statusBadgeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  timeToStart: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#005baf",
  },
  cardHeader: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  tourThumb: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  tourInfo: {
    flex: 1,
    justifyContent: "center",
    gap: 6,
  },
  tourTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#181c22",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: "#414753",
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#005baf",
    height: 48,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#005baf",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  primaryBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "white",
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#005baf",
  },
  secondaryBtnText: {
    color: "#005baf",
    fontWeight: "bold",
    fontSize: 14,
  },
  performanceCard: {
    backgroundColor: "#005baf",
    borderRadius: 24,
    padding: 24,
    marginTop: 8,
    position: "relative",
    overflow: "hidden",
  },
  perfHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  perfTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  perfSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 20,
  },
  perfStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  statItem: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "white",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 35,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  chartCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e0e2ec",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1c1b1b",
  },
  chartSubtitle: {
    fontSize: 12,
    color: "#64748b",
  },
  chartLegend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f8f9ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#414753",
  },
  barChartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 150,
    paddingHorizontal: 4,
  },
  barWrapper: {
    alignItems: "center",
    flex: 1,
  },
  barTrack: {
    width: 14,
    height: 120,
    backgroundColor: "#f1f3f9",
    borderRadius: 10,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    backgroundColor: "#005baf",
    borderRadius: 10,
  },
  barLabel: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
  },
});
