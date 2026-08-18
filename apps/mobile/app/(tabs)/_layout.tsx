import { Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? 'rgba(7, 9, 14, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
          position: 'absolute',
          elevation: 0,
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#94a3b8',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Ledger',
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '+ Add',
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Budgets',
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
        }}
      />
    </Tabs>
  );
}
