import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import { ChurchShell } from "@/components/iglesia/church-shell";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Jesús Es El Camino — Spanish & English-Speaking Church Perth",
  description:
    "Iglesia multicultural en Perth, Australia. Servicios en español e inglés. Sunday 3-5pm, Wednesday 7:30-9pm. 73 Nollamara Ave, Nollamara WA 6061.",
  openGraph: {
    title: "Jesús Es El Camino Church Perth",
    description:
      "A multicultural Spanish and English-speaking church that seeks to make faithful followers of Christ.",
    images: ["/iglesia/logo.png"],
  },
};

export default function IglesiaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={playfair.variable}>
      <ChurchShell>{children}</ChurchShell>
    </div>
  );
}
