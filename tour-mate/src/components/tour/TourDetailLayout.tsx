import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import NavigationBar from "@/components/ui/NavigationBar";
import Map from '@/components/ui/Map';

interface TourDetailLayoutProps {
  tour: any;
  heroIndex: number;
  setHeroIndex: (index: React.SetStateAction<number>) => void;
  adultCount: number;
  setAdultCount: (count: number) => void;
  childCount: number;
  setChildCount: (count: number) => void;
  openGallery: (images: string[], index: number) => void;
  formatDuration: (days: number) => string;
  formatDate: (date: string) => string;
  getScheduleDate: (startDate: string, day: number) => string;
}

export default function TourDetailLayout({
  tour,
  heroIndex,
  setHeroIndex,
  adultCount,
  setAdultCount,
  childCount,
  setChildCount,
  openGallery,
  formatDuration,
  formatDate,
  getScheduleDate,
}: TourDetailLayoutProps) {
  const router = useRouter();
  const [expandedDays, setExpandedDays] = React.useState<Record<string, boolean>>({ "1": true });

  const toggleDay = (dayKey: string) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayKey]: !prev[dayKey]
    }));
  };

  // Auto-play Hero for Web
  useEffect(() => {
    if (tour?.images?.length > 1) {
      const interval = setInterval(() => {
        setHeroIndex((prev: any) => (prev + 1) % tour.images.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [tour?.images?.length]);

  const adultPrice = tour.price?.price_adult || 0;
  const childPrice = tour.price?.price_child || 0;
  const totalPrice = (adultPrice * adultCount) + (childPrice * childCount);
  const capacity = tour.price?.tour_capacity || 15;
  const currentGuests = adultCount + childCount;

  const renderWebHero = () => {
    const images = tour.images || [];
    if (images.length === 0) return null;

    return (
      <View style={styles.webHeroSliderContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => openGallery(images.map((img: any) => img.tour_img_url), heroIndex)}
          style={styles.webHeroSlide}
        >
          <Image
            source={{ uri: images[heroIndex]?.tour_img_url }}
            style={styles.webHeroFullImg}
          />
          <View style={styles.webHeroOverlay}>
            <View style={styles.webHeroPagination}>
              {images.map((_: any, i: number) => (
                <View
                  key={i}
                  style={[
                    styles.webHeroDot,
                    heroIndex === i && styles.webHeroDotActive
                  ]}
                />
              ))}
            </View>
          </View>
        </TouchableOpacity>

        {/* Navigation Arrows */}
        <TouchableOpacity
          style={[styles.webHeroArrow, { left: 20 }]}
          onPress={() => setHeroIndex((prev: any) => (typeof prev === 'number' ? (prev - 1 + images.length) % images.length : prev))}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.webHeroArrow, { right: 20 }]}
          onPress={() => setHeroIndex((prev: any) => (typeof prev === 'number' ? (prev + 1) % images.length : prev))}
        >
          <Ionicons name="chevron-forward" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderWebBookingWidget = () => (
    <View style={styles.webStickyWidget}>
      <View style={styles.webWidgetCard}>
        <View style={styles.webPriceContainer}>
          <View style={styles.webPriceRow}>
            <Text style={styles.webPriceLabel}>Người lớn:</Text>
            <Text style={styles.webPriceText}>{adultPrice.toLocaleString()}đ</Text>
          </View>
          <View style={styles.webPriceRow}>
            <Text style={styles.webPriceLabel}>Trẻ em:</Text>
            <Text style={styles.webPriceText}>{childPrice.toLocaleString()}đ</Text>
          </View>
        </View>

        <View style={styles.webDivider} />

        <View style={styles.webFormGroup}>
          <Text style={styles.webLabel}>Thời gian diễn ra</Text>
          <View style={styles.webDateBox}>
            <View style={styles.webDateItem}>
              <Ionicons name="calendar-outline" size={16} color="#005bb2" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.webDateLabel}>Ngày khởi hành</Text>
                <Text style={styles.webDateVal}>{formatDate(tour.time?.date_start)}</Text>
              </View>
            </View>
            <View style={styles.webDateDivider} />
            <View style={styles.webDateItem}>
              <Ionicons name="calendar-clear-outline" size={16} color="#005bb2" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.webDateLabel}>Ngày kết thúc</Text>
                <Text style={styles.webDateVal}>{formatDate(tour.time?.date_end)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.webCounterRow}>
          <View style={[styles.webFormGroup, { flex: 1 }]}>
            <Text style={styles.webLabel}>Người lớn</Text>
            <View style={styles.webCounter}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setAdultCount(Math.max(1, adultCount - 1))}
              >
                <Text>-</Text>
              </TouchableOpacity>
              <Text style={styles.counterVal}>{adultCount}</Text>
              <TouchableOpacity
                style={[
                  styles.counterBtn,
                  { backgroundColor: currentGuests >= capacity ? '#ccc' : '#005bb2' }
                ]}
                disabled={currentGuests >= capacity}
                onPress={() => setAdultCount(adultCount + 1)}
              >
                <Text style={{ color: 'white' }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.webFormGroup, { flex: 1, marginLeft: 15 }]}>
            <Text style={styles.webLabel}>Trẻ em</Text>
            <View style={styles.webCounter}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setChildCount(Math.max(0, childCount - 1))}
              >
                <Text>-</Text>
              </TouchableOpacity>
              <Text style={styles.counterVal}>{childCount}</Text>
              <TouchableOpacity
                style={[
                  styles.counterBtn,
                  { backgroundColor: currentGuests >= capacity ? '#ccc' : '#005bb2' }
                ]}
                disabled={currentGuests >= capacity}
                onPress={() => setChildCount(childCount + 1)}
              >
                <Text style={{ color: 'white' }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.webTotalRow}>
          <View>
            <Text style={styles.webTotalLabel}>Tổng cộng ({currentGuests} khách)</Text>
            {currentGuests >= capacity && (
              <Text style={{ fontSize: 10, color: '#ba1a1a', fontWeight: 'bold' }}>Đã đạt sức chứa tối đa</Text>
            )}
          </View>
          <Text style={styles.webTotalVal}>{totalPrice.toLocaleString()}đ</Text>
        </View>

        <TouchableOpacity
          style={styles.webBookBtn}
          onPress={() => router.push({ pathname: '/tour/BookTourScreen', params: { id: tour.tour_id, adults: adultCount, children: childCount } })}
        >
          <Text style={styles.webBookBtnText}>Đặt tour ngay</Text>
        </TouchableOpacity>

        <Text style={styles.webRefundText}>Hoàn tiền 100% nếu hủy trước 7 ngày</Text>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.webFooter}>
      <View style={styles.webFooterContent}>
        <View style={styles.webFooterSection}>
          <Text style={styles.webFooterBrand}>Tour Mate</Text>
          <Text style={styles.webFooterDesc}>© 2024 Tour Mate. Khám phá thế giới với sự an tâm tuyệt đối.</Text>
        </View>
        <View style={styles.webFooterSection}>
          <Text style={styles.webFooterTitle}>Dịch vụ</Text>
          <Text style={styles.webFooterLink}>Hướng dẫn đặt tour</Text>
          <Text style={styles.webFooterLink}>Chính sách bảo mật</Text>
        </View>
        <View style={styles.webFooterSection}>
          <Text style={styles.webFooterTitle}>Công ty</Text>
          <Text style={styles.webFooterLink}>Về chúng tôi</Text>
          <Text style={styles.webFooterLink}>Liên hệ</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.webMainWrapper}>
      <NavigationBar />
      <ScrollView style={styles.webScroll}>
        <View style={styles.webPageContent}>
          {renderWebHero()}

          <View style={styles.webMainGrid}>
            {/* Left Content */}
            <View style={styles.webLeftCol}>
              <View style={styles.webHeaderInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.webBestseller}>
                    <Text style={styles.webBestsellerText}>Bán chạy nhất</Text>
                  </View>
                  <View style={[{ flexDirection: 'row', alignItems: 'center' }, { marginLeft: 15 }]}>
                    <Ionicons name="star" size={16} color="#fb7800" />
                    <Text style={styles.webRatingText}>{tour.averageRating || "5.0"} ({tour.totalReviews || 0} đánh giá)</Text>
                  </View>
                </View>
                <Text style={styles.webMainTitle}>{tour.tour_name}</Text>
                <View style={styles.webMetaSection}>
                  <View style={styles.webMetaItem}>
                    <Ionicons name="location-outline" size={20} color="#005bb2" />
                    <Text style={styles.webMetaText}>{tour.tour_add || "Việt Nam"}</Text>
                  </View>
                  <View style={styles.webMetaRow}>
                    <View style={styles.webMetaItem}>
                      <Ionicons name="time-outline" size={20} color="#005bb2" />
                      <Text style={styles.webMetaText}>{formatDuration(tour.time?.tour_duration)}</Text>
                    </View>
                    <View style={[styles.webMetaItem, { marginLeft: 24 }]}>
                      <Ionicons name="people-outline" size={20} color="#005bb2" />
                      <Text style={styles.webMetaText}> {tour.price?.tour_capacity} người</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.webSection}>
                <Text style={styles.webSectionTitle}>Tổng quan</Text>
                <Text style={styles.webDescription}>{tour.tour_desc}</Text>
              </View>

              <View style={styles.webSection}>
                <Text style={styles.webSectionTitle}>Hướng dẫn viên đồng hành</Text>
                {tour.guides && tour.guides.length > 0 ? (
                  <View style={styles.webGuidesWrapper}>
                    {tour.guides.map((guide: any) => (
                      <View key={guide.user_id} style={styles.webGuideCard}>
                        <Image
                          source={{ uri: guide.avatar || 'https://via.placeholder.com/150' }}
                          style={styles.webGuideAvatar}
                        />
                        <View style={styles.webGuideContent}>
                          <View style={styles.webGuideHeader}>
                            <View>
                              <Text style={styles.webGuideName}>{guide.full_name}</Text>
                              <View style={styles.webGuideContactRow}>
                                <View style={styles.webGuideContactItem}>
                                  <Ionicons name="mail-outline" size={14} color="#717785" />
                                  <Text style={styles.webGuideContactText}>{guide.email}</Text>
                                </View>
                                <View style={[styles.webGuideContactItem, { marginLeft: 20 }]}>
                                  <Ionicons name="call-outline" size={14} color="#717785" />
                                  <Text style={styles.webGuideContactText}>{guide.phone}</Text>
                                </View>
                              </View>
                            </View>
                            <TouchableOpacity style={styles.webContactBtn}>
                              <Ionicons name="chatbubble-ellipses-outline" size={18} color="white" />
                              <Text style={styles.webContactBtnText}>Liên hệ</Text>
                            </TouchableOpacity>
                          </View>

                          <Text style={styles.webGuideBio}>
                            {guide.bio || "Hướng dẫn viên nhiệt tình, giàu kinh nghiệm với sự am hiểu sâu sắc về văn hóa, lịch sử và con người địa phương. Luôn sẵn sàng đồng hành cùng bạn trên mọi nẻo đường."}
                          </Text>

                          <View style={styles.webGuideMetaGrid}>
                            <View style={styles.webGuideMetaItem}>
                              <Text style={styles.webGuideMetaLabel}>NGÔN NGỮ</Text>
                              <Text style={styles.webGuideMetaVal}>{guide.languages?.join(', ') || 'Tiếng Việt, Tiếng Anh'}</Text>
                            </View>
                            <View style={styles.webGuideMetaItem}>
                              <Text style={styles.webGuideMetaLabel}>CHUYÊN MÔN</Text>
                              <View style={styles.webFieldTags}>
                                {guide.fields?.map((field: string, idx: number) => (
                                  <View key={idx} style={styles.webFieldTag}>
                                    <Text style={styles.webFieldTagText}>{field}</Text>
                                  </View>
                                )) || <Text style={styles.webNoFields}>Đa dạng</Text>}
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.webNoGuideText}>Chưa có thông tin hướng dẫn viên.</Text>
                )}
              </View>

              <View style={styles.webSection}>
                <Text style={styles.webSectionTitle}>Lịch trình chi tiết</Text>
                {(() => {
                  const grouped = tour.schedules?.reduce((acc: any, sche: any) => {
                    const day = sche.day_number;
                    if (!acc[day]) acc[day] = [];
                    acc[day].push(sche);
                    return acc;
                  }, {});

                  return Object.keys(grouped || {}).sort((a, b) => parseInt(a) - parseInt(b)).map((dayKey) => (
                    <View key={dayKey} style={styles.webDayGroup}>
                      <TouchableOpacity
                        style={styles.webItineraryHeader}
                        onPress={() => toggleDay(dayKey)}
                        activeOpacity={0.7}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={styles.webDayCircle}>
                              <Text style={styles.webDayText}>{dayKey}</Text>
                            </View>
                            <Text style={styles.webItineraryTitle}>
                              Ngày {dayKey} ({getScheduleDate(tour.time?.date_start, parseInt(dayKey))})
                            </Text>
                          </View>
                          <Ionicons
                            name={expandedDays[dayKey] ? "chevron-up" : "chevron-down"}
                            size={20}
                            color="#005bb2"
                          />
                        </View>
                      </TouchableOpacity>

                      {expandedDays[dayKey] && (
                        <View style={styles.webDayActivities}>
                          {grouped[dayKey].map((sche: any, idx: number) => (
                            <View key={sche.tour_sche_id} style={[
                              styles.webItineraryContent,
                              idx > 0 && styles.webActivityDivider
                            ]}>
                              <Text style={styles.webItineraryTime}>{sche.time_sche_start} - {sche.time_sche_end}</Text>
                              <Text style={styles.webItineraryName}>{sche.tour_sche_name}</Text>
                              <Text style={styles.webItineraryDesc}>{sche.tour_sche_desc}</Text>

                              {sche.images && sche.images.length > 0 && (
                                <TouchableOpacity
                                  onPress={() => openGallery(sche.images.map((img: any) => img.tour_sche_img_url), 0)}
                                  style={styles.webItineraryImageContainer}
                                >
                                  <Image
                                    source={{ uri: sche.images[0].tour_sche_img_url }}
                                    style={styles.webItineraryImage}
                                  />
                                  {sche.images.length > 1 && (
                                    <View style={styles.webImageCountOverlay}>
                                      <Text style={styles.webImageCountText}>+{sche.images.length - 1}</Text>
                                    </View>
                                  )}
                                </TouchableOpacity>
                              )}
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ));
                })()}
              </View>

              <View style={styles.webSection}>
                <Text style={styles.webSectionTitle}>Địa điểm tham quan</Text>
                <Map tour={tour} height={450} />
              </View>
            </View>

            {/* Right Sidebar */}
            <View style={styles.webRightCol}>
              {renderWebBookingWidget()}
            </View>
          </View>
        </View>
        {renderFooter()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // WEB STYLES
  webMainWrapper: {
    flex: 1,
    backgroundColor: "#fcf9f8",
  },
  webScroll: {
    flex: 1,
    paddingTop: 72, // Space for fixed Nav
  },
  webPageContent: {
    maxWidth: 1300,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  webHeroSliderContainer: {
    height: 500,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 40,
    backgroundColor: "#eee",
    position: "relative",
  },
  webHeroSlide: {
    flex: 1,
  },
  webHeroFullImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  webHeroOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  webHeroPagination: {
    flexDirection: "row",
    gap: 8,
  },
  webHeroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  webHeroDotActive: {
    width: 24,
    backgroundColor: "white",
  },
  webHeroArrow: {
    position: "absolute",
    top: "50%",
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  webMainGrid: {
    flexDirection: "row",
    gap: 48,
  },
  webLeftCol: {
    flex: 2,
  },
  webRightCol: {
    flex: 1,
  },
  webHeaderInfo: {
    marginBottom: 40,
  },
  webBestseller: {
    backgroundColor: "#fb7800",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  webBestsellerText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  webRatingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#994700",
    marginLeft: 4,
  },
  webMainTitle: {
    fontSize: 48,
    fontWeight: "800",
    color: "#1c1b1b",
    marginVertical: 16,
    lineHeight: 56,
  },
  webMetaRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  webMetaSection: {
    gap: 12,
  },
  webMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  webMetaText: {
    fontSize: 16,
    color: "#414753",
  },
  webSection: {
    marginBottom: 48,
  },
  webSectionTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1c1b1b",
    marginBottom: 24,
  },
  webDescription: {
    fontSize: 18,
    lineHeight: 28,
    color: "#414753",
  },
  webItineraryItem: {
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    marginBottom: 16,
    overflow: "hidden",
  },
  webItineraryHeader: {
    padding: 20,
    backgroundColor: "#f0f7ff",
  },
  webDayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#005bb2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  webDayText: {
    color: "white",
    fontWeight: "bold",
  },
  webItineraryTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#005bb2",
  },
  webItineraryContent: {
    padding: 24,
  },
  webItineraryTime: {
    fontSize: 14,
    fontWeight: "600",
    color: "#005bb2",
    marginBottom: 8,
  },
  webItineraryName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1c1b1b",
    marginBottom: 12,
  },
  webItineraryDesc: {
    fontSize: 16,
    color: "#414753",
    lineHeight: 24,
  },
  webItineraryImageContainer: {
    marginTop: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  webItineraryImage: {
    width: "100%",
    height: 400,
    resizeMode: "cover",
  },
  webStickyWidget: {
    // @ts-ignore
    position: Platform.OS === "web" ? "sticky" : "relative",
    top: 100,
  },
  webWidgetCard: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 5,
  },
  webPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  webPriceLabel: {
    fontSize: 16,
    color: "#414753",
    fontWeight: "600",
  },
  webPriceText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#005bb2",
  },
  webPriceContainer: {
    marginBottom: 20,
  },
  webDivider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginBottom: 24,
  },
  webFormGroup: {
    marginBottom: 20,
  },
  webLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1c1b1b",
    marginBottom: 8,
  },
  webDateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#fcf9f8",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e2e1",
    justifyContent: 'space-between',
  },
  webDateItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  webDateDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e5e2e1',
    marginHorizontal: 12,
  },
  webDateLabel: {
    fontSize: 10,
    color: "#717785",
    fontWeight: "500",
  },
  webDateVal: {
    fontSize: 13,
    color: "#1c1b1b",
    fontWeight: "700",
  },
  webCounterRow: {
    flexDirection: "row",
    marginBottom: 24,
  },
  webCounter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fcf9f8",
    padding: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e2e1",
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#eae7e7",
    justifyContent: "center",
    alignItems: "center",
  },
  counterVal: {
    fontSize: 15,
    fontWeight: "600",
  },
  webTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    borderStyle: "dashed",
  },
  webTotalLabel: {
    fontSize: 14,
    color: "#414753",
  },
  webTotalVal: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1c1b1b",
  },
  webBookBtn: {
    backgroundColor: "#005bb2",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#005bb2",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  webBookBtnText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  webRefundText: {
    textAlign: "center",
    fontSize: 12,
    color: "#414753",
    marginTop: 16,
  },
  webFooter: {
    backgroundColor: "#fcfcfc",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingVertical: 64,
    marginTop: 64,
  },
  webFooterContent: {
    maxWidth: 1280,
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  webFooterSection: {
    flex: 1,
  },
  webFooterBrand: {
    fontSize: 24,
    fontWeight: "900",
    color: "#005bb2",
    marginBottom: 16,
  },
  webFooterDesc: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    maxWidth: 300,
  },
  webFooterTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1c1b1b",
    marginBottom: 20,
  },
  webFooterLink: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  mapContainer: { width: "100%", height: 300, borderRadius: 20, overflow: "hidden", marginBottom: 20 },

  // Web Itinerary Image Overlay
  webImageCountOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  webImageCountText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },

  // WEB GUIDES STYLES
  webGuidesWrapper: {
    gap: 24,
  },
  webGuideCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  webGuideAvatar: {
    width: 160,
    height: 180,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  webGuideContent: {
    flex: 1,
    marginLeft: 32,
    justifyContent: 'center',
  },
  webGuideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  webGuideName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1c1b1b',
  },
  webGuideContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  webGuideContactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  webGuideContactText: {
    fontSize: 14,
    color: '#717785',
    fontWeight: '500',
  },
  webContactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#005bb2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  webContactBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  webGuideBio: {
    fontSize: 16,
    lineHeight: 24,
    color: '#414753',
    marginBottom: 24,
  },
  webGuideMetaGrid: {
    flexDirection: 'row',
    gap: 40,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 20,
  },
  webGuideMetaItem: {
    flex: 1,
  },
  webGuideMetaLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#717785',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  webGuideMetaVal: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1b1b',
  },
  webFieldTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  webFieldTag: {
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1efff',
  },
  webFieldTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#005bb2',
  },
  webNoFields: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  webNoGuideText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },

  // Web Grouped Itinerary
  webDayGroup: {
    backgroundColor: 'white',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 32,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
  },
  webDayActivities: {
    padding: 0,
  },
  webActivityDivider: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 0,
  },
});
