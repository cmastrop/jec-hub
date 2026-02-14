"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Music,
  ListMusic,
  Calendar,
  Upload,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navLinks = [
  { href: "/canciones", label: "Canciones", icon: Music },
  { href: "/programas", label: "Programas", icon: ListMusic },
  { href: "/calendario", label: "Calendario", icon: Calendar },
  { href: "/importar", label: "Importar", icon: Upload },
  { href: "/equipo", label: "Equipo", icon: Users },
  { href: "/ajustes", label: "Ajustes", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-gray-200">
        <Image
          src="/logo.webp"
          alt="JEC HUB"
          width={48}
          height={48}
          className="rounded-lg"
        />
        <span className="text-lg font-bold text-primary">JEC HUB</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
