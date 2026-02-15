# JEC HUB - Proyecto de Gestion Musical

App web para la iglesia "Jesus Es El Camino" (JEC). Gestiona canciones con chord charts, programas de culto, y equipo de musica.

## Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript (App Router)
- **Styling**: Tailwind CSS 4
- **Backend**: Next.js API Routes + Supabase (PostgreSQL, Auth, Storage)
- **Deploy**: Vercel (https://jec-hub.vercel.app)
- **Repo**: https://github.com/cmastrop/jec-hub

## Estructura del Proyecto

```
src/
  app/
    (app)/              # Layout principal con sidebar (requiere auth)
      canciones/        # Biblioteca de canciones
        [id]/page.tsx   # Vista detalle con ChordPro viewer + editor
      programas/        # Programas de culto (pendiente)
      calendario/       # Calendario (pendiente)
      equipo/           # Equipo de musica (pendiente)
      importar/         # Pagina de importacion
      ajustes/          # Ajustes del usuario
    api/
      songs/            # CRUD de canciones
        [id]/
          route.ts      # GET/PATCH/DELETE una cancion
          original/     # GET signed URL del archivo original
        route.ts        # GET lista de canciones
      me/               # GET perfil del usuario actual
      health/           # Health check
  components/
    song/
      chord-chart.tsx       # Renderiza ChordPro con transposicion
      structured-editor.tsx # Editor visual por secciones
      section-header.tsx    # Header colorizado por tipo de seccion
      chord-line.tsx        # Linea de acordes + letra
      transpose-controls.tsx
      font-size-controls.tsx
      notation-toggle.tsx
    layout/
      sidebar.tsx           # Sidebar de navegacion
      header.tsx            # Header con menu de usuario
    ui/                     # Componentes base (button, input, card, etc.)
  lib/
    chordpro/
      parser.ts         # Parsea ChordPro string -> ChordProSong
      serializer.ts     # Serializa ChordProSong -> ChordPro string
      transpose.ts      # Transposicion de acordes
      types.ts          # ChordProSong, Section, SectionType, etc.
    supabase/
      client.ts         # Supabase browser client
      server.ts         # Supabase server client (SSR)
      admin.ts          # Supabase admin client (service role, bypasses RLS)
    types/
      database.ts       # Song, Profile types
  hooks/
    use-user.ts         # Hook para perfil/rol del usuario (cached)
scripts/
  migrate.ts            # Script de migracion Dropbox -> Supabase (Claude API)
```

## Base de Datos (Supabase)

### Tabla `songs`
- `id` (uuid), `title`, `artist`, `original_key`, `chordpro_content`
- `status` ("draft" | "published"), `source_type` ("manual" | "import_dropbox")
- `original_file_url` (path en Storage bucket "originals")
- `tags` (text[]), `created_at`, `updated_at`

### Tabla `profiles`
- `id` (uuid, FK auth.users), `email`, `full_name`, `role` ("admin" | "member")
- `notation_preference`, `font_size_preference`

### Storage Bucket: `originals`
- Archivos originales importados de Dropbox (PDFs, imagenes)

## Roles

- **admin**: Puede crear, editar, eliminar, publicar canciones. Ver archivos originales.
- **member**: Solo puede ver canciones publicadas, transponer, cambiar font/notacion.

Admin actual: christian.mastro@gmail.com

## ChordPro Format

Secciones soportadas: verse, chorus, bridge, precoro, intro, outro, interlude, tag
Directivas: {title:}, {artist:}, {key:}, {tempo:}, {time:}, {capo:}
Acordes entre corchetes: [Am]Letra con [G]acordes

## Migracion (scripts/migrate.ts)

Usa Claude API (claude-sonnet-4-5-20250929) para OCR de chord charts.
Requiere env vars: `ANTHROPIC_API_KEY`, `DROPBOX_TOKEN`
Ejecutar: `npx tsx scripts/migrate.ts`

## Convenios

- Idioma UI: Espanol
- Componentes: "use client" explicito, funcional con hooks
- API: admin client para bypasear RLS, server client para auth checks
- Estilo: Tailwind utility classes, sin CSS modules
- Errores API: `{ error: string }` con HTTP status codes apropiados
