import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import NavigationBar from "@/components/ui/NavigationBar";
import ProfileLayout from "@/components/profile/ProfileLayout";
import NotificationModal from "@/components/ui/NotificationModal";
import { useAuth } from "@/context/AuthContext";
import { getUserProfile } from "@/services/auth/userService";
import { getUserReviewImages } from "@/services/tour/reviewService";
import { router } from "expo-router";

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web" && width > 1024;

  const { user, logout, updateUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Bài viết");
  const [reviewImages, setReviewImages] = useState<string[]>([]);

  useEffect(() => {
    const loadProfile = async () => {
      if (user?.user_name) {
        const res = await getUserProfile(user.user_name);
        if (res.success) {
          setProfile(res.data);
          // Sync profile data to AuthContext so other components (like NavigationBar) can use it
          updateUser(res.data);
        }
      }
      setLoading(false);
    };
    loadProfile();
  }, [user?.user_name]);

  useEffect(() => {
    if (activeTab === "Đánh giá" && user?.user_id) {
       getUserReviewImages(user.user_id).then(res => {
         if (res.success) setReviewImages(res.data);
       });
    }
  }, [activeTab, user?.user_id]);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    router.replace("/auth/LoginScreen");
  };

  const renderMobileProfile = () => (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Background Cover */}
        <View style={styles.backgroundContainer}>
          {profile?.background ? (
            <Image source={{ uri: profile.background }} style={styles.backgroundImage} />
          ) : (
            <View style={styles.backgroundPlaceholder}>
              <Ionicons name="image-outline" size={40} color="#ccc" />
            </View>
          )}
          <TouchableOpacity 
            style={styles.settingsIcon} 
            onPress={() => setShowMenu(!showMenu)}
          >
            <Ionicons name="settings-sharp" size={16} color="white" />
          </TouchableOpacity>

          {showMenu && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => {
                  setShowMenu(false);
                  setShowLogoutModal(true);
                }}
              >
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                <Text style={styles.menuItemText}>Đăng xuất</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.editBgIcon} onPress={() => router.push("/profile/ProfileDetailScreen")}>
            <Ionicons name="camera" size={16} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <View style={[styles.avatarContainer, { marginTop: -50 }]}>
            {profile?.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={50} color="#ccc" />
              </View>
            )}
            <TouchableOpacity style={styles.editIcon} onPress={() => router.push("/profile/ProfileDetailScreen")}>
              <Ionicons name="camera" size={14} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{profile?.full_name || "Chưa cập nhật tên"}</Text>
          <Text style={styles.handle}>@{profile?.user_name || "user"} • {profile?.add || "Chưa cập nhật địa chỉ"}</Text>
          {profile?.email && <Text style={styles.emailText}>{profile.email}</Text>}
          <Text style={styles.bio}>
            {profile?.bio || "Chưa cập nhật tiểu sử"}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>0</Text>
            <Text style={styles.statLabel}>CHUYẾN ĐI</Text>
          </View>
          <View style={[styles.statBox, styles.statBorder]}>
            <Text style={styles.statNum}>0</Text>
            <Text style={styles.statLabel}>NGƯỜI THEO DÕI</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>0</Text>
            <Text style={styles.statLabel}>ĐANG THEO DÕI</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.editBtn} onPress={() => router.push("/profile/ProfileDetailScreen")}>
            <Ionicons name="create-outline" size={18} color="white" />
            <Text style={styles.editBtnText}>Chỉnh sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn}>
            <Ionicons name="share-outline" size={18} color="black" />
            <Text style={styles.shareBtnText}>Chia sẻ</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity style={activeTab === "Bài viết" ? styles.activeTab : styles.inactiveTab} onPress={() => setActiveTab("Bài viết")}>
            <Text style={activeTab === "Bài viết" ? styles.activeTabText : styles.inactiveTabText}>Bài viết</Text>
          </TouchableOpacity>
          <TouchableOpacity style={activeTab === "Đã lưu" ? styles.activeTab : styles.inactiveTab} onPress={() => setActiveTab("Đã lưu")}>
            <Text style={activeTab === "Đã lưu" ? styles.activeTabText : styles.inactiveTabText}>Đã lưu</Text>
          </TouchableOpacity>
          <TouchableOpacity style={activeTab === "Đánh giá" ? styles.activeTab : styles.inactiveTab} onPress={() => setActiveTab("Đánh giá")}>
            <Text style={activeTab === "Đánh giá" ? styles.activeTabText : styles.inactiveTabText}>Đánh giá</Text>
          </TouchableOpacity>
        </View>

        {activeTab === "Đánh giá" ? (
           reviewImages.length > 0 ? (
             <View style={styles.reviewImageGrid}>
               {reviewImages.map((uri, idx) => (
                 <Image key={idx} source={{ uri }} style={styles.reviewGridImage} />
               ))}
             </View>
           ) : (
             <View style={styles.emptyGrid}>
               <Ionicons name="images-outline" size={50} color="#E5E5E5" />
               <Text style={styles.emptyText}>Chưa có ảnh đánh giá nào</Text>
             </View>
           )
        ) : (
          <View style={styles.emptyGrid}>
            <Ionicons name="images-outline" size={50} color="#E5E5E5" />
            <Text style={styles.emptyText}>Chưa có {activeTab.toLowerCase()} nào</Text>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
      <NotificationModal
        visible={showLogoutModal}
        type="warning"
        title="Đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?"
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        confirmText="Đăng xuất"
      />

      <NavigationBar />
    </SafeAreaView>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#005bb2" />
      </View>
    );
  }

  if (isWeb) {
    return <ProfileLayout profile={profile} />;
  }

  return renderMobileProfile();
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  backgroundContainer: { position: "relative", width: "100%", height: 200 },
  backgroundImage: { width: "100%", height: "100%", resizeMode: "cover" },
  backgroundPlaceholder: { width: "100%", height: "100%", backgroundColor: "#F0F2F5", justifyContent: "center", alignItems: "center" },
  settingsIcon: { position: "absolute", top: 10, right: 15, backgroundColor: "rgba(0,0,0,0.5)", padding: 8, borderRadius: 20 },
  editBgIcon: { position: "absolute", bottom: 10, right: 15, backgroundColor: "rgba(0,0,0,0.5)", padding: 8, borderRadius: 20 },
  profileSection: { alignItems: "center" },
  avatarContainer: { position: "relative" },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#007BFF",
  },
  avatarPlaceholder: {
    backgroundColor: "#E5E5EA",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "white",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007BFF",
    padding: 6,
    borderRadius: 15,
  },
  userName: { fontSize: 22, fontWeight: "bold", marginTop: 10 },
  handle: { color: "#8E8E93", fontSize: 14 },
  emailText: { color: "#007BFF", fontSize: 13, marginTop: 4, fontWeight: "500" },
  bio: {
    textAlign: "center",
    paddingHorizontal: 40,
    marginTop: 12,
    color: "#444",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  statBox: { alignItems: "center", flex: 1 },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#E5E5E5",
  },
  statNum: { fontSize: 18, fontWeight: "bold" },
  statLabel: { fontSize: 10, color: "#8E8E93", marginTop: 4 },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  editBtn: {
    flex: 1,
    backgroundColor: "#007BFF",
    height: 45,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  editBtnText: { color: "white", fontWeight: "bold" },
  shareBtn: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    height: 45,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  shareBtnText: { color: "black", fontWeight: "bold" },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    marginTop: 20,
  },
  activeTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#007BFF",
  },
  activeTabText: { color: "#007BFF", fontWeight: "bold" },
  inactiveTab: { flex: 1, alignItems: "center", paddingVertical: 15 },
  inactiveTabText: { color: "#8E8E93" },
  emptyGrid: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 10,
  },
  dropdownMenu: {
    position: "absolute",
    top: 50,
    right: 15,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 8,
    width: 150,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 10,
  },
  menuItemText: {
    fontSize: 15,
    color: "#EF4444",
    fontWeight: "600",
  },
  reviewImageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 2,
  },
  reviewGridImage: {
    width: "33%",
    aspectRatio: 1,
    margin: "0.16%",
  },
});
