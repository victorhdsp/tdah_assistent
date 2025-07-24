
from typing import List, get_args
from fastapi import HTTPException
from src.domain.analize_by_chat.extract_intent.models.nlu_dto import NLUEntityDTO
from src.domain.analize_by_chat.extract_intent.services.nlu_service import NLUService
from src.domain.analize_by_chat.extract_intent.models.response_dto import ExtractIntentResponseDTO, NLUEntitiesDTO, NLUGenericDTO, NLUType
from src.domain.analize_by_chat.extract_intent.models.request_dto import ChatDataDTO

def extract_entities_map(entities: List[NLUEntityDTO]) -> dict:
    return {e.entity: e.value for e in entities}

class ExtractIntentUseCase:
    def __init__(self, nlu_service: NLUService):
        self.nlu_service = nlu_service

    def execute(self, chat_data: ChatDataDTO) -> ExtractIntentResponseDTO:
        if not chat_data.content:
            raise HTTPException(status_code=400, detail="Chat data content cannot be empty")
        if not chat_data.metadata:
            raise HTTPException(status_code=400, detail="Chat data metadata cannot be empty")
        
        chat_list = chat_data.content
        if not isinstance(chat_list, list):
            raise HTTPException(status_code=400, detail="Chat data content must be a list")
        
        intents: list[NLUGenericDTO] = []

        for chat in chat_list:
            nlu_response = self.nlu_service.execute(chat.text.strip())
            if not nlu_response:
                continue
            if nlu_response.intent.name not in get_args(NLUType):
                continue
            intents.append(NLUGenericDTO(
                type=nlu_response.intent.name, # type: ignore
                text=nlu_response.text,
                entities=NLUEntitiesDTO(**extract_entities_map(nlu_response.entities))
            ))

        return ExtractIntentResponseDTO(
            metadata=chat_data.metadata,
            intents=intents
        )