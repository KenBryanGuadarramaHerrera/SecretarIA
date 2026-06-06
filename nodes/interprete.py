import sys
import time
from datetime import datetime
from langchain_ollama import OllamaLLM
from state import ExpedienteState
from tools.logger import agent_logger

llm = OllamaLLM(model="qwen2.5:3b", temperature=0.2)

AGENT_NAME = "Agente Interprete Analitico (Puente ML)"


def _log(msg: str, log_type: str = "info", delay: float = 0.3):
    agent_logger.log(msg, agent=AGENT_NAME, log_type=log_type, delay=delay)


def nodo_interprete(state: ExpedienteState) -> ExpedienteState:
    """
    Agente 2: Interprete Analitico.
    Toma el score ML y genera un dictamen financiero en lenguaje natural.
    """
    score = state.get("score_ml", 0.0)
    datos_geo = state.get("datos_geograficos", {})
    alcaldia = datos_geo.get("alcaldia", "N/A")
    marginacion = datos_geo.get("marginacion", "N/A")
    
    _log(f"  Recibiendo datos del modelo predictivo de Machine Learning...")
    _log(f"    Score de probabilidad de exito: {score * 100:.1f}%")
    _log(f"    Alcaldia del solicitante: {alcaldia}")
    _log(f"    Nivel de marginacion: {marginacion}")
    
    _log(f"  Evaluando umbral de viabilidad (>80% = favorable)...")
    if score > 0.80:
        _log(f"    Resultado: Score FAVORABLE ({score * 100:.1f}% > 80%)", log_type="ok")
    elif score > 0.50:
        _log(f"    Resultado: Score MEDIO ({score * 100:.1f}%) - requiere analisis detallado", log_type="aviso")
    else:
        _log(f"    Resultado: Score DESFAVORABLE ({score * 100:.1f}% < 50%)", log_type="fallo")
    
    _log(f"  Ponderando factores de equidad social y zona de marginacion...")
    _log(f"  Enviando contexto al modelo de lenguaje local (Ollama)...")
    _log(f"  Generando dictamen financiero en lenguaje natural...")
    _log(f"    (Esto puede tardar unos segundos...)", delay=0.1)
    
    prompt = f"""Eres un analista financiero experto de la Secretaria de Desarrollo Economico de la Ciudad de Mexico (SEDECO CDMX).
Analiza el siguiente perfil y genera un breve dictamen financiero (maximo 3 parrafos).

Datos:
- Score predictivo de Machine Learning: {score * 100:.1f}% de probabilidad de exito comercial.
- Alcaldia: {alcaldia}
- Nivel de Marginacion: {marginacion}

Instrucciones:
- Si el score es mayor a 80%, consideralo favorable.
- Toma en cuenta el nivel de marginacion para justificar el apoyo social segun las reglas de FONDESO.
- Responde UNICAMENTE con el dictamen, sin saludos ni firmas."""
    
    respuesta = llm.invoke(prompt)
    state["analisis_financiero"] = respuesta.strip()
    
    _log(f"  Dictamen financiero generado exitosamente.", log_type="ok")
    
    evento = {
        "agente": AGENT_NAME,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "accion": "Interpretacion del score predictivo de ML y generacion de dictamen financiero",
        "detalles": (
            f"Score ML recibido: {score * 100:.1f}%\n"
            f"Alcaldia: {alcaldia} | Marginacion: {marginacion}\n"
            f"--- DICTAMEN GENERADO ---\n{state['analisis_financiero']}"
        )
    }
    state["linea_tiempo"].append(evento)
    
    return state
