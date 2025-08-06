import { ChatEventDTO, ChatEventDTOInSimilarity } from "../../chat/models/chatEventDTO";

export function createNewAppointmentPrompt(
    event: ChatEventDTO,
    similarities: ChatEventDTOInSimilarity[]
): string {
    const similarityDetails = similarities.map(similarity => {
        return `Mensagem similar de ${similarity.chat_contact} em ${similarity.timestamp}: "${similarity.content}" com pontuação ${similarity.similarityScore}`;
    }).join('\n'); 

    return `
        Você é um assistente de IA que ajuda a agendar compromissos com base em mensagens de chat.
        Aqui está o novo evento de chat:
        - Contato: ${event.chat_contact}
        - Conteúdo: "${event.content}"
        - Horário: ${event.timestamp}

        Aqui estão as mensagens similares encontradas:
        ${similarityDetails}
        
        Com base nessas informações, você acredita que o usuário deseja agendar um novo compromisso?

        - Se não, explique por que você não acredita que seja um pedido de agendamento, em um JSON nesse formato: 
        {
            "created": boolean, // Deve ser false se o compromisso não foi criado
            "reason": string // Exemplo: "Não foi possível identificar um pedido de agendamento no conteúdo da mensagem, porque não menciona datas."
        }

        - Se sim, por favor, forneça os detalhes do compromisso, incluindo data, hora e descrição, em um JSON nesse formato:
        {
            "created": boolean, // Deve ser true se o compromisso foi criado com sucesso
            "appointment": {
                "summary": string, // Exemplo: "Reunião com o cliente"
                "location": string | undefined, // Exemplo: "Sala de reuniões 1"
                "description": string, // Exemplo: "Discutir o projeto X"
                "start": {
                    "dateTime": string, // Exemplo: '2025-07-31T10:00:00-03:00'
                    "timeZone": "America/Sao_Paulo",
                },
                "end": {
                    "dateTime": string, // Exemplo: '2025-07-31T11:00:00-03:00'
                    "timeZone": "America/Sao_Paulo",
                },
                "recurrence": string[] | undefined, // Exemplo: ['RRULE:FREQ=DAILY;COUNT=2'],
            }
        }
    `;
}