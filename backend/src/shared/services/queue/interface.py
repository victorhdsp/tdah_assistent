from abc import ABC, abstractmethod
from typing import Generic, Optional, TypeVar

T = TypeVar('T')

class MessageQueueInterface(ABC, Generic[T]):
    @abstractmethod
    def put(self, message: T):
        """Put a message into the queue."""
        pass
    
    @abstractmethod
    def get(self, timeout: Optional[float]) -> Optional[T]:
        """Get a message from the queue."""
        pass
    
    @abstractmethod
    def task_done(self):
        """Indicate that a task is complete."""
        pass

    @abstractmethod
    def close(self):
        """Close the queue."""
        pass