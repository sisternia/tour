import { Platform } from "react-native";

const API_URL = Platform.OS === "web"
  ? "http://localhost:3000/api/vnpay"
  : `${process.env.EXPO_PUBLIC_API_URL}/vnpay`;

export const createVnPayPaymentUrl = async (amount: number, orderDescription: string, bookingData: any, userId: string, bookingId?: string) => {
  try {
    const response = await fetch(`${API_URL}/create_payment_url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        orderDescription,
        orderType: "250000",
        language: "vn",
        bankCode: "", // Empty string will show all bank options on VNPAY
        bookingData,
        userId,
        bookingId
      }),
    });
    return await response.json();
  } catch (error) {
    console.error("VNPAY API Error:", error);
    return { success: false, message: "Lỗi kết nối Server" };
  }
};

export const createOfflineBooking = async (bookingData: any, userId: string) => {
  try {
    const response = await fetch(`${API_URL}/create_offline_booking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingData,
        userId
      }),
    });
    return await response.json();
  } catch (error) {
    console.error("Offline Booking Error:", error);
    return { success: false, message: "Lỗi kết nối Server" };
  }
};

export const getPaymentStatus = async (bookingId: string) => {
  try {
    const response = await fetch(`${API_URL}/status/${bookingId}`);
    return await response.json();
  } catch (error) {
    console.error("VNPAY Status API Error:", error);
    return { success: false, message: "Lỗi kết nối Server" };
  }
};
