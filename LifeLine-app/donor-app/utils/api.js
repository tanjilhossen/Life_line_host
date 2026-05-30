import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = 3000;

function getExpoHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest?.debuggerHost ||
    Constants.manifest2?.extra?.expoClient?.hostUri;

  return hostUri?.split(':')[0];
}

function getBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `http://${window.location.hostname}:${API_PORT}`;
  }

  const host = getExpoHost();
  return `http://${host || '192.168.0.107'}:${API_PORT}`;
}

export const BASE_URL = getBaseUrl();

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});
