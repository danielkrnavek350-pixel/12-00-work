import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#A855F7',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#120C24',
          borderTopColor: '#231A3D',
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Úkoly', tabBarIcon: () => <Text style={{fontSize:20}}>✅</Text> }} />
      <Tabs.Screen name="statistics" options={{ title: 'Statistiky', tabBarIcon: () => <Text style={{fontSize:20}}>📊</Text> }} />
      <Tabs.Screen name="calendar" options={{ title: 'Kalendář', tabBarIcon: () => <Text style={{fontSize:20}}>📅</Text> }} />
      <Tabs.Screen name="settings" options={{ title: 'Nastavení', tabBarIcon: () => <Text style={{fontSize:20}}>⚙️</Text> }} />
    </Tabs>
  );
}
