"use client";

import { useState } from "react";
import { User, Music, Eye } from "lucide-react";

export default function AjustesPage() {
  const [notation, setNotation] = useState<"letter" | "solfege">("letter");
  const [fontSize, setFontSize] = useState(18);

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Ajustes</h1>
        <p className="text-gray-500 mt-1">Configuración personal</p>
      </div>

      {/* Profile section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-[#2B5EA7]" />
          <h2 className="text-lg font-semibold">Perfil</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5EA7] focus:border-transparent outline-none"
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              placeholder="email@ejemplo.com"
              disabled
            />
          </div>
        </div>
      </div>

      {/* Display preferences */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Eye className="w-5 h-5 text-[#2B5EA7]" />
          <h2 className="text-lg font-semibold">Preferencias de Visualización</h2>
        </div>

        {/* Notation preference */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Music className="w-4 h-4 inline mr-1" />
            Sistema de Acordes
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setNotation("letter")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                notation === "letter"
                  ? "bg-[#2B5EA7] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Cifrado (C, D, E, F, G, A, B)
            </button>
            <button
              onClick={() => setNotation("solfege")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                notation === "solfege"
                  ? "bg-[#2B5EA7] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Solfeo (Do, Re, Mi, Fa, Sol, La, Si)
            </button>
          </div>
        </div>

        {/* Font size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tamaño de Fuente: {fontSize}px
          </label>
          <input
            type="range"
            min={12}
            max={32}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full accent-[#2B5EA7]"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>12px</span>
            <span>32px</span>
          </div>
        </div>
      </div>

      <button className="bg-[#2B5EA7] text-white px-6 py-2.5 rounded-lg hover:bg-[#1e4a85] transition-colors font-medium">
        Guardar Cambios
      </button>
    </div>
  );
}
