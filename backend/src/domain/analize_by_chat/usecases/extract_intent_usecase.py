
from typing import List, get_args
from fastapi import HTTPException
from src.domain.analize_by_chat.models.event_dto import EventDTO
from src.domain.analize_by_chat.models.nlu_dto import NLUEntityDTO
from src.domain.analize_by_chat.services.nlu_service import NLUService
from src.domain.analize_by_chat.models.response_dto import ExtractIntentResponseDTO, NLUEntitiesDTO, NLUType

def extract_entities_map(entities: List[NLUEntityDTO]) -> dict:
    return {e.entity: e.value for e in entities}

class ExtractIntentUseCase:
    def __init__(self, nlu_service: NLUService):
        self.nlu_service = nlu_service

    def execute(self, event: EventDTO) -> ExtractIntentResponseDTO | None:
        if not event.content:
            raise HTTPException(status_code=400, detail="Event content cannot be empty")
        if not event.metadata:
            raise HTTPException(status_code=400, detail="Event metadata cannot be empty")
        
        nlu_response = self.nlu_service.execute(event.content.strip())
        if not nlu_response:
            return None
        if nlu_response.intent.name not in get_args(NLUType):
            return None
        

        return ExtractIntentResponseDTO(
            type=nlu_response.intent.name, # type: ignore
            text=nlu_response.text,
            entities=NLUEntitiesDTO(**extract_entities_map(nlu_response.entities)),
            metadata=event.metadata
        )