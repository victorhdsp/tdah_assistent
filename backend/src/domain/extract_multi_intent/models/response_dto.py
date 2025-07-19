from enum import Enum
from typing import Literal, Optional
from pydantic import BaseModel

from src.domain.extract_multi_intent.models.request_dto import MetadataDTO

class NLUOrphanEntityDTO(BaseModel):
    key: str
    value: str

class NLUGenericDTO(BaseModel):
    type: Literal['agendar_compromisso', 'criar_tarefa_sem_data', 'associar_gatilho_contextual']
    text: str
    date: Optional[str] = None
    hour: Optional[str] = None
    local: Optional[str] = None
    action: Optional[str] = None
    object: Optional[str] = None
    event: Optional[str] = None

class ExtractMultiIntentResponseDTO(BaseModel):
    metadata: MetadataDTO
    intents: list[NLUGenericDTO]