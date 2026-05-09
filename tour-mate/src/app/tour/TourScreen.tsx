import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import NavigationBar from "@/components/ui/NavigationBar";
import Footer from "@/components/ui/Footer";
import { useRouter } from "expo-router";
import { Modal } from "react-native";

import TourLayout from "@/components/tour/TourLayout";
import { getAllTours } from "@/services/tour/tourService";

const TOUR_TYPES = ["Tất cả", "Nội địa", "Quốc tế"];
const PRICE_RANGES = ["Dưới 5 triệu", "5 - 10 triệu", "Trên 10 triệu"];

export default function TourScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web" && width > 768;
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [selectedType, setSelectedType] = useState("Tất cả");
  const [minDays, setMinDays] = useState(1);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const result = await getAllTours();
      if (result.success) {
        // Chỉ hiển thị các Tour có trạng thái "Đang hoạt động"
        const activeTours = result.data.filter((tour: any) => tour.tour_status === "Đang hoạt động");
        setTours(activeTours);
      }
    } catch (error) {
      console.error("Error fetching tours:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (days: number) => {
    if (!days) return "Chưa xác định";
    const nights = Math.max(0, days - 1);
    return `${days} ngày ${nights} đêm`;
  };

  const handlePressTour = (tour: any) => {
    router.push({
      pathname: "/tour/TourDetailScreen",
      params: {
        id: tour.tour_id,
        title: tour.tour_name,
        location: tour.tour_add,
        price: tour.price?.price_adult,
        image: tour.cover_img,
      },
    });
  };

  const renderMobileTourScreen = () => (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tour Mate</Text>
          <TouchableOpacity style={styles.filterBtn} onPress={() => setShowMobileFilter(true)}>
            <Ionicons name="options-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#BDBDBD"
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Tìm kiếm điểm đến..."
            style={styles.searchInput}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Điểm đến phổ biến</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        {/* Vertical Tour Cards (Web-like style for Mobile) */}
        <View style={styles.mobileTourList}>
          {tours.map((tour, i) => (
            <TouchableOpacity
              key={tour.tour_id || i}
              style={styles.premiumCard}
              onPress={() => handlePressTour(tour)}
              activeOpacity={0.9}
            >
              <View style={styles.cardImageWrapper}>
                <Image
                  source={{ uri: tour.cover_img || "https://via.placeholder.com/400x250" }}
                  style={styles.cardImage}
                />
                <View style={styles.cardRatingBadge}>
                  <Ionicons name="star" size={12} color="#994700" />
                  <Text style={styles.cardRatingValue}>4.9</Text>
                </View>
                <TouchableOpacity style={styles.cardHeartBtn}>
                  <Ionicons name="heart-outline" size={20} color="white" />
                </TouchableOpacity>
              </View>

              <View style={styles.cardInfo}>
                <View style={styles.cardLocationRow}>
                  <Ionicons name="location" size={12} color="#005bb2" />
                  <Text style={styles.cardLocationText}>{tour.tour_add?.toUpperCase() || "CHƯA XÁC ĐỊNH"}</Text>
                </View>

                <Text style={styles.cardTitle} numberOfLines={2}>{tour.tour_name}</Text>

                <View style={styles.cardMetaRow}>
                  <View style={styles.cardMetaItem}>
                    <Ionicons name="time-outline" size={14} color="#666" />
                    <Text style={styles.cardMetaText}>
                      {formatDuration(tour.time?.tour_duration)}
                    </Text>
                  </View>
                  <View style={styles.cardMetaItem}>
                    <Ionicons name="people-outline" size={14} color="#666" />
                    <Text style={styles.cardMetaText}>Tối đa {tour.price?.tour_capacity} người</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.priceContainer}>
                    <View style={styles.priceItem}>
                      <Text style={styles.priceLabel}>Người lớn</Text>
                      <Text style={styles.priceSeparator}>: </Text>
                      <Text style={styles.priceValue}>{tour.price?.price_adult?.toLocaleString() || "0"}đ</Text>
                    </View>
                    <View style={styles.priceItem}>
                      <Text style={styles.priceLabel}>Trẻ em</Text>
                      <Text style={styles.priceSeparator}>: </Text>
                      <Text style={styles.priceValue}>{tour.price?.price_child?.toLocaleString() || "0"}đ</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.cardDetailBtn} onPress={() => handlePressTour(tour)}>
                    <Text style={styles.cardDetailBtnText}>Chi tiết</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Footer />
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Mobile Filter Modal */}
      <Modal
        visible={showMobileFilter}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bộ lọc tìm kiếm</Text>
              <TouchableOpacity onPress={() => setShowMobileFilter(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Loại tour</Text>
                <View style={styles.filterOptionsRow}>
                  {TOUR_TYPES.map((type, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[styles.filterChip, selectedType === type && styles.filterChipActive]}
                      onPress={() => setSelectedType(type)}
                    >
                      <Text style={[styles.filterChipText, selectedType === type && styles.filterChipTextActive]}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Thời gian tối thiểu</Text>
                <View style={styles.durationStepper}>
                  <TouchableOpacity onPress={() => setMinDays(Math.max(1, minDays - 1))} style={styles.stepperBtn}>
                    <Ionicons name="remove" size={24} color="#333" />
                  </TouchableOpacity>
                  <Text style={styles.durationValueTextLarge}>{formatDuration(minDays)}</Text>
                  <TouchableOpacity onPress={() => setMinDays(minDays + 1)} style={styles.stepperBtn}>
                    <Ionicons name="add" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Khoảng giá</Text>
                <View style={styles.filterOptionsGrid}>
                  {PRICE_RANGES.map((range, i) => (
                    <TouchableOpacity key={i} style={styles.priceOption}>
                      <View style={styles.webCheckbox} />
                      <Text style={styles.priceOptionText}>{range}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => setShowMobileFilter(false)}
            >
              <Text style={styles.applyBtnText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <NavigationBar />
    </SafeAreaView>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={{ marginTop: 10, color: "#666" }}>Đang tải dữ liệu tour...</Text>
      </View>
    );
  }

  return isWeb ? (
    <TourLayout
      tours={tours}
      selectedType={selectedType}
      setSelectedType={setSelectedType}
      minDays={minDays}
      setMinDays={setMinDays}
      formatDuration={formatDuration}
      handlePressTour={handlePressTour}
    />
  ) : renderMobileTourScreen();
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  content: { paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  filterBtn: { position: "absolute", right: 0 },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F4F8",
    borderRadius: 15,
    padding: 12,
    alignItems: "center",
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold" },
  viewAll: { color: "#007BFF", fontSize: 14 },

  // Mobile Premium Cards
  mobileTourList: { gap: 20 },
  premiumCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  cardImageWrapper: { height: 200, position: "relative" },
  cardImage: { width: "100%", height: "100%" },
  cardRatingBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardRatingValue: { fontSize: 12, fontWeight: "800", color: "#1c1b1b" },
  cardHeartBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 8,
    borderRadius: 20,
  },
  cardInfo: { padding: 16 },
  cardLocationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  cardLocationText: { fontSize: 10, fontWeight: "800", color: "#005bb2", letterSpacing: 0.5 },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#1c1b1b", marginBottom: 12 },
  cardMetaRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  cardMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardMetaText: { fontSize: 12, color: "#666" },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  priceContainer: { gap: 4 },
  priceItem: { flexDirection: "row", alignItems: "center" },
  priceLabel: { width: 70, fontSize: 13, color: "#333", fontWeight: "600" },
  priceSeparator: { fontSize: 13, color: "#333", fontWeight: "600" },
  priceValue: { fontSize: 13, fontWeight: "600", color: "#333" },
  cardDetailBtn: { backgroundColor: "#d6e3ff", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  cardDetailBtnText: { fontSize: 13, fontWeight: "700", color: "#001b3d" },

  webCheckbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: "#ddd" },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, maxHeight: "80%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#1c1b1b" },
  modalBody: { marginBottom: 24 },
  filterSection: { marginBottom: 24 },
  filterLabel: { fontSize: 16, fontWeight: "700", color: "#1c1b1b", marginBottom: 16 },
  filterOptionsRow: { flexDirection: "row", gap: 12 },
  filterChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: "#f6f3f2" },
  filterChipActive: { backgroundColor: "#005bb2" },
  filterChipText: { fontSize: 14, fontWeight: "600", color: "#666" },
  filterChipTextActive: { color: "#fff" },
  filterOptionsGrid: { gap: 12 },
  priceOption: { flexDirection: "row", alignItems: "center", gap: 12 },
  priceOptionText: { fontSize: 15, color: "#414753" },
  applyBtn: { backgroundColor: "#005bb2", paddingVertical: 16, borderRadius: 16, alignItems: "center" },
  applyBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  durationStepper: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f6f3f2", borderRadius: 12, padding: 8 },
  stepperBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  durationValueTextLarge: { fontSize: 18, fontWeight: "700", color: "#005bb2" },
});
