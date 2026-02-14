import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary via-primary-dark to-primary-dark p-4">
      <div className="flex flex-col items-center gap-8 text-center">
        {/* Logo */}
        <Image
          src="/logo.webp"
          alt="JEC HUB"
          width={120}
          height={120}
          className="rounded-2xl"
          priority
        />

        {/* Church name */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">JEC HUB</h1>
          <p className="text-lg text-white/80">
            Jesús Es El Camino
          </p>
          <p className="text-sm text-white/60">
            Gestión de música para el ministerio
          </p>
        </div>

        {/* Enter button */}
        <Link
          href="/login"
          className="inline-flex h-12 items-center justify-center rounded-lg bg-gold px-8 text-base font-semibold text-white shadow-lg transition-colors hover:bg-gold-dark"
        >
          Entrar
        </Link>
      </div>
    </div>
  );
}
