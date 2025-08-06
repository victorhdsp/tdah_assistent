import { md5 } from "js-md5";
import { ChatConfidenceLevel, ChatEventDTO, ChatSender, ChatEventSource } from "../models/chatEventDTO";

interface MergeChatEventResult {
    hasChanged: boolean;
    modifiedEvent: ChatEventDTO;
}

export class MergeChatEventService {
    private mergeUniqueID(oldEventId: string, newEventId: string): string {
        if (oldEventId !== newEventId) throw new Error("Event IDs do not match");
        return oldEventId;
    }
    
    private mergeContact(oldContact: string, newContact: string): string {
        if (oldContact !== newContact) throw new Error("Contact information does not match");
        return oldContact;
    }
    private mergeAppId(oldAppId: string, newAppId: string): string {
        if (oldAppId !== newAppId) throw new Error("App IDs do not match");
        return oldAppId;
    }

    private mergeSender(oldSender: ChatSender, newSender: ChatSender): ChatSender {
        if (oldSender !== newSender) throw new Error("Sender information does not match");
        return oldSender;
    }

    private mergeContent(oldChatEvent: ChatEventDTO, newChatEvent: ChatEventDTO): {
        content: string,
        contentConfidence: ChatConfidenceLevel,
        contentStatus: boolean
    } {
        if (oldChatEvent.source.includes("accessibility"))
            return {
                content: oldChatEvent.content,
                contentConfidence: "high",
                contentStatus: false
            };
        if (newChatEvent.source.includes("accessibility"))
            return {
                content: newChatEvent.content,
                contentConfidence: "high",
                contentStatus: false
            };

        if (oldChatEvent.content.length > newChatEvent.content.length) {
            return {
                content: oldChatEvent.content,
                contentConfidence: oldChatEvent.content.endsWith("...") ? "low" : "medium",
                contentStatus: true
            };
        }

        return {
            content: newChatEvent.content,
            contentConfidence: newChatEvent.content.endsWith("...") ? "low" : "medium",
            contentStatus: false
        };
    }

    private mergeTimestamp(oldChatEvent: ChatEventDTO, newChatEvent: ChatEventDTO): {
        timestamp: string,
        timestampConfidence: ChatConfidenceLevel,
        timestampStatus: boolean
    } {
        if (oldChatEvent.source.includes("accessibility") && oldChatEvent.timestamp.length > 10)
            return {
                timestamp: oldChatEvent.timestamp,
                timestampConfidence: "high",
                timestampStatus: false
            };

        if (newChatEvent.source.includes("accessibility") && newChatEvent.timestamp.length > 10)
            return {
                timestamp: newChatEvent.timestamp,
                timestampConfidence: "high",
                timestampStatus: false
            };

        if (oldChatEvent.source.includes("notification"))
            return {
                timestamp: oldChatEvent.timestamp,
                timestampConfidence: "medium",
                timestampStatus: true
            };

        if (newChatEvent.source.includes("notification"))
            return {
                timestamp: newChatEvent.timestamp,
                timestampConfidence: "medium",
                timestampStatus: true
            };

        return {
            timestamp: newChatEvent.timestamp,
            timestampConfidence: "low",
            timestampStatus: true
        };
    }

    mergeSource(oldSource: ChatEventSource[], newSource: ChatEventSource[]): ChatEventSource[] {
        const mergedSource: ChatEventSource[] = []
        if (oldSource.includes("accessibility") || newSource.includes("accessibility")) {
            mergedSource.push("accessibility");
        }
        if (oldSource.includes("notification") || newSource.includes("notification")) {
            mergedSource.push("notification");
        }
        return mergedSource;
    }

    execute(existingEvent: ChatEventDTO, newEvent: ChatEventDTO): MergeChatEventResult {
        let hasChanged = false;

        const { content, contentConfidence, contentStatus } = this.mergeContent(existingEvent, newEvent);
        const { timestamp, timestampConfidence, timestampStatus } = this.mergeTimestamp(existingEvent, newEvent);

        const hashedAppId = md5(newEvent.chat_app_id);
        const hashedContact = md5(newEvent.chat_contact);
        const hashedSender = md5(newEvent.sender);
        const contentHash = contentConfidence === "high" ? md5(content) : content;
        const timestampHash = timestampConfidence === "high" ? md5(timestamp) : timestamp;

        const compareId = `${hashedAppId}::${hashedContact}::${hashedSender}::${contentHash}::${timestampHash}`;

        const modifiedEvent: ChatEventDTO = {
            unique_id: this.mergeUniqueID(existingEvent.unique_id, newEvent.unique_id),
            compare_id: compareId,
            chat_contact: this.mergeContact(existingEvent.chat_contact, newEvent.chat_contact),
            chat_app_id: this.mergeAppId(existingEvent.chat_app_id, newEvent.chat_app_id),
            sender: this.mergeSender(existingEvent.sender, newEvent.sender),
            content: content,
            timestamp: timestamp,
            confidence: {
                content: contentConfidence,
                timestamp: timestampConfidence
            },
            status: {
                pending_completion: contentStatus,
                pending_timestamp: timestampStatus 
            },
            source: this.mergeSource(existingEvent.source, newEvent.source)
        }

        if (
            existingEvent.content !== modifiedEvent.content ||
            existingEvent.timestamp !== modifiedEvent.timestamp ||
            existingEvent.source.join(',') !== modifiedEvent.source.join(',')
        ) {
            hasChanged = true;
        }

        return { hasChanged, modifiedEvent };
    }
}