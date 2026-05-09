import axios from 'axios';
import { API_URL } from '../config';

export const getToursByGuide = async (guideId: string) => {
  try {
    const response = await axios.get(`${API_URL}/tours/view-tour`, {
      params: { guide_id: guideId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching guide tours:', error);
    throw error;
  }
};
