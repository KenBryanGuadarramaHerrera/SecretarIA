from typing import TypedDict, Optional, Dict, List

# State (Estado del Expediente)
class ExpedienteState(TypedDict):
    # Datos de entrada (Mocks)
    folio: str
    rfc: str
    curp: str
    nombre: str
    score_ml: Optional[float]           # Ej: 0.85 (85% probabilidad de éxito)
    datos_geograficos: Dict[str, str]   # Ej: {"alcaldia": "Iztapalapa", "marginacion": "Alta"}
    
    # Datos generados por el Validador
    es_rfc_valido: Optional[bool]
    alertas_sat: List[str]
    
    # Datos generados por el Intérprete Analítico
    analisis_financiero: Optional[str]
    
    # Datos generados por el Auditor Normativo
    es_aprobado_auditoria: Optional[bool]
    observaciones_auditoria: List[str]
    
    # Resoluciones Finales
    resolucion_final: Optional[str]     # "APROBADO", "PREVENCION", "RECHAZADO"
    minuta_interna: Optional[str]
    carta_ciudadano: Optional[str]
    
    # Línea de tiempo interactiva (XAI - Explicabilidad)
    linea_tiempo: List[Dict[str, str]]
