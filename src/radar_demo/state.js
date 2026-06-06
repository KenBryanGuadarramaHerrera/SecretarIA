/**
 * state.js
 * Estado global centralizado para Radar CDMX.
 * No manipula DOM ni Leaflet directamente.
 */
export const initialState = {
  ui: {
    persona: 'sedeco',
    theme: 'light',
    sidebarCollapsed: false,
    loading: false,
    loadingMessage: '',
    selectedFeatureId: null,
    activeDrawer: null,
    toast: null
  },
  filters: {
    borough: 'Cuauhtémoc',
    zone: 'Centro Histórico',
    businessType: 'cafetería',
    condition: 'cafetería',
    radius: 1500,
    center: { lat: 19.432608, lng: -99.133209 },
    zoningMode: 'all'
  },
  denue: {
    token: sessionStorage.getItem('INEGI_DENUE_TOKEN') || '',
    status: 'idle',
    message: 'Sin token INEGI conectado',
    features: [],
    lastQuery: null,
    source: 'mock'
  },
  layers: {
    denue: true,
    markets: true,
    zoning: true,
    inconsistencies: true,
    analysisRadius: true
  },
  opacity: {
    denue: 0.78,
    markets: 0.88,
    zoning: 0.22,
    inconsistencies: 0.90
  },
  markets: [],
  zoning: [],
  inconsistencies: [],
  uploadedLayers: [],
  metrics: {
    denueCount: 0,
    marketCount: 0,
    zoningCount: 0,
    issueCount: 0,
    compatibilityScore: 0,
    competitionIndex: 0,
    coverage: 0
  }
};

export const store = {
  state: structuredClone(initialState),
  listeners: new Set(),

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },

  getState() {
    return this.state;
  },

  setState(patch, source = 'unknown') {
    this.state = deepMerge(this.state, patch);
    this.recalculateMetrics();
    this.listeners.forEach((listener) => listener(this.state, source));
  },

  setLoading(loading, message = '') {
    this.setState({ ui: { loading, loadingMessage: message } }, 'loading');
  },

  showToast(message, type = 'info') {
    const id = crypto.randomUUID ? crypto.randomUUID() : `toast-${Date.now()}`;
    this.setState({ ui: { toast: { id, message, type } } }, 'toast');
  },

  selectFeature(featureId) {
    this.setState({ ui: { selectedFeatureId: featureId, activeDrawer: 'inspection' } }, 'selectFeature');
  },

  setDENUEStatus(status, message) {
    this.setState({ denue: { status, message } }, 'denueStatus');
  },

  recalculateMetrics() {
    const denueCount = this.state.denue.features.length;
    const marketCount = this.state.markets.length;
    const zoningCount = this.state.zoning.length;
    const issueCount = this.state.inconsistencies.length;
    const competitionIndex = Math.min(100, Math.round((denueCount / 60) * 100));
    const issuePenalty = Math.min(35, issueCount * 7);
    const compatibilityScore = Math.max(0, Math.min(100, 88 - issuePenalty - Math.round(competitionIndex * 0.12)));
    const coverage = Math.min(100, Math.round(((denueCount ? 1 : 0) + (marketCount ? 1 : 0) + (zoningCount ? 1 : 0)) / 3 * 100));
    this.state.metrics = { denueCount, marketCount, zoningCount, issueCount, compatibilityScore, competitionIndex, coverage };
  }
};

function deepMerge(target, source) {
  if (!source || typeof source !== 'object') return target;
  const output = Array.isArray(target) ? [...target] : { ...target };
  Object.keys(source).forEach((key) => {
    const value = source[key];
    if (Array.isArray(value)) {
      output[key] = value;
    } else if (value && typeof value === 'object') {
      output[key] = deepMerge(output[key] || {}, value);
    } else {
      output[key] = value;
    }
  });
  return output;
}

export const cdmxCenters = {
  'Centro Histórico': { lat: 19.432608, lng: -99.133209, borough: 'Cuauhtémoc' },
  'Roma Norte': { lat: 19.419392, lng: -99.162157, borough: 'Cuauhtémoc' },
  'Condesa': { lat: 19.412259, lng: -99.171338, borough: 'Cuauhtémoc' },
  'Polanco': { lat: 19.432022, lng: -99.197186, borough: 'Miguel Hidalgo' },
  'Del Valle': { lat: 19.380989, lng: -99.164802, borough: 'Benito Juárez' },
  'Coyoacán Centro': { lat: 19.349329, lng: -99.162091, borough: 'Coyoacán' }
};
