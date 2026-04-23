import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff",
  "https://images.unsplash.com/photo-1533105079780-92b9be482077",
  "https://images.unsplash.com/photo-1516483642774-72383089b3ad",
  "https://images.unsplash.com/photo-1469044092281-1c9e8a147d28",
];

const REVIEWS = [
  {
    id: 1,
    user: "John Doe",
    rating: 5,
    comment: "An unforgettable experience! The views were spectacular.",
    date: "2 days ago",
    avatar: "https://i.pravatar.cc/150?u=john",
  },
  {
    id: 2,
    user: "Maria Garcia",
    rating: 4,
    comment: "Very well organized. Our guide Alex was very knowledgeable.",
    date: "1 week ago",
    avatar: "https://i.pravatar.cc/150?u=maria",
  },
];

export default function TourDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const tour = {
    title: params.title || "Santorini Island Full-Day Highlight Tour",
    location: params.location || "Santorini, Greece",
    price: params.price || "120",
    rating: params.rating || "4.8",
    reviews: params.reviews || "120",
    image: params.image || GALLERY_IMAGES[0],
    duration: "8 Hours",
    groupSize: "Max 12",
    language: "Eng, Grk",
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={{ uri: tour.image as string }}
          style={styles.headerImage}
        >
          <View style={styles.headerControls}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.iconBtn}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <View style={styles.row}>
              <TouchableOpacity style={[styles.iconBtn, { marginRight: 10 }]}>
                <Ionicons name="share-outline" size={24} color="black" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="heart-outline" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.titleOverlay}>
            <View style={styles.bestsellerBadge}>
              <Text style={styles.bestsellerText}>Bestseller</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>
                {" "}
                {tour.rating} ({tour.reviews})
              </Text>
            </View>
            <Text style={styles.mainTitle}>{tour.title}</Text>
          </View>
        </ImageBackground>

        <View style={styles.contentCard}>
          <View style={styles.tabRow}>
            <TouchableOpacity style={styles.activeTab}>
              <Text style={styles.activeTabText}>Overview</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.inactiveTab}>
              <Text style={styles.inactiveTabText}>Itinerary</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.inactiveTab}>
              <Text style={styles.inactiveTabText}>Reviews</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color="#007BFF" />
              <Text style={styles.infoLabel}>DURATION</Text>
              <Text style={styles.infoValue}>{tour.duration}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="people-outline" size={20} color="#007BFF" />
              <Text style={styles.infoLabel}>GROUP SIZE</Text>
              <Text style={styles.infoValue}>{tour.groupSize}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="language-outline" size={20} color="#007BFF" />
              <Text style={styles.infoLabel}>LANGUAGE</Text>
              <Text style={styles.infoValue}>{tour.language}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>About the Experience</Text>
          <Text style={styles.description}>
            Experience the magic of Santorini on this comprehensive full-day
            tour. Start your day with breathtaking views from the highest point
            of the island.
          </Text>

          {/* ITINERARY */}
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Itinerary</Text>
            <TouchableOpacity>
              <Text style={styles.linkText}>Expand All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.timelineItem}>
            <View style={styles.timelineDotActive} />
            <View style={styles.timelineLine} />
            <View style={styles.timelineContent}>
              <Text style={styles.timeText}>09:00 AM</Text>
              <View style={styles.itineraryBox}>
                <Text style={styles.itineraryTitle}>Pickup from Hotel</Text>
                <Text style={styles.itineraryDesc}>
                  Comfortable AC minivan pickup from your designated location.
                </Text>
              </View>
            </View>
          </View>

          {/* GALLERY */}
          <Text style={styles.sectionTitle}>Gallery</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.galleryScroll}
          >
            {GALLERY_IMAGES.map((img, i) => (
              <Image
                key={i}
                source={{ uri: img }}
                style={styles.galleryImage}
              />
            ))}
          </ScrollView>

          {/* MEETING POINT */}
          <Text style={styles.sectionTitle}>Meeting Point</Text>
          <View style={styles.meetingCard}>
            <View style={styles.meetingInfo}>
              <Ionicons name="location" size={20} color="#FF3B30" />
              <View style={styles.meetingTextContainer}>
                <Text style={styles.meetingTitle}>Fira Central Square</Text>
                <Text style={styles.meetingSub}>
                  Next to the Orthodox Metropolitan Cathedral
                </Text>
              </View>
            </View>
            <Image
              source={{
                uri: "https://maps.googleapis.com/maps/api/staticmap?center=36.4166,25.4333&zoom=15&size=600x300&key=YOUR_API_KEY",
              }}
              style={styles.mapStatic}
            />
          </View>

          {/* REVIEWS */}
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <TouchableOpacity>
              <Text style={styles.linkText}>See All</Text>
            </TouchableOpacity>
          </View>
          {REVIEWS.map((rev) => (
            <View key={rev.id} style={styles.reviewCard}>
              <Image source={{ uri: rev.avatar }} style={styles.reviewAvatar} />
              <View style={styles.reviewMain}>
                <View style={styles.rowBetween}>
                  <Text style={styles.reviewUser}>{rev.user}</Text>
                  <Text style={styles.reviewDate}>{rev.date}</Text>
                </View>
                <View style={styles.row}>
                  {[...Array(rev.rating)].map((_, i) => (
                    <Ionicons key={i} name="star" size={12} color="#FFD700" />
                  ))}
                </View>
                <Text style={styles.reviewComment}>{rev.comment}</Text>
              </View>
            </View>
          ))}
          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalPriceLabel}>Total Price</Text>
          <Text style={styles.totalPriceValue}>
            ${tour.price}
            <Text style={styles.perPerson}> / person</Text>
          </Text>
        </View>
        <TouchableOpacity style={styles.mainBookBtn}>
          <Text style={styles.mainBookText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  headerImage: { width: "100%", height: 350, justifyContent: "space-between" },
  headerControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  iconBtn: {
    backgroundColor: "white",
    padding: 8,
    borderRadius: 20,
    elevation: 2,
  },
  titleOverlay: { padding: 20, backgroundColor: "rgba(0,0,0,0.2)" },
  bestsellerBadge: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  bestsellerText: { fontSize: 12, fontWeight: "bold", color: "#333" },
  ratingBadge: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  ratingText: { color: "white", fontWeight: "bold" },
  mainTitle: { color: "white", fontSize: 24, fontWeight: "bold", marginTop: 5 },
  contentCard: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    padding: 20,
  },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    marginBottom: 20,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#007BFF",
    paddingBottom: 10,
    marginRight: 20,
  },
  activeTabText: { color: "#007BFF", fontWeight: "bold" },
  inactiveTab: { paddingBottom: 10, marginRight: 20 },
  inactiveTabText: { color: "#8E8E93" },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  infoItem: { alignItems: "center" },
  infoLabel: { fontSize: 10, color: "#8E8E93", marginTop: 5 },
  infoValue: { fontSize: 14, fontWeight: "bold" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 15,
  },
  description: { fontSize: 14, color: "#666", lineHeight: 22 },
  linkText: { color: "#007BFF", fontSize: 13, fontWeight: "bold" },
  timelineItem: { flexDirection: "row" },
  timelineDotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007BFF",
    zIndex: 1,
  },
  timelineLine: {
    position: "absolute",
    left: 4,
    top: 10,
    bottom: 0,
    width: 2,
    backgroundColor: "#F0F0F0",
  },
  timelineContent: { marginLeft: 15, flex: 1 },
  timeText: { fontWeight: "bold", fontSize: 14 },
  itineraryBox: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 12,
    marginTop: 5,
  },
  itineraryTitle: { fontWeight: "bold", fontSize: 14 },
  itineraryDesc: { fontSize: 12, color: "#666", marginTop: 2 },
  galleryScroll: { flexDirection: "row" },
  galleryImage: { width: 120, height: 120, borderRadius: 15, marginRight: 10 },
  meetingCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    overflow: "hidden",
  },
  meetingInfo: { flexDirection: "row", padding: 15, alignItems: "center" },
  meetingTextContainer: { marginLeft: 10 },
  meetingTitle: { fontWeight: "bold", fontSize: 15 },
  meetingSub: { fontSize: 12, color: "#666" },
  mapStatic: { width: "100%", height: 150 },
  reviewCard: { flexDirection: "row", marginBottom: 15 },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20 },
  reviewMain: { flex: 1, marginLeft: 12 },
  reviewUser: { fontWeight: "bold", fontSize: 14 },
  reviewDate: { fontSize: 11, color: "#8E8E93" },
  reviewComment: { fontSize: 13, color: "#444", marginTop: 4 },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: width,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    backgroundColor: "white",
  },
  totalPriceLabel: { fontSize: 12, color: "#8E8E93" },
  totalPriceValue: { fontSize: 22, fontWeight: "bold" },
  perPerson: { fontSize: 14, fontWeight: "normal", color: "#8E8E93" },
  mainBookBtn: {
    backgroundColor: "#007BFF",
    paddingHorizontal: 35,
    paddingVertical: 15,
    borderRadius: 15,
  },
  mainBookText: { color: "white", fontWeight: "bold", fontSize: 16 },
  row: { flexDirection: "row", alignItems: "center" },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
