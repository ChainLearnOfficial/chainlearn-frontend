"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [prevPath, setPrevPath] = useState(pathname);
  const [isFirstRender, setIsFirstRender] = useState(true);

  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setIsFirstRender(false);
  }

  return (
    <div
      key={pathname}
      id="page-content"
      className={isFirstRender ? "no-animation" : ""}
    >
      {children}
    </div>
  );
}
