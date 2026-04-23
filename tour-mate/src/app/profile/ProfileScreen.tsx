import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NavigationBar from "@/components/ui/NavigationBar";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const images = [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
    "https://images.unsplash.com/photo-1501854140801-50d01698950b",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity>
          <Ionicons name="settings-sharp" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: "https://i.pravatar.cc/150?u=alex" }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editIcon}>
              <Ionicons name="pencil" size={12} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>Alex Johnson</Text>
          <Text style={styles.handle}>@alexj • New York, USA</Text>
          <Text style={styles.bio}>
            Exploring the world one coffee shop at a time ✈️☕
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>42</Text>
            <Text style={styles.statLabel}>TRIPS</Text>
          </View>
          <View style={[styles.statBox, styles.statBorder]}>
            <Text style={styles.statNum}>1.5k</Text>
            <Text style={styles.statLabel}>FOLLOWERS</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>340</Text>
            <Text style={styles.statLabel}>FOLLOWING</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="create-outline" size={18} color="white" />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn}>
            <Ionicons name="share-outline" size={18} color="black" />
            <Text style={styles.shareBtnText}>Share Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity style={styles.activeTab}>
            <Text style={styles.activeTabText}>Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.inactiveTab}>
            <Text style={styles.inactiveTabText}>Saved Trips</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.inactiveTab}>
            <Text style={styles.inactiveTabText}>Reviews</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {images.map((img, index) => (
            <Image key={index} source={{ uri: img }} style={styles.gridImage} />
          ))}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
      <NavigationBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  profileSection: { alignItems: "center", marginTop: 20 },
  avatarContainer: { position: "relative" },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#007BFF",
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
  bio: {
    textAlign: "center",
    paddingHorizontal: 40,
    marginTop: 10,
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
  grid: { flexDirection: "row", flexWrap: "wrap" },
  gridImage: {
    width: width / 3,
    height: width / 3,
    borderWidth: 1,
    borderColor: "#fff",
  },
});
