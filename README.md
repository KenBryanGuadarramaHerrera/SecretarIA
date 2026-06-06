# SecretarIA — SEDECO CDMX

### Sistema Inteligente para la Automatización, Predicción y Auditoría de Trámites Económicos

SecretarIA es una plataforma web diseñada para mitigar la saturación burocrática en la **Secretaría de Desarrollo Económico de la Ciudad de México (SEDECO)**. Automatiza la lectura, clasificación, validación y dictaminación de expedientes mediante **IA**, manteniendo siempre al funcionario en control del proceso (*Man-in-the-Loop*).

---

## Propuesta de Valor

* **Eficiencia Operativa:** Reduce el tiempo de procesamiento de expedientes de días a segundos.
* **Transparencia de Razonamiento (XAI):** El sistema explica *cómo y bajo qué criterios* razonó la IA antes de emitir una sugerencia.
* **Supervisión Humana Obligatoria:** La IA propone, pero jamás ejecuta. El funcionario corrige, edita o rechaza con un clic.
* **Portal Ciudadano Guiado:** Chat conversacional que detecta el trámite, solicita los documentos correctos y genera folio automáticamente.

---

## Módulos Implementados

### Portal Ciudadano
- **Iniciar trámite** — chat conversacional que detecta el tipo de trámite (aviso de funcionamiento, licencia con alcohol, apoyo FONDESO, etc.), lista los documentos requeridos y procesa el expediente con OCR
- **Seguimiento** — consulta de estado por folio con línea de tiempo del historial
- **Consulta rápida** — búsqueda semántica de requisitos, costos y tiempos por tipo de negocio

### Panel Funcionario
- **Bandeja de entrada** — inbox con filtros por prioridad/estado, indicador de días hábiles restantes por plazo legal
- **Detalle de caso** — análisis generado por Saptiva KAL, documentos del expediente con validación OCR, timer de plazo legal, generador de borrador de respuesta oficial
- **Panel de control (KPIs)** — métricas de solicitudes, tiempo de respuesta, gráficas por tipo de trámite y tabla de riesgo de vencimiento

---

## Stack Tecnológico

### Frontend / App
* **Next.js 15** (App Router, TypeScript)
* **Design system SEDECO** — branding CDMX con paleta institucional
* **GSAP** — animaciones y transiciones

### IA — API Saptiva
* **Saptiva OCR** — extracción de texto de imágenes y PDFs escaneados
* **Saptiva Embed** — embeddings para clasificación automática por similitud coseno
* **Saptiva KAL** — modelo Mistral 24B con contexto México/CDMX para análisis de casos y redacción de respuestas oficiales

### Pipeline de procesamiento
```
Documento → OCR (extracción de texto) → Embed (clasificación por categoría) → KAL (análisis + borrador)
```

---

## Instalación y ejecución

```bash
cp .env.example .env.local   # agregar SAPTIVA_API_KEY
npm install
npm run dev                  # http://localhost:3000
```

### Variables de entorno
```
SAPTIVA_API_KEY=obtener en lab.saptiva.com
SAPTIVA_BASE_URL=https://api.saptiva.com
```

---

## Arquitectura del proyecto

```
src/
├── app/
│   ├── page.tsx              # SPA — portal ciudadano + panel funcionario
│   ├── layout.tsx
│   ├── globals.css           # Design system SEDECO
│   └── api/process/route.ts  # Pipeline OCR → Embed → KAL
├── components/platform/
│   ├── Icons.tsx             # Iconografía y badges
│   ├── CitizenPortal.tsx     # Portal ciudadano (chat, seguimiento, consulta)
│   └── AdminPanel.tsx        # Panel funcionario (bandeja, caso, dashboard)
├── data/
│   └── sedeco.ts             # Datos tipados: casos, folios, consultas
└── lib/
    ├── saptiva.ts            # Cliente API (OCR, embed, KAL)
    └── categories.ts         # 8 categorías SEDECO para clasificación
```
