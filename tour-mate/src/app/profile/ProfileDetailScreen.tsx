import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
    Platform,
    ActivityIndicator,
    useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/context/AuthContext";
import { getUserProfile, updateUserProfile } from "@/services/auth/userService";
import FloatingInput from "@/components/ui/FloatingInput";
import ProfileDetailLayout from "@/components/profile/ProfileDetailLayout";

export default function ProfileDetailScreen() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === "web" && width > 1024;

    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState<{
        visible: boolean;
        type: "success" | "error" | "warning" | "info";
        title: string;
        message: string;
    }>({
        visible: false,
        type: "success",
        title: "",
        message: "",
    });

    const [formData, setFormData] = useState({
        full_name: "",
        add: "",
        phone: "",
        dob: "",
        bio: "",
        avatar: null as any,
        background: null as any,
    });

    const [previewImages, setPreviewImages] = useState({
        avatar: null as string | null,
        background: null as string | null,
    });

    const formatDateForDisplay = (dateStr: string) => {
        if (!dateStr) return "";
        let cleanDate = dateStr;
        if (cleanDate.includes("T")) {
            cleanDate = cleanDate.split("T")[0];
        }
        if (cleanDate.includes("-")) {
            const [y, m, d] = cleanDate.split("-");
            return `${d}/${m}/${y}`;
        }
        return dateStr;
    };

    useEffect(() => {
        const loadProfile = async () => {
            if (user?.user_name) {
                const res = await getUserProfile(user.user_name);
                if (res.success) {
                    const profile = res.data;
                    setFormData({
                        full_name: profile.full_name || "",
                        add: profile.add || "",
                        phone: profile.phone || "",
                        dob: profile.dob || "",
                        bio: profile.bio || "",
                        avatar: null,
                        background: null,
                    });
                    setPreviewImages({
                        avatar: profile.avatar || null,
                        background: profile.background || null,
                    });
                }
            }
            setLoading(false);
        };
        loadProfile();
    }, [user]);

    const pickImage = async (type: "avatar" | "background") => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: type === "avatar" ? [1, 1] : [16, 9],
            quality: 0.5,
        });

        if (!result.canceled) {
            const selectedImage = result.assets[0];
            setPreviewImages((prev) => ({ ...prev, [type]: selectedImage.uri }));
            setFormData((prev) => ({ ...prev, [type]: selectedImage }));
        }
    };

    const handleSave = async () => {
        if (!user?.user_id) return;
        setSaving(true);

        try {
            const data = new FormData();
            data.append("user_id", user.user_id);
            data.append("full_name", formData.full_name);
            data.append("add", formData.add);
            data.append("phone", formData.phone);
            data.append("dob", formData.dob);
            data.append("bio", formData.bio);

            if (formData.avatar) {
                if (Platform.OS === "web") {
                    const response = await fetch(formData.avatar.uri);
                    const blob = await response.blob();
                    data.append("avatar", blob, "avatar.jpg");
                } else {
                    const uri = formData.avatar.uri;
                    const name = uri.split("/").pop() || "avatar.jpg";
                    const type = `image/${name.split(".").pop() || "jpeg"}`;
                    data.append("avatar", { uri, name, type } as any);
                }
            }

            if (formData.background) {
                if (Platform.OS === "web") {
                    const response = await fetch(formData.background.uri);
                    const blob = await response.blob();
                    data.append("background", blob, "background.jpg");
                } else {
                    const uri = formData.background.uri;
                    const name = uri.split("/").pop() || "background.jpg";
                    const type = `image/${name.split(".").pop() || "jpeg"}`;
                    data.append("background", { uri, name, type } as any);
                }
            }

            const res = await updateUserProfile(data);
            if (res.success) {
                // Update global auth context to reflect changes immediately across the app
                await updateUser({
                    full_name: formData.full_name,
                    avatar: previewImages.avatar,
                    background: previewImages.background,
                });

                setNotification({
                    visible: true,
                    type: "success",
                    title: "Thành công",
                    message: "Hồ sơ của bạn đã được cập nhật.",
                });

                setTimeout(() => {
                    if (router.canGoBack()) {
                        router.back();
                    } else {
                        router.push("/profile/ProfileScreen");
                    }
                }, 2000);
            } else {
                setNotification({
                    visible: true,
                    type: "error",
                    title: "Lỗi",
                    message: res.message || "Cập nhật không thành công.",
                });
            }
        } catch (error) {
            console.error(error);
            setNotification({
                visible: true,
                type: "error",
                title: "Lỗi",
                message: "Có lỗi xảy ra khi cập nhật hồ sơ.",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007BFF" />
            </View>
        );
    }

    if (isWeb) {
        return (
            <ProfileDetailLayout
                formData={formData}
                setFormData={setFormData}
                previewImages={previewImages}
                pickImage={pickImage}
                handleSave={handleSave}
                saving={saving}
                notification={notification}
                setNotification={setNotification}
            />
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => {
                        if (router.canGoBack()) {
                            router.back();
                        } else {
                            router.push("/profile/ProfileScreen");
                        }
                    }}
                    style={styles.backButton}
                >
                    <Ionicons name="chevron-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    style={styles.headerSaveButton}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color="#007BFF" />
                    ) : (
                        <Text style={styles.headerSaveText}>Lưu</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Background & Avatar Picker */}
                <View style={styles.imageSection}>
                    <TouchableOpacity onPress={() => pickImage("background")} style={styles.backgroundPicker}>
                        {previewImages.background ? (
                            <Image source={{ uri: previewImages.background }} style={styles.backgroundImage} />
                        ) : (
                            <View style={styles.backgroundPlaceholder}>
                                <Ionicons name="image-outline" size={40} color="#ccc" />
                                <Text style={styles.placeholderText}>Thêm ảnh bìa</Text>
                            </View>
                        )}
                        <TouchableOpacity
                            style={styles.cameraIconBg}
                            onPress={() => pickImage("background")}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="camera" size={16} color="white" />
                        </TouchableOpacity>
                    </TouchableOpacity>

                    <View style={styles.avatarSection}>
                        <TouchableOpacity onPress={() => pickImage("avatar")} style={styles.avatarPicker}>
                            {previewImages.avatar ? (
                                <Image source={{ uri: previewImages.avatar }} style={styles.avatarImage} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Ionicons name="person" size={50} color="#ccc" />
                                </View>
                            )}
                            <View style={styles.cameraIconAvatar}>
                                <Ionicons name="camera" size={16} color="white" />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.changePhotoText}>Thay đổi ảnh đại diện</Text>
                    </View>
                </View>

                {/* Form Fields */}
                <View style={styles.form}>
                    <FloatingInput
                        label="Họ và tên"
                        value={formData.full_name}
                        onChangeText={(text) => setFormData((prev) => ({ ...prev, full_name: text }))}
                    />

                    <FloatingInput
                        label="Địa chỉ"
                        value={formData.add}
                        onChangeText={(text) => setFormData((prev) => ({ ...prev, add: text }))}
                        icon="location-outline"
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <FloatingInput
                                label="Số điện thoại"
                                value={formData.phone}
                                onChangeText={(text) => setFormData((prev) => ({ ...prev, phone: text }))}
                                keyboardType="phone-pad"
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <View style={styles.datePickerContainer}>
                                <Text style={styles.datePickerLabel}>Ngày sinh</Text>
                                <View style={styles.datePickerButton}>
                                    {Platform.OS === "web" ? (
                                        <input
                                            type="date"
                                            style={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                width: "100%",
                                                height: "100%",
                                                opacity: 0,
                                                cursor: "pointer",
                                                zIndex: 1,
                                                border: "none",
                                            }}
                                            value={formData.dob || ""}
                                            onChange={(e: any) => {
                                                setFormData((prev) => ({ ...prev, dob: e.target.value }));
                                            }}
                                        />
                                    ) : null}
                                    <TextInput
                                        style={[styles.datePickerText, !formData.dob && { color: "#999" }]}
                                        value={formatDateForDisplay(formData.dob)}
                                        onChangeText={(text) => setFormData((prev) => ({ ...prev, dob: text }))}
                                        placeholder="DD/MM/YYYY"
                                        editable={Platform.OS !== "web"}
                                    />
                                    <Ionicons name="calendar-outline" size={20} color="#005bb2" />
                                </View>
                            </View>
                        </View>
                    </View>

                    <FloatingInput
                        label="Tiểu sử"
                        value={formData.bio}
                        onChangeText={(text) => setFormData((prev) => ({ ...prev, bio: text }))}
                        multiline={true}
                        numberOfLines={4}
                        style={{ height: 120 }}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
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
    backButton: {
        position: "absolute",
        left: 10,
        top: 8,
        padding: 5,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },
    headerSaveButton: {
        position: "absolute",
        right: 10,
        top: 5,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    headerSaveText: {
        color: "#007BFF",
        fontWeight: "bold",
        fontSize: 15,
    },
    scrollContent: { paddingBottom: 10, paddingTop: 0 },
    imageSection: { marginBottom: 30 },
    backgroundPicker: { width: "100%", height: 180, backgroundColor: "#F0F2F5", position: "relative" },
    backgroundImage: { width: "100%", height: "100%", resizeMode: "cover" },
    backgroundPlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
    placeholderText: { color: "#ccc", marginTop: 5, fontSize: 12 },
    cameraIconBg: {
        position: "absolute",
        bottom: 15,
        right: 15,
        backgroundColor: "rgba(0,0,0,0.6)",
        padding: 10,
        borderRadius: 25,
    },
    avatarSection: { alignItems: "center", marginTop: -50 },
    avatarPicker: { position: "relative" },
    avatarImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: "#fff" },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#E5E5EA",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "#fff",
    },
    cameraIconAvatar: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#007BFF",
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "#fff",
    },
    changePhotoText: { color: "#007BFF", fontWeight: "bold", marginTop: 10, fontSize: 14 },
    form: { paddingHorizontal: 20 },
    datePickerContainer: {
        height: 60,
        borderWidth: 1.5,
        borderColor: "#e0e0e0",
        borderRadius: 12,
        backgroundColor: "#fff",
        position: "relative",
        justifyContent: "center",
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    datePickerLabel: {
        position: "absolute",
        left: 12,
        top: -10,
        fontSize: 12,
        color: "#666",
        backgroundColor: "#fff",
        paddingHorizontal: 6,
        zIndex: 10,
    },
    datePickerButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    datePickerText: {
        fontSize: 16,
        color: "#333",
    },
    row: { flexDirection: "row" },
});
