import logging
import requests
from src.domain.analize_by_chat.models.event_dto import EventDTO
from src.domain.analize_by_chat.usecases.analize_faketrue_usecase import AnalizeFakeTrueUseCase
from src.domain.analize_by_chat.event_repository import EventRepository
from src.domain.analize_by_chat.usecases.extract_intent_usecase import ExtractIntentUseCase
from src.domain.analize_by_chat.models.request_dto import ChatDataDTO

logger = logging.getLogger(__name__)

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
            try:
                logger.info(f"Processing chat content: {content.text}")
                event = EventDTO(metadata=chat_data.metadata, content=content.text)

                self.event_repository.save_event(event)
                logger.info(f"Saved event: {event}")
                
                intent = self.extract_intent_use_case.execute(event)
                logger.info(f"Extracted intent: {intent}")
                if not intent:
                    continue

                try:
                    logger.info(f"Sending intent to after-extract endpoint: {intent}")
                    requests.post(
                        f"http://192.168.1.160:1234/after-extract'",
                        json=intent.model_dump_json()
                    )
                    logger.info("Intent sent successfully.")
                except requests.RequestException as e:
                    logger.error(f"Failed to send intent to after-extract endpoint: {e}")
                except Exception as e:
                    logger.error(f"Unexpected error when sending intent: {e}")

                logger.info(f"Processing intent with faketrue use case: {intent}")
                is_valid = await self.faketrue_use_case.execute(intent)
                
            except Exception as e:
                logger.error(f"Error processing chat data: {e}")
                continue
