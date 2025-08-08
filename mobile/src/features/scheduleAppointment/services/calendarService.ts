import { AppointmentDTO } from "../models/appointmentDTO";
import RNCalendarEvents from 'react-native-calendar-events';

export class CalendarService {
    private isInitialized: boolean = false;

    async init(): Promise<void> {
        const status = await RNCalendarEvents.requestPermissions();
        if (status !== 'authorized') {
            throw new Error("Calendar permission not granted");
        }
        this.isInitialized = true;
    }

    async createEvent(dto: AppointmentDTO): Promise<AppointmentDTO> {
        if (!this.isInitialized) {
            console.warn("CalendarService not initialized. Initializing now...");
            await this.init();
        }

        console.log("Creating calendar event:", dto);
        const recurrenceMap: Record<string, 'daily' | 'weekly' | 'monthly' | 'yearly'> = {
            'RRULE:FREQ=DAILY': 'daily',
            'RRULE:FREQ=WEEKLY': 'weekly',
            'RRULE:FREQ=MONTHLY': 'monthly',
            'RRULE:FREQ=YEARLY': 'yearly',
        };

        const rnEvent = {
            title: dto.summary,
            location: dto.location,
            notes: dto.description,
            startDate: dto.start.dateTime,
            endDate: dto.end.dateTime,
            recurrence: dto.recurrence
            ? recurrenceMap[dto.recurrence[0]] || undefined
            : undefined,
        };

        await RNCalendarEvents.saveEvent(rnEvent.title, rnEvent);
        return dto;
    }

    async fetchEvents(startDate: string, endDate: string): Promise<any[]> {
        if (!this.isInitialized) {
            await this.init();
        }
        return await RNCalendarEvents.fetchAllEvents(startDate, endDate);
    }
}
