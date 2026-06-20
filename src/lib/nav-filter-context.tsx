"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type NavFilterCtx = {
  content: ReactNode | null;
  set: (node: ReactNode | null) => void;
};

const Ctx = createContext<NavFilterCtx>({ content: null, set: () => {} });

export function NavFilterProvider({ children }: { children: ReactNode }) {
  const [content, set] = useState<ReactNode | null>(null);
  return <Ctx.Provider value={{ content, set }}>{children}</Ctx.Provider>;
}

export const useNavFilter = () => useContext(Ctx);
