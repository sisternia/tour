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
import NavigationBar from "@/components/ui/NavigationBar";
import Footer from "@/components/ui/Footer";

const { width } = Dimensions.get("window");

interface ProfileLayoutProps {
    profile: any;
}

export default function ProfileLayout({ profile }: ProfileLayoutProps) {
    const sidebarItems = [
        { name: "Thông tin tài khoản", icon: "person", active: true },
        { name: "Tour đã đặt", icon: "ticket", active: false },
        { name: "Tour yêu thích", icon: "heart", active: false },
        { name: "Đánh giá của tôi", icon: "chatbubble-ellipses", active: false },
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
                                    {myTours.map((tour: any, index: number) => (
                                        <View key={index} style={styles.tourCard}>
                                            <View style={styles.tourImageWrapper}>
                                                <Image source={{ uri: tour.image }} style={styles.tourImage} />
                                                <View style={styles.statusBadge}>
                                                    <View style={[styles.statusDot, { backgroundColor: tour.statusColor }]} />
                                                    <Text style={styles.statusText}>{tour.status}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.tourCardContent}>
                                                <Text style={styles.tourCardTitle}>{tour.title}</Text>
                                                <View style={styles.tourMetaRow}>
                                                    <View style={styles.tourMetaItem}>
                                                        <View style={styles.metaIconBox}>
                                                            <Ionicons name="calendar" size={18} color="#005bb2" />
                                                        </View>
                                                        <Text style={styles.metaText}>{tour.date}</Text>
                                                    </View>
                                                    <View style={styles.tourMetaItem}>
                                                        <View style={styles.metaIconBox}>
                                                            <Ionicons name="time" size={18} color="#005bb2" />
                                                        </View>
                                                        <Text style={styles.metaText}>{tour.duration}</Text>
                                                    </View>
                                                </View>
                                                <TouchableOpacity style={[styles.tourActionBtn, index === 1 && styles.tourActionBtnSecondary]}>
                                                    <Text style={[styles.tourActionBtnText, index === 1 && styles.tourActionBtnTextSecondary]}>
                                                        {index === 0 ? "Chi tiết hành trình" : "Đánh giá ngay"}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))}
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
    statusBadge: {
        position: "absolute",
        top: 24,
        left: 24,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 100,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        // @ts-ignore
        backdropFilter: "blur(8px)",
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "800",
        color: "#005bb2",
    },
    tourCardContent: {
        padding: 32,
    },
    tourCardTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#1c1b1b",
        marginBottom: 16,
        lineHeight: 28,
    },
    tourMetaRow: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 32,
    },
    tourMetaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    metaIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#f6f3f2",
        justifyContent: "center",
        alignItems: "center",
    },
    metaText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#414753",
    },
    tourActionBtn: {
        width: "100%",
        paddingVertical: 16,
        borderRadius: 16,
        backgroundColor: "#005bb2",
        alignItems: "center",
        shadowColor: "#005bb2",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 5,
    },
    tourActionBtnSecondary: {
        backgroundColor: "#f0eded",
        shadowOpacity: 0,
        elevation: 0,
    },
    tourActionBtnText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#fff",
    },
    tourActionBtnTextSecondary: {
        color: "#1c1b1b",
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
});
