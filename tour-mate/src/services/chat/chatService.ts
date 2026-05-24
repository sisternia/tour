import axios from 'axios';
import { API_URL } from '../config';

export const sendMessage = async (sender_id: string, receiver_id: string, text: string) => {
  try {
    const response = await axios.post(`${API_URL}/messages/send`, { sender_id, receiver_id, text });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getChatHistory = async (user1: string, user2: string) => {
  try {
    const response = await axios.get(`${API_URL}/messages/history/${user1}/${user2}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
};

export const markAsRead = async (messageId: string) => {
  try {
    const response = await axios.patch(`${API_URL}/messages/read/${messageId}`);
    return response.data;
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

export const getConversations = async (userId: string) => {
  try {
    const response = await axios.get(`${API_URL}/messages/conversations/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

export const askBot = async (message: string, chatHistory: any[] = []) => {
  try {
    const response = await axios.post(`${API_URL}/ai/bot`, { message, chatHistory });
    return response.data;
  } catch (error) {
    console.error('Error asking bot:', error);
    throw error;
  }
};
