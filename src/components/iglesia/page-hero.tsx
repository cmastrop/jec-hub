"use client";

const serif = { fontFamily: "var(--font-playfair), Georgia, serif" };

export function PageHero({
  image,
  label,
  title,
}: {
  image: string;
  label: string;
  title: string;
}) {
  return (
    <section className="relative h-[40vh] min-h-[320px] flex items-center justify-center overflow-hidden">
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#2a1f14]/60 via-[#1a1510]/50 to-[#0f0c08]/70" />
      <div className="relative z-10 text-center px-4">
        <p className="text-[#C9A86C] tracking-[0.3em] text-xs uppercase mb-4">
          {label}
        </p>
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl text-white"
          style={serif}
        >
          {title}
        </h1>
        <div className="w-16 h-0.5 bg-[#C9A86C] mx-auto mt-6" />
      </div>
    </section>
  );
}
