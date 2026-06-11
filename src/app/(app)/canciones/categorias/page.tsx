"use client";

import { useState, useEffect } from "react";
import { Music, ChevronRight, Mic2, Guitar, Globe, Disc3, Heart, Library } from "lucide-react";
import Link from "next/link";

interface CategoryItem {
  name: string;
  count: number;
}

const categoryIcons: Record<string, typeof Music> = {
  "Adoración Español": Heart,
  "Cantautores": Mic2,
  "Worship Inglés": Globe,
  "Rock/Pop Cristiano": Guitar,
  "Alabanza Latina": Disc3,
  "Alabanza General": Library,
};

const categoryDescriptions: Record<string, string> = {
  "Adoración Español": "Miel San Marcos, Marco Barrientos, Marcos Witt, Generación 12, Su Presencia y más",
  "Cantautores": "Jesús Adrián Romero, Danilo Montero, Alex Campos, Lilly Goodman, Christine D'Clario y más",
  "Worship Inglés": "Hillsong United, Elevation Worship, Bethel Music, Chris Tomlin, Kari Jobe y más",
  "Rock/Pop Cristiano": "Rojo, Rescate, Marcos Vidal",
  "Alabanza Latina": "Inspiración, Alabanzas Llamada Final, Aline Barros, Xtreme Kids y más",
  "Alabanza General": "Canciones de alabanza y adoración de diversos artistas",
};

const categoryColors: Record<string, string> = {
  "Adoración Español": "from-blue-500 to-blue-700",
  "Cantautores": "from-purple-500 to-purple-700",
  "Worship Inglés": "from-emerald-500 to-emerald-700",
  "Rock/Pop Cristiano": "from-red-500 to-red-700",
  "Alabanza Latina": "from-amber-500 to-amber-700",
  "Alabanza General": "from-gray-500 to-gray-700",
};

export default function CategoriasPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/songs/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalSongs = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/canciones" className="hover:text-primary">
              Canciones
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">Categorias</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Categorias
            {totalSongs > 0 && (
              <span className="text-base font-normal text-gray-400 ml-2">
                ({totalSongs} canciones)
              </span>
            )}
          </h2>
        </div>
        <Link
          href="/canciones/artistas"
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Ver por Artistas →
        </Link>
      </div>

      {/* Category cards */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : categories.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.name] || Music;
            const gradient = categoryColors[cat.name] || "from-gray-500 to-gray-700";
            const description = categoryDescriptions[cat.name] || "";

            return (
              <Link
                key={cat.name}
                href={`/canciones/categorias/${encodeURIComponent(cat.name)}`}
                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all"
              >
                {/* Gradient header */}
                <div
                  className={`bg-gradient-to-r ${gradient} p-5 text-white`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className="h-8 w-8 opacity-90" />
                    <span className="text-2xl font-bold">{cat.count}</span>
                  </div>
                  <h3 className="text-lg font-bold mt-3">{cat.name}</h3>
                </div>
                {/* Description */}
                <div className="p-4">
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {description}
                  </p>
                  <div className="flex items-center gap-1 mt-3 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                    Ver canciones
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Music className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No hay categorias
          </h3>
          <p className="max-w-sm text-sm text-gray-500">
            Importa canciones para ver categorias aqui.
          </p>
        </div>
      )}
    </div>
  );
}
