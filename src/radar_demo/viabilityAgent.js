/**
 * viabilityAgent.js
 * Simulador de agentes IA de viabilidad para Radar CDMX.
 *
 * Cada "agente" evalúa una dimensión y devuelve un sub-score + hallazgos.
 * El agregado produce: score global, nivel, RAZONES (por qué no es viable)
 * y SUGERENCIAS / documentos faltantes.
 *
 * Local por defecto (determinista y explicable, ideal para demo). Para
 * producción on-prem, evaluarViabilidad({...}, { useLLM:true }) delega el
 * razonamiento a un agente LLM vía backend (Ollama / proxy SEDECO) y conserva
 * el desglose local como respaldo.
 */

const PESOS = { normativo: 0.35, mercado: 0.30, documental: 0.25, cobertura: 0.10 };

// Estimaciones de renta promedio mensual por alcaldía para propósitos de la rúbrica
const RENTAS_ALCALDIA = {
  'Cuauhtémoc': 25000,
  'Miguel Hidalgo': 35000,
  'Benito Juárez': 28000,
  'Coyoacán': 20000
};

export async function evaluarViabilidad(input, opciones = {}) {
  const { useLLM = false, agentEndpoint = '/api/agents/viabilidad' } = opciones;
  const local = evaluarLocal(input);
  if (!useLLM) return local;
  try {
    const res = await fetch(agentEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, base: local })
    });
    if (!res.ok) throw new Error(`Agente IA respondió HTTP ${res.status}`);
    const llm = await res.json();
    return { ...local, ...llm, fuente: 'agente-llm' };
  } catch (e) {
    return { ...local, fuente: 'local', llmError: e.message };
  }
}

function evaluarLocal(input) {
  const {
    businessType = 'café',
    alcaldia = 'Cuauhtémoc',
    center = { lat: 19.432608, lng: -99.133209 },
    radius = 1500,
    documentos = [],
    requeridos = [],
    denueFeatures = [],
    inversion = 'media',
    ventaAlcohol = false
  } = input;

  const agentes = [
    agenteMercado({ businessType, center, radius, denueFeatures }),
    agenteNormativo({ businessType, center, alcaldia, inversion, ventaAlcohol }),
    agenteDocumental({ documentos, requeridos }),
    agenteCobertura({ alcaldia, center })
  ];

  const score = Math.round(
    agentes.reduce((acc, a) => acc + a.score * (PESOS[a.clave] || 0), 0)
  );
  const nivel = score >= 75 ? 'Alta' : score >= 55 ? 'Media' : 'Baja';

  const razones = agentes.flatMap((a) => a.hallazgos.filter((h) => h.tipo !== 'ok').map((h) => ({ agente: a.nombre, texto: h.texto, severidad: h.tipo })));
  const sugerencias = agentes.flatMap((a) => a.sugerencias);
  const faltantes = agentes.find((a) => a.clave === 'documental')?.faltantes || [];

  return { score, nivel, viable: score >= 55 && !agentes.find((a) => a.clave === 'normativo')?.bloqueante, agentes, razones, sugerencias, faltantes, fuente: 'local' };
}

/* --------------------------- Agentes --------------------------- */

function agenteMercado({ businessType, center, radius, denueFeatures }) {
  const cercanos = denueFeatures.filter((f) => distanciaM(center, coordsDe(f)) <= radius);
  const mismoGiro = cercanos.filter((f) => coincideGiro(f.properties.class, businessType));
  const n = mismoGiro.length;
  
  // Rúbrica: -15 puntos por cada local similar en el radio
  const score = clamp(100 - n * 15, 10, 100);
  const hallazgos = [];
  const sugerencias = [];
  
  if (n >= 4) {
    hallazgos.push({ tipo: 'alta', texto: `Alta competencia: se detectaron ${n} locales del mismo giro en el radio de ${radius} m.` });
    sugerencias.push('Evalúa una zona con menor densidad de este giro o define una fuerte diferenciación en precios y concepto.');
  } else if (n >= 2) {
    hallazgos.push({ tipo: 'media', texto: `Competencia moderada: se detectaron ${n} locales similares cerca.` });
    sugerencias.push('Valora ofrecer valor agregado para diferenciarte de la competencia existente.');
  } else {
    hallazgos.push({ tipo: 'ok', texto: `Baja competencia directa: solo ${n} locales similares en ${radius} m.` });
  }
  
  return { clave: 'mercado', nombre: 'Agente de Mercado', score, hallazgos, sugerencias };
}

function agenteNormativo({ businessType, center, alcaldia, inversion, ventaAlcohol }) {
  // Use empty zoning array — no mock data. The agent works deterministically on known alcaldia rules.
  const zona = null;
  const hallazgos = [];
  const sugerencias = [];
  let score = 85, bloqueante = false;

  // 1. Uso de suelo — without live SEDUVI polygons we skip blocking check
  hallazgos.push({ tipo: 'ok', texto: 'Ubica el local en una zona con uso de suelo compatible con tu giro (verifica en SEDUVI).' });
  sugerencias.push('Solicita el Certificado Único de Zonificación de Uso del Suelo (SEDUVI) para confirmar compatibilidad.');

  // 2. Rúbrica de Inversión y Rentas
  const rentaEstimada = RENTAS_ALCALDIA[alcaldia] || 15000;
  if (inversion === 'baja' && rentaEstimada > 22000) {
    score -= 15;
    hallazgos.push({ tipo: 'media', texto: `Rentas elevadas en ${alcaldia} ($${rentaEstimada.toLocaleString('es-MX')}/mes) para un presupuesto de inversión bajo.` });
    sugerencias.push(`Considera reubicar en una colonia con rentas más accesibles o incrementa la inversión de capital inicial.`);
  }

  // 3. Rúbrica de Licencia de Venta de Alcohol
  if (ventaAlcohol) {
    score -= 20;
    hallazgos.push({ tipo: 'media', texto: 'Requiere Licencia de Funcionamiento de Establecimiento Mercantil de Impacto Zonal para venta de alcohol.' });
    sugerencias.push('Asegúrate de no ubicarte a menos de 300 metros de escuelas o templos, y ten listos los permisos específicos.');
  }

  score = clamp(score, 10, 100);
  return { clave: 'normativo', nombre: 'Agente Normativo (SEDUVI)', score, hallazgos, sugerencias, bloqueante };
}

function agenteDocumental({ documentos, requeridos }) {
  const reqs = requeridos.length ? requeridos : ['Identificación oficial', 'Comprobante de domicilio', 'Constancia de situación fiscal (RFC)', 'Croquis de ubicación'];
  const faltantes = reqs.filter((r) => !documentos.includes(r));
  const score = Math.round(((reqs.length - faltantes.length) / reqs.length) * 100);
  const hallazgos = [];
  const sugerencias = [];
  if (faltantes.length) {
    hallazgos.push({ tipo: faltantes.length > reqs.length / 2 ? 'alta' : 'media', texto: `Expediente incompleto: faltan ${faltantes.length} de ${reqs.length} documentos.` });
    sugerencias.push(`Asegúrate de recopilar y marcar como disponibles los documentos: ${faltantes.join(', ')}.`);
  } else {
    hallazgos.push({ tipo: 'ok', texto: 'Expediente documental completo.' });
  }
  return { clave: 'documental', nombre: 'Agente Documental', score, hallazgos, sugerencias, faltantes };
}

function agenteCobertura({ alcaldia, center }) {
  // Without live market data, provide a neutral positive assessment
  const hallazgos = [
    { tipo: 'ok', texto: 'Zona con infraestructura urbana de CDMX. Verifica mercados públicos y atractores cercanos.' }
  ];
  const sugerencias = [];
  return { clave: 'cobertura', nombre: 'Agente de Cobertura', score: 80, hallazgos, sugerencias };
}

/* --------------------------- Utilidades --------------------------- */
function coordsDe(f) { const [lng, lat] = f.geometry.coordinates; return { lat, lng }; }
function coincideGiro(clase = '', tipo = '') {
  const a = String(clase).toLowerCase(); const b = String(tipo).toLowerCase().replace(/s$/, '');
  return a.includes(b) || b.includes(a.split(' ')[0]) || (b.includes('caf') && a.includes('caf')) || (b.includes('restaur') && a.includes('restaur')) || (b.includes('bar') && a.includes('cantina')) || (b.includes('cantina') && a.includes('bar'));
}
function distanciaM(a, b) {
  const R = 6371000, t = Math.PI / 180;
  const dLat = (b.lat - a.lat) * t, dLng = (b.lng - a.lng) * t;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * t) * Math.cos(b.lat * t) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
function puntoEnPoligono(p, ring) {
  const x = p.lng, y = p.lat; let dentro = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
    const corta = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / ((yj - yi) || 1e-9) + xi);
    if (corta) dentro = !dentro;
  }
  return dentro;
}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/* Catálogo de documentos requeridos por giro (editable; en producción viene de SEDECO). */
export const REQUERIDOS_POR_GIRO = {
  default: ['Identificación oficial', 'Comprobante de domicilio', 'Constancia de situación fiscal (RFC)', 'Croquis de ubicación'],
  restaurante: ['Identificación oficial', 'Comprobante de domicilio', 'Constancia de situación fiscal (RFC)', 'Croquis de ubicación', 'Visto bueno de seguridad y operación', 'Programa Interno de Protección Civil'],
  farmacia: ['Identificación oficial', 'Comprobante de domicilio', 'Constancia de situación fiscal (RFC)', 'Croquis de ubicación', 'Licencia sanitaria de COFEPRIS', 'Aviso de responsable sanitario'],
  bar: ['Identificación oficial', 'Comprobante de domicilio', 'Constancia de situación fiscal (RFC)', 'Croquis de ubicación', 'Licencia de funcionamiento para venta de alcohol', 'Póliza de seguro de responsabilidad civil', 'Programa Interno de Protección Civil'],
  antro: ['Identificación oficial', 'Comprobante de domicilio', 'Constancia de situación fiscal (RFC)', 'Croquis de ubicación', 'Licencia de funcionamiento para venta de alcohol', 'Póliza de seguro de responsabilidad civil', 'Programa Interno de Protección Civil'],
  salon: ['Identificación oficial', 'Comprobante de domicilio', 'Constancia de situación fiscal (RFC)', 'Croquis de ubicación', 'Póliza de seguro de responsabilidad civil', 'Programa Interno de Protección Civil']
};

