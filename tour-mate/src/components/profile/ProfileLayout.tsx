import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Dimensions,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import NavigationBar from "@/components/ui/NavigationBar";
import Footer from "@/components/ui/Footer";

const { width } = Dimensions.get("window");

interface ProfileLayoutProps {
    profile: any;
}

export default function ProfileLayout({ profile }: ProfileLayoutProps) {
    const router = useRouter();
    const sidebarItems = [
        { name: "Thông tin tài khoản", icon: "person", active: true },
        { name: "Cài đặt", icon: "settings", active: false },
    ];

    const myTours = profile?.tours || [];
    const savedTours = profile?.savedTours || [];

    return (
        <View style={styles.container}>
            <NavigationBar />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>
                <View style={styles.mainLayout}>
                    {/* Sidebar */}
                    <View style={styles.sidebar}>
                        <View style={styles.navContainer}>
                            {sidebarItems.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.navItem, item.active && styles.navItemActive]}>
                                    <Ionicons
                                        name={item.icon as any}
                                        size={22}
                                        color={item.active ? "#fff" : "#414753"}
                                    />
                                    <Text style={[styles.navText, item.active && styles.navTextActive]}>
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Main Content */}
                    <View style={styles.contentArea}>
                        {/* Profile Header */}
                        <View style={styles.profileHeaderCard}>
                            <View style={styles.profileHeaderInfo}>
                                <View style={styles.avatarWrapper}>
                                    <View style={styles.avatarContainer}>
                                        {profile?.avatar ? (
                                            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
                                        ) : (
                                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                                <Ionicons name="person" size={60} color="#ccc" />
                                            </View>
                                        )}
                                    </View>
                                    <TouchableOpacity style={styles.cameraBtn}>
                                        <Ionicons name="camera" size={20} color="#005bb2" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.userNameSection}>
                                    <Text style={styles.userName}>{profile?.full_name || "Chưa cập nhật tên"}</Text>
                                    <View style={styles.contactInfo}>
                                        <View style={styles.contactItem}>
                                            <Ionicons name="mail" size={18} color="#005bb2" />
                                            <Text style={styles.contactText}>{profile?.email || "Chưa cập nhật email"}</Text>
                                        </View>
                                        <View style={styles.contactItem}>
                                            <Ionicons name="call" size={18} color="#005bb2" />
                                            <Text style={styles.contactText}>{profile?.phone || "Chưa cập nhật SĐT"}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity style={styles.editProfileBtn}>
                                <Text style={styles.editProfileBtnText}>Chỉnh sửa hồ sơ</Text>
                            </TouchableOpacity>
                        </View>

                        {/* My Tours Grid */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View>
                                    <Text style={styles.sectionTitle}>Tour của tôi</Text>
                                    <Text style={styles.sectionSubTitle}>Lịch trình sắp tới và kỷ niệm của bạn</Text>
                                </View>
                                {myTours.length > 0 && (
                                    <TouchableOpacity style={styles.viewAllBtn}>
                                        <Text style={styles.viewAllText}>Xem tất cả</Text>
                                        <Ionicons name="arrow-forward" size={20} color="#005bb2" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {myTours.length > 0 ? (
                                <View style={styles.toursGrid}>
                                    {myTours.map((booking: any, index: number) => {
                                        const tour = booking.tour_id || {};
                                        const statusLabel = booking.status === 'paid' ? 'Đã thanh toán' :
                                            booking.status === 'pending' ? 'Chờ thanh toán' : 'Đã hủy';
                                        const statusColor = booking.status === 'paid' ? '#22c55e' :
                                            booking.status === 'pending' ? '#3b82f6' : '#ef4444';
                                        const statusBg = booking.status === 'paid' ? '#f0fdf4' :
                                            booking.status === 'pending' ? '#eff6ff' : '#fef2f2';

                                        return (
                                            <TouchableOpacity key={index} style={styles.tourCard} onPress={() => router.push(`/tour/StatusScreen?bookingId=${booking.booking_info_id}`)}>
                                                <View style={styles.tourImageWrapper}>
                                                    <Image
                                                        source={{ uri: tour.tour_image || "https://images.unsplash.com/photo-1596895111956-bf57059e00fa?q=80&w=1000&auto=format&fit=crop" }}
                                                        style={styles.tourImage}
                                                    />
                                                    <View style={[styles.modernBadge, { backgroundColor: statusBg }]}>
                                                        <View style={[styles.modernBadgeDot, { backgroundColor: statusColor }]} />
                                                        <Text style={[styles.modernBadgeText, { color: statusColor }]}>{statusLabel}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.tourCardContent}>
                                                    <Text style={styles.tourCardTitle} numberOfLines={2}>{tour.tour_name || "Tour du lịch"}</Text>

                                                    <View style={styles.modernMetaRow}>
                                                        <View style={styles.modernMetaItem}>
                                                            <Ionicons name="calendar-outline" size={16} color="#64748b" />
                                                            <Text style={styles.modernMetaText}>
                                                                {tour.time?.date_start ? new Date(tour.time.date_start).toLocaleDateString('vi-VN') : "--/--/----"}
                                                            </Text>
                                                        </View>
                                                        <View style={styles.modernMetaItem}>
                                                            <Ionicons name="bookmark-outline" size={16} color="#64748b" />
                                                            <Text style={styles.modernMetaText}>#{booking.booking_info_id}</Text>
                                                        </View>
                                                    </View>

                                                    <View style={styles.priceRow}>
                                                        <Text style={styles.priceLabel}>Tổng cộng</Text>
                                                        <Text style={styles.priceValue}>
                                                            {Number(booking.total_price || 0).toLocaleString()}đ
                                                        </Text>
                                                    </View>

                                                    <View style={styles.modernActionBtnRow}>
                                                        <TouchableOpacity 
                                                            style={styles.modernActionBtn}
                                                            onPress={() => router.push(`/tour/StatusScreen?bookingId=${booking.booking_info_id}`)}
                                                        >
                                                            <Text style={styles.modernActionBtnText}>Xem vé</Text>
                                                            <Ionicons name="chevron-forward" size={16} color="#fff" />
                                                        </TouchableOpacity>
                                                        
                                                        {booking.status === 'pending' && (
                                                            <TouchableOpacity 
                                                                style={[styles.modernActionBtn, styles.payNowBtn]}
                                                                onPress={() => router.push({
                                                                    pathname: '/tour/PaymentScreen',
                                                                    params: { bookingId: booking.booking_info_id }
                                                                })}
                                                            >
                                                                <Text style={styles.modernActionBtnText}>Thanh toán</Text>
                                                                <Ionicons name="card-outline" size={16} color="#fff" />
                                                            </TouchableOpacity>
                                                        )}
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <Ionicons name="ticket-outline" size={64} color="#ccc" />
                                    <Text style={styles.emptyText}>Bạn chưa đặt tour nào</Text>
                                    <TouchableOpacity style={styles.bookNowBtn}>
                                        <Text style={styles.bookNowText}>Khám phá tour ngay</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* Saved Tours Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View>
                                    <Text style={styles.sectionTitle}>Cảm hứng du lịch</Text>
                                    <Text style={styles.sectionSubTitle}>Những điểm đến bạn đã lưu cho chuyến đi tới</Text>
                                </View>
                            </View>

                            {savedTours.length > 0 ? (
                                <View style={styles.savedGrid}>
                                    {savedTours.map((tour: any, index: number) => (
                                        <View key={index} style={styles.savedCard}>
                                            <View style={styles.savedImageWrapper}>
                                                <Image source={{ uri: tour.image }} style={styles.savedImage} />
                                                <TouchableOpacity style={styles.heartBtn}>
                                                    <Ionicons name="heart" size={24} color="#ba1a1a" />
                                                </TouchableOpacity>
                                            </View>
                                            <View style={styles.savedInfo}>
                                                <Text style={styles.savedTitle} numberOfLines={1}>{tour.title}</Text>
                                                <View style={styles.savedPriceRow}>
                                                    <Text style={styles.savedPrice}>{tour.price}</Text>
                                                    <Text style={styles.savedUnit}>/ người</Text>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <Ionicons name="heart-outline" size={64} color="#ccc" />
                                    <Text style={styles.emptyText}>Danh sách yêu thích đang trống</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
                <Footer />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fcf9f8",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 80, // Height of navigation bar
    },
    mainLayout: {
        maxWidth: 1400,
        width: "100%",
        alignSelf: "center",
        flexDirection: "row",
        paddingHorizontal: 48,
        paddingVertical: 48,
        gap: 48,
    },
    sidebar: {
        width: 300,
    },
    navContainer: {
        gap: 8,
    },
    navItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 16,
        gap: 16,
    },
    navItemActive: {
        backgroundColor: "#005bb2",
        shadowColor: "#005bb2",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    navText: {
        fontSize: 15,
        fontWeight: "500",
        color: "#414753",
    },
    navTextActive: {
        color: "#fff",
        fontWeight: "600",
    },
    contentArea: {
        flex: 1,
        gap: 64,
    },
    profileHeaderCard: {
        backgroundColor: "#fff",
        borderRadius: 40,
        padding: 40,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        shadowColor: "#005bb2",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 40,
        elevation: 2,
        position: "relative",
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#f0eded",
    },
    profileHeaderInfo: {
        flexDirection: "row",
        gap: 40,
        alignItems: "flex-start",
    },
    avatarWrapper: {
        position: "relative",
    },
    avatarContainer: {
        width: 128,
        height: 128,
        borderRadius: 40,
        overflow: "hidden",
        borderWidth: 6,
        borderColor: "#f6f3f2",
    },
    avatar: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    avatarPlaceholder: {
        backgroundColor: "#f6f3f2",
        justifyContent: "center",
        alignItems: "center",
    },
    cameraBtn: {
        position: "absolute",
        bottom: -8,
        right: -8,
        backgroundColor: "#fff",
        width: 44,
        height: 44,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    userNameSection: {
        gap: 12,
    },
    userName: {
        fontSize: 32,
        fontWeight: "800",
        color: "#1c1b1b",
        letterSpacing: -0.5,
    },
    contactInfo: {
        gap: 8,
    },
    contactItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    contactText: {
        fontSize: 15,
        fontWeight: "500",
        color: "#414753",
    },
    editProfileBtn: {
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: "#e5e2e1",
        backgroundColor: "#fff",
    },
    editProfileBtnText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1c1b1b",
    },
    section: {
        width: "100%",
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 40,
    },
    sectionTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: "#1c1b1b",
        letterSpacing: -0.5,
    },
    sectionSubTitle: {
        fontSize: 16,
        fontWeight: "500",
        color: "#414753",
        marginTop: 4,
    },
    viewAllBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    viewAllText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#005bb2",
    },
    toursGrid: {
        flexDirection: "row",
        gap: 40,
    },
    tourCard: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 32,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#f0eded",
        shadowColor: "#005bb2",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 2,
    },
    tourImageWrapper: {
        height: 256,
        width: "100%",
        position: "relative",
    },
    tourImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    modernBadge: {
        position: "absolute",
        top: 16,
        left: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    modernBadgeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    modernBadgeText: {
        fontSize: 12,
        fontWeight: "700",
    },
    tourCardContent: {
        padding: 20,
    },
    tourCardTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: 12,
        lineHeight: 24,
    },
    modernMetaRow: {
        flexDirection: "row",
        alignItems: 'center',
        gap: 16,
        marginBottom: 20,
    },
    modernMetaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    modernMetaText: {
        fontSize: 13,
        color: "#64748b",
        fontWeight: "500",
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        marginBottom: 20,
    },
    priceLabel: {
        fontSize: 13,
        color: '#94a3b8',
        fontWeight: '500',
    },
    priceValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fb7800',
    },
    modernActionBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: "#005bb2",
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: "center",
        gap: 8,
        shadowColor: "#005bb2",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 3,
    },
    modernActionBtnRow: {
        flexDirection: 'row',
        gap: 10,
    },
    payNowBtn: {
        backgroundColor: "#fb7800",
        shadowColor: "#fb7800",
    },
    modernActionBtnText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },
    savedGrid: {
        flexDirection: "row",
        gap: 40,
    },
    savedCard: {
        flex: 1,
    },
    savedImageWrapper: {
        aspectRatio: 4 / 5,
        width: "100%",
        borderRadius: 32,
        overflow: "hidden",
        marginBottom: 24,
        position: "relative",
        shadowColor: "#005bb2",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 2,
    },
    savedImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    heartBtn: {
        position: "absolute",
        top: 20,
        right: 20,
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        justifyContent: "center",
        alignItems: "center",
        // @ts-ignore
        backdropFilter: "blur(8px)",
    },
    savedInfo: {
        paddingHorizontal: 8,
        gap: 4,
    },
    savedTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1c1b1b",
    },
    savedPriceRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    savedPrice: {
        fontSize: 16,
        fontWeight: "800",
        color: "#005bb2",
    },
    savedUnit: {
        fontSize: 12,
        fontWeight: "500",
        color: "#414753",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        backgroundColor: "#fff",
        borderRadius: 32,
        borderWidth: 1,
        borderColor: "#f0eded",
        gap: 16,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#666",
    },
    bookNowBtn: {
        backgroundColor: "#005bb2",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 8,
    },
    bookNowText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 15,
    },
    paymentBadge: {
        position: "absolute",
        top: 15,
        left: 15,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    paymentBadgeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
    },
    bookingIdRow: {
        marginTop: 10,
        marginBottom: 5,
    },
    bookingIdText: {
        fontSize: 12,
        color: "#999",
        fontStyle: "italic",
    },
});
