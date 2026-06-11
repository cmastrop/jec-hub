"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useLang } from "@/lib/iglesia/use-lang";
import { BlockRenderer } from "@/components/cms/block-renderer";
import type { PageBlock } from "@/lib/types/cms";

// Cache simple por pagina para evitar re-fetch en client-side navigation
const cache = new Map<string, PageBlock[]>();

/**
 * Renderiza los bloques publicados del CMS para una pagina.
 * Si la pagina no tiene bloques en la DB, muestra el contenido
 * hardcodeado actual (children) como fallback.
 */
export function DynamicBlocks({
  pageSlug,
  children,
}: {
  pageSlug: string;
  children: ReactNode;
}) {
  const { lang } = useLang();
  const [blocks, setBlocks] = useState<PageBlock[] | null>(
    cache.get(pageSlug) ?? null
  );
  const [loaded, setLoaded] = useState(cache.has(pageSlug));

  useEffect(() => {
    if (cache.has(pageSlug)) {
      setBlocks(cache.get(pageSlug)!);
      setLoaded(true);
      return;
    }
    let cancelled = false;
    fetch(`/api/cms/blocks?page_slug=${encodeURIComponent(pageSlug)}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: PageBlock[]) => {
        if (cancelled) return;
        cache.set(pageSlug, Array.isArray(data) ? data : []);
        setBlocks(cache.get(pageSlug)!);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) {
          setBlocks([]);
          setLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [pageSlug]);

  // Mientras carga o si no hay bloques → contenido hardcodeado actual
  if (!loaded || !blocks || blocks.length === 0) {
    return <>{children}</>;
  }

  return (
    <>
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} lang={lang} />
      ))}
    </>
  );
}
