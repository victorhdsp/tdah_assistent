import { EventsProvider } from '@/src/core/eventsProvider';
import { Text, View } from 'react-native';

export default function App() {
  // const { lastEvent } = useAccessibilityEvents();

  // useEffect(() => {
  //   if (!lastEvent) return;
  //   if (lastEvent.packageName !== 'com.whatsapp') return;
  //   if (
  //     lastEvent.eventType !== 'TYPE_VIEW_FOCUSED' &&
  //     lastEvent.eventType !== 'TYPE_VIEW_SCROLLED'
  //   ) return;
  //   console.log("Evento do tipo:", lastEvent.eventType);
    
  //   try {
  //     fetch('http://192.168.1.160:1234/before-extract', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify(lastEvent),
  //     });
  //     //const collectDataUseCase = new CollectDataUseCase();
  //     //collectDataUseCase.execute(lastEvent);
  //   } catch (error) {
  //     console.error("Erro ao executar CollectDataUseCase:", error);
  //   }
  // }, [lastEvent]);

  return (<>
    <EventsProvider />
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Olá, mundo!</Text>
    </View>
  </>
  );
}