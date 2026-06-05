### Sistema Multiagente Inteligente para la Automatización, Predicción y Auditoría de Trámites Económicos

[NOMBRE PENDIENTE jaja] es una plataforma web diseñada específicamente para mitigar la saturación burocrática en la **Secretaría de Desarrollo Económico de la Ciudad de México (SEDECO)**. El sistema automatiza la lectura, clasificación, validación fiscal y dictaminación de expedientes masivos (como créditos de FONDESO o avisos de apertura) mediante un ecosistema de **Agentes de IA Locales**, integrando modelos de **Machine Learning Tradicional** para evaluar riesgos financieros, manteniendo siempre al funcionario público en control absoluto del proceso (*Man-in-the-Loop*).

---

## Nuestra Propuesta de Valor

* **Eficiencia Operativa Extrema:** Reduce el tiempo de procesamiento de expedientes de días a escasos segundos, dejando en manos del funcionario únicamente la validación final.
* **Transparencia de Razonamiento (XAI):** El sistema muestra en tiempo real una línea de tiempo interactiva explicando *cómo y bajo qué artículos legales* razonó cada agente antes de emitir una sugerencia.
* **Supervision Humana Obligatoria (Man-in-the-Loop):** La IA propone, pero jamás ejecuta. El funcionario público puede corregir, editar o rechazar las resoluciones con un solo clic.
* **Privacidad y Costo Cero de Infraestructura:** Funciona de manera 100% local utilizando modelos cuantizados avanzados, eliminando costos por tokens y garantizando la protección de datos sensibles de los ciudadanos.

---

##  Arquitectura y Módulos del Sistema

El sistema se compone de 4 capas modulares e independientes:

1.  **Portal de Ingesta (Frontend/Backend):** Interfaz ágil donde el funcionario carga carpetas de expedientes, PDFs escaneados (INE, Comprobantes de Domicilio de CDMX, Constancias de Situación Fiscal) o datasets masivos en formato CSV/JSON.
2.  **Orquestador Multiagente (Motor Core):** Desarrollado sobre frameworks de agentes que coordinan de forma secuencial y jerárquica las tareas de análisis conceptual del texto.
3.  **Capa Analítica Predictiva (Motor ML):** Algoritmos tradicionales que procesan los datos numéricos crudos del solicitante para calcular el riesgo crediticio y la viabilidad comercial.
4.  **Panel de Auditoría y Control (Interfaz MITL):** Pantalla donde el funcionario visualiza los scores matemáticos, el texto redactado por la IA y ejerce las acciones de control institucional.

---

##  El Ecosistema Multiagente y sus Protocolos de Verificación

Los agentes operan bajo una lógica especializada que emula los controles estrictos de una oficina gubernamental y fiscal real:

* **Agente 1: Validador de Identidad y Consultas Automatizadas (Mesa de Entrada):** Ejecuta procesos de OCR y extracción de entidades conectándose a herramientas internas de automatización para realizar:
    * **Validación de RFC y CURP:** Filtra la estructura mediante expresiones regulares (Regex) y simula el cotejo en tiempo real con las listas de contribuyentes del SAT (incluyendo alertas por simulación de operaciones del Art. 69-B).
    * **Cotejo Cruzado de Datos:** Compara automáticamente que el RFC de la *Constancia de Situación Fiscal* coincida exactamente con las identificaciones oficiales (INE) y el formulario de captura, detectando errores de dedo o fraudes documentales al instante.
    * **Georreferenciación CDMX:** Verifica que el comprobante de domicilio pertenezca legalmente a una de las 16 alcaldías y cuente con menos de 3 meses de vigencia.

* **Agente 2: Intérprete Analítico (Puente con ML):** Recibe el score probabilístico arrojado por los modelos predictivos de Machine Learning. Traduce esos datos numéricos complejos en un dictamen financiero en lenguaje natural, ponderando factores de equidad de género o zonas de alta marginación de la CDMX según las reglas del programa.

* **Agente 3: Auditor Normativo (Cumplimiento Legal):** Contrasta los metadatos recopilados contra la normativa vigente de la SEDECO para garantizar la legalidad absoluta del trámite y mitigar riesgos de duplicidad de apoyos económicos (verificando que el RFC/CURP no se encuentre en cartera vencida o con créditos activos duplicados en FONDESO).

* **Agente 4: Redactor Técnico (Mesa de Salida):** Compila las conclusiones de los agentes previos y genera automáticamente dos borradores: una minuta técnica de auditoría interna y una carta de respuesta formal (aprobación, prevención por documentos incorrectos o rechazo fundado) dirigida al ciudadano.

---

## Stack Tecnológico Utilizado (EL QUE SE ME OCURRE AHORITA)

* **IA y Frameworks de Agentes:** Python, CrewAI / LangGraph.
* **Habilidades de Agente (Tools):** Funciones nativas de Python integradas con `re` (Regex) para validación de sintaxis fiscal y maquetación de conectores API para consultas simuladas del padrón del SAT.
* **Modelos de Lenguaje Locales (LLMs):** Ollama ejecutando `Qwen 2.5 (3B)` para procesamiento ágil y lógica secuencial en CPU.
* **Machine Learning Predictivo:** Scikit-Learn y XGBoost para modelos de clasificación y regresión del riesgo crediticio.
* **Extracción y OCR:** PyPDF2, PDFPlumber y Tesseract OCR para digitalización de documentos.
* **Interfaz de Usuario:** Streamlit / Gradio para prototipado ultrarrápido de alta interactividad en Python (o arquitectura híbrida FastAPI + Next.js).

---

