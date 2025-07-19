import sha1 from 'js-sha1';
import { AccessibilityEventData } from "./EventType";
import { ParserAcessibilityWhatsappScrapping } from "./parser";
import { ChatDataDTO } from "./parser/model/dtoModel";
import { SortChatData } from "./sort";

const chatList = new Map<string, ChatDataDTO>();

export class CollectDataUseCase {
    constructor(
        private parserAcessibilityWhatsappScrapping = new ParserAcessibilityWhatsappScrapping(),
        private sortChatData = new SortChatData()
    ) { }

    execute(lastEvent: AccessibilityEventData) {
        const uniqueChatData = this.parserAcessibilityWhatsappScrapping.execute(lastEvent);
        
        if (chatList.has(uniqueChatData.metadata.chatId) === false) {
            chatList.set(uniqueChatData.metadata.chatId, {
                metadata: uniqueChatData.metadata, content: []
            });
        }
        
        const oldChat = chatList.get(uniqueChatData.metadata.chatId);
        if (!oldChat) {
            console.error("Chat not found in chatList for chatId:", uniqueChatData.metadata.chatId);
            return;
        }
        
        const hash = sha1(JSON.stringify(uniqueChatData.content));
        if (oldChat.metadata.chunkIds.includes(hash)) {
            console.log("Chunk already processed, skipping:", hash, oldChat.metadata.chunkIds);
            return;
        }

        oldChat.metadata.chunkIds.push(hash);
        const multiChatData = this.sortChatData.execute(oldChat, uniqueChatData);

        // Juntar textos com menos de 5 minutos de diferença e enviar em grupos desses textos, no backend então vou dividir cada um dos grupos e pegar as intenções dessas divisões, separadamente.
        // const content: TextRowDataDTO[] = []

        // let lastTimestamp: number | null = null
        // let lastUser: string | null = null;
        // const fiveMinutes = 1000 * 60 * 5;

        // for (let index = uniqueChatData.content.length - 1; index >= 0; index--) {
        //     const item = uniqueChatData.content[index];
        //     const timestamp = TextRowData.fromDTO(item).getTimestamp();

        //     if (lastUser === null) {
        //         lastUser = item.role;
        //     }
        //     if (lastUser !== item.role) {
        //         continue;
        //     }
        //     if (lastTimestamp == null || timestamp - fiveMinutes <= lastTimestamp) {
        //         content.push(TextRowData.fromDTO(item).toDTO());
                
        //         lastTimestamp = timestamp;
        //     } else {
        //         break;
        //     }
        // }

        
        const body = JSON.stringify({
            chat_data: {
                metadata: {
                    contact_name: multiChatData.metadata.contactName,
                    package_name: multiChatData.metadata.packageName,
                    chat_id: multiChatData.metadata.chatId,
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

        console.log("Dados do chat:", body);
//
        fetch('http://192.168.1.160:8000/extract-multi-intent', {
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