import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import NavigationBar from "@/components/ui/NavigationBar";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { getToursByGuide } from "@/services/guide/guideTourService";

const { width } = Dimensions.get("window");

export default function ManageTourScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const [activeFilter, setActiveFilter] = useState("Tất cả");
    const [tours, setTours] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const filters = ["Tất cả", "Sắp tới", "Đang diễn ra", "Hoàn thành"];

    useEffect(() => {
        const fetchTours = async () => {
            if (!user?._id) return;
            try {
                setLoading(true);
                const response = await getToursByGuide(user._id);
                if (response.success) {
                    setTours(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch tours:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTours();
    }, [user?._id]);

    const filteredTours = tours.filter(tour => {
        if (activeFilter === "Tất cả") return true;
        if (activeFilter === "Đang diễn ra") return tour.tour_status === "Đang diễn ra";
        if (activeFilter === "Sắp tới") return tour.tour_status === "Sắp tới" || tour.tour_status === "Đã duyệt";
        if (activeFilter === "Hoàn thành") return tour.tour_status === "Đã hoàn thành";
        return true;
    });

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Quản lý Tour</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.content}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterScroll}
                    contentContainerStyle={styles.filterContainer}
                >
                    {filters.map((f) => (
                        <TouchableOpacity
                            key={f}
                            onPress={() => setActiveFilter(f)}
                            style={[
                                styles.filterTab,
                                activeFilter === f && styles.filterTabActive
                            ]}
                        >
                            <Text style={[
                                styles.filterTabText,
                                activeFilter === f && styles.filterTabTextActive
                            ]}>
                                {f}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Text style={styles.sectionTitle}>Danh sách chuyến đi</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#005baf" style={{ marginTop: 50 }} />
                ) : filteredTours.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={60} color="#e0e2ec" />
                        <Text style={styles.emptyText}>Không có tour nào trong mục này</Text>
                    </View>
                ) : (
                    filteredTours.map((tour) => (
                        <View key={tour.instance_id || tour.tour_id} style={styles.tourCard}>
                            <View style={styles.statusBadgeContainer}>
                                <View
                                    style={[
                                        styles.statusBadge,
                                        {
                                            backgroundColor: tour.tour_status === "Đang diễn ra" ? "#ffdbc9" :
                                                tour.tour_status === "Đã hoàn thành" ? "#dcfce7" : "#d5e3fc"
                                        }
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.statusBadgeText,
                                            {
                                                color: tour.tour_status === "Đang diễn ra" ? "#753400" :
                                                    tour.tour_status === "Đã hoàn thành" ? "#166534" : "#005baf"
                                            }
                                        ]}
                                    >
                                        {tour.tour_status?.toUpperCase() || "SẮP TỚI"}
                                    </Text>
                                </View>
                                {tour.tour_status === "Sắp tới" && (
                                    <Text style={styles.timeToStart}>Sắp bắt đầu</Text>
                                )}
                            </View>

                            <View style={styles.cardHeader}>
                                <Image
                                    source={{ uri: tour.cover_img || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=300" }}
                                    style={styles.tourThumb}
                                />
                                <View style={styles.tourInfo}>
                                    <Text style={styles.tourTitle} numberOfLines={1}>{tour.tour_name}</Text>
                                    <View style={styles.infoRow}>
                                        <Ionicons name="calendar-outline" size={16} color="#64748b" />
                                        <Text style={styles.infoText}>
                                            {tour.time?.date_start ? new Date(tour.time.date_start).toLocaleDateString('vi-VN') : "Chưa cập nhật"}
                                        </Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Ionicons name="people-outline" size={16} color="#64748b" />
                                        <Text style={styles.infoText}>
                                            {tour.price?.tour_capacity || 0} Khách hàng
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.primaryBtn}
                                onPress={() => router.push({
                                    pathname: '/guide/ManageCustomerScreen',
                                    params: { 
                                        tourId: tour.tour_id,
                                        dateStart: tour.time.date_start,
                                        dateEnd: tour.time.date_end
                                    }
                                })}
                            >
                                <Ionicons name="people-circle-outline" size={20} color="white" />
                                <Text style={styles.primaryBtnText}>Quản lý khách hàng</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </ScrollView>

            <NavigationBar />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9ff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 8,
        backgroundColor: "transparent",
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#1c1b1b",
    },
    filterBtn: {
        padding: 4,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    filterScroll: {
        marginBottom: 24,
    },
    filterContainer: {
        gap: 12,
    },
    filterTab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#e0e2ec",
    },
    filterTabActive: {
        backgroundColor: "#005baf",
        borderColor: "#005baf",
    },
    filterTabText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#414753",
    },
    filterTabTextActive: {
        color: "white",
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#181c22",
        marginBottom: 16,
    },
    tourCard: {
        backgroundColor: "white",
        borderRadius: 24,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#e0e2ec",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    statusBadgeContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
    timeToStart: {
        fontSize: 12,
        color: "#f57c00",
        fontWeight: "700",
    },
    cardHeader: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 16,
    },
    tourThumb: {
        width: 80,
        height: 80,
        borderRadius: 16,
    },
    tourInfo: {
        flex: 1,
        justifyContent: "center",
        gap: 4,
    },
    tourTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1c1b1b",
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    infoText: {
        fontSize: 13,
        color: "#64748b",
    },
    primaryBtn: {
        backgroundColor: "#005baf",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: 16,
    },
    primaryBtnText: {
        color: "white",
        fontSize: 15,
        fontWeight: "700",
    },
    secondaryBtn: {
        backgroundColor: "white",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#005baf",
    },
    secondaryBtnText: {
        color: "#005baf",
        fontSize: 15,
        fontWeight: "700",
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
});
