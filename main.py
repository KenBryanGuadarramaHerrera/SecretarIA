import json
import os
import argparse
from datetime import datetime
from graph import app
from state import ExpedienteState

# ═══════════════════════════════════════════════════════════════
# Funciones de presentacion para la terminal
# ═══════════════════════════════════════════════════════════════

def mostrar_evento(evento: dict):
    """Muestra un evento de la linea de tiempo."""
    print(f"\n{'-' * 60}")
    print(f"  {evento['agente']}")
    print(f"  Hora: {evento['timestamp']}")
    print(f"  Accion: {evento['accion']}")
    print(f"{'-' * 60}")
    for linea in evento["detalles"].split("\n"):
        print(f"  {linea}")
    print(f"{'-' * 60}")

def mostrar_estado_actual(state: dict):
    """Muestra un resumen del estado actual del expediente."""
    print(f"\n{'=' * 60}")
    print(f"  ESTADO ACTUAL DEL EXPEDIENTE: {state.get('folio', 'N/A')}")
    print(f"{'=' * 60}")
    print(f"  Solicitante:     {state.get('nombre', 'N/A')}")
    print(f"  RFC:             {state.get('rfc', 'N/A')}")
    print(f"  RFC Valido:      {state.get('es_rfc_valido', '--')}")
    print(f"  Alertas SAT:     {state.get('alertas_sat', [])}")
    print(f"  Score ML:        {state.get('score_ml', '--')}")
    
    if state.get("analisis_financiero"):
        print(f"  Analisis:        (generado)")
    if state.get("es_aprobado_auditoria") is not None:
        aprobado = state.get("es_aprobado_auditoria")
        print(f"  Auditoria:       {'[APROBADA]' if aprobado else '[NO APROBADA]'}")
    if state.get("resolucion_final"):
        print(f"  Resolucion:      {state.get('resolucion_final')}")
    print(f"{'=' * 60}")

def solicitar_decision(siguiente_nodo: str) -> str:
    """Solicita al funcionario una decision antes de continuar."""
    nombres_nodos = {
        "interprete": "Interprete Analitico",
        "auditor": "Auditor Normativo",
        "redactor": "Redactor Tecnico",
    }
    
    nombre = nombres_nodos.get(siguiente_nodo, siguiente_nodo)
    
    print(f"\n{'*' * 60}")
    print(f"  PUNTO DE CONTROL -- Supervision Humana Obligatoria")
    print(f"{'*' * 60}")
    print(f"  El siguiente paso seria: {nombre}")
    print()
    print("  Opciones:")
    print("    [C] Continuar -> Aprobar y pasar al siguiente agente")
    print("    [R] Rechazar  -> Forzar rechazo inmediato del expediente")
    print("    [E] Editar    -> Modificar un campo del estado actual")
    print()
    
    while True:
        opcion = input("  Tu decision (C/R/E): ").strip().upper()
        if opcion in ("C", "R", "E"):
            return {"C": "continuar", "R": "rechazar", "E": "editar"}[opcion]
        print("  Opcion invalida. Escribe C, R o E.")

def editar_estado(state: dict) -> dict:
    """Permite al funcionario editar campos del estado."""
    campos_editables = {
        "1": ("rfc", "RFC"),
        "2": ("curp", "CURP"),
        "3": ("nombre", "Nombre"),
        "4": ("score_ml", "Score ML (numero decimal)"),
    }
    
    print("\n  Campos editables:")
    for k, (campo, nombre) in campos_editables.items():
        print(f"    [{k}] {nombre}: {state.get(campo, 'N/A')}")
    print("    [0] Cancelar edicion")
    
    opcion = input("\n  Que campo deseas editar? ").strip()
    
    if opcion == "0":
        return state
    
    if opcion in campos_editables:
        campo, nombre = campos_editables[opcion]
        nuevo_valor = input(f"  Nuevo valor para {nombre}: ").strip()
        
        if campo == "score_ml":
            try:
                nuevo_valor = float(nuevo_valor)
            except ValueError:
                print("  Valor invalido para score. Debe ser un numero decimal.")
                return state
        
        state[campo] = nuevo_valor
        print(f"  [OK] {nombre} actualizado a: {nuevo_valor}")
    else:
        print("  Opcion no valida.")
    
    return state


# ═══════════════════════════════════════════════════════════════
# Bitacora de decisiones (se guarda en disco por usuario/documento)
# ═══════════════════════════════════════════════════════════════

def guardar_bitacora(state: dict, decisiones_mitl: list):
    """
    Guarda la bitacora completa del expediente en disco.
    Estructura:
      bitacoras/
        <RFC>/
          <FOLIO>_<timestamp>.txt
    
    Cada archivo contiene:
    - Datos del solicitante
    - Linea de tiempo completa de cada agente
    - Decisiones del funcionario en cada punto de control
    - Resolucion final
    """
    rfc = state.get("rfc", "SIN_RFC").upper().strip()
    folio = state.get("folio", "SIN_FOLIO").replace("/", "-")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Crear directorio por RFC (usuario)
    directorio = os.path.join("bitacoras", rfc)
    os.makedirs(directorio, exist_ok=True)
    
    # Nombre del archivo por folio + timestamp
    nombre_archivo = f"{folio}_{timestamp}.txt"
    ruta_completa = os.path.join(directorio, nombre_archivo)
    
    lineas = []
    lineas.append("=" * 70)
    lineas.append("  BITACORA DE DECISIONES -- GOB-AGENTS (SEDECO CDMX)")
    lineas.append("=" * 70)
    lineas.append(f"  Fecha de generacion: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lineas.append(f"  Folio:       {state.get('folio')}")
    lineas.append(f"  RFC:         {state.get('rfc')}")
    lineas.append(f"  CURP:        {state.get('curp')}")
    lineas.append(f"  Nombre:      {state.get('nombre')}")
    lineas.append(f"  Score ML:    {state.get('score_ml')}")
    lineas.append(f"  Resolucion:  {state.get('resolucion_final', 'N/A')}")
    lineas.append("=" * 70)
    
    # Seccion 1: Linea de tiempo de agentes
    lineas.append("")
    lineas.append("  SECCION 1: LINEA DE TIEMPO DE AGENTES")
    lineas.append("-" * 70)
    
    for i, evento in enumerate(state.get("linea_tiempo", []), 1):
        lineas.append(f"")
        lineas.append(f"  PASO {i}: {evento['agente']}")
        lineas.append(f"  Hora: {evento['timestamp']}")
        lineas.append(f"  Accion: {evento['accion']}")
        lineas.append(f"  {'.' * 50}")
        for linea in evento["detalles"].split("\n"):
            lineas.append(f"    {linea}")
        lineas.append(f"  {'.' * 50}")
    
    # Seccion 2: Decisiones del funcionario (Man-in-the-Loop)
    lineas.append("")
    lineas.append("=" * 70)
    lineas.append("  SECCION 2: DECISIONES DEL FUNCIONARIO (MAN-IN-THE-LOOP)")
    lineas.append("-" * 70)
    
    if decisiones_mitl:
        for i, decision in enumerate(decisiones_mitl, 1):
            lineas.append(f"")
            lineas.append(f"  Punto de Control {i}:")
            lineas.append(f"    Despues de:     {decision['despues_de']}")
            lineas.append(f"    Siguiente nodo: {decision['siguiente_nodo']}")
            lineas.append(f"    Decision:       {decision['decision'].upper()}")
            lineas.append(f"    Hora:           {decision['timestamp']}")
            if decision.get("nota"):
                lineas.append(f"    Nota:           {decision['nota']}")
    else:
        lineas.append("  (Sin puntos de control registrados)")
    
    # Seccion 3: Rama de decisiones (arbol resumido)
    lineas.append("")
    lineas.append("=" * 70)
    lineas.append("  SECCION 3: RAMA DE DECISIONES (ARBOL DE FLUJO)")
    lineas.append("-" * 70)
    lineas.append("")
    
    # Construir arbol de decisiones
    rfc_valido = state.get("es_rfc_valido")
    alertas = state.get("alertas_sat", [])
    aprobado_auditoria = state.get("es_aprobado_auditoria")
    resolucion = state.get("resolucion_final", "N/A")
    
    lineas.append("  [INICIO] Expediente recibido")
    lineas.append("    |")
    lineas.append("    v")
    lineas.append(f"  [VALIDADOR] RFC valido? {'SI' if rfc_valido else 'NO'}")
    
    if not rfc_valido or alertas:
        lineas.append("    |-- NO --> [REDACTOR] Generar carta de RECHAZO")
        if alertas:
            for a in alertas:
                lineas.append(f"    |          Motivo: {a}")
        lineas.append(f"    |")
        lineas.append(f"    v")
        lineas.append(f"  [FIN] Resolucion: {resolucion}")
    else:
        lineas.append("    |-- SI")
        lineas.append("    v")
        lineas.append(f"  [INTERPRETE] Score ML: {state.get('score_ml', 0) * 100:.1f}%")
        lineas.append("    |")
        lineas.append("    v")
        lineas.append(f"  [AUDITOR] Aprobado? {'SI' if aprobado_auditoria else 'NO'}")
        
        if aprobado_auditoria:
            lineas.append("    |-- SI --> [REDACTOR] Generar carta de APROBACION")
        else:
            lineas.append("    |-- NO --> [REDACTOR] Generar carta de RECHAZO")
        
        obs = state.get("observaciones_auditoria", [])
        if obs:
            lineas.append(f"    |          Observacion: {obs[0]}")
        
        lineas.append(f"    |")
        lineas.append(f"    v")
        lineas.append(f"  [FIN] Resolucion: {resolucion}")
    
    # Seccion 4: Carta generada
    lineas.append("")
    lineas.append("=" * 70)
    lineas.append("  SECCION 4: CARTA GENERADA PARA EL CIUDADANO")
    lineas.append("-" * 70)
    lineas.append("")
    carta = state.get("carta_ciudadano", "No generada.")
    for linea_carta in carta.split("\n"):
        lineas.append(f"  {linea_carta}")
    
    lineas.append("")
    lineas.append("=" * 70)
    lineas.append("  FIN DE BITACORA")
    lineas.append("=" * 70)
    
    # Escribir archivo
    contenido = "\n".join(lineas)
    with open(ruta_completa, "w", encoding="utf-8") as f:
        f.write(contenido)
    
    return ruta_completa


# ═══════════════════════════════════════════════════════════════
# Flujo principal con Man-in-the-Loop
# ═══════════════════════════════════════════════════════════════

def run_expediente(filepath: str):
    print(f"\n  Cargando expediente desde: {filepath}")
    
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    initial_state = ExpedienteState(
        folio=data.get("folio", ""),
        rfc=data.get("rfc", ""),
        curp=data.get("curp", ""),
        nombre=data.get("nombre", ""),
        score_ml=data.get("score_ml", 0.0),
        datos_geograficos=data.get("datos_geograficos", {}),
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
    
    print(f"\n{'=' * 60}")
    print(f"  GOB-AGENTS -- SEDECO CDMX")
    print(f"  Sistema Multiagente con Supervision Humana Obligatoria")
    print(f"{'=' * 60}")
    print(f"  Folio: {initial_state['folio']}")
    print(f"  Solicitante: {initial_state['nombre']}")
    print(f"  RFC: {initial_state['rfc']}")
    print(f"{'=' * 60}\n")
    
    config = {"configurable": {"thread_id": initial_state["folio"]}}
    
    # Registro de decisiones MITL para la bitacora
    decisiones_mitl = []
    
    # Primera ejecucion: corre el Validador y se pausa
    print("  Ejecutando Agente Validador...")
    resultado = app.invoke(initial_state, config)
    
    # Loop de Man-in-the-Loop
    while True:
        graph_state = app.get_state(config)
        current_values = graph_state.values
        
        # Mostrar el ultimo evento de la linea de tiempo
        if current_values.get("linea_tiempo"):
            ultimo_evento = current_values["linea_tiempo"][-1]
            mostrar_evento(ultimo_evento)
        
        mostrar_estado_actual(current_values)
        
        # Verificar si el grafo ya termino
        next_nodes = graph_state.next
        if not next_nodes:
            print("\n  El proceso ha finalizado.")
            break
        
        siguiente = next_nodes[0]
        agente_anterior = current_values["linea_tiempo"][-1]["agente"] if current_values.get("linea_tiempo") else "N/A"
        
        decision = solicitar_decision(siguiente)
        
        # Registrar decision para la bitacora
        registro_decision = {
            "despues_de": agente_anterior,
            "siguiente_nodo": siguiente,
            "decision": decision,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "nota": None
        }
        
        if decision == "rechazar":
            print("\n  Funcionario decidio RECHAZAR el expediente.")
            registro_decision["nota"] = "Rechazo forzado por el funcionario supervisor."
            decisiones_mitl.append(registro_decision)
            
            app.update_state(
                config,
                {
                    "es_rfc_valido": False,
                    "alertas_sat": ["Rechazado manualmente por el funcionario supervisor."]
                }
            )
            print("  Ejecutando siguiente agente...")
            resultado = app.invoke(None, config)
            
        elif decision == "editar":
            cambios = editar_estado(dict(current_values))
            update_dict = {}
            for key in ["rfc", "curp", "nombre", "score_ml"]:
                if cambios.get(key) != current_values.get(key):
                    update_dict[key] = cambios[key]
            if update_dict:
                app.update_state(config, update_dict)
                print("  [OK] Estado actualizado en el grafo.")
                registro_decision["nota"] = f"Campos editados: {list(update_dict.keys())}"
            decisiones_mitl.append(registro_decision)
            continue
            
        else:
            decisiones_mitl.append(registro_decision)
            print(f"\n  Ejecutando siguiente agente...")
            resultado = app.invoke(None, config)
    
    # ═══════════════════════════════════════════════════════════════
    # Resumen final
    # ═══════════════════════════════════════════════════════════════
    final_state = app.get_state(config).values
    
    print(f"\n{'=' * 60}")
    print(f"  LINEA DE TIEMPO COMPLETA DEL EXPEDIENTE")
    print(f"{'=' * 60}")
    for i, evento in enumerate(final_state.get("linea_tiempo", []), 1):
        print(f"\n  Paso {i}:")
        mostrar_evento(evento)
    
    # Mostrar rama de decisiones en terminal
    print(f"\n{'=' * 60}")
    print(f"  RAMA DE DECISIONES (ARBOL DE FLUJO)")
    print(f"{'=' * 60}")
    _mostrar_rama_terminal(final_state)
    
    print(f"\n{'=' * 60}")
    print(f"  RESULTADO FINAL DEL TRAMITE")
    print(f"{'=' * 60}")
    print(f"  Folio:       {final_state.get('folio')}")
    print(f"  Nombre:      {final_state.get('nombre')}")
    print(f"  Resolucion:  {final_state.get('resolucion_final')}")
    print(f"{'-' * 60}")
    print(f"  CARTA PARA EL CIUDADANO:\n")
    print(f"  {final_state.get('carta_ciudadano', 'No generada.')}")
    print(f"\n{'=' * 60}")
    
    # Guardar bitacora en disco
    ruta = guardar_bitacora(final_state, decisiones_mitl)
    print(f"\n  [BITACORA] Archivo guardado en: {ruta}")
    print(f"  La bitacora contiene la linea de tiempo completa,")
    print(f"  las decisiones del funcionario y la rama de decisiones.\n")


def _mostrar_rama_terminal(state: dict):
    """Muestra el arbol de decisiones en la terminal."""
    rfc_valido = state.get("es_rfc_valido")
    alertas = state.get("alertas_sat", [])
    aprobado = state.get("es_aprobado_auditoria")
    resolucion = state.get("resolucion_final", "N/A")
    
    print("")
    print("  [INICIO] Expediente recibido")
    print("    |")
    print("    v")
    print(f"  [VALIDADOR] RFC valido? {'SI' if rfc_valido else 'NO'}")
    
    if not rfc_valido or alertas:
        print("    |-- NO --> [REDACTOR] Generar carta de RECHAZO")
        print(f"    v")
        print(f"  [FIN] Resolucion: {resolucion}")
    else:
        print("    |-- SI")
        print("    v")
        print(f"  [INTERPRETE] Score ML: {state.get('score_ml', 0) * 100:.1f}%")
        print("    |")
        print("    v")
        print(f"  [AUDITOR] Aprobado? {'SI' if aprobado else 'NO'}")
        if aprobado:
            print("    |-- SI --> [REDACTOR] Generar carta de APROBACION")
        else:
            print("    |-- NO --> [REDACTOR] Generar carta de RECHAZO")
        print(f"    v")
        print(f"  [FIN] Resolucion: {resolucion}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="GOB-AGENTS: Sistema Multiagente SEDECO CDMX")
    parser.add_argument("--file", type=str, default="data/mock_expediente.json", help="Ruta al JSON del expediente")
    args = parser.parse_args()
    
    run_expediente(args.file)
