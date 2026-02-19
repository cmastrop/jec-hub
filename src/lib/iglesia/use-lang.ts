"use client";

import { createContext, useContext } from "react";
import type { LangContextValue } from "./types";

export const LangContext = createContext<LangContextValue>({
  lang: "en",
  setLang: () => {},
  toggleLang: () => {},
});

export function useLang() {
  return useContext(LangContext);
}
