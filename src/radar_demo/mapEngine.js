/**
 * mapEngine.js
 * Motor WebGIS basado en Leaflet.
 * Responsabilidad exclusiva: mapa, capas, marcadores, polígonos, leyenda y navegación espacial.
 * No manipula tablas, KPIs ni formularios generales.
 */

let map;
let callbacks = {};
let layers = {};
let markerIndex = new Map();
let analysisCircle = null;
let legendControl = null;

const baseStyle = {
  denue: { color: '#9F2241', fillColor: '#9F2241' },
  market: { color: '#BC955C', fillColor: '#BC955C' },
  issue: { color: '#C62828', fillColor: '#C62828' }
};

export function initMap({ elementId, onFeatureClick }) {
  callbacks.onFeatureClick = onFeatureClick;
  map = L.map(elementId, { zoomControl: false }).setView([19.432608, -99.133209], 12);

  L.control.zoom({ position: 'bottomright' }).addTo(map);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap · Datos demo Radar CDMX'
  }).addTo(map);

  layers = {
    zoning: L.layerGroup().addTo(map),
    markets: L.layerGroup().addTo(map),
    denue: L.layerGroup().addTo(map),
    inconsistencies: L.layerGroup().addTo(map)
  };

  addLegend();
  return map;
}

export function renderMapState(state) {
  if (!map) return;
  renderZoning(state.zoning, state.opacity.zoning);
  renderMarkets(state.markets, state.opacity.markets);
  renderDENUE(state.denue.features, state.opacity.denue);
  renderInconsistencies(state.inconsistencies, state.opacity.inconsistencies);
  updateVisibility(state.layers);
  drawAnalysisRadius(state.filters.center, state.filters.radius, state.layers.analysisRadius);
}

export function getCenter() {
  const c = map.getCenter();
  return { lat: c.lat, lng: c.lng };
}

export function flyToFeature(featureId, zoom = 17) {
  const marker = markerIndex.get(featureId);
  if (!marker) return false;
  const latLng = marker.getLatLng();
  map.flyTo(latLng, zoom, { animate: true, duration: 0.9 });
  setTimeout(() => marker.openPopup(), 650);
  return true;
}

export function flyToZone(center, zoom = 14) {
  map.flyTo([center.lat, center.lng], zoom, { animate: true, duration: 0.8 });
}

export function invalidateSize() {
  setTimeout(() => map?.invalidateSize(), 120);
}

function renderDENUE(features = [], opacity = 0.78) {
  layers.denue.clearLayers();
  features.forEach((feature) => {
    const [lng, lat] = feature.geometry.coordinates;
    const marker = L.circleMarker([lat, lng], {
      radius: 7,
      weight: 2,
      color: baseStyle.denue.color,
      fillColor: baseStyle.denue.fillColor,
      fillOpacity: opacity
    });
    marker.bindPopup(popupHTML('DENUE', feature.properties.name, feature.properties.class || 'Unidad económica', '#9F2241'));
    marker.on('click', () => callbacks.onFeatureClick?.(feature.properties.id, feature));
    marker.addTo(layers.denue);
    markerIndex.set(feature.properties.id, marker);
  });
}

function renderMarkets(features = [], opacity = 0.88) {
  layers.markets.clearLayers();
  features.forEach((feature) => {
    const [lng, lat] = feature.geometry.coordinates;
    const marker = L.circleMarker([lat, lng], {
      radius: 9,
      weight: 3,
      color: baseStyle.market.color,
      fillColor: baseStyle.market.fillColor,
      fillOpacity: opacity
    });
    marker.bindPopup(popupHTML('Mercado público', feature.properties.name, `${feature.properties.stalls || 'N/D'} locales registrados`, '#BC955C'));
    marker.on('click', () => callbacks.onFeatureClick?.(feature.properties.id, feature));
    marker.addTo(layers.markets);
    markerIndex.set(feature.properties.id, marker);
  });
}

function renderZoning(features = [], opacity = 0.22) {
  layers.zoning.clearLayers();
  features.forEach((feature) => {
    const latLngs = feature.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
    const color = feature.properties.color || '#9F2241';
    L.polygon(latLngs, {
      color,
      weight: 2,
      fillColor: color,
      fillOpacity: opacity
    })
      .bindPopup(`<div class="font-sans"><strong>${feature.properties.name}</strong><br>${feature.properties.zoningType}<br><small>${feature.properties.status}</small></div>`)
      .addTo(layers.zoning);
  });
}

function renderInconsistencies(issues = [], opacity = 0.90) {
  layers.inconsistencies.clearLayers();
  issues.forEach((issue) => {
    const [lng, lat] = issue.coordinates;
    const marker = L.circleMarker([lat, lng], {
      radius: 11,
      weight: 3,
      color: baseStyle.issue.color,
      fillColor: baseStyle.issue.fillColor,
      fillOpacity: opacity
    });
    marker.bindPopup(popupHTML(issue.priority === 'Alta' ? 'Alerta crítica' : 'Alerta', issue.type, issue.problem, '#C62828'));
    marker.on('click', () => callbacks.onFeatureClick?.(issue.id, issue));
    marker.addTo(layers.inconsistencies);
    markerIndex.set(issue.id, marker);
  });
}

function updateVisibility(visible) {
  Object.entries(layers).forEach(([key, layer]) => {
    const shouldShow = visible[key] !== false;
    if (shouldShow && !map.hasLayer(layer)) layer.addTo(map);
    if (!shouldShow && map.hasLayer(layer)) map.removeLayer(layer);
  });
}

function drawAnalysisRadius(center, radius, visible = true) {
  if (analysisCircle) map.removeLayer(analysisCircle);
  if (!visible || !center) return;
  analysisCircle = L.circle([center.lat, center.lng], {
    radius,
    color: '#BC955C',
    fillColor: '#BC955C',
    fillOpacity: 0.08,
    weight: 3,
    dashArray: '8 8'
  }).addTo(map);
}

function addLegend() {
  if (legendControl) return;
  legendControl = L.control({ position: 'bottomleft' });
  legendControl.onAdd = () => {
    const div = L.DomUtil.create('div', 'radar-map-legend');
    div.innerHTML = `
      <div class="legend-title">Leyenda territorial</div>
      <div><span class="dot" style="background:#9F2241"></span> DENUE / unidades económicas</div>
      <div><span class="dot" style="background:#BC955C"></span> Mercados públicos</div>
      <div><span class="dot" style="background:#C62828"></span> Inconsistencias</div>
      <div><span class="box" style="background:rgba(46,125,50,.25);border-color:#2E7D32"></span> Compatible</div>
      <div><span class="box" style="background:rgba(245,158,11,.25);border-color:#F59E0B"></span> Revisión</div>
      <div><span class="box" style="background:rgba(198,40,40,.25);border-color:#C62828"></span> Restringido</div>
    `;
    L.DomEvent.disableClickPropagation(div);
    return div;
  };
  legendControl.addTo(map);
}

function popupHTML(tag, title, subtitle, color) {
  return `
    <div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:180px">
      <div style="font-size:10px;text-transform:uppercase;letter-spacing:.12em;font-weight:800;color:${color};margin-bottom:6px">${escapeHtml(tag)}</div>
      <strong style="color:#691C32;font-size:14px">${escapeHtml(title || '')}</strong>
      <div style="font-size:12px;color:#6F7271;margin-top:4px">${escapeHtml(subtitle || '')}</div>
    </div>
  `;
}

function escapeHtml(value = '') {
  const div = document.createElement('div');
  div.textContent = String(value);
  return div.innerHTML;
}
