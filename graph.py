from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from state import ExpedienteState

# Importar Nodos
from nodes.validador import nodo_validador
from nodes.interprete import nodo_interprete
from nodes.auditor import nodo_auditor
from nodes.redactor import nodo_redactor

def validador_router(state: ExpedienteState):
    """
    Ruteo Condicional después de Validar.
    Si el RFC es inválido o hay alertas, vamos directo a rechazo (Redactor).
    Si todo está bien, continuamos con el Intérprete.
    """
    if not state.get("es_rfc_valido") or state.get("alertas_sat"):
        return "redactor"
    else:
        return "interprete"

# Construir el Grafo
workflow = StateGraph(ExpedienteState)

# Añadir los Nodos
workflow.add_node("validador", nodo_validador)
workflow.add_node("interprete", nodo_interprete)
workflow.add_node("auditor", nodo_auditor)
workflow.add_node("redactor", nodo_redactor)

# Definir Aristas (Flujo)
workflow.set_entry_point("validador")

# Arista condicional desde el validador
workflow.add_conditional_edges(
    "validador",
    validador_router,
    {
        "interprete": "interprete",
        "redactor": "redactor"
    }
)

# Flujo lineal normal
workflow.add_edge("interprete", "auditor")
workflow.add_edge("auditor", "redactor")
workflow.add_edge("redactor", END)

# Checkpointer para Man-in-the-Loop (guarda estado entre pausas)
memory = MemorySaver()

# Compilar con interrupt_after en cada nodo (pausa DESPUÉS de que cada agente termina)
app = workflow.compile(
    checkpointer=memory,
    interrupt_after=["validador", "interprete", "auditor", "redactor"]
)
