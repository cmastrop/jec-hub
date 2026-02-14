"use client";

import { usePathname } from "next/navigation";
import { Menu, User } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/canciones": "Canciones",
  "/programas": "Programas",
  "/calendario": "Calendario",
  "/importar": "Importar",
  "/equipo": "Equipo",
  "/ajustes": "Ajustes",
};

function getPageTitle(pathname: string): string {
  for (const [path, title] of Object.entries(pageTitles)) {
    if (pathname.startsWith(path)) {
      return title;
    }
  }
  return "JEC HUB";
}

export function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 md:px-6">
      {/* Mobile menu button */}
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page title */}
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User avatar placeholder */}
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        aria-label="Menú de usuario"
      >
        <User className="h-5 w-5" />
      </button>
    </header>
  );
}
