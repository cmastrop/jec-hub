"use client";

import { useState, useEffect, useRef, type ReactNode, Children } from "react";

type Variant = "fade-up" | "fade-left" | "fade-right" | "scale-in";

const variantClasses: Record<Variant, { hidden: string; visible: string }> = {
  "fade-up": { hidden: "opacity-0 translate-y-8", visible: "opacity-100 translate-y-0" },
  "fade-left": { hidden: "opacity-0 translate-x-8", visible: "opacity-100 translate-x-0" },
  "fade-right": { hidden: "opacity-0 -translate-x-8", visible: "opacity-100 translate-x-0" },
  "scale-in": { hidden: "opacity-0 scale-95", visible: "opacity-100 scale-100" },
};

export function FadeIn({
  children,
  className = "",
  delay = 0,
  variant = "fade-up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: Variant;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const v = variantClasses[variant];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? v.visible : v.hidden} ${className}`}
    >
      {children}
    </div>
  );
}

export function StaggerChildren({
  children,
  staggerMs = 100,
  variant = "fade-up",
  className = "",
}: {
  children: ReactNode;
  staggerMs?: number;
  variant?: Variant;
  className?: string;
}) {
  const items = Children.toArray(children);
  return (
    <div className={className}>
      {items.map((child, i) => (
        <FadeIn key={i} delay={i * staggerMs} variant={variant}>
          {child}
        </FadeIn>
      ))}
    </div>
  );
}
