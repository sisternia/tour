import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Switch, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import NavigationBar from "@/components/ui/NavigationBar";
import FloatingInput from "@/components/ui/FloatingInput";
import NotificationModal from "@/components/ui/NotificationModal";
import BookingSteps from "@/components/ui/BookingSteps";

interface BookTourLayoutProps {
  tour: any;
  coverImage: string;
  adultCount: number; setAdultCount: (v: number) => void;
  childCount: number; setChildCount: (v: number) => void;
  name: string; setName: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  note: string; setNote: (v: string) => void;
  adultsInfo: { name: string, dob: string, gender: string }[];
  childrenInfo: { name: string, dob: string, gender: string }[];
  totalPrice: number;
  updateAdultInfo: (index: number, field: any, value: any) => void;
  updateChildInfo: (index: number, field: any, value: any) => void;
  handleConfirm: () => void;
  handleCancel: () => void;
  modalVisible: boolean;
  modalConfig: any;
  setModalVisible: (v: boolean) => void;
}

export default function BookTourLayout({
  tour, coverImage, adultCount, setAdultCount, childCount, setChildCount,
  name, setName, email, setEmail, phone, setPhone, note, setNote,
  adultsInfo, childrenInfo, totalPrice,
  updateAdultInfo, updateChildInfo, handleConfirm, handleCancel,
  modalVisible, modalConfig, setModalVisible
}: BookTourLayoutProps) {
  const router = useRouter();
  const adultPrice = tour.price?.price_adult || 0;
  const childPrice = tour.price?.price_child || 0;

  return (
    <View style={styles.container}>
      <NavigationBar />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.webContent}>
          <BookingSteps isWeb title="ĐẶT TOUR" currentStep={1} />

          <View style={styles.grid}>
            {/* Left Column: Form */}
            <View style={styles.leftColumn}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Thông tin liên hệ</Text>
                <div style={styles.webGrid}>
                  <div style={styles.webCol}>
                    <FloatingInput label="Họ và tên *" value={name} onChangeText={setName} />
                  </div>
                  <div style={styles.webCol}>
                    <FloatingInput label="Số điện thoại *" value={phone} onChangeText={setPhone} />
                  </div>
                  <div style={{ ...styles.webCol, gridColumn: 'span 2' } as any}>
                    <FloatingInput label="Email *" value={email} onChangeText={setEmail} />
                  </div>
                  <div style={{ ...styles.webCol, gridColumn: 'span 2' } as any}>
                    <FloatingInput label="Ghi chú thêm" value={note} onChangeText={setNote} multiline style={{ height: 80, textAlignVertical: 'top' }} />
                  </div>
                </div>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Hành khách</Text>
                <View style={styles.passengerRow}>
                  <View>
                    <Text style={styles.passengerLabel}>Người lớn</Text>
                    <Text style={styles.passengerPrice}>{adultPrice.toLocaleString()}đ</Text>
                  </View>
                  <View style={styles.counter}>
                    <TouchableOpacity onPress={() => setAdultCount(Math.max(1, adultCount - 1))} style={styles.counterBtn}>
                      <Ionicons name="remove" size={20} color="#007BFF" />
                    </TouchableOpacity>
                    <Text style={styles.counterText}>{adultCount}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        if (adultCount + childCount < tour.price?.tour_capacity) {
                          setAdultCount(adultCount + 1);
                        }
                      }}
                      style={[styles.counterBtn, (adultCount + childCount >= tour.price?.tour_capacity) && { opacity: 0.5 }]}
                    >
                      <Ionicons name="add" size={20} color="#007BFF" />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.passengerRow}>
                  <View>
                    <Text style={styles.passengerLabel}>Trẻ em (2-11 tuổi)</Text>
                    <Text style={styles.passengerPrice}>{childPrice.toLocaleString()}đ</Text>
                  </View>
                  <View style={styles.counter}>
                    <TouchableOpacity onPress={() => setChildCount(Math.max(0, childCount - 1))} style={styles.counterBtn}>
                      <Ionicons name="remove" size={20} color="#007BFF" />
                    </TouchableOpacity>
                    <Text style={styles.counterText}>{childCount}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        if (adultCount + childCount < tour.price?.tour_capacity) {
                          setChildCount(childCount + 1);
                        }
                      }}
                      style={[styles.counterBtn, (adultCount + childCount >= tour.price?.tour_capacity) && { opacity: 0.5 }]}
                    >
                      <Ionicons name="add" size={20} color="#007BFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {adultsInfo.length > 0 && (
                <View style={styles.card}>
                  <View style={styles.passengerSectionHeader}>
                    <Ionicons name="people-outline" size={26} color="#333" />
                    <Text style={styles.passengerSectionTitle}>Người lớn</Text>
                  </View>

                  {adultsInfo.map((adult, index) => (
                    <View key={`adult-${index}`} style={styles.passengerFormRowWeb}>
                      <View style={styles.formColHoten}>
                        <Text style={styles.formLabel}>Họ tên: <Text style={styles.asterisk}>*</Text></Text>
                        <TextInput
                          style={styles.formInput}
                          placeholder="Liên hệ"
                          placeholderTextColor="#aaa"
                          value={adult.name}
                          onChangeText={(text) => updateAdultInfo(index, 'name', text)}
                        />
                      </View>

                      <View style={styles.verticalDivider} />

                      <View style={styles.formColGioitinh}>
                        <Text style={styles.formLabel}>Giới tính:<Text style={styles.asterisk}>*</Text></Text>
                        <TouchableOpacity
                          style={styles.formInputDropdown}
                          onPress={() => updateAdultInfo(index, 'gender', adult.gender === 'Nam' ? 'Nữ' : 'Nam')}
                        >
                          <Text style={styles.formInputText}>{adult.gender}</Text>
                          <Ionicons name="chevron-down" size={16} color="#333" />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.verticalDivider} />

                      <View style={styles.formColNgaysinh}>
                        <Text style={styles.formLabel}>Ngày sinh: <Text style={styles.asterisk}>*</Text></Text>
                        <View style={styles.dateInputWrapper}>
                          <input
                            type="date"
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              opacity: 0,
                              cursor: 'pointer',
                              zIndex: 1
                            }}
                            value={adult.dob ? adult.dob.split('/').reverse().join('-') : ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val) {
                                const [y, m, d] = val.split('-');
                                updateAdultInfo(index, 'dob', `${d}/${m}/${y}`);
                              }
                            }}
                          />
                          <Text style={[styles.formInputDate, !adult.dob && { color: '#aaa' }]}>
                            {adult.dob || "-- / -- / ----"}
                          </Text>
                          <Ionicons name="calendar-outline" size={18} color="#666" />
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {childrenInfo.length > 0 && (
                <View style={styles.card}>
                  <View style={styles.passengerSectionHeader}>
                    <Ionicons name="people-outline" size={26} color="#333" />
                    <Text style={styles.passengerSectionTitle}>Trẻ em</Text>
                  </View>

                  {childrenInfo.map((child, index) => (
                    <View key={`child-${index}`} style={styles.passengerFormRowWeb}>
                      <View style={styles.formColHoten}>
                        <Text style={styles.formLabel}>Họ tên: <Text style={styles.asterisk}>*</Text></Text>
                        <TextInput
                          style={styles.formInput}
                          placeholder="Liên hệ"
                          placeholderTextColor="#aaa"
                          value={child.name}
                          onChangeText={(text) => updateChildInfo(index, 'name', text)}
                        />
                      </View>

                      <View style={styles.verticalDivider} />

                      <View style={styles.formColGioitinh}>
                        <Text style={styles.formLabel}>Giới tính:<Text style={styles.asterisk}>*</Text></Text>
                        <TouchableOpacity
                          style={styles.formInputDropdown}
                          onPress={() => updateChildInfo(index, 'gender', child.gender === 'Nam' ? 'Nữ' : 'Nam')}
                        >
                          <Text style={styles.formInputText}>{child.gender}</Text>
                          <Ionicons name="chevron-down" size={16} color="#333" />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.verticalDivider} />

                      <View style={styles.formColNgaysinh}>
                        <Text style={styles.formLabel}>Ngày sinh: <Text style={styles.asterisk}>*</Text></Text>
                        <View style={styles.dateInputWrapper}>
                          <input
                            type="date"
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              opacity: 0,
                              cursor: 'pointer',
                              zIndex: 1
                            }}
                            value={child.dob ? child.dob.split('/').reverse().join('-') : ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val) {
                                const [y, m, d] = val.split('-');
                                updateChildInfo(index, 'dob', `${d}/${m}/${y}`);
                              }
                            }}
                          />
                          <Text style={[styles.formInputDate, !child.dob && { color: '#aaa' }]}>
                            {child.dob || "-- / -- / ----"}
                          </Text>
                          <Ionicons name="calendar-outline" size={18} color="#666" />
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Right Column: Order Summary */}
            <View style={styles.rightColumn}>
              <View style={[styles.card, styles.stickyCard]}>
                <Text style={[styles.cardTitle, { textAlign: 'center' }]}>Tóm tắt đơn hàng</Text>
                <Image source={{ uri: coverImage }} style={styles.tourImage} />
                <Text style={styles.tourName}>{tour.tour_name}</Text>

                <View style={styles.highlightInfoBox}>
                  <View style={styles.highlightItem}>
                    <Ionicons name="calendar" size={24} color="#0056b3" />
                    <View style={styles.highlightTextCol}>
                      <Text style={styles.highlightLabel}>Ngày khởi hành</Text>
                      <Text style={styles.highlightValue}>{new Date(tour.time?.date_start).toLocaleDateString('vi-VN')}</Text>
                    </View>
                  </View>
                  <View style={styles.verticalLine} />
                  <View style={styles.highlightItem}>
                    <Ionicons name="calendar-outline" size={24} color="#0056b3" />
                    <View style={styles.highlightTextCol}>
                      <Text style={styles.highlightLabel}>Ngày kết thúc</Text>
                      <Text style={styles.highlightValue}>{new Date(tour.time?.date_end).toLocaleDateString('vi-VN')}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.summaryGrid}>
                  <View style={styles.summaryItemHalf}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.summaryText} numberOfLines={1}>
                      Thời lượng: <Text style={styles.summaryBoldText}>{tour.time?.tour_duration} ngày</Text>
                    </Text>
                  </View>
                  <View style={styles.summaryItemHalf}>
                    <Ionicons name="people-outline" size={16} color="#666" />
                    <Text style={styles.summaryText} numberOfLines={1}>
                      Tối đa: <Text style={styles.summaryBoldText}>{tour.price?.tour_capacity} người</Text>
                    </Text>
                  </View>
                </View>

                <View style={[styles.divider, { marginVertical: 20 }]} />

                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Người lớn (x{adultCount})</Text>
                  <Text style={styles.priceValue}>{(adultCount * adultPrice).toLocaleString()}đ</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Trẻ em (x{childCount})</Text>
                  <Text style={styles.priceValue}>{(childCount * childPrice).toLocaleString()}đ</Text>
                </View>



                <View style={[styles.divider, { marginVertical: 20 }]} />

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Tổng tiền</Text>
                  <Text style={styles.totalValue}>{totalPrice.toLocaleString()}đ</Text>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.cancelBtn} 
                    onPress={handleCancel}
                  >
                    <Text style={styles.cancelBtnText}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.confirmBtn} 
                    onPress={handleConfirm}
                  >
                    <Text style={styles.confirmBtnText}>Thanh toán</Text>
                  </TouchableOpacity>
                </View>

                <NotificationModal
                  visible={modalVisible}
                  {...modalConfig}
                  onClose={() => setModalVisible(false)}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  webContent: { maxWidth: 1200, alignSelf: "center", width: "100%", padding: 40, paddingTop: 112 },
  pageTitle: { fontSize: 32, fontWeight: "bold", color: "#333", marginBottom: 30 },
  grid: { flexDirection: "row", gap: 40 },
  leftColumn: { flex: 2 },
  rightColumn: { flex: 1 },
  card: { backgroundColor: "white", borderRadius: 16, padding: 30, marginBottom: 30, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 5 },
  stickyCard: { position: "sticky" as any, top: 40, maxHeight: 'calc(100vh - 80px)' as any, overflowY: 'auto' as any },
  cardTitle: { fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 20 },
  webGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' } as any,
  webCol: { display: 'flex', flexDirection: 'column' } as any,
  passengerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 15 },
  passengerLabel: { fontSize: 16, fontWeight: "600", color: "#333" },
  passengerPrice: { fontSize: 14, color: "#007BFF", fontWeight: "bold", marginTop: 4 },
  counter: { flexDirection: "row", alignItems: "center", gap: 15 },
  counterBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F0F7FF", justifyContent: "center", alignItems: "center" },
  counterText: { fontSize: 16, fontWeight: "bold", color: "#333", width: 30, textAlign: "center" },
  divider: { height: 1, backgroundColor: "#F0F0F0" },
  tourImage: { width: "100%", height: 180, borderRadius: 12, marginBottom: 15 },
  tourName: { fontSize: 20, fontWeight: "bold", color: "#333", lineHeight: 28, marginBottom: 15 },
  highlightInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#eee",
  },
  highlightItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 10,
  },
  highlightTextCol: {
    flexDirection: "column",
  },
  highlightLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  highlightValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111",
  },
  verticalLine: {
    width: 1,
    height: 30,
    backgroundColor: "#ddd",
  },
  summaryGrid: { flexDirection: "row", gap: 12, marginBottom: 12, paddingHorizontal: 2 },
  summaryItemHalf: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  summaryText: { fontSize: 13, color: "#666", flex: 1 },
  summaryBoldText: { fontWeight: "700", color: "#333" },
  priceRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  priceLabel: { fontSize: 15, color: "#666" },
  priceValue: { fontSize: 15, fontWeight: "bold", color: "#333" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 25 },
  totalLabel: { fontSize: 16, fontWeight: "bold", color: "#333" },
  totalValue: { fontSize: 26, fontWeight: "bold", color: "#FF3B30" },
  actionButtons: { flexDirection: "row", gap: 15 },
  cancelBtn: { 
    flex: 1, 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: "center", 
    borderWidth: 1, 
    borderColor: "#ff4d4f",
    backgroundColor: "#fff"
  },
  cancelBtnText: { color: "#ff4d4f", fontWeight: "bold", fontSize: 18 },
  confirmBtn: { flex: 1, backgroundColor: "#007BFF", paddingVertical: 16, borderRadius: 12, alignItems: "center", cursor: "pointer" as any },
  confirmBtnText: { color: "white", fontWeight: "bold", fontSize: 18 },

  // Web Custom Passenger Row Styles
  passengerSectionHeader: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 25, marginTop: 5 },
  passengerSectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#111', marginLeft: 10, lineHeight: 24 },
  passengerSectionSubtitle: { fontSize: 15, color: '#666', fontStyle: 'italic', marginLeft: 8, lineHeight: 22 },

  passengerFormRowWeb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  formColHoten: { flex: 2.5, paddingRight: 20 },
  formColGioitinh: { flex: 1.2, paddingHorizontal: 20 },
  formColNgaysinh: { flex: 1.5, paddingLeft: 20 },
  verticalDivider: { width: 1, height: '60%', backgroundColor: '#eee' },

  formLabel: { fontSize: 14, fontWeight: 'bold', color: '#111', marginBottom: 10 },
  asterisk: { color: 'red' },
  formInput: { fontSize: 16, color: '#333', outlineStyle: 'none' as any, padding: 0 },
  formInputDropdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 2 },
  formInputText: { fontSize: 16, color: '#333' },
  dateInputWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 2 },
  formInputDate: { fontSize: 16, color: '#333', flex: 1, outlineStyle: 'none' as any, padding: 0 },

  // Header Steps Styles
  headerStepsContainer: { alignItems: 'center', marginBottom: 40 },
  mainTitle: { fontSize: 36, fontWeight: 'bold', color: '#0056b3', marginBottom: 30, letterSpacing: 1 },
  stepsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  stepItem: { alignItems: 'center', width: 140 },
  stepCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  stepActive: { backgroundColor: '#0056b3' },
  stepText: { fontSize: 13, fontWeight: 'bold', color: '#999', textAlign: 'center' },
  stepTextActive: { color: '#0056b3' },
  stepArrow: { marginTop: -25 },
});
