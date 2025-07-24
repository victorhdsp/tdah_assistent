import requests
from src.shared.services.queue.interface import MessageQueueInterface
from src.domain.analize_by_chat.extract_intent.main import ExtractIntentUseCase
from src.domain.analize_by_chat.extract_intent.models.request_dto import ChatDataDTO

class ChatAnalysisController:
    def __init__(
        self,
        extract_intent_use_case: ExtractIntentUseCase
    ):
        self.extract_intent_use_case = extract_intent_use_case

    def handle_chat_data(self, chat_data: ChatDataDTO) -> None:
        """
        Método para processar dados de chat e extrair intenções.
        :param chat_data: Dados do chat a serem processados.
        """
        response = self.extract_intent_use_case.execute(chat_data)
        
        requests.post(
            f"http://192.168.1.160:1234/after-extract'",
            json=response.json()
        )