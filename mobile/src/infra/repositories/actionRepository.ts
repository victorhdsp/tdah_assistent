import { ActionEventDTO } from "@/src/features/chat/models/actionEvent";
import { IActionsRepository } from "@/src/features/chat/repositories/actionsRepository";

const db: Record<string, ActionEventDTO> = {};

export class ActionRepository implements IActionsRepository {
    async save(event: ActionEventDTO): Promise<void> {
        db[event.id] = event;
    }

    async getAll(): Promise<ActionEventDTO[]> {
        return Object.values(db);
    }
}