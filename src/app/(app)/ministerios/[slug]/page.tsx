"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Loader2,
  ArrowLeft,
  LayoutTemplate,
  CalendarCheck,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import type { Ministry } from "@/lib/types/cms";

export default function MinisterioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { canManage, loading: userLoading } = useUser();
  const [ministry, setMinistry] = useState<Ministry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ministries")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Ministry[]) =>
        setMinistry(Array.isArray(data) ? data.find((m) => m.slug === slug) ?? null : null)
      )
      .catch(() => setMinistry(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (userLoading || loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!ministry || !canManage(slug)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Shield className="h-12 w-12 text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900">
          {!ministry ? "Ministerio no encontrado" : "Acceso restringido"}
        </h2>
        <Link href="/ministerios" className="mt-4 text-sm text-primary hover:underline">
          Volver a ministerios
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/ministerios"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Ministerios
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{ministry.name_es}</h1>
        {ministry.leader_name && (
          <p className="text-sm text-gray-500 mt-1">Líder: {ministry.leader_name}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href={`/ministerios/${slug}/contenido`}
          className="group rounded-xl border border-gray-200 bg-white p-6 hover:border-primary hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <LayoutTemplate className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  Contenido de la Página
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Editá los bloques de la página pública del ministerio.
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary transition-colors" />
          </div>
        </Link>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 opacity-60">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-gray-200 p-3">
              <CalendarCheck className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-500">Eventos del Ministerio</h2>
              <p className="text-sm text-gray-400 mt-1">Próximamente.</p>
            </div>
          </div>
        </div>
      </div>

      <a
        href={`/iglesia/ministerios/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
      >
        <ExternalLink className="h-4 w-4" />
        Ver página pública
      </a>
    </div>
  );
}
