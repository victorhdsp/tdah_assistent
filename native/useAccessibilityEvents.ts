import { useEffect, useState } from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';

const { EntryModule } = NativeModules;
const EntryEventEmitter = new NativeEventEmitter(EntryModule);

interface AccessibilityEventData {
  eventType: number;
  eventText: string | null;
  packageName: string | null;
  className: string | null;
  itemCount: number;
  currentItemIndex: number;
  fromIndex: number;
  toIndex: number;
  scrollX: number;
  scrollY: number;
  isChecked: boolean;
  isEnabled: boolean;
  isPassword: boolean;
  // Adicione mais propriedades conforme necessário
}

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
      setIsServiceEnabled(enabled);
      return enabled;
    } catch (error) {
      console.error("Erro ao verificar status do serviço de acessibilidade:", error);
      return false;
    }
  };

  const openSettings = () => {
    EntryModule.openAccessibilitySettings();
  };

  useEffect(() => {
    checkServiceStatus();

    const subscription = EntryEventEmitter.addListener(
      'AccessibilityEvent',
      (event: AccessibilityEventData) => {
        setLastEvent(event);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return { lastEvent, isServiceEnabled, openSettings, checkServiceStatus };
}
