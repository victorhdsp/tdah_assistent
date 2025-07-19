from fastapi import FastAPI, APIRouter
from src.routes.main import route

class CreateApp:
    def __init__(self):
        self.app = FastAPI(
            title="TDAH Assistant API",
            version="1.0.0"
        )
        
    def with_routes(self, route: APIRouter):
        self.app.include_router(route)
        return self
        
    def execute(self) -> FastAPI:
        self.with_routes(route)
        return self.app