import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Linking, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../utils/api';

// ─── FIX 3: Absolute countdown from created_at ───────────────────────────────
function calcSecondsLeft(createdAt: string): number {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const elapsed = Math.floor((now - created) / 1000);
  return Math.max(0, 300 - elapsed); // 300 s = 5 min
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// ─── Live countdown hook ──────────────────────────────────────────────────────
function useCountdown(createdAt: string | undefined) {
  const [secs, setSecs] = useState<number>(0);

  useEffect(() => {
    if (!createdAt) return;
    // Set initial value immediately
    setSecs(calcSecondsLeft(createdAt));
    const id = setInterval(() => {
      const left = calcSecondsLeft(createdAt);
      setSecs(left);
      if (left <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [createdAt]);

  return secs;
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function MessageDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [requestDetails, setRequestDetails] = useState<any>(null);
  const [donor, setDonor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [alreadyResponded, setAlreadyResponded] = useState(false);

  // Countdown is driven by the created_at timestamp from the DB (FIX 3)
  const timeLeft = useCountdown(requestDetails?.created_at);
  const isExpired = timeLeft <= 0 && requestDetails != null;

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem('donorData');
      if (data) setDonor(JSON.parse(data));

      const res = await api.post('/api/request/details', { requestId: id });
      if (res.data.success) {
        setRequestDetails(res.data.data);
      } else {
        Alert.alert('Error', 'Request not found.');
        router.back();
      }
    } catch (e) {
      console.log(e);
      Alert.alert('Error', 'Failed to load details.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // ── FIX 4: Accept / Decline hit /api/donor/respond ───────────────────────
  const handleAction = async (action: 'accept' | 'reject') => {
    if (!donor || responding) return;
    const status = action === 'accept' ? 'Accepted' : 'Rejected';

    setResponding(true);
    try {
      const res = await api.post('/api/donor/respond', {
        donorId: Number(donor.id),
        requestId: Number(id),
        status,
      });

      if (res.data.success) {
        setAlreadyResponded(true);

        if (action === 'accept') {
          // ✅ On Accept: go directly to Inbox so donor sees the contact number
          Alert.alert(
            '✅ Request Accepted!',
            res.data.message + '\n\nCheck your Inbox for the patient\'s contact number.',
            [{
              text: 'Go to Inbox',
              onPress: () => router.replace('/(tabs)/messages'),
            }]
          );
        } else {
          // ❌ On Decline: just go back to Dashboard
          Alert.alert('Declined', res.data.message, [
            { text: 'OK', onPress: () => router.back() },
          ]);
        }
      } else {
        Alert.alert('Error', res.data.message || 'Something went wrong.');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setResponding(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    );
  }

  if (!requestDetails) return <View style={{ flex: 1, backgroundColor: '#fff' }} />;

  const showButtons = !isExpired && !alreadyResponded;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
    >
      {/* Blood group hero */}
      <View style={{ alignItems: 'center', marginBottom: 28 }}>
        <View
          style={{
            width: 96, height: 96, backgroundColor: '#fee2e2',
            borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
          }}
        >
          <Ionicons name="water" size={48} color="#dc2626" />
        </View>
        <Text style={{ fontSize: 28, fontWeight: '800', color: '#1f2937', textAlign: 'center' }}>
          {requestDetails.blood_group} Blood Needed!
        </Text>
      </View>

      {/* Details card */}
      <View
        style={{
          backgroundColor: '#f9fafb', borderRadius: 20, padding: 20,
          marginBottom: 24, borderWidth: 1, borderColor: '#f3f4f6',
        }}
      >
        <DetailRow icon="business" label="Hospital" value={requestDetails.hospital_name} />
        <DetailRow icon="location" label="Location" value={requestDetails.location} />
        <DetailRow icon="time" label="Needed By" value={requestDetails.needed_time} />
        <DetailRow icon="medkit" label="Reason" value={requestDetails.patient_disease} />
      </View>

      {/* FIX 3: Timer driven by created_at */}
      <View style={{ alignItems: 'center', marginBottom: 28 }}>
        <Text style={{ color: '#6b7280', fontSize: 14, marginBottom: 6 }}>
          Time remaining to accept:
        </Text>
        <Text
          style={{
            fontSize: 48, fontWeight: '800',
            color: isExpired ? '#ef4444' : timeLeft < 60 ? '#f97316' : '#1f2937',
          }}
        >
          {isExpired ? 'Expired' : formatTime(timeLeft)}
        </Text>
        {isExpired && (
          <Text style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>
            This request is no longer active.
          </Text>
        )}
      </View>

      {/* FIX 4: Action buttons */}
      {showButtons ? (
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            style={{
              flex: 1, backgroundColor: '#f3f4f6', padding: 16,
              borderRadius: 16, alignItems: 'center',
              opacity: responding ? 0.6 : 1,
            }}
            onPress={() => handleAction('reject')}
            disabled={responding}
          >
            <Text style={{ color: '#374151', fontWeight: '700', fontSize: 16 }}>
              {responding ? '...' : '❌ Decline'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1, backgroundColor: '#dc2626', padding: 16,
              borderRadius: 16, alignItems: 'center',
              opacity: responding ? 0.6 : 1,
            }}
            onPress={() => handleAction('accept')}
            disabled={responding}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
              {responding ? '...' : '✅ Accept'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ alignItems: 'center', gap: 12 }}>
          {isExpired && (
            <View
              style={{
                backgroundColor: '#fef2f2', borderRadius: 16, padding: 16,
                borderWidth: 1, borderColor: '#fecaca', width: '100%', alignItems: 'center',
              }}
            >
              <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 16 }}>
                ⏰ Request Expired
              </Text>
              <Text style={{ color: '#9ca3af', fontSize: 13, marginTop: 4 }}>
                The 5-minute window has passed.
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={{
              backgroundColor: '#f3f4f6', padding: 16, borderRadius: 16,
              alignItems: 'center', width: '100%',
            }}
            onPress={() => router.back()}
          >
            <Text style={{ color: '#374151', fontWeight: '700', fontSize: 16 }}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

// ─── Helper component ─────────────────────────────────────────────────────────
function DetailRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
      <View
        style={{
          width: 40, height: 40, backgroundColor: '#fff',
          borderRadius: 20, alignItems: 'center', justifyContent: 'center',
          marginRight: 14, borderWidth: 1, borderColor: '#e5e7eb',
        }}
      >
        <Ionicons name={icon} size={20} color="#dc2626" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#9ca3af', fontSize: 12 }}>{label}</Text>
        <Text style={{ color: '#1f2937', fontWeight: '600', fontSize: 15 }}>{value}</Text>
      </View>
    </View>
  );
}
