"""
GOB-AGENTS Backend API
FastAPI server that exposes the LangGraph multi-agent system.
Supports SSE (Server-Sent Events) for real-time progressive agent logs.
"""
import sys
import os
import json
import time
import threading
import asyncio
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

# Agregar el directorio raiz al path para poder importar los modulos existentes
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from graph import app as langgraph_app
from state import ExpedienteState
from tools.logger import agent_logger

# ════════════════════════════════════════════════════════════
# FastAPI App
# ════════════════════════════════════════════════════════════

api = FastAPI(
    title="GOB-AGENTS API",
    description="API del Sistema Multiagente para SEDECO CDMX",
    version="1.0.0"
)

api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ════════════════════════════════════════════════════════════
# Estado global de la sesion
# ════════════════════════════════════════════════════════════

class SessionState:
    def __init__(self):
        self.config = None
        self.initial_state = None
        self.is_running = False
        self.is_finished = False
        self.decisiones_mitl = []

session = SessionState()

# ════════════════════════════════════════════════════════════
# Modelos Pydantic para la API
# ════════════════════════════════════════════════════════════

class ExpedienteInput(BaseModel):
    folio: str
    rfc: str
    curp: str
    nombre: str
    score_ml: float = 0.5
    alcaldia: str = "Iztapalapa"
    marginacion: str = "Alta"

class EditInput(BaseModel):
    campo: str
    valor: str

# ════════════════════════════════════════════════════════════
# Funciones auxiliares
# ════════════════════════════════════════════════════════════

def _get_graph_state():
    """Obtiene el estado actual del grafo LangGraph."""
    if session.config is None:
        return None
    try:
        graph_state = langgraph_app.get_state(session.config)
        return graph_state
    except Exception:
        return None

def _state_to_dict(state_values) -> dict:
    """Convierte el estado de LangGraph a un diccionario serializable."""
    if state_values is None:
        return {}
    result = dict(state_values)
    # Asegurar que todos los valores sean serializables
    for key, value in result.items():
        if isinstance(value, (list, dict, str, int, float, bool, type(None))):
            continue
        result[key] = str(value)
    return result

def _run_agent_in_thread(input_data):
    """Ejecuta el siguiente paso del grafo en un thread separado."""
    session.is_running = True
    try:
        langgraph_app.invoke(input_data, session.config)
    except Exception as e:
        agent_logger.log(f"  [ERROR] {str(e)}", agent="Sistema", log_type="fallo", delay=0)
    finally:
        session.is_running = False

# ════════════════════════════════════════════════════════════
# Endpoints
# ════════════════════════════════════════════════════════════

@api.post("/api/expediente/iniciar")
def iniciar_expediente(data: ExpedienteInput):
    """Inicia la evaluacion de un nuevo expediente."""
    # Limpiar estado anterior
    agent_logger.set_session(data.folio)
    session.decisiones_mitl = []
    session.is_finished = False
    
    initial_state = ExpedienteState(
        folio=data.folio,
        rfc=data.rfc,
        curp=data.curp,
        nombre=data.nombre,
        score_ml=data.score_ml,
        datos_geograficos={
            "alcaldia": data.alcaldia,
            "marginacion": data.marginacion
        },
        es_rfc_valido=None,
        alertas_sat=[],
        analisis_financiero=None,
        es_aprobado_auditoria=None,
        observaciones_auditoria=[],
        resolucion_final=None,
        minuta_interna=None,
        carta_ciudadano=None,
        linea_tiempo=[]
    )
    
    session.config = {"configurable": {"thread_id": data.folio}}
    session.initial_state = initial_state
    
    # Ejecutar el primer nodo (Validador) en un thread
    thread = threading.Thread(
        target=_run_agent_in_thread,
        args=(initial_state,)
    )
    thread.start()
    
    return {"status": "iniciado", "folio": data.folio}


@api.get("/api/expediente/estado")
def obtener_estado():
    """Devuelve el estado actual del expediente y la informacion de control."""
    graph_state = _get_graph_state()
    if graph_state is None:
        raise HTTPException(status_code=404, detail="No hay expediente activo")
    
    state_values = _state_to_dict(graph_state.values)
    next_nodes = list(graph_state.next) if graph_state.next else []
    
    is_finished = len(next_nodes) == 0 and not session.is_running
    session.is_finished = is_finished
    
    return {
        "estado": state_values,
        "siguiente_nodo": next_nodes[0] if next_nodes else None,
        "nodos_pendientes": next_nodes,
        "en_ejecucion": session.is_running,
        "terminado": is_finished,
        "decisiones_mitl": session.decisiones_mitl
    }


@api.post("/api/expediente/continuar")
def continuar_expediente():
    """El funcionario aprueba y ejecuta el siguiente nodo."""
    graph_state = _get_graph_state()
    if graph_state is None:
        raise HTTPException(status_code=404, detail="No hay expediente activo")
    
    next_nodes = list(graph_state.next) if graph_state.next else []
    if not next_nodes:
        raise HTTPException(status_code=400, detail="El proceso ya finalizo")
    
    if session.is_running:
        raise HTTPException(status_code=400, detail="Un agente esta en ejecucion")
    
    # Registrar decision MITL
    agente_anterior = "N/A"
    linea_tiempo = graph_state.values.get("linea_tiempo", [])
    if linea_tiempo:
        agente_anterior = linea_tiempo[-1].get("agente", "N/A")
    
    session.decisiones_mitl.append({
        "despues_de": agente_anterior,
        "siguiente_nodo": next_nodes[0],
        "decision": "continuar",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "nota": None
    })
    
    # Ejecutar siguiente nodo en thread
    thread = threading.Thread(
        target=_run_agent_in_thread,
        args=(None,)
    )
    thread.start()
    
    return {"status": "continuando", "siguiente": next_nodes[0]}


@api.post("/api/expediente/rechazar")
def rechazar_expediente():
    """El funcionario fuerza un rechazo inmediato."""
    graph_state = _get_graph_state()
    if graph_state is None:
        raise HTTPException(status_code=404, detail="No hay expediente activo")
    
    if session.is_running:
        raise HTTPException(status_code=400, detail="Un agente esta en ejecucion")
    
    agente_anterior = "N/A"
    linea_tiempo = graph_state.values.get("linea_tiempo", [])
    if linea_tiempo:
        agente_anterior = linea_tiempo[-1].get("agente", "N/A")
    
    session.decisiones_mitl.append({
        "despues_de": agente_anterior,
        "siguiente_nodo": "redactor",
        "decision": "rechazar",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "nota": "Rechazo forzado por el funcionario supervisor."
    })
    
    # Forzar rechazo
    langgraph_app.update_state(
        session.config,
        {
            "es_rfc_valido": False,
            "alertas_sat": ["Rechazado manualmente por el funcionario supervisor."]
        }
    )
    
    thread = threading.Thread(
        target=_run_agent_in_thread,
        args=(None,)
    )
    thread.start()
    
    return {"status": "rechazando"}


@api.post("/api/expediente/editar")
def editar_expediente(data: EditInput):
    """El funcionario modifica un campo del estado."""
    graph_state = _get_graph_state()
    if graph_state is None:
        raise HTTPException(status_code=404, detail="No hay expediente activo")
    
    campos_validos = ["rfc", "curp", "nombre", "score_ml"]
    if data.campo not in campos_validos:
        raise HTTPException(status_code=400, detail=f"Campo invalido. Validos: {campos_validos}")
    
    valor = data.valor
    if data.campo == "score_ml":
        try:
            valor = float(valor)
        except ValueError:
            raise HTTPException(status_code=400, detail="Score ML debe ser un numero decimal")
    
    langgraph_app.update_state(session.config, {data.campo: valor})
    
    return {"status": "editado", "campo": data.campo, "nuevo_valor": valor}


@api.get("/api/stream")
async def stream_logs():
    """
    Server-Sent Events endpoint.
    Envia los logs de los agentes en tiempo real al frontend.
    """
    async def event_generator():
        last_timestamp = 0
        idle_count = 0
        
        while True:
            messages = agent_logger.get_new_messages(since=last_timestamp)
            
            if messages:
                idle_count = 0
                for msg in messages:
                    last_timestamp = msg["timestamp"]
                    event_data = json.dumps({
                        "msg": msg["msg"],
                        "agent": msg["agent"],
                        "type": msg["type"],
                        "timestamp": msg["timestamp"]
                    }, ensure_ascii=False)
                    yield f"data: {event_data}\n\n"
            else:
                idle_count += 1
                
                # Enviar heartbeat para mantener la conexion
                if idle_count % 10 == 0:
                    yield f"data: {json.dumps({'type': 'heartbeat'})}\n\n"
                
                # Verificar si el proceso termino
                graph_state = _get_graph_state()
                if graph_state and not session.is_running:
                    next_nodes = list(graph_state.next) if graph_state.next else []
                    if next_nodes:
                        # Hay un punto de control MITL
                        yield f"data: {json.dumps({'type': 'control_point', 'next_node': next_nodes[0]})}\n\n"
                        # Esperar decision del funcionario
                        while True:
                            await asyncio.sleep(0.5)
                            new_msgs = agent_logger.get_new_messages(since=last_timestamp)
                            if new_msgs:
                                break
                            # Verificar si se tomo una decision
                            gs = _get_graph_state()
                            if gs and session.is_running:
                                break
                            if gs and not list(gs.next or []):
                                break
                        continue
                    elif not next_nodes and not session.is_running:
                        # Proceso terminado
                        state_values = _state_to_dict(graph_state.values)
                        yield f"data: {json.dumps({'type': 'finished', 'state': state_values}, ensure_ascii=False)}\n\n"
                        return
            
            await asyncio.sleep(0.3)
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@api.get("/api/expediente/bitacora")
def obtener_bitacora():
    """Retorna la bitacora completa en formato JSON."""
    graph_state = _get_graph_state()
    if graph_state is None:
        raise HTTPException(status_code=404, detail="No hay expediente activo")
    
    state_values = _state_to_dict(graph_state.values)
    
    return {
        "expediente": {
            "folio": state_values.get("folio"),
            "rfc": state_values.get("rfc"),
            "curp": state_values.get("curp"),
            "nombre": state_values.get("nombre"),
            "score_ml": state_values.get("score_ml"),
            "resolucion_final": state_values.get("resolucion_final"),
        },
        "linea_tiempo": state_values.get("linea_tiempo", []),
        "decisiones_mitl": session.decisiones_mitl,
        "arbol_decisiones": {
            "rfc_valido": state_values.get("es_rfc_valido"),
            "alertas_sat": state_values.get("alertas_sat", []),
            "es_aprobado_auditoria": state_values.get("es_aprobado_auditoria"),
            "resolucion_final": state_values.get("resolucion_final"),
        },
        "carta_ciudadano": state_values.get("carta_ciudadano"),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(api, host="0.0.0.0", port=8000)
