import { AppointmentDTO } from "../../scheduleAppointment/models/appointmentDTO";

export type ActionEventType = "appointment"

export interface ActionEventDTO {
    id: string;
    type: ActionEventType;
    content: AppointmentDTO;
    createdAt: string;
}

export class ActionEventEntity implements ActionEventDTO {
    id: string;
    type: ActionEventType;
    content: AppointmentDTO;
    createdAt: string;

    constructor(data: ActionEventDTO) {
        this.type = data.type;
        this.content = data.content;
        this.createdAt = data.createdAt;
        this.id = data.id || crypto.randomUUID();
    }

    toDTO(): ActionEventDTO {
        return {
            id: this.id,
            type: this.type,
            content: this.content,
            createdAt: this.createdAt,
        };
    }

    static fromDTO(data: ActionEventDTO): ActionEventEntity {
        return new ActionEventEntity(data);
    }

    static create(type: ActionEventType, content: AppointmentDTO): ActionEventEntity {
        return new ActionEventEntity({
            id: crypto.randomUUID(),
            type,
            content,
            createdAt: new Date().toISOString(),
        });
    }
}