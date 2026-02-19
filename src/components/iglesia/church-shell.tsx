"use client";

import { useState, type ReactNode } from "react";
import { LangContext } from "@/lib/iglesia/use-lang";
import type { Lang } from "@/lib/iglesia/types";
import { ChurchHeader } from "./church-header";
import { ChurchFooter } from "./church-footer";

export function ChurchShell({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const toggleLang = () => setLang((prev) => (prev === "en" ? "es" : "en"));

  return (
    <LangContext.Provider value={{ lang, setLang, toggleLang }}>
      <div className="min-h-screen bg-[#FAF8F5]">
        <ChurchHeader />
        <main>{children}</main>
        <ChurchFooter />
      </div>
    </LangContext.Provider>
  );
}
