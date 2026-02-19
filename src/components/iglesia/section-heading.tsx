"use client";

const serif = { fontFamily: "var(--font-playfair), Georgia, serif" };

export function SectionHeading({
  label,
  title,
  light = false,
}: {
  label: string;
  title: string;
  light?: boolean;
}) {
  return (
    <div className="text-center mb-16">
      <p className="text-[#C9A86C] tracking-[0.3em] text-xs uppercase mb-4">
        {label}
      </p>
      <h2
        className={`text-3xl sm:text-4xl lg:text-5xl ${light ? "text-white" : "text-[#4A3F35]"}`}
        style={serif}
      >
        {title}
      </h2>
      <div className="w-16 h-0.5 bg-[#C9A86C] mx-auto mt-4" />
    </div>
  );
}
