from typing import List

from src.shared.utils.bool_output_parser import BoolOutputParser
from src.domain.analize_by_chat.models.response_dto import ExtractIntentResponseDTO
from src.domain.analize_by_chat.event_repository import EventRepository
from langchain_core.prompts import SystemMessagePromptTemplate, HumanMessagePromptTemplate, ChatPromptTemplate
from langchain_core.runnables import Runnable
from langchain_google_genai import ChatGoogleGenerativeAI

class AnalizeFakeTrueUseCase:
    def __init__(self, event_repository: EventRepository):
        self.event_repository = event_repository

    async def execute(self, intent: ExtractIntentResponseDTO) -> bool:
        """
        Process the chat data and save the event.
        """
        data: List[str] = [event.content for event in self.event_repository.get_events()]
        if not data:
            return False

        system = SystemMessagePromptTemplate.from_template(
            """\
            Você é um verificador de intenções extraídas por um sistema NLU.
            Você vai receber um JSON de intensão dentro de <intent>.
            Você vai receber um histórico de mensagems dentro de <data> ordenadas do mais antigo para o mais recente.
            Sua tarefa é analisar esses dados e decidir se a intenção extraída é válida ou não.
            Se a intenção for válida, responda `true`. Se for um falso positivo, responda `false`.
            Você deve responder **estritamente** com `true` ou `false`, **sem** nenhum outro texto ou formatação."""
        )

        human = HumanMessagePromptTemplate.from_template(
            """\
            <intent>
            {{intent}}
            </intent>

            <data>
            {{data}}
            </data>

            Responda **estritamente** com `true` (intenção válida) ou `false` (falso positivo), **sem** nenhum outro texto ou formatação."""
        )

        prompt = ChatPromptTemplate.from_messages([system, human])

        llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash")

        chain: Runnable = prompt | llm | BoolOutputParser()

        result: bool = await chain.invoke({
            "intent": intent.model_dump_json(),
            "data": "\n".join(data)
        })

        return result