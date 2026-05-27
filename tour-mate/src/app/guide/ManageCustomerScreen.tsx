import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import NavigationBar from "@/components/ui/NavigationBar";
import NotificationModal from "@/components/ui/NotificationModal";
import { getTravelersByTour, confirmBooking } from "@/services/guide/bookingService";
import { getTourById } from "@/services/tour/tourService";

const { width } = Dimensions.get("window");

export default function ManageCustomerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const tourId = params.tourId as string;
  const dateStart = params.dateStart as string;
  const dateEnd = params.dateEnd as string;
  const insets = useSafeAreaInsets();

  const [bookings, setBookings] = useState<any[]>([]);
  const [totalPeople, setTotalPeople] = useState(0);
  const [tourDetails, setTourDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Modal States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<{ id: string; name: string } | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!tourId) return;
      try {
        setLoading(true);
        const [travelerRes, tourRes] = await Promise.all([
          getTravelersByTour(tourId, dateStart, dateEnd),
          getTourById(tourId)
        ]);

        if (travelerRes.success) {
          setBookings(travelerRes.data);
          setTotalPeople(travelerRes.totalPeople || 0);
        }
        if (tourRes.success) {
          setTourDetails(tourRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tourId]);

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.contactName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         b.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleOpenConfirm = (bookingId: string, customerName: string) => {
    setSelectedBooking({ id: bookingId, name: customerName });
    setShowConfirmModal(true);
  };

  const handleConfirmCheckIn = async () => {
    if (!selectedBooking) return;
    
    try {
      setIsConfirming(true);
      const res = await confirmBooking(selectedBooking.id);
      
      if (res.success) {
        setBookings(prev => prev.map(b => 
          b.id === selectedBooking.id 
            ? { ...b, checkedIn: true, noShow: false, status: 'confirmed' } 
            : b
        ));
      }
    } catch (error) {
      console.error("Confirm error:", error);
    } finally {
      setIsConfirming(false);
      setShowConfirmModal(false);
      setSelectedBooking(null);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Tour Hero Card */}
        {tourDetails && (
          <View style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroSubtitle}>{tourDetails.tour_type?.toUpperCase() || "CƠ BẢN"}</Text>
                <Text style={styles.heroTitle} numberOfLines={1}>{tourDetails.tour_name}</Text>
                <View style={styles.heroDateRow}>
                  <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                  <Text style={styles.heroDate}>
                    {dateStart ? new Date(dateStart).toLocaleDateString('vi-VN') : ""} - {dateEnd ? new Date(dateEnd).toLocaleDateString('vi-VN') : ""}
                  </Text>
                </View>
              </View>
              <View style={styles.capacityBadge}>
                <Ionicons name="people" size={16} color="white" />
                <Text style={styles.capacityText}>
                  {totalPeople}/{tourDetails.price?.tour_capacity || 0}
                </Text>
              </View>
            </View>

            <View style={styles.tagRow}>
              <View style={[styles.tag, { backgroundColor: "#dcfce7" }]}>
                <Text style={[styles.tagText, { color: "#166534" }]}>{tourDetails.tour_status?.toUpperCase()}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Search & Filter */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
            <TextInput
              placeholder="Tìm kiếm tên khách hàng..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="filter" size={24} color="#4b5563" />
          </TouchableOpacity>
        </View>

        {/* Traveler List Header */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Danh sách khách hàng</Text>
          <TouchableOpacity>
            <Text style={styles.checkAllText}>Xác nhận tất cả</Text>
          </TouchableOpacity>
        </View>

        {/* Booking Cards */}
        {loading ? (
          <ActivityIndicator size="large" color="#005baf" style={{ marginTop: 40 }} />
        ) : filteredBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={60} color="#e0e2ec" />
            <Text style={styles.emptyText}>Không tìm thấy người đặt tour nào</Text>
          </View>
        ) : (
          filteredBookings.map((booking) => (
            <View key={booking.id} style={styles.travelerCard}>
              <TouchableOpacity 
                style={styles.cardTop} 
                activeOpacity={0.7}
                onPress={() => toggleExpand(booking.id)}
              >
                <View style={styles.travelerMainInfo}>
                  <View style={styles.initialsCircle}>
                    <Text style={styles.initialsText}>{booking.contactName.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.travelerName}>{booking.contactName}</Text>
                    <View style={styles.statusRow}>
                      {(() => {
                        const statusRaw = booking.status;
                        const statusLabel = statusRaw === 'confirmed' || statusRaw === 'Đã xác nhận' ? 'Đã xác nhận' :
                                            statusRaw === 'paid' || statusRaw === 'Đã thanh toán' ? 'Đã thanh toán' :
                                            statusRaw === 'pending' || statusRaw === 'Đang thanh toán' ? 'Đang thanh toán' : 'Đã hủy';
                        const statusColor = statusLabel === 'Đã xác nhận' ? '#22c55e' :
                                            statusLabel === 'Đã thanh toán' ? '#3b82f6' :
                                            statusLabel === 'Đang thanh toán' ? '#bc5700' : '#ef4444';
                        
                        return (
                          <>
                            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                            <Text style={[styles.statusText, { color: statusColor }]}>
                              {statusLabel.toUpperCase()}
                            </Text>
                          </>
                        );
                      })()}
                      <Text style={styles.travelerType}> • {booking.totalPeople} người</Text>
                    </View>
                    <Text style={styles.contactInfo}>{booking.contactPhone} | ID: {booking.id}</Text>
                  </View>
                </View>
                <Ionicons 
                  name={expandedId === booking.id ? "chevron-up" : "chevron-down"} 
                  size={24} 
                  color="#64748b" 
                />
              </TouchableOpacity>

              {expandedId === booking.id && (
                <View style={styles.expandedContent}>
                  <View style={styles.divider} />
                  
                  <View style={styles.infoRow}>
                    <Ionicons name="mail-outline" size={14} color="#64748b" />
                    <Text style={styles.infoText}>{booking.contactEmail}</Text>
                  </View>
                  
                  {booking.note && (
                    <View style={styles.infoRow}>
                      <Ionicons name="document-text-outline" size={14} color="#64748b" />
                      <Text style={styles.infoText}>Ghi chú: {booking.note}</Text>
                    </View>
                  )}

                  <Text style={styles.subTitle}>DANH SÁCH HÀNH KHÁCH ({booking.passengers.length})</Text>
                  
                  {['Người lớn', 'Trẻ em'].map(type => {
                    const group = booking.passengers.filter((p: any) => p.type === type);
                    if (group.length === 0) return null;
                    
                    return (
                      <View key={type} style={styles.tableContainer}>
                        <View style={styles.tableHeader}>
                          <Text style={[styles.headerCell, { flex: 2 }]}>Họ tên ({type})</Text>
                          <Text style={[styles.headerCell, { flex: 1 }]}>Giới tính</Text>
                          <Text style={[styles.headerCell, { flex: 1.5 }]}>Ngày sinh</Text>
                        </View>
                        {group.map((p: any, idx: number) => (
                          <View key={`${booking.id}-${type}-${idx}`} style={styles.tableRow}>
                            <Text style={[styles.cellText, { flex: 2 }]} numberOfLines={1}>{p.name}</Text>
                            <Text style={[styles.cellText, { flex: 1 }]}>{p.gender}</Text>
                            <Text style={[styles.cellText, { flex: 1.5 }]}>{p.dob || "N/A"}</Text>
                          </View>
                        ))}
                      </View>
                    );
                  })}

                  <View style={styles.cardActions}>
                    <TouchableOpacity 
                      style={[
                        styles.checkInBtn, 
                        (booking.status === 'confirmed' || booking.status === 'Đã xác nhận' || booking.checkedIn) && { backgroundColor: "#94a3b8" }
                      ]}
                      disabled={booking.status === 'confirmed' || booking.status === 'Đã xác nhận' || booking.checkedIn || isConfirming}
                      onPress={() => handleOpenConfirm(booking.id, booking.contactName)}
                    >
                      <Text style={styles.checkInBtnText}>
                        {booking.status === 'confirmed' || booking.status === 'Đã xác nhận' || booking.checkedIn ? "Đã Check-in Đoàn" : "Check-in Đoàn"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.noShowBtn, booking.noShow && { backgroundColor: "#b91c1c", borderColor: "#b91c1c" }]}
                      onPress={() => setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, noShow: !b.noShow, checkedIn: false } : b))}
                    >
                      <Text style={[styles.noShowBtnText, booking.noShow && { color: "white" }]}>Vắng mặt</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <NavigationBar />
      
      <NotificationModal
        visible={showConfirmModal}
        type="info"
        title="Xác nhận điểm danh"
        message={`Khách hàng "${selectedBooking?.name}" có mặt đầy đủ tại địa điểm?`}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmCheckIn}
        confirmText="Xác nhận"
        cancelText="Hủy"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9ff",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  heroCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    marginTop: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#005baf",
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#181c22",
    marginBottom: 4,
  },
  heroDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroDate: {
    fontSize: 14,
    color: "#414753",
    fontWeight: "500",
  },
  capacityBadge: {
    backgroundColor: "#005baf",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#005baf",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  capacityText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  tagRow: {
    flexDirection: "row",
    gap: 8,
  },
  tag: {
    backgroundColor: "#d5e3fc",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0d1c2e",
    letterSpacing: 0.5,
  },
  searchRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  searchContainer: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#f1f1f1",
    height: 52,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#181c22",
  },
  filterBtn: {
    width: 52,
    height: 52,
    backgroundColor: "white",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f1f1",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#181c22",
  },
  checkAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#005baf",
  },
  travelerCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e2ec",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  travelerMainInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  initialsCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#ebedf7",
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#005baf",
  },
  travelerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#181c22",
    marginBottom: 2,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  chatBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#d5e3ff",
    justifyContent: "center",
    alignItems: "center",
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#f8f9fa",
    marginVertical: 12,
  },
  requestSection: {
    backgroundColor: "#f9f9ff",
    padding: 12,
    borderRadius: 12,
  },
  requestLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#94a3b8",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  requestContent: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  requestText: {
    flex: 1,
    fontSize: 13,
    color: "#414753",
    fontStyle: "italic",
    lineHeight: 18,
  },
  cardActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  checkInBtn: {
    flex: 1,
    backgroundColor: "#005baf",
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#005baf",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  checkInBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  noShowBtn: {
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  noShowBtnText: {
    color: "#1e293b",
    fontWeight: "bold",
    fontSize: 14,
  },
  travelerType: {
    fontSize: 10,
    color: "#64748b",
    fontWeight: "600",
  },
  contactInfo: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  expandedContent: {
    marginTop: 0,
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: "#475569",
  },
  subTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94a3b8",
    marginTop: 16,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  passengerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  passengerBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#cbd5e1",
    marginRight: 12,
  },
  passengerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  passengerType: {
    fontSize: 12,
    fontWeight: "normal",
    color: "#64748b",
  },
  passengerDetail: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },
  tableContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerCell: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#64748b",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
    alignItems: "center",
  },
  cellText: {
    fontSize: 13,
    color: "#334155",
  },
  fab: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#005baf",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#005baf",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
});
