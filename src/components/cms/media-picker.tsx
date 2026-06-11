"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload, Loader2, ImageIcon } from "lucide-react";
import type { PageMedia } from "@/lib/types/cms";

type MediaItem = PageMedia & { url: string };

/**
 * Modal para elegir una imagen del CMS o subir una nueva.
 * onSelect recibe la URL publica de la imagen elegida.
 */
export function MediaPicker({
  onSelect,
  onClose,
}: {
  onSelect: (url: string) => void;
  onClose: () => void;
}) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/cms/media")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setMedia(Array.isArray(data) ? data : []))
      .catch(() => setMedia([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleUpload(file: File) {
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/cms/media", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al subir la imagen");
        return;
      }
      setMedia((prev) => [data, ...prev]);
      onSelect(data.url);
    } catch {
      setError("Error de conexión al subir");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Elegir Imagen</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-gray-100">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Subir Nueva Imagen
          </button>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : media.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No hay imágenes todavía. Subí la primera.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {media.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onSelect(m.url)}
                  className="group relative aspect-square overflow-hidden rounded-lg border-2 border-transparent hover:border-primary transition-colors"
                  title={m.alt_text || m.storage_path}
                >
                  <img src={m.url} alt={m.alt_text || ""} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
