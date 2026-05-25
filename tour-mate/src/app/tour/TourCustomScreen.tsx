import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  Modal,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function TourCustomScreen() {
  const router = useRouter();
  const { data } = useLocalSearchParams();
  
  let parsedData: any = null;
  if (data && typeof data === 'string') {
    try {
      parsedData = JSON.parse(data);
    } catch (e) {}
  }

  // Editable states
  const [tourName, setTourName] = useState(parsedData?.title || "Bản Thiết Kế Tour");
  const [tourType, setTourType] = useState("Nội địa");
  const [days, setDays] = useState<any[]>(parsedData?.days || []);

  const tourPrice = parsedData?.price || "15000000";

  // Date States
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const [departureDate, setDepartureDate] = useState(todayStr);
  const [showDepPicker, setShowDepPicker] = useState(false);

  // Modal States for Add/Edit Activity
  const [actModalVisible, setActModalVisible] = useState(false);
  const [activeDayIdx, setActiveDayIdx] = useState<number | null>(null);
  const [activeActIdx, setActiveActIdx] = useState<number | null>(null); // null if adding
  const [inputName, setInputName] = useState("");
  const [inputTime, setInputTime] = useState("");
  const [inputLocation, setInputLocation] = useState("");

  // Helper: Add days to date
  const addDays = (dateStr: string, durationDays: number) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    date.setDate(date.getDate() + durationDays);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Helper: Format date for display (dd/mm/yyyy)
  const formatDateVN = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length < 3) return dateStr;
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
  };

  const duration = days.length || 1;
  const returnDate = addDays(departureDate, duration);

  const cleanPriceStr = typeof tourPrice === 'string' ? tourPrice.replace(/[^\d]/g, "") : String(tourPrice);
  const cleanPrice = Number(cleanPriceStr) || 1200000;

  const handleContinue = () => {
    router.push({
      pathname: "/tour/BookTourScreen",
      params: {
        isCustom: "true",
        title: tourName,
        price: cleanPrice.toString(),
        days: JSON.stringify(days),
        date_start: departureDate,
        date_end: returnDate,
        tour_type: tourType,
      }
    });
  };

  const handleDateChangeNative = (event: any, selectedDate?: Date) => {
    setShowDepPicker(false);
    if (selectedDate) {
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const d = String(selectedDate.getDate()).padStart(2, '0');
      setDepartureDate(`${y}-${m}-${d}`);
    }
  };

  // Action: Add new Day
  const handleAddDay = () => {
    const nextDayNum = days.length + 1;
    const newDay = {
      day: nextDayNum,
      activities: [
        {
          name: "Ăn sáng và chuẩn bị khởi hành",
          time: "09:00",
          location: "Khách sạn trung tâm thành phố",
        }
      ]
    };
    setDays([...days, newDay]);
  };

  // Action: Delete Day
  const handleDeleteDay = (dayIdx: number) => {
    const updated = days.filter((_: any, idx: number) => idx !== dayIdx).map((d: any, idx: number) => ({
      ...d,
      day: idx + 1
    }));
    setDays(updated);
  };

  // Action: Open Activity Modal (Add or Edit)
  const openActivityModal = (dayIdx: number, actIdx: number | null = null) => {
    setActiveDayIdx(dayIdx);
    setActiveActIdx(actIdx);
    if (actIdx !== null) {
      const act = days[dayIdx].activities[actIdx];
      setInputName(act.name || "");
      setInputTime(act.time || "09:00");
      setInputLocation(act.location || "");
    } else {
      setInputName("");
      setInputTime("09:00");
      setInputLocation("");
    }
    setActModalVisible(true);
  };

  // Action: Save Activity (Add or Edit)
  const saveActivity = () => {
    if (activeDayIdx === null) return;
    
    const updated = [...days];
    const newAct = {
      name: inputName || "Hoạt động du lịch mới",
      time: inputTime || "09:00",
      location: inputLocation || "Địa điểm chưa cập nhật",
    };

    if (activeActIdx !== null) {
      // Edit
      updated[activeDayIdx].activities[activeActIdx] = newAct;
    } else {
      // Add
      updated[activeDayIdx].activities.push(newAct);
    }

    setDays(updated);
    setActModalVisible(false);
    setActiveDayIdx(null);
    setActiveActIdx(null);
  };

  // Action: Delete Activity
  const handleDeleteActivity = (dayIdx: number, actIdx: number) => {
    const updated = [...days];
    updated[dayIdx].activities = updated[dayIdx].activities.filter((_: any, idx: number) => idx !== actIdx);
    setDays(updated);
  };

  return (
    <SafeAreaView style={styles.container as ViewStyle}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={24} color="#64748b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Thiết Kế Lịch Trình</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Tab - Domestic vs International */}
        <View style={styles.stepContainer}>
          <View style={styles.stepWrapper}>
            {["Nội địa", "Quốc tế"].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setTourType(tab)}
                style={[
                  styles.stepTab,
                  tourType === tab && styles.stepTabActive
                ]}
              >
                <Text
                  style={[
                    styles.stepTabText,
                    tourType === tab && styles.stepTabTextActive
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* Tour Name Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleSmall}>Tên Tour Du Lịch</Text>
          <TextInput
            style={styles.nameInput}
            value={tourName}
            onChangeText={setTourName}
            placeholder="Nhập tên tour du lịch của bạn..."
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* Date Selection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleSmall}>Chọn thời gian đi</Text>
          <View style={styles.dateGrid}>
            <View style={styles.dateCol}>
              <Text style={styles.dateLabel}>Ngày đi</Text>
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
                    value={departureDate}
                    onChange={(e: any) => setDepartureDate(e.target.value)}
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
                    onPress={() => setShowDepPicker(true)}
                  />
                )}
                <Text style={styles.dateText}>
                  {departureDate ? formatDateVN(departureDate) : "Chọn ngày"}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#137fec" />
              </View>
            </View>

            <View style={styles.dateCol}>
              <Text style={styles.dateLabel}>Ngày về</Text>
              <View style={[styles.dateInputWrapper, { backgroundColor: "#f1f5f9" }]}>
                <Text style={[styles.dateText, { color: "#64748b" }]}>
                  {returnDate ? formatDateVN(returnDate) : "Tự động tính"}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#94a3b8" />
              </View>
            </View>
          </View>
        </View>

        {/* Itinerary Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitleSmall}>Lộ trình của bạn</Text>
            <TouchableOpacity style={styles.addDayBtnHeader} onPress={handleAddDay}>
              <Ionicons name="add" size={18} color="#137fec" />
              <Text style={styles.addDayTextHeader}>Thêm ngày</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timelineContainer}>
            <View style={styles.timelineLine} />
            
            {days.length > 0 ? (
              days.map((dayObj: any, dayIdx: number) => (
                <View key={dayIdx} style={{ marginBottom: 24 }}>
                  <View style={styles.dayHeaderRow}>
                    <Text style={styles.dayHeaderText}>
                      Ngày {dayObj.day}
                    </Text>
                    <View style={styles.dayActions}>
                      <TouchableOpacity 
                        style={[styles.dayActionBtn, styles.addActBtn]} 
                        onPress={() => openActivityModal(dayIdx, null)}
                      >
                        <Ionicons name="add-circle-outline" size={14} color="#137fec" />
                        <Text style={styles.dayActionTextActive}>Hoạt động</Text>
                      </TouchableOpacity>
                      {days.length > 1 && (
                        <TouchableOpacity 
                          style={[styles.dayActionBtn, styles.deleteDayBtn]} 
                          onPress={() => handleDeleteDay(dayIdx)}
                        >
                          <Ionicons name="trash-outline" size={14} color="#ef4444" />
                          <Text style={styles.dayActionTextDelete}>Xóa ngày</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {dayObj.activities && dayObj.activities.length > 0 ? (
                    dayObj.activities.map((act: any, actIdx: number) => (
                      <View key={actIdx} style={styles.timelineItem}>
                        <View style={actIdx === 0 ? styles.timelineDotActive : styles.timelineDotInactive} />
                        <View style={styles.timelineCard}>
                          <View style={styles.timelineCardContent}>
                            <View style={{ flex: 1, paddingRight: 8 }}>
                              <Text style={styles.timelinePointTitle}>{act.name}</Text>
                              <Text style={styles.timelinePointSub}>{act.time} • {act.location}</Text>
                            </View>
                            <View style={styles.actButtons}>
                              <TouchableOpacity 
                                style={styles.actActionBtn} 
                                onPress={() => openActivityModal(dayIdx, actIdx)}
                              >
                                <Ionicons name="pencil-outline" size={16} color="#64748b" />
                              </TouchableOpacity>
                              <TouchableOpacity 
                                style={styles.actActionBtn} 
                                onPress={() => handleDeleteActivity(dayIdx, actIdx)}
                              >
                                <Ionicons name="trash-outline" size={16} color="#ef4444" />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View style={styles.timelineItem}>
                      <View style={styles.timelineDotInactive} />
                      <View style={styles.timelineCard}>
                        <View style={styles.timelineCardContent}>
                          <View>
                            <Text style={[styles.timelinePointTitle, { color: "#64748b", fontStyle: "italic" }]}>
                              Chưa có hoạt động nào
                            </Text>
                            <Text style={styles.timelinePointSub}>
                              Bấm "Hoạt động" ở trên để thêm.
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.timelineItem}>
                <View style={styles.timelineDotInactive} />
                <View style={styles.timelineCard}>
                  <View style={styles.timelineCardContent}>
                    <View>
                      <Text style={styles.timelinePointTitle}>Chưa có dữ liệu</Text>
                      <Text style={styles.timelinePointSub}>Hãy thêm ngày mới để bắt đầu thiết kế</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Add day button at the bottom */}
            <TouchableOpacity style={styles.addDayBtnBig} onPress={handleAddDay}>
              <Ionicons name="add-circle-outline" size={22} color="#137fec" />
              <Text style={styles.addDayBtnText}>Thêm ngày du lịch tiếp theo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Date Picker for Mobile */}
      {showDepPicker && Platform.OS !== "web" && (
        <DateTimePicker
          value={new Date(departureDate)}
          mode="date"
          display="default"
          onChange={handleDateChangeNative}
          minimumDate={today}
        />
      )}

      {/* Activity Add/Edit Modal */}
      <Modal
        visible={actModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {activeActIdx !== null ? "Sửa Hoạt Động" : "Thêm Hoạt Động Mới"}
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tên hoạt động / Trải nghiệm</Text>
              <TextInput
                style={styles.modalInput}
                value={inputName}
                onChangeText={setInputName}
                placeholder="Ví dụ: Ăn trưa tại nhà hàng đặc sản địa phương..."
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Thời gian</Text>
              <TextInput
                style={styles.modalInput}
                value={inputTime}
                onChangeText={setInputTime}
                placeholder="Ví dụ: 12:00 hoặc 12:00 - 14:00"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Địa điểm chính xác</Text>
              <TextInput
                style={styles.modalInput}
                value={inputLocation}
                onChangeText={setInputLocation}
                placeholder="Ví dụ: Chợ Bến Thành, Quận 1, TP. HCM..."
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setActModalVisible(false)}
              >
                <Text style={{ color: "#64748b", fontWeight: "600" }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnSave]}
                onPress={saveActivity}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarContent}>
          <TouchableOpacity style={styles.reviewBtn} onPress={handleContinue}>
            <Text style={styles.reviewBtnText}>Tiếp tục</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f7f8" },
  header: { backgroundColor: "rgba(246, 247, 248, 0.95)", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, height: 60 },
  closeBtn: { padding: 8, marginLeft: -8, borderRadius: 20 },
  headerTitle: { fontSize: 18, fontWeight: "bold", flex: 1, textAlign: "center" },
  
  stepContainer: { paddingHorizontal: 16, paddingBottom: 12 },
  stepWrapper: { flexDirection: "row", backgroundColor: "#e2e8f0", padding: 4, borderRadius: 10, height: 44 },
  stepTab: { flex: 1, justifyContent: "center", alignItems: "center", borderRadius: 8 },
  stepTabActive: { backgroundColor: "#fff", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  stepTabText: { fontSize: 13, fontWeight: "600", color: "#64748b" },
  stepTabTextActive: { color: "#137fec" },

  content: { flex: 1 },
  section: { padding: 16, gap: 12 },
  sectionTitleSmall: { fontSize: 16, fontWeight: "bold", color: "#0f172a", marginBottom: 4 },
  
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  
  nameInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    fontSize: 15,
    color: "#0f172a",
    fontWeight: "500",
  },

  // Date picker styles
  dateGrid: { flexDirection: "row", gap: 16 },
  dateCol: { flex: 1 },
  dateLabel: { fontSize: 13, fontWeight: "600", color: "#64748b", marginBottom: 6 },
  dateInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    position: "relative"
  },
  dateText: { fontSize: 14, fontWeight: "500", color: "#0f172a" },

  // Timeline & Day layouts
  addDayBtnHeader: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#f0f7ff", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: "#137fec" },
  addDayTextHeader: { color: "#137fec", fontSize: 13, fontWeight: "600" },

  dayHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingLeft: 4, marginBottom: 12, marginTop: 4 },
  dayHeaderText: { fontSize: 16, fontWeight: "bold", color: "#0f172a" },
  dayActions: { flexDirection: "row", gap: 8 },
  dayActionBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  addActBtn: { borderColor: "#137fec", backgroundColor: "#f0f7ff" },
  dayActionTextActive: { color: "#137fec", fontSize: 12, fontWeight: "600" },
  deleteDayBtn: { borderColor: "#ef4444", backgroundColor: "#fef2f2" },
  dayActionTextDelete: { color: "#ef4444", fontSize: 12, fontWeight: "600" },

  timelineContainer: { marginLeft: 8, paddingLeft: 16, borderLeftWidth: 2, borderLeftColor: "#e2e8f0", paddingVertical: 4, position: "relative" },
  timelineLine: { position: "absolute", left: -2, top: 0, bottom: 0, width: 2, backgroundColor: "#e2e8f0" },
  timelineItem: { marginBottom: 16, position: "relative" },
  timelineDotActive: { position: "absolute", left: -22, top: 20, width: 12, height: 12, borderRadius: 6, backgroundColor: "#137fec", borderWidth: 3, borderColor: "#fff" },
  timelineDotInactive: { position: "absolute", left: -22, top: 20, width: 12, height: 12, borderRadius: 6, backgroundColor: "#cbd5e1", borderWidth: 3, borderColor: "#fff" },
  
  timelineCard: { backgroundColor: "#fff", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#e2e8f0", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, elevation: 1 },
  timelineCardContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  timelinePointTitle: { fontSize: 15, fontWeight: "bold", color: "#0f172a" },
  timelinePointSub: { fontSize: 12, color: "#64748b", marginTop: 2 },
  
  actButtons: { flexDirection: "row", gap: 6 },
  actActionBtn: { padding: 6, borderRadius: 8, backgroundColor: "#f1f5f9" },

  addDayBtnBig: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#137fec",
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#fff",
    marginTop: 8,
    marginBottom: 16
  },
  addDayBtnText: { color: "#137fec", fontWeight: "bold", fontSize: 15 },

  // Modal styles
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: "#fff", borderRadius: 20, padding: 20, width: "90%", maxWidth: 400, gap: 16 },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#0f172a", marginBottom: 4 },
  formGroup: { gap: 6 },
  formLabel: { fontSize: 13, fontWeight: "600", color: "#64748b" },
  modalInput: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 10, paddingHorizontal: 12, height: 44, fontSize: 14, color: "#0f172a" },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 12 },
  modalBtn: { flex: 1, height: 44, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  modalBtnCancel: { backgroundColor: "#f1f5f9" },
  modalBtnSave: { backgroundColor: "#137fec" },

  bottomBar: { 
    position: "absolute", 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: "#fff", 
    borderTopWidth: 1, 
    borderTopColor: "#e2e8f0", 
    padding: 16, 
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10
  },
  bottomBarContent: { flexDirection: "row", alignItems: "center", gap: 16, maxWidth: 500, alignSelf: "center", width: "100%" },
  reviewBtn: { 
    flex: 1, 
    backgroundColor: "#137fec", 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    gap: 8, 
    borderRadius: 14, 
    height: 52,
    shadowColor: "#137fec",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  reviewBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
