import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary via-primary-dark to-primary-dark p-4" data-theme="light">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/logo.webp"
            alt="JEC HUB"
            width={80}
            height={80}
            className="rounded-xl"
          />
          <h1 className="text-2xl font-bold text-white">JEC HUB</h1>
        </div>

        {/* Card content */}
        <div className="w-full *:!bg-white *:!shadow-2xl *:!border-white/20">
          {children}
        </div>
      </div>
    </div>
  );
}
