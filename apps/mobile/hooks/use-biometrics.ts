import { useState, useEffect, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

export interface BiometricState {
  isCompatible: boolean;
  isEnrolled: boolean;
  biometricType: string | null;
  isAuthenticated: boolean;
}

export function useBiometrics() {
  const [state, setState] = useState<BiometricState>({
    isCompatible: false,
    isEnrolled: false,
    biometricType: null,
    isAuthenticated: false,
  });

  const checkBiometrics = useCallback(async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

      let typeLabel: string | null = null;
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        typeLabel = 'Face ID';
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        typeLabel = 'Fingerprint';
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        typeLabel = 'Iris';
      }

      setState((prev) => ({
        ...prev,
        isCompatible: compatible,
        isEnrolled: enrolled,
        biometricType: typeLabel,
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        isCompatible: false,
        isEnrolled: false,
        biometricType: null,
      }));
    }
  }, []);

  useEffect(() => {
    checkBiometrics();
  }, [checkBiometrics]);

  const authenticate = useCallback(
    async (promptMessage = 'Unlock Spendy'): Promise<boolean> => {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage,
          fallbackLabel: 'Enter Passcode',
          cancelLabel: 'Cancel',
          disableDeviceFallback: false,
        });

        const success = result.success;
        setState((prev) => ({ ...prev, isAuthenticated: success }));
        return success;
      } catch {
        setState((prev) => ({ ...prev, isAuthenticated: false }));
        return false;
      }
    },
    []
  );

  return {
    ...state,
    authenticate,
    refreshBiometrics: checkBiometrics,
  };
}
