from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from state import ExpedienteState

# Importar Nodo
from nodes.agent_viabilidad import nodo_agente_viabilidad

# Construir el Grafo
workflow = StateGraph(ExpedienteState)

# Añadir los Nodos
workflow.add_node("agent_viabilidad", nodo_agente_viabilidad)

# Definir Aristas (Flujo)
workflow.set_entry_point("agent_viabilidad")
workflow.add_edge("agent_viabilidad", END)

# Checkpointer para guardar estado
memory = MemorySaver()

# Compilar
app = workflow.compile(
    checkpointer=memory
)

