import { NextRequest, NextResponse } from "next/server";
import { chat, ocr, classifyDocument } from "@/lib/saptiva";
import { SEDECO_CATEGORIES } from "@/lib/categories";

export const maxDuration = 60;

const SYSTEM_PROMPT = `Eres SecretarIA, el asistente de IA de la Secretaría de Desarrollo Económico de la Ciudad de México (SEDECO).
Tu rol es apoyar al personal de SEDECO para procesar documentos ciudadanos de forma eficiente.

INSTRUCCIONES:
- Responde SIEMPRE en español formal, como corresponde a una institución de gobierno de la CDMX.
- Sé preciso, claro y profesional.
- Si el documento requiere acción, indica los pasos a seguir según los procedimientos de SEDECO.
- Si faltan datos para procesar el trámite, indica exactamente qué información falta.
- Siempre incluye el número de folio o referencia si se menciona en el documento.`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const textInput = formData.get("text") as string | null;

    let extractedText = "";

    if (file) {
      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      const mimeType = file.type || "application/octet-stream";
      const dataUrl = `data:${mimeType};base64,${base64}`;

      if (mimeType.startsWith("image/")) {
        extractedText = await ocr(dataUrl);
      } else {
        // PDF u otro: intenta OCR igual
        extractedText = await ocr(dataUrl);
      }
    } else if (textInput) {
      extractedText = textInput;
    } else {
      return NextResponse.json({ error: "Se requiere un archivo o texto." }, { status: 400 });
    }

    // Clasificar el documento
    const classification = await classifyDocument(extractedText, SEDECO_CATEGORIES);

    // Generar respuesta y análisis con KAL (contexto México)
    const analysis = await chat(
      "Saptiva KAL",
      [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analiza el siguiente documento ciudadano recibido en SEDECO.

TEXTO DEL DOCUMENTO:
${extractedText}

CATEGORÍA DETECTADA: ${classification.label} (confianza: ${(classification.score * 100).toFixed(1)}%)

Por favor proporciona:
1. **Resumen ejecutivo** (2-3 líneas)
2. **Datos del solicitante** detectados (nombre, RFC, dirección, teléfono si aparecen)
3. **Petición principal** del ciudadano
4. **Acción recomendada** para el funcionario de SEDECO
5. **Borrador de respuesta** oficial para enviar al ciudadano
6. **Prioridad** (Alta / Media / Baja) y justificación`,
        },
      ],
      { temperature: 0.2, max_tokens: 1500, guard: true }
    );

    return NextResponse.json({
      extractedText,
      classification,
      analysis,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
