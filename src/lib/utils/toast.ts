type ToastType = "success" | "error" | "info";

export interface ToastEvent {
  message: string;
  type: ToastType;
}

const TOAST_EVENT = "app:toast";

function emit(type: ToastType, message: string) {
  window.dispatchEvent(
    new CustomEvent<ToastEvent>(TOAST_EVENT, { detail: { message, type } })
  );
}

export const toast = {
  success: (message: string) => emit("success", message),
  error: (message: string) => emit("error", message),
  info: (message: string) => emit("info", message),
};

export function onToast(handler: (e: ToastEvent) => void) {
  const listener = (e: Event) => handler((e as CustomEvent<ToastEvent>).detail);
  window.addEventListener(TOAST_EVENT, listener);
  return () => window.removeEventListener(TOAST_EVENT, listener);
}
