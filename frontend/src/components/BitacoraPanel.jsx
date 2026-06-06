export default function BitacoraPanel({ bitacora }) {
  if (!bitacora) return null;

  const { expediente, linea_tiempo, decisiones_mitl, carta_ciudadano } = bitacora;

  const handleDownload = () => {
    const lines = [];
    lines.push('=' .repeat(70));
    lines.push('  BITACORA DE DECISIONES -- GOB-AGENTS (SEDECO CDMX)');
    lines.push('=' .repeat(70));
    lines.push(`  Folio:       ${expediente?.folio}`);
    lines.push(`  RFC:         ${expediente?.rfc}`);
    lines.push(`  CURP:        ${expediente?.curp}`);
    lines.push(`  Nombre:      ${expediente?.nombre}`);
    lines.push(`  Resolucion:  ${expediente?.resolucion_final}`);
    lines.push('');

    lines.push('  LINEA DE TIEMPO DE AGENTES');
    lines.push('-'.repeat(70));
    (linea_tiempo || []).forEach((ev, i) => {
      lines.push(`  PASO ${i + 1}: ${ev.agente}`);
      lines.push(`  Hora: ${ev.timestamp}`);
      lines.push(`  Accion: ${ev.accion}`);
      lines.push(`  ${ev.detalles}`);
      lines.push('');
    });

    lines.push('  DECISIONES DEL FUNCIONARIO');
    lines.push('-'.repeat(70));
    (decisiones_mitl || []).forEach((d, i) => {
      lines.push(`  Punto ${i + 1}: ${d.decision} (despues de: ${d.despues_de})`);
      if (d.nota) lines.push(`    Nota: ${d.nota}`);
    });

    lines.push('');
    lines.push('  CARTA PARA EL CIUDADANO');
    lines.push('-'.repeat(70));
    lines.push(carta_ciudadano || 'No generada.');

    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bitacora_${expediente?.folio || 'N-A'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bitacora-panel">
      <h3>Bitacora de Decisiones</h3>

      {/* Seccion 1: Linea de tiempo */}
      <div className="bitacora-section">
        <h4>Linea de Tiempo de Agentes</h4>
        {(linea_tiempo || []).map((ev, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <strong>Paso {i + 1}: {ev.agente}</strong>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
              {ev.timestamp} -- {ev.accion}
            </div>
            <pre style={{
              fontSize: 12,
              background: '#F5F5F5',
              padding: 12,
              borderRadius: 6,
              whiteSpace: 'pre-wrap',
              overflowX: 'auto'
            }}>
              {ev.detalles}
            </pre>
          </div>
        ))}
      </div>

      {/* Seccion 2: Decisiones MITL */}
      <div className="bitacora-section">
        <h4>Decisiones del Funcionario</h4>
        {(decisiones_mitl || []).length > 0 ? (
          <table className="bitacora-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Despues de</th>
                <th>Decision</th>
                <th>Hora</th>
                <th>Nota</th>
              </tr>
            </thead>
            <tbody>
              {decisiones_mitl.map((d, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{d.despues_de}</td>
                  <td style={{
                    fontWeight: 600,
                    color: d.decision === 'rechazar' ? '#C62828' : '#2E7D32'
                  }}>
                    {d.decision.toUpperCase()}
                  </td>
                  <td>{d.timestamp}</td>
                  <td>{d.nota || '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#666', fontSize: 13 }}>Sin decisiones registradas.</p>
        )}
      </div>

      {/* Seccion 3: Carta */}
      {carta_ciudadano && (
        <div className="bitacora-section">
          <h4>Carta Generada para el Ciudadano</h4>
          <div className="carta-preview">{carta_ciudadano}</div>
        </div>
      )}

      <button className="btn-download" onClick={handleDownload}>
        Descargar Bitacora (.txt)
      </button>
    </div>
  );
}
