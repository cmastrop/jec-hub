"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Loader2, Users, ChevronRight } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import type { Ministry } from "@/lib/types/cms";

export default function MinisteriosHubPage() {
  const { isAdmin, isLeader, canManage, loading: userLoading } = useUser();
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ministries")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setMinistries(Array.isArray(data) ? data : []))
      .catch(() => setMinistries([]))
      .finally(() => setLoading(false));
  }, []);

  if (userLoading || loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!isAdmin && !isLeader) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Shield className="h-12 w-12 text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900">Acceso restringido</h2>
        <p className="text-sm text-gray-500 mt-1">
          Esta sección es solo para líderes de ministerio y administradores.
        </p>
      </div>
    );
  }

  const visible = isAdmin ? ministries : ministries.filter((m) => canManage(m.slug));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ministerios</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gestioná el contenido de la página pública de cada ministerio.
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center text-gray-500">
          <Users className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No tenés ministerios asignados todavía.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((m) => (
            <Link
              key={m.id}
              href={`/ministerios/${m.slug}`}
              className="group rounded-xl border border-gray-200 bg-white p-6 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {m.name_es}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">{m.name_en}</p>
                  {m.leader_name && (
                    <p className="text-xs text-gray-400 mt-3">Líder: {m.leader_name}</p>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
