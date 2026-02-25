import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function blurActiveElementOnWeb() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const activeElement = document.activeElement;
  if (activeElement && activeElement instanceof HTMLElement) {
    activeElement.blur();
  }
}

function TabIcon({
  name,
  emoji,
  color,
  size,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  emoji: string;
  color: string;
  size: number;
}) {
  if (Platform.OS === 'web') {
    return <Text style={{ fontSize: size, color }}>{emoji}</Text>;
  }

  return <Ionicons name={name} color={color} size={size} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenListeners={{
        tabPress: () => {
          blurActiveElementOnWeb();
        },
      }}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <TabIcon name="home" emoji="🏠" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="add-session"
        options={{
          title: 'Add Session',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="add-circle" emoji="➕" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="stats-chart" emoji="📊" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
