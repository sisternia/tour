import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NavigationBar from "@/components/ui/NavigationBar";
import Footer from "@/components/ui/Footer";
import { HOT_TOURS, DESTINATIONS } from "@/constants/homeData";

export default function HomeLayout() {
  const renderHotTours = () => (
    <View style={styles.sectionWrapper}>
      <View style={styles.webSectionHeader}>
        <View>
          <Text style={styles.webSectionTag}>ƯU ĐÃI ĐỘC QUYỀN</Text>
          <Text style={styles.webSectionTitle}>Tour Hot Trong Tháng</Text>
        </View>
        <TouchableOpacity style={styles.webSeeAllBtn}>
          <Text style={styles.webSeeAllText}>Xem tất cả</Text>
          <Ionicons name="arrow-forward" size={16} color="#005bb2" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tourGrid}
      >
        {HOT_TOURS.map((tour, i) => (
          <TouchableOpacity key={i} style={styles.webTourCard}>
            <View style={styles.webTourImageWrapper}>
              <Image source={{ uri: tour.image }} style={styles.webTourImage} />
              {tour.tag && (
                <View style={styles.webTourTag}>
                  <Text style={styles.webTourTagText}>{tour.tag}</Text>
                </View>
              )}
            </View>
            <View style={styles.webTourContent}>
              <View style={styles.webTourRatingRow}>
                <Ionicons name="star" size={14} color="#ff9900" />
                <Text style={styles.webTourRatingText}>
                  {tour.rating} (120 đánh giá)
                </Text>
              </View>
              <Text style={styles.webTourTitle} numberOfLines={2}>
                {tour.title}
              </Text>
              <View style={styles.webTourInfoRow}>
                <Ionicons name="time-outline" size={14} color="#666" />
                <Text style={styles.webTourInfoText}>{tour.time}</Text>
              </View>
              <View style={styles.webTourPriceRow}>
                <Text style={styles.webTourPriceLabel}>Giá từ</Text>
                <Text style={styles.webTourPriceValue}>{tour.price}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderBentoGrid = () => (
    <View style={styles.webDestSection}>
      <Text style={styles.webSectionTitleCenter}>Điểm Đến Phổ Biến</Text>
      <Text style={styles.webSectionSubCenter}>
        Những tọa độ check-in được yêu thích nhất mùa du lịch năm nay.
      </Text>

      <View style={styles.bentoGrid}>
        <View style={styles.bentoMain}>
          <Image
            source={{ uri: DESTINATIONS[0].image }}
            style={styles.bentoImage}
          />
          <View style={styles.bentoOverlay}>
            <Text style={styles.bentoTitle}>{DESTINATIONS[0].name}</Text>
            <Text style={styles.bentoCount}>{DESTINATIONS[0].count}</Text>
          </View>
        </View>

        <View style={styles.bentoRight}>
          <View style={styles.bentoRow}>
            <View style={styles.bentoSmall}>
              <Image
                source={{ uri: DESTINATIONS[1].image }}
                style={styles.bentoImage}
              />
              <View style={styles.bentoOverlaySmall}>
                <Text style={styles.bentoTitleSmall}>
                  {DESTINATIONS[1].name}
                </Text>
              </View>
            </View>
            <View style={styles.bentoSmall}>
              <Image
                source={{ uri: DESTINATIONS[2].image }}
                style={styles.bentoImage}
              />
              <View style={styles.bentoOverlaySmall}>
                <Text style={styles.bentoTitleSmall}>
                  {DESTINATIONS[2].name}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.bentoWide}>
            <Image
              source={{ uri: DESTINATIONS[3].image }}
              style={styles.bentoImage}
            />
            <View style={styles.bentoOverlay}>
              <Text style={styles.bentoTitle}>{DESTINATIONS[3].name}</Text>
              <Text style={styles.bentoCount}>{DESTINATIONS[3].count}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderNewsletter = () => (
    <View style={styles.webNewsletter}>
      <Text style={styles.newsTitle}>Sẵn sàng cho chuyến đi tiếp theo?</Text>
      <Text style={styles.newsSub}>
        Đăng ký nhận tin để không bỏ lỡ những ưu đãi tour hấp dẫn nhất từ Tour
        Mate.
      </Text>
      <View style={styles.newsForm}>
        <TextInput
          style={styles.newsInput}
          placeholder="Địa chỉ email của bạn"
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.newsBtn}>
          <Text style={styles.newsBtnText}>Đăng ký ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.webContainer}
      showsVerticalScrollIndicator={false}
    >
      <NavigationBar />

      {/* Hero Section */}
      <View style={styles.webHero}>
        <Image
          source={{
            uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDEOPe24hlP-rPCedHni68ajIr6kSEnlt3I8--QLSfbjSjS46j84RtiiLzdBeI1srNCAPvXagcMYEgMuWKHGr785ff8hbrxzutKAynABBFHgQFKubE7rMnM_C8mXnM4y6D64P9HXLhSFJoE3eyneP0pRB-m7XTQyaLOtN9oLHsE3zGp034otB1mV3LqLfqBA7shza20LtCmZNX4QZvyrvjuUmfwPqZkOijtvccx8OHP2eVsuw_bfxJgVtDCz5yZyHqNTlgTXnTb7M0",
          }}
          style={styles.heroBg}
        />
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>
            Khám Phá Thế Giới{"\n"}Theo Cách Của Bạn
          </Text>
          <Text style={styles.heroSubTitle}>
            Hàng ngàn tour du lịch độc đáo và ưu đãi hấp dẫn đang chờ đón bạn.
          </Text>

          {/* Search Bar */}
          <View style={styles.webSearchBar}>
            <View style={styles.searchItem}>
              <Ionicons name="location-outline" size={20} color="#005bb2" />
              <View style={styles.searchFields}>
                <Text style={styles.searchLabel}>ĐIỂM ĐẾN</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Bạn muốn đi đâu?"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
            <View style={styles.searchDivider} />
            <View style={styles.searchItem}>
              <Ionicons name="calendar-outline" size={20} color="#005bb2" />
              <View style={styles.searchFields}>
                <Text style={styles.searchLabel}>NGÀY ĐI</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Chọn ngày"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
            <View style={styles.searchDivider} />
            <View style={styles.searchItem}>
              <Ionicons name="people-outline" size={20} color="#005bb2" />
              <View style={styles.searchFields}>
                <Text style={styles.searchLabel}>HÀNH KHÁCH</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Số người"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
            <TouchableOpacity style={styles.searchBtn}>
              <Ionicons name="search" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.webMainContent}>
        {renderHotTours()}
        {renderBentoGrid()}
        {renderNewsletter()}
      </View>

      <Footer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Web Styles
  webContainer: { flex: 1, backgroundColor: "#fcf9f8" },
  webHero: {
    height: 700,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  heroBg: { position: "absolute", width: "100%", height: "100%" },
  heroOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  heroContent: {
    zIndex: 10,
    width: "100%",
    maxWidth: 1280,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 64,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    lineHeight: 76,
    letterSpacing: -1,
  },
  heroSubTitle: {
    fontSize: 20,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginTop: 24,
    maxWidth: 700,
  },
  webSearchBar: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 48,
    width: "100%",
    maxWidth: 900,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 20,
  },
  searchItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  searchFields: { flex: 1 },
  searchLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#aaa",
    letterSpacing: 1,
  },
  searchInput: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginTop: 2,
    padding: 0,
    height: 24,
    borderBottomWidth: 0,
  },
  searchDivider: { width: 1, height: 40, backgroundColor: "#eee" },
  searchBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#005bb2",
    justifyContent: "center",
    alignItems: "center",
  },

  webMainContent: {
    maxWidth: 1280,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 24,
  },
  sectionWrapper: { marginVertical: 80 },
  webSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 40,
  },
  webSectionTag: {
    fontSize: 13,
    fontWeight: "700",
    color: "#994700",
    letterSpacing: 2,
  },
  webSectionTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: "#1c1b1b",
    marginTop: 8,
  },
  webSectionTitleCenter: {
    fontSize: 40,
    fontWeight: "800",
    color: "#1c1b1b",
    textAlign: "center",
    marginTop: 80,
  },
  webSectionSubCenter: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 48,
  },
  webSeeAllBtn: { flexDirection: "row", alignItems: "center", gap: 8 },
  webSeeAllText: { fontSize: 15, fontWeight: "700", color: "#005bb2" },

  tourGrid: { flexDirection: "row", gap: 32 },
  webTourCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  webTourImageWrapper: { height: 260 },
  webTourImage: { width: "100%", height: "100%" },
  webTourTag: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "#994700",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  webTourTagText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  webTourContent: { padding: 24 },
  webTourRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  webTourRatingText: { fontSize: 13, fontWeight: "600", color: "#666" },
  webTourTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1c1b1b",
    marginBottom: 12,
  },
  webTourInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  webTourInfoText: { fontSize: 14, color: "#666" },
  webTourPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 16,
  },
  webTourPriceLabel: { fontSize: 14, color: "#999" },
  webTourPriceValue: { fontSize: 22, fontWeight: "800", color: "#994700" },

  webDestSection: { paddingVertical: 40 },
  bentoGrid: { height: 600, flexDirection: "row", gap: 24 },
  bentoMain: {
    flex: 2,
    borderRadius: 32,
    overflow: "hidden",
    position: "relative",
  },
  bentoRight: { flex: 2, gap: 24 },
  bentoRow: { flex: 1, flexDirection: "row", gap: 24 },
  bentoSmall: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
  },
  bentoWide: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
  },
  bentoImage: { width: "100%", height: "100%" },
  bentoOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
    padding: 32,
  },
  bentoOverlaySmall: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-end",
    padding: 20,
  },
  bentoTitle: { fontSize: 32, fontWeight: "800", color: "#fff" },
  bentoTitleSmall: { fontSize: 20, fontWeight: "700", color: "#fff" },
  bentoCount: { fontSize: 15, color: "rgba(255,255,255,0.8)", marginTop: 4 },

  webNewsletter: {
    backgroundColor: "#005bb2",
    borderRadius: 48,
    padding: 80,
    alignItems: "center",
    marginVertical: 80,
  },
  newsTitle: {
    fontSize: 40,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
  },
  newsSub: {
    fontSize: 18,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: 16,
    maxWidth: 600,
  },
  newsForm: {
    flexDirection: "row",
    gap: 16,
    marginTop: 40,
    width: "100%",
    maxWidth: 600,
  },
  newsInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingHorizontal: 32,
    height: 64,
    fontSize: 16,
  },
  newsBtn: {
    backgroundColor: "#994700",
    paddingHorizontal: 40,
    borderRadius: 999,
    justifyContent: "center",
    height: 64,
  },
  newsBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});
