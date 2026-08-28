"use client";

import { usePathname } from "next/navigation";
import React from "react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} id="page-content">
      {children}
    </div>
  );
}
