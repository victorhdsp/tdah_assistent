import requests
from src.domain.analize_by_chat.models.event_dto import EventDTO
from src.domain.analize_by_chat.usecases.analize_faketrue_usecase import AnalizeFakeTrueUseCase
from src.domain.analize_by_chat.event_repository import EventRepository
from src.domain.analize_by_chat.usecases.extract_intent_usecase import ExtractIntentUseCase
from src.domain.analize_by_chat.models.request_dto import ChatDataDTO

class ChatAnalysisController:
    def __init__(
        self,
        extract_intent_use_case: ExtractIntentUseCase,
        event_repository: EventRepository,
        faketrue_use_case: AnalizeFakeTrueUseCase
    ):
        self.extract_intent_use_case = extract_intent_use_case
        self.event_repository = event_repository
        self.faketrue_use_case = faketrue_use_case

    async def handle_chat_data(self, chat_data: ChatDataDTO) -> None:
        """
        Método para processar dados de chat e extrair intenções.
        :param chat_data: Dados do chat a serem processados.
        """
        
        for content in chat_data.content:
            event = EventDTO(metadata=chat_data.metadata, content=content.text)
            
            self.event_repository.save_event(event)
            
            intent = self.extract_intent_use_case.execute(event)
            if not intent:
                continue
            requests.post(
                f"http://192.168.1.160:1234/after-extract'",
                json=intent.model_dump_json()
            )

            is_fake = await self.faketrue_use_case.execute(intent)
