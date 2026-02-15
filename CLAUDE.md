# JEC HUB - Proyecto de Gestion Musical

App web para la iglesia "Jesus Es El Camino" (JEC). Gestiona canciones con chord charts, programas de culto, y equipo de musica.

## Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript (App Router)
- **Styling**: Tailwind CSS 4
- **Backend**: Next.js API Routes + Supabase (PostgreSQL, Auth, Storage)
- **AI**: Claude API (Anthropic SDK) para OCR de chord charts
- **Deploy**: Vercel (https://jec-hub.vercel.app)
- **Repo**: https://github.com/cmastrop/jec-hub

## Estructura del Proyecto

```
src/
  app/
    (auth)/              # Layout de autenticacion (login/registro)
      layout.tsx         # Split layout con imagen de adoracion + form
      login/page.tsx     # Pagina de login
      registro/page.tsx  # Pagina de registro
    (app)/               # Layout principal con sidebar (requiere auth)
      canciones/         # Biblioteca de canciones
        [id]/page.tsx    # Vista detalle: ChordPro viewer + editor estructurado + ver original
      programas/         # Programas de culto (pendiente)
      calendario/        # Calendario (pendiente)
      equipo/            # Gestion de equipo y roles (admin only)
      importar/          # Pagina de importacion
      ajustes/           # Ajustes del usuario
    api/
      songs/             # CRUD de canciones
        [id]/
          route.ts       # GET/PATCH/DELETE una cancion
          original/      # GET signed URL del archivo original
        route.ts         # GET lista de canciones
      users/             # Gestion de usuarios (admin only)
        [id]/route.ts    # PATCH rol de usuario
        route.ts         # GET lista de usuarios
      me/                # GET perfil del usuario actual
      health/            # Health check
  components/
    song/
      chord-chart.tsx        # Renderiza ChordPro con transposicion
      structured-editor.tsx  # Editor visual por secciones (metadata, add/remove/reorder)
      section-header.tsx     # Header colorizado por tipo de seccion
      chord-line.tsx         # Linea de acordes + letra
      transpose-controls.tsx
      font-size-controls.tsx
      notation-toggle.tsx
    layout/
      sidebar.tsx            # Sidebar de navegacion
      header.tsx             # Header con menu de usuario + badge admin
    ui/                      # Componentes base (button, input, card, etc.)
  lib/
    chordpro/
      parser.ts          # Parsea ChordPro string -> ChordProSong
      serializer.ts      # Serializa ChordProSong -> ChordPro string
      transpose.ts       # Transposicion de acordes
      types.ts           # ChordProSong, Section, SectionType, etc.
    supabase/
      client.ts          # Supabase browser client
      server.ts          # Supabase server client (SSR)
      admin.ts           # Supabase admin client (service role, bypasses RLS)
    types/
      database.ts        # Song, Profile types
  hooks/
    use-user.ts          # Hook para perfil/rol del usuario (cached)
scripts/
  migrate.ts             # Script de migracion Dropbox -> Supabase (Claude API)
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

## Roles y Permisos

### Administrador
Cuentas admin: `christian.mastro@gmail.com`, `musicosjesuseselcamino@gmail.com`

Permisos:
- Ver todas las canciones (publicadas y borradores)
- Crear, editar y eliminar canciones
- Publicar canciones en borrador
- Ver archivos originales importados (split view)
- Importar canciones desde Dropbox
- Gestionar usuarios y roles (/equipo)
- Crear y editar programas de culto

### Miembro (usuario comun)
Permisos:
- Ver canciones publicadas
- Transponer tonalidad
- Cambiar tamanio de fuente
- Cambiar notacion (cifrado/solfeo)
- Ver programas de culto
- Ver calendario

### Como cambiar roles
Los admins pueden promover/degradar usuarios desde la pagina /equipo.
Un admin no puede quitarse su propio rol de admin (proteccion contra auto-degradacion).

## ChordPro Format

Secciones soportadas: verse, chorus, bridge, precoro, intro, outro, interlude, tag
Directivas: {title:}, {artist:}, {key:}, {tempo:}, {time:}, {capo:}
Acordes entre corchetes: [Am]Letra con [G]acordes

## Features

### Editor Estructurado
- Metadata editable (titulo, artista, tonalidad, tempo, compas)
- Secciones con tipo seleccionable (Intro, Verso, Pre-Coro, Coro, Puente, Instrumental, Outro, Tag)
- Mover secciones arriba/abajo, eliminar, renombrar
- ChordPro textarea por seccion
- Vista previa en vivo (split view)

### Vista de Archivo Original
- Boton "Ver Original" en cancion (admin only)
- Muestra imagen/PDF original importado al lado del ChordPro
- Signed URLs de Supabase Storage (1 hora de validez)

### Pagina de Login
- Diseno split-screen con imagen de adoracion (Unsplash)
- Versiculo biblico (Salmos 96:1)
- Responsive (stacked en mobile, side-by-side en desktop)

## Migracion (scripts/migrate.ts)

Usa Claude API (claude-sonnet-4-5-20250929) para OCR de chord charts desde Dropbox.
- Rate limit: ~30 RPM (conservador)
- Retry automatico en errores 429
- Skip de archivos ya procesados
- Escape de caracteres no-ASCII para HTTP headers de Dropbox

Requiere env vars: `ANTHROPIC_API_KEY`, `DROPBOX_TOKEN`
Ejecutar: `npx tsx scripts/migrate.ts`

## Convenios

- Idioma UI: Espanol
- Componentes: "use client" explicito, funcional con hooks
- API: admin client para bypasear RLS, server client para auth checks
- Estilo: Tailwind utility classes, sin CSS modules
- Errores API: `{ error: string }` con HTTP status codes apropiados
- Auth: todas las rutas API verifican autenticacion, admin endpoints verifican rol
