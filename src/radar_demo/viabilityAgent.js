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
import { mockDENUE, mockZoning, mockMarkets } from './dataService.js';

const PESOS = { normativo: 0.35, mercado: 0.30, documental: 0.25, cobertura: 0.10 };

export async function evaluarViabilidad(input, opciones = {}) {
  const { useLLM = false, agentEndpoint = '/api/agents/viabilidad' } = opciones;
  const local = evaluarLocal(input);
  if (!useLLM) return local;
  try {
    // API_REPLACE_PRODUCTION: el backend corre el agente LLM (on-prem) con las
    // mismas señales y devuelve narrativa + score. El desglose local va como base.
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
    businessType = 'cafetería',
    alcaldia = 'Cuauhtémoc',
    center = { lat: 19.432608, lng: -99.133209 },
    radius = 1500,
    documentos = [],
    requeridos = [],
    denueFeatures = mockDENUE
  } = input;

  const agentes = [
    agenteMercado({ businessType, center, radius, denueFeatures }),
    agenteNormativo({ businessType, center }),
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
  const score = clamp(100 - n * 14, 18, 100);
  const hallazgos = [];
  const sugerencias = [];
  if (n >= 4) { hallazgos.push({ tipo: 'alta', texto: `Alta saturación: ${n} competidores del mismo giro en ${radius} m.` }); sugerencias.push('Evalúa una colonia con menor densidad del mismo giro o diferénciate por propuesta.'); }
  else if (n >= 2) hallazgos.push({ tipo: 'media', texto: `Competencia moderada: ${n} establecimientos similares cerca.` });
  else hallazgos.push({ tipo: 'ok', texto: `Baja competencia directa (${n} similares en ${radius} m).` });
  return { clave: 'mercado', nombre: 'Agente de Mercado', score, hallazgos, sugerencias };
}

function agenteNormativo({ businessType, center }) {
  const zona = mockZoning.find((z) => puntoEnPoligono(center, z.geometry.coordinates[0]));
  const hallazgos = [];
  const sugerencias = [];
  let score = 70, bloqueante = false;
  if (!zona) {
    hallazgos.push({ tipo: 'media', texto: 'El punto no cae en un polígono SEDUVI demo; verifica zonificación.' });
    sugerencias.push('Solicita el Certificado Único de Zonificación de Uso del Suelo (SEDUVI).');
  } else if (zona.properties.status === 'restricted') {
    score = 12; bloqueante = true;
    hallazgos.push({ tipo: 'alta', texto: `Uso de suelo restringido: ${zona.properties.name} (${zona.properties.zoningType}).` });
    sugerencias.push('La zona es habitacional predominante: el giro no es compatible. Considera reubicar.');
  } else if (zona.properties.status === 'review') {
    score = 52;
    hallazgos.push({ tipo: 'media', texto: `Requiere revisión por impacto vecinal: ${zona.properties.name}.` });
    sugerencias.push('Prepara estudio de impacto vecinal y visto bueno de protección civil.');
  } else {
    const permitido = (zona.properties.allowedUses || []).includes(businessType);
    if (permitido) { score = 95; hallazgos.push({ tipo: 'ok', texto: `Giro compatible en ${zona.properties.name}.` }); }
    else { score = 38; hallazgos.push({ tipo: 'alta', texto: `El giro "${businessType}" no está entre los usos permitidos de ${zona.properties.name}.` }); sugerencias.push('Confirma compatibilidad de giro o tramita uso de suelo condicionado.'); }
  }
  return { clave: 'normativo', nombre: 'Agente Normativo (SEDUVI)', score, hallazgos, sugerencias, bloqueante };
}

function agenteDocumental({ documentos, requeridos }) {
  const reqs = requeridos.length ? requeridos : ['Identificación oficial', 'Comprobante de domicilio', 'Constancia de situación fiscal (RFC)', 'Croquis de ubicación'];
  const faltantes = reqs.filter((r) => !documentos.includes(r));
  const score = Math.round(((reqs.length - faltantes.length) / reqs.length) * 100);
  const hallazgos = [];
  const sugerencias = [];
  if (faltantes.length) { hallazgos.push({ tipo: faltantes.length > reqs.length / 2 ? 'alta' : 'media', texto: `Expediente incompleto: faltan ${faltantes.length} de ${reqs.length} documentos.` }); sugerencias.push(`Adjunta: ${faltantes.join(', ')}.`); }
  else hallazgos.push({ tipo: 'ok', texto: 'Expediente documental completo.' });
  return { clave: 'documental', nombre: 'Agente Documental', score, hallazgos, sugerencias, faltantes };
}

function agenteCobertura({ alcaldia, center }) {
  const dist = Math.min(...mockMarkets.map((m) => distanciaM(center, coordsDe(m))));
  const hallazgos = [];
  const sugerencias = [];
  let score;
  if (dist <= 1500) { score = 88; hallazgos.push({ tipo: 'ok', texto: `Buena cobertura: mercado público a ${Math.round(dist)} m.` }); }
  else { score = 62; hallazgos.push({ tipo: 'media', texto: `Mercado público más cercano a ${Math.round(dist)} m.` }); sugerencias.push('Zona con baja cobertura de mercados: posible oportunidad o necesidad de servicios.'); }
  return { clave: 'cobertura', nombre: 'Agente de Cobertura', score, hallazgos, sugerencias };
}

/* --------------------------- Utilidades --------------------------- */
function coordsDe(f) { const [lng, lat] = f.geometry.coordinates; return { lat, lng }; }
function coincideGiro(clase = '', tipo = '') {
  const a = String(clase).toLowerCase(); const b = String(tipo).toLowerCase().replace(/s$/, '');
  return a.includes(b) || b.includes(a.split(' ')[0]) || (b.includes('caf') && a.includes('caf')) || (b.includes('restaur') && a.includes('restaur'));
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

/**
 * Agente documental IA: evalúa un archivo adjunto.
 * Local: valida formato/tamaño y simula confianza de lectura (OCR).
 * Producción on-prem: OCR + LLM en endpoint, con respaldo local.
 */
export async function evaluarDocumentoIA(meta, opciones = {}) {
  const { useLLM = false, endpoint = '/api/agents/documentos' } = opciones;
  if (useLLM) {
    try {
      const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(meta) });
      if (r.ok) return await r.json();
    } catch (e) { /* respaldo local */ }
  }
  const ext = String(meta.nombre || '').toLowerCase().split('.').pop();
  if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) return { estado: 'rechazado', confianza: 0, nota: 'Formato no aceptado (usa PDF, JPG o PNG).' };
  if ((meta.size || 0) > 10 * 1024 * 1024) return { estado: 'rechazado', confianza: 0, nota: 'El archivo supera 10 MB.' };
  const confianza = 82 + Math.floor(Math.random() * 16);
  return { estado: confianza >= 88 ? 'validado' : 'revisar', confianza, nota: confianza >= 88 ? 'Documento legible y consistente con el requisito.' : 'Legible; requiere verificación humana.' };
}

/* Catálogo de documentos requeridos por giro (editable; en producción viene de SEDECO). */
export const REQUERIDOS_POR_GIRO = {
  default: ['Identificación oficial', 'Comprobante de domicilio', 'Constancia de situación fiscal (RFC)', 'Croquis de ubicación'],
  restaurante: ['Identificación oficial', 'Comprobante de domicilio', 'Constancia de situación fiscal (RFC)', 'Croquis de ubicación', 'Visto bueno de protección civil'],
  farmacia: ['Identificación oficial', 'Comprobante de domicilio', 'Constancia de situación fiscal (RFC)', 'Licencia sanitaria']
};
