import { ChatSender } from "./chatEventDTO";

export interface ChatPreEventDTO {
  type: "chat_pre_event"; // Type identifier for the event
  sender: ChatSender; // Indicates if the message is from the user or another source
  content: string; // Full or partial message content
  hour: string; // Time in "HH:mm" format, e.g., "13:22"
  date?: string; // Date in "YYYY-MM-DD" format, e.g., "2025-08-02"
}