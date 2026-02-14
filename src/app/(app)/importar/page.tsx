"use client";

import { useState } from "react";
import { Upload, CloudDownload, FileImage, FileText, Music } from "lucide-react";
import { DropboxMigration } from "@/components/migration/dropbox-migration";

export default function ImportarPage() {
  const [showDropbox, setShowDropbox] = useState(false);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Importar Canciones</h1>
        <p className="text-gray-500 mt-1">
          Sube imágenes o PDFs de chord charts para extraer canciones
          automáticamente con AI
        </p>
      </div>

      {!showDropbox ? (
        <>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Upload files */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-[#2B5EA7] hover:bg-blue-50/50 transition-all cursor-pointer">
              <div className="text-center">
                <Upload className="w-12 h-12 text-[#2B5EA7] mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Subir Archivos</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Arrastrá imágenes (JPG, PNG) o PDFs de chord charts
                </p>
                <div className="flex gap-2 justify-center">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <FileImage className="w-3 h-3" /> JPG/PNG
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <FileText className="w-3 h-3" /> PDF
                  </span>
                </div>
              </div>
            </div>

            {/* Dropbox migration */}
            <button
              onClick={() => setShowDropbox(true)}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-[#B8960C] hover:bg-yellow-50/50 transition-all cursor-pointer text-left"
            >
              <div className="text-center">
                <CloudDownload className="w-12 h-12 text-[#B8960C] mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Migrar desde Dropbox
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Descargá todo tu contenido de Dropbox y procesalo con AI
                </p>
                <div className="flex gap-2 justify-center">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <FileImage className="w-3 h-3" /> 3,055 imágenes
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <FileText className="w-3 h-3" /> 409 PDFs
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Music className="w-3 h-3" /> 14 audios
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-[#2B5EA7] mb-1">
              ¿Cómo funciona?
            </h4>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Subís una imagen o PDF de un chord chart</li>
              <li>
                Google Gemini AI analiza la imagen y extrae los acordes y letras
              </li>
              <li>Revisás el resultado y lo aprobás o editás</li>
              <li>
                La canción se guarda en tu biblioteca en formato editable
              </li>
            </ol>
          </div>
        </>
      ) : (
        <div className="max-w-xl">
          <button
            onClick={() => setShowDropbox(false)}
            className="text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            ← Volver
          </button>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <CloudDownload className="w-6 h-6 text-[#B8960C]" />
              <h2 className="text-lg font-semibold">Migración de Dropbox</h2>
            </div>
            <DropboxMigration />
          </div>
        </div>
      )}
    </div>
  );
}
