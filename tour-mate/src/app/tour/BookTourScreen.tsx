import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
  Switch,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import FloatingInput from "@/components/ui/FloatingInput";
import DateTimePicker from "@react-native-community/datetimepicker";
import NotificationModal from "@/components/ui/NotificationModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTourById } from "@/services/tour/tourService";
import { getUserProfile } from "@/services/auth/userService";

import { useAuth } from "@/context/AuthContext";
import BookTourLayout from "@/components/tour/BookTourLayout";

export default function BookTourScreen() {
  const router = useRouter();
  const { id, adults, children } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web" && width > 1024;
  const { user } = useAuth();

  const [tour, setTour] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [adultCount, setAdultCount] = useState(Number(adults) || 1);
  const [childCount, setChildCount] = useState(Number(children) || 0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  // Pre-fill user data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user?.user_name) {
        try {
          const res = await getUserProfile(user.user_name);
          if (res.success && res.data) {
            const profile = res.data;
            if (profile.full_name) setName(profile.full_name);
            if (profile.email) setEmail(profile.email);
            if (profile.phone) setPhone(profile.phone);
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
        }
      }
    };
    loadUserProfile();
  }, [user]);

  const [adultsInfo, setAdultsInfo] = useState<
    { name: string; dob: string; gender: string }[]
  >([]);
  const [childrenInfo, setChildrenInfo] = useState<
    { name: string; dob: string; gender: string }[]
  >([]);

  // Date Picker State
  const [showPicker, setShowPicker] = useState(false);
  const [pickerConfig, setPickerConfig] = useState<{
    type: "adult" | "child";
    index: number;
  } | null>(null);

  // Notification Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    actionText?: string;
    onAction?: () => void;
  }>({
    type: "info",
    title: "",
    message: "",
  });

  const showNotification = (
    type: any,
    title: string,
    message: string,
    actionText?: string,
    onAction?: () => void,
  ) => {
    setModalConfig({ type, title, message, actionText, onAction });
    setModalVisible(true);
  };

  useEffect(() => {
    if (id) {
      loadTour(id as string);
    }
  }, [id]);

  useEffect(() => {
    setAdultsInfo((prev) => {
      const next = [...prev];
      while (next.length < adultCount)
        next.push({ name: "", dob: "", gender: "Nam" });
      return next.slice(0, adultCount);
    });
  }, [adultCount]);

  useEffect(() => {
    setChildrenInfo((prev) => {
      const next = [...prev];
      while (next.length < childCount)
        next.push({ name: "", dob: "", gender: "Nam" });
      return next.slice(0, childCount);
    });
  }, [childCount]);

  const loadTour = async (tourId: string) => {
    try {
      const res = await getTourById(tourId);
      if (res?.data) setTour(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (!tour) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Không tìm thấy tour</Text>
      </View>
    );
  }

  const coverImage =
    tour.images?.find((img: any) => img.img_is_cover)?.tour_img_url ||
    tour.images?.[0]?.tour_img_url;
  const adultPrice = tour.price?.price_adult || 0;
  const childPrice = tour.price?.price_child || 0;
  const totalPrice = adultCount * adultPrice + childCount * childPrice;

  const handleConfirm = () => {
    if (!name || !email || !phone) {
      alert("Vui lòng điền đầy đủ thông tin liên hệ!");
      return;
    }

    const isIncomplete =
      adultsInfo.some((a) => !a.name || !a.dob) ||
      childrenInfo.some((c) => !c.name || !c.dob);
    if (isIncomplete) {
      alert("Vui lòng điền đầy đủ thông tin chi tiết hành khách!");
      return;
    }

    // Prepare data for payment
    const bookingData = {
      tourId: id,
      adultCount,
      childCount,
      name,
      email,
      phone,
      note,
      adultsInfo: JSON.stringify(adultsInfo),
      childrenInfo: JSON.stringify(childrenInfo),
      totalPrice,
    };

    router.push({
      pathname: "/tour/PaymentScreen",
      params: bookingData,
    });
  };

  const handleCancel = () => {
    showNotification(
      "warning",
      "Xác nhận hủy",
      "Bạn có chắc chắn muốn hủy quá trình đặt tour này không?",
      "Đồng ý hủy",
      () => {
        setModalVisible(false);
        router.back();
      },
    );
  };

  const updateAdultInfo = (
    index: number,
    field: keyof (typeof adultsInfo)[0],
    value: any,
  ) => {
    const newInfo = [...adultsInfo];
    newInfo[index] = { ...newInfo[index], [field]: value };
    setAdultsInfo(newInfo);
  };

  const updateChildInfo = (
    index: number,
    field: keyof (typeof childrenInfo)[0],
    value: any,
  ) => {
    const newInfo = [...childrenInfo];
    newInfo[index] = { ...newInfo[index], [field]: value };
    setChildrenInfo(newInfo);
  };

  const openDatePicker = (type: "adult" | "child", index: number) => {
    setPickerConfig({ type, index });
    setShowPicker(true);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate && pickerConfig) {
      const dateString = selectedDate.toLocaleDateString("vi-VN");
      if (pickerConfig.type === "adult") {
        updateAdultInfo(pickerConfig.index, "dob", dateString);
      } else {
        updateChildInfo(pickerConfig.index, "dob", dateString);
      }
    }
    setPickerConfig(null);
  };

  if (isWeb) {
    return (
      <BookTourLayout
        tour={tour}
        coverImage={coverImage}
        adultCount={adultCount}
        setAdultCount={setAdultCount}
        childCount={childCount}
        setChildCount={setChildCount}
        name={name}
        setName={setName}
        email={email}
        setEmail={setEmail}
        phone={phone}
        setPhone={setPhone}
        note={note}
        setNote={setNote}
        adultsInfo={adultsInfo}
        childrenInfo={childrenInfo}
        totalPrice={totalPrice}
        updateAdultInfo={updateAdultInfo}
        updateChildInfo={updateChildInfo}
        handleConfirm={handleConfirm}
        handleCancel={handleCancel}
        modalVisible={modalVisible}
        modalConfig={modalConfig}
        setModalVisible={setModalVisible}
      />
    );
  }

  // Mobile Render
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ĐẶT TOUR</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={{ height: 10 }} />
        <View style={styles.card}>
          <Image source={{ uri: coverImage }} style={styles.tourImage} />
          <View style={styles.tourInfo}>
            <Text style={styles.tourName}>{tour.tour_name}</Text>
            <View style={styles.highlightInfoBox}>
              <View style={styles.highlightItem}>
                <Ionicons name="calendar" size={20} color="#0056b3" />
                <View style={styles.highlightTextCol}>
                  <Text style={styles.highlightLabel}>Ngày khởi hành</Text>
                  <Text style={styles.highlightValue}>
                    {new Date(tour.time?.date_start).toLocaleDateString(
                      "vi-VN",
                    )}
                  </Text>
                </View>
              </View>
              <View style={styles.verticalLine} />
              <View style={styles.highlightItem}>
                <Ionicons name="calendar-outline" size={20} color="#0056b3" />
                <View style={styles.highlightTextCol}>
                  <Text style={styles.highlightLabel}>Ngày kết thúc</Text>
                  <Text style={styles.highlightValue}>
                    {new Date(tour.time?.date_end).toLocaleDateString("vi-VN")}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.tourDetailGrid}>
              <View style={styles.tourDetailItem}>
                <Ionicons name="time-outline" size={15} color="#666" />
                <Text style={styles.tourDetailText} numberOfLines={1}>
                  Thời lượng:{" "}
                  <Text style={styles.tourDetailBold}>
                    {tour.time?.tour_duration} ngày
                  </Text>
                </Text>
              </View>
              <View style={styles.tourDetailItem}>
                <Ionicons name="people-outline" size={15} color="#666" />
                <Text style={styles.tourDetailText} numberOfLines={1}>
                  Tối đa:{" "}
                  <Text style={styles.tourDetailBold}>
                    {tour.price?.tour_capacity} người
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
        <View style={styles.card}>
          <FloatingInput
            label="Họ và tên *"
            value={name}
            onChangeText={setName}
          />
          <FloatingInput
            label="Email *"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <FloatingInput
            label="Số điện thoại *"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <FloatingInput
            label="Ghi chú (Tùy chọn)"
            value={note}
            onChangeText={setNote}
            multiline
            style={{ height: 80, textAlignVertical: "top" }}
          />
        </View>

        <Text style={styles.sectionTitle}>Hành khách</Text>
        <View style={styles.card}>
          <View style={styles.passengerRow}>
            <View>
              <Text style={styles.passengerLabel}>Người lớn</Text>
              <Text style={styles.passengerPrice}>
                {adultPrice.toLocaleString()}đ
              </Text>
            </View>
            <View style={styles.counter}>
              <TouchableOpacity
                onPress={() => setAdultCount(Math.max(1, adultCount - 1))}
                style={styles.counterBtn}
              >
                <Ionicons name="remove" size={20} color="#007BFF" />
              </TouchableOpacity>
              <Text style={styles.counterText}>{adultCount}</Text>
              <TouchableOpacity
                onPress={() => {
                  if (
                    adultCount + childCount <
                    (tour.price?.tour_capacity || 15)
                  ) {
                    setAdultCount(adultCount + 1);
                  }
                }}
                style={[
                  styles.counterBtn,
                  adultCount + childCount >=
                    (tour.price?.tour_capacity || 15) && { opacity: 0.5 },
                  Platform.OS === "web" && ({ outlineStyle: "none" } as any),
                ]}
              >
                <Ionicons name="add" size={20} color="#007BFF" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.passengerRow}>
            <View>
              <Text style={styles.passengerLabel}>Trẻ em</Text>
              <Text style={styles.passengerPrice}>
                {childPrice.toLocaleString()}đ
              </Text>
            </View>
            <View style={styles.counter}>
              <TouchableOpacity
                onPress={() => setChildCount(Math.max(0, childCount - 1))}
                style={[
                  styles.counterBtn,
                  Platform.OS === "web" && ({ outlineStyle: "none" } as any),
                ]}
              >
                <Ionicons name="remove" size={20} color="#007BFF" />
              </TouchableOpacity>
              <Text style={styles.counterText}>{childCount}</Text>
              <TouchableOpacity
                onPress={() => {
                  if (
                    adultCount + childCount <
                    (tour.price?.tour_capacity || 15)
                  ) {
                    setChildCount(childCount + 1);
                  }
                }}
                style={[
                  styles.counterBtn,
                  adultCount + childCount >=
                    (tour.price?.tour_capacity || 15) && { opacity: 0.5 },
                ]}
              >
                <Ionicons name="add" size={20} color="#007BFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {adultsInfo.length > 0 && (
          <View style={styles.card}>
            <View style={styles.passengerSectionHeader}>
              <Ionicons name="people-outline" size={24} color="#333" />
              <Text style={styles.passengerSectionTitle}>Người lớn</Text>
            </View>

            {adultsInfo.map((adult, index) => (
              <View
                key={`adult-${index}`}
                style={styles.passengerFormRowMobile}
              >
                <View style={styles.formColHotenMobile}>
                  <Text style={styles.formLabel}>
                    Họ tên: <Text style={styles.asterisk}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Liên hệ"
                    placeholderTextColor="#999"
                    value={adult.name}
                    onChangeText={(text) =>
                      updateAdultInfo(index, "name", text)
                    }
                  />
                </View>

                <View style={styles.formColGioitinhMobile}>
                    <Text style={styles.formLabel}>
                      Giới tính:<Text style={styles.asterisk}>*</Text>
                    </Text>
                    <TouchableOpacity
                      style={styles.formInputDropdown}
                      onPress={() =>
                        updateAdultInfo(
                          index,
                          "gender",
                          adult.gender === "Nam" ? "Nữ" : "Nam",
                        )
                      }
                    >
                      <Text style={styles.formInputText}>{adult.gender}</Text>
                      <Ionicons name="chevron-down" size={16} color="#333" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.formColNgaysinhMobile}>
                    <Text style={styles.formLabel}>
                      Ngày sinh: <Text style={styles.asterisk}>*</Text>
                    </Text>
                    <View style={styles.dateInputWrapper}>
                      {Platform.OS === "web" ? (
                        <input
                          type="date"
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            opacity: 0,
                            cursor: "pointer",
                            zIndex: 1,
                            border: "none",
                          }}
                          value={
                            adult.dob
                              ? adult.dob.split("/").reverse().join("-")
                              : ""
                          }
                          onChange={(e: any) => {
                            const val = e.target.value;
                            if (val) {
                              const [y, m, d] = val.split("-");
                              updateAdultInfo(index, "dob", `${d}/${m}/${y}`);
                            }
                          }}
                        />
                      ) : (
                        <TouchableOpacity
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            zIndex: 1,
                          }}
                          onPress={() => openDatePicker("adult", index)}
                        />
                      )}
                      <Text
                        style={[
                          styles.formInputDate,
                          !adult.dob && { color: "#999" },
                        ]}
                      >
                        {adult.dob || "-- / -- / ----"}
                      </Text>
                      <Ionicons
                        name="calendar-outline"
                        size={18}
                        color="#666"
                      />
                    </View>
                  </View>
              </View>
            ))}
          </View>
        )}

        {childrenInfo.length > 0 && (
          <View style={styles.card}>
            <View style={styles.passengerSectionHeader}>
              <Ionicons name="people-outline" size={24} color="#333" />
              <Text style={styles.passengerSectionTitle}>Trẻ em</Text>
            </View>

            {childrenInfo.map((child, index) => (
              <View
                key={`child-${index}`}
                style={styles.passengerFormRowMobile}
              >
                <View style={styles.formColHotenMobile}>
                  <Text style={styles.formLabel}>
                    Họ tên: <Text style={styles.asterisk}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Liên hệ"
                    placeholderTextColor="#999"
                    value={child.name}
                    onChangeText={(text) =>
                      updateChildInfo(index, "name", text)
                    }
                  />
                </View>

                <View style={styles.formColGioitinhMobile}>
                    <Text style={styles.formLabel}>
                      Giới tính:<Text style={styles.asterisk}>*</Text>
                    </Text>
                    <TouchableOpacity
                      style={styles.formInputDropdown}
                      onPress={() =>
                        updateChildInfo(
                          index,
                          "gender",
                          child.gender === "Nam" ? "Nữ" : "Nam",
                        )
                      }
                    >
                      <Text style={styles.formInputText}>{child.gender}</Text>
                      <Ionicons name="chevron-down" size={16} color="#333" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.formColNgaysinhMobile}>
                    <Text style={styles.formLabel}>
                      Ngày sinh: <Text style={styles.asterisk}>*</Text>
                    </Text>
                    <View style={styles.dateInputWrapper}>
                      {Platform.OS === "web" ? (
                        <input
                          type="date"
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            opacity: 0,
                            cursor: "pointer",
                            zIndex: 1,
                            border: "none",
                          }}
                          value={
                            child.dob
                              ? child.dob.split("/").reverse().join("-")
                              : ""
                          }
                          onChange={(e: any) => {
                            const val = e.target.value;
                            if (val) {
                              const [y, m, d] = val.split("-");
                              updateChildInfo(index, "dob", `${d}/${m}/${y}`);
                            }
                          }}
                        />
                      ) : (
                        <TouchableOpacity
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            zIndex: 1,
                          }}
                          onPress={() => openDatePicker("child", index)}
                        />
                      )}
                      <Text
                        style={[
                          styles.formInputDate,
                          !child.dob && { color: "#999" },
                        ]}
                      >
                        {child.dob || "-- / -- / ----"}
                      </Text>
                      <Ionicons
                        name="calendar-outline"
                        size={18}
                        color="#666"
                      />
                    </View>
                  </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {showPicker && Platform.OS !== "web" && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* Bottom Bar - Ensuring it is on top and has enough space */}
      <View style={styles.bottomBarWrapper}>
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
        >
          <View>
            <Text style={styles.totalLabel}>Tổng tiền</Text>
            <Text style={styles.totalValue}>
              {totalPrice.toLocaleString()}đ
            </Text>
          </View>
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmBtnText}>Xác nhận đặt</Text>
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
    marginBottom: 20,
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
  stepText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#999",
    textAlign: "center",
  },
  stepTextActive: { color: "#0056b3" },
  stepArrow: { marginTop: -15 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    marginTop: 10,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tourImage: { width: "100%", height: 150, borderRadius: 12, marginBottom: 15 },
  tourInfo: { gap: 8, marginBottom: 12 },
  tourName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    lineHeight: 24,
    marginBottom: 8,
  },
  highlightInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  highlightItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  highlightTextCol: {
    flexDirection: "column",
  },
  highlightLabel: {
    fontSize: 10,
    color: "#666",
    marginBottom: 2,
  },
  highlightValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#111",
  },
  verticalLine: {
    width: 1,
    height: 24,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 4,
  },
  tourDetailGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  tourDetailItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tourDetailText: { fontSize: 11, color: "#666", flex: 1 },
  tourDetailBold: { fontWeight: "700", color: "#333" },
  passengerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  passengerLabel: { fontSize: 15, fontWeight: "600", color: "#333" },
  passengerPrice: {
    fontSize: 13,
    color: "#007BFF",
    fontWeight: "bold",
    marginTop: 4,
  },
  counter: { flexDirection: "row", alignItems: "center", gap: 15 },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
  },
  counterText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    width: 20,
    textAlign: "center",
  },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginVertical: 5 },

  // Custom Form Styles (Mobile)
  passengerSectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 15,
    marginTop: 5,
  },
  passengerSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
    lineHeight: 22,
  },
  passengerSectionSubtitle: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    marginLeft: 5,
    lineHeight: 20,
  },

  passengerFormRowMobile: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    gap: 8,
  },
  formColHotenMobile: {
    flex: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingBottom: 4,
  },
  mobileGrid2Col: { flexDirection: "row", gap: 12 },
  formColGioitinhMobile: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingBottom: 4,
  },
  formColNgaysinhMobile: {
    flex: 1.5,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingBottom: 4,
  },

  formLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 4,
  },
  asterisk: { color: "red" },
  formInput: {
    fontSize: 15,
    color: "#333",
    padding: 0,
    height: 24,
    ...Platform.select({ web: { outlineStyle: "none" } as any }),
  },
  formInputDropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 24,
    ...Platform.select({ web: { outlineStyle: "none" } as any }),
  },
  formInputText: { fontSize: 15, color: "#333" },
  dateInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 24,
    ...Platform.select({ web: { outlineStyle: "none" } as any }),
  },
  formInputDate: {
    fontSize: 15,
    color: "#333",
    flex: 1,
    padding: 0,
    ...Platform.select({ web: { outlineStyle: "none" } as any }),
  },

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
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  confirmBtnText: { color: "white", fontWeight: "bold", fontSize: 15 },
});
