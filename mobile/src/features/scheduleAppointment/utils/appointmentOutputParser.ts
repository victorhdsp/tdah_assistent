import { AppointmentDTO } from "../models/appointmentDTO";

export function parseAppointmentOutput(output: string): AppointmentDTO | null {
    try {
        const data = JSON.parse(output);
        if (typeof data.summary !== 'string') throw new Error("Invalid summary");
        if (data.location && typeof data.location !== 'string') throw new Error("Invalid location");
        if (typeof data.description !== 'string') throw new Error("Invalid description");
        if (typeof data.start !== 'object' || typeof data.start.dateTime !== 'string') {
            throw new Error("Invalid start time");
        }
        if (typeof data.end !== 'object' || typeof data.end.dateTime !== 'string') {
            throw new Error("Invalid end time");
        }
        if (data.recurrence && !Array.isArray(data.recurrence)) throw new Error("Invalid recurrence");

        return {
            summary: data.summary,
            location: data.location || undefined,
            description: data.description,
            start: {
                dateTime: data.start.dateTime,
                timeZone: "America/Sao_Paulo",
            },
            end: {
                dateTime: data.end.dateTime,
                timeZone: "America/Sao_Paulo",
            },
            recurrence: data.recurrence || undefined,
        };
    } catch (error) {
        console.error("Error parsing appointment output:", error);
        return null;
    }
}
