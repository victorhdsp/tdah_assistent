from datetime import datetime
from langchain.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent
from src.domain.analize_by_chat.services.calendar_service import GoogleCalendarService
from src.env import app_environments

calendar_service = GoogleCalendarService()

@tool
def create_event_on_calendar(event: dict) -> None:
    """
    Cria um evento no calendário com o nome e a data fornecidos.
    :param event_name: O nome do evento a ser criado.
    :param event_date: A data do evento a ser criado.
    :return: Mensagem de confirmação da criação do evento.
    """
    calendar_service.create_event_on_calendar(event)

@tool
def search_calendar_events(date: str) -> list:
    """
    Busca eventos no calendário com base na data fornecida.
    :param date: A data dos eventos a serem buscados, formato 'YYYY-MM-DD'.
    :return: Lista de eventos encontrados no calendário.
    """
    return calendar_service.search_calendar_events(date)

@tool
def get_current_time() -> str:
    """
    Retorna a data e hora atual no formato ISO 8601.
    :return: Data e hora atual como string.
    """
    return datetime.now().isoformat()

class CalendarSchedulerAgent:
    async def execute(self, action: str):
        """
        Método para executar a tarefa do agente de agendamento de calendário.
        :param action: A ação a ser executada.
        """
        tools = [
            create_event_on_calendar,
            search_calendar_events,
            get_current_time
        ]

        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=app_environments.GOOGLE_API_KEY
        )

        agent = create_react_agent(
            name="Calendar Scheduler Agent",
            description="Agente responsável por agendar eventos no calendário.",
            model=llm,
            tools=tools,
            debug=True
        )

        user_msg = (
            "Você é um agente de agendamento de calendário. "
            "Use as ferramentas disponíveis para realizar essas tarefas. "
            f"Ação solicitada: {action}"
            "\n\n"

            "As ferramentas exigem que você forneça os parâmetros corretos. "
            "Por exemplo, para criar um evento, você deve fornecer um dicionário que pode ter esse formato:" \
            "{"
            "    'summary': str,"
            "    'location': Optional[str],"
            "    'description': str,"
            "    'start': {"
            "        'dateTime': str, # Exemplo: '2025-07-31T10:00:00-03:00'"
            "        'timeZone': 'America/Sao_Paulo',"
            "    },"
            "    'end': {"
            "        'dateTime': str, # Exemplo: '2025-07-31T11:00:00-03:00'"
            "        'timeZone': 'America/Sao_Paulo',"
            "    },"
            "    'recurrence': Optional[List[str]], # Exemplo: ['RRULE:FREQ=DAILY;COUNT=2'],"
            "} "
            "Para buscar eventos, forneça uma data no formato 'YYYY-MM-DD'. Estamos usando o Google Calendar API. "
            "Certifique-se de que os formatos estejam corretos antes de prosseguir."
            "\n\n"
            "No caso de falta de informações, assuma que é no começo da noite (18:00) do dia atual."
        )

        await agent.ainvoke({ "messages": [("user", user_msg)] })

