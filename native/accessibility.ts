import { NativeEventEmitter, NativeModules } from 'react-native';

const { EntryModule } = NativeModules;

const emitter = new NativeEventEmitter(EntryModule);

export function listenAccessibilityEvents(callback: (data: string) => void) {
  const subscription = emitter.addListener('AccessibilityEvent', callback);
  return () => subscription.remove();
}
