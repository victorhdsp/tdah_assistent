import { AccessibilityEventData } from '@/src/scripts/collect_data/EventType';
import { useEffect, useState } from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';

const { EntryModule } = NativeModules;
const EntryEventEmitter = new NativeEventEmitter();

interface AccessibilityHookResult {
  lastEvent: AccessibilityEventData | null;
  isServiceEnabled: boolean;
  openSettings: () => void;
  checkServiceStatus: () => Promise<boolean>;
}

export function useAccessibilityEvents(): AccessibilityHookResult {

  const [lastEvent, setLastEvent] = useState<AccessibilityEventData | null>(null);
  const [isServiceEnabled, setIsServiceEnabled] = useState<boolean>(false);

  const checkServiceStatus = async () => {
    try {
      const enabled = await EntryModule.isAccessibilityServiceEnabled();
      console.log("Status do serviço de acessibilidade:", enabled);
      setIsServiceEnabled(enabled);
      return enabled;
    } catch (error) {
      console.error("Erro ao verificar status do serviço de acessibilidade:", error);
      openSettings();
      return false;
    }
  };

  const openSettings = () => {
    EntryModule.openAccessibilitySettings();
  };

  useEffect(() => {
    console.log("Registrando listener de acessibilidade");
    checkServiceStatus();

    const subscription = EntryEventEmitter.addListener(
      'AccessibilityEvent',
      (event: AccessibilityEventData) => {
        if (event) setLastEvent(event);
      }
    );

    return () => {
      console.log("Removendo listener de acessibilidade");
      subscription.remove();
    };
  }, []);

  return { lastEvent, isServiceEnabled, openSettings, checkServiceStatus };
}
