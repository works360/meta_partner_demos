"use client";

import { useSearchParams } from "next/navigation";
import { Navbar } from "./Components/navbar";
import { Footer } from "./Components/footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const isEmbed = searchParams.get("embed") === "1";

  return (
    <>
      {!isEmbed && <Navbar />}
      {children}
      {!isEmbed && <Footer />}
    </>
  );
}
