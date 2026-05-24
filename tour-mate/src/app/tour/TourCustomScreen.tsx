import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function TourCustomScreen() {
  const router = useRouter();
  const [step, setStep] = useState("Basics");
  const [hotelClass, setHotelClass] = useState("4");
  const [transport, setTransport] = useState("public");

  return (
    <SafeAreaView style={styles.container as ViewStyle}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={24} color="#64748b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Build Your Trip</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress Steps */}
        <View style={styles.stepContainer}>
          <View style={styles.stepWrapper}>
            {["Basics", "Itinerary", "Stay"].map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setStep(s)}
                style={[
                  styles.stepTab,
                  step === s && styles.stepTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.stepTabText,
                    step === s && styles.stepTabTextActive,
                  ]}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Destination Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Where to next?</Text>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#137fec" />
            <TextInput
              placeholder="Search city or country..."
              style={styles.searchInput}
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            <TouchableOpacity style={[styles.chip, styles.chipActive]}>
              <Text style={styles.chipTextActive}>All</Text>
            </TouchableOpacity>
            {["Europe", "Asia", "Beach", "City"].map((chip) => (
              <TouchableOpacity key={chip} style={styles.chip}>
                <Text style={styles.chipText}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Popular Now */}
          <Text style={styles.subLabel}>POPULAR NOW</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardScroll}>
            <DestinationCard 
              image="https://lh3.googleusercontent.com/aida-public/AB6AXuAU71EFce8RP_o3vReQNYa6kpdH0HWQGscC8aYZjbB0_rMobzajq0O83g939t_WwnVwf32OTjoUCKpgOmJHoI5sKZ-rvuR-_WdVLvaPUBngLuoXK4rxw1AU1F12ZnxJX_yK644_PdFkXFXmVfzRjm-97ZMbHt1TumvoNN0R_h7_-3ZSX30q-xa9H75H-4ihnTW9nnIoibXMhWzZHxr0XUCuKM6wPrNCBF-pmLws-Z1HA4YAmnIXGV3HqMwizaM8v7uIge5nRKJHw4ko"
              title="Santorini"
              subtitle="Greece"
            />
            <DestinationCard 
              image="https://lh3.googleusercontent.com/aida-public/AB6AXuBmZtt50j-ZgDeo9RM7Bg15mtOeucfVa0t5qQcRNHMpg6gOaWAhiCH0x2BabqpW1ySmjloY6_M8K7afRsD6jx8o4hW3z6a348WEPplUgcBo66TRf2L-zJRHaJ9BTwS2KQ0Z-5VsmoVgLXuu0kki3EexnjyGsydtpAx87ifkfyTz9trk-oKd_k0gMCXexaaI4SpmsKlWMqtTWiY-GuuuIGxT2p_epwr8Fql0CM81ywWeIBjT49k-tUa2dP6kGLVidjTMeuaGWTL6bXCF"
              title="Kyoto"
              subtitle="Japan"
            />
          </ScrollView>
        </View>

        <View style={styles.divider} />

        {/* Timing Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleSmall}>When are you traveling?</Text>
          <View style={styles.dateGrid}>
            <View style={styles.dateCol}>
              <Text style={styles.dateLabel}>Departure</Text>
              <TouchableOpacity style={styles.dateInput}>
                <Ionicons name="calendar-outline" size={20} color="#137fec" />
                <Text style={styles.dateText}>Oct 24, 2023</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.dateCol}>
              <Text style={styles.dateLabel}>Return</Text>
              <TouchableOpacity style={styles.dateInput}>
                <Ionicons name="calendar-outline" size={20} color="#137fec" />
                <Text style={styles.dateTextPlaceholder}>Select Date</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Itinerary Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitleSmall}>Your Itinerary</Text>
            <TouchableOpacity><Text style={styles.resetBtn}>Reset</Text></TouchableOpacity>
          </View>

          <View style={styles.timelineContainer}>
            <View style={styles.timelineLine} />
            
            {/* Start Point */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineDotActive} />
              <View style={styles.timelineCard}>
                <View style={styles.timelineCardContent}>
                  <View>
                    <Text style={styles.timelinePointTitle}>New York (JFK)</Text>
                    <Text style={styles.timelinePointSub}>Departure • Oct 24, 10:00 AM</Text>
                  </View>
                  <Ionicons name="airplane-outline" size={20} color="#94a3b8" />
                </View>
              </View>
            </View>

            {/* Add Stop */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineDotInactive} />
              <TouchableOpacity style={styles.addStopBtn}>
                <Ionicons name="add-circle-outline" size={22} color="#94a3b8" />
                <Text style={styles.addStopText}>Add Stop / Location</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleSmall}>Preferences</Text>
          
          <Text style={styles.prefLabel}>Accommodation Class</Text>
          <View style={styles.prefGrid}>
            <PreferenceCard 
              active={hotelClass === "3"} 
              onPress={() => setHotelClass("3")}
              icon="⭐⭐⭐"
              label="Comfort"
            />
            <PreferenceCard 
              active={hotelClass === "4"} 
              onPress={() => setHotelClass("4")}
              icon="⭐⭐⭐⭐"
              label="Premium"
            />
            <PreferenceCard 
              active={hotelClass === "5"} 
              onPress={() => setHotelClass("5")}
              icon="⭐⭐⭐⭐⭐"
              label="Luxury"
            />
          </View>

          <Text style={styles.prefLabel}>Transport Mode</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            <TransportCard 
              active={transport === "rental"} 
              onPress={() => setTransport("rental")}
              icon="car-outline"
              label="Rental Car"
            />
            <TransportCard 
              active={transport === "public"} 
              onPress={() => setTransport("public")}
              icon="train-outline"
              label="Public Transit"
            />
            <TransportCard 
              active={transport === "private"} 
              onPress={() => setTransport("private")}
              icon="taxi-outline"
              label="Private Driver"
            />
          </ScrollView>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarContent}>
          <View>
            <Text style={styles.estTotalLabel}>EST. TOTAL</Text>
            <Text style={styles.totalPrice}>$1,200</Text>
          </View>
          <TouchableOpacity style={styles.reviewBtn}>
            <Text style={styles.reviewBtnText}>Review Itinerary</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function DestinationCard({ image, title, subtitle }: any) {
  return (
    <View style={styles.destCard}>
      <Image source={{ uri: image }} style={styles.destImage} />
      <View style={styles.destOverlay} />
      <View style={styles.destInfo}>
        <Text style={styles.destTitle}>{title}</Text>
        <Text style={styles.destSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

function PreferenceCard({ active, icon, label, onPress }: any) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.prefCard, active && styles.prefCardActive]}
    >
      <Text style={styles.prefIconText}>{icon}</Text>
      <Text style={[styles.prefCardLabel, active && styles.prefCardLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function TransportCard({ active, icon, label, onPress }: any) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.transCard, active && styles.transCardActive]}
    >
      <Ionicons name={icon} size={24} color={active ? "#137fec" : "#64748b"} />
      <Text style={[styles.transCardLabel, active && styles.transCardLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f7f8" },
  header: { backgroundColor: "rgba(246, 247, 248, 0.95)", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, height: 60 },
  closeBtn: { padding: 8, marginLeft: -8, borderRadius: 20 },
  headerTitle: { fontSize: 18, fontWeight: "bold", flex: 1, textAlign: "center" },
  
  stepContainer: { paddingHorizontal: 16, paddingBottom: 12 },
  stepWrapper: { flexDirection: "row", backgroundColor: "#e2e8f0", padding: 4, borderRadius: 10, height: 44 },
  stepTab: { flex: 1, justifyContent: "center", alignItems: "center", borderRadius: 8 },
  stepTabActive: { backgroundColor: "#fff", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  stepTabText: { fontSize: 13, fontWeight: "600", color: "#64748b" },
  stepTabTextActive: { color: "#137fec" },

  content: { flex: 1 },
  section: { padding: 16, gap: 12 },
  sectionTitle: { fontSize: 24, fontWeight: "bold", color: "#0f172a" },
  sectionTitleSmall: { fontSize: 20, fontWeight: "bold", color: "#0f172a" },
  
  searchBar: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#fff", 
    borderWidth: 1, 
    borderColor: "#e2e8f0", 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    height: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16, fontWeight: "500", color: "#0f172a" },

  chipScroll: { flexDirection: "row", marginVertical: 4 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", marginRight: 8 },
  chipActive: { backgroundColor: "#137fec", borderColor: "#137fec" },
  chipText: { fontSize: 14, fontWeight: "500", color: "#475569" },
  chipTextActive: { fontSize: 14, fontWeight: "500", color: "#fff" },

  subLabel: { fontSize: 12, fontWeight: "700", color: "#64748b", marginTop: 8, letterSpacing: 1 },
  cardScroll: { flexDirection: "row", marginTop: 4 },
  
  destCard: { width: 160, height: 208, borderRadius: 16, overflow: "hidden", marginRight: 16, backgroundColor: "#e2e8f0" },
  destImage: { width: "100%", height: "100%", position: "absolute" },
  destOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.3)" },
  destInfo: { position: "absolute", bottom: 12, left: 12 },
  destTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  destSubtitle: { color: "rgba(255,255,255,0.8)", fontSize: 12 },

  divider: { height: 1, backgroundColor: "#e2e8f0", marginHorizontal: 16 },

  dateGrid: { flexDirection: "row", gap: 12 },
  dateCol: { flex: 1, gap: 6 },
  dateLabel: { fontSize: 12, fontWeight: "600", color: "#64748b" },
  dateInput: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8, 
    backgroundColor: "#fff", 
    borderWidth: 1, 
    borderColor: "#e2e8f0", 
    borderRadius: 12, 
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    elevation: 1
  },
  dateText: { fontSize: 14, fontWeight: "500", color: "#0f172a" },
  dateTextPlaceholder: { fontSize: 14, fontWeight: "500", color: "#94a3b8" },

  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  resetBtn: { fontSize: 14, fontWeight: "600", color: "#137fec" },

  timelineContainer: { marginLeft: 8, paddingLeft: 16, borderLeftWidth: 2, borderLeftColor: "#e2e8f0", paddingVertical: 4 },
  timelineLine: { position: "absolute", left: -2, top: 0, bottom: 0, width: 2, backgroundColor: "#e2e8f0" },
  timelineItem: { marginBottom: 24, position: "relative" },
  timelineDotActive: { position: "absolute", left: -22, top: 4, width: 12, height: 12, borderRadius: 6, backgroundColor: "#137fec", borderWidth: 3, borderColor: "#fff" },
  timelineDotInactive: { position: "absolute", left: -22, top: "50%", marginTop: -6, width: 12, height: 12, borderRadius: 6, backgroundColor: "#cbd5e1", borderWidth: 3, borderColor: "#fff" },
  
  timelineCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#e2e8f0", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, elevation: 1 },
  timelineCardContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  timelinePointTitle: { fontSize: 16, fontWeight: "bold", color: "#0f172a" },
  timelinePointSub: { fontSize: 12, color: "#64748b", marginTop: 2 },

  addStopBtn: { 
    width: "100%", 
    borderWidth: 2, 
    borderStyle: "dashed", 
    borderColor: "#cbd5e1", 
    borderRadius: 16, 
    padding: 16, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    gap: 8 
  },
  addStopText: { fontSize: 15, fontWeight: "500", color: "#64748b" },

  prefLabel: { fontSize: 14, fontWeight: "600", color: "#334155", marginBottom: 8, marginTop: 4 },
  prefGrid: { flexDirection: "row", gap: 10 },
  prefCard: { 
    flex: 1, 
    backgroundColor: "#fff", 
    borderRadius: 16, 
    padding: 12, 
    alignItems: "center", 
    borderWidth: 1, 
    borderColor: "#e2e8f0",
    minHeight: 80,
    justifyContent: "center"
  },
  prefCardActive: { borderColor: "#137fec", backgroundColor: "rgba(19, 127, 236, 0.05)", borderWidth: 2 },
  prefIconText: { fontSize: 18, marginBottom: 4 },
  prefCardLabel: { fontSize: 11, fontWeight: "600", color: "#475569" },
  prefCardLabelActive: { color: "#137fec" },

  transCard: { 
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    borderRadius: 16, 
    backgroundColor: "#fff", 
    borderWidth: 1, 
    borderColor: "#e2e8f0", 
    marginRight: 10, 
    alignItems: "center",
    minWidth: 110
  },
  transCardActive: { borderColor: "#137fec", backgroundColor: "rgba(19, 127, 236, 0.05)", borderWidth: 2 },
  transCardLabel: { fontSize: 12, fontWeight: "600", color: "#475569", marginTop: 4 },
  transCardLabelActive: { color: "#137fec" },

  bottomBar: { 
    position: "absolute", 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: "#fff", 
    borderTopWidth: 1, 
    borderTopColor: "#e2e8f0", 
    padding: 16, 
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10
  },
  bottomBarContent: { flexDirection: "row", alignItems: "center", gap: 16, maxWidth: 500, alignSelf: "center", width: "100%" },
  estTotalLabel: { fontSize: 10, fontWeight: "700", color: "#64748b", letterSpacing: 1 },
  totalPrice: { fontSize: 24, fontWeight: "bold", color: "#0f172a" },
  reviewBtn: { 
    flex: 1, 
    backgroundColor: "#137fec", 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    gap: 8, 
    borderRadius: 14, 
    height: 52,
    shadowColor: "#137fec",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  reviewBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
