import sha1 from 'js-sha1';
import { AccessibilityEventData } from "./EventType";
import { ParserAcessibilityWhatsappScrapping } from "./parser";

export class CollectDataUseCase {
    constructor(
        private parserAcessibilityWhatsappScrapping = new ParserAcessibilityWhatsappScrapping()
    ) { }

    execute(lastEvent: AccessibilityEventData) {
        const uniqueChatData = this.parserAcessibilityWhatsappScrapping.execute(lastEvent);
        
        const body = JSON.stringify({
            chat_data: {
                metadata: {
                    contact_name: uniqueChatData.metadata.contactName,
                    package_name: uniqueChatData.metadata.packageName,
                    chat_id: uniqueChatData.metadata.chatId,
                },
                content: uniqueChatData.content.map((data) => ({
                    id: data.id,
                    hour: data.hour,
                    role: data.role,
                    type: data.type,
                    date: data.date,
                    text: data.text,
                    is_viewed: data.isViewed,
                }))
            }
        }, null, 2);

        console.log('Sending data to backend:', body);
        fetch('http://192.168.1.160:8000/analise-by-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body
        });

        fetch('http://192.168.1.160:1234/before-extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body,
        });
    }
}