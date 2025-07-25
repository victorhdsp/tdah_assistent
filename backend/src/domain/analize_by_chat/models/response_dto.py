from typing import Literal, Optional
from pydantic import BaseModel
from typing import TypeAlias

from src.domain.analize_by_chat.models.request_dto import MetadataDTO

NLUType: TypeAlias = Literal['agendar_compromisso', 'criar_tarefa_sem_data', 'associar_gatilho_contextual']

class NLUEntitiesDTO(BaseModel):
    date: Optional[str] = None
    hour: Optional[str] = None
    local: Optional[str] = None
    action: Optional[str] = None
    object: Optional[str] = None
    event: Optional[str] = None

class ExtractIntentResponseDTO(BaseModel):
    metadata: MetadataDTO
    type: NLUType
    text: str
    entities: NLUEntitiesDTO