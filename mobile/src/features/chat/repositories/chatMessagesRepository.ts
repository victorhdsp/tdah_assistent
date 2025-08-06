import { ChatEventDTO } from "../models/chatEventDTO";

export interface IChatMessagesRepository {
    save(event: ChatEventDTO): Promise<void>;
    getByCompareId(event: ChatEventDTO): Promise<ChatEventDTO | null>;
    getByContact(contact_id: string): Promise<ChatEventDTO[]>;
}