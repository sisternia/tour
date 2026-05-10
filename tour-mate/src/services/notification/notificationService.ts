import axios from "axios";
import { API_URL } from "../config";

export const getNotifications = async (userId: string) => {
  try {
    const response = await axios.get(`${API_URL}/notifications/get-notifications/${userId}`);
    return response.data;
  } catch (error: any) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const markAsRead = async (notificationId: string) => {
  try {
    const response = await axios.put(`${API_URL}/notifications/mark-as-read/${notificationId}`);
    return response.data;
  } catch (error: any) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const markAllAsRead = async (userId: string) => {
  try {
    const response = await axios.put(`${API_URL}/notifications/mark-all-read/${userId}`);
    return response.data;
  } catch (error: any) {
    return error.response?.data || { success: false, message: error.message };
  }
};
