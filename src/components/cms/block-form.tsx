"use client";

import { useState } from "react";
import { ImageIcon, Plus, Trash2, X } from "lucide-react";
import { MediaPicker } from "./media-picker";
import type { BlockType, PageBlock } from "@/lib/types/cms";

type Content = Record<string, unknown>;

type FieldKind = "text" | "textarea" | "image" | "images" | "items" | "select";

interface Field {
  key: string;
  label: string;
  kind: FieldKind;
  options?: string[]; // para select
  placeholder?: string;
}

const BLOCK_FIELDS: Record<BlockType, Field[]> = {
  hero: [
    { key: "image", label: "Imagen de fondo", kind: "image" },
    { key: "label", label: "Etiqueta superior", kind: "text", placeholder: "MINISTERIO" },
    { key: "title", label: "Título", kind: "text" },
    { key: "titleAccent", label: "Título en negrita (acento)", kind: "text" },
  ],
  text: [
    { key: "title", label: "Título", kind: "text" },
    { key: "body", label: "Texto", kind: "textarea" },
  ],
  image: [
    { key: "image", label: "Imagen", kind: "image" },
    { key: "caption", label: "Pie de foto", kind: "text" },
  ],
  gallery: [{ key: "images", label: "Imágenes", kind: "images" }],
  verse: [
    { key: "text", label: "Texto del versículo", kind: "textarea" },
    { key: "reference", label: "Referencia", kind: "text", placeholder: "Salmos 96:1" },
  ],
  cta: [
    { key: "label", label: "Etiqueta superior", kind: "text" },
    { key: "title", label: "Título", kind: "text" },
    { key: "description", label: "Descripción", kind: "textarea" },
    { key: "buttonText", label: "Texto del botón", kind: "text" },
    { key: "buttonLink", label: "Link del botón", kind: "text", placeholder: "/iglesia/contacto" },
  ],
  video: [
    { key: "provider", label: "Plataforma", kind: "select", options: ["youtube", "spotify"] },
    { key: "id", label: "ID del video/episodio", kind: "text", placeholder: "dQw4w9WgXcQ" },
    { key: "title", label: "Título", kind: "text" },
  ],
  features: [
    { key: "label", label: "Etiqueta superior", kind: "text" },
    { key: "title", label: "Título", kind: "text" },
    { key: "items", label: "Características", kind: "items" },
  ],
  leader: [
    { key: "image", label: "Foto", kind: "image" },
    { key: "name", label: "Nombre", kind: "text" },
    { key: "role", label: "Cargo", kind: "text" },
    { key: "bio", label: "Biografía", kind: "textarea" },
    { key: "badge", label: "Badge (ej: 30+ años)", kind: "text" },
  ],
};

const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

function FieldEditor({
  field,
  content,
  onChange,
}: {
  field: Field;
  content: Content;
  onChange: (key: string, value: unknown) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const value = content[field.key];

  switch (field.kind) {
    case "text":
      return (
        <input
          type="text"
          value={typeof value === "string" ? value : ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(field.key, e.target.value)}
          className={inputCls}
        />
      );

    case "textarea":
      return (
        <textarea
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(field.key, e.target.value)}
          rows={4}
          className={inputCls}
        />
      );

    case "select":
      return (
        <select
          value={typeof value === "string" ? value : field.options?.[0] || ""}
          onChange={(e) => onChange(field.key, e.target.value)}
          className={inputCls}
        >
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );

    case "image": {
      const url = typeof value === "string" ? value : "";
      return (
        <div>
          {url ? (
            <div className="relative inline-block">
              <img src={url} alt="" className="h-24 rounded-lg object-cover" />
              <button
                onClick={() => onChange(field.key, "")}
                className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setPickerOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-primary hover:text-primary"
            >
              <ImageIcon className="h-4 w-4" />
              Elegir imagen
            </button>
          )}
          {pickerOpen && (
            <MediaPicker
              onSelect={(u) => {
                onChange(field.key, u);
                setPickerOpen(false);
              }}
              onClose={() => setPickerOpen(false)}
            />
          )}
        </div>
      );
    }

    case "images": {
      const imgs = Array.isArray(value)
        ? value.filter((s): s is string => typeof s === "string")
        : [];
      return (
        <div>
          <div className="flex flex-wrap gap-3">
            {imgs.map((src, i) => (
              <div key={`${src}-${i}`} className="relative">
                <img src={src} alt="" className="h-20 w-20 rounded-lg object-cover" />
                <button
                  onClick={() =>
                    onChange(field.key, imgs.filter((_, idx) => idx !== i))
                  }
                  className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                setPickerIndex(imgs.length);
                setPickerOpen(true);
              }}
              className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-400 hover:border-primary hover:text-primary"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          {pickerOpen && pickerIndex !== null && (
            <MediaPicker
              onSelect={(u) => {
                onChange(field.key, [...imgs, u]);
                setPickerOpen(false);
                setPickerIndex(null);
              }}
              onClose={() => {
                setPickerOpen(false);
                setPickerIndex(null);
              }}
            />
          )}
        </div>
      );
    }

    case "items": {
      const list = Array.isArray(value)
        ? value.map((it) => ({
            title: it && typeof it.title === "string" ? it.title : "",
            desc: it && typeof it.desc === "string" ? it.desc : "",
          }))
        : [];
      const update = (i: number, key: "title" | "desc", v: string) => {
        const next = list.map((it, idx) => (idx === i ? { ...it, [key]: v } : it));
        onChange(field.key, next);
      };
      return (
        <div className="space-y-3">
          {list.map((it, i) => (
            <div key={i} className="rounded-lg border border-gray-200 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Item {i + 1}</span>
                <button
                  onClick={() => onChange(field.key, list.filter((_, idx) => idx !== i))}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <input
                type="text"
                value={it.title}
                placeholder="Título"
                onChange={(e) => update(i, "title", e.target.value)}
                className={inputCls}
              />
              <textarea
                value={it.desc}
                placeholder="Descripción"
                rows={2}
                onChange={(e) => update(i, "desc", e.target.value)}
                className={inputCls}
              />
            </div>
          ))}
          <button
            onClick={() => onChange(field.key, [...list, { title: "", desc: "" }])}
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <Plus className="h-4 w-4" />
            Agregar item
          </button>
        </div>
      );
    }
  }
}

/**
 * Formulario de edicion de un bloque, con tabs Espanol/English.
 * Edita una copia local; onSave envia el PATCH.
 */
export function BlockForm({
  block,
  onSave,
  onCancel,
  saving,
}: {
  block: PageBlock;
  onSave: (contentEs: Content, contentEn: Content) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [tab, setTab] = useState<"es" | "en">("es");
  const [contentEs, setContentEs] = useState<Content>({ ...block.content_es });
  const [contentEn, setContentEn] = useState<Content>({ ...block.content_en });

  const fields = BLOCK_FIELDS[block.block_type] || [];
  const content = tab === "es" ? contentEs : contentEn;
  const setContent = tab === "es" ? setContentEs : setContentEn;

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/[0.02] p-4 space-y-4">
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        {(["es", "en"] as const).map((l) => (
          <button
            key={l}
            onClick={() => setTab(l)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === l ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {l === "es" ? "Español" : "English"}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={`${tab}-${field.key}`}>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {field.label}
            </label>
            <FieldEditor
              field={field}
              content={content}
              onChange={(key, value) => setContent((prev) => ({ ...prev, [key]: value }))}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={() => onSave(contentEs, contentEn)}
          disabled={saving}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
