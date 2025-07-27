from abc import ABC, abstractmethod
from typing import Coroutine, Generic, Optional, TypeVar

T = TypeVar('T')

class MessageQueueInterface(ABC, Generic[T]):
    @abstractmethod
    def put(self, message: T) -> Coroutine[None, None, None]:
        """Put a message into the queue."""
        pass
    
    @abstractmethod
    def get(self, timeout: Optional[float]) -> Coroutine[None, None, Optional[T]]:
        """Get a message from the queue."""
        pass
    
    @abstractmethod
    def task_done(self) -> Coroutine[None, None, None]:
        """Indicate that a task is complete."""
        pass

    @abstractmethod
    def close(self) -> Coroutine[None, None, None]:
        """Close the queue."""
        pass