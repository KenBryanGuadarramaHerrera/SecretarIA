export default function ControlPoint({ nextNode, onContinue, onReject, disabled }) {
  const nodeNames = {
    interprete: 'Interprete Analitico',
    auditor: 'Auditor Normativo',
    redactor: 'Redactor Tecnico',
  };

  const name = nodeNames[nextNode] || nextNode;

  return (
    <div className="control-point">
      <h4>Punto de Control -- Supervision Humana Obligatoria</h4>
      <p>El siguiente paso seria: <strong>{name}</strong></p>
      <div className="control-buttons">
        <button
          className="btn-continue"
          onClick={onContinue}
          disabled={disabled}
        >
          Aprobar y Continuar
        </button>
        <button
          className="btn-reject"
          onClick={onReject}
          disabled={disabled}
        >
          Rechazar Expediente
        </button>
      </div>
    </div>
  );
}
