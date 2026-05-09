import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getPaymentStatus } from "@/services/payment/vnpayService";
import StatusLayout from "@/components/tour/StatusLayout";

export default function StatusScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { bookingId } = params;

  const isWeb = Platform.OS === "web" && width > 1024;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (bookingId) {
      fetchBookingStatus();
    }
  }, [bookingId]);

  const fetchBookingStatus = async () => {
    if (bookingId === 'fail') {
      setLoading(false);
      return;
    }
    try {
      const resData = await getPaymentStatus(bookingId as string);
      if (resData.success) {
        setData(resData.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  const isPaid = data?.booking?.status === 'paid';
  const isPending = data?.booking?.status === 'pending';
  const isSuccess = isPaid || isPending;

  const getStatusTitle = () => {
    if (isPaid) return "Thanh toán thành công!";
    if (isPending) return "Chờ thanh toán";
    return "Thanh toán thất bại";
  };

  const getStatusSubTitle = () => {
    if (isPaid) return "Cảm ơn bạn đã tin dùng dịch vụ của chúng tôi.";
    if (isPending) return "Đơn hàng đã được ghi nhận. Vui lòng hoàn tất thanh toán.";
    return "Đã có lỗi xảy ra trong quá trình thanh toán.";
  };

  const formatVnpDate = (dateStr: string) => {
    if (!dateStr || dateStr.length < 14) return dateStr;
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.substring(8, 10);
    const minute = dateStr.substring(10, 12);
    const second = dateStr.substring(12, 14);
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };

  const getStatusColor = () => {
    if (isPaid) return "#28a745"; // Green
    if (isPending) return "#007BFF"; // Blue
    return "#dc3545"; // Red
  };

  if (isWeb) {
    return (
      <StatusLayout
        data={data}
        isPaid={isPaid}
        isPending={isPending}
        isSuccess={isSuccess}
        getStatusTitle={getStatusTitle}
        getStatusSubTitle={getStatusSubTitle}
        getStatusColor={getStatusColor}
        router={router}
      />
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Success/Error Icon */}
        <View style={styles.statusHeader}>
          <View style={[styles.iconCircle, { backgroundColor: getStatusColor() }]}>
            <Ionicons
              name={isSuccess ? (isPaid ? "checkmark" : "time") : "close"}
              size={60}
              color="#fff"
            />
          </View>
          <Text style={[styles.statusTitle, { color: getStatusColor() }]}>
            {getStatusTitle()}
          </Text>
          <Text style={styles.statusSubTitle}>
            {getStatusSubTitle()}
          </Text>
        </View>

        {isSuccess && data && (
          <View style={styles.infoSection}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Thông tin đặt tour</Text>
              <View style={styles.tableContainer}>
                <View style={styles.tableRow}>
                  <Text style={[styles.cellText, { flex: 2, fontWeight: 'bold' }]}>Mã đơn hàng</Text>
                  <Text style={[styles.cellText, { flex: 1.5 }]}>{data.booking.booking_info_id}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={[styles.cellText, { flex: 2, fontWeight: 'bold' }]}>Khách hàng</Text>
                  <Text style={[styles.cellText, { flex: 1.5 }]}>{data.booking.contact_info.full_name}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={[styles.cellText, { flex: 2, fontWeight: 'bold' }]}>Số tiền</Text>
                  <Text style={[styles.cellText, { flex: 1.5, color: '#005bb2', fontWeight: 'bold' }]}>{data.booking.total_price.toLocaleString()}đ</Text>
                </View>
                <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                  <Text style={[styles.cellText, { flex: 2, fontWeight: 'bold' }]}>Trạng thái</Text>
                  <Text style={[styles.cellText, { flex: 1.5, color: getStatusColor(), fontWeight: 'bold' }]}>
                    {isPaid ? "Đã thanh toán" : "Chờ thanh toán"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Passengers Info */}
            {data.booking?.passengers && data.booking.passengers.length > 0 && (
              <>
                {/* Adults */}
                {data.booking.passengers.filter((p: any) => p.type === 'adult').length > 0 && (
                  <View style={styles.card}>
                    <View style={styles.passengerSectionHeader}>
                      <Ionicons name="people-outline" size={22} color="#005bb2" />
                      <Text style={styles.passengerSectionTitle}>Người lớn</Text>
                    </View>
                    <View style={styles.tableContainer}>
                      <View style={styles.tableHeader}>
                        <Text style={[styles.headerCell, { flex: 2 }]}>HỌ TÊN</Text>
                        <Text style={[styles.headerCell, { flex: 1 }]}>GIỚI TÍNH</Text>
                        <Text style={[styles.headerCell, { flex: 1.5 }]}>NGÀY SINH</Text>
                      </View>
                      {data.booking.passengers.filter((p: any) => p.type === 'adult').map((adult: any, index: number, arr: any[]) => (
                        <View key={`adult-${index}`} style={[styles.tableRow, index === arr.length - 1 && { borderBottomWidth: 0 }]}>
                          <Text style={[styles.cellText, { flex: 2 }]} numberOfLines={1}>{adult.name}</Text>
                          <Text style={[styles.cellText, { flex: 1, }]}>{adult.gender}</Text>
                          <Text style={[styles.cellText, { flex: 1.5 }]}>{adult.dob || "--/--/----"}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Children */}
                {data.booking.passengers.filter((p: any) => p.type === 'child').length > 0 && (
                  <View style={styles.card}>
                    <View style={styles.passengerSectionHeader}>
                      <Ionicons name="people-outline" size={22} color="#005bb2" />
                      <Text style={styles.passengerSectionTitle}>Trẻ em</Text>
                    </View>
                    <View style={styles.tableContainer}>
                      <View style={styles.tableHeader}>
                        <Text style={[styles.headerCell, { flex: 2 }]}>HỌ TÊN</Text>
                        <Text style={[styles.headerCell, { flex: 1 }]}>GIỚI TÍNH</Text>
                        <Text style={[styles.headerCell, { flex: 1.5 }]}>NGÀY SINH</Text>
                      </View>
                      {data.booking.passengers.filter((p: any) => p.type === 'child').map((child: any, index: number, arr: any[]) => (
                        <View key={`child-${index}`} style={[styles.tableRow, index === arr.length - 1 && { borderBottomWidth: 0 }]}>
                          <Text style={[styles.cellText, { flex: 2 }]} numberOfLines={1}>{child.name}</Text>
                          <Text style={[styles.cellText, { flex: 1 }]}>{child.gender}</Text>
                          <Text style={[styles.cellText, { flex: 1.5 }]}>{child.dob || "--/--/----"}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                {/* Accompanying Guides */}
                {data.booking?.tour_id?.guides && data.booking.tour_id.guides.length > 0 && (
                  <View style={styles.card}>
                    <View style={styles.passengerSectionHeader}>
                      <Ionicons name="compass-outline" size={22} color="#005bb2" />
                      <Text style={styles.passengerSectionTitle}>Hướng dẫn viên đồng hành</Text>
                    </View>
                    <View style={styles.guideList}>
                      {data.booking.tour_id.guides.map((guide: any, index: number, arr: any[]) => (
                        <View key={guide.user_id} style={[styles.guideCard, index === arr.length - 1 && { borderBottomWidth: 0, paddingBottom: 0 }]}>
                          <Image
                            source={{ uri: guide.avatar || "https://via.placeholder.com/100" }}
                            style={styles.guideAvatar}
                          />
                          <View style={styles.guideInfo}>
                            <Text style={styles.guideName}>{guide.full_name}</Text>
                            <View style={styles.guideContact}>
                              <View style={styles.guideContactItem}>
                                <Ionicons name="call-outline" size={14} color="#64748b" />
                                <Text style={styles.guideContactText}>{guide.phone || "Chưa cập nhật"}</Text>
                              </View>
                              <View style={styles.guideContactItem}>
                                <Ionicons name="mail-outline" size={14} color="#64748b" />
                                <Text style={styles.guideContactText}>{guide.email || "Chưa cập nhật"}</Text>
                              </View>
                            </View>
                          </View>
                          <TouchableOpacity 
                            style={styles.messageBtn}
                            onPress={() => {
                              router.push({
                                pathname: "/chat/ChatScreen",
                                params: {
                                  guideId: guide.user_id,
                                  guideName: guide.full_name,
                                  guideAvatar: guide.avatar
                                }
                              });
                            }}
                          >
                            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#005bb2" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </>
            )}

            {data.vnpay && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Chi tiết giao dịch</Text>
                <View style={styles.tableContainer}>
                  <View style={styles.tableRow}>
                    <Text style={[styles.cellText, { flex: 2, fontWeight: 'bold' }]}>Mã giao dịch</Text>
                    <Text style={[styles.cellText, { flex: 1.5 }]}>{data.vnpay.vnp_TransactionNo}</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={[styles.cellText, { flex: 2, fontWeight: 'bold' }]}>Ngân hàng</Text>
                    <Text style={[styles.cellText, { flex: 1.5 }]}>{data.vnpay.vnp_BankCode}</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={[styles.cellText, { flex: 2, fontWeight: 'bold' }]}>Thời gian</Text>
                    <Text style={[styles.cellText, { flex: 1.5 }]}>{formatVnpDate(data.vnpay.vnp_PayDate)}</Text>
                  </View>
                  <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                    <Text style={[styles.cellText, { flex: 2, fontWeight: 'bold' }]}>Nội dung</Text>
                    <Text style={[styles.cellText, { flex: 1.5 }]}>{data.vnpay.vnp_OrderInfo}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => router.replace('/home/HomeScreen')}
        >
          <Text style={styles.homeBtnText}>Quay về trang chủ</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 20,
  },
  mobileStepsContainer: {
    marginBottom: 30,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepActive: {
    backgroundColor: '#28a745',
  },
  stepCompleted: {
    backgroundColor: '#28a745',
  },
  stepFailed: {
    backgroundColor: '#dc3545',
  },
  stepArrow: {
    marginHorizontal: 5,
  },
  stepText: {
    fontSize: 9,
    color: '#999',
    fontWeight: 'bold',
  },
  stepTextActive: {
    color: '#28a745',
  },
  stepTextCompleted: {
    color: '#28a745',
  },
  stepTextFailed: {
    color: '#dc3545',
  },
  statusHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  successBg: {
    backgroundColor: "#28a745",
  },
  errorBg: {
    backgroundColor: "#dc3545",
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  successText: {
    color: "#28a745",
  },
  errorText: {
    color: "#dc3545",
  },
  statusSubTitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  infoSection: {
    width: "100%",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    width: 130,
    fontSize: 14,
    color: "#666",
  },
  infoSeparator: {
    fontSize: 14,
    color: "#666",
    marginHorizontal: 3,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  // Passenger Styles
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
  homeBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#28a745",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  homeBtnText: {
    color: "#28a745",
    fontSize: 16,
    fontWeight: "bold",
  },
  tableContainer: {
    marginTop: 10,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerCell: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#64748b",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    alignItems: "center",
  },
  cellText: {
    fontSize: 14,
    color: "#1e293b",
  },
  guideList: {
    marginTop: 10,
  },
  guideCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  guideAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f1f5f9",
  },
  guideInfo: {
    flex: 1,
    marginLeft: 16,
  },
  guideName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  guideContact: {
    gap: 4,
  },
  guideContactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  guideContactText: {
    fontSize: 12,
    color: "#64748b",
  },
  messageBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f0f7ff",
    justifyContent: "center",
    alignItems: "center",
  },
});
