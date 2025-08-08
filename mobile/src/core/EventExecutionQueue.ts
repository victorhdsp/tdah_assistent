type QueuedTask = {
  fn: () => Promise<void>;
};

export class EventExecutionQueue {
  private queue: QueuedTask[] = [];
  private processing = false;

  enqueue(task: QueuedTask) {
    this.queue.push(task);
    this.processNext();
  }

  private async processNext() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const task = this.queue.shift();
    if (!task) return;

    try {
      await task.fn();
    } catch (err) {
      console.error("Erro executando tarefa na fila:", err);
    } finally {
      this.processing = false;
      //this.processNext();
    }
  }
}
