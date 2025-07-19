from token import NL
from traceback import print_list
from typing import List, Optional
from fastapi import HTTPException
from rich import print_json
from src.domain.extract_multi_intent.models.nlu_dto import NLUEntityDTO
from src.domain.extract_multi_intent.services.nlu_service import NLUService
from src.domain.extract_multi_intent.models.response_dto import ExtractMultiIntentResponseDTO, NLUGenericDTO, NLUOrphanEntityDTO
from src.domain.extract_multi_intent.models.request_dto import ChatDataDTO
import spacy

def extract_entities_map(entities: List[NLUEntityDTO]) -> dict:
    return {e.entity: e.value for e in entities}

class ExtractMultiIntentUseCase:
    def __init__(self, nlu_service: NLUService):
        self.nlu_service = nlu_service

    def join(self, chat_data: ChatDataDTO) -> str:
        """ Joins the content of the chat data into a single list of text rows.
        Args:
            chat_data (ChatDataDTO): The chat data containing metadata and content.
        Returns:
            str: A list of text rows from the chat data.
        """
        if not chat_data or not chat_data.content:
            raise HTTPException(status_code=400, detail="Chat data is empty or content is missing.")

        if not isinstance(chat_data.content, list):
            raise HTTPException(status_code=400, detail="Content must be a list of TextRowDataDTO.")
        
        result = ' '.join([row.text for row in chat_data.content if row.text])
        return result
    
    def divide_by_conjunction(self, text: str) -> List[str]:
        """ Divides the text by conjunctions.
        Args:
            text (str): The text to be divided.
        Returns:
            list: A list of text segments divided by conjunctions.
        """
        if not text:
            raise HTTPException(status_code=400, detail="Text is empty.")
        
        nlp = spacy.load("pt_core_news_sm")
        doc = nlp(text=text)
        split_list = ['punct', 'cc']

        result: List[str] = []
        aux_result: List[str] = []
        for token in doc:
            if (token.dep_ in split_list):
                if (aux_result.__len__() > 0):
                    result.append(' '.join(aux_result))
                aux_result = []
            else:
                aux_result.append(token.text)
                
        return result

    def get_intents(self, text_data: List[str]) -> List[NLUGenericDTO]:
        """ Extracts intents from the text data.
        Args:
            text_data (List[str]): The list of text segments to extract intents from.
        Returns:
            List[NLUGenericDTO]: A list of extracted intents.
        """

        intents: List[NLUGenericDTO] = []
        current_intent: Optional[NLUGenericDTO] = None
        orphan_entity: List[NLUOrphanEntityDTO] = []
        
        for text in text_data:
            nlu_response = self.nlu_service.execute(text)

            entities: dict[str, str] = extract_entities_map(nlu_response.entities)
            intent_name = nlu_response.intent.name
            print_json(nlu_response.json())

            if intent_name in ['agendar_compromisso', 'criar_tarefa_sem_data', 'associar_gatilho_contextual']:
                if current_intent:
                    intents.append(current_intent)
                current_intent = NLUGenericDTO(
                    type=intent_name, # type: ignore
                    text=nlu_response.text
                )

            for entity in orphan_entity:
                if getattr(current_intent, entity.key, None) is None:
                    setattr(current_intent, entity.key, entity.value.lower())

            for attr in ['date', 'hour', 'local', 'action', 'object', 'event']:
                if entities.get(attr):
                    if current_intent and getattr(current_intent, attr, None) is None:
                        setattr(current_intent, attr, entities[attr].lower())
                    else:
                        orphan_entity.append(NLUOrphanEntityDTO(
                            key=attr,
                            value=entities[attr].lower()
                        ))
        if current_intent:
            intents.append(current_intent)
            
        return intents

    def execute(self, chat_data: ChatDataDTO) -> ExtractMultiIntentResponseDTO:
        joined_content = self.join(chat_data)
        divided_content = self.divide_by_conjunction(joined_content)
        intents = self.get_intents(divided_content)
        
        return ExtractMultiIntentResponseDTO(
            metadata=chat_data.metadata,
            intents=intents
        )