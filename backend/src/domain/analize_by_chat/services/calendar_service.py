from datetime import datetime
import os
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow

class GoogleCalendarService:
    """
    Serviço para interagir com o Google Calendar.
    """

    def __init__(self):
        SCOPES = ["https://www.googleapis.com/auth/calendar"]
        creds = None
        
        try:
            if os.path.exists("token.json"):
                creds = Credentials.from_authorized_user_file("token.json", SCOPES)
            # If there are no (valid) credentials available, let the user log in.
            if not creds or not creds.valid:
                if creds and creds.expired and creds.refresh_token:
                    creds.refresh(Request())
                else:
                    flow = InstalledAppFlow.from_client_secrets_file(
                        "credentials.json", SCOPES
                    )
                    creds = flow.run_local_server(port=0)
                    # Save the credentials for the next run
                with open("token.json", "w") as token:
                    token.write(creds.to_json())

            self.service = build('calendar', 'v3', credentials=creds)
        except Exception as e:
            print(f"An error occurred while initializing the Calendar Scheduler Agent: {e}")
            raise RuntimeError("Failed to initialize Calendar Scheduler Agent")

    def create_event_on_calendar(self, event: dict) -> None:
        """
        Cria um evento no calendário com o nome e a data fornecidos.
        :param event: Dicionário contendo os detalhes do evento.
        """
        if not event or 'summary' not in event or 'start' not in event or 'end' not in event:
            raise ValueError("Invalid event data provided")
        
        try:
            self.service.events().insert(calendarId='primary', body=event).execute()
        except Exception as e:
            print(f"An error occurred while creating the event: {e}")
            raise RuntimeError("Failed to create event")
        
    def search_calendar_events(self, date: str) -> list:
        """
        Busca eventos no calendário com base na data fornecida.
        :param date: A data dos eventos a serem buscados, formato 'YYYY-MM-DD'.
        :return: Lista de eventos encontrados no calendário.
        """
        parsed_date = datetime.strptime(date, '%Y-%m-%d').isoformat() + 'Z'
        events = self.service.events().list(calendarId='primary', timeMin=parsed_date, singleEvents=True).execute()
        return events.get('items', [])