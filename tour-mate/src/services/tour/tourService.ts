import { Platform } from "react-native";

const API_URL =
  Platform.OS === "web"
    ? "http://localhost:3000/api/tours"
    : `${process.env.EXPO_PUBLIC_API_URL}/tours`;

export const getAllTours = async () => {
  try {
    const response = await fetch(`${API_URL}/view-tour`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return await response.json();
  } catch (error) {
    console.error("Get All Tours API Error:", error);
    return { success: false, message: "Lỗi kết nối Server" };
  }
};

export const getTourById = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/view-tour/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return await response.json();
  } catch (error) {
    console.error("Get Tour By Id API Error:", error);
    return { success: false, message: "Lỗi kết nối Server" };
  }
};
