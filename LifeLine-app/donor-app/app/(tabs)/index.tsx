import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, Switch, Alert, TouchableOpacity,
  ScrollView, FlatList, ActivityIndicator, RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { api } from '../../utils/api';
import { Ionicons } from '@expo/vector-icons';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcSecondsLeft(createdAt: string): number {
  const created = new Date(createdAt).getTime();
  const elapsed = Math.floor((Date.now() - created) / 1000);
  return Math.max(0, 300 - elapsed);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// ─── Countdown badge — auto-removes its card when timer hits 0 ───────────────
function CountdownBadge({
  createdAt,
  onExpire,
}: {
  createdAt: string;
  onExpire: () => void;
}) {
  const [secs, setSecs] = useState(() => calcSecondsLeft(createdAt));
  const firedRef = useRef(false);

  React.useEffect(() => {
    if (secs <= 0) {
      if (!firedRef.current) {
        firedRef.current = true;
        setTimeout(onExpire, 800);
      }
      return;
    }
    const id = setInterval(() => setSecs(calcSecondsLeft(createdAt)), 1000);
    return () => clearInterval(id);
  }, [createdAt, secs]);

  const expired = secs <= 0;
  return (
    <Text
      style={{
        fontSize: 13,
        fontWeight: '700',
        color: expired ? '#ef4444' : secs < 60 ? '#f97316' : '#16a34a',
        marginTop: 4,
      }}
    >
      {expired ? '⏰ Expired' : `⏱ ${formatTime(secs)} left`}
    </Text>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const [donor, setDonor] = useState<any>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false); // loading state for toggle
  const [stats, setStats] = useState({ totalRequests: 0, approvedRequests: 0 });
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const donorIdRef = useRef<number | null>(null);
  const isFocused = useRef(false);

  // ── Fetch live DB status — called on every focus ──────────────────────────
  const syncStatusFromDB = useCallback(async (donorId: number) => {
    try {
      const res = await api.get(`/api/donor/status?donorId=${donorId}`);
      if (res.data.success) {
        const liveStatus = res.data.status;
        setIsAvailable(liveStatus === 'Available');
        // Also keep AsyncStorage in sync
        const raw = await AsyncStorage.getItem('donorData');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.status !== liveStatus) {
            parsed.status = liveStatus;
            await AsyncStorage.setItem('donorData', JSON.stringify(parsed));
            setDonor((prev: any) => prev ? { ...prev, status: liveStatus } : prev);
          }
        }
      }
    } catch (e) {
      console.log('Status sync error', e);
    }
  }, []);

  // ── Core data fetchers ────────────────────────────────────────────────────

  const fetchStats = useCallback(async (donorId: number) => {
    try {
      const res = await api.post('/api/donor/dashboard', { donorId });
      if (res.data.success) {
        setStats({
          totalRequests: res.data.data.total_requests,
          approvedRequests: res.data.data.total_approved,
        });
      }
    } catch (e) {
      console.log('Stats error', e);
    }
  }, []);

  const fetchPending = useCallback(async (donorId: number) => {
    try {
      const res = await api.post('/api/donor/pending-requests', { donorId });
      setPendingRequests(res.data.success ? res.data.data : []);
    } catch (e) {
      console.log('Pending error', e);
    }
  }, []);

  const loadAll = useCallback(async (showFullLoader = false) => {
    if (showFullLoader) setLoading(true);
    try {
      const raw = await AsyncStorage.getItem('donorData');
      if (!raw) { router.replace('/'); return; }

      const parsed = JSON.parse(raw);
      setDonor(parsed);
      donorIdRef.current = parsed.id;

      // ── CRITICAL: Always fetch the live status from the DB, not from cache
      await syncStatusFromDB(parsed.id);

      await Promise.all([fetchStats(parsed.id), fetchPending(parsed.id)]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [syncStatusFromDB, fetchStats, fetchPending]);

  // ── useFocusEffect: re-sync every time the tab becomes visible ──────────
  useFocusEffect(
    useCallback(() => {
      isFocused.current = true;
      loadAll(true);

      // 30-second auto-poll for new pending requests
      const pollInterval = setInterval(() => {
        if (donorIdRef.current && isFocused.current) {
          fetchPending(donorIdRef.current);
          // Also silently re-sync status in case web changed it
          syncStatusFromDB(donorIdRef.current);
        }
      }, 30_000);

      return () => {
        isFocused.current = false;
        clearInterval(pollInterval);
      };
    }, [loadAll, fetchPending, syncStatusFromDB])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAll(false);
  }, [loadAll]);

  // ── Toggle Available / Busy ───────────────────────────────────────────────
  // Shows a loading state; only updates UI after confirmed DB write.
  const toggleStatus = async () => {
    if (!donor || statusLoading) return;
    const newStatus = isAvailable ? 'Busy' : 'Available';

    setStatusLoading(true);
    try {
      const res = await api.post('/api/donor/update-status', {
        donorId: donor.id,
        status: newStatus,
      });

      if (res.data.success) {
        // Use the confirmed status returned by the server, not the optimistic value
        const confirmedStatus: string = res.data.status ?? newStatus;
        setIsAvailable(confirmedStatus === 'Available');
        const updated = { ...donor, status: confirmedStatus };
        setDonor(updated);
        await AsyncStorage.setItem('donorData', JSON.stringify(updated));
      } else {
        Alert.alert('Error', res.data.message || 'Could not update status.');
      }
    } catch {
      Alert.alert('Error', 'Network error. Could not update status.');
    } finally {
      setStatusLoading(false);
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['donorData', 'token']);
          router.replace('/');
        },
      },
    ]);
  };

  // ── Auto-remove expired cards from local state ────────────────────────────
  const removeExpiredCard = useCallback((requestId: number) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
  }, []);

  // ── Card renderer ─────────────────────────────────────────────────────────
  const renderPendingCard = useCallback(
    ({ item }: any) => (
      <TouchableOpacity
        style={{
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: '#fecaca',
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
        onPress={() => router.push(`/message/${item.id}`)}
        activeOpacity={0.8}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View
            style={{
              width: 44, height: 44, borderRadius: 22,
              backgroundColor: '#fee2e2', alignItems: 'center',
              justifyContent: 'center', marginRight: 12,
            }}
          >
            <Ionicons name="water" size={22} color="#dc2626" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937' }}>
              {item.blood_group} Blood Needed!
            </Text>
            <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }} numberOfLines={1}>
              {item.hospital_name} • {item.location}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </View>

        <View
          style={{
            flexDirection: 'row', justifyContent: 'space-between',
            alignItems: 'center', paddingTop: 8,
            borderTopWidth: 1, borderTopColor: '#f3f4f6',
          }}
        >
          <CountdownBadge
            createdAt={item.created_at}
            onExpire={() => removeExpiredCard(item.id)}
          />
          <Text style={{ fontSize: 12, color: '#f97316', fontWeight: '600' }}>
            🔴 URGENT — Tap to respond
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [router, removeExpiredCard]
  );

  // ── Empty state ───────────────────────────────────────────────────────────
  const EmptyState = () => (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
      <Ionicons name="shield-checkmark-outline" size={64} color="#d1d5db" />
      <Text style={{ color: '#6b7280', fontSize: 18, fontWeight: '600', marginTop: 16 }}>
        No emergency requests right now.
      </Text>
      <Text style={{ color: '#9ca3af', fontSize: 14, marginTop: 6, textAlign: 'center' }}>
        You are a hero! 🦸 We'll alert you{'\n'}when someone needs your help.
      </Text>
      <Text style={{ color: '#d1d5db', fontSize: 12, marginTop: 8 }}>
        Auto-refreshes every 30 seconds
      </Text>
    </View>
  );

  // ── Full-screen loader ────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    );
  }

  if (!donor) return <View style={{ flex: 1, backgroundColor: '#fff' }} />;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f9fafb' }}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#dc2626']}
          tintColor="#dc2626"
        />
      }
    >
      {/* ── Profile Card ──────────────────────────────────────────────── */}
      <View
        style={{
          backgroundColor: '#fff', padding: 24, borderRadius: 20,
          marginBottom: 16, alignItems: 'center',
          borderWidth: 1, borderColor: '#f3f4f6',
          shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
        }}
      >
        <View
          style={{
            width: 80, height: 80, backgroundColor: '#fee2e2',
            borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
          }}
        >
          <Text style={{ color: '#dc2626', fontWeight: '800', fontSize: 26 }}>
            {donor.blood_group}
          </Text>
        </View>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#1f2937' }}>{donor.name}</Text>
        <Text style={{ color: '#6b7280', marginTop: 4 }}>
          {donor.location} · {donor.phone}
        </Text>
      </View>

      {/* ── Status Toggle ─────────────────────────────────────────────── */}
      <View
        style={{
          backgroundColor: '#fff', padding: 20, borderRadius: 16,
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 16, borderWidth: 1, borderColor: '#f3f4f6',
        }}
      >
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937' }}>
            Donation Status
          </Text>
          <Text style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>
            {statusLoading
              ? '⏳ Updating...'
              : isAvailable
              ? '🟢 Available — you can receive requests'
              : '🔴 Busy — requests are blocked'}
          </Text>
          {!isAvailable && !statusLoading && (
            <Text style={{ color: '#ef4444', fontSize: 11, marginTop: 4, fontWeight: '600' }}>
              ⚠️ You will NOT receive emergency notifications while Busy.
            </Text>
          )}
        </View>
        {statusLoading ? (
          <ActivityIndicator size="small" color="#dc2626" />
        ) : (
          <Switch
            trackColor={{ false: '#fca5a5', true: '#86efac' }}
            thumbColor={isAvailable ? '#22c55e' : '#ef4444'}
            onValueChange={toggleStatus}
            value={isAvailable}
            disabled={statusLoading}
          />
        )}
      </View>

      {/* ── Stats Row ─────────────────────────────────────────────────── */}
      <View style={{ flexDirection: 'row', marginBottom: 16, gap: 12 }}>
        <View
          style={{
            flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 16,
            alignItems: 'center', borderWidth: 1, borderColor: '#f3f4f6',
          }}
        >
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#dc2626' }}>
            {donor.donation_count ?? 0}
          </Text>
          <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>Donations</Text>
        </View>

        <View
          style={{
            flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 16,
            alignItems: 'center', borderWidth: 1, borderColor: '#f3f4f6',
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#1f2937', marginTop: 4, textAlign: 'center' }}>
            {donor.last_donation_date
              ? new Date(donor.last_donation_date).toLocaleDateString()
              : 'Never'}
          </Text>
          <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>Last Donated</Text>
        </View>

        <View
          style={{
            flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 16,
            alignItems: 'center', borderWidth: 1, borderColor: '#f3f4f6',
          }}
        >
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#2563eb' }}>
            {stats.approvedRequests}
          </Text>
          <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4, textAlign: 'center' }}>
            Accepted
          </Text>
        </View>
      </View>

      {/* ── Pending Requests Section ───────────────────────────────────── */}
      <View style={{ marginBottom: 16 }}>
        <View
          style={{
            flexDirection: 'row', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#1f2937' }}>
            🚨 Pending ({pendingRequests.length})
          </Text>
          <TouchableOpacity
            onPress={() => { if (donorIdRef.current) fetchPending(donorIdRef.current); }}
          >
            <Ionicons name="refresh-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {pendingRequests.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={pendingRequests}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderPendingCard}
            scrollEnabled={false}
          />
        )}
      </View>

      {/* ── Logout Button ─────────────────────────────────────────────── */}
      <TouchableOpacity
        style={{
          marginTop: 8, backgroundColor: '#fee2e2', padding: 16,
          borderRadius: 16, alignItems: 'center', flexDirection: 'row',
          justifyContent: 'center', gap: 8,
        }}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={20} color="#dc2626" />
        <Text style={{ color: '#dc2626', fontWeight: '700', fontSize: 16 }}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
