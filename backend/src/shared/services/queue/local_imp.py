from queue import Queue
from typing import Optional
from src.shared.services.queue.interface import T, MessageQueueInterface

class LocalQueueService(MessageQueueInterface[T]):
    def __init__(self, max_size: int = 100) -> None:
        if max_size <= 0:
            raise ValueError("Max size must be positive")
        self._queue: Queue = Queue(maxsize=max_size)

    def put(self, message: T) -> None:
        self._queue.put(message)

    def get(self, timeout = None) -> Optional[T]:
        try:
            return self._queue.get(timeout=timeout)
        except Exception as e:
            return None

    def task_done(self):
        self._queue.task_done()

    def close(self):
        self._queue.join()