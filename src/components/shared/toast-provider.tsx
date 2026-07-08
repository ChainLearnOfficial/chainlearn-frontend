"use client";

import { ToastContextProvider } from "./toast";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <ToastContextProvider>{children}</ToastContextProvider>;
}
