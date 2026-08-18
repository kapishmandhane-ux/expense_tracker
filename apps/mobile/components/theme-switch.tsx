import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GlassCard } from './glass-card';

interface ThemeSwitchProps {
  currentTheme: 'light' | 'dark';
  onToggle: (theme: 'light' | 'dark') => void;
}

export function ThemeSwitch({ currentTheme, onToggle }: ThemeSwitchProps) {
  const isDark = currentTheme === 'dark';

  return (
    <GlassCard style={styles.container}>
      <View style={styles.row}>
        <Pressable
          onPress={() => onToggle('light')}
          style={[styles.pill, !isDark && styles.activePillLight]}
        >
          <Text style={[styles.label, !isDark ? styles.activeTextLight : styles.inactiveText]}>
            ☀️ Day
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onToggle('dark')}
          style={[styles.pill, isDark && styles.activePillDark]}
        >
          <Text style={[styles.label, isDark ? styles.activeTextDark : styles.inactiveText]}>
            🌙 Night
          </Text>
        </Pressable>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 4,
    borderRadius: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePillDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  activePillLight: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeTextDark: {
    color: '#ffffff',
  },
  activeTextLight: {
    color: '#0f172a',
  },
  inactiveText: {
    color: '#64748b',
  },
});
