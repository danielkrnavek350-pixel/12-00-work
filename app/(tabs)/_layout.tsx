import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { colors } from '@/lib/theme';
import { haptic } from '@/lib/haptics';
import { CheckSquare, BarChart3, Settings } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenListeners={{
        tabPress: () => haptic('light'),
      }}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(21, 10, 33, 0.82)',
          borderTopColor: colors.hairline,
          borderTopWidth: 1,
          height: Platform.OS === 'web' ? 60 : 64,
          paddingBottom: Platform.OS === 'web' ? 8 : 12,
          paddingTop: 8,
          ...(Platform.OS === 'web'
            ? {
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }
            : {}),
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text3,
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Inter-Regular',
          marginTop: 2,
        },
        tabBarItemStyle: {
          padding: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Úkoly',
          tabBarIcon: ({ size, color }) => <CheckSquare size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="statistiky"
        options={{
          title: 'Statistiky',
          tabBarIcon: ({ size, color }) => <BarChart3 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="nastaveni"
        options={{
          title: 'Nastavení',
          tabBarIcon: ({ size, color }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
