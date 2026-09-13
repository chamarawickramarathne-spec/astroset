import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Switch, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { getSettings, saveSettings } from '@astroset/core';
import type { UserSettings } from '@astroset/core';

const ZODIAC_SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

const LOCATIONS = [
  { name: 'Colombo, Sri Lanka', lat: 6.9271, lon: 79.8612 },
  { name: 'Kandy, Sri Lanka', lat: 7.2906, lon: 80.6337 },
  { name: 'Galle, Sri Lanka', lat: 6.0535, lon: 80.221 },
  { name: 'Jaffna, Sri Lanka', lat: 9.6615, lon: 80.0255 },
  { name: 'Negombo, Sri Lanka', lat: 7.2083, lon: 79.8373 },
  { name: 'New Delhi, India', lat: 28.6139, lon: 77.209 },
  { name: 'Mumbai, India', lat: 19.076, lon: 72.8777 },
  { name: 'Bangalore, India', lat: 12.9716, lon: 77.5946 },
  { name: 'London, UK', lat: 51.5074, lon: -0.1278 },
  { name: 'New York, USA', lat: 40.7128, lon: -74.006 },
  { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'Sydney, Australia', lat: -33.8688, lon: 151.2093 },
  { name: 'Dubai, UAE', lat: 25.2048, lon: 55.2708 },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
];

export default function SettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings>(getSettings());
  const [selectedLocation, setSelectedLocation] = useState(
    LOCATIONS.find(
      (l) => l.lat === settings.latitude && l.lon === settings.longitude
    )?.name || 'Custom'
  );

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings(settings);
      Alert.alert('Settings Saved', 'Your preferences have been updated.');
    } catch (err) {
      Alert.alert(
        'Save Failed',
        err instanceof Error ? err.message : 'Could not save settings. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLocationSelect = (location: typeof LOCATIONS[0]) => {
    setSelectedLocation(location.name);
    setSettings({
      ...settings,
      city: location.name.split(',')[0],
      country: location.name.split(',')[1]?.trim() || '',
      latitude: location.lat,
      longitude: location.lon,
    });
  };

  return (
    <View style={styles.screenWrapper}>
      <ScrollView style={styles.container}>
      {/* Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Location</Text>
        <View style={styles.locationGrid}>
          {LOCATIONS.map((location) => (
            <TouchableOpacity
              key={location.name}
              style={[
                styles.locationItem,
                selectedLocation === location.name && styles.locationItemActive,
              ]}
              onPress={() => handleLocationSelect(location)}
            >
              <Text style={[
                styles.locationText,
                selectedLocation === location.name && styles.locationTextActive,
              ]}>
                {location.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Zodiac Sign */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>♈ Zodiac Sign</Text>
        <View style={styles.zodiacGrid}>
          {ZODIAC_SIGNS.map((sign) => (
            <TouchableOpacity
              key={sign}
              style={[
                styles.zodiacItem,
                settings.zodiacSign === sign && styles.zodiacItemActive,
              ]}
              onPress={() => setSettings({ ...settings, zodiacSign: sign })}
            >
              <Text style={[
                styles.zodiacText,
                settings.zodiacSign === sign && styles.zodiacTextActive,
              ]}>
                {sign.charAt(0).toUpperCase() + sign.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 Notifications</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Enable Daily Notifications</Text>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={(value) => setSettings({ ...settings, notificationsEnabled: value })}
            trackColor={{ false: '#3a3a6a', true: '#4a9eff' }}
          />
        </View>
        {settings.notificationsEnabled && (
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Notification Time</Text>
            <TextInput
              style={styles.timeInput}
              value={settings.notificationTime}
              onChangeText={(text) => setSettings({ ...settings, notificationTime: text })}
              placeholder="07:00"
              placeholderTextColor="#a0a0cc"
            />
          </View>
        )}
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Settings'}</Text>
      </TouchableOpacity>

      {/* Privacy Policy */}
      <TouchableOpacity
        style={styles.privacyLink}
        onPress={() => router.push('/privacy')}
      >
        <Text style={styles.privacyLinkText}>🔒 Privacy Policy</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
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
  section: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a0a0cc',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  locationGrid: {
    gap: 8,
  },
  locationItem: {
    backgroundColor: '#252547',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#3a3a6a',
  },
  locationItemActive: {
    borderColor: '#4a9eff',
    backgroundColor: 'rgba(74, 158, 255, 0.1)',
  },
  locationText: {
    fontSize: 14,
    color: '#a0a0cc',
  },
  locationTextActive: {
    color: '#4a9eff',
    fontWeight: '600',
  },
  zodiacGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  zodiacItem: {
    backgroundColor: '#252547',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#3a3a6a',
  },
  zodiacItemActive: {
    borderColor: '#4a9eff',
    backgroundColor: 'rgba(74, 158, 255, 0.1)',
  },
  zodiacText: {
    fontSize: 13,
    color: '#a0a0cc',
  },
  zodiacTextActive: {
    color: '#4a9eff',
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#252547',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 14,
    color: '#e0e0ff',
  },
  timeInput: {
    backgroundColor: '#1a1a3e',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    color: '#e0e0ff',
    fontSize: 14,
    width: 80,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#4a9eff',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 24,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  privacyLink: {
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
  },
  privacyLinkText: {
    color: '#4a9eff',
    fontSize: 15,
    fontWeight: '600',
  },
});
