"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type ToastType = "success" | "error" | "info" | "warning";

type ToastItem = {
  id: number;
  type: ToastType;
  message: string;
};

type ConfirmOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
};

type ConfirmState = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  resolver?: (value: boolean) => void;
};

type FeedbackContextValue = {
  notify: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

const TOAST_STYLE: Record<ToastType, string> = {
  success: "border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
  error: "border-red-400/40 bg-red-500/15 text-red-200",
  info: "border-blue-400/40 bg-blue-500/15 text-blue-200",
  warning: "border-amber-400/40 bg-amber-500/15 text-amber-200",
};

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    title: "",
    message: "",
  });

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => dismissToast(id), 3200);
  }, [dismissToast]);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText,
        cancelText: options.cancelText,
        isDangerous: options.isDangerous,
        resolver: resolve,
      });
    });
  }, []);

  const value = useMemo<FeedbackContextValue>(() => ({
    notify,
    success: (message: string) => notify(message, "success"),
    error: (message: string) => notify(message, "error"),
    info: (message: string) => notify(message, "info"),
    warning: (message: string) => notify(message, "warning"),
    confirm,
  }), [notify, confirm]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <div className="fixed top-4 right-4 z-[110] w-[min(92vw,24rem)] space-y-2">
        {toasts.map((toast) => (
          <div
            className={`rounded-xl border px-4 py-3 text-sm font-semibold shadow-xl backdrop-blur ${TOAST_STYLE[toast.type]}`}
            key={toast.id}
            role="status"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="leading-relaxed">{toast.message}</p>
              <button
                aria-label="Dismiss"
                className="h-8 w-8 shrink-0 rounded-md bg-black/20 text-white/90"
                onClick={() => dismissToast(toast.id)}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        isDangerous={confirmState.isDangerous}
        onCancel={() => {
          confirmState.resolver?.(false);
          setConfirmState((prev) => ({ ...prev, isOpen: false }));
        }}
        onConfirm={() => {
          confirmState.resolver?.(true);
          setConfirmState((prev) => ({ ...prev, isOpen: false }));
        }}
      />
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedback must be used within FeedbackProvider");
  }
  return context;
}

export function useToast() {
  return useFeedback();
}

export function useConfirm() {
  const { confirm } = useFeedback();
  return confirm;
}
