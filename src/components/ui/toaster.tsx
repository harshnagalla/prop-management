"use client";

import { useEffect, useState } from "react";
import * as Toast from "@radix-ui/react-toast";
import { X } from "lucide-react";
import { onToast, type ToastEvent } from "@/lib/utils/toast";

const TYPE_STYLES: Record<string, string> = {
  success: "border-accent/40 bg-accent/10 text-accent",
  error: "border-destructive/40 bg-destructive/10 text-destructive",
  info: "border-primary/40 bg-primary/10 text-primary",
};

interface ToastItem extends ToastEvent {
  id: number;
  open: boolean;
}

let nextId = 0;

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return onToast((e) => {
      setToasts((prev) => [...prev, { ...e, id: nextId++, open: true }]);
    });
  }, []);

  return (
    <Toast.Provider duration={3000} swipeDirection="right">
      {toasts.map((t) => (
        <Toast.Root
          key={t.id}
          open={t.open}
          onOpenChange={(open) =>
            setToasts((prev) =>
              open ? prev : prev.filter((x) => x.id !== t.id)
            )
          }
          className={`border rounded-[var(--radius)] px-4 py-3 flex items-center justify-between gap-3 shadow-lg ${TYPE_STYLES[t.type] || TYPE_STYLES.info}`}
        >
          <Toast.Title className="text-sm font-medium">
            {t.message}
          </Toast.Title>
          <Toast.Close className="opacity-60 hover:opacity-100">
            <X size={14} />
          </Toast.Close>
        </Toast.Root>
      ))}
      <Toast.Viewport className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 flex flex-col gap-2 w-auto sm:w-80 max-w-[calc(100vw-2rem)]" />
    </Toast.Provider>
  );
}
