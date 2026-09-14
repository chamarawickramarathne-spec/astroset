import React, { useState, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ActivityIndicator, StyleSheet, ColorValue } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStorage, loadSettings } from '../src/core';

configureStorage(AsyncStorage);

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadSettings()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <View style={styles.centered}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#4a9eff" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#4a9eff',
          tabBarInactiveTintColor: '#a0a0cc',
          tabBarStyle: {
            backgroundColor: '#1a1a3e',
            borderTopColor: '#3a3a6a',
          },
          headerStyle: {
            backgroundColor: '#0f0f23',
          },
          headerTintColor: '#e0e0ff',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Today',
            tabBarIcon: ({ color }) => <TabIcon icon="📅" color={color} />,
          }}
        />
        <Tabs.Screen
          name="solar"
          options={{
            title: 'Solar',
            tabBarIcon: ({ color }) => <TabIcon icon="☀️" color={color} />,
          }}
        />
        <Tabs.Screen
          name="weather"
          options={{
            title: 'Weather',
            tabBarIcon: ({ color }) => <TabIcon icon="🌤️" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <TabIcon icon="⚙️" color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f23',
  },
});

function TabIcon({ icon }: { icon: string; color: ColorValue }) {
  return <Text style={{ fontSize: 20 }}>{icon}</Text>;
}
