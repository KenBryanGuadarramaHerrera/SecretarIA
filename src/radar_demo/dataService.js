/**
 * dataService.js
 * Adaptadores de datos y conectores externos.
 * Aquí vive la lógica de consulta y normalización de APIs.
 */

export const mockMarkets = [
  point('market-medellin', 'Mercado Medellín', 19.41062, -99.16681, 'Cuauhtémoc', { type: 'Mercado público', stalls: 520, status: 'Activo' }),
  point('market-san-juan', 'Mercado San Juan', 19.43013, -99.14342, 'Cuauhtémoc', { type: 'Mercado público', stalls: 360, status: 'Activo' }),
  point('market-coyoacan', 'Mercado Coyoacán', 19.34871, -99.16244, 'Coyoacán', { type: 'Mercado público', stalls: 440, status: 'Activo' }),
  point('market-portales', 'Mercado Portales', 19.36931, -99.14781, 'Benito Juárez', { type: 'Mercado público', stalls: 300, status: 'Activo' }),
  point('market-anahuac', 'Mercado Anáhuac Zona', 19.44176, -99.17444, 'Miguel Hidalgo', { type: 'Mercado público', stalls: 210, status: 'Activo' })
];

export const mockZoning = [
  polygon('zone-centro-mixto', 'Centro Histórico · Comercio y servicios', 'Comercio / Servicios', 'compatible', '#2E7D32', [
    [19.43930, -99.14240], [19.43930, -99.12610], [19.42560, -99.12610], [19.42560, -99.14240]
  ], ['cafetería', 'restaurante', 'abarrotes', 'farmacia', 'servicios']),
  polygon('zone-roma-hc', 'Roma Norte · Habitacional con comercio', 'Habitacional con comercio', 'compatible', '#BC955C', [
    [19.42540, -99.17290], [19.42540, -99.15120], [19.41170, -99.15120], [19.41170, -99.17290]
  ], ['cafetería', 'restaurante', 'estética', 'servicios']),
  polygon('zone-condesa-rev', 'Condesa · Revisión por impacto vecinal', 'Revisión', 'review', '#F59E0B', [
    [19.41920, -99.18320], [19.41920, -99.16420], [19.40390, -99.16420], [19.40390, -99.18320]
  ], ['cafetería', 'estética', 'servicios']),
  polygon('zone-polanco-serv', 'Polanco · Corredor de servicios', 'Servicios / oficinas', 'compatible', '#9F2241', [
    [19.44020, -99.20810], [19.44020, -99.18540], [19.42390, -99.18540], [19.42390, -99.20810]
  ], ['restaurante', 'farmacia', 'servicios', 'cafetería']),
  polygon('zone-delvalle-h', 'Del Valle · Habitacional predominante', 'Habitacional', 'restricted', '#C62828', [
    [19.38910, -99.17660], [19.38910, -99.15150], [19.37070, -99.15150], [19.37070, -99.17660]
  ], ['estética', 'servicios'])
];

export const mockDENUE = [
  point('denue-roma-1', 'Café Veracruz Roma Norte', 19.42019, -99.16314, 'Cuauhtémoc', { source: 'DENUE mock', class: 'Cafeterías', employees: '0 a 5 personas', street: 'Orizaba' }),
  point('denue-roma-2', 'Pan Artesanal Colima', 19.41902, -99.15941, 'Cuauhtémoc', { source: 'DENUE mock', class: 'Panificación tradicional', employees: '6 a 10 personas', street: 'Colima' }),
  point('denue-centro-1', 'Restaurante Madero Centro', 19.43391, -99.13731, 'Cuauhtémoc', { source: 'DENUE mock', class: 'Restaurantes', employees: '11 a 30 personas', street: 'Madero' }),
  point('denue-condesa-1', 'Barra de Café Amsterdam', 19.41120, -99.17075, 'Cuauhtémoc', { source: 'DENUE mock', class: 'Cafeterías', employees: '0 a 5 personas', street: 'Amsterdam' }),
  point('denue-polanco-1', 'Farmacia Polanco Masaryk', 19.43379, -99.19382, 'Miguel Hidalgo', { source: 'DENUE mock', class: 'Farmacias', employees: '6 a 10 personas', street: 'Masaryk' }),
  point('denue-delvalle-1', 'Estética Insurgentes Sur', 19.37964, -99.16710, 'Benito Juárez', { source: 'DENUE mock', class: 'Salones de belleza', employees: '0 a 5 personas', street: 'Insurgentes Sur' })
];

export async function fetchDENUEFromINEGI({ token, condition, lat, lng, radius, proxyUrl = '' }) {
  if (!token && !proxyUrl) {
    throw new Error('Falta token de INEGI o endpoint proxy.');
  }

  const safeCondition = encodeURIComponent(condition || 'todos');
  const safeRadius = Math.min(Number(radius || 1000), 5000);

  /**
   * API_REPLACE_PRODUCTION:
   * Para producción SEDECO, usar proxy interno:
   *   GET /api/sedeco/denue/buscar?condition=cafetería&lat=19.43&lng=-99.13&radius=1500
   * El backend agrega token, resuelve CORS, registra auditoría y normaliza JSON.
   */
  const directUrl = `https://www.inegi.org.mx/app/api/denue/v1/consulta/Buscar/${safeCondition}/${lat},${lng}/${safeRadius}/${token}`;
  const url = proxyUrl
    ? `${proxyUrl}?condition=${safeCondition}&lat=${lat}&lng=${lng}&radius=${safeRadius}`
    : directUrl;

  const response = await fetch(url, { headers: proxyUrl ? { 'Accept': 'application/json' } : undefined });
  if (!response.ok) throw new Error(`DENUE respondió HTTP ${response.status}`);
  const payload = await response.json();
  const rows = Array.isArray(payload) ? payload : (payload.data || payload.results || []);
  return rows.map(normalizeDENUEItem).filter(Boolean);
}

export function normalizeDENUEItem(item) {
  const lat = Number(item.Latitud ?? item.latitud ?? item.lat ?? item.geometry?.coordinates?.[1]);
  const lng = Number(item.Longitud ?? item.longitud ?? item.lng ?? item.geometry?.coordinates?.[0]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const id = String(item.Id ?? item.id ?? item.CLEE ?? item.clee ?? `denue-${lat}-${lng}`);
  return point(id, item.Nombre ?? item.nombre ?? item.name ?? 'Establecimiento DENUE', lat, lng, item.Municipio ?? item.Alcaldia ?? item.borough ?? 'CDMX', {
    source: 'DENUE / INEGI',
    clee: item.CLEE ?? item.clee ?? '',
    businessName: item.Razon_social ?? item.razon_social ?? '',
    class: item.Clase_actividad ?? item.clase_actividad ?? item.Actividad ?? item.class ?? '',
    employees: item.Estrato ?? item.estrato ?? '',
    street: [item.Tipo_vialidad, item.Calle, item.Num_Exterior].filter(Boolean).join(' '),
    colony: item.Colonia ?? '',
    phone: item.Telefono ?? '',
    email: item.Correo_e ?? '',
    website: item.www ?? item.Pagina_web ?? '',
    legalBasis: 'Cotejo con zonificación SEDUVI y reglas administrativas SEDECO'
  });
}

export function runTerritorialCrosscheck({ denueFeatures, markets, zoning, businessType }) {
  const issues = [];
  denueFeatures.forEach((feature) => {
    const pointCoords = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
    const containingZones = zoning.filter((zone) => pointInPolygon(pointCoords, zone.geometry.coordinates[0]));
    const allowed = containingZones.some((zone) => zone.properties.allowedUses?.includes(businessType));
    const review = containingZones.some((zone) => zone.properties.status === 'review');
    const restricted = containingZones.some((zone) => zone.properties.status === 'restricted');
    if ((containingZones.length && !allowed) || review || restricted) {
      issues.push({
        id: `issue-${feature.properties.id}`,
        type: restricted ? 'Incompatibilidad crítica' : review ? 'Revisión normativa' : 'Uso no permitido',
        priority: restricted ? 'Alta' : 'Media',
        source: 'DENUE + SEDUVI + Reglas SEDECO',
        problem: `${feature.properties.name} requiere cotejo de giro vs. polígono de uso de suelo.`,
        action: 'Solicitar validación documental, certificado de uso de suelo y evidencia de giro autorizado.',
        linkedFeatureId: feature.properties.id,
        coordinates: feature.geometry.coordinates,
        borough: feature.properties.borough || 'CDMX',
        legal: ['Uso de suelo', 'Compatibilidad de giro', 'Posible impacto vecinal'],
        complaints: Math.floor(Math.random() * 5),
        photo: `https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1200&auto=format&fit=crop`
      });
    }
  });

  markets.forEach((market) => {
    if (!market.geometry.coordinates[0] || !market.geometry.coordinates[1]) {
      issues.push({
        id: `issue-${market.properties.id}`,
        type: 'Dato incompleto',
        priority: 'Media',
        source: 'Mercados Públicos CDMX',
        problem: 'Mercado sin coordenada válida para análisis territorial.',
        action: 'Geocodificar y normalizar registro.',
        linkedFeatureId: market.properties.id,
        coordinates: market.geometry.coordinates,
        borough: market.properties.borough || 'CDMX',
        legal: ['Calidad de datos', 'Normalización geográfica'],
        complaints: 0,
        photo: `https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=1200&auto=format&fit=crop`
      });
    }
  });

  return issues;
}

function point(id, name, lat, lng, borough, properties = {}) {
  return {
    type: 'Feature',
    properties: { id, name, borough, ...properties },
    geometry: { type: 'Point', coordinates: [lng, lat] }
  };
}

function polygon(id, name, zoningType, status, color, latLngs, allowedUses) {
  return {
    type: 'Feature',
    properties: { id, name, zoningType, status, color, allowedUses },
    geometry: { type: 'Polygon', coordinates: [latLngs.map(([lat, lng]) => [lng, lat])] }
  };
}

function pointInPolygon([lat, lng], polygonLngLat) {
  const x = lng;
  const y = lat;
  let inside = false;
  for (let i = 0, j = polygonLngLat.length - 1; i < polygonLngLat.length; j = i++) {
    const xi = polygonLngLat[i][0], yi = polygonLngLat[i][1];
    const xj = polygonLngLat[j][0], yj = polygonLngLat[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / ((yj - yi) || 0.0000001) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
