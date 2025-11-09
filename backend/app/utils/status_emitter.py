from typing import Callable, Optional
from queue import Queue
import json


class StatusEmitter:
    """
    A simple status emitter that allows functions to send status updates
    to be streamed to the frontend.
    """
    
    def __init__(self):
        self.queue: Queue = Queue()
        self._closed = False
    
    def emit(self, status: str, message: str, details: Optional[dict] = None):
        """
        Emit a status update.
        
        Args:
            status: Status type ('info', 'success', 'warning', 'error', 'progress')
            message: Human-readable message
            details: Optional additional details
        """
        if not self._closed:
            update = {
                "status": status,
                "message": message,
                "details": details or {}
            }
            self.queue.put(update)
    
    def get_updates(self):
        """Generator that yields status updates from the queue."""
        while True:
            try:
                update = self.queue.get(timeout=1)
                yield update
            except:
                # Timeout or closed
                if self._closed:
                    break
                continue
    
    def close(self):
        """Close the emitter and signal no more updates."""
        self._closed = True
        # Put a sentinel value to unblock the queue
        try:
            self.queue.put_nowait({"status": "closed", "message": ""})
        except:
            pass


def create_status_emitter() -> StatusEmitter:
    """Factory function to create a new StatusEmitter."""
    return StatusEmitter()

