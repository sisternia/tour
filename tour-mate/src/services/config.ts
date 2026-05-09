import { Platform } from 'react-native';

export const API_URL = Platform.OS === 'web'
  ? 'http://localhost:3000/api'
  : process.env.EXPO_PUBLIC_API_URL;
