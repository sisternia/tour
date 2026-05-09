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
  Platform,
  Modal,
  FlatList,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import Map from "@/components/ui/Map";
import TourDetailLayout from "@/components/tour/TourDetailLayout";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { getTourById } from "@/services/tour/tourService";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function TourDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web" && width > 1024;

  const [tour, setTour] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const webViewRef = React.useRef<any>(null);

  // Booking State
  const [adultCount, setAdultCount] = React.useState(2);
  const [childCount, setChildCount] = React.useState(0);
  const [heroIndex, setHeroIndex] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState("overview");

  // Gallery Modal State
  const [isGalleryVisible, setIsGalleryVisible] = React.useState(false);
  const [activeImageIndex, setActiveImageIndex] = React.useState(0);
  const [galleryImages, setGalleryImages] = React.useState<string[]>([]);
  const galleryListRef = React.useRef<FlatList>(null);

  const openGallery = (images: string[], index: number) => {
    setGalleryImages(images);
    setActiveImageIndex(index);
    setIsGalleryVisible(true);
  };

  const focusMapMarker = (index: number) => {
    const message = JSON.stringify({ type: "FOCUS_MARKER", index });
    if (Platform.OS === "web") {
      const iframe = document.getElementById(
        "tour-map-iframe",
      ) as HTMLIFrameElement;
      iframe?.contentWindow?.postMessage(message, "*");
    } else {
      webViewRef.current?.postMessage(message);
    }
  };

  React.useEffect(() => {
    const tourId = params.id || params.tour_id;
    if (tourId) {
      fetchTourDetails(tourId as string);
    } else {
      setError("Không tìm thấy mã tour");
      setLoading(false);
    }
  }, [params.id, params.tour_id]);

  const fetchTourDetails = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getTourById(id);
      if (result.success && result.data) {
        setTour(result.data);
      } else {
        setError(result.message || "Không thể tải thông tin tour");
      }
    } catch (err: any) {
      setError("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (days: number) => {
    if (!days) return "Chưa xác định";
    const nights = Math.max(0, days - 1);
    return `${days} ngày ${nights} đêm`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Chưa xác định";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN");
    } catch (e) {
      return dateStr;
    }
  };

  const getScheduleDate = (startDateStr: string, dayNumber: number) => {
    if (!startDateStr) return "";
    const startDate = new Date(startDateStr);
    const targetDate = new Date(startDate);
    targetDate.setDate(startDate.getDate() + (dayNumber - 1));
    return targetDate.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  };

  const renderGalleryModal = () => (
    <Modal
      visible={isGalleryVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setIsGalleryVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer} edges={["top"]}>
        <TouchableOpacity
          style={styles.closeModalBtn}
          onPress={() => setIsGalleryVisible(false)}
        >
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>

        <FlatList
          ref={galleryListRef}
          data={galleryImages}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={activeImageIndex}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setActiveImageIndex(index);
          }}
          renderItem={({ item }) => (
            <View style={{ width, height: height, justifyContent: "center" }}>
              <Image
                source={{ uri: item }}
                style={{ width: "100%", height: "80%" }}
                resizeMode="contain"
              />
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />

        {Platform.OS === "web" && (
          <>
            {activeImageIndex > 0 && (
              <TouchableOpacity
                style={[styles.navArrow, { left: 20 }]}
                onPress={() => {
                  const newIndex = activeImageIndex - 1;
                  setActiveImageIndex(newIndex);
                  galleryListRef.current?.scrollToIndex({ index: newIndex });
                }}
              >
                <Ionicons name="chevron-back" size={40} color="white" />
              </TouchableOpacity>
            )}
            {activeImageIndex < galleryImages.length - 1 && (
              <TouchableOpacity
                style={[styles.navArrow, { right: 20 }]}
                onPress={() => {
                  const newIndex = activeImageIndex + 1;
                  setActiveImageIndex(newIndex);
                  galleryListRef.current?.scrollToIndex({ index: newIndex });
                }}
              >
                <Ionicons name="chevron-forward" size={40} color="white" />
              </TouchableOpacity>
            )}
          </>
        )}

        <div
          style={{
            position: "absolute",
            bottom: 50,
            width: "100%",
            textAlign: "center",
          }}
        >
          <span
            style={{
              color: "white",
              fontWeight: "bold",
              background: "rgba(0,0,0,0.5)",
              padding: "5px 15px",
              borderRadius: "15px",
            }}
          >
            {activeImageIndex + 1} / {galleryImages.length}
          </span>
        </div>
      </SafeAreaView>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={{ marginTop: 10, color: "#666" }}>
          Đang tải chi tiết tour...
        </Text>
      </SafeAreaView>
    );
  }

  if (error || !tour) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center", padding: 20 },
        ]}
      >
        <Ionicons name="alert-circle-outline" size={50} color="#FF3B30" />
        <Text
          style={{
            fontSize: 16,
            color: "#333",
            marginTop: 10,
            textAlign: "center",
          }}
        >
          {error || "Không thể tìm thấy tour"}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginTop: 20,
            padding: 10,
            backgroundColor: "#007BFF",
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "white" }}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const coverImage =
    tour.images?.find((img: any) => img.img_is_cover)?.tour_img_url ||
    tour.images?.[0]?.tour_img_url;

  if (isWeb)
    return (
      <>
        <TourDetailLayout
          tour={tour}
          heroIndex={heroIndex}
          setHeroIndex={setHeroIndex}
          adultCount={adultCount}
          setAdultCount={setAdultCount}
          childCount={childCount}
          setChildCount={setChildCount}
          openGallery={openGallery}
          formatDuration={formatDuration}
          formatDate={formatDate}
          getScheduleDate={getScheduleDate}
        />
        {renderGalleryModal()}
      </>
    );

  return (
    <View style={styles.container}>
      {renderGalleryModal()}
      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={{ uri: coverImage }}
          style={styles.headerImage}
        >
          <Pressable
            style={{ flex: 1 }}
            onPress={() =>
              openGallery(
                tour.images?.map((img: any) => img.tour_img_url) || [],
                0,
              )
            }
          >
            <SafeAreaView style={styles.headerControls} edges={["top"]}>
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
            </SafeAreaView>

            <View style={styles.titleOverlay}>
              <View style={styles.bestsellerBadge}>
                <Text style={styles.bestsellerText}>Tour nổi bật</Text>
              </View>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingTextMobile}> 4.8 (120 đánh giá)</Text>
              </View>
              <Text style={styles.mainTitle}>{tour.tour_name}</Text>
            </View>
          </Pressable>
        </ImageBackground>

        <View style={styles.contentCard}>
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={
                activeTab === "overview" ? styles.activeTab : styles.inactiveTab
              }
              onPress={() => setActiveTab("overview")}
            >
              <Text
                style={
                  activeTab === "overview"
                    ? styles.activeTabText
                    : styles.inactiveTabText
                }
              >
                Tổng quan
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={
                activeTab === "itinerary"
                  ? styles.activeTab
                  : styles.inactiveTab
              }
              onPress={() => setActiveTab("itinerary")}
            >
              <Text
                style={
                  activeTab === "itinerary"
                    ? styles.activeTabText
                    : styles.inactiveTabText
                }
              >
                Lịch trình
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={
                activeTab === "reviews" ? styles.activeTab : styles.inactiveTab
              }
              onPress={() => setActiveTab("reviews")}
            >
              <Text
                style={
                  activeTab === "reviews"
                    ? styles.activeTabText
                    : styles.inactiveTabText
                }
              >
                Đánh giá
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === "overview" && (
            <View>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Ionicons name="time-outline" size={20} color="#007BFF" />
                  <Text style={styles.infoLabel}>THỜI GIAN</Text>
                  <Text style={styles.infoValue}>
                    {formatDuration(tour.time?.tour_duration)}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="calendar-outline" size={20} color="#007BFF" />
                  <Text style={styles.infoLabel}>NGÀY ĐI - VỀ</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(tour.time?.date_start)} -{" "}
                    {formatDate(tour.time?.date_end)}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="people-outline" size={20} color="#007BFF" />
                  <Text style={styles.infoLabel}>SỨC CHỨA</Text>
                  <Text style={styles.infoValue}>
                    {tour.price?.tour_capacity} người
                  </Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Mô tả chuyến đi</Text>
              <Text style={styles.description}>
                {tour.tour_desc || "Chưa có mô tả cho tour này."}
              </Text>

              <View style={styles.galleryHeaderRow}>
                <Text style={styles.sectionTitle}>Góc ảnh</Text>
                <TouchableOpacity
                  onPress={() =>
                    openGallery(
                      tour.images?.map((img: any) => img.tour_img_url) || [],
                      0,
                    )
                  }
                >
                  <Text style={styles.viewAllText}>Xem tất cả</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.galleryScroll}
                contentContainerStyle={styles.galleryContent}
              >
                {tour.images?.map((img: any, index: number) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() =>
                      openGallery(
                        tour.images.map((i: any) => i.tour_img_url),
                        index,
                      )
                    }
                  >
                    <Image
                      source={{ uri: img.tour_img_url }}
                      style={styles.galleryThumb}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.sectionTitle}>Hướng dẫn viên đồng hành</Text>
              {tour.guides && tour.guides.length > 0 ? (
                <View style={styles.guidesContainer}>
                  {tour.guides.map((guide: any) => (
                    <View key={guide.user_id} style={styles.guideCardMobile}>
                      <View style={styles.guideHeaderMobile}>
                        <Image
                          source={{
                            uri:
                              guide.avatar || "https://via.placeholder.com/100",
                          }}
                          style={styles.guideAvatarMobile}
                        />
                        <View style={styles.guideNameSectionMobile}>
                          <Text style={styles.guideNameMobile}>
                            {guide.full_name}
                          </Text>
                          <View style={styles.guideContactRowMobile}>
                            <View style={styles.guideContactItemMobile}>
                              <Ionicons
                                name="mail-outline"
                                size={12}
                                color="#717785"
                              />
                              <Text style={styles.guideContactTextMobile}>
                                {guide.email}
                              </Text>
                            </View>
                            <View style={styles.guideContactItemMobile}>
                              <Ionicons
                                name="call-outline"
                                size={12}
                                color="#717785"
                              />
                              <Text style={styles.guideContactTextMobile}>
                                {guide.phone}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      <View style={styles.guideContentMobile}>
                        <Text style={styles.guideBioMobile} numberOfLines={3}>
                          {guide.bio ||
                            "Hướng dẫn viên nhiệt tình, giàu kinh nghiệm với sự am hiểu sâu sắc về văn hóa địa phương."}
                        </Text>

                        <View style={styles.guideInfoGridMobile}>
                          <View style={styles.guideInfoItemMobile}>
                            <Text style={styles.guideInfoLabelMobile}>
                              NGÔN NGỮ
                            </Text>
                            <Text style={styles.guideInfoValueMobile}>
                              {guide.languages?.join(", ") || "Tiếng Việt"}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.fieldSectionMobile}>
                          <Text style={styles.fieldLabelMobile}>
                            LĨNH VỰC CHUYÊN MÔN
                          </Text>
                          <View style={styles.fieldTagsMobile}>
                            {guide.fields?.map((field: string, idx: number) => (
                              <View key={idx} style={styles.fieldTagMobile}>
                                <Text style={styles.fieldTagTextMobile}>
                                  {field}
                                </Text>
                              </View>
                            )) || (
                                <Text style={styles.noFieldTextMobile}>
                                  Đa dạng
                                </Text>
                              )}
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noGuideText}>
                  Chưa có thông tin hướng dẫn viên.
                </Text>
              )}
            </View>
          )}

          {activeTab === "itinerary" && (
            <View>
              <Text style={styles.sectionTitle}>Lịch trình chi tiết</Text>
              {(() => {
                const grouped = tour.schedules?.reduce(
                  (acc: any, sche: any) => {
                    const day = sche.day_number;
                    if (!acc[day]) acc[day] = [];
                    acc[day].push(sche);
                    return acc;
                  },
                  {},
                );

                return Object.keys(grouped || {})
                  .sort((a, b) => parseInt(a) - parseInt(b))
                  .map((dayKey) => (
                    <View key={dayKey} style={styles.dayGroupMobile}>
                      <View style={styles.dayHeaderRowMobile}>
                        <View style={styles.dayBadgeMobile}>
                          <Text style={styles.dayBadgeTextMobile}>
                            Ngày {dayKey}
                          </Text>
                        </View>
                        <Text style={styles.dayDateMobile}>
                          {getScheduleDate(
                            tour.time?.date_start,
                            parseInt(dayKey),
                          )}
                        </Text>
                      </View>

                      {grouped[dayKey].map((sche: any, idx: number) => (
                        <View
                          key={sche.tour_sche_id}
                          style={styles.timelineItem}
                        >
                          <View style={styles.timelineDotActive} />
                          {idx < grouped[dayKey].length - 1 && (
                            <View style={styles.timelineLine} />
                          )}
                          <View style={styles.timelineContent}>
                            <View style={styles.rowBetween}>
                              <Text style={styles.timeSubText}>
                                Thời gian: {sche.time_sche_start}{" "}
                                {sche.time_sche_end
                                  ? `- ${sche.time_sche_end}`
                                  : ""}
                              </Text>
                              {sche.tour_sche_latit && (
                                <TouchableOpacity
                                  onPress={() =>
                                    focusMapMarker(tour.schedules.indexOf(sche))
                                  }
                                >
                                  <Ionicons
                                    name="map-outline"
                                    size={18}
                                    color="#007BFF"
                                  />
                                </TouchableOpacity>
                              )}
                            </View>
                            <View style={styles.itineraryBox}>
                              <Text style={styles.itineraryTitle}>
                                {sche.tour_sche_name}
                              </Text>
                              <Text style={styles.itineraryDesc}>
                                {sche.tour_sche_desc}
                              </Text>
                              {sche.images && sche.images.length > 0 && (
                                <TouchableOpacity
                                  onPress={() =>
                                    openGallery(
                                      sche.images.map(
                                        (img: any) => img.tour_sche_img_url,
                                      ),
                                      0,
                                    )
                                  }
                                  style={styles.itineraryImageContainer}
                                >
                                  <Image
                                    source={{
                                      uri: sche.images[0].tour_sche_img_url,
                                    }}
                                    style={styles.itineraryImage}
                                  />
                                  {sche.images.length > 1 && (
                                    <View style={styles.imageCountOverlay}>
                                      <Text style={styles.imageCountText}>
                                        +{sche.images.length - 1}
                                      </Text>
                                    </View>
                                  )}
                                </TouchableOpacity>
                              )}
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  ));
              })()}

              <Text style={styles.sectionTitle}>Địa điểm tham quan</Text>
              <Map ref={webViewRef} tour={tour} height={300} />
            </View>
          )}

          {activeTab === "reviews" && (
            <View style={styles.reviewsPlaceholder}>
              <Ionicons name="chatbubbles-outline" size={50} color="#ccc" />
              <Text style={styles.reviewsPlaceholderText}>
                Chưa có đánh giá nào cho tour này.
              </Text>
            </View>
          )}
          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { width, paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.priceContainer}>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Người lớn</Text>
            <Text style={styles.priceSeparator}>: </Text>
            <Text style={styles.priceValue}>
              {tour.price?.price_adult?.toLocaleString()}đ
            </Text>
          </View>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Trẻ em</Text>
            <Text style={styles.priceSeparator}>: </Text>
            <Text style={styles.priceValue}>
              {tour.price?.price_child?.toLocaleString()}đ
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.mainBookBtn}
          onPress={() =>
            router.push({
              pathname: "/tour/BookTourScreen",
              params: {
                id: tour.tour_id,
                adults: adultCount,
                children: childCount,
              },
            })
          }
        >
          <Text style={styles.mainBookText}>Đặt ngay</Text>
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
  },
  iconBtn: {
    backgroundColor: "white",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  titleOverlay: { padding: 20, paddingTop: 100 },
  bestsellerBadge: {
    backgroundColor: "rgba(245, 245, 245, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  bestsellerText: { fontSize: 12, fontWeight: "bold", color: "#333" },
  ratingBadge: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  ratingTextMobile: {
    color: "white",
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
  },
  mainTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 8,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
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
  timelineItem: { flexDirection: "row", marginBottom: 20 },
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
  timeText: { fontWeight: "bold", fontSize: 15, color: "#007BFF" },
  timeSubText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
    fontWeight: "500",
  },
  itineraryBox: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 12,
    marginTop: 5,
  },
  itineraryTitle: { fontWeight: "bold", fontSize: 14, marginBottom: 4 },
  itineraryDesc: { fontSize: 12, color: "#666", lineHeight: 18 },
  itineraryImageContainer: {
    marginTop: 10,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  itineraryImage: { width: "100%", height: 150 },
  imageCountOverlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  imageCountText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  mapContainer: {
    width: "100%",
    height: 300,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    backgroundColor: "white",
    zIndex: 100,
  },
  priceContainer: { gap: 4 },
  priceItem: { flexDirection: "row", alignItems: "center" },
  priceLabel: { width: 70, fontSize: 13, color: "#333", fontWeight: "600" },
  priceSeparator: { fontSize: 13, color: "#333", fontWeight: "600" },
  priceValue: { fontSize: 14, fontWeight: "700", color: "#333" },
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
  modalContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
  },
  closeModalBtn: {
    position: "absolute",
    top: 10,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 5,
  },
  navArrow: {
    position: "absolute",
    top: "50%",
    marginTop: -20,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 10,
    borderRadius: 30,
    zIndex: 10,
  },

  // Guides Mobile Styles
  guidesContainer: { marginBottom: 20 },
  guideCardMobile: {
    backgroundColor: "#f8fbff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e1efff",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  guideHeaderMobile: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  guideAvatarMobile: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "white",
  },
  guideNameSectionMobile: {
    marginLeft: 15,
    flex: 1,
  },
  guideNameMobile: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1c1b1b",
  },
  guideContactRowMobile: {
    marginTop: 4,
    gap: 4,
  },
  guideContactItemMobile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  guideContactTextMobile: {
    fontSize: 11,
    color: "#717785",
  },
  guideContentMobile: {
    gap: 12,
  },
  guideBioMobile: {
    fontSize: 13,
    color: "#414753",
    lineHeight: 18,
  },
  guideInfoGridMobile: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    gap: 20,
  },
  guideInfoItemMobile: {
    flex: 1,
  },
  guideInfoLabelMobile: {
    fontSize: 9,
    fontWeight: "700",
    color: "#717785",
    marginBottom: 4,
  },
  guideInfoValueMobile: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1c1b1b",
  },
  fieldSectionMobile: {
    marginTop: 4,
  },
  fieldLabelMobile: {
    fontSize: 9,
    fontWeight: "700",
    color: "#717785",
    marginBottom: 8,
  },
  fieldTagsMobile: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  fieldTagMobile: {
    backgroundColor: "#e1efff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  fieldTagTextMobile: {
    fontSize: 11,
    fontWeight: "600",
    color: "#005bb2",
  },
  noFieldTextMobile: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
  noGuideText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    marginBottom: 20,
  },

  // Day Group Mobile
  dayGroupMobile: {
    marginBottom: 25,
  },
  dayHeaderRowMobile: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#f0f7ff",
    padding: 10,
    borderRadius: 12,
  },
  dayBadgeMobile: {
    backgroundColor: "#007BFF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dayBadgeTextMobile: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  dayDateMobile: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  reviewsPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 15,
  },
  reviewsPlaceholderText: {
    color: "#8E8E93",
    fontSize: 14,
  },

  // Gallery Section Mobile
  galleryHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  viewAllText: {
    color: "#007BFF",
    fontSize: 13,
    fontWeight: "600",
  },
  galleryScroll: {
    marginHorizontal: -20,
    paddingLeft: 20,
    marginBottom: 10,
  },
  galleryContent: {
    paddingRight: 20,
    gap: 12,
    flexDirection: "row",
  },
  galleryThumb: {
    width: 140,
    height: 100,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
});
