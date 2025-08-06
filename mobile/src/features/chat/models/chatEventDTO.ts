export const TypeViewIdResourceName = {
    TEXT_ROW: 'com.whatsapp:id/conversation_text_row',
    DATE_DIVIDER: 'com.whatsapp:id/conversation_row_date_divider',
    METADATA: 'com.whatsapp:id/conversation_contact_name'
}

export const TypeGenericViewIdData = {
    HOUR: 'com.whatsapp:id/date',
    VIEWED: 'com.whatsapp:id/status',
}

export const TypeTextRowViewIdData = {
    TEXT: 'com.whatsapp:id/message_text'
}

export type ChatEventSource = "notification" | "accessibility";
export type ChatSender = "user" | "other";
export type ChatConfidenceLevel = "high" | "medium" | "low";

export interface ChatEventDTO {
  unique_id: string; // Unique identifier for the event, e.g., "event_123"
  compare_id: string; // e.g., "hash_123"
  chat_contact: string; // e.g., "+5511999999999" or "chat_123"
  chat_app_id: string; // e.g., "app_123"
  sender: ChatSender; // Indicates if the message is from the user or another source
  content: string; // Full or partial message content
  timestamp: string; // ISO 8601 format, e.g., "2025-08-02T13:22:00"
  reference?: string; // Optional reference to the original message or event
  confidence: {
    timestamp: ChatConfidenceLevel; // Confidence level for the timestamp
    content: ChatConfidenceLevel; // Confidence level for the content
  };
  status: {
    pending_completion: boolean; // Indicates if the message is pending completion
    pending_timestamp: boolean; // Indicates if the timestamp is pending
  };
  source: ChatEventSource[];
  lastNodeId?: string; // Optional, used to track the last node processed in the event
  vector?: Float32Array; // Embedding vectors for the message content
}

export interface ChatEventDTOInSimilarity extends ChatEventDTO {
  similarityScore: number; // A score representing the similarity to another event
}