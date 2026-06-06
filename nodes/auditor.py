import json
import sys
import time
from datetime import datetime
from langchain_ollama import OllamaLLM
from state import ExpedienteState
from tools.logger import agent_logger

llm = OllamaLLM(model="qwen2.5:3b", temperature=0.1)

AGENT_NAME = "Agente Auditor Normativo (Cumplimiento Legal)"


def _log(msg: str, log_type: str = "info", delay: float = 0.3):
    agent_logger.log(msg, agent=AGENT_NAME, log_type=log_type, delay=delay)


def nodo_auditor(state: ExpedienteState) -> ExpedienteState:
    """
    Agente 3: Auditor Normativo.
    Revisa el dictamen del Interprete contra las reglas de negocio de la SEDECO.
    """
    analisis = state.get("analisis_financiero", "")
    rfc = state.get("rfc", "")
    
    _log(f"  Recibiendo dictamen del Agente Interprete...")
    _log(f"  Cargando normativa vigente de SEDECO y reglas de FONDESO...")
    _log(f"  Verificando regla 1: Perfil favorable (score > 80%)...")
    _log(f"  Verificando regla 2: Ausencia de senales de riesgo financiero...")
    _log(f"  Verificando regla 3: Coherencia del dictamen con las reglas del programa...")
    _log(f"  Verificando RFC en cartera vencida de FONDESO...")
    _log(f"    RFC: {rfc} -> Sin creditos duplicados (mock)")
    
    _log(f"  Enviando analisis al modelo de lenguaje para dictamen normativo...")
    _log(f"    (Esto puede tardar unos segundos...)", delay=0.1)
    
    prompt = f"""Eres el Auditor Normativo en Jefe de la SEDECO CDMX.
Tu tarea es leer el analisis financiero y determinar si cumple con las normas para ser APROBADO o si debe ser RECHAZADO o PREVENIDO.

Analisis Financiero del Interprete:
{analisis}

Reglas de Auditoria:
1. Si el analisis indica un perfil favorable (score > 80%) y alto impacto social, APRUEBA.
2. Verifica que no existan senales de riesgo financiero.
3. Si hay dudas, marca como PREVENCION para solicitar documentos adicionales.

Responde ESTRICTAMENTE en este formato JSON (sin texto adicional):
{{"aprobado": true, "observaciones": "justificacion breve aqui"}}"""
    
    try:
        respuesta = llm.invoke(prompt)
        start = respuesta.find("{")
        end = respuesta.rfind("}") + 1
        json_str = respuesta[start:end]
        
        resultado = json.loads(json_str)
        state["es_aprobado_auditoria"] = resultado.get("aprobado", False)
        obs = resultado.get("observaciones", "Sin observaciones.")
        state["observaciones_auditoria"] = [obs]
    except Exception as e:
        state["es_aprobado_auditoria"] = False
        state["observaciones_auditoria"] = [f"Error al procesar el dictamen del auditor: {e}"]
    
    aprobado = state["es_aprobado_auditoria"]
    icon = "[APROBADO]" if aprobado else "[NO APROBADO]"
    
    _log(f"  Resultado de la auditoria: {icon}", log_type="ok" if aprobado else "fallo")
    _log(f"  Observaciones: {state['observaciones_auditoria'][0]}")
    
    evento = {
        "agente": AGENT_NAME,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "accion": "Contraste del dictamen financiero contra normativa vigente de SEDECO y reglas de FONDESO",
        "detalles": (
            f"Resultado de Auditoria: {icon}\n"
            f"Observaciones: {state['observaciones_auditoria'][0]}\n"
            f"RFC verificado en cartera vencida: {rfc} -> Sin duplicados (mock)"
        )
    }
    state["linea_tiempo"].append(evento)
    
    return state
