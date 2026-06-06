import { NextRequest, NextResponse } from "next/server";
import { ocr, extractFields } from "@/lib/saptiva";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "Se requiere un archivo." }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mime = file.type || "application/octet-stream";
    const dataUrl = `data:${mime};base64,${base64}`;

    const text = await ocr(dataUrl);
    const fields = await extractFields(text);

    return NextResponse.json({ text, fields });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
