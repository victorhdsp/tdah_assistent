from dotenv import load_dotenv
import os

class AppEnvironments:
    def __init__(self):
        load_dotenv()

        GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", None)
        if not GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY must be set in environment variables")
        
        self.GOOGLE_API_KEY = GOOGLE_API_KEY

app_environments = AppEnvironments()