import { useEffect, useRef } from 'react';

const AGENTS = [
  { key: 'validador', name: 'Agente Validador (Mesa de Entrada)' },
  { key: 'interprete', name: 'Agente Interprete Analitico (Puente ML)' },
  { key: 'auditor', name: 'Agente Auditor Normativo (Cumplimiento Legal)' },
  { key: 'redactor', name: 'Agente Redactor Tecnico (Mesa de Salida)' },
];

export default function AgentTimeline({ logs, activeAgent, completedAgents, failedAgents }) {
  return (
    <div className="timeline">
      {AGENTS.map((agent) => {
        const isActive = activeAgent === agent.name;
        const isDone = completedAgents.includes(agent.name);
        const isFailed = failedAgents.includes(agent.name);
        const agentLogs = logs.filter(l => l.agent === agent.name);

        let dotClass = '';
        if (isActive) dotClass = 'active';
        else if (isDone) dotClass = 'done';
        else if (isFailed) dotClass = 'failed';

        let cardClass = '';
        if (isActive) cardClass = 'active';
        else if (isDone) cardClass = 'done';
        else if (isFailed) cardClass = 'failed';

        let statusText = 'Pendiente';
        let statusClass = 'pending';
        if (isActive) { statusText = 'En ejecucion'; statusClass = 'running'; }
        else if (isDone) { statusText = 'Completado'; statusClass = 'ok'; }
        else if (isFailed) { statusText = 'Fallo'; statusClass = 'error'; }

        return (
          <div className="timeline-node" key={agent.key}>
            <div className={`timeline-dot ${dotClass}`} />
            <AgentCard
              name={agent.name}
              logs={agentLogs}
              status={statusText}
              statusClass={statusClass}
              cardClass={cardClass}
              isActive={isActive}
            />
          </div>
        );
      })}
    </div>
  );
}


function AgentCard({ name, logs, status, statusClass, cardClass, isActive }) {
  const logsEndRef = useRef(null);

  useEffect(() => {
    if (isActive && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs.length, isActive]);

  const showLogs = logs.length > 0;

  return (
    <div className={`agent-card ${cardClass}`}>
      <div className="agent-card-header">
        <h3>{name}</h3>
        <span className={`agent-status-badge ${statusClass}`}>
          {isActive && <span className="loading-spinner" />}
          {status}
        </span>
      </div>
      {showLogs && (
        <div className="agent-card-logs">
          {logs.map((log, i) => (
            <div key={i} className={`log-line ${log.type}`}>
              {log.msg}
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      )}
    </div>
  );
}
