import { ChatEventDTO } from "../chat/models/chatEventDTO";
import { VectorService } from "../chat/services/vectorService";
import { LLMService } from "./services/llmService";
import { IChatMessagesRepository } from "../chat/repositories/chatMessagesRepository";
import { createNewAppointmentPrompt } from "./prompts/CreateNewAppointment.v1";
import { parseAppointmentOutput } from "./utils/appointmentOutputParser";
import { AppointmentDTO } from "./models/appointmentDTO";
import { CalendarService } from "./services/calendarService";
import { IActionsRepository } from "../chat/repositories/actionsRepository";
import { ActionEventEntity } from "../chat/models/actionEvent";

export class CreateNewAppointmentUseCase {
    constructor(
        private llmService: LLMService,
        private chatMessagesRepository: IChatMessagesRepository,
        private vectorService: VectorService,
        private calendarService: CalendarService,
        private actionRepository: IActionsRepository
    ) {}

    async createNewAppointment(appointment: AppointmentDTO): Promise<void> {
        try {
            const createdAppointment = await this.calendarService.createEvent(appointment);
            await this.actionRepository.save(ActionEventEntity.create("appointment" ,createdAppointment));
        } catch (error) {
            console.error("Error creating new appointment:", error);
        }
    }

    async execute(event: ChatEventDTO) {
        const messages = await this.chatMessagesRepository.getByContact(event.chat_contact);
        const similarities = await this.vectorService.findSimilarEmbeddings(event.vector, messages, 10);
        
        if (similarities.length === 0) {
            console.warn("No similar messages found for the event.");
            return;
        }

        const prompt = createNewAppointmentPrompt(event, similarities)

        const tryCreateAppointment = async (currentAttempt = 1) => {
            try {
                const response = await this.llmService.process(prompt);
                if (!response) {
                    throw new Error("Failed to generate response from LLM.");
                }
                const appointment = parseAppointmentOutput(response);
                if (appointment) {
                    console.log("Appointment created successfully:", appointment);
                    await this.createNewAppointment(appointment);
                } else {
                    console.error("Failed to create appointment:", response);
                }
            } catch (error) {
                console.error("Error processing LLM request:", error);
                if (currentAttempt < 3) {
                    console.log(`Retrying... Attempt ${currentAttempt + 1}`);
                    await tryCreateAppointment(currentAttempt + 1);
                } else {
                    console.error("Max retry attempts reached. Could not create appointment.");
                }
            }
        }
        await tryCreateAppointment();
    }
}