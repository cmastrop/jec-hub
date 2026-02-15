import Image from "next/image";
import Link from "next/link";
import { Music, ListMusic, Calendar, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen" data-theme="light">
      {/* Left panel - Hero image (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80&auto=format"
          alt="Adoracion"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary-dark/70 to-black/60" />
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.webp"
              alt="JEC HUB"
              width={48}
              height={48}
              className="rounded-lg"
            />
            <span className="text-xl font-bold text-white">JEC HUB</span>
          </div>

          <div className="max-w-lg">
            <blockquote className="text-3xl xl:text-4xl font-light text-white leading-relaxed mb-6">
              &ldquo;Cantad a Jehova cantico nuevo; cantad a Jehova, toda la
              tierra.&rdquo;
            </blockquote>
            <p className="text-white/70 text-lg">Salmos 96:1</p>
          </div>

          <p className="text-white/50 text-sm">
            Ministerio de Musica &mdash; Jesus Es El Camino
          </p>
        </div>
      </div>

      {/* Right panel - Landing content */}
      <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
        {/* Mobile header with hero image */}
        <div className="lg:hidden relative w-full h-48 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80&auto=format"
            alt="Adoracion"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/70 to-primary-dark/80" />
          <div className="relative z-10 flex flex-col items-center justify-center h-full gap-2">
            <Image
              src="/logo.webp"
              alt="JEC HUB"
              width={64}
              height={64}
              className="rounded-xl shadow-lg"
            />
            <h1 className="text-2xl font-bold text-white">JEC HUB</h1>
            <p className="text-white/70 text-sm">
              Ministerio de Musica
            </p>
          </div>
        </div>

        {/* Centered content */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md text-center">
            {/* Logo (desktop only) */}
            <div className="hidden lg:flex flex-col items-center mb-8">
              <Image
                src="/logo.webp"
                alt="JEC HUB"
                width={80}
                height={80}
                className="rounded-xl shadow-md mb-4"
              />
              <h1 className="text-3xl font-bold text-gray-900">JEC HUB</h1>
              <p className="text-gray-500 mt-1">
                Plataforma de gestion musical
              </p>
            </div>

            {/* Feature highlights */}
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sm:p-8 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Todo lo que necesitas para el ministerio
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Music className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Canciones
                  </span>
                  <span className="text-xs text-gray-500">
                    Chord charts editables
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-yellow-50">
                  <div className="w-10 h-10 rounded-full bg-[#B8960C]/10 flex items-center justify-center">
                    <ListMusic className="w-5 h-5 text-[#B8960C]" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Programas
                  </span>
                  <span className="text-xs text-gray-500">
                    Setlists organizados
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-50">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Calendario
                  </span>
                  <span className="text-xs text-gray-500">
                    Servicios planificados
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-emerald-50">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Equipo
                  </span>
                  <span className="text-xs text-gray-500">
                    Gestion de musicos
                  </span>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="flex w-full h-12 items-center justify-center rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-all shadow-lg shadow-primary/25"
                >
                  Iniciar Sesion
                </Link>
                <Link
                  href="/registro"
                  className="flex w-full h-12 items-center justify-center rounded-xl bg-white text-primary font-semibold text-sm border-2 border-primary/20 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-all"
                >
                  Crear Cuenta
                </Link>
              </div>
            </div>

            {/* Bible verse (mobile only) */}
            <div className="lg:hidden text-center">
              <p className="text-sm text-gray-400 italic">
                &ldquo;Cantad a Jehova cantico nuevo; cantad a Jehova, toda la
                tierra.&rdquo;
              </p>
              <p className="text-xs text-gray-400 mt-1">Salmos 96:1</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-6 px-4">
          <p className="text-xs text-gray-400">
            Ministerio de Musica &mdash; Iglesia Jesus Es El Camino
          </p>
        </div>
      </div>
    </div>
  );
}
