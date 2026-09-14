import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getSettings, getSettingsRevision } from '../src/core';
import { getWeatherForecast, cachedFetch } from '../src/core';
import type { WeatherData } from '../src/core';

export default function WeatherScreen() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const settingsRevisionRef = useRef(getSettingsRevision());

  const loadData = useCallback(async () => {
    const settings = getSettings();
    try {
      const { data: result } = await cachedFetch(
        `astroset:weather:${settings.latitude},${settings.longitude}`,
        () => getWeatherForecast(settings.latitude, settings.longitude)
      );
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weather data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const getWeatherEmoji = (code: number): string => {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '🌫️';
    if (code <= 55) return '🌧️';
    if (code <= 65) return '🌧️';
    if (code <= 75) return '❄️';
    if (code <= 77) return '❄️';
    if (code <= 82) return '🌧️';
    if (code <= 86) return '❄️';
    return '⛈️';
  };

  const getUVLevel = (uv: number): { level: string; color: string } => {
    if (uv <= 2) return { level: 'Low', color: '#2ecc71' };
    if (uv <= 5) return { level: 'Moderate', color: '#f1c40f' };
    if (uv <= 7) return { level: 'High', color: '#e67e22' };
    if (uv <= 10) return { level: 'Very High', color: '#e74c3c' };
    return { level: 'Extreme', color: '#9b59b6' };
  };

  if (loading) {
    return (
      <View style={styles.screenWrapper}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4a9eff" />
          <Text style={styles.loadingText}>Loading weather data...</Text>
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

  const today = data?.daily?.[0];
  const uvLevel = today ? getUVLevel(today.uvIndex) : null;

  return (
    <View style={styles.screenWrapper}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4a9eff" />
        }
      >
      {/* Today's Weather */}
      {today && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>☀️ Today's Forecast</Text>
          <View style={styles.todayHeader}>
            <Text style={styles.weatherEmoji}>{getWeatherEmoji(today.weatherCode)}</Text>
            <View>
              <Text style={styles.cardValue}>
                {today.maxTemp}° / {today.minTemp}°
              </Text>
              <Text style={styles.cardSubtitle}>{today.weatherDescription}</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>💧 Precipitation</Text>
              <Text style={styles.statValue}>{today.precipitationChance}%</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>☀️ UV Index</Text>
              <Text style={[styles.statValue, { color: uvLevel?.color }]}>
                {today.uvIndex} ({uvLevel?.level})
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>💨 Wind</Text>
              <Text style={styles.statValue}>{today.windSpeed} km/h</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>💦 Humidity</Text>
              <Text style={styles.statValue}>{today.humidity}%</Text>
            </View>
          </View>

          <View style={styles.sunTimes}>
            <Text style={styles.sunTime}>
              🌅 Sunrise: {new Date(today.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text style={styles.sunTime}>
              🌇 Sunset: {new Date(today.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
      )}

      {/* 7-Day Forecast */}
      {data?.daily && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 7-Day Forecast</Text>
          {data.daily.map((day, index) => (
            <View key={day.date} style={styles.forecastItem}>
              <View style={styles.forecastDay}>
                <Text style={styles.forecastDayName}>
                  {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
                <Text style={styles.forecastDate}>
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </View>
              <Text style={styles.forecastEmoji}>{getWeatherEmoji(day.weatherCode)}</Text>
              <Text style={styles.forecastDesc}>{day.weatherDescription}</Text>
              <View style={styles.forecastTemps}>
                <Text style={styles.tempHigh}>{day.maxTemp}°</Text>
                <Text style={styles.tempLow}>{day.minTemp}°</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* UV Guide */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>☀️ UV Index Guide</Text>
        <View style={styles.uvGuide}>
          <View style={styles.uvItem}>
            <Text style={[styles.uvLevel, { color: '#2ecc71' }]}>0-2 Low</Text>
            <Text style={styles.uvDesc}>No protection needed</Text>
          </View>
          <View style={styles.uvItem}>
            <Text style={[styles.uvLevel, { color: '#f1c40f' }]}>3-5 Moderate</Text>
            <Text style={styles.uvDesc}>Wear sunscreen</Text>
          </View>
          <View style={styles.uvItem}>
            <Text style={[styles.uvLevel, { color: '#e67e22' }]}>6-7 High</Text>
            <Text style={styles.uvDesc}>Reduce sun exposure</Text>
          </View>
          <View style={styles.uvItem}>
            <Text style={[styles.uvLevel, { color: '#e74c3c' }]}>8-10 Very High</Text>
            <Text style={styles.uvDesc}>Extra protection essential</Text>
          </View>
          <View style={styles.uvItem}>
            <Text style={[styles.uvLevel, { color: '#9b59b6' }]}>11+ Extreme</Text>
            <Text style={styles.uvDesc}>Avoid sun exposure</Text>
          </View>
        </View>
      </View>

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
  todayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  weatherEmoji: {
    fontSize: 48,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
  },
  statLabel: {
    fontSize: 12,
    color: '#a0a0cc',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e0e0ff',
  },
  sunTimes: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#3a3a6a',
  },
  sunTime: {
    fontSize: 14,
    color: '#a0a0cc',
  },
  forecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a6a',
  },
  forecastDay: {
    width: 70,
  },
  forecastDayName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e0e0ff',
  },
  forecastDate: {
    fontSize: 11,
    color: '#a0a0cc',
  },
  forecastEmoji: {
    fontSize: 24,
    marginHorizontal: 12,
  },
  forecastDesc: {
    flex: 1,
    fontSize: 13,
    color: '#a0a0cc',
  },
  forecastTemps: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  tempHigh: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e74c3c',
  },
  tempLow: {
    fontSize: 14,
    color: '#a0a0cc',
  },
  uvGuide: {
    gap: 8,
  },
  uvItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  uvLevel: {
    fontSize: 14,
    fontWeight: '600',
  },
  uvDesc: {
    fontSize: 13,
    color: '#a0a0cc',
  },
});
