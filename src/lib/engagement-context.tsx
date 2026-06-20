"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { CompanyStatus } from "@/lib/ops-views/types";

export interface EngagementCtx {
  id: number;
  name: string;
  domain: string;
  vpnIp: string | null;
  status: CompanyStatus;
  progress: number;
  startDate: string;
  hostCount: number;
  highValueCount: number;
  entryPointCount: number;
  credCount: number;
  vulnCount: number;
  attackPathCount: number;
}

const Ctx = createContext<EngagementCtx | null>(null);

export function EngagementProvider({
  value,
  children,
}: {
  value: EngagementCtx;
  children: ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useEngagement(): EngagementCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useEngagement must be used within EngagementProvider");
  return ctx;
}
