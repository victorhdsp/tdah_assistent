import { useAccessibilityEvents } from '@/native/useAccessibilityEvents';
import { CollectDataUseCase } from '@/scripts/collect_data/usecase';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

export default function App() {
  const { lastEvent } = useAccessibilityEvents();

  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent.packageName !== 'com.whatsapp') return;
    if (
      lastEvent.eventType !== 'TYPE_VIEW_FOCUSED' &&
      lastEvent.eventType !== 'TYPE_VIEW_SCROLLED'
    ) return;
    //console.log("Evento do tipo:", lastEvent.eventType);
    
    try {
      const collectDataUseCase = new CollectDataUseCase();
      collectDataUseCase.execute(lastEvent);
    } catch (error) {
      console.error("Erro ao executar CollectDataUseCase:", error);
    }
  }, [lastEvent]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Olá, mundo!</Text>
    </View>
  );
}