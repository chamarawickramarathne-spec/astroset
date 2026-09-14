import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getSettings, getSettingsRevision } from '../src/core';
import { fetchDailyData, cachedFetch } from '../src/core';
import type { DailyData } from '../src/core';
import PlanetaryChart from '../components/PlanetaryChart';

function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TodayScreen() {
  const [data, setData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [countdown, setCountdown] = useState(30 * 60);

  const loadData = useCallback(async () => {
    const settings = getSettings();
    try {
      const { data: result, fromCache } = await cachedFetch(
        `astroset:daily:${settings.latitude},${settings.longitude},${settings.zodiacSign}`,
        () => fetchDailyData(settings.latitude, settings.longitude, settings.zodiacSign)
      );
      setData(result);
      setError(null);
      setLastUpdate(new Date().toLocaleTimeString() + (fromCache ? ' (cached)' : ''));
      setCountdown(30 * 60);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const settingsRevisionRef = useRef(getSettingsRevision());

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      const rev = getSettingsRevision();
      if (rev !== settingsRevisionRef.current) {
        settingsRevisionRef.current = rev;
        setLoading(true);
        loadData();
      }
    }, [loadData])
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <View style={styles.screenWrapper}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4a9eff" />
          <Text style={styles.loadingText}>Loading cosmic data...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.screenWrapper}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.retryText} onPress={loadData}>Tap to retry</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screenWrapper}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4a9eff" />
        }
      >
      {/* Live Status */}
      {lastUpdate && (
        <View style={styles.liveContainer}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>
            Live • Updated {lastUpdate} • Next: {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
          </Text>
        </View>
      )}

      {/* Planetary Alignment */}
      {data?.astrology.planetaryPositions && data.astrology.planetaryPositions.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🪐 Planetary Alignment</Text>
          <PlanetaryChart positions={data.astrology.planetaryPositions} />
        </View>
      )}

      {/* Today's Weather */}
      {data?.weather.daily && data.weather.daily.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>☀️ Today's Weather</Text>
          <Text style={styles.cardValue}>
            {data.weather.daily[0].maxTemp}° / {data.weather.daily[0].minTemp}°
          </Text>
          <Text style={styles.cardSubtitle}>{data.weather.daily[0].weatherDescription}</Text>
          <View style={styles.weatherMeta}>
            <Text style={styles.metaItem}>💧 {data.weather.daily[0].precipitationChance}%</Text>
            <Text style={styles.metaItem}>☀️ UV: {data.weather.daily[0].uvIndex}</Text>
            <Text style={styles.metaItem}>💨 {data.weather.daily[0].windSpeed} km/h</Text>
          </View>
        </View>
      )}

      {/* Moon Phase & Vedic Panchang */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌙 Moon Phase & Vedic Panchang</Text>
        <Text style={styles.cardValue}>
          {data?.astrology.moonPhase?.emoji || '🌑'} {data?.astrology.moonPhase?.phase || 'Unknown'}
        </Text>
        <Text style={styles.cardSubtitle}>
          {data?.astrology.moonPhase
            ? `${Math.round(data.astrology.moonPhase.illumination)}% illuminated`
            : 'No data'}
        </Text>
        {data?.astrology.panchang && (
          <View style={[styles.panchangGrid, styles.panchangMerged]}>
            <View style={styles.panchangItem}>
              <Text style={styles.panchangLabel}>Tithi</Text>
              <Text style={styles.panchangValue}>{data.astrology.panchang.tithi}</Text>
            </View>
            <View style={styles.panchangItem}>
              <Text style={styles.panchangLabel}>Nakshatra</Text>
              <Text style={styles.panchangValue}>{data.astrology.panchang.nakshatra}</Text>
            </View>
            <View style={styles.panchangItem}>
              <Text style={styles.panchangLabel}>Karana</Text>
              <Text style={styles.panchangValue}>{data.astrology.panchang.karana}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Moon Events */}
      {data?.astrology.moonEvents && data.astrology.moonEvents.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌙 Upcoming Moon Events</Text>
          {data.astrology.moonEvents.slice(0, 5).map((event, index) => (
            <View key={index} style={styles.eventItem}>
              <Text style={styles.eventIcon}>{event.emoji}</Text>
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{event.label}</Text>
                <Text style={styles.eventDescription}>
                  {formatEventDate(event.date)}
                  {event.detail ? ` • ${event.detail}` : ''}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Planetary Events */}
      {data?.astrology.planetaryEvents && data.astrology.planetaryEvents.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔭 Upcoming Planetary Events</Text>
          {data.astrology.planetaryEvents.slice(0, 6).map((event, index) => (
            <View key={index} style={styles.eventItem}>
              <Text style={styles.eventIcon}>{event.glyph}</Text>
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>
                  {event.label}
                  {(event.type === 'retrograde_start' || event.type === 'retrograde_end') ? ' ℞' : ''}
                </Text>
                <Text style={styles.eventDescription}>{formatEventDate(event.date)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Daily Horoscope */}
      {data?.astrology.horoscope && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>♈ Daily Horoscope</Text>
          <Text style={styles.horoscopeSign}>{data.astrology.horoscope.sign}</Text>
          {!!data.astrology.horoscope.date && (
            <Text style={styles.cardSubtitle}>For {data.astrology.horoscope.date}</Text>
          )}
          <Text style={styles.horoscopeText}>{data.astrology.horoscope.description}</Text>
          <View style={styles.horoscopeMeta}>
            {data.astrology.horoscope.luckyColor && (
              <Text style={styles.metaItem}>🎨 {data.astrology.horoscope.luckyColor}</Text>
            )}
            {data.astrology.horoscope.mood && (
              <Text style={styles.metaItem}>😊 {data.astrology.horoscope.mood}</Text>
            )}
          </View>
        </View>
      )}

      {/* Recent Events */}
      {data?.solar.events && data.solar.events.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📰 Recent Events</Text>
          {data.solar.events.slice(0, 3).map((event, index) => (
            <View key={index} style={styles.eventItem}>
              <Text style={styles.eventIcon}>
                {event.type === 'solar_flare' ? '⚡' : event.type === 'geomagnetic_storm' ? '🌊' : '🌌'}
              </Text>
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{event.type.replace('_', ' ').toUpperCase()}</Text>
                <Text style={styles.eventDescription}>{event.message}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f23',
  },
  loadingText: {
    color: '#a0a0cc',
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    marginBottom: 16,
  },
  retryText: {
    color: '#4a9eff',
    fontSize: 14,
  },
  liveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  liveText: {
    fontSize: 12,
    color: '#10b981',
  },
  card: {
    backgroundColor: '#252547',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#3a3a6a',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a0a0cc',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#e0e0ff',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#a0a0cc',
  },
  panchangGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  panchangMerged: {
    marginTop: 14,
  },
  panchangItem: {
    flex: 1,
    minWidth: '45%',
  },
  panchangLabel: {
    fontSize: 12,
    color: '#a0a0cc',
    marginBottom: 4,
  },
  panchangValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e0e0ff',
  },
  horoscopeSign: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a9eff',
    marginBottom: 8,
  },
  horoscopeText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#e0e0ff',
  },
  horoscopeMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  metaItem: {
    fontSize: 13,
    color: '#a0a0cc',
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  weatherMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  eventItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a6a',
  },
  eventIcon: {
    fontSize: 20,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e0e0ff',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 12,
    color: '#a0a0cc',
  },
});
