"use client";

import { useState } from "react";
import { Plus, Search, Music } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

const keys = ["C", "D", "E", "F", "G", "A"];

export default function CancionesPage() {
  const [search, setSearch] = useState("");
  const [activeKey, setActiveKey] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Page title and action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          Biblioteca de Canciones
        </h2>
        <Button>
          <Plus className="h-4 w-4" />
          Nueva Canción
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar canciones..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-foreground placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Key filter badges */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-500 self-center mr-1">
          Tonalidad:
        </span>
        {keys.map((key) => (
          <button
            key={key}
            onClick={() => setActiveKey(activeKey === key ? null : key)}
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors cursor-pointer",
              activeKey === key
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Music className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No hay canciones todavía
        </h3>
        <p className="max-w-sm text-sm text-gray-500">
          No hay canciones todavía. Importa desde Dropbox o crea una nueva.
        </p>
      </div>
    </div>
  );
}
