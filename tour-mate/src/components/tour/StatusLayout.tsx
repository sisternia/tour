import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NavigationBar from "@/components/ui/NavigationBar";

export default function StatusLayout({
  data,
  isPaid,
  isPending,
  isSuccess,
  getStatusTitle,
  getStatusSubTitle,
  getStatusColor,
  router,
}: any) {
  const bookingInfo = data?.booking || {};
  const tourName = bookingInfo.tour_id?.tour_name || "Tour du lịch";
  const coverImage =
    bookingInfo.tour_id?.tour_image ||
    "https://images.unsplash.com/photo-1596895111956-bf57059e00fa?q=80&w=1000&auto=format&fit=crop"; // fallback image
  const dateStart = bookingInfo.tour_id?.time?.date_start
    ? new Date(bookingInfo.tour_id.time.date_start).toLocaleDateString("vi-VN")
    : "--/--/----";
  const dateEnd = bookingInfo.tour_id?.time?.date_end
    ? new Date(bookingInfo.tour_id.time.date_end).toLocaleDateString("vi-VN")
    : "--/--/----";
  const adultCount = bookingInfo.adult_count || 0;
  const childCount = bookingInfo.child_count || 0;
  const capacity = bookingInfo.tour_id?.price?.tour_capacity || 0;

  return (
    <View style={styles.webContainer}>
      <NavigationBar />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.webContent}>
          <View style={styles.mainCenterBox}>
            {/* Animated Success Icon */}
            <View
              style={[
                styles.iconWrapper,
                {
                  backgroundColor: isSuccess
                    ? isPaid
                      ? "#E8F5E9"
                      : "#E3F2FD"
                    : "#FFEBEE",
                },
              ]}
            >
              <Ionicons
                name={
                  isSuccess
                    ? isPaid
                      ? "checkmark-circle"
                      : "time"
                    : "close-circle"
                }
                size={70}
                color={getStatusColor()}
              />
            </View>

            {/* Headline & Subheadline */}
            <Text style={[styles.headline, { color: getStatusColor() }]}>
              {getStatusTitle()}
            </Text>
            <Text style={styles.subHeadline}>
              Cảm ơn bạn đã tin tưởng hệ thống của chúng tôi.{"\n"}Mã đặt tour: {" "}
              <Text style={styles.boldPrimary}>
                #{bookingInfo.booking_info_id}
              </Text>
              .
            </Text>

            {/* Information Card */}
            {isSuccess && (
              <View style={styles.infoCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.labelSmall}>TÊN TOUR</Text>
                  <Text style={styles.tourTitle}>{tourName}</Text>
                </View>

                <View style={styles.cardGrid}>
                  <View style={styles.gridItem}>
                    <Text style={styles.labelSmall}>NGÀY KHỞI HÀNH</Text>
                    <View style={styles.iconTextRow}>
                      <Ionicons name="calendar-outline" size={18} color="#005bb2" />
                      <Text style={styles.gridValue}>{dateStart}</Text>
                    </View>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.labelSmall}>NGÀY KẾT THÚC</Text>
                    <View style={styles.iconTextRow}>
                      <Ionicons name="calendar-outline" size={18} color="#005bb2" />
                      <Text style={styles.gridValue}>{dateEnd}</Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.cardGrid, { borderTopWidth: 1, borderTopColor: '#f8f9fa', paddingTop: 16 }]}>
                  <View style={styles.gridItem}>
                    <Text style={styles.labelSmall}>HÀNH KHÁCH</Text>
                    <View style={styles.iconTextRow}>
                      <Ionicons name="people-outline" size={18} color="#005bb2" />
                      <Text style={styles.gridValue}>
                        {adultCount} Người lớn, {childCount} Trẻ em
                      </Text>
                    </View>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.labelSmall}>SỨC CHỨA</Text>
                    <View style={styles.iconTextRow}>
                      <Ionicons name="apps-outline" size={18} color="#005bb2" />
                      <Text style={styles.gridValue}>Tối đa {capacity} người</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.labelSmall}>TỔNG CỘNG</Text>
                    <Text style={styles.totalPrice}>
                      {Number(bookingInfo.total_price || 0).toLocaleString()}đ
                    </Text>
                  </View>

                  <View style={styles.footerCenterCol}>
                    <Text style={styles.labelSmall}>PHƯƠNG THỨC THANH TOÁN</Text>
                    <View style={styles.iconTextRow}>
                      <Ionicons name="card-outline" size={18} color="#005bb2" />
                      <Text style={styles.gridValueSmall}>
                        {isPaid ? "Chuyển khoản" : "Thanh toán sau"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.statusBadge}>
                    <Ionicons
                      name={isPaid ? "checkmark-circle" : "time"}
                      size={18}
                      color="#005bb2"
                    />
                    <Text style={styles.statusBadgeText}>
                      {isPaid ? "Đã thanh toán" : "Chờ thanh toán"}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Image Decoration */}
            {isSuccess && (
              <View style={styles.imageContainer}>
                <Image source={{ uri: coverImage }} style={styles.coverImage} />
                <View style={styles.imageOverlay} />
              </View>
            )}

            {/* Instruction Text */}
            <View style={styles.instructionBox}>
              <Ionicons
                name="mail"
                size={24}
                color="#005bb2"
                style={styles.instructionIcon}
              />
              <Text style={styles.instructionText}>
                Thông tin chi tiết và vé điện tử đã được lưu vào hệ thống. Vui
                lòng kiểm tra mục Quản lý đặt tour của bạn.
              </Text>
            </View>

            {/* CTA Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => router.replace("/home/HomeScreen")}
              >
                <Ionicons name="document-text-outline" size={20} color="#fff" />
                <Text style={styles.primaryBtnText}>
                  Xem lịch trình chi tiết
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => router.replace("/home/HomeScreen")}
              >
                <Ionicons name="home-outline" size={20} color="#005bb2" />
                <Text style={styles.secondaryBtnText}>Về trang chủ</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.supportText}>
              Cần hỗ trợ?{" "}
              <Text style={styles.supportLink}>
                Liên hệ bộ phận chăm sóc khách hàng
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: { flex: 1, backgroundColor: "#fcf9f8", alignItems: "center" },
  webContent: {
    width: "100%",
    maxWidth: 1200,
    padding: 30,
    paddingTop: 112,
    alignItems: "center",
  },
  mainCenterBox: {
    width: "100%",
    maxWidth: 680,
    alignItems: "center",
    textAlign: "center" as any,
  },

  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
  },
  headline: {
    fontSize: 36,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center" as any,
  },
  subHeadline: {
    fontSize: 16,
    color: "#414753",
    lineHeight: 24,
    maxWidth: 520,
    marginBottom: 40,
    textAlign: "center" as any,
  },
  boldPrimary: { fontWeight: "bold", color: "#005bb2" },

  infoCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#0077e6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    borderColor: "#f0eded",
    borderWidth: 1,
    marginBottom: 30,
  },
  cardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0eded",
    paddingBottom: 16,
    marginBottom: 16,
    alignItems: "flex-start" as any,
  },
  labelSmall: {
    fontSize: 12,
    fontWeight: "600",
    color: "#717785",
    marginBottom: 6,
    letterSpacing: 1,
  },
  tourTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1c1b1b",
    textAlign: "left" as any,
  },

  cardGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  gridItem: { flex: 1, alignItems: "flex-start" as any },
  iconTextRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  gridValue: { fontSize: 16, fontWeight: "600", color: "#1c1b1b" },
  gridValueSmall: { fontSize: 14, fontWeight: "600", color: "#1c1b1b" },

  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#f0eded",
    paddingTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerCenterCol: {
    alignItems: "flex-start",
    borderLeftWidth: 1,
    borderLeftColor: "#f0eded",
    paddingLeft: 24,
    flex: 1,
    marginLeft: 24,
  },
  totalPrice: { fontSize: 26, fontWeight: "700", color: "#fb7800" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statusBadgeText: { fontSize: 14, fontWeight: "600", color: "#005bb2" },

  imageContainer: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 30,
    position: "relative" as any,
  },
  coverImage: { width: "100%", height: "100%", opacity: 0.9 },
  imageOverlay: {
    position: "absolute" as any,
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.1)",
  },

  instructionBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#f6f3f2",
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#005bb2",
    marginBottom: 40,
  },
  instructionIcon: { marginTop: 2 },
  instructionText: {
    fontSize: 15,
    color: "#414753",
    lineHeight: 22,
    flex: 1,
    textAlign: "left" as any,
  },

  actionButtons: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
    justifyContent: "center",
    marginBottom: 30,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#005bb2",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    shadowColor: "#005bb2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
    flex: 1,
  },
  primaryBtnText: { color: "#ffffff", fontSize: 16, fontWeight: "600" },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#005bb2",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    flex: 1,
  },
  secondaryBtnText: { color: "#005bb2", fontSize: 16, fontWeight: "600" },

  supportText: { fontSize: 14, color: "#717785", marginTop: 10 },
  supportLink: { color: "#005bb2", fontWeight: "600" },
});
