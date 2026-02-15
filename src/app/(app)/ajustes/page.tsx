"use client";

import { useState, useEffect } from "react";
import { User, Music, Eye, Loader2, CheckCircle } from "lucide-react";
import { clearUserCache } from "@/hooks/use-user";

export default function AjustesPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [notation, setNotation] = useState<"letter" | "solfege">("letter");
  const [fontSize, setFontSize] = useState(18);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const profile = await res.json();
          setFullName(profile.full_name || "");
          setEmail(profile.email || "");
          setNotation(profile.notation_preference || "letter");
          setFontSize(profile.font_size_preference || 18);
        }
      } catch {
        // ignore
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          notation_preference: notation,
          font_size_preference: fontSize,
        }),
      });
      if (res.ok) {
        setSaved(true);
        clearUserCache();
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      // ignore
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Ajustes</h1>
        <p className="text-gray-500 mt-1">Configuracion personal</p>
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
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5EA7] focus:border-transparent outline-none"
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              disabled
            />
          </div>
        </div>
      </div>

      {/* Display preferences */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Eye className="w-5 h-5 text-[#2B5EA7]" />
          <h2 className="text-lg font-semibold">Preferencias de Visualizacion</h2>
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
            Tamano de Fuente: {fontSize}px
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

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-[#2B5EA7] text-white px-6 py-2.5 rounded-lg hover:bg-[#1e4a85] transition-colors font-medium disabled:opacity-50"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Guardando...
          </>
        ) : saved ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Guardado
          </>
        ) : (
          "Guardar Cambios"
        )}
      </button>
    </div>
  );
}
