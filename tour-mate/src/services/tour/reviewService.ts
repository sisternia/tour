import { Platform } from 'react-native';
import { API_URL } from '../config';

export const getTourReviews = async (tourId: string) => {
  const res = await fetch(`${API_URL}/reviews/tour/${tourId}`);
  return res.json();
};

export const getReviewableBookings = async (tourId: string, userId: string) => {
  const res = await fetch(`${API_URL}/reviews/can-review/${tourId}?user_id=${userId}`);
  return res.json();
};

export const createReview = async (
  tourId: string,
  bookingId: string,
  userId: string,
  rating: number,
  comment: string,
  imageUris: string[]
) => {
  const formData = new FormData();
  formData.append('tour_id', tourId);
  formData.append('booking_id', bookingId);
  formData.append('user_id', userId);
  formData.append('rating', String(rating));
  formData.append('comment', comment);

  if (Platform.OS === 'web') {
    for (let i = 0; i < imageUris.length; i++) {
      const response = await fetch(imageUris[i]);
      const blob = await response.blob();
      formData.append('images', blob, `image_${i}.jpg`);
    }
  } else {
    imageUris.forEach((uri, i) => {
      const filename = uri.split('/').pop() || `image_${i}.jpg`;
      const ext = filename.split('.').pop() || 'jpg';
      formData.append('images', {
        uri,
        name: filename,
        type: `image/${ext}`
      } as any);
    });
  }

  const res = await fetch(`${API_URL}/reviews/create`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
};

export const getUserReviewImages = async (userId: string) => {
  const res = await fetch(`${API_URL}/reviews/user/${userId}/images`);
  return res.json();
};
