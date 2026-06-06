import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/saptiva";

export const maxDuration = 60;

const SYSTEM = `Eres SecretarIA, asistente de análisis de la Secretaría de Desarrollo Económico de la Ciudad de México.
Analizas expedientes ciudadanos y produces un dictamen estructurado para el funcionario revisor.
Responde SIEMPRE en español formal. Sé conciso y preciso.`;

export async function POST(req: NextRequest) {
  try {
    const { caso } = await req.json() as {
      caso: {
        folio: string; name: string; type: string; category: string;
        summary: string; giro: string; area: string; priority: string;
        legalDays: number; legalUsed: number;
        docs: { name: string; ok: boolean }[];
      };
    };

    const docsOk = caso.docs.filter(d => d.ok).map(d => d.name);
    const docsFail = caso.docs.filter(d => !d.ok).map(d => d.name);

    const prompt = `Analiza el siguiente expediente ciudadano recibido en SEDECO CDMX:

Folio: ${caso.folio}
Solicitante: ${caso.name}
Tipo de trámite: ${caso.type}
Categoría: ${caso.category}
Giro comercial: ${caso.giro}
Superficie/Área: ${caso.area}
Resumen de la solicitud: ${caso.summary}
Prioridad actual: ${caso.priority}
Días hábiles del trámite: ${caso.legalDays} (transcurridos: ${caso.legalUsed})
Documentos válidos: ${docsOk.length > 0 ? docsOk.join(", ") : "ninguno"}
Documentos con problemas: ${docsFail.length > 0 ? docsFail.join(", ") : "ninguno"}

Produce un análisis con exactamente este formato JSON (sin markdown):
{
  "resumen": "párrafo de 2-3 oraciones resumiendo el caso",
  "accion": "instrucción concreta de qué debe hacer el funcionario ahora",
  "prioridadTxt": "etiqueta de prioridad + justificación breve (ej: 'ALTA · Giro con alcohol')",
  "riesgos": "lista separada por comas de riesgos o puntos de atención (vacío si no hay)",
  "plazo": "recomendación sobre el plazo de respuesta"
}`;

    const resp = await chat("Saptiva KAL", [
      { role: "system", content: SYSTEM },
      { role: "user", content: prompt },
    ], { temperature: 0.2, max_tokens: 800 });

    const clean = resp.replace(/```json|```/g, "").trim();
    const analysis = JSON.parse(clean);

    return NextResponse.json({ analysis });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
