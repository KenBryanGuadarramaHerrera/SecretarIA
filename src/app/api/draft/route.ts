import { NextRequest } from "next/server";
import { chatStream } from "@/lib/saptiva";

export const maxDuration = 60;

const SYSTEM = `Eres SecretarIA, asistente oficial de la Secretaría de Desarrollo Económico de la Ciudad de México (SEDECO).
Redactas comunicaciones oficiales en español formal, siguiendo el estilo de oficio gubernamental mexicano.
Usa tratamientos formales (C., Lic., Ing.) y cierra siempre con "A t e n t a m e n t e," seguido de la dirección firmante.
Sé preciso, profesional y claro. No uses emojis ni lenguaje informal.`;

export async function POST(req: NextRequest) {
  const { caso, modo } = await req.json() as {
    caso: { folio: string; name: string; type: string; category: string; giro: string; area: string; detail: { resumen: string; accion: string } };
    modo: "aprobar" | "info" | "rechazar" | "general";
  };

  const today = new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });

  const contexto = `
Folio: ${caso.folio}
Solicitante: ${caso.name}
Tipo de trámite: ${caso.type}
Categoría: ${caso.category}
Giro: ${caso.giro}
Superficie/Área: ${caso.area}
Resumen del caso: ${caso.detail.resumen}
Acción recomendada: ${caso.detail.accion}
  `.trim();

  const instruccion: Record<string, string> = {
    aprobar: "Redacta un oficio de APROBACIÓN del trámite. Indica que la documentación fue revisada y cumple con los requisitos. Incluye la instrucción de descargar el comprobante.",
    info: "Redacta un oficio de PREVENCIÓN solicitando información o documentación adicional faltante. Indica exactamente qué se requiere y el plazo para entregarlo.",
    rechazar: "Redacta un oficio de NEGATIVA o RECHAZO del trámite. Fundamenta brevemente la razón del rechazo con base en el caso y menciona el derecho a recurso de inconformidad.",
    general: "Redacta un oficio de acuse de recibo y seguimiento. Informa que el trámite está en proceso de revisión e indica el tiempo estimado de respuesta.",
  };

  const prompt = `Genera un oficio oficial completo para el siguiente caso de SEDECO:

${contexto}

INSTRUCCIÓN: ${instruccion[modo] ?? instruccion.general}

Fecha del oficio: ${today}
El oficio debe comenzar directamente con "Ciudad de México, a ${today}."`;

  try {
    const stream = await chatStream("Saptiva KAL", [
      { role: "system", content: SYSTEM },
      { role: "user", content: prompt },
    ], { temperature: 0.25, max_tokens: 1200 });

    const encoder = new TextEncoder();
    const readable = stream.pipeThrough(
      new TransformStream<string, Uint8Array>({
        transform(chunk, ctrl) { ctrl.enqueue(encoder.encode(chunk)); },
      })
    );

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
