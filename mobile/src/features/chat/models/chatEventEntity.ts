import { ChatEventDTO, ChatEventSource, ChatConfidenceLevel } from './chatEventDTO';
import { ChatPreEventDTO } from "./chatPreEventDTO";
import { md5 } from 'js-md5';

export class ChatEventEntity implements ChatEventDTO {
  unique_id: string;
  compare_id: string;

  constructor(
    public chat_contact: string,
    public chat_app_id: string,
    public sender: "user" | "other",
    public content: string,
    public timestamp: string,
    public confidence: {
      timestamp: "high" | "medium" | "low",
      content: "high" | "medium" | "low";
    },
    public status: {
      pending_completion: boolean,
      pending_timestamp: boolean;
    },
    public source: ChatEventSource[],
    public lastNodeId?: string,
    public vector?: Float32Array
  ) {
    this.unique_id = md5(Math.random().toString() + this.content + this.timestamp + this.sender);
    this.compare_id = this.generateCompareId();
  }

  private generateCompareId(): string {
    const appHash = md5(this.chat_app_id);
    const contactHash = md5(this.chat_contact);
    const senderHash = md5(this.sender);
    const contentHash = this.confidence.content === "high" ? md5(this.content) : this.content;
    const timestampHash = this.confidence.timestamp === "high" ? md5(this.timestamp) : this.timestamp;
    return `${appHash}::${contactHash}::${senderHash}::${contentHash}::${timestampHash}`;
  }

  static compareIdFromDTO(oldChatEvent: ChatEventDTO, newChatEvent: ChatEventDTO): boolean {
    const breakHash = (str: string): string[] => {
      return str.split('::');
    }

    let result = true;

    const [oldAppHash, oldContactHash, oldSenderHash, oldContentHash, oldTimestampHash] = breakHash(oldChatEvent.compare_id);
    const [newAppHash, newContactHash, newSenderHash, newContentHash, newTimestampHash] = breakHash(newChatEvent.compare_id);

    if (oldAppHash !== newAppHash) result = false;
    if (oldContactHash !== newContactHash) result = false;
    if (oldSenderHash !== newSenderHash) result = false;

    if (oldChatEvent.confidence.content === "high" && newChatEvent.confidence.content === "high")
      if (oldContentHash !== newContentHash) result = false;
    if (oldChatEvent.confidence.content === "high" && newChatEvent.confidence.content !== "high") 
      if (!oldChatEvent.content.includes(newChatEvent.content)) result = false;
    if (oldChatEvent.confidence.content !== "high" && newChatEvent.confidence.content === "high") 
      if (!newChatEvent.content.includes(oldChatEvent.content)) result = false;
    if (oldChatEvent.confidence.content !== "high" && newChatEvent.confidence.content !== "high") 
      if (!oldChatEvent.content.includes(newChatEvent.content) && !newChatEvent.content.includes(oldChatEvent.content)) result = false;

    if (oldChatEvent.confidence.timestamp === "high" && newChatEvent.confidence.timestamp === "high")
      if (oldTimestampHash !== newTimestampHash) result = false;
    if (oldChatEvent.confidence.timestamp === "high" && newChatEvent.confidence.timestamp !== "high") 
      if (!oldChatEvent.timestamp.includes(newChatEvent.timestamp)) result = false;
    if (oldChatEvent.confidence.timestamp !== "high" && newChatEvent.confidence.timestamp === "high") 
      if (!newChatEvent.timestamp.includes(oldChatEvent.timestamp)) result = false;
    if (oldChatEvent.confidence.timestamp !== "high" && newChatEvent.confidence.timestamp !== "high") 
      if (!oldChatEvent.timestamp.includes(newChatEvent.timestamp) && !newChatEvent.timestamp.includes(oldChatEvent.timestamp)) result = false;

    return result;
  }

  static fromDTO(dto: ChatEventDTO): ChatEventEntity {
    return new ChatEventEntity(
      dto.chat_contact,
      dto.chat_app_id,
      dto.sender,
      dto.content,
      dto.timestamp,
      dto.confidence,
      dto.status,
      dto.source,
      dto.lastNodeId,
      dto.vector
    );
  }

  static fromPreDTO(
    dto: ChatPreEventDTO,
    chat_contact: string,
    chat_app_id: string,
    eventSource: ChatEventSource,
    date?: string,
    lastNodeId?: string
  ): ChatEventEntity {
    const timestamp = date ? date + 'T' + dto.hour + ':00Z' : dto.hour + ':00Z';
    const source: ChatEventSource[] = [eventSource];

    let confidenceContent: ChatConfidenceLevel = "low";
    let confidenceTimestamp: ChatConfidenceLevel = "low";

    if (eventSource === "notification") {
      confidenceContent = "medium";

      if (dto.content.endsWith("...")) {
        confidenceContent = "low";
      }
    } else if (eventSource === "accessibility") {
      confidenceContent = "high";
    }
    
    if (eventSource === "notification") {
      confidenceTimestamp = "medium";
    } else if (eventSource === "accessibility") {
      if (date) {
        confidenceTimestamp = "high";
      } else {
        confidenceTimestamp = "low";
      }
    }

    const confidence: {
      timestamp: ChatConfidenceLevel;
      content: ChatConfidenceLevel;
    } = {
      timestamp: confidenceTimestamp,
      content: confidenceContent
    };

    const status = {
      pending_completion: eventSource === "notification" && !dto.content.endsWith("..."),
      pending_timestamp: !date
    }

    return new ChatEventEntity(
      chat_contact,
      chat_app_id,
      dto.sender,
      dto.content,
      timestamp,
      confidence,
      status,
      source,
      lastNodeId
    );
  }

  toDTO(): ChatEventDTO {
    return {
      unique_id: this.unique_id,
      compare_id: this.compare_id,
      chat_contact: this.chat_contact,
      chat_app_id: this.chat_app_id,
      sender: this.sender,
      content: this.content,
      timestamp: this.timestamp,
      confidence: this.confidence,
      status: this.status,
      source: this.source,
      lastNodeId: this.lastNodeId,
      vector: this.vector
    };
  }
}