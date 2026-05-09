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
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import NavigationBar from "@/components/ui/NavigationBar";
import Footer from "@/components/ui/Footer";
import FloatingInput from "@/components/ui/FloatingInput";
import NotificationModal from "@/components/ui/NotificationModal";

const { width } = Dimensions.get("window");

interface ProfileDetailLayoutProps {
    formData: any;
    setFormData: (data: any) => void;
    previewImages: any;
    pickImage: (type: "avatar" | "background") => void;
    handleSave: () => void;
    saving: boolean;
    notification: any;
    setNotification: (notif: any) => void;
}

export default function ProfileDetailLayout({
    formData,
    setFormData,
    previewImages,
    pickImage,
    handleSave,
    saving,
    notification,
    setNotification,
}: ProfileDetailLayoutProps) {
    const router = useRouter();

    const sidebarItems = [
        { name: "Thông tin tài khoản", icon: "person-outline", active: true },
        { name: "Cài đặt", icon: "settings-outline", active: false },
    ];

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
                                    onPress={() => item.name === "Thông tin tài khoản" && router.push("/profile/ProfileScreen")}
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
                        {/* Header Section */}
                        <View style={styles.pageHeader}>
                            <View>
                                <Text style={styles.pageTitle}>Chỉnh sửa hồ sơ</Text>
                                <Text style={styles.pageSubtitle}>Cập nhật thông tin cá nhân và cài đặt tài khoản của bạn</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                                onPress={handleSave}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                                        <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Image Section */}
                        <View style={styles.coverWrapper}>
                            <Image
                                source={{ uri: previewImages.background || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop" }}
                                style={styles.coverImage}
                            />
                            <TouchableOpacity
                                style={styles.coverCameraBtn}
                                onPress={() => pickImage("background")}
                            >
                                <Ionicons name="camera" size={20} color="#fff" />
                                <Text style={styles.cameraBtnText}>Đổi ảnh bìa</Text>
                            </TouchableOpacity>

                            <View style={styles.avatarOverlap}>
                                <TouchableOpacity style={styles.avatarMain} onPress={() => pickImage("avatar")}>
                                    {previewImages.avatar ? (
                                        <Image source={{ uri: previewImages.avatar }} style={styles.avatarImg} />
                                    ) : (
                                        <View style={styles.avatarPlaceholder}>
                                            <Ionicons name="person" size={60} color="#ccc" />
                                        </View>
                                    )}
                                    <View style={styles.avatarCameraBtn}>
                                        <Ionicons name="camera" size={16} color="#fff" />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Basic Info Section */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="person-outline" size={22} color="#005bb2" />
                                <Text style={styles.cardTitle}>Thông tin cơ bản</Text>
                            </View>

                            <View style={styles.formGrid}>
                                <View style={styles.formRow}>
                                    <View style={styles.inputWrapper}>
                                        <FloatingInput
                                            label="Họ và tên"
                                            value={formData.full_name}
                                            onChangeText={(text: string) => setFormData((prev: any) => ({ ...prev, full_name: text }))}
                                            icon="person-outline"
                                        />
                                    </View>
                                    <View style={styles.inputWrapper}>
                                        <FloatingInput
                                            label="Số điện thoại"
                                            value={formData.phone}
                                            onChangeText={(text: string) => setFormData((prev: any) => ({ ...prev, phone: text }))}
                                            icon="call-outline"
                                            keyboardType="phone-pad"
                                        />
                                    </View>
                                </View>

                                <View style={styles.formRow}>
                                    <View style={styles.inputWrapper}>
                                        <View style={styles.nativeDateWrapper}>
                                            <Text style={styles.dateLabel}>Ngày sinh</Text>
                                            <input
                                                type="date"
                                                value={formData.dob ? formData.dob.split("T")[0] : ""}
                                                onChange={(e) => setFormData((prev: any) => ({ ...prev, dob: e.target.value }))}
                                                style={{
                                                    width: "100%",
                                                    height: 60,
                                                    padding: "0 16px",
                                                    fontSize: "16px",
                                                    outline: "none",
                                                    backgroundColor: "#fff",
                                                    border: "1.5px solid #e0e0e0",
                                                    borderRadius: "12px",
                                                    boxSizing: "border-box",
                                                    fontFamily: "inherit",
                                                    color: "#333",
                                                }}
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.inputWrapper}>
                                        <FloatingInput
                                            label="Địa chỉ"
                                            value={formData.add}
                                            onChangeText={(text: string) => setFormData((prev: any) => ({ ...prev, add: text }))}
                                            icon="location-outline"
                                        />
                                    </View>
                                </View>

                                <View style={styles.fullWidthInput}>
                                    <FloatingInput
                                        label="Tiểu sử bản thân"
                                        value={formData.bio}
                                        onChangeText={(text: string) => setFormData((prev: any) => ({ ...prev, bio: text }))}
                                        icon="book-outline"
                                        multiline
                                        numberOfLines={4}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
                <Footer />
            </ScrollView>

            <NotificationModal
                visible={notification.visible}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                onClose={() => setNotification((prev: any) => ({ ...prev, visible: false }))}
                autoClose={true}
                duration={3000}
            />
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
        paddingTop: 80,
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
    pageHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    pageTitle: {
        fontSize: 32,
        fontWeight: "800",
        color: "#1e293b",
        letterSpacing: -1,
    },
    pageSubtitle: {
        fontSize: 15,
        color: "#64748b",
        marginTop: 4,
    },
    saveBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#005bb2",
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 16,
        gap: 10,
        shadowColor: "#005bb2",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 4,
    },
    saveBtnDisabled: {
        backgroundColor: "#94a3b8",
        shadowOpacity: 0,
    },
    saveBtnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    card: {
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
        marginBottom: 32,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#1e293b",
    },
    coverWrapper: {
        height: 280,
        borderRadius: 24,
        overflow: "visible",
        position: "relative",
        marginBottom: 100,
    },
    coverImage: {
        width: "100%",
        height: "100%",
        borderRadius: 24,
        resizeMode: "cover",
    },
    coverCameraBtn: {
        position: "absolute",
        top: 20,
        right: 20,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
    },
    cameraBtnText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "600",
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
        overflow: "visible",
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
        borderRadius: 64,
        resizeMode: "cover",
    },
    avatarPlaceholder: {
        width: "100%",
        height: "100%",
        borderRadius: 64,
        backgroundColor: "#f1f5f9",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarCameraBtn: {
        position: "absolute",
        bottom: -5,
        right: -5,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#005bb2",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    formGrid: {
        gap: 24,
    },
    formRow: {
        flexDirection: "row",
        gap: 24,
    },
    inputWrapper: {
        flex: 1,
    },
    fullWidthInput: {
        width: "100%",
    },
    nativeDateWrapper: {
        position: "relative",
        width: "100%",
    },
    dateLabel: {
        position: "absolute",
        top: -10,
        left: 12,
        fontSize: 12,
        fontWeight: "600",
        color: "#666",
        backgroundColor: "#fff",
        paddingHorizontal: 6,
        zIndex: 10,
    },
});
