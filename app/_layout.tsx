import React from 'react';
import { Stack } from 'expo-router';
import { TaskProvider } from '../lib/TaskContext';
import { LogBox } from 'react-native';

LogBox.ignoreAllLogs();

export default function RootLayout() {
  return (
    <TaskProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0B0813' } }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </TaskProvider>
  );
}
