import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useCallback, useState, type ReactNode } from "react";

import { ToastContext, type ToastKind } from "@/lib/toast";
type Toast = { id: number; kind: ToastKind; message: string };

const toastStyles: Record<ToastKind, { icon: typeof Info; className: string }> = {
  success: { icon: CheckCircle2, className: "text-success" },
  error: { icon: XCircle, className: "text-danger" },
  info: { icon: Info, className: "text-info" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismiss = useCallback(
    (id: number) => setToasts((current) => current.filter((toast) => toast.id !== id)),
    [],
  );
  const notify = useCallback(
    (message: string, kind: ToastKind = "info") => {
      const id = Date.now();
      setToasts((current) => [...current, { id, kind, message }].slice(-3));
      window.setTimeout(() => dismiss(id), 4_000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div
        aria-live="polite"
        className="fixed right-4 top-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
      >
        {toasts.map((toast) => {
          const style = toastStyles[toast.kind];
          const Icon = style.icon;
          return (
            <div
              key={toast.id}
              role={toast.kind === "error" ? "alert" : "status"}
              className="card-surface flex items-start gap-3 p-3.5 shadow-pop animate-slide-in-right"
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.className}`} />
              <p className="flex-1 text-sm leading-5 text-foreground">{toast.message}</p>
              <button
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="rounded-md p-1 text-muted-foreground hover:bg-surface hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
