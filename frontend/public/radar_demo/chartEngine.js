/**
 * chartEngine.js
 * Motor analítico con Chart.js.
 * Responsabilidad exclusiva: crear y actualizar gráficas.
 */
let charts = {};

const colors = {
  primary: '#9F2241',
  secondary: '#691C32',
  gold: '#BC955C',
  green: '#2E7D32',
  red: '#C62828',
  gray: '#6F7271'
};

export function initCharts() {
  charts.activity = new Chart(document.getElementById('activityChart'), {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Unidades', data: [], backgroundColor: colors.primary, borderRadius: 10 }] },
    options: baseOptions()
  });

  charts.zoning = new Chart(document.getElementById('zoningChart'), {
    type: 'doughnut',
    data: { labels: ['Compatible', 'Revisión', 'Restringido'], datasets: [{ data: [1, 1, 1], backgroundColor: [colors.green, colors.gold, colors.red] }] },
    options: { plugins: { legend: { position: 'bottom' } }, cutout: '62%' }
  });

  charts.compare = new Chart(document.getElementById('compareChart'), {
    type: 'radar',
    data: {
      labels: ['DENUE', 'Mercados', 'Uso de suelo', 'Alertas', 'Oportunidad'],
      datasets: [
        { label: 'Cuauhtémoc', data: [90, 80, 70, 45, 82], borderColor: colors.primary, backgroundColor: 'rgba(159,34,65,.12)' },
        { label: 'Miguel Hidalgo', data: [72, 55, 84, 28, 77], borderColor: colors.gold, backgroundColor: 'rgba(188,149,92,.18)' }
      ]
    },
    options: { scales: { r: { beginAtZero: true, max: 100, grid: { color: 'rgba(105,28,50,.12)' } } } }
  });
}

export function updateCharts(state) {
  if (!charts.activity) return;
  const grouped = groupActivities(state.denue.features);
  charts.activity.data.labels = Object.keys(grouped).slice(0, 7);
  charts.activity.data.datasets[0].data = Object.values(grouped).slice(0, 7);
  charts.activity.update();

  const zoneCounts = countZones(state.zoning);
  charts.zoning.data.datasets[0].data = [zoneCounts.compatible, zoneCounts.review, zoneCounts.restricted];
  charts.zoning.update();

  charts.compare.data.datasets[0].data = [state.metrics.denueCount ? 90 : 35, state.metrics.marketCount * 14, state.metrics.zoningCount * 18, state.metrics.issueCount * 12, state.metrics.compatibilityScore];
  charts.compare.data.datasets[1].data = [70, 62, 78, 22, 76];
  charts.compare.update();
}

function groupActivities(features) {
  const counts = {};
  features.forEach((f) => {
    const label = cleanLabel(f.properties.class || 'Sin clase');
    counts[label] = (counts[label] || 0) + 1;
  });
  if (!Object.keys(counts).length) {
    return { Cafeterías: 4, Restaurantes: 3, Farmacias: 2, Belleza: 2, Abarrotes: 1 };
  }
  return Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1]));
}

function countZones(zones) {
  return zones.reduce((acc, z) => {
    acc[z.properties.status] = (acc[z.properties.status] || 0) + 1;
    return acc;
  }, { compatible: 0, review: 0, restricted: 0 });
}

function cleanLabel(text) {
  return String(text).replace(/Comercio al por menor de|Servicios de|Restaurantes con servicio de/gi, '').trim().slice(0, 24) || 'Actividad';
}

function baseOptions() {
  return {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: colors.secondary, font: { weight: 700 } } },
      y: { beginAtZero: true, grid: { color: 'rgba(105,28,50,.10)' }, ticks: { precision: 0 } }
    }
  };
}
