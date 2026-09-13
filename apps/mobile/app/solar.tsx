import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { getSolarData, getSchumannData, cachedFetch } from '@astroset/core';
import type { SchumannData, SolarData } from '@astroset/core';
import XrayChart from '../components/XrayChart';

export default function SolarScreen() {
  const [data, setData] = useState<SolarData | null>(null);
  const [schumann, setSchumann] = useState<SchumannData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [countdown, setCountdown] = useState(30 * 60);

  const loadData = useCallback(async () => {
    try {
      const { data: result, fromCache } = await cachedFetch('astroset:solar', () => getSolarData());
      setData(result);
      setError(null);
      setLastUpdate(new Date().toLocaleTimeString() + (fromCache ? ' (cached)' : ''));
      setCountdown(30 * 60);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load solar data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadSchumann = useCallback(async () => {
    try {
      const { data: sr } = await cachedFetch('astroset:schumann', () => getSchumannData());
      setSchumann(sr);
    } catch {
      setSchumann(null);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadSchumann();
    const interval = setInterval(() => {
      loadData();
      loadSchumann();
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadData, loadSchumann]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
    loadSchumann();
  }, [loadData, loadSchumann]);

  if (loading) {
    return (
      <View style={styles.screenWrapper}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4a9eff" />
          <Text style={styles.loadingText}>Loading solar data...</Text>
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

      {/* Space Weather Summary */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Space Weather Summary</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Kp Index</Text>
            <Text style={styles.summaryValue}>{data?.kpIndex.value || 0}</Text>
            <View style={[
              styles.severityBadge,
              styles.summaryBadge,
              {
                backgroundColor: (data?.kpIndex.value || 0) >= 5
                  ? 'rgba(231, 76, 60, 0.2)'
                  : (data?.kpIndex.value || 0) >= 3
                    ? 'rgba(241, 196, 15, 0.2)'
                    : 'rgba(46, 204, 113, 0.2)',
              },
            ]}>
              <Text style={[
                styles.severityText,
                {
                  color: (data?.kpIndex.value || 0) >= 5
                    ? '#e74c3c'
                    : (data?.kpIndex.value || 0) >= 3
                      ? '#f1c40f'
                      : '#2ecc71',
                },
              ]}>
                {data?.kpIndex.severity || 'Unknown'}
              </Text>
            </View>
            {!!data?.kpIndex.timestamp && (
              <Text style={styles.summarySub}>
                As of {new Date(data.kpIndex.timestamp).toLocaleString(undefined, {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </Text>
            )}
          </View>
          <View style={[styles.summaryItem, styles.summaryDivider]}>
            <Text style={styles.summaryLabel}>Aurora</Text>
            <Text style={styles.summaryValue}>{Math.round(data?.aurora.probability || 0)}%</Text>
            <Text style={styles.summarySub}>
              above {Math.round(data?.aurora.visibilityLatitude || 67)}° latitude
            </Text>
          </View>
          <View style={[styles.summaryItem, styles.summaryDivider]}>
            <Text style={styles.summaryLabel}>Flares</Text>
            <Text style={styles.summaryValue}>{data?.flares.length || 0}</Text>
            <Text style={styles.summarySub}>C-class and above</Text>
          </View>
        </View>
      </View>

      {/* Solar Wind */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💨 Solar Wind</Text>
        <Text style={styles.cardValue}>{Math.round(data?.solarWind.speed || 0)} km/s</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Density</Text>
            <Text style={styles.statValue}>{data?.solarWind.density || 0} p/cm³</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Temperature</Text>
            <Text style={styles.statValue}>{(data?.solarWind.temperature || 0).toLocaleString()} K</Text>
          </View>
          {data?.solarWind.bz != null && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Bz</Text>
              <Text style={styles.statValue}>{data.solarWind.bz.toFixed(1)} nT</Text>
            </View>
          )}
        </View>
        {!!data?.solarWind.timestamp && (
          <Text style={styles.cardSubtitle}>
            As of {new Date(data.solarWind.timestamp).toLocaleString(undefined, {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </Text>
        )}
      </View>

      {/* 7-Day X-Ray Flux */}
      {data && data.xrayFlux && data.xrayFlux.length > 1 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📈 X-Ray Flux — Last 7 Days (GOES-18)</Text>
          <XrayChart points={data.xrayFlux} />
          <Text style={styles.cardSubtitle}>
            0.1–0.8 nm channel, log scale • dashed lines mark flare class thresholds
          </Text>
        </View>
      )}

      {/* Schumann Resonance */}
      {schumann && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌍 Schumann Resonance</Text>
          {typeof schumann.activityIndex === 'number' && (
            <>
              <View style={styles.schumannStatRow}>
                <Text style={styles.cardValue}>{schumann.activityIndex}/100</Text>
                <View style={[
                  styles.severityBadge,
                  styles.schumannBadge,
                  {
                    backgroundColor: schumann.activityIndex >= 75
                      ? 'rgba(231, 76, 60, 0.2)'
                      : schumann.activityIndex >= 50
                        ? 'rgba(230, 126, 34, 0.2)'
                        : schumann.activityIndex >= 25
                          ? 'rgba(241, 196, 15, 0.2)'
                          : 'rgba(46, 204, 113, 0.2)',
                  },
                ]}>
                  <Text style={[
                    styles.severityText,
                    {
                      color: schumann.activityIndex >= 75
                        ? '#e74c3c'
                        : schumann.activityIndex >= 50
                          ? '#e67e22'
                          : schumann.activityIndex >= 25
                            ? '#f1c40f'
                            : '#2ecc71',
                    },
                  ]}>
                    {schumann.activityLabel || 'Activity'}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardSubtitle}>
                {typeof schumann.schumannIndex === 'number' && `SR amplitude index ${schumann.schumannIndex}`}
                {typeof schumann.frequencyHz === 'number' && `${typeof schumann.schumannIndex === 'number' ? ' • ' : ''}${schumann.frequencyHz} Hz fundamental`}
              </Text>
            </>
          )}
          {schumann.spectrogramUri ? (
            <Image
              source={{ uri: schumann.spectrogramUri }}
              style={styles.spectrogram}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.cardSubtitle}>Live spectrogram unavailable right now.</Text>
          )}
          {schumann.summary && <Text style={styles.schumannSummary}>{schumann.summary}</Text>}
          <Text style={styles.schumannCaption}>
            Tomsk State University SOSRFF (station time UTC+7) • Index: ResonanceOne
          </Text>
        </View>
      )}

      {/* Solar Activity Overview */}
      {data && (
        <View style={styles.graphCard}>
          <Text style={styles.graphTitle}>☀️ Solar Activity Overview</Text>
          <View style={styles.graphBars}>
            <View style={styles.graphBarContainer}>
              <View style={[styles.graphBar, { height: (data.kpIndex.value / 9) * 80, backgroundColor: data.kpIndex.value >= 5 ? '#ef4444' : data.kpIndex.value >= 3 ? '#f59e0b' : '#10b981' }]} />
              <Text style={styles.graphBarLabel}>Kp: {data.kpIndex.value}</Text>
            </View>
            <View style={styles.graphBarContainer}>
              <View style={[styles.graphBar, { height: (data.solarWind.speed / 1000) * 80, backgroundColor: '#3b82f6' }]} />
              <Text style={styles.graphBarLabel}>Wind: {data.solarWind.speed}</Text>
            </View>
            <View style={styles.graphBarContainer}>
              <View style={[styles.graphBar, { height: (data.solarWind.density / 50) * 80, backgroundColor: '#8b5cf6' }]} />
              <Text style={styles.graphBarLabel}>Density: {data.solarWind.density}</Text>
            </View>
            <View style={styles.graphBarContainer}>
              <View style={[styles.graphBar, { height: (data.aurora.probability / 100) * 80, backgroundColor: '#ec4899' }]} />
              <Text style={styles.graphBarLabel}>Aurora: {Math.round(data.aurora.probability)}%</Text>
            </View>
          </View>
        </View>
      )}

      {/* Recent Flares */}
      {data?.flares && data.flares.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚡ Recent Solar Flares</Text>
          {data.flares.slice(-5).reverse().map((flare, index) => (
            <View key={index} style={styles.eventItem}>
              <Text style={styles.eventIcon}>
                {flare.class === 'X' ? '🔴' : flare.class === 'M' ? '🟠' : '🟡'}
              </Text>
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{flare.class}-class Flare</Text>
                <Text style={styles.eventDescription}>Source: {flare.sourceLocation}</Text>
                <Text style={styles.eventTime}>
                  Peak: {new Date(flare.peakTime).toLocaleString()}
                </Text>
              </View>
              <View style={[
                styles.severityBadge,
                {
                  backgroundColor: flare.class === 'X'
                    ? 'rgba(231, 76, 60, 0.2)'
                    : flare.class === 'M'
                      ? 'rgba(230, 126, 34, 0.2)'
                      : 'rgba(241, 196, 15, 0.2)',
                },
              ]}>
                <Text style={[
                  styles.severityText,
                  {
                    color: flare.class === 'X'
                      ? '#e74c3c'
                      : flare.class === 'M'
                        ? '#e67e22'
                        : '#f1c40f',
                  },
                ]}>
                  {flare.class}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Geomagnetic Storms */}
      {data?.storms && data.storms.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌊 Geomagnetic Storms</Text>
          {data.storms.slice(-5).reverse().map((storm, index) => (
            <View key={index} style={styles.eventItem}>
              <Text style={styles.eventIcon}>🌊</Text>
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>
                  {storm.severity} Storm (Kp: {storm.kpIndex})
                </Text>
                <Text style={styles.eventTime}>
                  Started: {new Date(storm.startTime).toLocaleString()}
                </Text>
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
  graphCard: {
    backgroundColor: '#252547',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#3a3a6a',
  },
  graphTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a0a0cc',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  graphBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  graphBarContainer: {
    alignItems: 'center',
    width: 60,
  },
  graphBar: {
    width: 40,
    borderRadius: 4,
    minHeight: 4,
  },
  graphBarLabel: {
    fontSize: 10,
    color: '#a0a0cc',
    marginTop: 6,
    textAlign: 'center',
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
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  summaryItem: {
    flex: 1,
  },
  summaryDivider: {
    borderLeftWidth: 1,
    borderLeftColor: '#3a3a6a',
    paddingLeft: 12,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#a0a0cc',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e0e0ff',
    marginBottom: 4,
  },
  summarySub: {
    fontSize: 11,
    color: '#a0a0cc',
  },
  summaryBadge: {
    marginTop: 0,
  },
  schumannStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  schumannBadge: {
    marginTop: 0,
  },
  spectrogram: {
    width: '100%',
    height: 190,
    borderRadius: 10,
    marginTop: 12,
    backgroundColor: '#1a1a35',
  },
  schumannSummary: {
    fontSize: 13,
    color: '#a0a0cc',
    lineHeight: 19,
    marginTop: 12,
  },
  schumannCaption: {
    fontSize: 11,
    color: '#a0a0cc',
    marginTop: 8,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '30%',
  },
  statLabel: {
    fontSize: 12,
    color: '#a0a0cc',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e0e0ff',
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 14,
    fontWeight: '600',
    color: '#e0e0ff',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 12,
    color: '#a0a0cc',
  },
  eventTime: {
    fontSize: 11,
    color: '#a0a0cc',
    marginTop: 4,
  },
});
