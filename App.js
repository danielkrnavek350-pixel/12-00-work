import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CheckSquare, BarChart2, Calendar as CalendarIcon, Settings } from 'lucide-react-native';
import { Theme } from './src/theme';
import { useStore } from './src/store';
import TasksScreen from './src/screens/TasksScreen';
import StatisticsScreen from './src/screens/StatisticsScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const performMonthlyCleanup = useStore((state) => state.performMonthlyCleanup);

  useEffect(() => {
    // Spuštění měsíčního čištění při startu aplikace
    performMonthlyCleanup();
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: Theme.colors.background, shadowColor: 'transparent', elevation: 0, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
          headerTintColor: Theme.colors.textMain,
          tabBarStyle: { backgroundColor: Theme.colors.background, borderTopColor: Theme.colors.border, paddingBottom: 8, paddingTop: 8, height: 60 },
          tabBarActiveTintColor: Theme.colors.accent,
          tabBarInactiveTintColor: Theme.colors.textMuted,
        }}
      >
        <Tab.Screen name="Úkoly" component={TasksScreen} options={{ tabBarIcon: ({ color }) => <CheckSquare color={color} size={24} /> }} />
        <Tab.Screen name="Statistiky" component={StatisticsScreen} options={{ tabBarIcon: ({ color }) => <BarChart2 color={color} size={24} /> }} />
        <Tab.Screen name="Kalendář" component={CalendarScreen} options={{ tabBarIcon: ({ color }) => <CalendarIcon color={color} size={24} /> }} />
        <Tab.Screen name="Nastavení" component={SettingsScreen} options={{ tabBarIcon: ({ color }) => <Settings color={color} size={24} /> }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
