import asyncio
import logging
from socket import timeout
import threading
import time
from typing import List
from src.domain.analize_by_chat.controller import ChatAnalysisController
from src.shared.services.queue.interface import MessageQueueInterface
from src.domain.analize_by_chat.models.request_dto import ChatDataDTO

logger = logging.getLogger("ChatAnalysisQueue")

class ChatAnalysisQueue:
    def __init__(
        self,
        chat_analysis_controller: ChatAnalysisController,
        queue_service: MessageQueueInterface[ChatDataDTO],
        num_threads: int = 1,
        thread_shutdown_timeout: float = 5
    ):
        """
        Inicializa fila de análise de chat com o caso de uso de extração de intenção e serviço de fila.

        :param chat_analysis_controller: Controlador de análise de chat que executa o caso de uso de extração de intenção.
        :param queue_service: Serviço de fila para enfileirar e desenfileirar dados de chat.
        :param num_threads: Número de threads para processar a fila.
        :param thread_shutdown_timeout: Tempo limite para desligamento das threads.
        """
        if (num_threads < 1):
            raise ValueError("Number of threads must be at least 1")

        self._chat_analysis_controller = chat_analysis_controller
        self._queue_service = queue_service
        self._thread_shutdown_event = threading.Event()
        self._thread_shutdown_timeout = thread_shutdown_timeout
        
        self._workers: List[threading.Thread] = []

        self._events_loop = [asyncio.new_event_loop() for _ in range(num_threads)]

        for i in range(num_threads):
            worker = threading.Thread(
                target=self._run_worker_loop,
                args=(self._events_loop[i],),
                name=f"ChatAnalysisWorker-{i+1}",
                daemon=True
            )
            worker.start()
            self._workers.append(worker)
        logger.info(f"Initialized {num_threads} worker threads for chat analysis queue.")

    def _run_worker_loop(self, loop: asyncio.AbstractEventLoop) -> None:
        """
        Método para executar o loop de trabalho em uma thread separada.
        """
        asyncio.set_event_loop(loop)
        loop.run_until_complete(self._worker_loop())

    async def _worker_loop(self) -> None:
        """
        Loop de trabalho que consome mensagens da fila e processa os dados de chat.
        """
        while not self._thread_shutdown_event.is_set():
            try:
                time.sleep(0.1)
                logger.info("Waiting for chat data in queue...")
                item = await self._queue_service.get(timeout=self._thread_shutdown_timeout)
                if item is None:
                    continue
                try:
                    logger.info(f"Processing chat data: {item}")
                    await self._chat_analysis_controller.handle_chat_data(item)
                except Exception as e:
                    logger.error(f"Error processing item: {e}")
                finally:
                    await self._queue_service.task_done()
                    logger.info("Processed chat data from queue.")
            except Exception as e:
                logger.error(f"Error in worker loop: {e}")

    async def producer(self, chat_data) -> None:
        """
        Método para enfileirar dados de chat na fila.
        """
        if not isinstance(chat_data, ChatDataDTO):
            raise TypeError("chat_data must be an instance of ChatDataDTO")
        logger.info(f"Enqueuing chat data: {chat_data}")
        await self._queue_service.put(chat_data)

    async def shutdown(self) -> None:
        self._thread_shutdown_event.set()
        logger.info("Shutting down chat analysis queue workers.")

        for worker in self._workers:
            worker.join()
        logger.info("All chat analysis queue workers have been shut down.")
        await self._queue_service.close()
        logger.info("All chat analysis queue workers have been shut down.")