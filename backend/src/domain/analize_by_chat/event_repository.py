from typing import List

from src.domain.analize_by_chat.models.event_dto import EventDTO

EventDatabase: List[EventDTO] = []

class EventRepository():
    def __init__(self):
        """
        Inicializa o repositório de eventos.
        """
        self.database = EventDatabase

    def save_event(self, event: EventDTO) -> None:
        """Salva um evento no repositório."""
        self.database.append(event)

    def get_events(self) -> List[EventDTO]:
        """Obtém ultimos 7 eventos de chat no repositório."""
        return self.database[-7:] if len(self.database) >= 7 else self.database
