import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NavigationBar from "@/components/ui/NavigationBar";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const CATEGORIES = ["All", "Japan", "Korea", "China", "USA", "Europe"];

const TOURS = [
  {
    id: 1,
    title: "Kyoto Cherry Blossom",
    location: "Kyoto, Japan",
    rating: 4.9,
    reviews: 128,
    date: "Apr 10 - 15",
    duration: "5 Days",
    type: "Group Tour",
    price: 1200,
    oldPrice: 1500,
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
  },
  {
    id: 2,
    title: "Seoul City Break",
    location: "International",
    rating: 4.7,
    duration: "3 Days",
    price: 900,
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc",
  },
  {
    id: 3,
    title: "Great Wall...",
    location: "Beijing, China",
    rating: 4.5,
    duration: "7 Days",
    price: 1450,
    image: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d",
  },
];

export default function TourScreen() {
  const router = useRouter();

  const handlePressTour = (tour: any) => {
    router.push({
      pathname: "/tour/TourDetailScreen",
      params: {
        title: tour.title,
        location: tour.location,
        price: tour.price,
        rating: tour.rating,
        reviews: tour.reviews,
        image: tour.image,
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tour Mate</Text>
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#BDBDBD"
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search destinations..."
            style={styles.searchInput}
          />
        </View>

        {/* Domestic/International Switch */}
        <View style={styles.switchContainer}>
          <TouchableOpacity style={styles.switchBtn}>
            <Text style={styles.switchTextInactive}>Domestic</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.switchBtn, styles.switchBtnActive]}>
            <Text style={styles.switchTextActive}>International</Text>
          </TouchableOpacity>
        </View>

        {/* Category Tags */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catScroll}
        >
          {CATEGORIES.map((cat, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.catBtn, i === 0 && styles.catBtnActive]}
            >
              <Text style={[styles.catText, i === 0 && styles.catTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Destinations</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Card */}
        <TouchableOpacity
          style={styles.featuredCard}
          onPress={() => handlePressTour(TOURS[0])}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: TOURS[0].image }}
            style={styles.featuredImage}
          />
          <TouchableOpacity style={styles.heartBtn}>
            <Ionicons name="heart" size={20} color="white" />
          </TouchableOpacity>
          <View style={styles.featuredRating}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>
              {" "}
              {TOURS[0].rating} ({TOURS[0].reviews})
            </Text>
          </View>
          <View style={styles.featuredInfo}>
            <Text style={styles.tourTitle}>{TOURS[0].title}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#8E8E93" />
              <Text style={styles.locationText}>{TOURS[0].location}</Text>
            </View>
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={14} color="#8E8E93" />
                <Text style={styles.detailText}>{TOURS[0].date}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={14} color="#8E8E93" />
                <Text style={styles.detailText}>{TOURS[0].duration}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="people-outline" size={14} color="#8E8E93" />
                <Text style={styles.detailText}>{TOURS[0].type}</Text>
              </View>
            </View>
            <View style={styles.priceRow}>
              <View>
                <Text style={styles.priceLabel}>Price per person</Text>
                <View style={styles.row}>
                  <Text style={styles.priceValue}>${TOURS[0].price}</Text>
                  <Text style={styles.oldPrice}> ${TOURS[0].oldPrice}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.bookBtn}>
                <Text style={styles.bookText}>Book Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>

        {/* List Items */}
        {TOURS.slice(1).map((tour) => (
          <TouchableOpacity
            key={tour.id}
            style={styles.listCard}
            onPress={() => handlePressTour(tour)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: tour.image }} style={styles.listImage} />
            <TouchableOpacity style={styles.listHeart}>
              <Ionicons name="heart" size={16} color="white" />
            </TouchableOpacity>
            <View style={styles.listContent}>
              <View style={styles.rowBetween}>
                <Text style={styles.listTitle}>{tour.title}</Text>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={12} color="#FFD700" />
                  <Text style={styles.ratingTextSmall}> {tour.rating}</Text>
                </View>
              </View>
              <View style={styles.row}>
                <Ionicons
                  name="paper-plane-outline"
                  size={12}
                  color="#8E8E93"
                />
                <Text style={styles.listLocation}> {tour.location}</Text>
              </View>
              <View style={styles.rowBetween}>
                <View style={styles.row}>
                  <Ionicons name="time-outline" size={12} color="#8E8E93" />
                  <Text style={styles.listDuration}> {tour.duration}</Text>
                </View>
                <Text style={styles.listPrice}>${tour.price}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Flight Info Banner */}
        <View style={styles.flightBanner}>
          <View style={styles.flightIconCircle}>
            <Ionicons name="airplane" size={20} color="#007BFF" />
          </View>
          <View style={styles.flightTextContent}>
            <Text style={styles.flightLabel}>Flying from</Text>
            <Text style={styles.flightLocation} numberOfLines={1}>
              San Francisco International (SFO)
            </Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="pencil" size={18} color="#007BFF" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
      <NavigationBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  content: { paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  filterBtn: { position: "absolute", right: 0 },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F4F8",
    borderRadius: 15,
    padding: 12,
    alignItems: "center",
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },
  switchContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F4F8",
    borderRadius: 15,
    marginTop: 20,
    padding: 4,
  },
  switchBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  switchBtnActive: { backgroundColor: "white", elevation: 2 },
  switchTextInactive: { color: "#8E8E93", fontWeight: "600" },
  switchTextActive: { color: "#007BFF", fontWeight: "bold" },
  catScroll: { marginVertical: 20 },
  catBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F4F8",
    marginRight: 10,
  },
  catBtnActive: { backgroundColor: "#007BFF" },
  catText: { color: "#8E8E93", fontWeight: "600" },
  catTextActive: { color: "white" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold" },
  viewAll: { color: "#007BFF", fontSize: 14 },
  featuredCard: {
    backgroundColor: "white",
    borderRadius: 25,
    overflow: "hidden",
    elevation: 3,
  },
  featuredImage: { width: "100%", height: 200 },
  heartBtn: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 8,
    borderRadius: 20,
  },
  featuredRating: {
    position: "absolute",
    top: 150,
    left: 15,
    backgroundColor: "rgba(0,0,0,0.5)",
    flexDirection: "row",
    padding: 6,
    borderRadius: 10,
    alignItems: "center",
  },
  ratingText: { color: "white", fontSize: 12, fontWeight: "bold" },
  featuredInfo: { padding: 15 },
  tourTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  locationText: { color: "#8E8E93", marginLeft: 4, fontSize: 13 },
  detailsRow: {
    flexDirection: "row",
    marginTop: 15,
    justifyContent: "space-between",
  },
  detailItem: { flexDirection: "row", alignItems: "center" },
  detailText: { marginLeft: 5, fontSize: 12, color: "#8E8E93" },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  priceLabel: { fontSize: 12, color: "#8E8E93" },
  priceValue: { fontSize: 22, fontWeight: "bold", color: "#007BFF" },
  oldPrice: {
    fontSize: 14,
    color: "#BDBDBD",
    textDecorationLine: "line-through",
    marginLeft: 5,
  },
  bookBtn: {
    backgroundColor: "#007BFF",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 15,
  },
  bookText: { color: "white", fontWeight: "bold" },
  listCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 10,
    marginTop: 15,
    elevation: 2,
  },
  listImage: { width: 90, height: 90, borderRadius: 15 },
  listHeart: { position: "absolute", top: 15, left: 70 },
  listContent: { flex: 1, marginLeft: 15, justifyContent: "space-between" },
  listTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ratingTextSmall: { fontSize: 11, fontWeight: "bold", color: "#333" },
  listLocation: { color: "#8E8E93", fontSize: 12 },
  listDuration: { color: "#8E8E93", fontSize: 12 },
  listPrice: { fontSize: 18, fontWeight: "bold", color: "#007BFF" },
  flightBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F7FF",
    padding: 15,
    borderRadius: 20,
    marginTop: 20,
  },
  flightIconCircle: { backgroundColor: "white", padding: 10, borderRadius: 15 },
  flightTextContent: { flex: 1, marginLeft: 12 },
  flightLabel: { fontSize: 12, color: "#8E8E93" },
  flightLocation: { fontSize: 13, fontWeight: "bold", color: "#333" },
  row: { flexDirection: "row", alignItems: "center" },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
