import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <View style={styles.screenWrapper}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Privacy Policy</Text>
        </View>

        <Text style={styles.updated}>Last updated: Aug 31, 2026</Text>

        <Text style={styles.sectionTitle}>1. Overview</Text>
        <Text style={styles.paragraph}>
          AstroSet ("we", "us", or "the app") is a daily astrology, solar activity, space
          weather, and weather forecast app. This Privacy Policy explains what information
          the app collects, why it is collected, and how it is used. By using AstroSet you
          agree to the practices described below.
        </Text>

        <Text style={styles.sectionTitle}>2. Information We Collect</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Location Preference.</Text> To provide weather, Vedic
          panchang, and local sunrise/sunset data, the app lets you select a city/region.
          Your selected location is stored locally on your device and is used only to fetch
          relevant data from third-party providers. Your precise location is never shared
          with us or with any third party.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Zodiac Preference.</Text> Your chosen zodiac sign is
          stored locally and used to fetch your daily horoscope.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Notification Preferences.</Text> If you enable daily
          notifications, your preference (including notification time) is stored locally on
          your device.
        </Text>
        <Text style={styles.sectionTitle}>3. How Information Is Used</Text>
        <Text style={styles.paragraph}>
          Information is used to: (a) display requested astrology, solar, space weather, and
          weather content; and (b) show you relevant notifications if you have enabled them.
          We do not sell your personal information.
        </Text>

        <Text style={styles.sectionTitle}>4. Data Storage and Retention</Text>
        <Text style={styles.paragraph}>
          Your settings and cached data are stored locally on your device using the app's
          local storage and are cleared when you uninstall the app. We do not operate a
          backend server and do not store your data remotely.
        </Text>

        <Text style={styles.sectionTitle}>5. Third-Party Services and APIs</Text>
        <Text style={styles.paragraph}>
          To provide live data, AstroSet calls public third-party services including
          astrology, solar/space-weather, and weather providers. Requests include your
          selected location and/or timezone so providers can return relevant results.
          These services operate under their own privacy policies.
        </Text>

        <Text style={styles.sectionTitle}>6. Permissions</Text>
        <Text style={styles.paragraph}>
          The app may request notification permission so you can receive scheduled daily
          updates. Granting this permission is optional. No sensitive device permissions
          (contacts, location services, camera, or microphone) are required or used.
        </Text>

        <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
        <Text style={styles.paragraph}>
          AstroSet is not directed at children under 13 and does not knowingly collect
          personal information from children.
        </Text>

        <Text style={styles.sectionTitle}>8. Your Choices</Text>
        <Text style={styles.paragraph}>
          You can change your location, zodiac sign, and notification preferences at any
          time in the settings screen. You can disable notifications in the app or in your
          device settings. You can uninstall the app to remove all locally stored data.
        </Text>
        <Text style={styles.sectionTitle}>9. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have questions about this Privacy Policy, please contact us at the email
          provided in the Google Play listing.
        </Text>

        <Text style={styles.sectionTitle}>10. Changes to This Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time. Updates will be posted in
          this screen and the "Last updated" date will be revised. Continued use of the app
          after changes constitutes acceptance of the updated policy.
        </Text>

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
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    marginRight: 12,
    paddingVertical: 4,
    paddingRight: 8,
  },
  backButtonText: {
    color: '#4a9eff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: '#e0e0ff',
    fontSize: 20,
    fontWeight: '700',
  },
  updated: {
    color: '#a0a0cc',
    fontSize: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#4a9eff',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 6,
  },
  paragraph: {
    color: '#c8c8f0',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 8,
  },
  bold: {
    fontWeight: '700',
    color: '#e0e0ff',
  },
});
