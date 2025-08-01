from dataclasses import dataclass
import logging
from traceback import print_last, print_list
from typing import Any, List, Optional, TypedDict, Union
from langchain.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage
import requests
from rich import print_json

from src.domain.analize_by_chat.models.response_dto import ExtractIntentResponseDTO
from src.env import app_environments

logger = logging.getLogger(__name__)

MessageType = Union[AIMessage, HumanMessage, ToolMessage]

@dataclass
class AgentResponse():
    messages: List[MessageType]

@dataclass
class WhatsappFindContactsResponse():
    pushName: str
    remoteJid: str

@dataclass
class WhatsappFindMessagesResponse():
    total: int
    pages: int
    currentPage: int
    records: List[dict[str, Any]]

@dataclass
class WhatsappFindMessagesParams():
    remoteJid: str
    page: int

@tool
def search_whatsapp_messages(params: WhatsappFindMessagesParams) -> List[dict]:
    """
    Busca mensagens no WhatsApp com base no número de contato e na página fornecidos.
    :param remoteJid: O número de contato para buscar mensagens.
    :param page: O número da página de resultados a ser retornada.
    :return: Lista com 10 mensagens do WhatsApp encontradas.
    """
    logger.info(f"Searching for messages with remoteJid: {params.remoteJid} on page: {params.page}")
    response = requests.post(
        url="http://localhost:8080/chat/findMessages/victorhdsp",
        headers={
            "Content-Type": "application/json",
            "apikey": ""
        },
        json={
            "where": {
                "key": {
                    "remoteJid": params.remoteJid,
                }
            },
            "order": "desc",
            "page": params.page,
            "offset": 10
        }
    )

    logger.info(f"Searching for messages with remoteJid: {params.remoteJid} on page: {params.page}")
    if response.status_code != 200:
        raise ValueError(f"Failed to find messages: {response.status_code} - {response.text}")
    
    raw_data = response.json().get("messages", {})
    data = WhatsappFindMessagesResponse(
        total=raw_data.get("total"),
        pages=raw_data.get("pages"),
        currentPage=raw_data.get("currentPage"),
        records=raw_data.get("records", [])
    )

    result: List[dict] = data.records
    logger.info(f"Found {len(result)} messages in WhatsApp on page {params.page}.")
    return result

@tool
def search_whatsapp_contact_number(contact_name: str) -> str:
    """
    Busca o número de contato do WhatsApp com base no nome fornecido.
    :param contact_name: O nome do contato para buscar o número.
    :return: O número de contato do WhatsApp encontrado.
    """
    logger.info(f"Searching for contact number with name: {contact_name}")
    response = requests.post(
        url="http://localhost:8080/chat/findContacts/victorhdsp",
        headers={
            "Content-Type": "application/json",
            "apikey": "3E9E69B9F0FC-4B22-869A-BA7D30E54122"
        },
        json={}
    )

    logger.info(f"Searching for contact number with name: {contact_name}")
    if response.status_code != 200:
        raise ValueError(f"Failed to find contact number: {response.status_code} - {response.text}")
     
    raw_data = response.json()
    data = [WhatsappFindContactsResponse(
        pushName=item.get("pushName"),
        remoteJid=item.get("remoteJid")
    ) for item in raw_data]
    logger.info(f"Found {len(data)} contacts in WhatsApp.")

    for contact in data:
        if contact.pushName == contact_name:
            logger.info(f"Found contact: {contact.pushName} with remoteJid: {contact.remoteJid}")
            return contact.remoteJid
 
    logger.warning(f"Contact with name '{contact_name}' not found.")
    return ""

class WhatsAppResearcherAgent:
    def __init__(self):
        pass

    async def execute(self, intent: ExtractIntentResponseDTO) -> Optional[str]:
        """
        Agente responsável por realizar pesquisas no whatsapp e identificar todas as informações relevantes para o compromisso e escrever um resumo.
        :param intent: A intenção a ser processada.
        :return: Resumo descrevendo a intenção e as informações relevantes encontradas.
        """
        tools = [
            search_whatsapp_messages,
            search_whatsapp_contact_number
        ]

        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=app_environments.GOOGLE_API_KEY
        )

        agent = create_react_agent(
            name="WhatsApp Researcher Agent",
            description="Agente responsável por realizar pesquisas no whatsapp e identificar todas as informações relevantes para o compromisso e escrever um resumo.",
            model=llm,
            tools=tools,
            debug=True
        )

        user_msg = (
            "Antes de ser chamado, rodei uma NLU que retornou a seguinte intenção:\n"
            f"{intent.model_dump_json()}\n\n"
            "Você deve:\n"
            "- Encontrar o usuário do WhatsApp mencionado na intenção.\n"
            "- Buscar mensagens deste usuário.\n"
            "- Extrair informações relevantes para o compromisso.\n"
            "- Escrever um resumo contendo a intenção e as informações encontradas.\n"
            "- Se a tool 'search_whatsapp_contact_number' não encontrar o contato, finalize a resposta com um resumo informando que não foi possível encontrar o contato.\n"
            "- Se a tool 'search_whatsapp_messages' não encontrar mensagens nas primeiras 5 páginas, finalize a resposta com um resumo informando que não foi possível encontrar mensagens.\n"
            "Responda apenas com o resumo dizendo as informações necessárias para criar um agendamento\n."
            "Exemplo de resposta:\n"
            "Criar tarefa com Priscila Juca para enviar carteirinha de vacinação do João Pedro.\n"
            "Agendar reunião com Marcos Silva para discutir o projeto Serena, no dia 15/03/2023.\n"
            "Criar tarefa dar remédio de Maya\n"
        )

        raw_result = await agent.ainvoke({ "messages": [("user", user_msg)] })
        result: AgentResponse = AgentResponse(messages=raw_result.get("messages", []))
        logger.info(f"WhatsApp Researcher Agent raw result: {raw_result}")
        
        if not result or not result.messages:
            raise ValueError("WhatsApp Researcher Agent returned an empty response")

        logger.info(f"WhatsApp Researcher Agent result: {result}")
        if isinstance(result.messages[-1].content, str):
            logger.info(f"WhatsApp Researcher Agent final response: {result.messages[-1].content}")
            return result.messages[-1].content
        
        logger.error("WhatsApp Researcher Agent did not return a valid string response.")
        return None