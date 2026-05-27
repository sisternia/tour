import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NavigationBar from "@/components/ui/NavigationBar";
import FloatingInput from "@/components/ui/FloatingInput";

export default function PaymentLayout({
  tour,
  coverImage,
  name,
  email,
  phone,
  note,
  adultCount,
  childCount,
  parsedAdults,
  parsedChildren,
  totalPrice,
  paymentMethod,
  setPaymentMethod,
  handleFinish,
  isProcessing,
  handleCancel,
  isCustom,
}: any) {
  const adultPrice = tour?.price?.price_adult || 0;
  const childPrice = tour?.price?.price_child || 0;

  return (
    <View style={styles.container}>
      <NavigationBar />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.webContent}>
          <View style={styles.grid}>
            {/* Left Column */}
            <View style={styles.leftColumn}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Thông tin liên hệ</Text>
                <div style={styles.webGrid}>
                  <div style={styles.webCol}>
                    <FloatingInput label="Họ và tên *" value={name} onChangeText={() => {}} editable={false} />
                  </div>
                  <div style={styles.webCol}>
                    <FloatingInput label="Số điện thoại *" value={phone} onChangeText={() => {}} editable={false} />
                  </div>
                  <div style={{ ...styles.webCol, gridColumn: 'span 2' } as any}>
                    <FloatingInput label="Email *" value={email} onChangeText={() => {}} editable={false} />
                  </div>
                  <div style={{ ...styles.webCol, gridColumn: 'span 2' } as any}>
                    <FloatingInput label="Ghi chú thêm" value={note} onChangeText={() => {}} multiline style={{ height: 80, textAlignVertical: 'top' }} editable={false} />
                  </div>
                </div>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Thông tin hành khách</Text>

                {parsedAdults && parsedAdults.length > 0 && (
                  <View style={{ marginBottom: 20 }}>
                    <View style={styles.passengerSectionHeader}>
                      <Ionicons name="people-outline" size={26} color="#333" />
                      <Text style={styles.passengerSectionTitle}>Người lớn</Text>
                    </View>
                    {parsedAdults.map((adult: any, index: number) => (
                      <View key={`adult-${index}`} style={styles.passengerRow}>
                        <View style={{ flex: 2 }}>
                          <Text style={styles.formLabel}>Họ tên:</Text>
                          <Text style={styles.formValue}>{adult.name}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.formLabel}>Giới tính:</Text>
                          <Text style={styles.formValue}>{adult.gender}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.formLabel}>Ngày sinh:</Text>
                          <Text style={styles.formValue}>{adult.dob}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {parsedChildren && parsedChildren.length > 0 && (
                  <View>
                    <View style={styles.passengerSectionHeader}>
                      <Ionicons name="people-outline" size={26} color="#333" />
                      <Text style={styles.passengerSectionTitle}>Trẻ em</Text>
                    </View>
                    {parsedChildren.map((child: any, index: number) => (
                      <View key={`child-${index}`} style={styles.passengerRow}>
                        <View style={{ flex: 2 }}>
                          <Text style={styles.formLabel}>Họ tên:</Text>
                          <Text style={styles.formValue}>{child.name}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.formLabel}>Giới tính:</Text>
                          <Text style={styles.formValue}>{child.gender}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.formLabel}>Ngày sinh:</Text>
                          <Text style={styles.formValue}>{child.dob}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Phương thức thanh toán</Text>

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
              </View>
            </View>

            {/* Right Column: Order Summary */}
            <View style={styles.rightColumn}>
              <View style={[styles.card, styles.stickyCard]}>
                <Text style={[styles.cardTitle, { textAlign: 'center' }]}>Tóm tắt đơn hàng</Text>
                {!isCustom && <Image source={{ uri: coverImage }} style={styles.tourImage} />}
                <Text style={styles.tourName}>{tour?.tour_name}</Text>

                <View style={styles.highlightInfoBox}>
                  <View style={styles.highlightItem}>
                    <Ionicons name="calendar" size={24} color="#0056b3" />
                    <View style={styles.highlightTextCol}>
                      <Text style={styles.highlightLabel}>Ngày khởi hành</Text>
                      <Text style={styles.highlightValue}>{tour?.time?.date_start ? new Date(tour.time.date_start).toLocaleDateString('vi-VN') : ''}</Text>
                    </View>
                  </View>
                  <View style={styles.verticalLine} />
                  <View style={styles.highlightItem}>
                    <Ionicons name="calendar-outline" size={24} color="#0056b3" />
                    <View style={styles.highlightTextCol}>
                      <Text style={styles.highlightLabel}>Ngày kết thúc</Text>
                      <Text style={styles.highlightValue}>{tour?.time?.date_end ? new Date(tour.time.date_end).toLocaleDateString('vi-VN') : ''}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.summaryGrid}>
                  <View style={styles.summaryItemHalf}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.summaryText} numberOfLines={1}>
                      Thời lượng: <Text style={styles.summaryBoldText}>{tour?.time?.tour_duration} ngày</Text>
                    </Text>
                  </View>
                  {!isCustom && (
                    <View style={styles.summaryItemHalf}>
                      <Ionicons name="people-outline" size={16} color="#666" />
                      <Text style={styles.summaryText} numberOfLines={1}>
                        Tối đa: <Text style={styles.summaryBoldText}>{tour?.price?.tour_capacity} người</Text>
                      </Text>
                    </View>
                  )}
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
                  <Text style={styles.totalValue}>{Number(totalPrice).toLocaleString()}đ</Text>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.cancelBtn} 
                    onPress={handleCancel}
                  >
                    <Text style={styles.cancelBtnText}>Trở về</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.confirmBtn, isProcessing && styles.payButtonDisabled]} 
                    onPress={handleFinish}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.confirmBtnText}>Xác nhận</Text>
                    )}
                  </TouchableOpacity>
                </View>
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
  grid: { flexDirection: "row", gap: 40 },
  leftColumn: { flex: 2 },
  rightColumn: { flex: 1 },
  card: { backgroundColor: "white", borderRadius: 16, padding: 30, marginBottom: 30, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 5 },
  stickyCard: { position: "sticky" as any, top: 40, maxHeight: 'calc(100vh - 80px)' as any, overflowY: 'auto' as any },
  cardTitle: { fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 20 },
  webGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' } as any,
  webCol: { display: 'flex', flexDirection: 'column' } as any,
  
  passengerSectionHeader: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 25, marginTop: 5 },
  passengerSectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#111', marginLeft: 10, lineHeight: 24 },
  passengerRow: { flexDirection: "row", paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#eee" },
  formLabel: { fontSize: 14, fontWeight: 'bold', color: '#111', marginBottom: 10 },
  formValue: { fontSize: 16, color: "#333" },
  
  paymentOption: { flexDirection: "row", alignItems: "center", backgroundColor: "white", borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E0E0E0" },
  paymentOptionActive: { borderColor: "#0056b3", backgroundColor: "#F0F7FF" },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "#ccc", justifyContent: "center", alignItems: "center", marginRight: 15 },
  radioActive: { borderColor: "#0056b3" },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#0056b3" },
  paymentIconBox: { width: 48, height: 48, borderRadius: 8, backgroundColor: "#F0F7FF", justifyContent: "center", alignItems: "center", marginRight: 15 },
  paymentTexts: { flex: 1 },
  paymentName: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 4 },
  paymentDesc: { fontSize: 13, color: "#666" },

  tourImage: { width: "100%", height: 180, borderRadius: 12, marginBottom: 15 },
  tourName: { fontSize: 20, fontWeight: "bold", color: "#333", lineHeight: 28, marginBottom: 15 },
  highlightInfoBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#f8f9fa", borderRadius: 16, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: "#eee" },
  highlightItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 10 },
  highlightTextCol: { flexDirection: "column" },
  highlightLabel: { fontSize: 12, color: "#666", marginBottom: 2 },
  highlightValue: { fontSize: 15, fontWeight: "bold", color: "#111" },
  verticalLine: { width: 1, height: 30, backgroundColor: "#ddd" },
  summaryGrid: { flexDirection: "row", gap: 12, marginBottom: 12, paddingHorizontal: 2 },
  summaryItemHalf: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  summaryText: { fontSize: 13, color: "#666", flex: 1 },
  summaryBoldText: { fontWeight: "700", color: "#333" },
  divider: { height: 1, backgroundColor: "#F0F0F0" },
  priceRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  priceLabel: { fontSize: 15, color: "#666" },
  priceValue: { fontSize: 15, fontWeight: "bold", color: "#333" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 25 },
  totalLabel: { fontSize: 16, fontWeight: "bold", color: "#333" },
  totalValue: { fontSize: 26, fontWeight: "bold", color: "#FF3B30" },
  
  actionButtons: { flexDirection: "row", gap: 15 },
  cancelBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: "#ff4d4f", backgroundColor: "#fff" },
  cancelBtnText: { color: "#ff4d4f", fontWeight: "bold", fontSize: 18 },
  confirmBtn: { flex: 1, backgroundColor: "#007BFF", paddingVertical: 16, borderRadius: 12, alignItems: "center", cursor: "pointer" as any },
  confirmBtnText: { color: "white", fontWeight: "bold", fontSize: 18 },
  payButtonDisabled: { backgroundColor: "#99c2ff" },
});
