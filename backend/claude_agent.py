import os
import json
import re
import requests

def find_best_giro_match(giro_conversational: str) -> dict:
    """
    Looks up in src/radar_demo/catalogoGiros.js for the best matching giro
    based on the conversational input.
    """
    default_giro = {
        "clave": "722515",
        "clasificacion": "Cafeterías, fuentes de sodas, neverías y refresquerías (Bajo Impacto)",
        "categoria": "comercio",
        "condicion": "cafeteria soda neveria"
    }
    if not giro_conversational:
        return default_giro
    
    # Load all giros
    giros = []
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    path = os.path.join(base_dir, "src", "radar_demo", "catalogoGiros.js")
    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        start = content.find("[")
        end = content.find("];", start)
        if start != -1 and end != -1:
            array_str = content[start:end] + "]"
            # Clean comments and commas
            array_str = re.sub(r'//.*', '', array_str)
            array_str = re.sub(r',\s*\]', ']', array_str)
            array_str = re.sub(r',\s*\}', '}', array_str)
            giros = json.loads(array_str)
    except Exception as e:
        print(f"Error loading catalogoGiros.js in find_best_giro_match: {e}")

    search_term = str(giro_conversational).lower()
    
    # 1. Exact match on Clave if user passed a code
    for g in giros:
        if g.get("clave") == search_term:
            return g

    # 2. Match in 'condicion'
    for g in giros:
        cond = g.get("condicion", "").lower()
        if any(word in cond for word in search_term.split() if len(word) > 3):
            return g

    # 3. Match in 'clasificacion'
    for g in giros:
        clas = g.get("clasificacion", "").lower()
        if any(word in clas for word in search_term.split() if len(word) > 3):
            return g

    # 4. Fallbacks based on common words
    if any(k in search_term for k in ["cantina", "bar", "cerveza", "cheleria", "alcohol", "bebida"]):
        return {
            "clave": "722412",
            "clasificacion": "Cantinas, bares, cervecerías y chelerías (Impacto Zonal/Vecinal)",
            "categoria": "bar",
            "condicion": "bar cantina cheleria cerveceria"
        }
    if any(k in search_term for k in ["antro", "discoteca", "club nocturno"]):
        return {
            "clave": "722411",
            "clasificacion": "Antros, discotecas y clubes nocturnos (Impacto Zonal)",
            "categoria": "antro",
            "condicion": "discoteca antro club nocturno"
        }
    if "farmacia" in search_term or "medicamento" in search_term:
        return {
            "clave": "464111",
            "clasificacion": "Farmacias y droguerías con venta de medicamentos (Salud)",
            "categoria": "farmacia",
            "condicion": "farmacia drogueria"
        }
    if "restaurante" in search_term:
        return {
            "clave": "722511",
            "clasificacion": "Restaurantes con venta de bebidas alcohólicas (Impacto Vecinal)",
            "categoria": "restaurante",
            "condicion": "restaurante  bebidas alcoholicas"
        }
    if any(k in search_term for k in ["salon", "fiesta", "evento"]):
        return {
            "clave": "711310",
            "clasificacion": "Salones de fiesta y de eventos (Impacto Vecinal)",
            "categoria": "salon",
            "condicion": "salon fiestas eventos"
        }

    return default_giro


def run_merge_agent(business_details: dict, user_rfc: str = "") -> dict:
    """
    Invokes Claude to merge the conversational business details with rules in TMP folder
    (datos1.json, datos2.json, datos3.json) and outputs structured data for the dashboard.
    If Claude is unavailable or errors, evaluates rules deterministically in Python.
    """
    # Load environment variables
    api_key = os.getenv("ANTHROPIC_API_KEY")

    # Match the giro first using catalogoGiros.js
    conversational_giro = business_details.get("giro", "")
    giro_match = find_best_giro_match(conversational_giro)
    
    # Paths to JSON files in TMP
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    tmp_dir = os.path.join(base_dir, "TMP")
    
    path_datos1 = os.path.join(tmp_dir, "datos1.json")
    path_datos2 = os.path.join(tmp_dir, "datos2.json")
    path_datos3 = os.path.join(tmp_dir, "datos3.json")
    
    # Read rule files
    try:
        with open(path_datos1, "r", encoding="utf-8") as f:
            datos1 = json.load(f)
    except Exception as e:
        datos1 = {}

    try:
        with open(path_datos2, "r", encoding="utf-8") as f:
            datos2 = json.load(f)
    except Exception as e:
        datos2 = {}

    try:
        with open(path_datos3, "r", encoding="utf-8") as f:
            datos3 = json.load(f)
    except Exception as e:
        datos3 = {}

    # Define a local evaluator to build the perfect, consistent response structure
    def compute_local_eval() -> dict:
        alcaldia = business_details.get("ubicacion") or "Cuauhtémoc"
        # Standardize alcaldia name
        alcaldias_validas = ["Cuauhtémoc", "Miguel Hidalgo", "Benito Juárez", "Coyoacán"]
        alcaldia_matched = next((a for a in alcaldias_validas if a.lower() in alcaldia.lower()), "Cuauhtémoc")
        
        zona_map = {
            "Cuauhtémoc": "Roma Norte",
            "Miguel Hidalgo": "Polanco",
            "Benito Juárez": "Del Valle",
            "Coyoacán": "Coyoacán Centro"
        }
        zona_matched = zona_map.get(alcaldia_matched, "Roma Norte")

        # Determine features
        superficie = 60
        try:
            superficie = int(business_details.get("extension_m2") or 60)
        except:
            pass
        
        aforo = 20
        try:
            aforo = int(business_details.get("aforo") or (superficie // 3))
        except:
            pass

        trabajadores = 1
        try:
            trabajadores = int(business_details.get("cantidad_trabajadores") or 1)
        except:
            pass

        # Checkboxes / details
        venta_alcohol = any(k in str(business_details.get("giro", "")).lower() or k in giro_match.get("condicion", "")
                            for k in ["bar", "cantina", "cerveza", "cheleria", "alcohol", "bebida", "antro", "discoteca", "salon"])
        
        fResp = "proteger" in str(business_details.get("descripcion", "")).lower() or trabajadores > 3
        fInvExt = "financiamiento" in str(business_details.get("descripcion", "")).lower() or "socio" in str(business_details.get("descripcion", "")).lower()
        
        # Figura legal
        socios = 1 if not fInvExt else 2
        inversion = "media"
        if superficie > 150:
            inversion = "alta"
        elif superficie < 40:
            inversion = "baja"

        # Determine category for mapping rules
        cat = giro_match.get("categoria", "servicios")
        if cat in ["bar", "antro", "restaurante", "salon"]:
            giro_cat = "impacto_vecinal"
        elif cat in ["farmacia", "salud"]:
            giro_cat = "salud_o_sanitario"
        else:
            giro_cat = "bajo_impacto"

        # Score computation
        score = 90
        razones = []
        sugerencias = []

        # 1. Renta
        rentas = {"Cuauhtémoc": 25000, "Miguel Hidalgo": 35000, "Benito Juárez": 28000, "Coyoacán": 20000}
        renta_est = rentas.get(alcaldia_matched, 15000)
        if inversion == "baja" and renta_est > 22000:
            score -= 15
            razones.append({
                "agente": "Agente de Mercado",
                "texto": f"Rentas elevadas en {alcaldia_matched} (${renta_est.toLocaleString('es-MX') if hasattr(renta_est, 'toLocaleString') else renta_est}/mes) para un presupuesto de inversión bajo.",
                "tipo": "media"
            })
            sugerencias.append("Considera reubicar en una zona con rentas más bajas o incrementa la inversión de capital inicial.")

        # 2. Alcohol
        if venta_alcohol:
            score -= 20
            razones.append({
                "agente": "Agente Normativo (SEDUVI)",
                "texto": "El giro requiere Licencia de Funcionamiento de Establecimiento Mercantil de Impacto Zonal para venta de alcohol.",
                "tipo": "media"
            })
            sugerencias.append("Asegúrate de no ubicarte a menos de 300 metros de escuelas o templos (restricción de distancia).")

        # Compile documents
        documentos_lista = []
        
        # Base Persona Fisica vs Moral
        is_moral = socios > 1 or fResp or fInvExt or inversion == "alta"
        fig_title = "Persona Moral: S.A. de C.V." if is_moral else "Persona Física con Actividad Empresarial"
        fig_regimen = "Régimen General de Ley" if is_moral else "RESICO (Régimen Simplificado de Confianza)"

        # Load from datos3.json rules if possible
        if datos3 and "reglas_base" in datos3:
            for rb in datos3["reglas_base"]:
                # Check condition
                cond = rb.get("condicion", {})
                val = cond.get("valor")
                if val == "Persona Física" and not is_moral:
                    for doc in rb.get("documentos_requeridos", []):
                        # skip if conditional has tiene_empleados and we don't have employees
                        cond_spec = doc.get("condicional_especifica")
                        if cond_spec and cond_spec.get("variable") == "tiene_empleados" and trabajadores <= 0:
                            continue
                        documentos_lista.append({
                            "id": doc.get("id"),
                            "nombre": doc.get("nombre"),
                            "institucion": doc.get("institucion"),
                            "detalles": doc.get("detalles") or ""
                        })
                elif val == "Persona Moral" and is_moral:
                    for doc in rb.get("documentos_requeridos", []):
                        cond_spec = doc.get("condicional_especifica")
                        if cond_spec and cond_spec.get("variable") == "tiene_empleados" and trabajadores <= 0:
                            continue
                        documentos_lista.append({
                            "id": doc.get("id"),
                            "nombre": doc.get("nombre"),
                            "institucion": doc.get("institucion"),
                            "detalles": doc.get("detalles") or ""
                        })
                elif cond.get("variable") == "operacion_local_fisico_cdmx":
                    for doc in rb.get("documentos_requeridos", []):
                        cond_spec = doc.get("condicional_especifica")
                        if cond_spec and cond_spec.get("variable") == "requiere_programa_pc" and superficie <= 250:
                            continue
                        documentos_lista.append({
                            "id": doc.get("id"),
                            "nombre": doc.get("nombre"),
                            "institucion": doc.get("institucion"),
                            "detalles": doc.get("detalles") or ""
                        })

        # Load from reglas_dinamicas_por_giro
        if datos3 and "reglas_dinamicas_por_giro" in datos3:
            giros_dict = datos3["reglas_dinamicas_por_giro"].get("giros", {})
            giro_info = giros_dict.get(giro_cat, {})
            for doc in giro_info.get("documentos_requeridos", []):
                cond_spec = doc.get("condicional_especifica")
                if cond_spec and cond_spec.get("variable") == "superficie_m2" and cond_spec.get("operador") == "LESS_THAN" and superficie >= cond_spec.get("valor", 100):
                    continue
                documentos_lista.append({
                    "id": doc.get("id"),
                    "nombre": doc.get("nombre"),
                    "institucion": doc.get("institucion"),
                    "detalles": doc.get("detalles") or doc.get("nombre")
                })

        # Handle fallback lists if datos3 was empty
        if not documentos_lista:
            # Fallback documents list
            documentos_lista = [
                {"id": "DOC-BASE-001", "nombre": "Identificación oficial", "institucion": "INE", "detalles": "INE o pasaporte del representante."},
                {"id": "DOC-BASE-002", "nombre": "Comprobante de domicilio", "institucion": "Alcaldía", "detalles": "Boleta predial o de agua reciente."},
                {"id": "DOC-BASE-003", "nombre": "Constancia de situación fiscal (RFC)", "institucion": "SAT", "detalles": "RFC activo."},
                {"id": "DOC-BASE-004", "nombre": "Croquis de ubicación", "institucion": "SEDUVI", "detalles": "Esquema gráfico del local."}
            ]
            if cat in ["bar", "antro"]:
                documentos_lista.extend([
                    {"id": "DOC-ALC-001", "nombre": "Licencia de funcionamiento para venta de alcohol", "institucion": "Alcaldía / SEDECO", "detalles": "Licencia Zonal obligatoria."},
                    {"id": "DOC-PC-001", "nombre": "Programa Interno de Protección Civil", "institucion": "SGIRPC", "detalles": "Registro e implementación del programa."},
                    {"id": "DOC-RC-001", "nombre": "Póliza de seguro de responsabilidad civil", "institucion": "Aseguradora", "detalles": "Póliza vigente contra daños a terceros."}
                ])
            elif cat == "restaurante":
                documentos_lista.extend([
                    {"id": "DOC-PC-001", "nombre": "Programa Interno de Protección Civil", "institucion": "SGIRPC", "detalles": "Obligatorio para establecimientos de impacto vecinal."},
                    {"id": "DOC-VBSO-001", "nombre": "Visto bueno de seguridad y operación", "institucion": "Alcaldía", "detalles": "Dictamen de DRO."}
                ])
            elif cat == "farmacia":
                documentos_lista.extend([
                    {"id": "DOC-SAN-001", "nombre": "Licencia sanitaria de COFEPRIS", "institucion": "COFEPRIS", "detalles": "Requerido para farmacias con venta de medicamentos."},
                    {"id": "DOC-RESP-001", "nombre": "Aviso de responsable sanitario", "institucion": "COFEPRIS", "detalles": "Alta del responsable técnico."}
                ])

        # Figure Legal reasons
        fig_reasons = ["Socio único o estructura simple" if not is_moral else "Múltiples socios o inversión formal"]
        fig_ventajas = ["Trámite de apertura rápido y gratuito" if not is_moral else "Protección del patrimonio personal ante deudas"]
        fig_cuidados = ["Tu patrimonio personal queda expuesto a riesgos" if not is_moral else "Costo notarial y obligaciones fiscales mayores"]

        # Processes (datos2.json)
        procesos_lista = []
        if datos2 and "procesos" in datos2:
            procesos_lista = datos2.get("procesos", [])
        if not procesos_lista:
            procesos_lista = [
                {"nivel": "Federal", "dependencia": "SAT", "tramite": "Inscripción en el RFC", "descripcion": "Alta de obligaciones fiscales.", "nota": "Obligatorio."},
                {"nivel": "Local", "dependencia": "SEDECO", "tramite": "Registro SIAPEM", "descripcion": "Aviso de funcionamiento.", "nota": "En línea."}
            ]

        return {
            "form_data": {
                "nombre": business_details.get("titulo") or "Mi Negocio",
                "giro": giro_match.get("clave"),
                "giro_label": giro_match.get("clasificacion"),
                "alcaldia": alcaldia_matched,
                "zona": zona_matched,
                "superficie": superficie,
                "aforo": aforo,
                "radio": 1500,
                "socios": socios,
                "inversion": inversion,
                "crecimiento": "media",
                "fResp": fResp,
                "fInvExt": fInvExt,
                "fAlcohol": venta_alcohol,
                "fBaile": any(k in str(conversational_giro).lower() for k in ["baile", "antro", "musica", "discoteca"])
            },
            "viabilidad": {
                "score": max(score, 10),
                "nivel": "Alta" if score >= 75 else "Media" if score >= 55 else "Baja",
                "viable": score >= 55,
                "razones": razones if razones else [{"agente": "Agente Local", "texto": "Uso de suelo y condiciones de viabilidad óptimas.", "tipo": "ok"}],
                "sugerencias": sugerencias if sugerencias else ["Valida el uso de suelo directamente en SEDUVI."]
            },
            "figura_legal": {
                "titulo": fig_title,
                "tipo": {"nombre": fig_title, "nota": "Estructura legal sugerida para tu negocio."},
                "regimen": fig_regimen,
                "razones": fig_reasons,
                "ventajas": fig_ventajas,
                "cuidados": fig_cuidados
            },
            "procesos": procesos_lista,
            "documentos": documentos_lista
        }

    # Prepare prompt and payload for Claude
    user_payload = {
        "business_details": {
            **business_details,
            "matched_giro": giro_match
        },
        "user_rfc": user_rfc
    }

    system_prompt = (
        "Eres un agente experto de la Secretaría de Desarrollo Económico de la CDMX (SEDECO). "
        "Tu tarea es analizar los detalles del negocio proporcionados por el usuario y cruzarlos "
        "con tres bases de datos de reglas oficiales (datos1.json, datos2.json, datos3.json) "
        "para generar un diagnóstico de viabilidad y la configuración del simulador/dashboard. "
        "Debes responder ÚNICAMENTE con un objeto JSON válido que cumpla exactamente con el esquema solicitado, sin explicaciones ni markdown."
    )

    user_content = f"""
    Aquí están los detalles del negocio extraídos de la conversación y el giro pre-emparejado de catalogoGiros.js:
    {json.dumps(user_payload, indent=2, ensure_ascii=False)}

    Aquí está el archivo 'datos1.json' (Restricciones de distancia de giros a escuelas/templos):
    {json.dumps(datos1, indent=2, ensure_ascii=False)}

    Aquí está el archivo 'datos2.json' (Procesos gubernamentales locales y federales):
    {json.dumps(datos2, indent=2, ensure_ascii=False)}

    Aquí está el archivo 'datos3.json' (Esquema de reglas de negocio y documentos requeridos):
    {json.dumps(datos3, indent=2, ensure_ascii=False)}

    Realiza el cruce de información:
    1. Usa la clave SCIAN pre-emparejada {giro_match.get('clave')} y su clasificación {giro_match.get('clasificacion')}.
    2. Determina la categoría del giro: 'bajo_impacto', 'impacto_vecinal' o 'salud_o_sanitario'.
       - Por defecto, los giros de alcohol/bar/antro o música en vivo son 'impacto_vecinal'.
       - Los giros de farmacia o salud son 'salud_o_sanitario'.
       - Cafeterías, oficinas o tiendas normales son 'bajo_impacto'.
    3. Determina el tipo de persona recomendado (Persona Física o Persona Moral).
       - Si hay múltiples socios, busca financiamiento exterior, o quiere proteger el patrimonio personal, recomienda 'Persona Moral'.
       - De lo contrario, recomienda 'Persona Física'.
    4. Identifica las restricciones de distancia del giro usando datos1.json. Si el giro tiene restricciones (como bar, cantina, antro), indica la restricción (ej. 300m de escuelas) y agrégala a las razones/advertencias.
    5. Identifica y filtra los documentos obligatorios de datos3.json basándote en:
       - El tipo de persona elegido (Persona Física activa RB-001, Persona Moral activa RB-002).
       - Si requiere local físico (RB-003 aplica para operación local físico CDMX = true).
       - La cantidad de empleados (si tiene_empleados es true o si trabajadores > 0, incluye alta patronal IMSS y SAF ISN).
       - La superficie en m2 (si superficie > 250m2, incluye el Programa Interno de Protección Civil en RB-003).
       - El giro específico (reglas_dinamicas_por_giro).
    6. Identifica los trámites gubernamentales que aplican en datos2.json para el tipo de persona y nivel de gobierno.
    7. Calcula un score de viabilidad global (0 a 100) y un nivel (Alta, Media, Baja) siguiendo esta rúbrica:
       - Competencia: penaliza si hay locales del mismo giro en la zona.
       - Renta: si inversion es baja y la renta de la alcaldía es alta (Cuauhtémoc: 25k, Miguel Hidalgo: 35k, Benito Juárez: 28k, Coyoacán: 20k), resta 15 puntos.
       - Alcohol: si vende alcohol, resta 20 puntos y advierte sobre licencias.

    Genera una respuesta JSON con la siguiente estructura exacta:
    {{
      "form_data": {{
        "nombre": "Nombre del negocio",
        "giro": "{giro_match.get('clave')}",
        "giro_label": "{giro_match.get('clasificacion')}",
        "alcaldia": "Cuauhtémoc, Miguel Hidalgo, Benito Juárez o Coyoacán",
        "zona": "Centro Histórico, Roma Norte, Condesa, Polanco, Del Valle o Coyoacán Centro",
        "superficie": 60,
        "aforo": 20,
        "radio": 1500,
        "socios": 1,
        "inversion": "baja|media|alta",
        "crecimiento": "baja|media|alta",
        "fResp": false,
        "fInvExt": false,
        "fAlcohol": false,
        "fBaile": false
      }},
      "viabilidad": {{
        "score": 85,
        "nivel": "Alta|Media|Baja",
        "viable": true,
        "razones": [
          {{
            "agente": "Agente Normativo (SEDUVI) | Agente de Mercado | Agente Documental | Agente de Distancia",
            "texto": "Mensaje explicativo",
            "tipo": "ok|media|alta"
          }}
        ],
        "sugerencias": [
          "Sugerencia 1"
        ]
      }},
      "figura_legal": {{
        "titulo": "Recomendación de figura",
        "tipo": {{
          "nombre": "Persona Física | Sociedad Anónima | etc",
          "nota": "Explicación breve"
        }},
        "regimen": "Régimen fiscal sugerido",
        "razones": [
          "Razón 1"
        ],
        "ventajas": ["Ventaja 1"],
        "cuidados": ["Cuidado 1"]
      }},
      "procesos": [
        {{
          "nivel": "Federal|Local",
          "dependencia": "SAT|SEDUVI|etc",
          "tramite": "Nombre del trámite",
          "descripcion": "Descripción",
          "nota": "Nota"
        }}
      ],
      "documentos": [
        {{
          "id": "Código del documento",
          "nombre": "Nombre del documento requerido",
          "institucion": "Institución",
          "detalles": "Detalles"
        }}
      ]
    }}
    """

    if not api_key:
        print("API Key no configurada, usando evaluador local determinista.")
        return compute_local_eval()

    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }

    payload = {
        "model": "claude-3-5-sonnet-20241022",
        "max_tokens": 4000,
        "system": system_prompt,
        "messages": [
            {"role": "user", "content": user_content}
        ]
    }

    try:
        response = requests.post("https://api.anthropic.com/v1/messages", json=payload, headers=headers, timeout=30)
        if response.status_code != 200:
            raise ValueError(f"Error de la API de Anthropic: HTTP {response.status_code} - {response.text}")
        
        result_json = response.json()
        response_text = result_json["content"][0]["text"].strip()
        
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        return json.loads(response_text)
    except Exception as e:
        print(f"Error llamando al agente Claude: {e}. Usando evaluación local determinista.")
        return compute_local_eval()
