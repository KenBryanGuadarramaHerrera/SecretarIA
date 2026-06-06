/**
 * app.js
 * Orquestador principal. Inicializa módulos y conecta estado -> mapa -> charts -> UI.
 */
import { store } from './state.js';
import { mockDENUE, mockMarkets, mockZoning } from './dataService.js';
import { initMap, renderMapState, flyToFeature, flyToZone, invalidateSize, getCenter } from './mapEngine.js';
import { initCharts, updateCharts } from './chartEngine.js';
import { initUI, handleFeatureSelection } from './uiController.js';

const map = initMap({
  elementId: 'map',
  onFeatureClick: handleFeatureSelection
});

initCharts();
initUI({
  map: { flyToFeature, flyToZone, invalidateSize, getCenter },
  charts: { updateCharts }
});

store.subscribe((state) => {
  renderMapState(state);
  updateCharts(state);
});

window.addEventListener('radar:loadMock', loadMockData);
loadMockData();

function loadMockData() {
  store.setState({
    denue: {
      features: mockDENUE,
      source: 'mock',
      status: store.getState().denue.token ? 'idle' : 'idle',
      message: store.getState().denue.token ? 'Token listo. Datos demo visibles.' : 'Demo con datos mock. Conecta DENUE para datos en vivo.'
    },
    markets: mockMarkets,
    zoning: mockZoning,
    inconsistencies: []
  }, 'mockData');
}

// Exponer solo para debugging en hackathon.
window.RadarCDMX = { store };
