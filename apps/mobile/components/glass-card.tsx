import React from 'react';
import { StyleSheet, View, ViewStyle, useColorScheme } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function GlassCard({ children, style }: GlassCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.outerContainer, isDark ? styles.borderDark : styles.borderLight, style]}>
      <BlurView
        intensity={isDark ? 35 : 55}
        tint={isDark ? 'dark' : 'light'}
        style={[styles.blurContent, isDark ? styles.bgDark : styles.bgLight]}
      >
        {children}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
  },
  borderDark: {
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  borderLight: {
    borderColor: 'rgba(255, 255, 255, 0.7)',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  blurContent: {
    padding: 20,
  },
  bgDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  bgLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
});
