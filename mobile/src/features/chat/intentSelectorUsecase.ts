import { AppEventBus } from "@/src/core/events/appEventBus";
import { NluService } from "./services/nluService";

export const intentName = {
    'agendar_compromisso': "ScheduleAppointment",
    'criar_tarefa_sem_data': "CreateTaskWithoutDate",
    'associar_gatilho_contextual': "AssociateContextTrigger"
}

export class IntentSelectorUseCase {
    constructor(
        private appEventBus: AppEventBus,
        private nluService: NluService
    ) {}

    async execute<T>(userInput: string, context: T) {
        const intentList: string[] = Object.values(intentName);
        const nluResult = await this.nluService.process(userInput);

        if (intentList.includes(nluResult.intent)) {
            this.appEventBus.emit(nluResult.intent, context);
        }
    }
}