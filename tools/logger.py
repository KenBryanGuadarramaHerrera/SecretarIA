"""
Sistema de logging compartido para GOB-AGENTS.
Permite que los nodos publiquen mensajes tanto a la terminal como al frontend via SSE.
"""
import threading
import time
from collections import deque
from typing import Optional


class AgentLogger:
    """
    Cola thread-safe para publicar mensajes de los agentes.
    El backend SSE lee de aqui para enviar eventos al frontend.
    """
    
    def __init__(self):
        self._messages = deque(maxlen=500)
        self._lock = threading.Lock()
        self._event = threading.Event()
        self._session_id: Optional[str] = None
    
    def set_session(self, session_id: str):
        """Establece la sesion activa."""
        with self._lock:
            self._session_id = session_id
            self._messages.clear()
    
    def log(self, msg: str, agent: str = "", log_type: str = "info", delay: float = 0.3):
        """
        Publica un mensaje.
        - msg: el texto del mensaje
        - agent: nombre del agente que lo emite
        - log_type: "info", "ok", "fallo", "aviso", "decision"
        - delay: pausa despues de publicar (para efecto progresivo en terminal)
        """
        entry = {
            "msg": msg,
            "agent": agent,
            "type": log_type,
            "timestamp": time.time()
        }
        
        with self._lock:
            self._messages.append(entry)
        
        # Notificar a los listeners SSE
        self._event.set()
        self._event.clear()
        
        # Tambien imprimir en terminal (compatibilidad con CLI)
        print(msg, flush=True)
        if delay > 0:
            time.sleep(delay)
    
    def get_new_messages(self, since: float = 0) -> list:
        """Retorna mensajes nuevos desde un timestamp dado."""
        with self._lock:
            return [m for m in self._messages if m["timestamp"] > since]
    
    def get_all_messages(self) -> list:
        """Retorna todos los mensajes de la sesion."""
        with self._lock:
            return list(self._messages)
    
    def wait_for_message(self, timeout: float = 30) -> bool:
        """Bloquea hasta que haya un mensaje nuevo o timeout."""
        return self._event.wait(timeout=timeout)


# Instancia global del logger
agent_logger = AgentLogger()
