"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const KIT_PAGES = [
  "/create-kit",
  "/pre-package-apps",
  "/managed-apps",
  "/review-kit",
  "/checkout",
];

const isKitPage = (path: string) => {
  return KIT_PAGES.some((page) => path.startsWith(page));
};

const clearKitSession = () => {
  localStorage.removeItem("kit_active");
  localStorage.removeItem("kit_headset");
  localStorage.removeItem("kit_preapps");
  localStorage.removeItem("kit_managedapps");
  localStorage.removeItem("kit_review");
};

export default function KitSessionGuard({ children }: { children: React.ReactNode }) {
  const path = usePathname();

  useEffect(() => {
    const active = localStorage.getItem("kit_active");

    if (isKitPage(path)) {
      if (!active) localStorage.setItem("kit_active", "true");
    } else {
      if (active) clearKitSession();
    }
  }, [path]);

  return <>{children}</>;
}