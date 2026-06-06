const BASE_URL = process.env.SAPTIVA_BASE_URL ?? "https://api.saptiva.com";
const API_KEY = process.env.SAPTIVA_API_KEY ?? "";

function headers() {
  return {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  };
}

export type Message = { role: "user" | "assistant" | "system"; content: string };

export async function chat(
  model: string,
  messages: Message[],
  opts: { temperature?: number; max_tokens?: number; guard?: boolean; stream?: boolean } = {}
) {
  const res = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model,
      messages,
      temperature: opts.temperature ?? 0.3,
      max_tokens: opts.max_tokens ?? 1200,
      guard: opts.guard ?? false,
      stream: opts.stream ?? false,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Saptiva error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content as string;
}

export async function ocr(imageUrlOrBase64: string) {
  const isBase64 = imageUrlOrBase64.startsWith("data:");
  const content = isBase64
    ? [
        { type: "text", text: "Extrae todo el texto de este documento con precisión." },
        { type: "image_url", image_url: { url: imageUrlOrBase64 } },
      ]
    : [
        { type: "text", text: "Extrae todo el texto de este documento con precisión." },
        { type: "image_url", image_url: { url: imageUrlOrBase64 } },
      ];

  const res = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model: "Saptiva OCR",
      messages: [{ role: "user", content }],
      max_tokens: 2000,
    }),
  });

  if (!res.ok) throw new Error(`OCR error ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content as string;
}

export async function embed(text: string): Promise<number[]> {
  const res = await fetch(`${BASE_URL}/api/embed`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model: "Saptiva Embed",
      prompt: text,
    }),
  });

  if (!res.ok) throw new Error(`Embed error ${res.status}`);
  const data = await res.json();
  return data.embedding ?? data.data?.[0]?.embedding ?? [];
}

function cosineSim(a: number[], b: number[]) {
  const dot = a.reduce((s, v, i) => s + v * b[i], 0);
  const ma = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const mb = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  return dot / (ma * mb);
}

export type DocCategory = {
  label: string;
  description: string;
  examples: string;
};

export async function chatStream(
  model: string,
  messages: Message[],
  opts: { temperature?: number; max_tokens?: number } = {}
): Promise<ReadableStream<string>> {
  const res = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model,
      messages,
      temperature: opts.temperature ?? 0.3,
      max_tokens: opts.max_tokens ?? 1800,
      stream: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Saptiva stream error ${res.status}: ${err}`);
  }

  const body = res.body!;
  return new ReadableStream<string>({
    async start(controller) {
      const reader = body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") { controller.close(); return; }
          try {
            const chunk = JSON.parse(raw);
            const delta = chunk.choices?.[0]?.delta?.content;
            if (delta) controller.enqueue(delta);
          } catch { /* skip malformed */ }
        }
      }
      controller.close();
    },
  });
}

export type ExtractedFields = {
  nombre?: string; curp?: string; rfc?: string;
  giro?: string; superficie?: string; domicilio?: string;
  telefono?: string; correo?: string;
};

export async function extractFields(ocrText: string): Promise<ExtractedFields> {
  const resp = await chat(
    "Saptiva KAL",
    [
      {
        role: "system",
        content: "Eres un extractor de datos de documentos gubernamentales de México. Responde SOLO con JSON válido, sin markdown.",
      },
      {
        role: "user",
        content: `Del siguiente texto extraído por OCR de un documento ciudadano, extrae los campos disponibles y devuelve SOLO un objeto JSON con las claves: nombre, curp, rfc, giro, superficie, domicilio, telefono, correo. Si un campo no aparece, omítelo del JSON.

TEXTO:
${ocrText.slice(0, 2000)}`,
      },
    ],
    { temperature: 0.1, max_tokens: 400 }
  );
  try {
    const clean = resp.replace(/```json|```/g, "").trim();
    return JSON.parse(clean) as ExtractedFields;
  } catch {
    return {};
  }
}

export async function classifyDocument(
  text: string,
  categories: DocCategory[]
): Promise<{ label: string; score: number }> {
  const textEmbed = await embed(text.slice(0, 500));

  const scores = await Promise.all(
    categories.map(async (cat) => {
      const catEmbed = await embed(`${cat.label}: ${cat.description}. ${cat.examples}`);
      return { label: cat.label, score: cosineSim(textEmbed, catEmbed) };
    })
  );

  return scores.sort((a, b) => b.score - a.score)[0];
}
