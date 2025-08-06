import { AppEventBus } from "./events/appEventBus";
import { AccessibilityEventData } from "./native/events/accessibility/models/AccessibilityEventData";
import { ChatEventDTO } from "@/src/features/chat/models/chatEventDTO";
import { BruteChatEventListener } from "@/src/features/chat/bruteChatEventListener";
import { IntentSelectorUseCase } from '../features/chat/intentSelectorUsecase';
import { BackendGateway } from "../infra/gateways/backendGateway";
import { CreateNewAppointmentUseCase } from "../features/scheduleAppointment/createNewAppointmentUsecase";

// fetch('http://192.168.1.160:1234/new-processed-chat-event', {
//      method: 'POST',
//      headers: { 'Content-Type': 'application/json' },
//      body: JSON.stringify(chatEvent),
//  });

export const appEventName = {
    NewBruteChatAccessibilityEvent: 'NewBruteChatAccessibilityEvent',
    NewProcessedChatEvent: 'NewProcessedChatEvent',
    ScheduleAppointmentIntent: 'ScheduleAppointmentIntent',
    CreateTaskWithoutDateIntent: 'CreateTaskWithoutDateIntent',
    AssociateContextTriggerIntent: 'AssociateContextTriggerIntent'
};

export class AppEventHandlers {
    constructor(
        private eventBus: AppEventBus,
        private bruteChatEventService: BruteChatEventListener,
        private intentSelectorUseCase: IntentSelectorUseCase,
        private backendGateway: BackendGateway,
        private createNewAppointmentUsecase: CreateNewAppointmentUseCase
    ) {}
    
    async register() {
        this.eventBus.on(appEventName.NewBruteChatAccessibilityEvent, this.handleNewBruteChatAccessibilityEvent.bind(this));
        this.eventBus.on(appEventName.NewProcessedChatEvent, this.handleNewProcessedChatEvent.bind(this));
        this.eventBus.on(appEventName.ScheduleAppointmentIntent, this.handleScheduleAppointment.bind(this));
        this.eventBus.on(appEventName.CreateTaskWithoutDateIntent, this.handleCreateTaskWithoutDate.bind(this));
        this.eventBus.on(appEventName.AssociateContextTriggerIntent, this.handleAssociateContextTrigger.bind(this));
    }

    async handleNewBruteChatAccessibilityEvent(event: AccessibilityEventData) {
        const chatList: string[] = [
            "com.whatsapp"
        ]
        try {
            if (!chatList.includes(event.packageName || '')) {
               return;
            }
            
            this.bruteChatEventService.fromAccessibility(event);
        } catch (error) {
            console.error("Error processing brute chat accessibility event:", error);
        }
    }

    async handleNewProcessedChatEvent(chatEvent: ChatEventDTO) {
        try {
            await this.backendGateway.sendDataToNLU(
                chatEvent.content
            );
        } catch (error) {
            console.error("Error sending data to NLU:", error);
        }
        
        try {
            await this.intentSelectorUseCase.execute(
                chatEvent.content,
                chatEvent
            );
        } catch (error) {
            console.error("Error handling new processed chat event:", error);
            return;
        }
    }
    
    async handleScheduleAppointment(context: ChatEventDTO) {
        try {
            await this.createNewAppointmentUsecase.execute(context);
        } catch (error) {
            console.error("Error handling schedule appointment intent:", error);
            return;
        }
    }

    async handleCreateTaskWithoutDate(context: ChatEventDTO) {
        // Logic for handling create task without date intent
        console.log("Handling Create Task Without Date for:", context);
    }

    async handleAssociateContextTrigger(context: ChatEventDTO) {
        // Logic for handling associate context trigger intent
        console.log("Handling Associate Context Trigger for:", context);
    }
}