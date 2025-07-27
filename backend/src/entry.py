from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter
from src.routes.main import route
from src.lifespan import app_dependencies

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Context manager to handle the lifespan of the application.
    Yields control to the application startup and shutdown.
    """
    await app_dependencies.startup()
    yield
    await app_dependencies.shutdown()

class CreateApp:
    def __init__(self):
        app = FastAPI(
            title="TDAH Assistant API",
            version="1.0.0",
            lifespan=lifespan
        )

        self.app = app
        
    def with_routes(self, route: APIRouter):
        self.app.include_router(route)
        
        
        return self
        
    def execute(self) -> FastAPI:
        self.with_routes(route)
        return self.app