import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Text, TouchableOpacity, useColorScheme } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import { supabase } from '../lib/supabase/secure-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRealtimeSync } from '@repo/api';

const queryClient = new QueryClient();

function AppContent() {
  useRealtimeSync(supabase);
  const colorScheme = useColorScheme();
  const [isLocked, setIsLocked] = useState(true);
  const [hasBiometrics, setHasBiometrics] = useState(false);

  useEffect(() => {
    async function checkAndAuthenticate() {
      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setHasBiometrics(compatible && enrolled);

        if (compatible && enrolled) {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Unlock Spendy with Biometrics',
            fallbackLabel: 'Use Device Passcode',
          });

          if (result.success) {
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {}
            setIsLocked(false);
          } else {
            setIsLocked(true);
          }
        } else {
          // If device doesn't have biometrics, proceed unlocked
          setIsLocked(false);
        }
      } catch {
        setIsLocked(false);
      }
    }

    checkAndAuthenticate();
  }, []);

  const handleManualUnlock = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access Spendy',
      });
      if (result.success) {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
        setIsLocked(false);
      }
    } catch {
      setIsLocked(false);
    }
  };

  if (isLocked) {
    return (
      <View style={[styles.lockContainer, colorScheme === 'dark' ? styles.bgDark : styles.bgLight]}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <View style={styles.lockBox}>
          <View style={styles.lockIconBadge}>
            <Text style={styles.lockIcon}>🛡️</Text>
          </View>
          <Text style={styles.lockTitle}>Spendy Locked</Text>
          <Text style={styles.lockSub}>Biometric authentication required to view your financial records</Text>
          <TouchableOpacity
            style={styles.unlockButton}
            onPress={handleManualUnlock}
            activeOpacity={0.8}
          >
            <Text style={styles.unlockText}>Unlock with Biometrics</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, colorScheme === 'dark' ? styles.bgDark : styles.bgLight]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="expense/[id]"
          options={{
            presentation: 'modal',
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgDark: {
    backgroundColor: '#07090E',
  },
  bgLight: {
    backgroundColor: '#F1F5F9',
  },
  lockContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  lockBox: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    padding: 28,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  lockIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  lockIcon: {
    fontSize: 28,
  },
  lockTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  lockSub: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  unlockButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  unlockText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
