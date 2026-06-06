import json
import re
import os
import unicodedata
from langchain_groq import ChatGroq
from state import ExpedienteState

# Cargar el modelo ultra rápido en la nube de Groq (Llama 3.3 70B)
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.3
)

# Lista extendida de groserías en español (principalmente mexicano) para validación robusta
PROFANITIES = [
    "wey", "guey", "güey", "puto", "puta", "putos", "putas", "putis", "pendejo", "pendeja", 
    "pendejos", "pendejas", "pendejada", "pendejadas", "pendejez", "cabron", "cabrón", 
    "cabrones", "cabrona", "cabronas", "mierda", "mierdas", "mierdero", "mierdilla", 
    "verga", "vergas", "culero", "culera", "culeros", "culeras", "chinga", "chingar", 
    "chingon", "chingón", "chingada", "chingado", "chingaderas", "chingadera", "chingaquedito",
    "pinche", "pinches", "mamon", "mamón", "mamona", "mamones", "mamonas", "jodido", 
    "jodida", "joder", "madrazo", "madrazos", "putazo", "putazos", "zorra", "zorras",
    "maricon", "maricón", "maricones", "naco", "naca", "nacos", "nacas", "orto", 
    "ojete", "ojetes", "pendejear", "pichar", "puñeta", "puñetas", "puñal", "puñales"
]

def contains_profanity(text: str) -> bool:
    if not text:
        return False
    # Normalizar para eliminar acentos
    text_clean = "".join(c for c in unicodedata.normalize('NFD', text) if unicodedata.category(c) != 'Mn').lower()
    # Limpiar signos de puntuación comunes
    text_clean = re.sub(r'[.,;:!?¡¿"\'\(\)\-]', ' ', text_clean)
    words = text_clean.split()
    
    for word in PROFANITIES:
        word_clean = "".join(c for c in unicodedata.normalize('NFD', word) if unicodedata.category(c) != 'Mn').lower()
        if word_clean in words:
            return True
        for w in words:
            if len(word_clean) > 4 and word_clean in w:
                return True
    return False

def nodo_agente_viabilidad(state: ExpedienteState) -> ExpedienteState:
    """
    Agente Conversacional para Captura de Viabilidad.
    Analiza la conversación, extrae los detalles del negocio en JSON,
    valida coherencia, y genera una respuesta casual.
    """
    # Inicializar campos si no existen
    if "business_details" not in state or not state["business_details"]:
        state["business_details"] = {
            "titulo": None,
            "giro": None,
            "descripcion": None,
            "ubicacion": None,
            "productos_servicios": None,
            "cantidad_trabajadores": None,
            "extension_m2": None
        }
    if "errors" not in state:
        state["errors"] = []
    if "validated" not in state:
        state["validated"] = False

    # Preparar el historial de chat para el prompt
    chat_history = ""
    for msg in state["messages"]:
        role_label = "Usuario" if msg["role"] == "user" else "Agente"
        chat_history += f"{role_label}: {msg['content']}\n"

    # Detalles que ya tenemos capturados
    current_details = state["business_details"]

    system_prompt = f"""Eres un asesor experto de la Secretaría de Desarrollo Económico de la Ciudad de México (SEDECO CDMX).
Tu objetivo es guiar al emprendedor de forma profesional, atenta y respetuosa, manteniendo un tono formal (dirigiéndote siempre al usuario como "usted").
Evita el lenguaje demasiado burocrático o rígido, pero bajo ninguna circunstancia uses modismos informales o expresiones coloquiales (como "qué onda", "hola amigo", etc.).
La conversación debe ser natural y fluida, solicitando la información de manera ordenada en lugar de parecer un cuestionario o formulario estático.

Debes extraer y validar los siguientes campos:
1. titulo (Nombre o título del negocio)
2. giro (Giro o sector general del negocio. DEBES normalizarlo y simplificarlo a categorías amplias y estándares. Por ejemplo: si el usuario dice 'bar de micheladas' o 'local de alitas y chelas', el giro debe ser simplemente 'Bar'; si dice 'tienda de refrescos/bebidas/galletas/papas', el giro debe ser 'Miscelánea'; si dice 'cafetería con postres', el giro es 'Cafetería'; si vende ropa usada o vintage, el giro es 'Boutique / Ropa'; si es reparación de bicis/motos/autos, es 'Taller'. Nunca uses nombres específicos largos o descriptivos.)
3. descripcion (Descripción de qué trata)
4. ubicacion (Ubicación específica del negocio. Debe ser una zona, alcaldía, colonia o dirección específica dentro de la Ciudad de México (CDMX). Si el usuario sólo dice de forma vaga o general 'CDMX' o 'Ciudad de México', NO lo consideres válido, mantén este campo como null, y pídele amablemente que especifique una alcaldía, colonia o zona concreta.)
5. productos_servicios (Qué productos o servicios venderá)
6. cantidad_trabajadores (Cantidad de trabajadores/colaboradores. Debe ser un número realista: entre 1 y 500. Si es 0 o mayor a 500, o cifras absurdas, indícalo como error)
7. extension_m2 (Extensión o tamaño físico del local comercial en metros cuadrados - m2. Debe ser una cifra realista: entre 2 y 5000 m2. Si es 0 o mayor a 5000, indícalo como error)

Valores actuales ya extraídos:
- titulo: {current_details.get('titulo')}
- giro: {current_details.get('giro')}
- descripcion: {current_details.get('descripcion')}
- ubicacion: {current_details.get('ubicacion')}
- productos_servicios: {current_details.get('productos_servicios')}
- cantidad_trabajadores: {current_details.get('cantidad_trabajadores')}
- extension_m2: {current_details.get('extension_m2')}

Analiza la conversación y actualiza los valores si el usuario ha proporcionado nueva información.
Además, valida que:
- No haya palabras altisonantes, groserías o lenguaje inapropiado.
- La ubicación corresponda a México/CDMX.
- La cantidad de trabajadores sea una cifra coherente (1 a 500).
- La extensión en m2 sea una cifra coherente (2 a 5000).

Debes responder estrictamente en formato JSON con la siguiente estructura. No agregues texto fuera del JSON:
{{
  "extracted_details": {{
    "titulo": "nombre o null si no se conoce",
    "giro": "giro/sector general normalizado (ej. Bar, Miscelánea, Cafetería, Boutique / Ropa, Taller, etc.) o null si no se conoce",
    "descripcion": "descripción o null si no se conoce",
    "ubicacion": "ubicación específica (ej. Coyoacán, Polanco, Centro Histórico) o null si no se conoce o es demasiado vaga como 'CDMX'",
    "productos_servicios": "productos/servicios o null si no se conoce",
    "cantidad_trabajadores": número entero o null si no se conoce o es inválido,
    "extension_m2": número entero o null si no se conoce o es inválido
  }},
  "validation_errors": ["lista de mensajes de error de validación, o vacío si todo es correcto"],
  "assistant_response": "Tu respuesta conversacional al usuario. Debe ser muy breve y concisa (máximo 1 o 2 oraciones) y redactada de manera formal y respetuosa (dirigiéndose siempre de 'usted'). Si faltan datos, solicítelos de forma atenta, uno por uno. Si hay un error de validación, explíquelo de forma respetuosa y pídale amablemente que aclare el dato. Si ya tiene todo completo, infórmele con cortesía que la información está lista y pídale que la valide en la pantalla de resumen."
}}

Historial de conversación:
{chat_history}

Salida JSON:"""

    try:
        res_obj = llm.invoke(system_prompt)
        response = res_obj.content.strip() if hasattr(res_obj, "content") else res_obj.strip()
        # Intentar parsear el JSON
        # A veces el LLM puede incluir bloques de código de markdown como ```json ... ```
        match = re.search(r'\{.*\}', response, re.DOTALL)
        if match:
            json_str = match.group(0)
        else:
            json_str = response

        data = json.loads(json_str)
        
        # Guardar detalles extraídos
        extracted = data.get("extracted_details", {})
        errors = data.get("validation_errors", [])
        
        # Verificar si el último mensaje del usuario contiene lenguaje inapropiado
        user_messages = [m["content"] for m in state["messages"] if m["role"] == "user"]
        has_profanity_in_message = False
        if user_messages:
            last_user_msg = user_messages[-1]
            if contains_profanity(last_user_msg):
                has_profanity_in_message = True
                errors.append("Se detectó lenguaje inapropiado. Por favor, usa un lenguaje profesional.")

        for key in ["titulo", "giro", "descripcion", "ubicacion", "productos_servicios", "cantidad_trabajadores", "extension_m2"]:
            val = extracted.get(key)
            if val is not None:
                val_str = str(val)
                # Si el valor o el mensaje contiene groserías, no lo guardamos y limpiamos el campo
                if contains_profanity(val_str) or has_profanity_in_message:
                    if contains_profanity(val_str):
                        errors.append("Se detectó lenguaje inapropiado en los datos ingresados.")
                    state["business_details"][key] = None
                    continue
                
                # Si el LLM retorna un placeholder o la cadena "null"/"none", tratarlo como None
                if isinstance(val, str) and val.strip().lower() in ["null", "none", "n/a", "esperando...", "esperando", "no se conoce", "sin especificar"]:
                    state["business_details"][key] = None
                else:
                    state["business_details"][key] = val

        # Validar cantidad de trabajadores de forma explícita
        workers = state["business_details"].get("cantidad_trabajadores")
        if workers is not None:
            try:
                workers_int = int(workers)
                if workers_int <= 0 or workers_int > 500:
                    errors.append("La cantidad de trabajadores debe ser una cifra realista (entre 1 y 500).")
            except (ValueError, TypeError):
                errors.append("La cantidad de trabajadores debe ser un número entero válido.")

        # Validar extensión en m2 de forma explícita
        m2 = state["business_details"].get("extension_m2")
        if m2 is not None:
            try:
                m2_int = int(m2)
                if m2_int < 2 or m2_int > 5000:
                    errors.append("La extensión en metros cuadrados (m2) debe ser una cifra realista (entre 2 y 5000 m2).")
            except (ValueError, TypeError):
                errors.append("La extensión en metros cuadrados debe ser un número entero válido.")

        state["errors"] = list(set(errors)) # Evitar duplicados

        # Determinar si está listo (todos los campos capturados y sin errores)
        details = state["business_details"]
        if (details.get("titulo") and details.get("giro") and details.get("descripcion") and 
            details.get("ubicacion") and details.get("productos_servicios") and 
            details.get("cantidad_trabajadores") is not None and 
            details.get("extension_m2") is not None and not state["errors"]):
            state["validated"] = True
            # Forzar mensaje de confirmación
            state["messages"].append({
                "role": "assistant",
                "content": "¡Excelente! He recopilado toda la información necesaria de tu negocio, incluyendo el giro y el tamaño en m2. Por favor, revisa el resumen a continuación para confirmar que todo sea correcto."
            })
        else:
            state["validated"] = False
            state["messages"].append({
                "role": "assistant",
                "content": data.get("assistant_response", "Cuéntame más sobre tu negocio para poder ayudarte.")
            })

    except Exception as e:
        # Fallback si falla el parseo de Ollama
        state["messages"].append({
            "role": "assistant",
            "content": f"Entendido. Cuéntame más detalles sobre tu negocio, como su ubicación o cuántas personas trabajarán contigo."
        })
    
    return state
