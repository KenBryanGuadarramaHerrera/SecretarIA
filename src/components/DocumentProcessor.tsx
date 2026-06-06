"use client";

import { useRef, useState, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

type ProcessResult = {
  extractedText: string;
  classification: { label: string; score: number };
  analysis: string;
};

type Stage = "idle" | "uploading" | "ocr" | "classifying" | "analyzing" | "done" | "error";

const STAGE_LABELS: Record<Stage, string> = {
  idle: "",
  uploading: "Cargando documento...",
  ocr: "Extrayendo texto con OCR...",
  classifying: "Clasificando documento...",
  analyzing: "Analizando con IA gubernamental...",
  done: "Análisis completo",
  error: "Error en el procesamiento",
};

function AnalysisSection({ text }: { text: string }) {
  const formatted = text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");

  return (
    <div
      className="prose-gov text-sm leading-relaxed"
      dangerouslySetInnerHTML={{ __html: `<p>${formatted}</p>` }}
    />
  );
}

export default function DocumentProcessor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const [stage, setStage] = useState<Stage>("idle");
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string>("");
  const [dragging, setDragging] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [mode, setMode] = useState<"file" | "text">("file");

  useGSAP(() => {
    gsap.from(containerRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: "power3.out",
    });
  }, { scope: containerRef });

  const animateProgress = useCallback((to: number) => {
    if (progressRef.current) {
      gsap.to(progressRef.current, {
        width: `${to}%`,
        duration: 0.6,
        ease: "power2.out",
      });
    }
  }, []);

  const showResult = useCallback(() => {
    if (resultRef.current) {
      gsap.from(resultRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.7,
        ease: "power3.out",
      });
    }
  }, []);

  async function process(formData: FormData) {
    setError("");
    setResult(null);

    setStage("uploading");
    animateProgress(10);

    await new Promise((r) => setTimeout(r, 300));
    setStage("ocr");
    animateProgress(30);

    const res = await fetch("/api/process", {
      method: "POST",
      body: formData,
    });

    setStage("classifying");
    animateProgress(60);

    await new Promise((r) => setTimeout(r, 300));
    setStage("analyzing");
    animateProgress(85);

    const data = await res.json();

    if (!res.ok) {
      setStage("error");
      setError(data.error ?? "Error desconocido");
      return;
    }

    animateProgress(100);
    setStage("done");
    setResult(data);
    setTimeout(showResult, 100);
  }

  const handleFile = useCallback(
    async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      await process(fd);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [animateProgress, showResult]
  );

  const handleText = useCallback(async () => {
    if (!textInput.trim()) return;
    const fd = new FormData();
    fd.append("text", textInput);
    await process(fd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textInput, animateProgress, showResult]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const isProcessing = ["uploading", "ocr", "classifying", "analyzing"].includes(stage);

  const priorityColor = (analysis: string) => {
    if (analysis.toLowerCase().includes("alta")) return "bg-red-100 text-red-700 border-red-200";
    if (analysis.toLowerCase().includes("media")) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-green-100 text-green-700 border-green-200";
  };

  return (
    <div ref={containerRef} className="w-full max-w-3xl mx-auto space-y-6">
      {/* Tabs modo */}
      <div className="flex gap-2 p-1 bg-white rounded-xl border border-gray-200 w-fit">
        {(["file", "text"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === m
                ? "bg-[#C8102E] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {m === "file" ? "📄 Subir archivo" : "✏️ Pegar texto"}
          </button>
        ))}
      </div>

      {/* Drop zone / Text input */}
      {mode === "file" ? (
        <div
          ref={dropRef}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
            dragging
              ? "border-[#C8102E] bg-red-50 scale-[1.01]"
              : "border-gray-300 bg-white hover:border-[#C8102E] hover:bg-red-50/30"
          }`}
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <input
            id="file-input"
            type="file"
            className="hidden"
            accept="image/*,.pdf"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <div className="text-5xl mb-4">📂</div>
          <p className="text-gray-600 font-medium">
            Arrastra un documento aquí o haz clic para seleccionar
          </p>
          <p className="text-gray-400 text-sm mt-1">
            PDF, JPG, PNG, WEBP — documentos de ciudadanos para SEDECO
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Pega aquí el texto del documento ciudadano..."
            className="w-full h-48 text-sm resize-none outline-none text-gray-700 placeholder-gray-400"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleText}
              disabled={!textInput.trim() || isProcessing}
              className="px-5 py-2 bg-[#C8102E] text-white text-sm font-medium rounded-lg disabled:opacity-40 hover:bg-red-700 transition-colors"
            >
              Procesar documento →
            </button>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {isProcessing && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-3 font-medium">{STAGE_LABELS[stage]}</p>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div ref={progressRef} className="h-full bg-[#C8102E] rounded-full" style={{ width: "0%" }} />
          </div>
        </div>
      )}

      {/* Error */}
      {stage === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Resultado */}
      {result && (
        <div ref={resultRef} className="space-y-4">
          {/* Badge de clasificación */}
          <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-200 p-4">
            <div className="text-2xl">🏷️</div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Categoría detectada</p>
              <p className="font-semibold text-gray-800">{result.classification.label}</p>
            </div>
            <div className="ml-auto text-right">
              <span className={`text-xs px-3 py-1 rounded-full border font-medium ${priorityColor(result.analysis)}`}>
                {(result.classification.score * 100).toFixed(0)}% confianza
              </span>
            </div>
          </div>

          {/* Texto extraído */}
          <details className="bg-white rounded-2xl border border-gray-200">
            <summary className="p-4 cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
              📝 Texto extraído del documento
            </summary>
            <div className="px-4 pb-4 text-xs text-gray-500 font-mono whitespace-pre-wrap border-t border-gray-100 pt-3">
              {result.extractedText}
            </div>
          </details>

          {/* Análisis completo */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <span className="text-lg">🤖</span>
              <h3 className="font-semibold text-gray-800">Análisis SecretarIA</h3>
              <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                Saptiva KAL
              </span>
            </div>
            <AnalysisSection text={result.analysis} />
          </div>

          {/* Reset */}
          <button
            onClick={() => { setResult(null); setStage("idle"); setTextInput(""); }}
            className="w-full py-3 text-sm text-gray-500 hover:text-[#C8102E] transition-colors"
          >
            ← Procesar otro documento
          </button>
        </div>
      )}
    </div>
  );
}
