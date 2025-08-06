import { ActionEventDTO } from "../models/actionEvent";

export interface IActionsRepository {
    save(event: ActionEventDTO): Promise<void>;
    getAll(): Promise<ActionEventDTO[]>;
}