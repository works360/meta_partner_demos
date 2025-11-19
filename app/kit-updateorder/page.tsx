import { Suspense } from "react";
import KitUpdateOrderPage from "./client-page";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <KitUpdateOrderPage />
    </Suspense>
  );
}
