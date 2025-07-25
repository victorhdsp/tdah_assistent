from domain.analize_by_chat.usecases.extract_intent_usecase import ExtractIntentUseCase
from src.domain.analize_by_chat.services.nlu_service import NLUService
from src.domain.analize_by_chat.queue import ChatAnalysisQueue
from src.domain.analize_by_chat.models.request_dto import ChatDataDTO
from src.shared.services.queue.local_imp import LocalQueueService
from src.domain.analize_by_chat.controller import ChatAnalysisController
from src.domain.analize_by_chat.event_repository import EventRepository


class AppDependencies:
    def __init__(self):
        pass

    def startup(self):
        """
        Método para inicializar as dependências da aplicação.
        """
        event_repository = EventRepository()

        queue_service = LocalQueueService[ChatDataDTO]()
        nlu_service = NLUService()

        extract_intent_use_case = ExtractIntentUseCase(nlu_service)

        chat_analysis_controller = ChatAnalysisController(extract_intent_use_case, event_repository)

        self.chat_analysis_queue = ChatAnalysisQueue(chat_analysis_controller, queue_service, num_threads=10)

    def shutdown(self):
        """
        Método para encerrar as dependências da aplicação.
        """
        self.chat_analysis_queue.shutdown()

app_dependencies = AppDependencies()