from typing import TypedDict, Optional, Dict, List, Any

# State (Estado del Capturador de Viabilidad)
class ExpedienteState(TypedDict):
    # Mensajes de la conversación actual
    messages: List[Dict[str, str]]   # [{'role': 'user'|'assistant', 'content': str}]
    
    # Datos estructurados del negocio extraídos por la IA
    business_details: Dict[str, Any]
    # Estructura interna de business_details:
    # {
    #     "titulo": Optional[str],
    #     "giro": Optional[str],
    #     "descripcion": Optional[str],
    #     "ubicacion": Optional[str],
    #     "productos_servicios": Optional[str],
    #     "cantidad_trabajadores": Optional[int],
    #     "extension_m2": Optional[int]
    # }
    
    # Errores de validación activos (direcciones fuera de México, cifras inválidas, groserías)
    errors: List[str]
    
    # Determina si el flujo está completo y validado
    validated: bool

