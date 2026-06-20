"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Company } from "./company-data";
import { MOCK_COMPANIES } from "./company-data";

type CompanyCtx = {
  selected: Company | null;
  select: (company: Company) => void;
  companies: Company[];
};

const Ctx = createContext<CompanyCtx>({
  selected: null,
  select: () => {},
  companies: [],
});

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Company | null>(MOCK_COMPANIES[0]);
  return (
    <Ctx.Provider value={{ selected, select: setSelected, companies: MOCK_COMPANIES }}>
      {children}
    </Ctx.Provider>
  );
}

export const useCompany = () => useContext(Ctx);
