"use client";

import dynamic from "next/dynamic"; // ✅ Correct import

// ✅ Dynamically import SupportPage to disable SSR
const SupportPage = dynamic(() => import("./SupportPage"), { ssr: false });

export default function Page() {
  return <SupportPage />;
}
