import { useState } from 'react';

const ALCALDIAS = [
  "Alvaro Obregon", "Azcapotzalco", "Benito Juarez", "Coyoacan",
  "Cuajimalpa", "Cuauhtemoc", "Gustavo A. Madero", "Iztacalco",
  "Iztapalapa", "Magdalena Contreras", "Miguel Hidalgo", "Milpa Alta",
  "Tlahuac", "Tlalpan", "Venustiano Carranza", "Xochimilco"
];

export default function ExpedienteForm({ onSubmit, disabled }) {
  const [form, setForm] = useState({
    folio: `FOND-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`,
    rfc: 'GOMA9001014V6',
    curp: 'GOMA900101HDFRRA00',
    nombre: 'Ana Gomez Martinez',
    score_ml: 0.88,
    alcaldia: 'Iztapalapa',
    marginacion: 'Alta',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'score_ml' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="form-card">
      <h2>Captura de Expediente</h2>
      <p className="subtitle">
        Ingrese los datos del solicitante para iniciar la evaluacion multiagente
      </p>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Folio</label>
            <input
              type="text"
              name="folio"
              value={form.folio}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Nombre del Solicitante</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>RFC</label>
            <input
              type="text"
              name="rfc"
              value={form.rfc}
              onChange={handleChange}
              required
              maxLength={13}
              style={{ textTransform: 'uppercase' }}
            />
          </div>
          <div className="form-group">
            <label>CURP</label>
            <input
              type="text"
              name="curp"
              value={form.curp}
              onChange={handleChange}
              required
              maxLength={18}
              style={{ textTransform: 'uppercase' }}
            />
          </div>
          <div className="form-group">
            <label>Score ML (0.0 - 1.0)</label>
            <input
              type="number"
              name="score_ml"
              value={form.score_ml}
              onChange={handleChange}
              step="0.01"
              min="0"
              max="1"
              required
            />
          </div>
          <div className="form-group">
            <label>Alcaldia</label>
            <select name="alcaldia" value={form.alcaldia} onChange={handleChange}>
              {ALCALDIAS.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Nivel de Marginacion</label>
            <select name="marginacion" value={form.marginacion} onChange={handleChange}>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>
          <div className="form-group">
            <button
              type="submit"
              className="btn-primary"
              disabled={disabled}
              style={{ alignSelf: 'end' }}
            >
              {disabled ? 'Procesando...' : 'Iniciar Evaluacion'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
