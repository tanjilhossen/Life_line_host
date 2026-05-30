import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { api } from '../utils/api';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    const userData = await AsyncStorage.getItem('donorData');
    if (userData) {
      router.replace('/(tabs)');
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      // Get FCM Token — non-blocking, fails gracefully if Firebase not ready
      let fcmToken = null;
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus === 'granted') {
          const tokenData = await Notifications.getDevicePushTokenAsync();
          fcmToken = tokenData.data;
        }
      } catch (tokenError) {
        console.warn('FCM token fetch failed (non-fatal):', tokenError);
        // Login continues without fcmToken
      }

      const res = await api.post('/api/donor/login', { username, password, fcmToken });
      
      if (res.data.success) {
        await AsyncStorage.setItem('donorData', JSON.stringify(res.data.donorData));
        Alert.alert('Success', res.data.message);
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', res.data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Could not connect to the server.');
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 p-6">
      <View className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <Text className="text-3xl font-bold text-red-600 mb-6 text-center">LifeLine Donor</Text>
        
        <Text className="text-gray-700 font-semibold mb-2">Username</Text>
        <TextInput
          className="bg-gray-50 border border-gray-300 rounded-lg p-3 mb-4 w-full"
          placeholder="Enter username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Text className="text-gray-700 font-semibold mb-2">Password</Text>
        <TextInput
          className="bg-gray-50 border border-gray-300 rounded-lg p-3 mb-6 w-full"
          placeholder="Enter password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity 
          className="bg-red-600 rounded-lg p-4 w-full"
          onPress={handleLogin}
          disabled={loading}
        >
          <Text className="text-white text-center font-bold text-lg">
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
