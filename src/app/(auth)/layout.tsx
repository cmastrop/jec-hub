import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

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
              &ldquo;Cantad a Jehova cantico nuevo; cantad a Jehova, toda la tierra.&rdquo;
            </blockquote>
            <p className="text-white/70 text-lg">Salmos 96:1</p>
          </div>

          <p className="text-white/50 text-sm">
            Ministerio de Musica &mdash; Jesus Es El Camino
          </p>
        </div>
      </div>

      {/* Right panel - Auth form */}
      <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
        {/* Mobile header with logo */}
        <div className="lg:hidden flex flex-col items-center pt-12 pb-4">
          <div className="relative w-full h-32 mb-6 overflow-hidden rounded-b-3xl">
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
                width={56}
                height={56}
                className="rounded-xl shadow-lg"
              />
              <h1 className="text-xl font-bold text-white">JEC HUB</h1>
            </div>
          </div>
        </div>

        {/* Centered form */}
        <div className="flex-1 flex items-center justify-center px-4 pb-8">
          <div className="w-full max-w-md">
            {children}
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
