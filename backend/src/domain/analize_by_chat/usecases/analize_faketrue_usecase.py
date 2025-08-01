import logging
from sre_compile import isstring
from typing import List

from rich import print_json

from src.domain.analize_by_chat.models.response_dto import ExtractIntentResponseDTO
from src.domain.analize_by_chat.event_repository import EventRepository, GetEventsParams
from langchain_core.prompts import SystemMessagePromptTemplate, HumanMessagePromptTemplate, ChatPromptTemplate
from langchain_core.runnables import Runnable
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.output_parsers import BooleanOutputParser
from src.env import app_environments

logger = logging.getLogger(__name__)

class AnalizeFakeTrueUseCase:
    def __init__(self, event_repository: EventRepository):
        self.event_repository = event_repository

    async def execute(self, intent: ExtractIntentResponseDTO) -> bool:
        """
        Process the chat data and save the event.
        """
        try:
            logger.info(f"Analizing intent: {intent}")
            data: List[str] = [event.content for event in self.event_repository.get_events(
                GetEventsParams(
                    app_name=intent.metadata.package_name,
                    user_name=intent.metadata.contact_name,
                    limit=7
                )
            )]
            if not data:
                return False

            system = SystemMessagePromptTemplate.from_template(
                """\
                Você é um verificador de intenções extraídas por um sistema NLU.
                Você vai receber um JSON de intensão dentro de <intent>.
                Você vai receber um histórico de mensagems dentro de <data> ordenadas do mais antigo para o mais recente.
                Sua tarefa é analisar esses dados e decidir se a intenção extraída é válida ou não.
                Se a intenção for válida, responda `YES`. Se for um falso positivo, responda `NO`.
                Você deve responder **estritamente** com `YES` ou `NO`, **sem** nenhum outro texto ou formatação.
                Responda estritamente com YES ou NO.
                Não use nenhum formato de código, chaves, aspas ou tags. 
                Se não tiver certeza, responda NO."""
            )

            human = HumanMessagePromptTemplate.from_template(
                """\
                <intent>
                {{intent}}
                </intent>

                <data>
                {{data}}
                </data>

                Responda **estritamente** com `YES` (intenção válida) ou `NO` (falso positivo), **sem** nenhum outro texto ou formatação."""
            )

            prompt = ChatPromptTemplate.from_messages([system, human])

            logger.info("Creating Google Generative AI client for intent analysis.")
            
            llm = ChatGoogleGenerativeAI(
                model="gemini-2.0-flash",
                google_api_key=app_environments.GOOGLE_API_KEY,
            )

            logger.info("Running the intent analysis chain.")
            chain: Runnable = prompt | llm

            result = chain.invoke({
                "intent": intent.model_dump_json(),
                "data": "\n".join(data)
            })

            if (result.content is None or isinstance(result.content, str) is False):
                raise ValueError("Result content is None or not a string, cannot parse.")

            content = isinstance(result.content, str) and result.content.strip() or ""

            result = BooleanOutputParser().parse(content)
            logger.info(f"AnalizeFakeTrueUseCase result: {result}")
            logger.info(f"Intent data: {intent.model_dump_json()}")
            logger.info(f"Chat history: {data}")

            return result
        except Exception as e:
            logger.error(f"Error in AnalizeFakeTrueUseCase: {e}")
            return False
        finally:
            logger.info("AnalizeFakeTrueUseCase finished.")