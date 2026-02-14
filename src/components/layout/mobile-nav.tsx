"use client";

import Link from "next/link";
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

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-gray-200 bg-white py-2 md:hidden">
      {navLinks.map((link) => {
        const isActive = pathname.startsWith(link.href);
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-xs transition-colors",
              isActive
                ? "text-primary font-semibold"
                : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5",
                isActive ? "text-primary" : "text-gray-400"
              )}
            />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
