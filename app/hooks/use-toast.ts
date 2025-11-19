// hooks/use-toast.ts
"use client";

import { useState, useCallback } from "react";

interface Toast {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const [toastMessage, setToastMessage] = useState<Toast | null>(null);

  const toast = useCallback((message: Toast) => {
    setToastMessage(message);
    alert(`${message.title}\n${message.description || ""}`); // Simple fallback
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  return { toast, toastMessage };
}
