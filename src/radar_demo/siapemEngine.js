/**
 * siapemEngine.js
 * Lógica de orientación de APERTURA basada en SIAPEM (Sistema Electrónico de
 * Avisos y Permisos de Establecimientos Mercantiles, https://siapem.cdmx.gob.mx/).
 *
 * Complementa a viabilityAgent.js: mientras aquel responde "¿es viable?",
 * este módulo responde "¿CÓMO me constituyo, qué trámites necesito y a qué
 * programas de la CDMX puedo entrar?".
 *
 * Cuatro bloques que pidió SEDECO:
 *   1) recomendarFiguraLegal  -> Persona física vs. Sociedad (persona moral).
 *   2) indiceAfluencia        -> Afluencia de la zona + competencia (DENUE/mercados).
 *   3) clasificarImpacto + tramitesPorImpacto -> Trámites y permisos en SIAPEM.
 *   4) programasCDMX          -> Programas de apoyo de la CDMX a los que aplica.
 *
 * Datos orientativos. Los requisitos exactos, formatos y montos se validan
 * dentro de SIAPEM y ante la alcaldía correspondiente.
 *
 * Local por defecto (determinista y explicable). Hook on-prem opcional:
 * evaluarSIAPEM(input, { useLLM:true }) delega narrativa a un agente LLM y
 * conserva este desglose como respaldo.
 */
import { mockDENUE, mockMarkets } from './dataService.js';

export const SIAPEM_URL = 'https://siapem.cdmx.gob.mx/';
export const LLAVE_URL = 'https://llave.cdmx.gob.mx/';

/* -------------------------------------------------------------------------- */
/* Catálogo de giros y su clasificación base por impacto                       */
/* (Ley de Establecimientos Mercantiles de la CDMX: Bajo / Vecinal / Zonal)    */
/* -------------------------------------------------------------------------- */
export const GIROS_SIAPEM = {
  'cafetería':   { label: 'Cafetería',            impactoBase: 'bajo',    alcohol: false },
  'abarrotes':   { label: 'Tienda de abarrotes',  impactoBase: 'bajo',    alcohol: false },
  'papelería':   { label: 'Papelería',            impactoBase: 'bajo',    alcohol: false },
  'farmacia':    { label: 'Farmacia',             impactoBase: 'bajo',    alcohol: false, sanitaria: true },
  'estética':    { label: 'Estética / salón',     impactoBase: 'bajo',    alcohol: false },
  'taller':      { label: 'Taller mecánico',      impactoBase: 'bajo',    alcohol: false },
  'autolavado':  { label: 'Autolavado',           impactoBase: 'bajo',    alcohol: false },
  'fonda':       { label: 'Fonda / cocina econ.', impactoBase: 'bajo',    alcohol: false },
  'comercio':    { label: 'Comercio al menudeo',  impactoBase: 'bajo',    alcohol: false },
  'servicios':   { label: 'Servicios',            impactoBase: 'bajo',    alcohol: false },
  'restaurante': { label: 'Restaurante',          impactoBase: 'vecinal', alcohol: true  },
  'hotel':       { label: 'Hotel / hospedaje',    impactoBase: 'vecinal', alcohol: false },
  'salon':       { label: 'Salón de eventos',     impactoBase: 'vecinal', alcohol: true  },
  'bar':         { label: 'Bar / cantina',        impactoBase: 'zonal',   alcohol: true  },
  'antro':       { label: 'Antro / discoteca',    impactoBase: 'zonal',   alcohol: true  }
};

const ORDEN_IMPACTO = { bajo: 0, vecinal: 1, zonal: 2 };

/* -------------------------------------------------------------------------- */
/* 1) Clasificación de impacto del establecimiento                             */
/* -------------------------------------------------------------------------- */
export function clasificarImpacto({ giro = 'comercio', giroLabel = '', superficie = 0, aforo = 0, ventaAlcohol = false, musicaBaile = false }) {
  const meta = GIROS_SIAPEM[giro] || { label: giroLabel || giro, impactoBase: 'bajo', alcohol: false };
  let nivel = meta.impactoBase;
  const motivos = [`Giro base clasificado como impacto ${meta.impactoBase}.`];

  // Reglas de escalamiento (el mayor manda)
  if (superficie > 250) { nivel = subir(nivel, 'vecinal'); motivos.push('Superficie mayor a 250 m²: deja de ser un giro de bajo impacto.'); }
  if (aforo >= 101)     { nivel = subir(nivel, 'vecinal'); motivos.push(`Aforo de ${aforo} personas: implica revisión de seguridad y aforo.`); }
  if (ventaAlcohol)     { nivel = subir(nivel, 'vecinal'); motivos.push('Venta de bebidas alcohólicas: requiere permiso, no solo aviso.'); }
  if (musicaBaile && ventaAlcohol) { nivel = subir(nivel, 'zonal'); motivos.push('Venta de alcohol con música/baile: incide en vialidad y ruido (impacto zonal).'); }

  return { nivel, etiqueta: etiquetaImpacto(nivel), motivos, giroLabel: meta.label };
}

function subir(actual, minimo) { return ORDEN_IMPACTO[minimo] > ORDEN_IMPACTO[actual] ? minimo : actual; }
function etiquetaImpacto(n) { return n === 'zonal' ? 'Impacto Zonal' : n === 'vecinal' ? 'Impacto Vecinal' : 'Bajo Impacto'; }

/* -------------------------------------------------------------------------- */
/* 2) Figura legal: Persona física vs. Sociedad (persona moral)                */
/* -------------------------------------------------------------------------- */
export function recomendarFiguraLegal({
  socios = 1,
  inversion = 'baja',            // 'baja' | 'media' | 'alta'
  limitarResponsabilidad = false,
  buscaInversion = false,        // socios externos / capital de riesgo / crédito grande
  proyeccionCrecimiento = 'baja',// 'baja' | 'media' | 'alta'
  ventaAlcohol = false
} = {}) {
  let puntos = 0;
  const razones = [];

  if (socios >= 2) { puntos += 2; razones.push(`Hay ${socios} socios: conviene un contrato social que reparta capital y responsabilidades.`); }
  if (limitarResponsabilidad) { puntos += 2; razones.push('Quieres separar tu patrimonio personal del negocio (responsabilidad limitada).'); }
  if (buscaInversion) { puntos += 2; razones.push('Buscas inversión o financiamiento formal: las sociedades dan estructura y emiten acciones/partes.'); }
  if (inversion === 'alta') { puntos += 1; razones.push('Inversión inicial alta: una sociedad protege mejor el capital.'); }
  if (proyeccionCrecimiento === 'alta') { puntos += 1; razones.push('Proyectas crecer y contratar: una persona moral escala mejor.'); }
  if (ventaAlcohol) { puntos += 1; razones.push('Operación regulada (alcohol): suele convenir constituirse como persona moral.'); }

  const figura = puntos >= 3 ? 'moral' : 'fisica';

  if (figura === 'fisica') {
    return {
      figura: 'fisica',
      titulo: 'Persona física con actividad empresarial',
      regimen: inversion === 'baja' ? 'Régimen Simplificado de Confianza (RESICO), si calificas' : 'Régimen de actividades empresariales',
      ventajas: ['Alta inmediata y gratuita ante el SAT', 'Contabilidad y obligaciones más sencillas', 'Ideal para iniciar y probar el negocio'],
      cuidados: ['Responsabilidad ILIMITADA: tu patrimonio personal responde por deudas del negocio', 'Más difícil sumar socios o inversión formal después'],
      razones,
      alternativas: ['Si después sumas socios o inversión, puedes migrar a una S.A.S. o S. de R.L.']
    };
  }

  // Tipo de sociedad sugerido
  let tipo;
  if (socios <= 1) tipo = { sigla: 'S.A.S.', nombre: 'Sociedad por Acciones Simplificada', nota: 'Se constituye en línea y gratis en tuempresa.gob.mx; ideal para 1 emprendedor o equipo pequeño.' };
  else if (buscaInversion || inversion === 'alta' || socios > 5) tipo = { sigla: 'S.A. de C.V.', nombre: 'Sociedad Anónima de Capital Variable', nota: 'Emite acciones; pensada para captar inversión y crecer.' };
  else tipo = { sigla: 'S. de R.L. de C.V.', nombre: 'Sociedad de Responsabilidad Limitada', nota: 'Pocos socios con responsabilidad limitada a su aportación.' };

  return {
    figura: 'moral',
    titulo: `Sociedad: ${tipo.sigla}`,
    tipo,
    ventajas: ['Responsabilidad limitada al capital aportado', 'Facilita socios, inversión y financiamiento', 'Imagen formal ante clientes y proveedores'],
    cuidados: ['Constitución ante notario/fedatario (la S.A.S. es la excepción en línea)', 'Mayores obligaciones contables y fiscales'],
    razones,
    alternativas: ['Para iniciar rápido y gratis, considera primero una S.A.S. y migra de tipo si crece.']
  };
}

/* -------------------------------------------------------------------------- */
/* 3) Trámites y permisos en SIAPEM, según impacto                             */
/* -------------------------------------------------------------------------- */
export function tramitesPorImpacto(impacto, { ventaAlcohol = false, sanitaria = false } = {}) {
  // Requisitos previos comunes a todo trámite en SIAPEM
  const previos = [
    { req: 'Cuenta LLAVE CDMX + expediente digital', donde: LLAVE_URL, obligatorio: true },
    { req: 'RFC y Constancia de Situación Fiscal (SAT)', obligatorio: true },
    { req: 'Comprobante de domicilio del local', obligatorio: true }
  ];

  let tramite, permisos, tiempo, revalidacion, costo, afirmativaFicta;

  if (impacto === 'bajo') {
    tramite = 'Aviso para el funcionamiento de Establecimiento Mercantil con giro de Bajo Impacto';
    permisos = [
      { req: 'Aviso en SIAPEM (datos del local, superficie y giro)', obligatorio: true },
      { req: 'Uso de suelo compatible con el giro (recomendable Certificado Único de Zonificación)', obligatorio: false },
      { req: 'Medidas básicas de protección civil', obligatorio: true }
    ];
    tiempo = 'Inmediato: operas al ingresar el aviso (proceso en línea de ~10 minutos).';
    revalidacion = 'No requiere revalidación periódica del aviso.';
    costo = 'Gratuito.';
    afirmativaFicta = null;
  } else if (impacto === 'vecinal') {
    tramite = 'Permiso para la operación de Establecimiento Mercantil con giro de Impacto Vecinal (formato EM-12, ref.)';
    permisos = [
      { req: 'Certificado Único de Zonificación de Uso del Suelo (obligatorio)', obligatorio: true },
      { req: 'Capacidad de aforo / Visto bueno de seguridad y operación', obligatorio: true },
      { req: 'Programa Interno de Protección Civil', obligatorio: true }
    ];
    tiempo = 'La alcaldía resuelve por el Sistema (plazo de ley). Aplica afirmativa ficta.';
    revalidacion = 'Revalidación cada 3 años.';
    costo = 'Pago de derechos (varía por giro y alcaldía).';
    afirmativaFicta = true;
  } else {
    tramite = 'Permiso para la operación de Establecimiento Mercantil con giro de Impacto Zonal (formato EM-08, ref.)';
    permisos = [
      { req: 'Certificado Único de Zonificación de Uso del Suelo (obligatorio)', obligatorio: true },
      { req: 'Capacidad de aforo y Visto bueno de seguridad y operación', obligatorio: true },
      { req: 'Programa Interno de Protección Civil', obligatorio: true },
      { req: 'Estudio de impacto vial / urbano según el giro', obligatorio: true }
    ];
    tiempo = 'La alcaldía resuelve por el Sistema. NO opera la afirmativa ficta: hay que esperar resolución.';
    revalidacion = 'Revalidación cada 2 años.';
    costo = 'Pago de derechos (mayor que vecinal; varía por giro y alcaldía).';
    afirmativaFicta = false;
  }

  if (ventaAlcohol) permisos.push({ req: 'Visto bueno y requisitos específicos para venta de bebidas alcohólicas', obligatorio: true });
  if (sanitaria)    permisos.push({ req: 'Licencia / aviso de funcionamiento sanitario (COFEPRIS) por giro farmacéutico', obligatorio: true });

  return { tramite, previos, permisos, tiempo, revalidacion, costo, afirmativaFicta, plataforma: SIAPEM_URL };
}

/* -------------------------------------------------------------------------- */
/* 4) Afluencia de la zona + competencia (proxy con DENUE y mercados)          */
/* -------------------------------------------------------------------------- */
export function indiceAfluencia({ center, giro = 'comercio', giroLabel = '', radius = 1500, denueFeatures = mockDENUE, markets = mockMarkets } = {}) {
  const cercanos = denueFeatures.filter((f) => distanciaM(center, coordsDe(f)) <= radius);
  const competidores = cercanos.filter((f) => mismoGiro(f.properties.class, giro, giroLabel)).length;
  const distMercado = markets.length ? Math.min(...markets.map((m) => distanciaM(center, coordsDe(m)))) : Infinity;

  // Afluencia: densidad económica + cercanía a un mercado público (atractor de flujo)
  const densidad = Math.min(60, cercanos.length * 10);
  const atractor = distMercado <= 600 ? 40 : distMercado <= 1500 ? 24 : 8;
  const afluencia = clamp(densidad + atractor, 0, 100);

  let nivelAfluencia = afluencia >= 70 ? 'Alta' : afluencia >= 45 ? 'Media' : 'Baja';
  let nivelCompetencia = competidores >= 4 ? 'Alta' : competidores >= 2 ? 'Media' : 'Baja';

  const lectura = [];
  if (nivelAfluencia === 'Alta') lectura.push('Zona con buen flujo de personas y actividad económica.');
  else if (nivelAfluencia === 'Media') lectura.push('Afluencia moderada; apóyate en horarios y promoción local.');
  else lectura.push('Afluencia baja; valida que haya demanda suficiente para el giro.');

  if (nivelCompetencia === 'Alta') lectura.push(`Saturación: ${competidores} competidores del mismo giro en ${radius} m. Diferénciate o cambia de colonia.`);
  else if (nivelCompetencia === 'Media') lectura.push(`Competencia moderada: ${competidores} negocios similares cerca.`);
  else lectura.push(`Poca competencia directa (${competidores} similares en ${radius} m): posible oportunidad.`);

  return {
    afluencia, nivelAfluencia,
    competidores, nivelCompetencia,
    distanciaMercadoM: Number.isFinite(distMercado) ? Math.round(distMercado) : null,
    unidadesCercanas: cercanos.length,
    lectura
  };
}

/* -------------------------------------------------------------------------- */
/* 5) Programas de apoyo de la CDMX                                            */
/* -------------------------------------------------------------------------- */
export function programasCDMX({ figura = 'fisica', giro = 'comercio', tamano = 'micro', perfil = [] } = {}) {
  const P = [];

  P.push({
    nombre: 'FONDESO — Microcréditos y financiamiento',
    org: 'Fondo para el Desarrollo Social de la CDMX',
    para: 'Micro y pequeñas empresas; tasas preferentes, con prioridad para mujeres y jóvenes.',
    incluye: 'Crédito + capacitación obligatoria gratuita.',
    aplica: tamano === 'micro' || tamano === 'pequeña' || figura === 'fisica',
    url: 'https://www.fondeso.cdmx.gob.mx/'
  });

  P.push({
    nombre: 'SEDECO — Asesoría y capacitación empresarial',
    org: 'Secretaría de Desarrollo Económico CDMX',
    para: 'Todo emprendedor: asesorías especializadas y cursos gratuitos de desarrollo empresarial.',
    incluye: 'Acompañamiento para formalizarte y crecer.',
    aplica: true,
    url: 'https://www.sedeco.cdmx.gob.mx/'
  });

  P.push({
    nombre: 'Fondo de Garantía SEDECO–NAFIN',
    org: 'SEDECO + Nacional Financiera',
    para: 'MiPymes de industria, comercio y servicios que buscan crédito bancario con garantía.',
    incluye: 'Garantía que facilita el acceso a crédito de la banca.',
    aplica: figura === 'moral' || tamano !== 'micro',
    url: 'https://www.sedeco.cdmx.gob.mx/'
  });

  if (['manufactura', 'taller', 'comercio'].includes(giro) || tamano === 'mediana') {
    P.push({
      nombre: 'Vallejo-i',
      org: 'SEDECO CDMX',
      para: 'Industria e innovación: modernización del corredor industrial Vallejo.',
      incluye: 'Capacitación, vinculación y servicios para industria.',
      aplica: true,
      url: 'https://www.sedeco.cdmx.gob.mx/'
    });
  }

  P.push({
    nombre: 'Apoyo a MiPymes para energía solar',
    org: 'SEDECO CDMX',
    para: 'Negocios que quieren instalar paneles solares y reducir su gasto eléctrico.',
    incluye: 'Acompañamiento para sistemas fotovoltaicos.',
    aplica: tamano !== 'micro' || ['restaurante', 'hotel', 'manufactura'].includes(giro),
    url: 'https://www.sedeco.cdmx.gob.mx/'
  });

  const recomendados = P.filter((p) => p.aplica);
  const otros = P.filter((p) => !p.aplica);
  return { recomendados, otros, nota: 'Verifica convocatorias y requisitos vigentes en cada institución antes de aplicar.' };
}

/* -------------------------------------------------------------------------- */
/* Orquestador SIAPEM                                                          */
/* -------------------------------------------------------------------------- */
export async function evaluarSIAPEM(input = {}, opciones = {}) {
  const { useLLM = false, endpoint = '/api/agents/siapem' } = opciones;
  const local = evaluarSIAPEMLocal(input);
  if (!useLLM) return local;
  try {
    const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input, base: local }) });
    if (!r.ok) throw new Error(`Agente SIAPEM HTTP ${r.status}`);
    const llm = await r.json();
    return { ...local, ...llm, fuente: 'agente-llm' };
  } catch (e) {
    return { ...local, fuente: 'local', llmError: e.message };
  }
}

function evaluarSIAPEMLocal(input) {
  const {
    giro = 'comercio',
    center = { lat: 19.432608, lng: -99.133209 },
    radius = 1500,
    superficie = 0,
    aforo = 0,
    ventaAlcohol = false,
    musicaBaile = false,
    socios = 1,
    inversion = 'baja',
    limitarResponsabilidad = false,
    buscaInversion = false,
    proyeccionCrecimiento = 'baja',
    tamano = 'micro',
    perfil = [],
    denueFeatures = mockDENUE,   // datos DENUE reales (proxy) o mock por defecto
    markets = mockMarkets,
    giroLabel = ''
  } = input;

  const meta = GIROS_SIAPEM[giro] || {};
  const impacto = clasificarImpacto({ giro, giroLabel, superficie, aforo, ventaAlcohol, musicaBaile });
  const figuraLegal = recomendarFiguraLegal({ socios, inversion, limitarResponsabilidad, buscaInversion, proyeccionCrecimiento, ventaAlcohol });
  const tramites = tramitesPorImpacto(impacto.nivel, { ventaAlcohol, sanitaria: !!meta.sanitaria });
  const afluencia = indiceAfluencia({ center, giro, giroLabel, radius, denueFeatures, markets });
  const programas = programasCDMX({ figura: figuraLegal.figura, giro, tamano, perfil });

  return { impacto, figuraLegal, tramites, afluencia, programas, fuente: 'local' };
}

/* --------------------------- Utilidades --------------------------- */
function coordsDe(f) { const [lng, lat] = f.geometry.coordinates; return { lat, lng }; }
function mismoGiro(clase = '', giro = '', label = '') {
  const a = String(clase).toLowerCase();
  const meta = GIROS_SIAPEM[giro];
  const b = String(label || (meta ? meta.label : giro)).toLowerCase();
  if (!a || !b) return false;
  const palabras = b.replace(/[^a-záéíóúñ ]/gi, ' ').split(' ').filter((w) => w.length > 4);
  if (palabras.some((w) => a.includes(w))) return true;
  return (b.includes('caf') && a.includes('caf')) || (b.includes('restaur') && a.includes('restaur')) || (b.includes('farmac') && a.includes('farmac')) || (b.includes('bellez') && a.includes('bellez'));
}
function distanciaM(a, b) {
  const R = 6371000, t = Math.PI / 180;
  const dLat = (b.lat - a.lat) * t, dLng = (b.lng - a.lng) * t;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * t) * Math.cos(b.lat * t) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
