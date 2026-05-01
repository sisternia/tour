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
  Platform,
  useWindowDimensions,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import NavigationBar from "@/components/ui/NavigationBar";
import HomeLayout from "@/components/home/HomeLayout";
import Footer from "@/components/ui/Footer";
import { HOT_TOURS, DESTINATIONS } from "@/constants/homeData";

const { width: windowWidth } = Dimensions.get("window");

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web" && width > 768;

  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(
    null,
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
        setLoading(false);
      }
    })();
  }, []);

  const renderHotTours = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tour Hot Trong Tháng</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.trendingScroll}>
        {HOT_TOURS.map((tour, i) => (
          <TouchableOpacity key={i} style={styles.mobileTourCard}>
            <View style={{ height: 180 }}>
              <Image
                source={{ uri: tour.image }}
                style={{ width: "100%", height: "100%" }}
              />
            </View>
            <View style={{ padding: 16 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  marginBottom: 8,
                }}>
                <Ionicons name="star" size={14} color="#ff9900" />
                <Text
                  style={{ fontSize: 13, fontWeight: "600", color: "#666" }}>
                  {tour.rating}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#333",
                  marginBottom: 8,
                }}
                numberOfLines={2}>
                {tour.title}
              </Text>
              <Text style={{ fontSize: 14, color: "#666", marginBottom: 12 }}>
                {tour.time}
              </Text>
              <Text
                style={{ fontSize: 18, fontWeight: "800", color: "#003d9b" }}>
                {tour.price}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderBentoGrid = () => (
    <View>
      <Text style={styles.sectionTitle}>Điểm Đến Phổ Biến</Text>
      <View style={styles.mobileBentoGrid}>
        <View style={styles.mobileBentoMain}>
          <Image
            source={{ uri: DESTINATIONS[0].image }}
            style={styles.bentoImage}
          />
          <View style={styles.bentoOverlay}>
            <Text style={styles.bentoTitleSmall}>{DESTINATIONS[0].name}</Text>
            <Text style={styles.bentoCount}>{DESTINATIONS[0].count}</Text>
          </View>
        </View>

        <View style={styles.mobileBentoRow}>
          <View style={styles.mobileBentoSmall}>
            <Image
              source={{ uri: DESTINATIONS[1].image }}
              style={styles.bentoImage}
            />
            <View style={styles.bentoOverlaySmall}>
              <Text style={styles.bentoTitleSmall}>{DESTINATIONS[1].name}</Text>
            </View>
          </View>
          <View style={styles.mobileBentoSmall}>
            <Image
              source={{ uri: DESTINATIONS[2].image }}
              style={styles.bentoImage}
            />
            <View style={styles.bentoOverlaySmall}>
              <Text style={styles.bentoTitleSmall}>{DESTINATIONS[2].name}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderNewsletter = () => (
    <View style={styles.mobileNewsletter}>
      <Text style={styles.newsTitleMobile}>
        Sẵn sàng cho chuyến đi tiếp theo?
      </Text>
      <Text style={styles.newsSubMobile}>
        Đăng ký nhận tin để không bỏ lỡ những ưu đãi tour hấp dẫn nhất từ Tour
        Mate.
      </Text>
      <View style={styles.newsFormMobile}>
        <TextInput
          style={styles.newsInputMobile}
          placeholder="Địa chỉ email của bạn"
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.newsBtnMobile}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#fff" }}>
            Đăng ký ngay
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );



  const renderMobileHome = () => (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image
          source={{
            uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDEOPe24hlP-rPCedHni68ajIr6kSEnlt3I8--QLSfbjSjS46j84RtiiLzdBeI1srNCAPvXagcMYEgMuWKHGr785ff8hbrxzutKAynABBFHgQFKubE7rMnM_C8mXnM4y6D64P9HXLhSFJoE3eyneP0pRB-m7XTQyaLOtN9oLHsE3zGp034otB1mV3LqLfqBA7shza20LtCmZNX4QZvyrvjuUmfwPqZkOijtvccx8OHP2eVsuw_bfxJgVtDCz5yZyHqNTlgTXnTb7M0",
          }}
          style={styles.headerImage}
        />
        <View style={styles.headerOverlay} />

        <View style={styles.headerContentWrapper}>
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
                    name={
                      weather
                        ? weather.code === 0
                          ? "sunny"
                          : weather.code <= 3
                            ? "partly-sunny"
                            : "cloudy"
                        : "sunny"
                    }
                    size={40}
                    color="#FFD700"
                  />
                  <View style={styles.weatherTextGroup}>
                    <Text style={styles.tempText}>
                      {weather ? `${weather.temp}°C` : "--°C"}
                    </Text>
                    <Text style={styles.weatherDesc}>
                      {weather
                        ? weather.code === 0
                          ? "Trời quang"
                          : weather.code <= 3
                            ? "Nhiều mây"
                            : "Thời tiết hiện tại"
                        : "Đang tải..."}
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
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Categories / Tabs */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tìm kiếm chuyến đi kế tiếp</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}>
          {["Tất cả", "Bãi biển", "Núi non", "Thành phố", "Rừng núi"].map(
            (cat, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.categoryBtn,
                  i === 0 && styles.categoryBtnActive,
                ]}>
                <Text
                  style={[
                    styles.categoryText,
                    i === 0 && styles.categoryTextActive,
                  ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </ScrollView>

        {renderHotTours()}
        {renderBentoGrid()}
        {renderNewsletter()}
        <Footer />

        <View style={{ height: 100 }} />
      </ScrollView>
      <NavigationBar />
    </View>
  );

  return isWeb ? <HomeLayout /> : renderMobileHome();
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: {
    height: 320,
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
    paddingTop: 60,
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  seeAll: { color: "#003d9b", fontWeight: "600" },
  categoryScroll: { marginBottom: 20 },
  categoryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    marginRight: 10,
  },
  categoryBtnActive: { backgroundColor: "#003d9b" },
  categoryText: { color: "#888", fontWeight: "600" },
  categoryTextActive: { color: "white" },
  trendingScroll: { marginBottom: 25 },

  mobileTourCard: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
    marginBottom: 10,
  },
  mobileBentoGrid: {
    gap: 12,
    marginBottom: 20,
    marginTop: 15,
  },
  mobileBentoRow: {
    flexDirection: "row",
    gap: 12,
    height: 150,
  },
  mobileBentoSmall: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  mobileBentoMain: {
    height: 200,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
  },
  mobileNewsletter: {
    backgroundColor: "#005bb2",
    borderRadius: 30,
    padding: 30,
    alignItems: "center",
    marginVertical: 40,
  },
  newsTitleMobile: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
  },
  newsSubMobile: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: 12,
  },
  newsFormMobile: {
    width: "100%",
    gap: 12,
    marginTop: 24,
  },
  newsInputMobile: {
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingHorizontal: 20,
    height: 50,
    fontSize: 14,
  },
  newsBtnMobile: {
    backgroundColor: "#994700",
    borderRadius: 15,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  bentoImage: { width: "100%", height: "100%" },
  bentoOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
    padding: 20,
  },
  bentoOverlaySmall: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-end",
    padding: 15,
  },
  bentoTitleSmall: { fontSize: 18, fontWeight: "700", color: "#fff" },
  bentoCount: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 },
});
