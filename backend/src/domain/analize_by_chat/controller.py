import logging
import requests
from src.domain.analize_by_chat.models.event_dto import EventEntity
from src.domain.analize_by_chat.agents.calendar_scheduler_agent import CalendarSchedulerAgent
from src.domain.analize_by_chat.agents.whatsapp_resarcher_agent import WhatsAppResearcherAgent
from src.domain.analize_by_chat.usecases.analize_faketrue_usecase import AnalizeFakeTrueUseCase
from src.domain.analize_by_chat.event_repository import EventRepository, GetEventsParams
from src.domain.analize_by_chat.usecases.extract_intent_usecase import ExtractIntentUseCase
from src.domain.analize_by_chat.models.request_dto import ChatDataDTO

logger = logging.getLogger(__name__)

class ChatAnalysisController:
    def __init__(
        self,
        extract_intent_use_case: ExtractIntentUseCase,
        event_repository: EventRepository,
        faketrue_use_case: AnalizeFakeTrueUseCase,
        whatsapp_researcher_agent: WhatsAppResearcherAgent,
        calendar_scheduler_agent: CalendarSchedulerAgent
    ):
        self.extract_intent_use_case = extract_intent_use_case
        self.event_repository = event_repository
        self.faketrue_use_case = faketrue_use_case
        self.whatsapp_researcher_agent = whatsapp_researcher_agent
        self.calendar_scheduler_agent = calendar_scheduler_agent

    async def handle_chat_data(self, chat_data: ChatDataDTO) -> None:
        """
        Método para processar dados de chat e extrair intenções.
        :param chat_data: Dados do chat a serem processados.
        """
        for content in chat_data.content:
            try:
                logger.info(f"Processing chat content: {content.text}")
                event = EventEntity(
                    metadata=chat_data.metadata,
                    content=content.text
                )

                get_events = self.event_repository.get_events(
                    GetEventsParams(
                        app_name=chat_data.metadata.package_name,
                        user_name=chat_data.metadata.contact_name,
                        limit=30
                    )
                )
                for existing_event in get_events:
                    if existing_event.event_id == event.event_id:
                        return
                    
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
                is_fake = await self.faketrue_use_case.execute(intent)

                if is_fake:
                    logger.warning(f"Intent is not valid: {intent}")
                    continue

                logger.info(f"Intent is valid: {intent}")

                agent_action = await self.whatsapp_researcher_agent.execute(intent)
                if not agent_action:
                    raise ValueError("WhatsApp Researcher Agent returned an empty agent_action")
                logger.info(f"WhatsApp Researcher Agent agent_action: {agent_action}")
                
                try:
                    logger.info(f"Sending agent_action to whatsapp-researcher-agent endpoint: {agent_action}")
                    requests.post(
                        f"http://192.168.1.160:1234/whatsapp-researcher-agent",
                        json={ "text": agent_action }
                    )
                    print(f"Final agent_action from WhatsApp Researcher Agent: {agent_action}")
                    logger.info("agent_action sent successfully.")
                except requests.RequestException as e:
                    logger.error(f"Failed to send agent_action to whatsapp-researcher-agent endpoint: {e}")
                except Exception as e:
                    logger.error(f"Unexpected error when sending agent_action: {e}")
            
                await self.calendar_scheduler_agent.execute(agent_action)
            except Exception as e:
                logger.error(f"Error processing chat data: {e}")
                continue
