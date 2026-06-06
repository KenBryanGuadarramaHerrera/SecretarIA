import sys
import time
from datetime import datetime
from langchain_ollama import OllamaLLM
from state import ExpedienteState
from tools.logger import agent_logger

llm = OllamaLLM(model="qwen2.5:3b", temperature=0.3)

AGENT_NAME = "Agente Redactor Tecnico (Mesa de Salida)"


def _log(msg: str, log_type: str = "info", delay: float = 0.3):
    agent_logger.log(msg, agent=AGENT_NAME, log_type=log_type, delay=delay)


def nodo_redactor(state: ExpedienteState) -> ExpedienteState:
    """
    Agente 4: Redactor Tecnico (Mesa de Salida).
    Genera la carta final para el ciudadano basandose en el estado acumulado.
    """
    _log(f"  Recopilando conclusiones de los agentes anteriores...")
    
    if not state.get("es_rfc_valido") or state.get("alertas_sat"):
        state["resolucion_final"] = "RECHAZADO"
        motivo = "Inconsistencias en la validacion del RFC o alertas detectadas en el SAT."
        _log(f"  Motivo de resolucion: Fallos en la validacion de identidad", log_type="fallo")
    elif state.get("es_aprobado_auditoria"):
        state["resolucion_final"] = "APROBADO"
        motivo = "Aprobado por auditoria normativa y analisis financiero favorable."
        _log(f"  Motivo de resolucion: Auditoria favorable", log_type="ok")
    else:
        state["resolucion_final"] = "RECHAZADO"
        motivo = "No supero la auditoria normativa de la SEDECO."
        _log(f"  Motivo de resolucion: Auditoria desfavorable", log_type="fallo")
    
    _log(f"  Resolucion determinada: {state['resolucion_final']}", log_type="decision")
    _log(f"  Preparando carta formal para el ciudadano...")
    _log(f"    Destinatario: {state.get('nombre')}")
    _log(f"    Folio: {state.get('folio')}")
    _log(f"  Enviando instrucciones al modelo de lenguaje...")
    _log(f"    (Esto puede tardar unos segundos...)", delay=0.1)
    
    prompt = f"""Eres el Redactor Oficial de la Secretaria de Desarrollo Economico (SEDECO) de la Ciudad de Mexico.
Escribe una carta formal dirigida a: {state.get("nombre")} (Folio: {state.get("folio")}).

Resolucion: {state.get("resolucion_final")}
Motivo Principal: {motivo}
Observaciones del Auditor: {state.get("observaciones_auditoria", [])}

Reglas de redaccion:
- La carta debe ser profesional, empatica pero firme.
- Maximo 3 parrafos.
- Firma SIEMPRE como: "Atentamente, Direccion de Evaluacion -- SEDECO CDMX".
- NO inventes nombres de personas ni uses firmas de empresas privadas."""
    
    respuesta = llm.invoke(prompt)
    state["carta_ciudadano"] = respuesta.strip()
    
    _log(f"  Carta generada exitosamente.", log_type="ok")
    _log(f"  Resolucion final: {state['resolucion_final']}", log_type="decision")
    
    evento = {
        "agente": AGENT_NAME,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "accion": f"Generacion de carta oficial con resolucion: {state['resolucion_final']}",
        "detalles": (
            f"Resolucion Final: {state['resolucion_final']}\n"
            f"Motivo: {motivo}\n"
            f"--- CARTA GENERADA ---\n{state['carta_ciudadano']}"
        )
    }
    state["linea_tiempo"].append(evento)
    
    return state
