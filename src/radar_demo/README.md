# Radar CDMX — SEDECO + DENUE + SEDUVI

Plataforma de inteligencia territorial y gestión de trámites económicos para SEDECO CDMX.

## Flujo

1. **login.html** — punto de entrada. Valida usuario/negocio (RFC o CURP) o funcionario SEDECO.
   - Negocio → `simulador.html`
   - Funcionario → `solicitudes.html`
2. **simulador.html** — agentes de IA evalúan viabilidad (competencia DENUE, uso de suelo SEDUVI,
   cobertura de mercados, documentos) y devuelven score + razones + sugerencias. Envía la solicitud.
3. **solicitudes.html** — bandeja SEDECO: tabla de todas las solicitudes, diagnóstico de agentes y
   acciones Aprobar / Prevenir / Rechazar.
4. **index.html** — dashboard territorial (mapa, cotejo, DENUE, inconsistencias).

## Archivos

- `index.html`, `app.js`, `state.js`, `uiController.js`, `mapEngine.js`, `chartEngine.js`,
  `dataService.js` — app territorial original (módulos ES).
- `login.html`, `simulador.html`, `solicitudes.html` — páginas nuevas.
- `viabilityAgent.js` — motor de agentes de viabilidad (local; hook `useLLM` para agente on-prem).
- `api/denue_proxy.php` — proxy de backend: oculta el token de INEGI y resuelve CORS.

## Puesta en marcha

- Sirve la carpeta con cualquier servidor estático (los módulos ES requieren http, no `file://`):
  `python3 -m http.server 8000`  → abre http://localhost:8000/login.html
- DENUE: registra tu token en https://www.inegi.org.mx/app/desarrolladores/generatoken/Usuarios/token_Verify
  y colócalo en `api/denue_proxy.php` (variable de entorno `INEGI_DENUE_TOKEN`). No lo pongas en el frontend.

Datos de demostración. En producción: identidad vía SAT/RENAPO, agente IA on-prem, base de datos SEDECO.
