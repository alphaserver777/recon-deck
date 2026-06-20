"use client";

import { NavFilterProvider } from "@/lib/nav-filter-context";
import { CompanyProvider } from "@/lib/company-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CompanyProvider>
      <NavFilterProvider>{children}</NavFilterProvider>
    </CompanyProvider>
  );
}
