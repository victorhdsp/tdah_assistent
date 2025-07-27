from src.shared.services.queue.interface import T, MessageQueueInterface
from asyncio import Queue, wait_for

class LocalQueueService(MessageQueueInterface[T]):
    def __init__(self, max_size: int = 100) -> None:
        if max_size <= 0:
            raise ValueError("Max size must be positive")
        self._queue: Queue = Queue(maxsize=max_size)

    async def put(self, message: T):
        await self._queue.put(message)

    async def get(self, timeout = None):
        try:
            task = await wait_for(
                self._queue.get(),
                timeout=timeout
            )
            return task
        
        except Exception as e:
            return None

    async def task_done(self):
        self._queue.task_done()

    async def close(self):
        await self._queue.join()