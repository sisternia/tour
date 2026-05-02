import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NavigationBar from "@/components/ui/NavigationBar";

const TOUR_TYPES = ["Tất cả", "Nội địa", "Quốc tế"];

interface TourLayoutProps {
  tours: any[];
  selectedType: string;
  setSelectedType: (type: string) => void;
  minDays: number;
  setMinDays: (days: number) => void;
  formatDuration: (days: number) => string;
  handlePressTour: (tour: any) => void;
}

export default function TourLayout({
  tours,
  selectedType,
  setSelectedType,
  minDays,
  setMinDays,
  formatDuration,
  handlePressTour,
}: TourLayoutProps) {
  const renderFilterSection = (title: string, icon: any, children: React.ReactNode) => (
    <View style={styles.webFilterGroup}>
      <View style={styles.webFilterHeader}>
        <Ionicons name={icon} size={18} color="#333" />
        <Text style={styles.webFilterTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  return (
    <ScrollView style={styles.webContainer} showsVerticalScrollIndicator={false}>
      <NavigationBar />

      <View style={styles.webMainContent}>
        <View style={styles.webLayout}>
          {/* Sidebar Filters */}
          <View style={styles.webSidebar}>
            <View style={styles.webFilterCard}>
              <View style={styles.webFilterTop}>
                <Text style={styles.webFilterMainTitle}>Bộ lọc</Text>
                <TouchableOpacity><Text style={styles.webClearFilter}>Xóa tất cả</Text></TouchableOpacity>
              </View>

              {renderFilterSection("Khoảng giá", "cash-outline", (
                <View style={styles.webCheckboxGroup}>
                  {["Dưới 5 triệu", "5 - 10 triệu", "Trên 10 triệu"].map((price, i) => (
                    <TouchableOpacity key={i} style={styles.webCheckboxItem}>
                      <View style={styles.webCheckbox} />
                      <Text style={styles.webFilterLabel}>{price}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}

              {renderFilterSection("Thời gian", "time-outline", (
                <View style={styles.webDurationGrid}>
                  {["1-3 ngày", "4-7 ngày", "8-14 ngày", "Trên 2 tuần"].map((time, i) => (
                    <TouchableOpacity key={i} style={styles.webDurationBtn}>
                      <Text style={styles.webDurationText}>{time}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}

              {renderFilterSection("Loại tour", "apps-outline", (
                <View style={styles.webCheckboxGroup}>
                  {TOUR_TYPES.map((type, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.webCheckboxItem}
                      onPress={() => setSelectedType(type)}
                    >
                      <View style={[styles.webCheckbox, selectedType === type && styles.webCheckboxActive]} />
                      <Text style={styles.webFilterLabel}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}

              {renderFilterSection("Thời gian tối thiểu", "time-outline", (
                <View style={styles.webDurationContainer}>
                  <View style={styles.durationStepper}>
                    <TouchableOpacity onPress={() => setMinDays(Math.max(1, minDays - 1))} style={styles.stepperBtn}>
                      <Ionicons name="remove" size={20} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.durationValueText}>{formatDuration(minDays)}</Text>
                    <TouchableOpacity onPress={() => setMinDays(minDays + 1)} style={styles.stepperBtn}>
                      <Ionicons name="add" size={20} color="#333" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {renderFilterSection("Đánh giá", "star-outline", (
                <View style={styles.webRatingGroup}>
                  {[5, 4].map((rating, i) => (
                    <TouchableOpacity key={i} style={styles.webRatingItem}>
                      <View style={styles.webStars}>
                        {[...Array(5)].map((_, idx) => (
                          <Ionicons key={idx} name="star" size={16} color={idx < rating ? "#994700" : "#ddd"} />
                        ))}
                      </View>
                      <Text style={styles.webRatingLabel}>{rating === 5 ? "(5.0)" : "Trở lên"}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          </View>

          {/* Main List Area */}
          <View style={styles.webListArea}>
            <View style={styles.webToolbar}>
              <Text style={styles.webResultsInfo}>
                Hiển thị <Text style={styles.webBold}>{tours.length}</Text> trong số <Text style={styles.webBold}>148</Text> tour
              </Text>
              <View style={styles.webSortWrapper}>
                <Text style={styles.webSortLabel}>Sắp xếp:</Text>
                <TouchableOpacity style={styles.webSortSelect}>
                  <Text style={styles.webSortText}>Phổ biến nhất</Text>
                  <Ionicons name="chevron-down" size={14} color="#333" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.webTourGrid}>
              {tours.map((tour, i) => (
                <TouchableOpacity key={i} style={styles.webTourCard} onPress={() => handlePressTour(tour)}>
                  <View style={styles.webTourImageWrapper}>
                    <Image source={{ uri: tour.cover_img || "https://via.placeholder.com/400x250" }} style={styles.webTourImage} />
                    {i === 0 && <View style={styles.webHotTag}><Text style={styles.webHotTagText}>-20% Hot Deal</Text></View>}
                    <View style={styles.webRatingBadge}>
                      <Ionicons name="star" size={12} color="#994700" />
                      <Text style={styles.webRatingValue}>4.9</Text>
                    </View>
                  </View>
                  <View style={styles.webTourInfo}>
                    <View style={styles.webLocationRow}>
                      <Ionicons name="location" size={14} color="#005bb2" style={{ marginTop: 2 }} />
                      <Text style={styles.webLocationText} numberOfLines={2}>{tour.tour_add?.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.webTourTitle} numberOfLines={1}>{tour.tour_name}</Text>
                    <View style={styles.webTourMeta}>
                      <View style={styles.webMetaItem}>
                        <Ionicons name="time-outline" size={16} color="#666" />
                        <Text style={styles.webMetaText}>{formatDuration(tour.time?.tour_duration)}</Text>
                      </View>
                      <View style={styles.webMetaItem}>
                        <Ionicons name="people-outline" size={16} color="#666" />
                        <Text style={styles.webMetaText}>Tối đa {tour.price?.tour_capacity} người</Text>
                      </View>
                    </View>
                    <View style={styles.webPriceRow}>
                      <View style={styles.priceContainer}>
                        <View style={styles.priceItem}>
                          <Text style={styles.priceLabel}>Người lớn</Text>
                          <Text style={styles.priceSeparator}>: </Text>
                          <Text style={styles.priceValue}>{tour.price?.price_adult?.toLocaleString()}đ</Text>
                        </View>
                        <View style={styles.priceItem}>
                          <Text style={styles.priceLabel}>Trẻ em</Text>
                          <Text style={styles.priceSeparator}>: </Text>
                          <Text style={styles.priceValue}>{tour.price?.price_child?.toLocaleString()}đ</Text>
                        </View>
                      </View>
                      <TouchableOpacity style={styles.webDetailBtn} onPress={() => handlePressTour(tour)}>
                        <Text style={styles.webDetailBtnText}>Chi tiết</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Pagination */}
            <View style={styles.webPagination}>
              <TouchableOpacity style={styles.webPageBtn}><Ionicons name="chevron-back" size={20} color="#666" /></TouchableOpacity>
              <TouchableOpacity style={[styles.webPageBtn, styles.webPageBtnActive]}><Text style={styles.webPageTextActive}>1</Text></TouchableOpacity>
              <TouchableOpacity style={styles.webPageBtn}><Text style={styles.webPageText}>2</Text></TouchableOpacity>
              <TouchableOpacity style={styles.webPageBtn}><Text style={styles.webPageText}>3</Text></TouchableOpacity>
              <Text style={styles.webPageDots}>...</Text>
              <TouchableOpacity style={styles.webPageBtn}><Text style={styles.webPageText}>12</Text></TouchableOpacity>
              <TouchableOpacity style={styles.webPageBtn}><Ionicons name="chevron-forward" size={20} color="#666" /></TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.webFooter}>
        <View style={styles.webFooterContent}>
          <View style={styles.webFooterBrandCol}>
            <Text style={styles.webFooterBrand}>Tour Mate</Text>
            <Text style={styles.webFooterDesc}>© 2024 Tour Mate. Khám phá thế giới với sự an tâm tuyệt đối.</Text>
          </View>
          <View style={styles.webFooterCol}>
            <Text style={styles.webFooterHeader}>Khám phá</Text>
            <Text style={styles.webFooterLink}>Về chúng tôi</Text>
            <Text style={styles.webFooterLink}>Hướng dẫn đặt tour</Text>
            <Text style={styles.webFooterLink}>Điểm đến nổi bật</Text>
          </View>
          <View style={styles.webFooterCol}>
            <Text style={styles.webFooterHeader}>Chính sách</Text>
            <Text style={styles.webFooterLink}>Chính sách bảo mật</Text>
            <Text style={styles.webFooterLink}>Điều khoản dịch vụ</Text>
            <Text style={styles.webFooterLink}>Chính sách hoàn tiền</Text>
          </View>
          <View style={styles.webFooterCol}>
            <Text style={styles.webFooterHeader}>Liên hệ</Text>
            <View style={styles.webFooterContact}>
              <Ionicons name="mail-outline" size={16} color="#666" />
              <Text style={styles.webFooterInfo}>support@tourmate.vn</Text>
            </View>
            <View style={styles.webFooterContact}>
              <Ionicons name="call-outline" size={16} color="#666" />
              <Text style={styles.webFooterInfo}>1900 1234</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Web Styles
  webContainer: { flex: 1, backgroundColor: "#fcf9f8" },
  webMainContent: { maxWidth: 1280, width: "100%", alignSelf: "center", paddingHorizontal: 24, paddingTop: 100, paddingBottom: 60 },
  
  webLayout: { flexDirection: "row", gap: 32 },
  webSidebar: { width: 300 },
  webFilterCard: { backgroundColor: "#fff", padding: 24, borderRadius: 24, borderWidth: 1, borderColor: "#f0f0f0", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20 },
  webFilterTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 32 },
  webFilterMainTitle: { fontSize: 24, fontWeight: "700", color: "#1c1b1b" },
  webClearFilter: { fontSize: 12, fontWeight: "600", color: "#005bb2" },

  webFilterGroup: { marginBottom: 32 },
  webFilterHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  webFilterTitle: { fontSize: 14, fontWeight: "700", color: "#1c1b1b" },

  webCheckboxGroup: { gap: 12 },
  webCheckboxItem: { flexDirection: "row", alignItems: "center", gap: 12 },
  webCheckbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: "#ddd" },
  webFilterLabel: { fontSize: 15, color: "#414753" },

  webDurationGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  webDurationBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: "#ddd" },
  webDurationText: { fontSize: 12, fontWeight: "500", color: "#414753" },

  webRatingGroup: { gap: 8 },
  webRatingItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  webStars: { flexDirection: "row" },
  webRatingLabel: { fontSize: 12, color: "#666" },

  webListArea: { flex: 1 },
  webToolbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 32 },
  webResultsInfo: { fontSize: 16, color: "#666" },
  webBold: { fontWeight: "700", color: "#1c1b1b" },
  webSortWrapper: { flexDirection: "row", alignItems: "center", gap: 12 },
  webSortLabel: { fontSize: 14, fontWeight: "600", color: "#1c1b1b" },
  webSortSelect: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: "#ddd" },
  webSortText: { fontSize: 12, color: "#1c1b1b" },

  webTourGrid: { flexDirection: "row", flexWrap: "wrap", gap: 24 },
  webTourCard: { width: "31.5%", backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, borderWidth: 1, borderColor: "#f0f0f0", marginBottom: 8 },
  webTourImageWrapper: { height: 180, position: "relative" },
  webTourImage: { width: "100%", height: "100%" },
  webHotTag: { position: "absolute", top: 12, right: 12, backgroundColor: "#fb7800", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  webHotTagText: { fontSize: 10, fontWeight: "800", color: "#fff" },
  webRatingBadge: { position: "absolute", top: 12, left: 12, backgroundColor: "rgba(255,255,255,0.9)", flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  webRatingValue: { fontSize: 11, fontWeight: "800", color: "#1c1b1b" },

  webTourInfo: { padding: 16 },
  webLocationRow: { flexDirection: "row", alignItems: "flex-start", gap: 4, marginBottom: 6 },
  webLocationText: { fontSize: 10, fontWeight: "800", color: "#005bb2", letterSpacing: 1 },
  webTourTitle: { fontSize: 16, fontWeight: "700", color: "#1c1b1b", marginBottom: 12 },
  webTourMeta: { flexDirection: "row", gap: 12, marginBottom: 16 },
  webMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  webMetaText: { fontSize: 12, color: "#666" },
  webDurationContainer: { marginTop: 8 },
  durationStepper: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f6f3f2", borderRadius: 12, padding: 8 },
  stepperBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  durationValueText: { fontSize: 14, fontWeight: "700", color: "#1c1b1b" },
  webCheckboxActive: { backgroundColor: "#005bb2", borderColor: "#005bb2" },

  webPriceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#f0f0f0", paddingTop: 12 },
  webDetailBtn: { backgroundColor: "#d6e3ff", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  webDetailBtnText: { fontSize: 13, fontWeight: "700", color: "#001b3d" },

  priceContainer: { gap: 2 },
  priceItem: { flexDirection: "row", alignItems: "center" },
  priceLabel: { width: 60, fontSize: 11, color: "#333", fontWeight: "600" },
  priceSeparator: { fontSize: 11, color: "#333", fontWeight: "600" },
  priceValue: { fontSize: 11, fontWeight: "600", color: "#333" },

  webPagination: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 60 },
  webPageBtn: { width: 40, height: 40, borderRadius: 10, borderWidth: 1, borderColor: "#ddd", justifyContent: "center", alignItems: "center" },
  webPageBtnActive: { backgroundColor: "#005bb2", borderColor: "#005bb2" },
  webPageText: { fontSize: 14, fontWeight: "600", color: "#666" },
  webPageTextActive: { fontSize: 14, fontWeight: "700", color: "#fff" },
  webPageDots: { paddingHorizontal: 8, color: "#666" },

  webFooter: { backgroundColor: "#f6f3f2", borderTopWidth: 1, borderTopColor: "#eee", paddingVertical: 80, marginTop: 80 },
  webFooterContent: { maxWidth: 1280, width: "100%", alignSelf: "center", paddingHorizontal: 24, flexDirection: "row", justifyContent: "space-between" },
  webFooterBrandCol: { flex: 2 },
  webFooterBrand: { fontSize: 24, fontWeight: "900", color: "#005bb2", marginBottom: 16 },
  webFooterDesc: { fontSize: 14, color: "#666", lineHeight: 22, maxWidth: 300 },
  webFooterCol: { flex: 1 },
  webFooterHeader: { fontSize: 16, fontWeight: "700", color: "#1c1b1b", marginBottom: 24 },
  webFooterLink: { fontSize: 14, color: "#666", marginBottom: 16 },
  webFooterContact: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  webFooterInfo: { fontSize: 14, color: "#666" },
});
