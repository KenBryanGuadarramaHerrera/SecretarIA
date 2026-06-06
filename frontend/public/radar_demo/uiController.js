/**
 * uiController.js
 * Capa de interfaz: eventos, KPIs, tablas, drawers, toasts y formularios.
 * No dibuja Leaflet ni crea gráficas directamente.
 */
import { store, cdmxCenters } from './state.js';
import { fetchDENUEFromINEGI, runTerritorialCrosscheck } from './dataService.js';

let mapAPI;
let chartAPI;

export function initUI({ map, charts }) {
  mapAPI = map;
  chartAPI = charts;
  bindEvents();
  renderAll(store.getState());
  store.subscribe(renderAll);
}

export function handleFeatureSelection(featureId, feature) {
  store.selectFeature(featureId);
  renderInspectionDrawer(feature || findFeatureById(featureId));
}

function bindEvents() {
  qs('#sidebarToggle')?.addEventListener('click', () => {
    const current = store.getState().ui.sidebarCollapsed;
    store.setState({ ui: { sidebarCollapsed: !current } }, 'sidebar');
  });

  qs('#themeToggle')?.addEventListener('click', () => {
    const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', next === 'dark');
    store.setState({ ui: { theme: next } }, 'theme');
  });

  qsa('[data-persona]').forEach((btn) => btn.addEventListener('click', () => {
    store.setState({ ui: { persona: btn.dataset.persona } }, 'persona');
    mapAPI.invalidateSize();
  }));

  qsa('[data-layer]').forEach((control) => control.addEventListener('change', () => {
    const key = control.dataset.layer;
    store.setState({ layers: { [key]: control.checked } }, 'layerToggle');
  }));

  qsa('[data-opacity]').forEach((range) => range.addEventListener('input', () => {
    store.setState({ opacity: { [range.dataset.opacity]: Number(range.value) / 100 } }, 'opacity');
  }));

  ['zoneSelect', 'boroughSelect', 'businessType', 'conditionInput', 'radiusInput'].forEach((id) => qs(`#${id}`)?.addEventListener('change', syncFiltersFromUI));
  qs('#conditionInput')?.addEventListener('input', syncFiltersFromUI);
  qs('#radiusInput')?.addEventListener('input', syncFiltersFromUI);

  qs('#useMapCenterBtn')?.addEventListener('click', () => {
    const center = mapAPI.getCenter();
    store.setState({ filters: { center } }, 'mapCenter');
    setInputValue('#latInput', center.lat.toFixed(6));
    setInputValue('#lngInput', center.lng.toFixed(6));
  });

  qs('#zoneSelect')?.addEventListener('change', () => {
    const zone = qs('#zoneSelect').value;
    const center = cdmxCenters[zone];
    if (!center) return;
    setInputValue('#latInput', center.lat.toFixed(6));
    setInputValue('#lngInput', center.lng.toFixed(6));
    store.setState({ filters: { zone, borough: center.borough, center: { lat: center.lat, lng: center.lng } } }, 'zone');
    mapAPI.flyToZone(center);
  });

  qs('#queryDENUEBtn')?.addEventListener('click', queryDENUE);
  qs('#runCrosscheckBtn')?.addEventListener('click', runCrosscheck);
  qs('#loadMockBtn')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('radar:loadMock'));
    store.showToast('Datos demo cargados correctamente.', 'success');
  });
  qs('#fileInput')?.addEventListener('change', handleFileUpload);
  qs('#exportGeoJSONBtn')?.addEventListener('click', exportGeoJSON);
  qs('#closeDrawerBtn')?.addEventListener('click', closeDrawer);
}

function syncFiltersFromUI() {
  const radius = Math.min(Number(qs('#radiusInput')?.value || 1500), 5000);
  const center = {
    lat: Number(qs('#latInput')?.value || 19.432608),
    lng: Number(qs('#lngInput')?.value || -99.133209)
  };
  store.setState({
    filters: {
      zone: qs('#zoneSelect')?.value,
      borough: qs('#boroughSelect')?.value,
      businessType: qs('#businessType')?.value,
      condition: qs('#conditionInput')?.value,
      radius,
      center
    }
  }, 'filters');
}

async function queryDENUE() {
  syncFiltersFromUI();
  const state = store.getState();
  const token = qs('#tokenInput')?.value.trim() || state.denue.token;
  const proxyUrl = qs('#proxyInput')?.value.trim();
  if (!token && !proxyUrl) {
    store.setDENUEStatus('error', 'Ingresa token INEGI o un endpoint proxy SEDECO.');
    store.showToast('Falta token o proxy para consultar DENUE.', 'error');
    return;
  }
  sessionStorage.setItem('INEGI_DENUE_TOKEN', token);
  store.setDENUEStatus('loading', 'Consultando DENUE / INEGI...');
  store.setLoading(true, 'Consultando unidades económicas en DENUE...');

  try {
    const features = await fetchDENUEFromINEGI({
      token,
      proxyUrl,
      condition: state.filters.condition,
      lat: state.filters.center.lat,
      lng: state.filters.center.lng,
      radius: state.filters.radius
    });
    store.setState({ denue: { token, features, status: 'connected', message: `${features.length} registros DENUE obtenidos`, source: proxyUrl ? 'proxy' : 'direct' } }, 'denueQuery');
    store.showToast(`DENUE conectado: ${features.length} establecimientos.`, 'success');
  } catch (error) {
    console.error(error);
    store.setDENUEStatus('error', 'Error DENUE: token, CORS o endpoint proxy. Se conservan datos demo.');
    store.showToast('No se pudo conectar a DENUE. Usa proxy backend en producción.', 'error');
  } finally {
    store.setLoading(false);
  }
}

function runCrosscheck() {
  const state = store.getState();
  store.setLoading(true, 'Cotejando DENUE contra SEDUVI y reglas SEDECO...');
  setTimeout(() => {
    const issues = runTerritorialCrosscheck({
      denueFeatures: state.denue.features,
      markets: state.markets,
      zoning: state.zoning,
      businessType: state.filters.businessType
    });
    store.setState({ inconsistencies: issues }, 'crosscheck');
    store.setLoading(false);
    store.showToast(`Cotejo terminado: ${issues.length} inconsistencias detectadas.`, issues.length ? 'warning' : 'success');
  }, 650);
}

function renderAll(state, source = '') {
  renderPersona(state);
  renderSidebar(state);
  renderConnection(state);
  renderKPIs(state);
  renderTables(state);
  renderLayerControls(state);
  renderJSONContract(state);
  renderLoading(state);
  renderToast(state.ui.toast);
  if (source !== 'selectFeature') renderSelectedDrawer(state);
}

function renderPersona(state) {
  qsa('[data-persona-panel]').forEach((panel) => {
    panel.classList.toggle('hidden', panel.dataset.personaPanel !== state.ui.persona);
  });
  qsa('[data-persona]').forEach((btn) => {
    const active = btn.dataset.persona === state.ui.persona;
    btn.classList.toggle('bg-[#9F2241]', active);
    btn.classList.toggle('text-white', active);
    btn.classList.toggle('bg-white', !active);
    btn.classList.toggle('text-[#9F2241]', !active);
  });
}

function renderSidebar(state) {
  qs('#sidebar')?.classList.toggle('lg:w-20', state.ui.sidebarCollapsed);
  qs('#sidebar')?.classList.toggle('lg:w-80', !state.ui.sidebarCollapsed);
  qsa('.sidebar-label').forEach((el) => el.classList.toggle('lg:hidden', state.ui.sidebarCollapsed));
}

function renderConnection(state) {
  const status = state.denue.status;
  const color = status === 'connected' ? 'bg-green-50 text-green-700' : status === 'error' ? 'bg-red-50 text-red-700' : status === 'loading' ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-gray-700';
  const dot = status === 'connected' ? 'status-ok' : status === 'error' ? 'status-bad' : status === 'loading' ? 'status-warn' : 'status-idle';
  qs('#denueStatusBadge').className = `pill ${color}`;
  qs('#denueStatusBadge').innerHTML = `<span class="status-dot ${dot}"></span>${escapeHtml(state.denue.message)}`;
}

function renderKPIs(state) {
  setText('#kpiDenue', state.metrics.denueCount);
  setText('#kpiMarkets', state.metrics.marketCount);
  setText('#kpiZoning', state.metrics.zoningCount);
  setText('#kpiIssues', state.metrics.issueCount);
  setText('#kpiCoverage', `${state.metrics.coverage}%`);
  setText('#kpiScore', state.metrics.compatibilityScore);
  setText('#businessScore', state.metrics.compatibilityScore || 78);
  setText('#businessScoreLabel', state.metrics.compatibilityScore >= 80 ? 'Alta viabilidad' : state.metrics.compatibilityScore >= 60 ? 'Viabilidad media controlada' : 'Revisión prioritaria');
  setText('#businessInsight', `Cotejo ${state.denue.source}: ${state.metrics.denueCount} unidades económicas, ${state.metrics.issueCount} alertas y ${state.metrics.zoningCount} polígonos SEDUVI demo.`);
}

function renderTables(state) {
  const issueBody = qs('#issuesTableBody');
  if (issueBody) {
    issueBody.innerHTML = state.inconsistencies.length ? state.inconsistencies.map((i) => `
      <tr class="cursor-pointer hover:bg-[#9F2241]/5" data-issue-id="${i.id}">
        <td class="font-extrabold text-[#691C32]">${escapeHtml(i.type)}</td>
        <td>${escapeHtml(i.source)}</td>
        <td>${escapeHtml(i.problem)}</td>
        <td>${escapeHtml(i.borough)}</td>
        <td><span class="pill ${i.priority === 'Alta' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}">${escapeHtml(i.priority)}</span></td>
        <td>${escapeHtml(i.action)}</td>
      </tr>`).join('') : `<tr><td colspan="6" class="text-center py-10 text-[#9F2241]/50 font-bold">Sin inconsistencias. Ejecuta el cotejo DENUE + SEDUVI.</td></tr>`;
    qsa('[data-issue-id]').forEach((row) => row.addEventListener('click', () => {
      const id = row.dataset.issueId;
      mapAPI.flyToFeature(id);
      handleFeatureSelection(id, state.inconsistencies.find((i) => i.id === id));
    }));
  }

  const denueBody = qs('#denueTableBody');
  if (denueBody) {
    denueBody.innerHTML = state.denue.features.slice(0, 12).map((f) => `
      <tr class="cursor-pointer hover:bg-[#9F2241]/5" data-feature-id="${f.properties.id}">
        <td class="font-extrabold">${escapeHtml(f.properties.name)}</td>
        <td>${escapeHtml(f.properties.class || 'N/D')}</td>
        <td>${escapeHtml(f.properties.borough || 'CDMX')}</td>
        <td>${escapeHtml(f.properties.employees || 'N/D')}</td>
      </tr>`).join('') || `<tr><td colspan="4" class="text-center py-8 text-[#9F2241]/50 font-bold">Consulta DENUE o carga datos demo.</td></tr>`;
    qsa('[data-feature-id]').forEach((row) => row.addEventListener('click', () => {
      mapAPI.flyToFeature(row.dataset.featureId);
      handleFeatureSelection(row.dataset.featureId);
    }));
  }
}

function renderLayerControls(state) {
  qsa('[data-layer]').forEach((control) => {
    control.checked = state.layers[control.dataset.layer] !== false;
  });
  qsa('[data-opacity]').forEach((range) => {
    range.value = Math.round((state.opacity[range.dataset.opacity] ?? 1) * 100);
  });
}

function renderInspectionDrawer(feature) {
  const drawer = qs('#inspectionDrawer');
  const content = qs('#inspectionContent');
  const state = store.getState();
  const selected = feature || findFeatureById(state.ui.selectedFeatureId);
  if (!drawer || !content || !selected) return;

  const isIssue = Boolean(selected.problem);
  const coordinates = isIssue ? selected.coordinates : selected.geometry.coordinates;
  const props = isIssue ? selected : selected.properties;
  drawer.classList.remove('translate-x-full');
  content.innerHTML = `
    <div class="rounded-[2rem] overflow-hidden bg-[#F6F1EB] border border-[#9F2241]/10">
      <img src="${props.photo || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop'}" class="h-44 w-full object-cover" alt="Ficha técnica" />
      <div class="p-5">
        <p class="text-xs font-black uppercase tracking-[.16em] text-[#BC955C]">Ficha técnica de inspección</p>
        <h3 class="text-2xl font-black text-[#9F2241] mt-2">${escapeHtml(props.name || props.type)}</h3>
        <p class="text-sm font-semibold text-[#691C32]/65 mt-2">${escapeHtml(props.problem || props.class || props.zoningType || 'Registro territorial')}</p>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-3 mt-5">
      ${drawerMetric('Latitud', Number(coordinates[1]).toFixed(6))}
      ${drawerMetric('Longitud', Number(coordinates[0]).toFixed(6))}
      ${drawerMetric('Fuente', props.source || 'Radar CDMX')}
      ${drawerMetric('Alcaldía', props.borough || 'CDMX')}
    </div>
    <div class="mt-5 bg-white rounded-[2rem] p-5 border border-[#9F2241]/10">
      <h4 class="font-black text-[#9F2241] mb-3">Normativa / reglas violentadas</h4>
      <ul class="space-y-2 text-sm font-semibold text-[#691C32]/70">
        ${(props.legal || ['Compatibilidad de uso de suelo', 'Cotejo de giro económico', 'Calidad de dato georreferenciado']).map((x) => `<li class="flex gap-2"><span class="material-symbols-outlined text-red-600 text-[18px]">gavel</span>${escapeHtml(x)}</li>`).join('')}
      </ul>
    </div>
    <div class="mt-5 bg-white rounded-[2rem] p-5 border border-[#9F2241]/10">
      <h4 class="font-black text-[#9F2241] mb-3">Historial de denuncias simulado</h4>
      <p class="text-sm font-semibold text-[#691C32]/70">${props.complaints ?? Math.floor(Math.random() * 4)} reportes históricos vinculados por zona, ruido, giro o verificación administrativa.</p>
    </div>
    <button class="mt-5 w-full bg-[#9F2241] text-white rounded-2xl py-4 font-black" onclick="window.print()">Generar acta preliminar</button>
  `;
}

function renderSelectedDrawer(state) {
  if (state.ui.activeDrawer === 'inspection') renderInspectionDrawer();
}

function closeDrawer() {
  qs('#inspectionDrawer')?.classList.add('translate-x-full');
  store.setState({ ui: { activeDrawer: null, selectedFeatureId: null } }, 'closeDrawer');
}

function renderJSONContract(state) {
  const contract = {
    frontend_state: {
      filters: state.filters,
      layers: state.layers,
      metrics: state.metrics
    },
    denue_api: {
      official_method: 'Buscar',
      direct_url_template: 'https://www.inegi.org.mx/app/api/denue/v1/consulta/Buscar/{condicion}/{lat},{lng}/{distancia}/{token}',
      recommended_proxy: '/api/sedeco/denue/buscar?condition&lat&lng&radius',
      max_radius_m: 5000
    },
    crosscheck_payload: {
      denue_features: 'FeatureCollection<Point>',
      seduvi_zoning: 'FeatureCollection<Polygon>',
      markets: 'FeatureCollection<Point>',
      rules: ['allowedUses', 'zoningStatus', 'businessType', 'boroughBoundary']
    },
    output: {
      inconsistencies: state.inconsistencies,
      selected_feature_id: state.ui.selectedFeatureId
    }
  };
  qs('#jsonContract').textContent = JSON.stringify(contract, null, 2);
}

function renderLoading(state) {
  const overlay = qs('#loadingOverlay');
  if (!overlay) return;
  overlay.classList.toggle('hidden', !state.ui.loading);
  setText('#loadingMessage', state.ui.loadingMessage || 'Procesando...');
}

let toastTimer;
function renderToast(toast) {
  if (!toast) return;
  const container = qs('#toastContainer');
  const color = toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : toast.type === 'warning' ? 'bg-[#BC955C] text-[#691C32]' : 'bg-[#691C32]';
  container.innerHTML = `<div class="${color} text-white shadow-2xl rounded-2xl px-5 py-4 font-bold flex items-center gap-3"><span class="material-symbols-outlined">${toast.type === 'error' ? 'error' : toast.type === 'success' ? 'check_circle' : 'info'}</span>${escapeHtml(toast.message)}</div>`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { container.innerHTML = ''; }, 3800);
}

async function handleFileUpload(event) {
  const files = [...(event.target.files || [])];
  for (const file of files) {
    if (!/\.geojson$|\.json$|\.csv$/i.test(file.name)) {
      store.showToast(`Archivo no soportado: ${file.name}`, 'error');
      continue;
    }
    const text = await file.text();
    if (/\.geojson$|\.json$/i.test(file.name)) {
      try {
        const geojson = JSON.parse(text);
        if (!isEPSG4326(geojson)) {
          store.showToast(`CRS no compatible en ${file.name}. Se requiere EPSG:4326.`, 'error');
          continue;
        }
        store.setState({ uploadedLayers: [...store.getState().uploadedLayers, { name: file.name, type: 'GeoJSON', count: geojson.features?.length || 0 }] }, 'upload');
        store.showToast(`${file.name} cargado.`, 'success');
      } catch {
        store.showToast(`GeoJSON inválido: ${file.name}`, 'error');
      }
    } else {
      store.setState({ uploadedLayers: [...store.getState().uploadedLayers, { name: file.name, type: 'CSV', count: 'pendiente normalización' }] }, 'upload');
      store.showToast(`CSV recibido: ${file.name}. Enviar a backend para normalización.`, 'warning');
    }
  }
}

function isEPSG4326(geojson) {
  const crs = geojson.crs?.properties?.name || 'EPSG:4326';
  return /4326|CRS84/i.test(crs);
}

function exportGeoJSON() {
  const state = store.getState();
  const collection = { type: 'FeatureCollection', features: [...state.denue.features, ...state.markets] };
  const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/geo+json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'radar_cdmx_denue_mercados.geojson';
  a.click();
  URL.revokeObjectURL(url);
}

function findFeatureById(id) {
  const state = store.getState();
  return [...state.denue.features, ...state.markets, ...state.zoning].find((f) => f.properties?.id === id) || state.inconsistencies.find((i) => i.id === id);
}

function drawerMetric(label, value) {
  return `<div class="bg-white rounded-2xl p-4 border border-[#9F2241]/10"><p class="text-[10px] uppercase tracking-[.14em] font-black text-[#9F2241]/45">${escapeHtml(label)}</p><p class="font-black text-[#691C32] mt-1 break-all">${escapeHtml(value)}</p></div>`;
}

function qs(selector) { return document.querySelector(selector); }
function qsa(selector) { return [...document.querySelectorAll(selector)]; }
function setText(selector, value) { const el = qs(selector); if (el) el.textContent = value; }
function setInputValue(selector, value) { const el = qs(selector); if (el) el.value = value; }
function escapeHtml(value = '') { const div = document.createElement('div'); div.textContent = String(value); return div.innerHTML; }
