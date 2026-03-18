"use client";

import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}

export function Modal({ open, onClose, title, children, wide }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className={`relative bg-card border border-border rounded-t-xl sm:rounded-xl w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto sm:m-4 ${wide ? "max-w-4xl" : "max-w-lg"}`}>
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 -mr-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}
