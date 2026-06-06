"""
GOB-AGENTS Backend API for Reto 2 (Viabilidad de Negocios CDMX)
FastAPI server that manages authentication (code verification) and conversational chat state.
"""
import sys
import os
import random
import uuid
import smtplib
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, EmailStr

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Cargar variables de entorno de .env o .env.local de forma manual antes de importar grafos/nodos
def load_env():
    for path in [".env", ".env.local"]:
        # Subir un nivel si se está en subcarpeta o usar ruta relativa correcta
        for p in [path, os.path.join(os.path.dirname(__file__), "..", path)]:
            if os.path.exists(p):
                with open(p, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            os.environ[k.strip()] = v.strip()

load_env()

# Agregar el directorio raíz al path para poder importar los módulos
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from graph import app as langgraph_app
from state import ExpedienteState

app_api = FastAPI(
    title="SEDECO CDMX - Viabilidad de Negocios API",
    description="Backend para el análisis de viabilidad con captura conversacional",
    version="2.0.0"
)

app_api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ════════════════════════════════════════════════════════════
# Utilidad de Envío de Correos Reales
# ════════════════════════════════════════════════════════════
def send_real_email(to_email: str, code: str):
    resend_key = os.getenv("RESEND_API_KEY")
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")

    # Opción 1: Resend API (Si existe la API Key)
    if resend_key:
        try:
            headers = {
                "Authorization": f"Bearer {resend_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "from": "SecretarIA CDMX <onboarding@resend.dev>",
                "to": to_email,
                "subject": f"Codigo de acceso SecretarIA: {code}",
                "html": f"<p>Tu codigo de verificacion para ingresar a SecretarIA es: <strong>{code}</strong></p>"
            }
            r = requests.post("https://api.resend.com/emails", json=payload, headers=headers)
            if r.status_code == 200 or r.status_code == 201:
                print(f"[RESEND] Correo enviado a {to_email}")
                return
            else:
                print(f"[RESEND ERROR] Status {r.status_code}: {r.text}")
        except Exception as e:
            print(f"[RESEND EXCEPTION] {e}")

    # Opción 2: SMTP (Gmail / Custom)
    if smtp_user and smtp_password:
        smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = to_email
        msg['Subject'] = f"Codigo de acceso SecretarIA CDMX: {code}"
        
        body = f"Tu codigo de verificacion para ingresar a SecretarIA es: {code}"
        msg.attach(MIMEText(body, 'plain', 'utf-8'))
        
        try:
            server = smtplib.SMTP(smtp_host, smtp_port)
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, to_email, msg.as_string())
            server.quit()
            print(f"[SMTP] Correo enviado a {to_email}")
            return
        except Exception as e:
            print(f"[SMTP ERROR] {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Fallo al enviar correo por SMTP: {str(e)}"
            )

    # Si no hay credenciales, lanzar error explicativo para el usuario
    raise HTTPException(
        status_code=500,
        detail="Servicio de correo no configurado. Agrega RESEND_API_KEY o SMTP_USER y SMTP_PASSWORD a tu archivo .env.local"
    )

# ════════════════════════════════════════════════════════════
# Almacenamiento en Base de Datos (SQLite + SQLAlchemy)
# ════════════════════════════════════════════════════════════
from sqlalchemy import select
from backend.db import async_session_maker
from backend.models import User

# Registro temporal de códigos OTP en memoria (no requiere persistencia larga)
verification_codes: Dict[str, str] = {}

# Mapeo temporal de hilos de conversación en memoria
user_threads: Dict[str, str] = {}

# Hash bcrypt precalculado para contraseñas inactivas ("dummypassword")
DUMMY_PASSWORD_HASH = "$bcrypt$$2b$12$K.FpQYkpe/O7P9FkC6Rpqex3x5gYJ9nK.V5aMskN7R0XF8s9b.tWy"

async def get_db_user_by_email(email: str) -> Optional[User]:
    email_clean = email.strip().lower()
    async with async_session_maker() as session:
        result = await session.execute(select(User).where(User.email == email_clean))
        return result.scalars().first()

async def create_db_user(nombre: str, email: str, rfc: str) -> User:
    email_clean = email.strip().lower()
    async with async_session_maker() as session:
        existing = await get_db_user_by_email(email_clean)
        if existing:
            return existing
            
        new_user = User(
            id=uuid.uuid4(),
            email=email_clean,
            nombre=nombre,
            rfc=rfc,
            hashed_password=DUMMY_PASSWORD_HASH,
            is_active=True,
            is_verified=False,
            is_superuser=False
        )
        session.add(new_user)
        await session.commit()
        return new_user

async def mark_db_user_verified(email: str):
    email_clean = email.strip().lower()
    async with async_session_maker() as session:
        result = await session.execute(select(User).where(User.email == email_clean))
        db_user = result.scalars().first()
        if db_user:
            db_user.is_verified = True
            await session.commit()

# Crear tablas al iniciar la aplicación
@app_api.on_event("startup")
async def on_startup():
    from backend.db import Base, engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[DB] Base de datos SQLite inicializada correctamente.")

# ════════════════════════════════════════════════════════════
# Modelos Pydantic
# ════════════════════════════════════════════════════════════
class SendCodeRequest(BaseModel):
    nombre: str
    email: str
    rfc: str

class LoginRequest(BaseModel):
    email: str

class VerifyCodeRequest(BaseModel):
    email: str
    code: str

class ChatMessageRequest(BaseModel):
    email: str
    message: str

class UpdateDetailsRequest(BaseModel):
    email: str
    business_details: Dict[str, Any]

# ════════════════════════════════════════════════════════════
# Endpoints de Autenticación
# ════════════════════════════════════════════════════════════

@app_api.post("/api/auth/send-code")
async def send_code(req: SendCodeRequest):
    """
    Genera un código de verificación de 6 dígitos y lo envía al correo.
    Si el usuario ya estaba verificado previamente, retorna estado 'already_verified'.
    """
    email_clean = req.email.strip().lower()
    
    # Si el usuario ya existe y está verificado, sugerir iniciar sesión
    db_user = await get_db_user_by_email(email_clean)
    if db_user and db_user.is_verified:
        return {
            "status": "already_verified",
            "message": "Este correo ya está registrado y verificado. Por favor inicia sesión.",
            "user": {
                "nombre": db_user.nombre,
                "email": db_user.email,
                "rfc": db_user.rfc
            }
        }

    # Generar código de 6 dígitos
    code = f"{random.randint(100000, 999999)}"
    verification_codes[email_clean] = code
    
    # Crear o recuperar registro del usuario
    await create_db_user(req.nombre, req.email, req.rfc)

    # Intentar enviar el correo
    send_real_email(email_clean, code)

    return {
        "status": "success",
        "message": f"Código enviado al correo {req.email}"
    }

@app_api.post("/api/auth/login")
async def login(req: LoginRequest):
    """
    Inicia sesión directamente con un correo electrónico ya verificado, sin requerir código.
    """
    email_clean = req.email.strip().lower()
    db_user = await get_db_user_by_email(email_clean)
    
    if db_user and db_user.is_verified:
        # Asegurar thread_id
        if email_clean not in user_threads:
            user_threads[email_clean] = f"thread-{uuid.uuid4().hex[:8]}"
        return {
            "status": "success",
            "message": "Sesión iniciada con éxito",
            "user": {
                "nombre": db_user.nombre,
                "email": db_user.email,
                "rfc": db_user.rfc
            }
        }
    else:
        raise HTTPException(
            status_code=400,
            detail="Tu correo no está registrado o verificado. Por favor selecciona la pestaña 'Crear Cuenta'."
        )

@app_api.post("/api/auth/verify-code")
async def verify_code(req: VerifyCodeRequest):
    """
    Verifica el código ingresado. Si es correcto, activa la sesión del usuario.
    """
    email_key = req.email.strip().lower()
    if email_key not in verification_codes:
        raise HTTPException(status_code=404, detail="No se solicitó ningún código para este correo")
        
    expected_code = verification_codes[email_key]
    if req.code.strip() != expected_code:
        raise HTTPException(status_code=400, detail="Código de verificación incorrecto")

    # Marcar sesión como verificada
    await mark_db_user_verified(email_key)
    db_user = await get_db_user_by_email(email_key)
    
    # Crear thread_id único para la conversación
    user_threads[email_key] = f"thread-{uuid.uuid4().hex[:8]}"

    # Limpiar código
    del verification_codes[email_key]

    return {
        "status": "success",
        "user": {
            "nombre": db_user.nombre if db_user else "Usuario",
            "email": email_key,
            "rfc": db_user.rfc if db_user else ""
        }
    }

# ════════════════════════════════════════════════════════════
# Endpoints del Agente Conversacional (LangGraph)
# ════════════════════════════════════════════════════════════

@app_api.post("/api/chat")
async def chat_with_agent(req: ChatMessageRequest):
    """
    Envía un mensaje al agente conversacional y retorna el estado actualizado.
    """
    email_key = req.email.strip().lower()
    db_user = await get_db_user_by_email(email_key)
    
    if not db_user or not db_user.is_verified:
        raise HTTPException(status_code=401, detail="Usuario no autenticado o sesión expirada")

    thread_id = user_threads.get(email_key)
    if not thread_id:
        thread_id = f"thread-{uuid.uuid4().hex[:8]}"
        user_threads[email_key] = thread_id

    config = {"configurable": {"thread_id": thread_id}}

    # Obtener estado actual del grafo (si existe)
    try:
        graph_state = langgraph_app.get_state(config)
        current_values = graph_state.values if (graph_state and graph_state.values) else {}
    except Exception:
        current_values = {}

    # Inicializar campos si el estado es nuevo
    messages = current_values.get("messages", [])
    business_details = current_values.get("business_details", {
        "titulo": None,
        "giro": None,
        "descripcion": None,
        "ubicacion": None,
        "productos_servicios": None,
        "cantidad_trabajadores": None,
        "extension_m2": None
    })
    errors = current_values.get("errors", [])
    validated = current_values.get("validated", False)

    # Agregar nuevo mensaje del usuario
    messages.append({"role": "user", "content": req.message})

    # Crear el estado para invocar el grafo
    input_state = ExpedienteState(
        messages=messages,
        business_details=business_details,
        errors=errors,
        validated=validated
    )

    # Invocar el grafo
    try:
        langgraph_app.invoke(input_state, config)
        # Obtener el estado actualizado tras la ejecución
        updated_state = langgraph_app.get_state(config).values
    except Exception as e:
        print(f"Error invocado en LangGraph: {e}")
        # En caso de error de Ollama u otro, responder elegantemente
        fallback_msg = "Disculpa, he tenido un problema temporal al procesar tu respuesta. ¿Podrías repetirla detallando qué negocio quieres poner?"
        messages.append({"role": "assistant", "content": fallback_msg})
        return {
            "messages": messages,
            "business_details": business_details,
            "errors": ["Error de procesamiento temporal en el modelo de lenguaje."],
            "validated": False
        }

    return {
        "messages": updated_state.get("messages", []),
        "business_details": updated_state.get("business_details", {}),
        "errors": updated_state.get("errors", []),
        "validated": updated_state.get("validated", False)
    }

@app_api.post("/api/chat/update-details")
async def update_details(req: UpdateDetailsRequest):
    """
    Permite actualizar manualmente los detalles extraídos del negocio en el estado del grafo.
    """
    email_key = req.email.strip().lower()
    db_user = await get_db_user_by_email(email_key)
    if not db_user or not db_user.is_verified:
        raise HTTPException(status_code=401, detail="Usuario no autenticado")

    thread_id = user_threads.get(email_key)
    if not thread_id:
        thread_id = f"thread-{uuid.uuid4().hex[:8]}"
        user_threads[email_key] = thread_id

    config = {"configurable": {"thread_id": thread_id}}

    try:
        errors = []
        details = req.business_details
        
        # Validar trabajadores
        workers = details.get("cantidad_trabajadores")
        if workers is not None and workers != "":
            try:
                workers_int = int(workers)
                if workers_int <= 0 or workers_int > 500:
                    errors.append("La cantidad de trabajadores debe ser una cifra realista (entre 1 y 500).")
            except (ValueError, TypeError):
                errors.append("La cantidad de trabajadores debe ser un número entero válido.")

        # Validar extensión
        m2 = details.get("extension_m2")
        if m2 is not None and m2 != "":
            try:
                m2_int = int(m2)
                if m2_int < 2 or m2_int > 5000:
                    errors.append("La extensión en metros cuadrados (m2) debe ser una cifra realista (entre 2 y 5000 m2).")
            except (ValueError, TypeError):
                errors.append("La extensión en metros cuadrados debe ser un número entero válido.")

        # Validar si todo está completo y correcto
        validated = False
        if (details.get("titulo") and details.get("giro") and details.get("descripcion") and 
            details.get("ubicacion") and details.get("productos_servicios") and 
            workers is not None and workers != "" and m2 is not None and m2 != "" and not errors):
            validated = True

        # Actualizar el grafo
        langgraph_app.update_state(config, {
            "business_details": details,
            "errors": list(set(errors)),
            "validated": validated
        })

        # Retornar el estado actualizado
        updated_state = langgraph_app.get_state(config).values
        return {
            "messages": updated_state.get("messages", []),
            "business_details": updated_state.get("business_details", {}),
            "errors": updated_state.get("errors", []),
            "validated": updated_state.get("validated", False)
        }
    except Exception as e:
        print(f"Error actualizando detalles en LangGraph: {e}")
        raise HTTPException(status_code=500, detail=f"Error al actualizar el estado: {str(e)}")

@app_api.get("/api/chat/state")
async def get_chat_state(email: str):
    """
    Retorna el estado actual de la conversación y detalles capturados.
    """
    email_key = email.strip().lower()
    db_user = await get_db_user_by_email(email_key)
    
    if not db_user or not db_user.is_verified:
        raise HTTPException(status_code=401, detail="Usuario no autenticado")

    thread_id = user_threads.get(email_key)
    if not thread_id:
        return {
            "messages": [],
            "business_details": {
                "titulo": None,
                "giro": None,
                "descripcion": None,
                "ubicacion": None,
                "productos_servicios": None,
                "cantidad_trabajadores": None,
                "extension_m2": None
            },
            "errors": [],
            "validated": False
        }

    config = {"configurable": {"thread_id": thread_id}}
    try:
        graph_state = langgraph_app.get_state(config)
        values = graph_state.values if (graph_state and graph_state.values) else {}
        return {
            "messages": values.get("messages", []),
            "business_details": values.get("business_details", {}),
            "errors": values.get("errors", []),
            "validated": values.get("validated", False)
        }
    except Exception:
        return {
            "messages": [],
            "business_details": {
                "titulo": None,
                "giro": None,
                "descripcion": None,
                "ubicacion": None,
                "productos_servicios": None,
                "cantidad_trabajadores": None,
                "extension_m2": None
            },
            "errors": [],
            "validated": False
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app_api, host="0.0.0.0", port=8000)
