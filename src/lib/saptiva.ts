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
