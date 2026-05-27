import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Dimensions,
    Platform,
    ActivityIndicator,
    useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import NavigationBar from "@/components/ui/NavigationBar";
import Footer from "@/components/ui/Footer";
import { useAuth } from "@/context/AuthContext";
import { getUserProfile } from "@/services/auth/userService";
import { cancelBooking } from "@/services/guide/bookingService";
import NotificationModal from "@/components/ui/NotificationModal";

const { width: screenWidth } = Dimensions.get("window");


export default function HistoryBookScreen() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === "web" && width > 1024;
    const { user } = useAuth();

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("Tất cả");
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        if (user?.user_name) {
            const res = await getUserProfile(user.user_name);
            if (res.success) {
                setProfile(res.data);
            }
        }
        setLoading(false);
    };

    const confirmCancel = async () => {
        if (!selectedBookingId) return;
        try {
            setCancelling(true);
            const res = await cancelBooking(selectedBookingId);
            if (res.success) {
                setShowCancelModal(false);
                setSelectedBookingId(null);
                await loadData(); // Refresh list
            }
        } catch (error) {
            console.error("Failed to cancel tour:", error);
        } finally {
            setCancelling(false);
        }
    };

    const myTours = profile?.tours || [];

    const filteredTours = myTours.filter((t: any) => {
        if (filter === "Tất cả") return true;
        if (filter === "Sắp tới") return t.status === "paid" || t.status === "confirmed";
        if (filter === "Đang thanh toán") return t.status === "pending";
        if (filter === "Đã thanh toán") return t.status === "paid";
        if (filter === "Hoàn thành") return t.status === "confirmed";
        if (filter === "Đã hủy") return t.status === "cancelled";
        return true;
    });

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#005bb2" />
            </View>
        );
    }

    const categories = ["Tất cả", "Sắp tới", "Đang thanh toán", "Đã thanh toán", "Hoàn thành", "Đã hủy"];

    const renderTourCard = (booking: any) => {
        const tour = booking.tour_id || {};
        const statusLabel = booking.status === 'confirmed' ? 'Đã xác nhận' :
            booking.status === 'paid' ? 'Đã thanh toán' :
                booking.status === 'pending' ? 'Đang thanh toán' : 'Đã hủy';
        const statusColor = booking.status === 'confirmed' ? '#22c55e' :
            booking.status === 'paid' ? '#3b82f6' :
                booking.status === 'pending' ? '#bc5700' : '#ef4444';
        const statusBg = booking.status === 'confirmed' ? '#22c55e' :
            booking.status === 'paid' ? '#3b82f6' :
                booking.status === 'pending' ? '#bc5700' : '#ef4444';

        return (
            <TouchableOpacity
                key={booking.booking_info_id}
                style={[styles.tourCard, isWeb && { width: "32%" }]}
                onPress={() => router.push(`/tour/TourDetailScreen?id=${tour.tour_id}`)}
                activeOpacity={0.9}
            >
                <View style={styles.tourImageWrapper}>
                    <Image
                        source={{ uri: tour.tour_image || "https://images.unsplash.com/photo-1596895111956-bf57059e00fa?auto=format&fit=crop" }}
                        style={styles.tourImage}
                    />
                    <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                        <Text style={styles.statusBadgeText}>{statusLabel}</Text>
                    </View>
                </View>
                <View style={styles.tourCardContent}>
                    <View>
                        <Text style={styles.tourTitle} numberOfLines={2}>{tour.tour_name || "Tour du lịch"}</Text>
                        <View style={styles.dateRow}>
                            <Ionicons name="calendar-outline" size={16} color="#64748b" />
                            <Text style={styles.dateText}>
                                {tour.time?.date_start ?
                                    (() => {
                                        const d1 = new Date(tour.time.date_start);
                                        const start = `${String(d1.getDate()).padStart(2, '0')}/${String(d1.getMonth() + 1).padStart(2, '0')}/${d1.getFullYear()}`;

                                        if (tour.time?.date_end) {
                                            const d2 = new Date(tour.time.date_end);
                                            const end = `${String(d2.getDate()).padStart(2, '0')}/${String(d2.getMonth() + 1).padStart(2, '0')}/${d2.getFullYear()}`;
                                            return `${start} - ${end}`;
                                        }
                                        return start;
                                    })()
                                    : "--/--/----"}
                                {tour.time_sche_start ? ` • ${tour.time_sche_start}` : ""}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.priceRow}>
                        <View>
                            <Text style={styles.priceLabel}>TỔNG CỘNG</Text>
                            <Text style={styles.priceValue}>{Number(booking.total_price || 0).toLocaleString()}đ</Text>
                        </View>
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[
                                    styles.actionBtn,
                                    booking.status === 'pending' && styles.payNowBtn
                                ]}
                                onPress={() => {
                                    if (booking.status === 'pending') {
                                        router.push(`/tour/StatusScreen?bookingId=${booking.booking_info_id}`);
                                    } else {
                                        router.push(`/tour/TourDetailScreen?id=${tour.tour_id}`);
                                    }
                                }}
                            >
                                <Text style={[
                                    styles.actionBtnText,
                                    booking.status === 'pending' && styles.payNowBtnText
                                ]}>
                                    {booking.status === 'pending' ? 'Thanh toán' : 'Chi tiết'}
                                </Text>
                            </TouchableOpacity>

                            {booking.status === 'pending' && (
                                <TouchableOpacity
                                    style={styles.cancelTourBtn}
                                    onPress={() => {
                                        setSelectedBookingId(booking.booking_info_id);
                                        setShowCancelModal(true);
                                    }}
                                >
                                    <Text style={styles.cancelTourBtnText}>Hủy tour</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.main} edges={['top', 'bottom']}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={isWeb ? styles.webHeader : styles.mobileHeader}>
                        <View style={styles.titleRow}>
                            <Text style={styles.pageTitle}>Lịch sử đặt Tour</Text>
                            {!isWeb && (
                                <TouchableOpacity style={styles.helpBtn}>
                                    <Ionicons name="help-circle-outline" size={24} color="#64748b" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Category Filters */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.filterScroll}
                            contentContainerStyle={styles.filterContent}
                        >
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[styles.filterBtn, filter === cat && styles.filterBtnActive]}
                                    onPress={() => setFilter(cat)}
                                >
                                    <Text style={[styles.filterBtnText, filter === cat && styles.filterBtnTextActive]}>
                                        {cat === "Tất cả" ? "Tất cả chuyến đi" : cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={isWeb ? styles.webGrid : styles.mobileList}>
                        {filteredTours.length > 0 ? (
                            filteredTours.map(renderTourCard)
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="receipt-outline" size={64} color="#e2e8f0" />
                                <Text style={styles.emptyTitle}>Không tìm thấy chuyến đi</Text>
                                <Text style={styles.emptySub}>Bạn chưa có chuyến đi nào trong danh mục này.</Text>
                            </View>
                        )}

                        {/* Promotion Bento Piece (Simplified for RN) */}
                        <TouchableOpacity style={styles.promoCard} activeOpacity={0.9}>
                            <View>
                                <Text style={styles.promoLabel}>ƯU ĐÃI ĐỘC QUYỀN</Text>
                                <Text style={styles.promoTitle}>Giảm 20% cho lần đặt chỗ tiếp theo</Text>
                                <Text style={styles.promoSub}>Mời bạn bè tham gia TourMate và tiết kiệm cho chuyến phiêu lưu tiếp theo.</Text>
                            </View>
                            <TouchableOpacity style={styles.promoBtn}>
                                <Text style={styles.promoBtnText}>Giới thiệu bạn bè</Text>
                            </TouchableOpacity>
                            <View style={styles.promoCircle} />
                        </TouchableOpacity>
                    </View>

                    {isWeb && <Footer />}
                </ScrollView>
            </SafeAreaView>

            <NotificationModal
                visible={showCancelModal}
                type="warning"
                title="Xác nhận hủy tour"
                message="Bạn có chắc chắn muốn hủy tour này không? Hành động này không thể hoàn tác."
                onClose={() => setShowCancelModal(false)}
                onConfirm={confirmCancel}
                confirmText={cancelling ? "Đang xử lý..." : "Hủy tour"}
                cancelText="Quay lại"
            />

            <NavigationBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9ff",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    main: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 15,
        paddingBottom: 10,
        paddingTop: 5,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        height: 50,
        position: "relative",
    },
    mobileHeader: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    webHeader: {
        maxWidth: 1200,
        width: "100%",
        alignSelf: "center",
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        marginTop: 20,
        position: 'relative',
    },
    pageTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#1e293b",
        textAlign: "center",
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    },
    helpBtn: {
        position: 'absolute',
        right: 0,
        padding: 4,
    },
    filterScroll: {
        marginBottom: 20,
    },
    filterContent: {
        paddingVertical: 4,
        gap: 8,
    },
    filterBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#f1f3fd",
    },
    filterBtnActive: {
        backgroundColor: "#005bb2",
        borderColor: "#005bb2",
        shadowColor: "#005bb2",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 4,
    },
    filterBtnText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#64748b",
    },
    filterBtnTextActive: {
        color: "#fff",
    },
    mobileList: {
        paddingHorizontal: 20,
        gap: 20,
    },
    webGrid: {
        maxWidth: 1200,
        width: "100%",
        alignSelf: "center",
        paddingHorizontal: 20,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 16,
    },
    tourCard: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "#f1f3fd",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 3,
        overflow: 'hidden',
    },
    tourImageWrapper: {
        width: "100%",
        height: 180,
        position: 'relative',
    },
    tourImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    statusBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusBadgeText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "800",
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    tourCardContent: {
        padding: 16,
        paddingTop: 12,
        flex: 1,
        justifyContent: 'space-between',
        gap: 12,
    },
    tourTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1e293b",
        marginBottom: 6,
    },
    dateRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    dateText: {
        fontSize: 13,
        color: "#64748b",
        fontWeight: "500",
    },
    priceRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#f8fafc",
    },
    priceLabel: {
        fontSize: 9,
        fontWeight: "700",
        color: "#94a3b8",
        letterSpacing: 1,
    },
    priceValue: {
        fontSize: 20,
        fontWeight: "800",
        color: "#005bb2",
    },
    actionBtn: {
        backgroundColor: "#f1f5f9",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 14,
        alignItems: "center",
        minWidth: 100,
    },
    actionBtnText: {
        color: "#005bb2",
        fontSize: 13,
        fontWeight: "700",
    },
    payNowBtn: {
        backgroundColor: "#005bb2",
    },
    payNowBtnText: {
        color: "#fff",
    },
    promoCard: {
        width: "100%",
        backgroundColor: "#005bb2",
        borderRadius: 24,
        padding: 24,
        marginTop: 10,
        position: 'relative',
        overflow: 'hidden',
    },
    promoLabel: {
        fontSize: 10,
        fontWeight: "800",
        color: "rgba(255,255,255,0.7)",
        letterSpacing: 1,
        marginBottom: 8,
    },
    promoTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: "#fff",
        marginBottom: 8,
        maxWidth: "80%",
    },
    promoSub: {
        fontSize: 14,
        color: "rgba(255,255,255,0.8)",
        marginBottom: 20,
        maxWidth: "70%",
    },
    promoBtn: {
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 14,
        alignSelf: 'flex-start',
    },
    promoBtnText: {
        color: "#005bb2",
        fontWeight: "800",
        fontSize: 14,
    },
    promoCircle: {
        position: 'absolute',
        bottom: -40,
        right: -40,
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: "rgba(255,255,255,0.1)",
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
        backgroundColor: "#fff",
        borderRadius: 24,
        width: "100%",
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1e293b",
        marginTop: 16,
    },
    emptySub: {
        fontSize: 14,
        color: "#64748b",
        marginTop: 8,
        textAlign: "center",
        paddingHorizontal: 40,
    },
    cancelTourBtn: {
        backgroundColor: "#ef4444",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 14,
        alignItems: "center",
        minWidth: 100,
    },
    cancelTourBtnText: {
        fontSize: 13,
        fontWeight: "700",
        color: "white",
    },
    actionButtons: {
        gap: 8,
        alignItems: "flex-end",
    },
});
