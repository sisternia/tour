import axios from 'axios';
import { API_URL } from '../config';

export const getTravelersByTour = async (tourId: string, dateStart?: string, dateEnd?: string) => {
  try {
    const response = await axios.get(`${API_URL}/bookings/tour/${tourId}`, {
      params: { date_start: dateStart, date_end: dateEnd }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching travelers:', error);
    throw error;
  }
};

export const cancelBooking = async (bookingId: string) => {
  try {
    const response = await axios.patch(`${API_URL}/bookings/${bookingId}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};

export const confirmBooking = async (bookingId: string) => {
  try {
    const response = await axios.patch(`${API_URL}/bookings/${bookingId}/status`, {
      status: 'confirmed'
    });
    return response.data;
  } catch (error) {
    console.error('Error confirming booking:', error);
    throw error;
  }
};
