import React from "react";
import { View, Text, StyleSheet, Platform, useWindowDimensions } from "react-native";

const Footer = () => {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web" && width > 768;

  if (isWeb) {
    return (
      <View style={styles.webFooter}>
        <View style={styles.webFooterContent}>
          <View style={styles.footerBrandColWeb}>
            <Text style={styles.footerBrand}>Tour Mate</Text>
            <Text style={styles.footerDesc}>
              © 2026 Tour Mate. Khám phá thế giới với sự an tâm tuyệt đối.
            </Text>
          </View>

          <View style={styles.webFooterLinks}>
            <View style={styles.footerLinkCol}>
              <Text style={styles.footerHeader}>Về chúng tôi</Text>
              <Text style={styles.footerLink}>Câu chuyện thương hiệu</Text>
              <Text style={styles.footerLink}>Đội ngũ chuyên gia</Text>
              <Text style={styles.footerLink}>Liên hệ</Text>
            </View>
            <View style={styles.footerLinkCol}>
              <Text style={styles.footerHeader}>Hỗ trợ</Text>
              <Text style={styles.footerLink}>Hướng dẫn đặt tour</Text>
              <Text style={styles.footerLink}>Điều khoản dịch vụ</Text>
              <Text style={styles.footerLink}>Chính sách bảo mật</Text>
            </View>
            <View style={styles.footerLinkCol}>
              <Text style={styles.footerHeader}>Liên hệ</Text>
              <Text style={styles.footerInfo}>Hotline: 1900 123 456</Text>
              <Text style={styles.footerInfo}>Email: info@tourmate.com</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mobileFooter}>
      <View style={styles.footerBrandCol}>
        <Text style={styles.footerBrand}>Tour Mate</Text>
        <Text style={styles.footerDesc}>
          © 2026 Tour Mate. Khám phá thế giới với sự an tâm tuyệt đối.
        </Text>
      </View>

      <View style={styles.footerMobileRow}>
        <View style={styles.footerLinkCol}>
          <Text style={styles.footerHeader}>Về chúng tôi</Text>
          <Text style={styles.footerLink}>Câu chuyện</Text>
          <Text style={styles.footerLink}>Đội ngũ</Text>
          <Text style={styles.footerLink}>Liên hệ</Text>
        </View>
        <View style={styles.footerLinkCol}>
          <Text style={styles.footerHeader}>Hỗ trợ</Text>
          <Text style={styles.footerLink}>Đặt tour</Text>
          <Text style={styles.footerLink}>Điều khoản</Text>
          <Text style={styles.footerLink}>Bảo mật</Text>
        </View>
      </View>

      <View style={styles.footerLinkCol}>
        <Text style={styles.footerHeader}>Liên hệ</Text>
        <Text style={styles.footerInfo}>Hotline: 1900 123 456</Text>
        <Text style={styles.footerInfo}>Email: info@tourmate.com</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Web Styles
  webFooter: {
    backgroundColor: "#f6f3f2",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingVertical: 80,
    marginTop: 80,
    width: "100%",
  },
  webFooterContent: {
    maxWidth: 1280,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerBrandColWeb: {
    flex: 2,
  },
  webFooterLinks: {
    flex: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 40,
  },

  // Mobile Styles
  mobileFooter: {
    backgroundColor: "#f6f3f2",
    padding: 30,
    marginTop: 20,
    borderRadius: 30,
  },
  footerMobileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 24,
  },
  footerBrandCol: { marginBottom: 20 },
  footerBrand: {
    fontSize: 24,
    fontWeight: "900",
    color: "#005bb2",
    marginBottom: 16,
  },
  footerDesc: { fontSize: 14, color: "#666", lineHeight: 22, maxWidth: 300 },
  footerLinkCol: { flex: 1, marginBottom: 20 },
  footerHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1c1b1b",
    marginBottom: 24,
  },
  footerLink: { fontSize: 14, color: "#666", marginBottom: 16 },
  footerInfo: { fontSize: 14, color: "#666", marginBottom: 8 },
});

export default Footer;
