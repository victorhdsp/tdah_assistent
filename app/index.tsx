import { useAccessibilityEvents } from '@/native/useAccessibilityEvents';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

export default function App() {
  const { lastEvent } = useAccessibilityEvents();

  useEffect(() => {
    console.log('Último evento de acessibilidade:', lastEvent);
  }, [lastEvent]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Olá, mundo!</Text>
    </View>
  );
}
