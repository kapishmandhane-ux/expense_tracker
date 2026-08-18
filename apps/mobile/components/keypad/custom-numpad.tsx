import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';

interface CustomNumpadProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

export function CustomNumpad({ onKeyPress, onDelete, onSubmit }: CustomNumpadProps) {
  const handlePress = (key: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    if (key === '⌫') {
      onDelete();
    } else {
      onKeyPress(key);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {KEYS.map((key) => (
          <TouchableOpacity
            key={key}
            onPress={() => handlePress(key)}
            style={styles.keyButton}
            activeOpacity={0.7}
          >
            <Text style={styles.keyText}>{key}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  keyButton: {
    width: '30%',
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
});
