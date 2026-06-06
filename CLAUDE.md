# SecretarIA — Procesador de documentos para SEDECO CDMX

Single-page web app para el Hackathon SecretarIA (6 junio 2025). Clasifica y responde documentos ciudadanos usando la API de Saptiva AI.

## Estructura

```
secretaria/
├── src/
│   ├── app/
│   │   ├── page.tsx                # Única página (SPA)
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── api/process/route.ts   # Pipeline OCR → Embed → KAL
│   ├── components/
│   │   ├── DocumentProcessor.tsx  # Uploader + resultado principal
│   │   └── Header.tsx
│   └── lib/
│       ├── saptiva.ts             # Cliente Saptiva (chat, ocr, embed)
│       └── categories.ts          # 8 categorías SEDECO
├── .env.example
└── .env.local                     # no se commitea
```

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · GSAP para animaciones.

## API Saptiva

Endpoint: `POST https://api.saptiva.com/v1/chat/completions`
Auth: `Authorization: Bearer <SAPTIVA_API_KEY>`

Modelos usados:
- `Saptiva OCR` — extracción de texto de imágenes/PDFs
- `Saptiva Embed` — embeddings para clasificación por cosine similarity
- `Saptiva KAL` — análisis y respuesta borrador (contexto México/CDMX)
- `guard: true` — revisión de seguridad en respuesta de KAL

## Variables de entorno

- `SAPTIVA_API_KEY` — obtener en lab.saptiva.com
- `SAPTIVA_BASE_URL` — https://api.saptiva.com (default)

## Comandos

```bash
cp .env.example .env.local   # llenar con API key
npm install
npm run dev                  # http://localhost:3000
npm run build
```

## Convenciones

- Una sola página web. No agregar rutas.
- Animaciones: GSAP. No CSS transitions ni Framer Motion.
- Commits en español, sin menciones de herramientas de IA en el código ni mensajes.
- `.env.local` nunca se commitea.
