import { ChatEventDTO } from "@/src/features/chat/models/chatEventDTO";
import { ChatEventEntity } from "@/src/features/chat/models/chatEventEntity";
import { IChatMessagesRepository } from "@/src/features/chat/repositories/chatMessagesRepository";

const db: Record<string, ChatEventDTO> = {};

export class ChatMessagesRepository implements IChatMessagesRepository {
    async getByCompareId(newEvent: ChatEventDTO): Promise<ChatEventDTO | null> {
        const breakHash = (compare_id: string): string[] => {
            return compare_id.split('::');
        }
        const [appHash, contactHash, senderHash] = breakHash(newEvent.compare_id);

        const list = Object.values(db).filter((chatEvent) => {
            const [app, contact, sender] = breakHash(chatEvent.compare_id);
            return app === appHash && contact === contactHash && sender === senderHash;
        })

        for (const chatEvent of list) {
            const is_match = ChatEventEntity.compareIdFromDTO(chatEvent, newEvent);
            if (is_match) return chatEvent;
        }
        
        return null;
    }

    async getByContact(contact_id: string): Promise<ChatEventDTO[]> {
        const list = Object.values(db).filter((chatEvent) => {
            return chatEvent.chat_contact === contact_id;
        });

        return list;
    }

    async save(event: ChatEventDTO): Promise<void> {
        const existingMessage = await this.getByCompareId(event);
        const key = existingMessage ? existingMessage.unique_id : event.unique_id;

        db[key] = {
            ...db[key],
            ...event
        };

        const printDB = {...db};
        for (const key in printDB) {
            printDB[key].vector = undefined; // Hide vectors for logging
        }
        
        fetch('http://192.168.1.160:1234/message-db', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(printDB),
        });
    }
}