import sys
import time
from datetime import datetime
from state import ExpedienteState
from tools.logger import agent_logger
from tools.sat_tools import (
    validar_rfc_completo,
    validar_estructura_curp, 
    cotejar_rfc_curp,
    consultar_curp_renapo,
    consultar_listas_negras_sat
)

AGENT_NAME = "Agente Validador (Mesa de Entrada)"


def _log(msg: str, log_type: str = "info", delay: float = 0.3):
    agent_logger.log(msg, agent=AGENT_NAME, log_type=log_type, delay=delay)


def nodo_validador(state: ExpedienteState) -> ExpedienteState:
    """
    Agente 1: Validador de Identidad y Consultas Automatizadas.
    Ejecuta 5 capas de verificacion real con salida progresiva.
    """
    rfc = state.get("rfc", "")
    curp = state.get("curp", "")
    nombre = state.get("nombre", "")
    
    _log(f"  Solicitante: {nombre}")
    _log(f"  RFC a validar: {rfc}")
    _log(f"  CURP a validar: {curp}")
    
    detalles = []
    detalles.append(f"Solicitante: {nombre}")
    detalles.append("")
    todas_las_alertas = []
    
    # -- CAPA 1: RFC --
    _log(f"  [CAPA 1/5] Validando RFC con algoritmo de digito verificador del SAT...")
    _log(f"    Extrayendo letras del nombre: {rfc[:4]}")
    _log(f"    Extrayendo fecha de nacimiento: {rfc[4:10]}")
    _log(f"    Calculando digito verificador...")
    
    resultado_rfc = validar_rfc_completo(rfc)
    rfc_valido = resultado_rfc["es_valido"]
    icon_rfc = "[OK]" if rfc_valido else "[FALLO]"
    _log(f"    Resultado: {icon_rfc} {resultado_rfc['detalles']}", log_type="ok" if rfc_valido else "fallo")
    
    detalles.append(f"CAPA 1 -- Validacion de RFC (Digito Verificador SAT)")
    detalles.append(f"  RFC: {rfc} -> {icon_rfc} {resultado_rfc['detalles']}")
    detalles.append("")
    if not rfc_valido:
        todas_las_alertas.append(f"[FALLO] RFC: {resultado_rfc['detalles']}")
    
    # -- CAPA 2: CURP --
    _log(f"  [CAPA 2/5] Validando CURP con algoritmo de digito verificador de RENAPO...")
    _log(f"    Verificando longitud (18 caracteres)...")
    _log(f"    Verificando sexo: '{curp[10] if len(curp) > 10 else '?'}'")
    _log(f"    Verificando entidad federativa: '{curp[11:13] if len(curp) > 12 else '?'}'")
    _log(f"    Calculando digito verificador...")
    
    curp_valida, detalle_curp = validar_estructura_curp(curp)
    icon_curp = "[OK]" if curp_valida else "[FALLO]"
    _log(f"    Resultado: {icon_curp} {detalle_curp}", log_type="ok" if curp_valida else "fallo")
    
    detalles.append(f"CAPA 2 -- Validacion de CURP (Digito Verificador RENAPO)")
    detalles.append(f"  CURP: {curp} -> {icon_curp} {detalle_curp}")
    detalles.append("")
    if not curp_valida:
        todas_las_alertas.append(f"[FALLO] CURP: {detalle_curp}")
    
    # -- CAPA 3: Cotejo Cruzado --
    _log(f"  [CAPA 3/5] Ejecutando cotejo cruzado RFC <-> CURP...")
    
    if rfc_valido and curp_valida:
        _log(f"    Comparando letras del nombre: RFC='{rfc[:4]}' vs CURP='{curp[:4]}'")
        _log(f"    Comparando fecha de nacimiento: RFC='{rfc[4:10]}' vs CURP='{curp[4:10]}'")
        
        es_coherente, detalles_cotejo = cotejar_rfc_curp(rfc, curp)
        for d in detalles_cotejo:
            _log(f"    {d}", log_type="ok" if es_coherente else "fallo")
        
        detalles.append(f"CAPA 3 -- Cotejo Cruzado RFC <-> CURP")
        for d in detalles_cotejo:
            detalles.append(f"  {d}")
        detalles.append("")
        if not es_coherente:
            todas_las_alertas.extend(detalles_cotejo)
    else:
        _log(f"    [OMITIDO] RFC o CURP no pasaron validacion previa.", log_type="aviso")
        es_coherente = False
        detalles.append(f"CAPA 3 -- Cotejo Cruzado RFC <-> CURP")
        detalles.append("  [OMITIDO] Cotejo omitido: RFC o CURP no pasaron validacion previa")
        detalles.append("")
    
    # -- CAPA 4: RENAPO --
    _log(f"  [CAPA 4/5] Consultando API de RENAPO para verificar existencia real...")
    
    if curp_valida:
        _log(f"    Conectando con servicio de RENAPO...")
        resultado_renapo = consultar_curp_renapo(curp)
        _log(f"    {resultado_renapo['detalles']}", log_type="ok" if resultado_renapo["encontrada"] else "aviso")
        
        detalles.append(f"CAPA 4 -- Consulta API RENAPO (Existencia real)")
        detalles.append(f"  {resultado_renapo['detalles']}")
        detalles.append("")
        
        if not resultado_renapo["encontrada"] and "no encontrada" in resultado_renapo["detalles"].lower():
            todas_las_alertas.append(resultado_renapo["detalles"])
    else:
        _log(f"    [OMITIDO] CURP no paso validacion estructural.", log_type="aviso")
        detalles.append(f"CAPA 4 -- Consulta API RENAPO (Existencia real)")
        detalles.append("  [OMITIDO] Consulta RENAPO omitida: CURP no paso validacion estructural")
        detalles.append("")
    
    # -- CAPA 5: Listas Negras SAT --
    _log(f"  [CAPA 5/5] Consultando listas negras del SAT (Art. 69-B CFF)...")
    _log(f"    Descargando/leyendo listado oficial del SAT...")
    _log(f"    Buscando RFC en lista de simulacion de operaciones...")
    _log(f"    Buscando RFC en cartera vencida de FONDESO...")
    
    alertas_sat = consultar_listas_negras_sat(rfc)
    
    detalles.append(f"CAPA 5 -- Listas Negras del SAT (Art. 69-B CFF)")
    if alertas_sat:
        for alerta in alertas_sat:
            _log(f"    {alerta}", log_type="fallo")
            detalles.append(f"  {alerta}")
        todas_las_alertas.extend(alertas_sat)
    else:
        _log(f"    [OK] Sin alertas en listas negras del SAT", log_type="ok")
        detalles.append("  [OK] Sin alertas en listas negras del SAT")
    detalles.append("")
    
    # -- DECISION FINAL --
    es_valido = rfc_valido and curp_valida and es_coherente
    tiene_alertas_sat = len(alertas_sat) > 0
    
    state["es_rfc_valido"] = es_valido and not tiene_alertas_sat
    state["alertas_sat"] = alertas_sat
    
    if state["es_rfc_valido"]:
        _log(f"  === DECISION: Expediente verificado. Recomiendo continuar al analisis financiero.", log_type="decision")
        detalles.append("=== DECISION: Expediente verificado. Recomiendo continuar al analisis financiero.")
    else:
        total = len(todas_las_alertas)
        _log(f"  === DECISION: {total} anomalia(s) detectada(s). Recomiendo RECHAZO inmediato.", log_type="decision")
        detalles.append(f"=== DECISION: {total} anomalia(s) detectada(s). Recomiendo RECHAZO inmediato.")
        for alerta in todas_las_alertas:
            _log(f"    -> {alerta}", log_type="fallo")
            detalles.append(f"  -> {alerta}")
    
    evento = {
        "agente": AGENT_NAME,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "accion": "Validacion integral de identidad fiscal (5 capas de verificacion)",
        "detalles": "\n".join(detalles)
    }
    
    if state.get("linea_tiempo") is None:
        state["linea_tiempo"] = []
    state["linea_tiempo"].append(evento)
    
    return state
