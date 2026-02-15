"use client";

import { useState } from "react";
import { CloudDownload } from "lucide-react";
import { DropboxMigration } from "@/components/migration/dropbox-migration";
import { FileUpload } from "@/components/import/file-upload";

export default function ImportarPage() {
  const [showDropbox, setShowDropbox] = useState(false);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Importar Canciones</h1>
        <p className="text-gray-500 mt-1">
          Sube imagenes o PDFs de chord charts para extraer canciones
          automaticamente con AI
        </p>
      </div>

      {!showDropbox ? (
        <>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Upload files */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <FileUpload />
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
                  Descarga todo tu contenido de Dropbox y procesalo con AI
                  (migracion masiva)
                </p>
              </div>
            </button>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-[#2B5EA7] mb-1">
              Como funciona?
            </h4>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Subis una imagen o PDF de un chord chart</li>
              <li>
                AI (Gemini gratis o Claude premium) analiza la imagen y extrae
                los acordes y letras
              </li>
              <li>Revisas el resultado y lo editas si es necesario</li>
              <li>
                La cancion se guarda en tu biblioteca en formato editable
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
            &larr; Volver
          </button>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <CloudDownload className="w-6 h-6 text-[#B8960C]" />
              <h2 className="text-lg font-semibold">Migracion de Dropbox</h2>
            </div>
            <DropboxMigration />
          </div>
        </div>
      )}
    </div>
  );
}
