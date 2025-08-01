from src.domain.analize_by_chat.agents.calendar_scheduler_agent import CalendarSchedulerAgent
from src.domain.analize_by_chat.agents.whatsapp_resarcher_agent import WhatsAppResearcherAgent
from src.domain.analize_by_chat.usecases.analize_faketrue_usecase import AnalizeFakeTrueUseCase
from src.domain.analize_by_chat.usecases.extract_intent_usecase import ExtractIntentUseCase
from src.domain.analize_by_chat.services.nlu_service import NLUService
from src.domain.analize_by_chat.queue import ChatAnalysisQueue
from src.domain.analize_by_chat.models.request_dto import ChatDataDTO
from src.shared.services.queue.local_imp import LocalQueueService
from src.domain.analize_by_chat.controller import ChatAnalysisController
from src.domain.analize_by_chat.event_repository import EventRepository

class AppDependencies:
    def __init__(self):
        pass

    async def startup(self):
        """
        Método para inicializar as dependências da aplicação.
        """
        event_repository = EventRepository()

        queue_service = LocalQueueService[ChatDataDTO]()
        nlu_service = NLUService()
        whatsapp_researcher_agent = WhatsAppResearcherAgent()
        calendar_scheduler_agent = CalendarSchedulerAgent()

        extract_intent_use_case = ExtractIntentUseCase(nlu_service)
        faketrue_use_case = AnalizeFakeTrueUseCase(event_repository)

        chat_analysis_controller = ChatAnalysisController(extract_intent_use_case, event_repository, faketrue_use_case, whatsapp_researcher_agent, calendar_scheduler_agent)

        self.chat_analysis_queue = ChatAnalysisQueue(chat_analysis_controller, queue_service, num_threads=10)

    async def shutdown(self):
        """
        Método para encerrar as dependências da aplicação.
        """
        await self.chat_analysis_queue.shutdown()

app_dependencies = AppDependencies()