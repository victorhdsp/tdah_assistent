import { AccessibilityEventData } from "@/src/scripts/collect_data/EventType";
import { ChatEventDTO } from "./models/chatEventDTO";
import { ParserChatEventService } from "./services/parserChatEventService";
import { IChatMessagesRepository } from "./repositories/chatMessagesRepository";
import { MergeChatEventService } from "./services/mergeChatEventService";
import { AppEventBus } from "@/src/core/events/appEventBus";
import { appEventName } from "../../core/appEventHandlers";
import { VectorService } from "./services/vectorService";

export class BruteChatEventListener {
    private processing: Set<string> = new Set();

    constructor(
        private parser: ParserChatEventService,
        private stagingRepository: IChatMessagesRepository,
        private merge: MergeChatEventService,
        private vectorService: VectorService,
        private eventBus: AppEventBus
    ) {}

    async processEvent(eventChat: ChatEventDTO) {
        try {
            const existingEvent = await this.stagingRepository.getByCompareId(eventChat);
            let resultEvent = eventChat;
            
            if (existingEvent) {
                const confidence = existingEvent.confidence;
                const hasLowOrMediumConfidence = Object.values(confidence).find(level => level === "low" || level === "medium");

                if (!hasLowOrMediumConfidence) {
                    if (existingEvent.lastNodeId === undefined && eventChat.lastNodeId !== undefined) {
                        existingEvent.lastNodeId = eventChat.lastNodeId;
                        this.stagingRepository.save(existingEvent);
                    }
                    return; 
                }

                const {hasChanged, modifiedEvent} = this.merge.execute(existingEvent, eventChat);

                if (!hasChanged) {
                    console.warn("No changes made to existing event:", existingEvent.unique_id);
                    return;
                }

                resultEvent = modifiedEvent;
            }

            if (resultEvent.confidence.content === "high" && !resultEvent.vector) {
                resultEvent.vector = await this.vectorService.generateEmbedding(resultEvent.content);
            }
            
            this.stagingRepository.save(resultEvent);

            this.eventBus.emit(appEventName.NewProcessedChatEvent, resultEvent);
        } catch (error) {
            console.error("Error processing chat event:", error);
        }
    }

    async fromAccessibility(accesibilityEvent: AccessibilityEventData) {
        const parsedEvents = this.parser.convertFromAccessibilityEvent(accesibilityEvent);

        for (const newChatEvent of parsedEvents) {
            const compareId = newChatEvent.compare_id;

            if (this.processing.has(compareId)) {
                continue;
            }

            this.processing.add(compareId);
            try {
                await this.processEvent(newChatEvent);
            } finally {
                this.processing.delete(compareId);
            }
        }
    }
}