export default function DecisionTree({ state }) {
  if (!state) return null;

  const rfcValido = state.es_rfc_valido;
  const alertas = state.alertas_sat || [];
  const aprobado = state.es_aprobado_auditoria;
  const resolucion = state.resolucion_final || 'N/A';
  const hasValidador = rfcValido !== null && rfcValido !== undefined;
  const hasInterprete = state.analisis_financiero != null;
  const hasAuditor = aprobado !== null && aprobado !== undefined;
  const hasRedactor = resolucion !== 'N/A';

  const rfcPassed = rfcValido === true && alertas.length === 0;

  return (
    <div className="decision-tree">
      <h3>Rama de Decisiones</h3>
      <div className="tree-container">
        <div className={`tree-node ${hasValidador ? 'active' : ''}`}>
          INICIO -- Expediente recibido
        </div>

        <div className={`tree-connector ${hasValidador ? 'active' : ''}`} />

        <div className={`tree-node ${hasValidador ? (rfcPassed ? 'passed' : 'failed') : ''}`}>
          VALIDADOR -- RFC valido? {hasValidador ? (rfcPassed ? 'SI' : 'NO') : '...'}
        </div>

        {hasValidador && !rfcPassed && (
          <>
            <div className="tree-branch no">NO</div>
            <div className="tree-connector active" />
            <div className={`tree-node ${hasRedactor ? 'failed' : ''}`}>
              REDACTOR -- Carta de RECHAZO
            </div>
            <div className="tree-connector active" />
            <div className={`tree-node ${hasRedactor ? 'failed' : ''}`}>
              FIN -- Resolucion: {resolucion}
            </div>
          </>
        )}

        {hasValidador && rfcPassed && (
          <>
            <div className="tree-branch yes">SI</div>
            <div className={`tree-connector ${hasInterprete ? 'active' : ''}`} />
            <div className={`tree-node ${hasInterprete ? 'passed' : ''}`}>
              INTERPRETE -- Score ML: {state.score_ml ? `${(state.score_ml * 100).toFixed(1)}%` : '...'}
            </div>
            <div className={`tree-connector ${hasAuditor ? 'active' : ''}`} />
            <div className={`tree-node ${hasAuditor ? (aprobado ? 'passed' : 'failed') : ''}`}>
              AUDITOR -- Aprobado? {hasAuditor ? (aprobado ? 'SI' : 'NO') : '...'}
            </div>

            {hasAuditor && (
              <>
                <div className={`tree-branch ${aprobado ? 'yes' : 'no'}`}>
                  {aprobado ? 'SI' : 'NO'}
                </div>
                <div className="tree-connector active" />
                <div className={`tree-node ${hasRedactor ? (aprobado ? 'passed' : 'failed') : ''}`}>
                  REDACTOR -- Carta de {aprobado ? 'APROBACION' : 'RECHAZO'}
                </div>
                <div className="tree-connector active" />
                <div className={`tree-node ${hasRedactor ? (aprobado ? 'passed' : 'failed') : ''}`}>
                  FIN -- Resolucion: {resolucion}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
