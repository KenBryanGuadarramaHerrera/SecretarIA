import { useState, useRef, useCallback } from 'react';
import './App.css';
import Header from './components/Header';
import ExpedienteForm from './components/ExpedienteForm';
import AgentTimeline from './components/AgentTimeline';
import ControlPoint from './components/ControlPoint';
import DecisionTree from './components/DecisionTree';
import BitacoraPanel from './components/BitacoraPanel';

const API = 'http://localhost:8000';

function App() {
  const [phase, setPhase] = useState('form'); // form | processing | finished
  const [logs, setLogs] = useState([]);
  const [activeAgent, setActiveAgent] = useState('');
  const [completedAgents, setCompletedAgents] = useState([]);
  const [failedAgents, setFailedAgents] = useState([]);
  const [controlPoint, setControlPoint] = useState(null); // { nextNode }
  const [expedienteState, setExpedienteState] = useState(null);
  const [bitacora, setBitacora] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const eventSourceRef = useRef(null);

  const pollState = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/expediente/estado`);
      if (res.ok) {
        const data = await res.json();
        setExpedienteState(data.estado);
        return data;
      }
    } catch (e) {
      console.error('Error polling state:', e);
    }
    return null;
  }, []);

  const startSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource(`${API}/api/stream`);
    eventSourceRef.current = es;

    es.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'heartbeat') return;

        if (data.type === 'control_point') {
          // Un agente termino, hay punto de control
          setActiveAgent('');
          const stateData = await pollState();
          if (stateData) {
            // Mover el agente activo anterior a completados
            const timeline = stateData.estado?.linea_tiempo || [];
            const completedNames = timeline.map(ev => ev.agente);
            setCompletedAgents(completedNames);
          }
          setControlPoint({ nextNode: data.next_node });
          return;
        }

        if (data.type === 'finished') {
          setActiveAgent('');
          setPhase('finished');
          setControlPoint(null);
          setExpedienteState(data.state);
          
          // Traer la bitacora completa
          const timeline = data.state?.linea_tiempo || [];
          const completedNames = timeline.map(ev => ev.agente);
          setCompletedAgents(completedNames);
          
          try {
            const bitRes = await fetch(`${API}/api/expediente/bitacora`);
            if (bitRes.ok) {
              const bitData = await bitRes.json();
              setBitacora(bitData);
            }
          } catch (e) {
            console.error('Error fetching bitacora:', e);
          }
          
          es.close();
          return;
        }

        // Log normal de un agente
        if (data.agent) {
          setActiveAgent(data.agent);
        }
        setLogs(prev => [...prev, data]);
      } catch (e) {
        console.error('SSE parse error:', e);
      }
    };

    es.onerror = () => {
      console.warn('SSE connection error, retrying...');
    };
  }, [pollState]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setPhase('processing');
    setLogs([]);
    setCompletedAgents([]);
    setFailedAgents([]);
    setControlPoint(null);
    setBitacora(null);
    setExpedienteState(null);

    try {
      const res = await fetch(`${API}/api/expediente/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        // Iniciar SSE para logs progresivos
        startSSE();
      } else {
        alert('Error al iniciar el expediente');
        setPhase('form');
      }
    } catch (e) {
      alert('Error de conexion con el backend: ' + e.message);
      setPhase('form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = async () => {
    setControlPoint(null);

    try {
      await fetch(`${API}/api/expediente/continuar`, { method: 'POST' });
    } catch (e) {
      alert('Error al continuar: ' + e.message);
    }
  };

  const handleReject = async () => {
    setControlPoint(null);

    try {
      await fetch(`${API}/api/expediente/rechazar`, { method: 'POST' });
    } catch (e) {
      alert('Error al rechazar: ' + e.message);
    }
  };

  const handleNewExpediente = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setPhase('form');
    setLogs([]);
    setActiveAgent('');
    setCompletedAgents([]);
    setFailedAgents([]);
    setControlPoint(null);
    setExpedienteState(null);
    setBitacora(null);
    setIsSubmitting(false);
  };

  return (
    <>
      <Header />
      <div className="app-container">
        {/* Formulario */}
        {phase === 'form' && (
          <ExpedienteForm
            onSubmit={handleSubmit}
            disabled={isSubmitting}
          />
        )}

        {/* Proceso en curso */}
        {(phase === 'processing' || phase === 'finished') && (
          <>
            {/* Info del expediente */}
            {expedienteState && (
              <div className="form-card" style={{ marginBottom: 16 }}>
                <h2>Expediente: {expedienteState.folio}</h2>
                <p className="subtitle">
                  {expedienteState.nombre} | RFC: {expedienteState.rfc} | CURP: {expedienteState.curp}
                </p>
              </div>
            )}

            {/* Timeline de agentes */}
            <AgentTimeline
              logs={logs}
              activeAgent={activeAgent}
              completedAgents={completedAgents}
              failedAgents={failedAgents}
            />

            {/* Punto de control MITL */}
            {controlPoint && (
              <ControlPoint
                nextNode={controlPoint.nextNode}
                onContinue={handleContinue}
                onReject={handleReject}
                disabled={false}
              />
            )}

            {/* Resultados finales */}
            {phase === 'finished' && expedienteState && (
              <>
                <div className={`resolution-banner ${
                  expedienteState.resolucion_final === 'APROBADO' ? 'aprobado' : 'rechazado'
                }`}>
                  RESOLUCION FINAL: {expedienteState.resolucion_final}
                </div>

                <DecisionTree state={expedienteState} />

                {bitacora && <BitacoraPanel bitacora={bitacora} />}

                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <button className="btn-primary" onClick={handleNewExpediente}>
                    Evaluar Nuevo Expediente
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default App;
