"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  Loader2,
  LayoutTemplate,
} from "lucide-react";
import { BlockForm } from "./block-form";
import type { BlockType, PageBlock } from "@/lib/types/cms";

const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  hero: "Hero (banner)",
  text: "Texto",
  image: "Imagen",
  gallery: "Galería",
  verse: "Versículo",
  cta: "Llamado a la acción",
  video: "Video / Podcast",
  features: "Características (3 cards)",
  leader: "Perfil de líder",
};

function blockPreviewTitle(block: PageBlock): string {
  const c = block.content_es as Record<string, unknown>;
  for (const key of ["title", "name", "text", "label", "caption", "body"]) {
    if (typeof c[key] === "string" && c[key]) {
      const s = c[key] as string;
      return s.length > 60 ? s.slice(0, 60) + "…" : s;
    }
  }
  return "(sin contenido)";
}

function SortableBlockRow({
  block,
  isEditing,
  onEdit,
  onDelete,
  onToggleStatus,
  children,
}: {
  block: PageBlock;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  children?: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-lg border bg-white ${
        isDragging ? "opacity-50 border-primary shadow-lg" : "border-gray-200"
      }`}
    >
      <div className="flex items-center gap-3 p-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-gray-300 hover:text-gray-500"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 whitespace-nowrap">
          {BLOCK_TYPE_LABELS[block.block_type]}
        </span>
        <span className="flex-1 truncate text-sm text-gray-700">
          {blockPreviewTitle(block)}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            block.status === "published"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {block.status === "published" ? "Publicado" : "Borrador"}
        </span>
        <button
          onClick={onToggleStatus}
          className="text-gray-400 hover:text-gray-600"
          title={block.status === "published" ? "Despublicar" : "Publicar"}
        >
          {block.status === "published" ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
        <button onClick={onEdit} className="text-gray-400 hover:text-primary" title="Editar">
          <Pencil className="h-4 w-4" />
        </button>
        <button onClick={onDelete} className="text-gray-400 hover:text-red-500" title="Eliminar">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {isEditing && <div className="border-t border-gray-100 p-3">{children}</div>}
    </div>
  );
}

/**
 * Editor de bloques de una pagina del CMS: lista ordenable con
 * drag-and-drop, agregar/editar/eliminar/publicar bloques.
 */
export function BlockEditor({ pageSlug }: { pageSlug: string }) {
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [addType, setAddType] = useState<BlockType | "">("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/cms/blocks?page_slug=${encodeURIComponent(pageSlug)}&all=true`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al cargar bloques");
        return;
      }
      setBlocks(data);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }, [pageSlug]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd() {
    if (!addType) return;
    setSaving(true);
    try {
      const res = await fetch("/api/cms/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page_slug: pageSlug, block_type: addType }),
      });
      const data = await res.json();
      if (res.ok) {
        setBlocks((prev) => [...prev, data]);
        setEditingId(data.id);
        setAddType("");
      } else {
        setError(data.error || "Error al crear bloque");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleSave(
    id: string,
    contentEs: Record<string, unknown>,
    contentEn: Record<string, unknown>
  ) {
    setSaving(true);
    try {
      const res = await fetch(`/api/cms/blocks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content_es: contentEs, content_en: contentEn }),
      });
      const data = await res.json();
      if (res.ok) {
        setBlocks((prev) => prev.map((b) => (b.id === id ? data : b)));
        setEditingId(null);
      } else {
        setError(data.error || "Error al guardar");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(block: PageBlock) {
    const status = block.status === "published" ? "draft" : "published";
    const res = await fetch(`/api/cms/blocks/${block.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const data = await res.json();
      setBlocks((prev) => prev.map((b) => (b.id === block.id ? data : b)));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este bloque?")) return;
    const res = await fetch(`/api/cms/blocks/${id}`, { method: "DELETE" });
    if (res.ok) {
      setBlocks((prev) => prev.filter((b) => b.id !== id));
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    const reordered = arrayMove(blocks, oldIndex, newIndex);
    setBlocks(reordered);

    await fetch("/api/cms/blocks/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page_slug: pageSlug, ids: reordered.map((b) => b.id) }),
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {blocks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center text-gray-500">
          <LayoutTemplate className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">
            Esta página no tiene bloques todavía.
            <br />
            Mientras no haya bloques publicados, se muestra el contenido original.
          </p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {blocks.map((block) => (
                <SortableBlockRow
                  key={block.id}
                  block={block}
                  isEditing={editingId === block.id}
                  onEdit={() => setEditingId(editingId === block.id ? null : block.id)}
                  onDelete={() => handleDelete(block.id)}
                  onToggleStatus={() => handleToggleStatus(block)}
                >
                  <BlockForm
                    block={block}
                    saving={saving}
                    onSave={(es, en) => handleSave(block.id, es, en)}
                    onCancel={() => setEditingId(null)}
                  />
                </SortableBlockRow>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="flex items-center gap-2">
        <select
          value={addType}
          onChange={(e) => setAddType(e.target.value as BlockType | "")}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="">Tipo de bloque...</option>
          {(Object.keys(BLOCK_TYPE_LABELS) as BlockType[]).map((t) => (
            <option key={t} value={t}>
              {BLOCK_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          disabled={!addType || saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Agregar Bloque
        </button>
      </div>
    </div>
  );
}
