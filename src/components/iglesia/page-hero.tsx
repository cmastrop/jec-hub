"use client";

const serif = { fontFamily: "var(--font-playfair), Georgia, serif" };

export function PageHero({
  image,
  label,
  title,
  titleAccent,
  allowOverlap = false,
  imagePosition,
  tall = false,
}: {
  image: string;
  label: string;
  title: string;
  titleAccent?: string;
  allowOverlap?: boolean;
  imagePosition?: string;
  tall?: boolean;
}) {
  return (
    <section
      className={`relative flex items-center justify-center overflow-hidden ${
        tall
          ? "h-[65vh] min-h-[480px]"
          : allowOverlap
            ? "h-[50vh] min-h-[380px]"
            : "h-[40vh] min-h-[320px]"
      }`}
    >
      <img
        src={image}
        alt={titleAccent ? `${title} ${titleAccent}` : title}
        className="absolute inset-0 w-full h-full object-cover"
        style={imagePosition ? { objectPosition: imagePosition } : undefined}
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
          {titleAccent ? (
            <>
              <span className="font-light">{title}</span>{" "}
              <span className="font-bold">{titleAccent}</span>
            </>
          ) : (
            title
          )}
        </h1>
        <div className="w-16 h-0.5 bg-[#C9A86C] mx-auto mt-6" />
      </div>
    </section>
  );
}
