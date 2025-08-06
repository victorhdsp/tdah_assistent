export interface AppointmentDTO {
    summary: string, 
    location: string | undefined, 
    description: string, 
    start: {
        dateTime: string, 
        timeZone: "America/Sao_Paulo",
    },
    end: {
        dateTime: string,
        timeZone: "America/Sao_Paulo",
    },
    recurrence: string[] | undefined,
}