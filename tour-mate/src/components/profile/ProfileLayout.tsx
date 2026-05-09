import React, { useState } from "react";
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
        { name: "Thông tin tài khoản", icon: "person-outline", active: true },
        { name: "Cài đặt", icon: "settings-outline", active: false },
    ];

    const myTours = profile?.tours || [];

    const paidSpend = myTours
        .filter((b: any) => b.status === 'paid')
        .reduce((acc: number, booking: any) => acc + Number(booking.total_price || 0), 0);

    const pendingSpend = myTours
        .filter((b: any) => b.status === 'pending')
        .reduce((acc: number, booking: any) => acc + Number(booking.total_price || 0), 0);

    const completedTours = myTours.filter((b: any) => b.status === 'paid').length;

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 2;
    const totalPages = Math.ceil(myTours.length / itemsPerPage);
    const currentTours = myTours.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
                                        size={20}
                                        color={item.active ? "#005bb2" : "#64748b"}
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
                        {/* Cover Section */}
                        <View style={styles.coverWrapper}>
                            <Image
                                source={{ uri: profile?.background || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop" }}
                                style={styles.coverImage}
                            />
                            <View style={styles.avatarOverlap}>
                                <View style={styles.avatarMain}>
                                    {profile?.avatar ? (
                                        <Image source={{ uri: profile.avatar }} style={styles.avatarImg} />
                                    ) : (
                                        <View style={styles.avatarPlaceholder}>
                                            <Ionicons name="person" size={60} color="#ccc" />
                                        </View>
                                    )}
                                </View>
                                <View style={styles.statusDot} />
                            </View>
                        </View>

                        {/* Dashboard Grid */}
                        <View style={styles.dashboardGrid}>
                            {/* Left Column - User Info */}
                            <View style={styles.leftCol}>
                                <View style={styles.infoCard}>
                                    <Text style={styles.profileName}>{profile?.full_name || "Chưa cập nhật tên"}</Text>
                                    <View style={styles.badgeRow}>
                                        <View style={styles.statusBadge}>
                                            <Text style={styles.statusBadgeText}>KHÁCH HÀNG</Text>
                                        </View>
                                        <Text style={styles.memberSince}>• Thành viên từ 2026</Text>
                                    </View>

                                    <View style={styles.divider} />

                                    <View style={styles.contactList}>
                                        <View style={styles.contactItem}>
                                            <View style={styles.contactIconBg}>
                                                <Ionicons name="mail-outline" size={18} color="#005bb2" />
                                            </View>
                                            <View>
                                                <Text style={styles.contactLabel}>Địa chỉ Email</Text>
                                                <Text style={styles.contactValue}>{profile?.email || "Chưa cập nhật"}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.contactItem}>
                                            <View style={styles.contactIconBg}>
                                                <Ionicons name="call-outline" size={18} color="#005bb2" />
                                            </View>
                                            <View>
                                                <Text style={styles.contactLabel}>Số điện thoại</Text>
                                                <Text style={styles.contactValue}>{profile?.phone || "Chưa cập nhật"}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.contactItem}>
                                            <View style={styles.contactIconBg}>
                                                <Ionicons name="calendar-outline" size={18} color="#005bb2" />
                                            </View>
                                            <View>
                                                <Text style={styles.contactLabel}>Ngày sinh</Text>
                                                <Text style={styles.contactValue}>{profile?.dob ? new Date(profile.dob).toLocaleDateString('vi-VN') : "Chưa cập nhật"}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.contactItem}>
                                            <View style={styles.contactIconBg}>
                                                <Ionicons name="location-outline" size={18} color="#005bb2" />
                                            </View>
                                            <View>
                                                <Text style={styles.contactLabel}>Địa chỉ chính</Text>
                                                <Text style={styles.contactValue}>{profile?.add || "Chưa cập nhật"}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.mainEditBtn}
                                        onPress={() => router.push("/profile/ProfileDetailScreen")}
                                    >
                                        <Ionicons name="create-outline" size={18} color="#fff" />
                                        <Text style={styles.mainEditBtnText}>Chỉnh sửa hồ sơ</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Right Column - Stats & Activity */}
                            <View style={styles.rightCol}>
                                {/* Bio Card */}
                                <View style={styles.bioCard}>
                                    <View style={styles.cardHeader}>
                                        <Ionicons name="book-outline" size={22} color="#005bb2" />
                                        <Text style={styles.cardTitle}>Tiểu sử</Text>
                                    </View>
                                    <View style={styles.bioQuote}>
                                        <Text style={styles.bioText}>"{profile?.bio || "Không có tiểu sử"}"</Text>
                                    </View>
                                </View>

                                {/* Stats Row */}
                                <View style={styles.statsRow}>
                                    <View style={[styles.statsCard, { flex: 1.2 }]}>
                                        <Text style={styles.statsLabel}>TỔNG CHI TIÊU</Text>
                                        <Text style={styles.statsValue} numberOfLines={1}>{paidSpend.toLocaleString()}đ</Text>
                                        <View style={[styles.statsIndicator, { backgroundColor: '#22c55e' }]} />
                                    </View>
                                    <View style={[styles.statsCard, { flex: 1.2 }]}>
                                        <Text style={styles.statsLabel}>CẦN THANH TOÁN</Text>
                                        <Text style={[styles.statsValue, { color: '#fb7800' }]} numberOfLines={1}>{pendingSpend.toLocaleString()}đ</Text>
                                        <View style={[styles.statsIndicator, { backgroundColor: '#fb7800' }]} />
                                    </View>
                                    <View style={[styles.statsCard, { flex: 0.8 }]}>
                                        <Text style={styles.statsLabel}>TOUR HOÀN THÀNH</Text>
                                        <View style={styles.completedToursRow}>
                                            <Text style={styles.statsValue} numberOfLines={1}>{completedTours}</Text>
                                            <View style={styles.avatarStack}>
                                                <View style={[styles.miniAvatar, { backgroundColor: '#fde68a' }]}>
                                                    <Ionicons name="person" size={10} color="#d97706" />
                                                </View>
                                                <View style={[styles.miniAvatar, { backgroundColor: '#bfdbfe', marginLeft: -8 }]}>
                                                    <Ionicons name="airplane" size={10} color="#2563eb" />
                                                </View>
                                            </View>
                                        </View>
                                        <View style={[styles.statsIndicator, { backgroundColor: '#005bb2' }]} />
                                    </View>
                                </View>

                                {/* Activity Card */}
                                <View style={styles.activityCard}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardTitleSm}>LỊCH SỬ HOẠT ĐỘNG GẦN ĐÂY</Text>
                                    </View>

                                    {myTours.length > 0 ? (
                                        <>
                                            <View style={styles.toursGrid}>
                                                {currentTours.map((booking: any, index: number) => {
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
                                                                    source={{ uri: tour.tour_image || "https://images.unsplash.com/photo-1596895111956-bf57059e00fa?auto=format&fit=crop" }}
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

                                            {totalPages > 1 && (
                                                <View style={styles.pagination}>
                                                    <TouchableOpacity
                                                        style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
                                                        onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                        disabled={currentPage === 1}
                                                    >
                                                        <Ionicons name="chevron-back" size={18} color={currentPage === 1 ? "#cbd5e1" : "#005bb2"} />
                                                        <Text style={[styles.pageBtnText, currentPage === 1 && styles.pageBtnTextDisabled]}>Trước</Text>
                                                    </TouchableOpacity>

                                                    <View style={styles.pageNumbers}>
                                                        {[...Array(totalPages)].map((_, i) => (
                                                            <TouchableOpacity
                                                                key={i}
                                                                style={[styles.pageNumber, currentPage === i + 1 && styles.pageNumberActive]}
                                                                onPress={() => setCurrentPage(i + 1)}
                                                            >
                                                                <Text style={[styles.pageNumberText, currentPage === i + 1 && styles.pageNumberTextActive]}>
                                                                    {i + 1}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        ))}
                                                    </View>

                                                    <TouchableOpacity
                                                        style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
                                                        onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                        disabled={currentPage === totalPages}
                                                    >
                                                        <Text style={[styles.pageBtnText, currentPage === totalPages && styles.pageBtnTextDisabled]}>Tiếp</Text>
                                                        <Ionicons name="chevron-forward" size={18} color={currentPage === totalPages ? "#cbd5e1" : "#005bb2"} />
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </>
                                    ) : (
                                        <View style={styles.emptyActivity}>
                                            <Text style={styles.emptyActivityText}>Chưa có hoạt động gần đây</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
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
        backgroundColor: "#f8fafc",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 80, // Navigation bar height
    },
    mainLayout: {
        maxWidth: 1500,
        width: "100%",
        alignSelf: "center",
        flexDirection: "row",
        paddingHorizontal: 48,
        paddingVertical: 48,
        gap: 48,
    },
    sidebar: {
        width: 300,
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 24,
        alignSelf: "flex-start",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
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
        backgroundColor: "#f0f7ff",
    },
    navText: {
        fontSize: 15,
        fontWeight: "500",
        color: "#64748b",
    },
    navTextActive: {
        color: "#005bb2",
        fontWeight: "600",
    },
    contentArea: {
        flex: 1,
        gap: 32,
    },
    coverWrapper: {
        height: 300,
        borderRadius: 32,
        overflow: "visible",
        position: "relative",
        marginBottom: 60,
    },
    coverImage: {
        width: "100%",
        height: "100%",
        borderRadius: 32,
        resizeMode: "cover",
    },
    avatarOverlap: {
        position: "absolute",
        bottom: -60,
        left: 40,
        zIndex: 10,
    },
    avatarMain: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 6,
        borderColor: "#fff",
        overflow: "hidden",
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    avatarImg: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    avatarPlaceholder: {
        width: "100%",
        height: "100%",
        backgroundColor: "#f1f5f9",
        justifyContent: "center",
        alignItems: "center",
    },
    statusDot: {
        position: "absolute",
        bottom: 12,
        right: 12,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#22c55e",
        borderWidth: 4,
        borderColor: "#fff",
    },
    dashboardGrid: {
        flexDirection: "row",
        gap: 32,
    },
    leftCol: {
        width: 360,
    },
    infoCard: {
        backgroundColor: "#fff",
        borderRadius: 32,
        padding: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        gap: 20,
    },
    profileName: {
        fontSize: 28,
        fontWeight: "800",
        color: "#1e293b",
        letterSpacing: -0.5,
    },
    badgeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    statusBadge: {
        backgroundColor: "#f0fdf4",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: "800",
        color: "#22c55e",
    },
    memberSince: {
        fontSize: 12,
        color: "#94a3b8",
        fontWeight: "500",
    },
    divider: {
        height: 1,
        backgroundColor: "#f1f5f9",
        marginVertical: 10,
    },
    contactList: {
        gap: 20,
    },
    contactItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    contactIconBg: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#f0f7ff",
        justifyContent: "center",
        alignItems: "center",
    },
    contactLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: "#94a3b8",
        marginBottom: 2,
    },
    contactValue: {
        fontSize: 14,
        fontWeight: "700",
        color: "#1e293b",
    },
    mainEditBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#005bb2",
        paddingVertical: 14,
        borderRadius: 16,
        gap: 10,
        marginTop: 12,
        shadowColor: "#005bb2",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4,
    },
    mainEditBtnText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
    },
    rightCol: {
        flex: 1,
        gap: 32,
    },
    bioCard: {
        backgroundColor: "#fff",
        borderRadius: 32,
        padding: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#1e293b",
    },
    bioQuote: {
        paddingLeft: 16,
        borderLeftWidth: 4,
        borderColor: "#bfdbfe",
    },
    bioText: {
        fontSize: 15,
        fontStyle: "italic",
        color: "#64748b",
        lineHeight: 24,
    },
    statsRow: {
        flexDirection: "row",
        gap: 16,
    },
    statsCard: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        position: "relative",
        overflow: "hidden",
    },
    statsLabel: {
        fontSize: 11,
        fontWeight: "800",
        color: "#64748b",
        marginBottom: 12,
    },
    statsValue: {
        fontSize: 22,
        fontWeight: "800",
        color: "#005bb2",
    },
    statsIndicator: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: "#005bb2",
    },
    completedToursRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    avatarStack: {
        flexDirection: "row",
        alignItems: "center",
    },
    miniAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    activityCard: {
        backgroundColor: "#fff",
        borderRadius: 32,
        padding: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardTitleSm: {
        fontSize: 13,
        fontWeight: "800",
        color: "#64748b",
        letterSpacing: 0.5,
    },
    toursGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 24,
        marginTop: 24,
    },
    tourCard: {
        width: "48%",
        backgroundColor: "#fff",
        borderRadius: 24,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#f1f5f9",
    },
    tourImageWrapper: {
        height: 180,
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
        top: 12,
        left: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
    },
    modernBadgeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    modernBadgeText: {
        fontSize: 10,
        fontWeight: "700",
    },
    tourCardContent: {
        padding: 16,
    },
    tourCardTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1e293b",
        marginBottom: 8,
    },
    modernMetaRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 16,
    },
    modernMetaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    modernMetaText: {
        fontSize: 12,
        color: "#64748b",
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        marginBottom: 16,
    },
    priceLabel: {
        fontSize: 12,
        color: '#94a3b8',
    },
    priceValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fb7800',
    },
    modernActionBtnRow: {
        flexDirection: 'row',
        gap: 8,
    },
    modernActionBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: "#005bb2",
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: "center",
        gap: 4,
    },
    payNowBtn: {
        backgroundColor: "#fb7800",
    },
    modernActionBtnText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "600",
    },
    emptyActivity: {
        paddingVertical: 40,
        alignItems: "center",
    },
    emptyActivityText: {
        color: "#94a3b8",
        fontSize: 14,
        fontWeight: "500",
    },
    pagination: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 32,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
    },
    pageBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: "#f0f7ff",
    },
    pageBtnDisabled: {
        backgroundColor: "#f8fafc",
    },
    pageBtnText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#005bb2",
    },
    pageBtnTextDisabled: {
        color: "#cbd5e1",
    },
    pageNumbers: {
        flexDirection: "row",
        gap: 8,
    },
    pageNumber: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8fafc",
    },
    pageNumberActive: {
        backgroundColor: "#005bb2",
    },
    pageNumberText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#64748b",
    },
    pageNumberTextActive: {
        color: "#fff",
    },
});
