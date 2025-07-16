import { useAccessibilityEvents } from '@/native/useAccessibilityEvents';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { ParserAcessibilityWhatsappScrapping } from '../scripts/collect_data/parser';

export default function App() {
  const { lastEvent } = useAccessibilityEvents();

  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent.packageName !== 'com.whatsapp') return;
    console.log("Evento do tipo:", lastEvent.eventType);
    if (
      lastEvent.eventType !== 'TYPE_VIEW_FOCUSED' &&
      lastEvent.eventType !== 'TYPE_VIEW_SCROLLED'
    ) return;

    const parserAcessibilityWhatsappScrapping = new ParserAcessibilityWhatsappScrapping()
    const nodes = parserAcessibilityWhatsappScrapping.execute(lastEvent);
    cons

    const pretty = JSON.stringify(lastEvent, null, 2);
    //console.log('Último evento de acessibilidade:', pretty);
    const res = fetch('http://192.168.1.160:1234', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: pretty,
    });
  }, [lastEvent]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Olá, mundo!</Text>
    </View>
  );
}