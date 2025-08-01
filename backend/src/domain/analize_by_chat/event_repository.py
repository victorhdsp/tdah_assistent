from dataclasses import dataclass
from typing import List

from src.domain.analize_by_chat.models.event_dto import EventEntity

@dataclass
class GetEventsParams:
    app_name: str
    user_name: str
    limit: int = 7

# { "[nome do app]: { "[nome do usuario]: <event>[]" }"}
EventDatabase: dict[str, dict[str, List[EventEntity]]] = {}

class EventRepository():
    def __init__(self):
        """
        Inicializa o repositório de eventos.
        """
        self.database = EventDatabase

    def save_event(self, event: EventEntity) -> None:
        """Salva um evento no repositório."""
        app_name = event.metadata.package_name
        user_name = event.metadata.contact_name

        if app_name not in self.database:
            self.database[app_name] = {}
        if user_name not in self.database[app_name]:
            self.database[app_name][user_name] = []
            
        self.database[app_name][user_name].append(event)

    def get_events(self, params: GetEventsParams) -> List[EventEntity]:
        """Obtém ultimos 7 eventos de chat no repositório."""
        if not params or not params.app_name or not params.user_name:
            return []
        
        if params.limit <= 0:
            params.limit = 7

        if params.app_name not in self.database:
            return []
        
        app_name = params.app_name
        user_name = params.user_name

        app_database = self.database[app_name]
        if user_name not in app_database:
            return []
        
        user_database = app_database[user_name]

        return user_database[-params.limit:] if len(user_database) >= params.limit else user_database
