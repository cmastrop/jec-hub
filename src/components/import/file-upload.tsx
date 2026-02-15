"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileImage, FileText, Loader2, CheckCircle, AlertCircle, Sparkles } from "lucide-react";

type UploadState = "idle" | "uploading" | "processing" | "success" | "error";
type Provider = "gemini" | "claude";

export function FileUpload() {
  const [state, setState] = useState<UploadState>("idle");
  const [provider, setProvider] = useState<Provider>("gemini");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  const processFile = useCallback(
    async (file: File) => {
      // Validate client-side
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Tipo de archivo no soportado. Usa JPG, PNG, WebP o PDF.");
        setState("error");
        return;
      }
      if (file.size > MAX_SIZE) {
        setError("El archivo es demasiado grande. Maximo 10MB.");
        setState("error");
        return;
      }

      setError("");
      setState("uploading");

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("provider", provider);

        setState("processing");

        const res = await fetch("/api/songs/import", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Error al importar");
        }

        setState("success");

        // Redirect to the new song for editing
        setTimeout(() => {
          router.push(`/canciones/${data.songId}`);
        }, 1500);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        setState("error");
      }
    },
    [provider, router]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleReset = () => {
    setState("idle");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      {/* Provider selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-600">Proveedor AI:</span>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="radio"
            name="provider"
            value="gemini"
            checked={provider === "gemini"}
            onChange={() => setProvider("gemini")}
            className="accent-primary"
          />
          <span className="text-sm">Gemini <span className="text-gray-400">(gratis)</span></span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="radio"
            name="provider"
            value="claude"
            checked={provider === "claude"}
            onChange={() => setProvider("claude")}
            className="accent-primary"
          />
          <span className="text-sm">Claude <span className="text-gray-400">(premium)</span></span>
        </label>
      </div>

      {/* Drop zone / status */}
      {state === "idle" || state === "error" ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragOver
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-gray-300 hover:border-primary hover:bg-blue-50/50"
          }`}
        >
          <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Subir Archivo</h3>
          <p className="text-gray-500 text-sm mb-4">
            Arrasta una imagen o PDF de un chord chart, o hace click para seleccionar
          </p>
          <div className="flex gap-3 justify-center">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <FileImage className="w-3 h-3" /> JPG/PNG/WebP
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <FileText className="w-3 h-3" /> PDF
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : state === "uploading" || state === "processing" ? (
        <div className="border-2 border-primary/30 rounded-xl p-8 text-center bg-primary/5">
          <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold mb-2">
            {state === "uploading" ? "Subiendo archivo..." : "Procesando con AI..."}
          </h3>
          <p className="text-gray-500 text-sm">
            {state === "processing" && (
              <span className="flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                {provider === "gemini" ? "Gemini" : "Claude"} esta analizando el chord chart
              </span>
            )}
          </p>
        </div>
      ) : state === "success" ? (
        <div className="border-2 border-green-300 rounded-xl p-8 text-center bg-green-50">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-700 mb-2">
            Cancion importada
          </h3>
          <p className="text-green-600 text-sm">
            Redirigiendo para editar...
          </p>
        </div>
      ) : null}

      {/* Error message */}
      {state === "error" && error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3.5">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p>{error}</p>
            <button
              onClick={handleReset}
              className="text-xs font-medium underline mt-1 hover:text-red-800"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
