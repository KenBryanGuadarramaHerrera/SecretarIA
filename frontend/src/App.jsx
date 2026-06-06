import { useState, useRef, useEffect } from 'react';
import './App.css';
import Header from './components/Header';

const API = 'http://localhost:8000';

function App() {
  // fases: login | verify | chat | confirm
  const [phase, setPhase] = useState('login');
  
  // modo de autenticación: login (ya registrado/verificado) | register (crear cuenta y enviar código)
  const [authMode, setAuthMode] = useState('login');
  
  // Datos de login
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [rfc, setRfc] = useState('');
  const [code, setCode] = useState('');
  
  // Estados de carga
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [apiSuccessMsg, setApiSuccessMsg] = useState('');

  // Estados de Chat
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '¡Hola! Bienvenido a SecretarIA. Estoy aquí para ayudarte a detallar tu idea de negocio y guiarte en tu camino como emprendedor en la CDMX. Cuéntame: ¿Qué tipo de negocio tienes en mente, cuál es su giro, de cuántos metros cuadrados (m2) aproximados será tu local y cómo te gustaría llamarlo?'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [businessDetails, setBusinessDetails] = useState({
    titulo: null,
    giro: null,
    descripcion: null,
    ubicacion: null,
    productos_servicios: null,
    cantidad_trabajadores: null,
    extension_m2: null
  });
  const [errors, setErrors] = useState([]);
  const [validated, setValidated] = useState(false);
  
  // Estados para corrección manual
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Persistencia de sesión: Auto-login
  useEffect(() => {
    const savedEmail = localStorage.getItem('secretaria_email');
    const savedNombre = localStorage.getItem('secretaria_nombre');
    const savedRfc = localStorage.getItem('secretaria_rfc');
    
    if (savedEmail && savedNombre && savedRfc) {
      setNombre(savedNombre);
      setEmail(savedEmail);
      setRfc(savedRfc);
      
      // Consultar al backend si la sesión en memoria sigue activa
      setLoading(true);
      fetch(`${API}/api/chat/state?email=${encodeURIComponent(savedEmail)}`)
        .then(res => {
          if (res.ok) {
            setPhase('chat');
            fetchStateDirectly(savedEmail);
          } else {
            // Sesión expirada en el backend, limpiar caché local
            localStorage.clear();
          }
        })
        .catch(() => {
          localStorage.clear();
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  // Guardar en LocalStorage al iniciar sesión
  const saveSessionLocally = (userEmail, userNombre, userRfc) => {
    localStorage.setItem('secretaria_email', userEmail);
    localStorage.setItem('secretaria_nombre', userNombre);
    localStorage.setItem('secretaria_rfc', userRfc);
  };

  // Cerrar Sesión (Borrar cache)
  const handleLogout = () => {
    localStorage.clear();
    setPhase('login');
    setNombre('');
    setEmail('');
    setRfc('');
    setCode('');
    setMessages([
      {
        role: 'assistant',
        content: '¡Hola! Bienvenido a SecretarIA. Estoy aquí para ayudarte a detallar tu idea de negocio y guiarte en tu camino como emprendedor en la CDMX. Cuéntame: ¿Qué tipo de negocio tienes en mente, cuál es su giro, de cuántos metros cuadrados (m2) aproximados será tu local y cómo te gustaría llamarlo?'
      }
    ]);
    setBusinessDetails({
      titulo: null,
      giro: null,
      descripcion: null,
      ubicacion: null,
      productos_servicios: null,
      cantidad_trabajadores: null,
      extension_m2: null
    });
    setErrors([]);
    setValidated(false);
  };

  // Manejar Inicio de Sesión Directo (para usuarios ya verificados)
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email) {
      setAuthError('Por favor introduce tu correo electrónico.');
      return;
    }

    setLoading(true);
    setAuthError('');
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (res.ok) {
        // Guardar sesión verificada localmente
        saveSessionLocally(data.user.email, data.user.nombre, data.user.rfc);
        setNombre(data.user.nombre);
        setRfc(data.user.rfc);
        setPhase('chat');
        setTimeout(() => {
          fetchStateDirectly(data.user.email);
        }, 100);
      } else {
        setAuthError(data.detail || 'Tu correo no está registrado o verificado. Crea una cuenta primero.');
      }
    } catch (err) {
      setAuthError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Manejar Envío de Código o Entrada Directa
  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) {
      setAuthError('Por favor introduce tu correo electrónico.');
      return;
    }
    
    if (authMode === 'register' && (!nombre || !rfc)) {
      setAuthError('Por favor completa tu Nombre y RFC para crear una cuenta.');
      return;
    }

    setLoading(true);
    setAuthError('');
    try {
      const res = await fetch(`${API}/api/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nombre: nombre, 
          email, 
          rfc: rfc 
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        if (data.status === 'already_verified' || data.status === 'verified') {
          // El usuario ya estaba verificado. Redirigir o iniciar de inmediato
          const user = data.user;
          setNombre(user.nombre);
          setRfc(user.rfc);
          saveSessionLocally(user.email, user.nombre, user.rfc);
          setPhase('chat');
          setTimeout(() => {
            fetchStateDirectly(user.email);
          }, 100);
        } else {
          setApiSuccessMsg(data.message);
          setPhase('verify');
        }
      } else {
        setAuthError(data.detail || 'Ocurrió un error al enviar la solicitud.');
      }
    } catch (err) {
      setAuthError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Manejar Verificación de Código (para creación de cuenta)
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code) {
      setAuthError('Introduce el código de verificación.');
      return;
    }
    setLoading(true);
    setAuthError('');
    try {
      const res = await fetch(`${API}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const data = await res.json();
      if (res.ok) {
        // Guardar sesión verificada localmente
        saveSessionLocally(data.user.email, data.user.nombre, data.user.rfc);
        setPhase('chat');
        fetchStateDirectly(data.user.email);
      } else {
        setAuthError(data.detail || 'Código incorrecto. Inténtalo de nuevo.');
      }
    } catch (err) {
      setAuthError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  // Traer el estado actual del backend usando el email de sesión
  const fetchStateDirectly = async (userEmail) => {
    try {
      const res = await fetch(`${API}/api/chat/state?email=${encodeURIComponent(userEmail)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        }
        setBusinessDetails(data.business_details);
        setErrors(data.errors);
        setValidated(data.validated);
      }
    } catch (e) {
      console.error('Error fetching chat state:', e);
    }
  };

  const fetchState = () => fetchStateDirectly(email);

  // Enviar mensaje en el chat
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput('');
    setLoading(true);

    // Agregar localmente para feedback inmediato
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message: userMsg })
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages);
        setBusinessDetails(data.business_details);
        setErrors(data.errors);
        setValidated(data.validated);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un problema al conectar con el asistente.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error de red. Asegúrate de que el backend de Ollama y el servidor estén activos.' }]);
    } finally {
      setLoading(false);
    }
  };

  // Ir a confirmación
  const handleGoToConfirm = () => {
    setPhase('confirm');
  };

  const handleStartEdit = (key, currentVal) => {
    setEditingField(key);
    setEditValue(currentVal === null || currentVal === undefined ? '' : String(currentVal));
  };

  const handleSaveEdit = async (key) => {
    const updatedDetails = {
      ...businessDetails,
      [key]: (key === 'cantidad_trabajadores' || key === 'extension_m2')
        ? (editValue === '' ? null : Number(editValue))
        : editValue
    };
    
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/chat/update-details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, business_details: updatedDetails })
      });
      const data = await res.json();
      if (res.ok) {
        setBusinessDetails(data.business_details);
        setErrors(data.errors);
        setValidated(data.validated);
        setEditingField(null);
      }
    } catch (e) {
      console.error("Error al actualizar campo:", e);
    } finally {
      setLoading(false);
    }
  };

  const renderFieldCard = (key, label, valueText, type = 'text') => {
    const isEditing = editingField === key;
    const isExtracted = isFieldExtracted(businessDetails[key]);
    
    return (
      <div className={`field-card ${isExtracted ? 'extracted' : ''}`}>
        <span className="field-icon">{isExtracted ? '✓' : '○'}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--texto-secundario)', letterSpacing: '0.5px' }}>
              {label}
            </label>
            {!isEditing && (
              <button 
                onClick={() => handleStartEdit(key, businessDetails[key])}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--guinda)',
                  fontSize: '11px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0
                }}
              >
                Editar
              </button>
            )}
          </div>
          {isEditing ? (
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px', alignItems: 'center' }}>
              <input 
                type={type} 
                value={editValue} 
                onChange={(e) => setEditValue(e.target.value)}
                style={{
                  flex: 1,
                  padding: '6px',
                  fontSize: '13px',
                  border: '1px solid var(--gris-borde)',
                  borderRadius: '4px',
                  background: 'var(--blanco)',
                  color: 'var(--texto)'
                }}
                autoFocus
              />
              <button 
                onClick={() => handleSaveEdit(key)}
                style={{
                  background: 'var(--guinda)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                ✓
              </button>
              <button 
                onClick={() => setEditingField(null)}
                style={{
                  background: 'none',
                  border: '1px solid var(--gris-borde)',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="field-value">{valueText}</div>
          )}
        </div>
      </div>
    );
  };

  // Auxiliares para saber si un campo ya está capturado
  const isFieldExtracted = (val) => {
    if (val === null || val === undefined) return false;
    const s = String(val).trim().toLowerCase();
    return s !== '' && s !== 'null' && s !== 'undefined' && s !== 'esperando...' && s !== 'esperando' && s !== 'no se conoce';
  };

  return (
    <>
      <Header />
      <div className="app-container">
        
        {/* FASE 1: LOGIN */}
        {phase === 'login' && (
          <div className="form-card auth-container">
            {/* Pestañas Iniciar Sesión / Crear Cuenta */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--gris-borde)', marginBottom: '24px' }}>
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setAuthError(''); setApiSuccessMsg(''); }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'none',
                  border: 'none',
                  borderBottom: authMode === 'login' ? '3px solid var(--guinda)' : 'none',
                  color: authMode === 'login' ? 'var(--guinda)' : 'var(--texto-secundario)',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setAuthError(''); setApiSuccessMsg(''); }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'none',
                  border: 'none',
                  borderBottom: authMode === 'register' ? '3px solid var(--guinda)' : 'none',
                  color: authMode === 'register' ? 'var(--guinda)' : 'var(--texto-secundario)',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Crear Cuenta
              </button>
            </div>

            <h2>{authMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta Emprendedor'}</h2>
            <p className="subtitle">
              {authMode === 'login' 
                ? 'Accede directamente con tu correo verificado para continuar tu idea.' 
                : 'Regístrate para validar tu idea de negocio en las alcaldías de la CDMX.'}
            </p>
            
            {authError && <div className="error-banner">{authError}</div>}
            
            <form onSubmit={authMode === 'login' ? handleLogin : handleSendCode} className="form-grid">
              {authMode === 'register' && (
                <div className="form-group full-width">
                  <label>Nombre Completo</label>
                  <input 
                    type="text" 
                    value={nombre} 
                    onChange={(e) => setNombre(e.target.value)} 
                    placeholder="Ej. Ana Gómez Martínez"
                    required
                  />
                </div>
              )}
              
              <div className="form-group full-width">
                <label>Correo Electrónico</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="ana.gomez@mail.com"
                  required
                />
              </div>
              
              {authMode === 'register' && (
                <div className="form-group full-width">
                  <label>RFC</label>
                  <input 
                    type="text" 
                    value={rfc} 
                    onChange={(e) => setRfc(e.target.value.toUpperCase())} 
                    placeholder="GOMA9001014V6"
                    maxLength={13}
                    required
                  />
                </div>
              )}
              
              <div className="form-group full-width">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading 
                    ? 'Procesando...' 
                    : (authMode === 'login' ? 'Ingresar directamente' : 'Solicitar Código de Acceso')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* FASE 2: VERIFICAR CÓDIGO */}
        {phase === 'verify' && (
          <div className="form-card auth-container">
            <h2>Verificación de Correo</h2>
            <p className="subtitle">
              Hemos enviado un código a <strong>{email}</strong>.
            </p>
            {apiSuccessMsg && <div className="info-banner">{apiSuccessMsg}</div>}
            {authError && <div className="error-banner">{authError}</div>}
            <form onSubmit={handleVerifyCode} className="form-grid">
              <div className="form-group full-width">
                <label>Código de 6 dígitos</label>
                <input 
                  type="text" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value)} 
                  placeholder="123456"
                  maxLength={6}
                  style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }}
                  required
                />
              </div>
              <div className="form-group full-width" style={{ display: 'flex', gap: '12px', flexDirection: 'row' }}>
                <button 
                  type="button" 
                  className="btn-edit" 
                  onClick={() => setPhase('login')} 
                  style={{ flex: 1 }}
                >
                  Regresar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={loading}
                  style={{ flex: 2, marginTop: 0 }}
                >
                  {loading ? 'Verificando...' : 'Verificar e Iniciar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* FASE 3: CHAT CON EL AGENTE */}
        {phase === 'chat' && (
          <div className="chat-layout">
            
            {/* Panel Izquierdo: Conversación */}
            <div className="chat-panel">
              <div className="chat-header">
                <h3>Asistente de Viabilidad — SEDECO</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="user-badge">{nombre}</span>
                  <button 
                    onClick={handleLogout} 
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--blanco)',
                      fontSize: '11px',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      opacity: 0.8
                    }}
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
              
              <div className="chat-messages">
                {messages.map((msg, index) => (
                  <div key={index} className={`message-bubble ${msg.role}`}>
                    <div className="bubble-content">{msg.content}</div>
                  </div>
                ))}
                {loading && (
                  <div className="message-bubble assistant loading">
                    <div className="bubble-content">
                      <div className="loading-spinner"></div>
                      <span>Procesando respuesta con la IA...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {errors.length > 0 && (
                <div className="chat-errors">
                  <strong>⚠️ Por favor atiende:</strong>
                  <ul>
                    {errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="chat-input-area">
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={(e) => setChatInput(e.target.value)} 
                  placeholder="Escribe tu mensaje aquí..."
                  disabled={loading || validated}
                />
                <button type="submit" className="btn-send" disabled={loading || !chatInput.trim() || validated}>
                  Enviar
                </button>
              </form>
            </div>

            {/* Panel Derecho: Extracción en Tiempo Real */}
            <div className="extraction-panel">
              <h3>Ficha del Proyecto</h3>
              <p style={{ fontSize: '12px', color: 'var(--texto-secundario)', marginBottom: '16px' }}>
                La IA extrae automáticamente esta información de tu conversación.
              </p>
              
              <div className="extraction-fields">
                {renderFieldCard('titulo', 'Nombre del Negocio', businessDetails.titulo || 'Esperando...')}
                {renderFieldCard('giro', 'Giro / Sector', businessDetails.giro || 'Esperando...')}
                {renderFieldCard('descripcion', 'Descripción', businessDetails.descripcion || 'Esperando...')}
                {renderFieldCard('ubicacion', 'Ubicación (Alcaldía/Zona)', businessDetails.ubicacion || 'Esperando...')}
                {renderFieldCard('productos_servicios', 'Productos / Servicios', businessDetails.productos_servicios || 'Esperando...')}
                {renderFieldCard('cantidad_trabajadores', 'Trabajadores / Colaboradores', isFieldExtracted(businessDetails.cantidad_trabajadores) ? businessDetails.cantidad_trabajadores : 'Esperando...', 'number')}
                {renderFieldCard('extension_m2', 'Extensión del Local (m²)', isFieldExtracted(businessDetails.extension_m2) ? `${businessDetails.extension_m2} m²` : 'Esperando...', 'number')}
              </div>

              <div className="extraction-actions">
                <button 
                  className="btn-primary" 
                  onClick={handleGoToConfirm} 
                  disabled={!validated}
                  style={{ width: '100%', padding: '14px' }}
                >
                  {validated ? '¡Ficha Completa! Ver Resumen' : 'Capturando datos...'}
                </button>
              </div>
            </div>

          </div>
        )}

        {/* FASE 4: CONFIRMACIÓN Y VALIDACIÓN FINAL */}
        {phase === 'confirm' && (
          <div className="form-card confirm-container">
            <h2>Valida que tu información sea correcta</h2>
            <p className="subtitle">
              Este es el resumen final de la información que estructuró el asistente. Confirma para enviar a SEDECO.
            </p>

            <div className="confirm-grid">
              <div className="confirm-item">
                <label>Emprendedor:</label>
                <div>{nombre} (RFC: {rfc})</div>
              </div>
              <div className="confirm-item">
                <label>Correo Electrónico:</label>
                <div>{email}</div>
              </div>
              <div className="confirm-item">
                <label>Nombre del Negocio:</label>
                <div className="highlight-value">{businessDetails.titulo}</div>
              </div>
              <div className="confirm-item">
                <label>Giro / Sector del Negocio:</label>
                <div className="highlight-value">{businessDetails.giro}</div>
              </div>
              <div className="confirm-item">
                <label>Ubicación Propuesta:</label>
                <div className="highlight-value">{businessDetails.ubicacion}</div>
              </div>
              <div className="confirm-item">
                <label>Colaboradores:</label>
                <div className="highlight-value">{businessDetails.cantidad_trabajadores} trabajadores</div>
              </div>
              <div className="confirm-item">
                <label>Extensión del Local:</label>
                <div className="highlight-value">{businessDetails.extension_m2} m²</div>
              </div>
              <div className="confirm-item full-width">
                <label>Descripción del Proyecto:</label>
                <div className="text-block">{businessDetails.descripcion}</div>
              </div>
              <div className="confirm-item full-width">
                <label>Productos y Servicios a Ofrecer:</label>
                <div className="text-block">{businessDetails.productos_servicios}</div>
              </div>
            </div>



            <div className="confirm-actions">
              <button 
                className="btn-edit" 
                onClick={() => setPhase('chat')}
              >
                Volver al Chat
              </button>
              <button 
                className="btn-primary" 
                onClick={() => {
                  alert('¡Ficha de Viabilidad enviada con éxito a SEDECO!');
                  handleLogout();
                }}
                style={{ marginTop: 0 }}
              >
                ¡Todo es correcto, Enviar Ficha!
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

export default App;
