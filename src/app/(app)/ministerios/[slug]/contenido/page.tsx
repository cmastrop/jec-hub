"use client";

import { use } from "react";
import Link from "next/link";
import { Shield, Loader2, ArrowLeft, ExternalLink } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { BlockEditor } from "@/components/cms/block-editor";

export default function MinisterioContenidoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { canManage, loading } = useUser();

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!canManage(slug)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Shield className="h-12 w-12 text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900">Acceso restringido</h2>
        <p className="text-sm text-gray-500 mt-1">
          No tenés permisos para editar este ministerio.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <Link
            href={`/ministerios/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Contenido de la Página</h1>
          <p className="text-sm text-gray-500 mt-1">
            Los bloques publicados reemplazan el contenido original de la página pública.
            Arrastrá para reordenar.
          </p>
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

      <BlockEditor pageSlug={`ministerios/${slug}`} />
    </div>
  );
}
