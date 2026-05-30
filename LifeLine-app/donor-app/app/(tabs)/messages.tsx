import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  RefreshControl, Alert, ScrollView, Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../utils/api';

// ─── Reusable detail row ─────────────────────────────────────────────────────
function DetailRow({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: any;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 9,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: '#fee2e2',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
          marginTop: 1,
        }}
      >
        <Ionicons name={icon} size={16} color="#dc2626" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </Text>
        <Text style={{ fontSize: 15, color: valueColor ?? '#1f2937', fontWeight: '600', marginTop: 2 }}>
          {value || '—'}
        </Text>
      </View>
    </View>
  );
}

// ─── Main Inbox Screen ────────────────────────────────────────────────────────
export default function InboxScreen() {
  const [requests, setRequests] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [donorId, setDonorId] = useState<number | null>(null);

  // ── Load whenever tab is focused ─────────────────────────────────────────
  const loadInbox = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem('donorData');
      if (!data) return;
      const parsed = JSON.parse(data);
      setDonorId(parsed.id);

      const res = await api.post('/api/donor/inbox', { donorId: parsed.id });
      setRequests(res.data.success ? res.data.data : []);
    } catch (error) {
      console.log('Inbox error', error);
      setRequests([]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadInbox();
    }, [loadInbox])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadInbox();
  };

  // ── Remove from inbox ─────────────────────────────────────────────────────
  const handleDelete = (requestId: number) => {
    Alert.alert('Remove', 'Remove this record from your inbox?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.post('/api/donor/request-delete', { donorId, requestId });
            setRequests((prev) => prev.filter((r) => r.id !== requestId));
          } catch {
            Alert.alert('Error', 'Failed to remove item.');
          }
        },
      },
    ]);
  };

  // ── Receipt card ──────────────────────────────────────────────────────────
  const renderItem = ({ item }: any) => {
    const isAccepted = item.response_status === 'Accepted';

    // Format the "responded at" timestamp
    const respondedAt = item.responded_at
      ? new Date(item.responded_at).toLocaleString('en-BD', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : null;

    return (
      <View
        style={{
          backgroundColor: '#fff',
          borderRadius: 20,
          marginBottom: 16,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: isAccepted ? '#bbf7d0' : '#fecaca',
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        {/* ── Header Banner ─────────────────────────────────────────────── */}
        <View
          style={{
            backgroundColor: isAccepted ? '#16a34a' : '#dc2626',
            paddingHorizontal: 20,
            paddingVertical: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {/* Blood group badge */}
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 8,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 22 }}>
                {item.blood_group}
              </Text>
            </View>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600' }}>
                {isAccepted ? '✅ YOU ACCEPTED' : '❌ YOU DECLINED'}
              </Text>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                Blood Request
              </Text>
            </View>
          </View>
          {/* Water drop icon */}
          <Ionicons name="water" size={32} color="rgba(255,255,255,0.3)" />
        </View>

        {/* ── Receipt body ──────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12 }}>
          <DetailRow
            icon="business-outline"
            label="Hospital / Facility"
            value={item.hospital_name}
          />
          <DetailRow
            icon="location-outline"
            label="Location"
            value={item.location}
          />
          <DetailRow
            icon="time-outline"
            label="Blood Needed By"
            value={item.needed_time}
          />
          <DetailRow
            icon="medkit-outline"
            label="Patient's Condition / Reason"
            value={item.patient_disease}
          />

          {/* Contact number — shown for accepted only */}
          {isAccepted ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                paddingVertical: 9,
                borderBottomWidth: 1,
                borderBottomColor: '#f3f4f6',
              }}
            >
              <View
                style={{
                  width: 32, height: 32, borderRadius: 16,
                  backgroundColor: '#dcfce7', alignItems: 'center',
                  justifyContent: 'center', marginRight: 12, marginTop: 1,
                }}
              >
                <Ionicons name="call" size={16} color="#16a34a" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Requester's Contact Number
                </Text>
                <Text style={{ fontSize: 18, color: '#16a34a', fontWeight: '800', marginTop: 2 }}>
                  {item.contact_number || '—'}
                </Text>
              </View>
            </View>
          ) : null}

          {/* Responded at timestamp */}
          {respondedAt ? (
            <View style={{ paddingVertical: 8, alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 11, color: '#9ca3af' }}>
                {isAccepted ? 'Accepted' : 'Declined'} on {respondedAt}
              </Text>
            </View>
          ) : null}
        </View>

        {/* ── Call button (Accepted only) ───────────────────────────────── */}
        {isAccepted && item.contact_number ? (
          <TouchableOpacity
            style={{
              backgroundColor: '#16a34a',
              marginHorizontal: 16,
              marginBottom: 12,
              borderRadius: 14,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
            onPress={() => Linking.openURL(`tel:${item.contact_number}`)}
            activeOpacity={0.85}
          >
            <Ionicons name="call" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
              Call {item.contact_number}
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* ── Remove button ─────────────────────────────────────────────── */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: '#f3f4f6',
            gap: 6,
          }}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={15} color="#9ca3af" />
          <Text style={{ color: '#9ca3af', fontSize: 13 }}>Remove from inbox</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ── Empty state ───────────────────────────────────────────────────────────
  const EmptyState = () => (
    <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, paddingHorizontal: 32 }}>
      <View
        style={{
          width: 96, height: 96, borderRadius: 48,
          backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <Ionicons name="mail-open-outline" size={48} color="#d1d5db" />
      </View>
      <Text style={{ color: '#374151', fontSize: 20, fontWeight: '700', textAlign: 'center' }}>
        Your inbox is empty
      </Text>
      <Text style={{ color: '#9ca3af', fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 22 }}>
        When you accept a blood request, a full receipt with the patient's contact number will appear here.
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {requests.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#dc2626']}
              tintColor="#dc2626"
            />
          }
        >
          <EmptyState />
        </ScrollView>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#dc2626']}
              tintColor="#dc2626"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
