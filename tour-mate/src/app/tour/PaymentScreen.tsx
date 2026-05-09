import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTourById } from "@/services/tour/tourService";
import { createVnPayPaymentUrl, createOfflineBooking, getPaymentStatus } from "@/services/payment/vnpayService";
import * as Linking from 'expo-linking';
import { useAuth } from "@/context/AuthContext";
import PaymentLayout from "@/components/tour/PaymentLayout";

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const isWeb = Platform.OS === "web" && width > 1024;

  const {
    tourId,
    adultCount: initialAdultCount,
    childCount: initialChildCount,
    name: initialName,
    email: initialEmail,
    phone: initialPhone,
    note: initialNote,
    adultsInfo: initialAdultsInfo,
    childrenInfo: initialChildrenInfo,
    totalPrice: initialTotalPrice,
    bookingId: existingBookingId,
  } = params;

  const [tour, setTour] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<"transfer" | "cash">("transfer");
  const [isProcessing, setIsProcessing] = useState(false);

  const [adultCount, setAdultCount] = useState(initialAdultCount);
  const [childCount, setChildCount] = useState(initialChildCount);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [note, setNote] = useState(initialNote);
  const [totalPrice, setTotalPrice] = useState(initialTotalPrice);
  const [parsedAdults, setParsedAdults] = useState<any[]>([]);
  const [parsedChildren, setParsedChildren] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (existingBookingId) {
        // Fetch existing booking info
        try {
          const res = await getPaymentStatus(existingBookingId as string);
          if (res.success && res.data?.booking) {
            const b = res.data.booking;
            setAdultCount(b.adult_count);
            setChildCount(b.child_count);
            setName(b.contact_info.full_name);
            setEmail(b.contact_info.email);
            setPhone(b.contact_info.phone);
            setNote(b.contact_info.note);
            setTotalPrice(b.total_price);
            
            // Reconstruct parsedAdults and parsedChildren
            const adults = b.passengers.filter((p: any) => p.type === 'adult');
            const children = b.passengers.filter((p: any) => p.type === 'child');
            setParsedAdults(adults);
            setParsedChildren(children);

            // Load tour info using the tour_id from booking
            // Note: In our current getPaymentStatus, booking.tour_id might already be populated
            const tId = typeof b.tour_id === 'object' ? b.tour_id.tour_id : b.tour_id;
            await loadTour(tId);
          }
        } catch (error) {
          console.error("Fetch Booking Error:", error);
        }
      } else {
        // Normal flow from BookTourScreen
        if (initialAdultsInfo) setParsedAdults(JSON.parse(initialAdultsInfo as string));
        if (initialChildrenInfo) setParsedChildren(JSON.parse(initialChildrenInfo as string));
        if (tourId) await loadTour(tourId as string);
      }
      setLoading(false);
    };

    fetchData();
  }, [existingBookingId, tourId]);

  const loadTour = async (id: string) => {
    try {
      const res = await getTourById(id);
      if (res?.data) setTour(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFinish = async () => {
    setIsProcessing(true);
    try {
      const orderDesc = `Thanh toan tour ${tour?.tour_name} - ${name}`;
      const bookingData = existingBookingId ? null : {
        tourId,
        adultCount,
        childCount,
        totalPrice,
        name,
        email,
        phone,
        note,
        parsedAdults,
        parsedChildren
      };

      if (paymentMethod === "transfer") {
        const res = await createVnPayPaymentUrl(
          Number(totalPrice), 
          orderDesc, 
          bookingData, 
          user?.user_id || user?._id,
          existingBookingId as string
        );

        if (res.success && res.paymentUrl) {
          if (Platform.OS === "web") {
            window.location.href = res.paymentUrl;
          } else {
            Linking.openURL(res.paymentUrl);
          }
        } else {
          alert(
            "Lỗi tạo thanh toán VNPAY: " + (res.message || "Vui lòng thử lại sau.")
          );
        }
      } else {
        // "Thanh toán sau" (cash) logic
        const res = await createOfflineBooking(bookingData, user?.user_id || user?._id);
        if (res.success && res.bookingId) {
          router.replace({
            pathname: "/tour/StatusScreen",
            params: { bookingId: res.bookingId }
          });
        } else {
          alert("Lỗi lưu đơn hàng: " + (res.message || "Vui lòng thử lại sau."));
        }
      }
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Có lỗi xảy ra trong quá trình xử lý đơn hàng.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  const coverImage =
    tour?.images?.find((img: any) => img.img_is_cover)?.tour_img_url ||
    tour?.images?.[0]?.tour_img_url;

  if (isWeb) {
    return (
      <PaymentLayout
        tour={tour}
        coverImage={coverImage}
        name={name}
        email={email}
        phone={phone}
        note={note}
        adultCount={adultCount}
        childCount={childCount}
        parsedAdults={parsedAdults}
        parsedChildren={parsedChildren}
        totalPrice={totalPrice}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        handleFinish={handleFinish}
        isProcessing={isProcessing}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>THANH TOÁN</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={{ height: 10 }} />
        {/* Booking Summary Card */}
        <View style={styles.card}>
          <View style={styles.summaryHeader}>
            <Ionicons name="receipt-outline" size={20} color="#0056b3" />
            <Text style={styles.summaryTitle}>Tóm tắt đặt tour</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.tourCompactInfo}>
            <Image source={{ uri: coverImage }} style={styles.tourThumb} />
            <View style={styles.tourTextInfo}>
              <Text style={styles.tourName} numberOfLines={2}>
                {tour?.tour_name}
              </Text>
              <Text style={styles.tourDate}>
                {new Date(tour?.time?.date_start).toLocaleDateString("vi-VN")} -{" "}
                {new Date(tour?.time?.date_end).toLocaleDateString("vi-VN")}
              </Text>
            </View>
          </View>

          <View style={styles.bookingDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Khách hàng:</Text>
              <Text style={styles.detailValue}>{name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Số điện thoại:</Text>
              <Text style={styles.detailValue}>{phone}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Thời lượng:</Text>
              <Text style={styles.detailValue}>
                {tour?.time?.tour_duration} ngày
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tối đa:</Text>
              <Text style={styles.detailValue}>
                {tour?.price?.tour_capacity} người
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Hành khách:</Text>
              <Text style={styles.detailValue}>
                {adultCount} người lớn, {childCount} trẻ em
              </Text>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Tổng cộng:</Text>
            <Text style={styles.priceValue}>
              {Number(totalPrice).toLocaleString()}đ
            </Text>
          </View>
        </View>

        {/* Passenger Info Section */}
        <Text style={styles.sectionTitle}>Thông tin hành khách</Text>

        {parsedAdults.length > 0 && (
          <View style={styles.card}>
            <View style={styles.passengerSectionHeader}>
              <Ionicons name="people-outline" size={22} color="#333" />
              <Text style={styles.passengerSectionTitle}>
                Người lớn <Text style={styles.ageNote}></Text>
              </Text>
            </View>

            {parsedAdults.map((adult: any, index: number) => (
              <View
                key={`adult-${index}`}
                style={styles.passengerFormRowMobile}
              >
                <View style={styles.formColHotenMobile}>
                  <Text style={styles.formLabel}>
                    Họ tên: <Text style={styles.asterisk}>*</Text>
                  </Text>
                  <Text style={styles.formValueText} numberOfLines={1}>
                    {adult.name || "Chưa nhập"}
                  </Text>
                </View>

                <View style={styles.formColGioitinhMobile}>
                  <Text style={styles.formLabel}>
                    Giới tính:<Text style={styles.asterisk}>*</Text>
                  </Text>
                  <Text style={styles.formValueText}>{adult.gender}</Text>
                </View>

                <View style={styles.formColNgaysinhMobile}>
                  <Text style={styles.formLabel}>
                    Ngày sinh: <Text style={styles.asterisk}>*</Text>
                  </Text>
                  <View style={styles.dateValueWrapper}>
                    <Text style={styles.formValueText}>
                      {adult.dob || "-- / -- / ----"}
                    </Text>
                    <Ionicons
                      name="calendar-outline"
                      size={12}
                      color="#666"
                      style={{ marginLeft: 2 }}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {parsedChildren.length > 0 && (
          <View style={styles.card}>
            <View style={styles.passengerSectionHeader}>
              <Ionicons name="people-outline" size={22} color="#333" />
              <Text style={styles.passengerSectionTitle}>
                Trẻ em <Text style={styles.ageNote}></Text>
              </Text>
            </View>

            {parsedChildren.map((child: any, index: number) => (
              <View
                key={`child-${index}`}
                style={styles.passengerFormRowMobile}
              >
                <View style={styles.formColHotenMobile}>
                  <Text style={styles.formLabel}>
                    Họ tên: <Text style={styles.asterisk}>*</Text>
                  </Text>
                  <Text style={styles.formValueText} numberOfLines={1}>
                    {child.name || "Chưa nhập"}
                  </Text>
                </View>

                <View style={styles.formColGioitinhMobile}>
                  <Text style={styles.formLabel}>
                    Giới tính:<Text style={styles.asterisk}>*</Text>
                  </Text>
                  <Text style={styles.formValueText}>{child.gender}</Text>
                </View>

                <View style={styles.formColNgaysinhMobile}>
                  <Text style={styles.formLabel}>
                    Ngày sinh: <Text style={styles.asterisk}>*</Text>
                  </Text>
                  <View style={styles.dateValueWrapper}>
                    <Text style={styles.formValueText}>
                      {child.dob || "-- / -- / ----"}
                    </Text>
                    <Ionicons
                      name="calendar-outline"
                      size={12}
                      color="#666"
                      style={{ marginLeft: 2 }}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>

        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentMethod === "transfer" && styles.paymentOptionActive,
          ]}
          onPress={() => setPaymentMethod("transfer")}
        >
          <View
            style={[
              styles.radio,
              paymentMethod === "transfer" && styles.radioActive,
            ]}
          >
            {paymentMethod === "transfer" && <View style={styles.radioInner} />}
          </View>
          <View style={styles.paymentIconBox}>
            <Ionicons name="card-outline" size={24} color="#0056b3" />
          </View>
          <View style={styles.paymentTexts}>
            <Text style={styles.paymentName}>Chuyển khoản (VNPAY)</Text>
            <Text style={styles.paymentDesc}>
              Thanh toán nhanh qua ứng dụng ngân hàng hoặc thẻ
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentMethod === "cash" && styles.paymentOptionActive,
          ]}
          onPress={() => setPaymentMethod("cash")}
        >
          <View
            style={[
              styles.radio,
              paymentMethod === "cash" && styles.radioActive,
            ]}
          >
            {paymentMethod === "cash" && <View style={styles.radioInner} />}
          </View>
          <View style={styles.paymentIconBox}>
            <Ionicons name="time-outline" size={24} color="#0056b3" />
          </View>
          <View style={styles.paymentTexts}>
            <Text style={styles.paymentName}>Thanh toán sau</Text>
            <Text style={styles.paymentDesc}>Lưu đơn hàng và thanh toán sau</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.infoNotice}>
          <Ionicons name="information-circle-outline" size={18} color="#666" />
          <Text style={styles.infoNoticeText}>
            Bạn sẽ được chuyển đến trang hướng dẫn thanh toán chi tiết sau khi
            xác nhận.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBarWrapper}>
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
        >
          <View>
            <Text style={styles.totalLabel}>Số tiền thanh toán</Text>
            <Text style={styles.totalValue}>
              {Number(totalPrice).toLocaleString()}đ
            </Text>
          </View>
          <TouchableOpacity style={styles.confirmBtn} onPress={handleFinish}>
            <Text style={styles.confirmBtnText}>Xác nhận</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0056b3",
    letterSpacing: 1,
  },
  scrollContent: { padding: 20, paddingBottom: 120 },

  // Mobile Steps Styles
  mobileStepsContainer: {
    alignItems: "center",
    marginBottom: 25,
    marginTop: 10,
  },
  stepsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  stepItem: { alignItems: "center", width: 85 },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  stepActive: { backgroundColor: "#0056b3" },
  stepCompleted: {
    backgroundColor: "#E0F0FF",
    borderWidth: 1,
    borderColor: "#0056b3",
  },
  stepText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#999",
    textAlign: "center",
  },
  stepTextActive: { color: "#0056b3" },
  stepTextCompleted: { color: "#0056b3" },
  stepArrow: { marginTop: -15 },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    marginTop: 10,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
  },
  summaryTitle: { fontSize: 17, fontWeight: "bold", color: "#333" },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginBottom: 15 },

  tourCompactInfo: { flexDirection: "row", gap: 15, marginBottom: 20 },
  tourThumb: {
    width: 80,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  tourTextInfo: { flex: 1, justifyContent: "center" },
  tourName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  tourDate: { fontSize: 12, color: "#666", marginTop: 4 },

  bookingDetails: {
    gap: 12,
    marginBottom: 20,
    backgroundColor: "#F8F9FA",
    padding: 15,
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: { fontSize: 13, color: "#666" },
  detailValue: { fontSize: 13, fontWeight: "700", color: "#0056b3" },

  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  priceLabel: { fontSize: 15, fontWeight: "bold", color: "#333" },
  priceValue: { fontSize: 18, fontWeight: "800", color: "#FF3B30" },

  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  paymentOptionActive: { borderColor: "#0056b3", backgroundColor: "#F0F7FF" },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  radioActive: { borderColor: "#0056b3" },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0056b3",
  },
  paymentIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  paymentTexts: { flex: 1 },
  paymentName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  paymentDesc: { fontSize: 11, color: "#666" },

  // Passenger Display Styles
  passengerSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  passengerSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  ageNote: {
    fontSize: 12,
    color: "#666",
    fontWeight: "normal",
    fontStyle: "italic",
  },
  passengerFormRowMobile: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    gap: 8,
  },
  formColHotenMobile: { flex: 2 },
  formColGioitinhMobile: { flex: 1 },
  formColNgaysinhMobile: { flex: 1.5 },
  formLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 4,
  },
  asterisk: { color: "red" },
  formValueText: { fontSize: 14, fontWeight: "600", color: "#333" },
  dateValueWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  infoNotice: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 5,
    marginTop: 10,
  },
  infoNoticeText: { flex: 1, fontSize: 11, color: "#666", lineHeight: 16 },

  bottomBarWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  totalLabel: { fontSize: 13, color: "#666", marginBottom: 2 },
  totalValue: { fontSize: 20, fontWeight: "bold", color: "#FF3B30" },
  confirmBtn: {
    backgroundColor: "#007BFF",
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
  },
  confirmBtnText: { color: "white", fontWeight: "bold", fontSize: 15 },
});
