import { create } from "zustand";

type Toast = {
  status: "default" | "success" | "error";
  open: boolean;
  type?: string;
  duration?: number;
  description: string;
};

type ToastStore = {
  toasts: Map<string, Toast>;
  toastElementsMap: Map<string, HTMLElement>;
  sortToasts: () => void;
  removeToast: (key: string) => void;
  addToast: (toast: Omit<Toast, "open">) => void;
  setToastElement: (key: string, element: HTMLElement | null) => void;
};

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: new Map(),
  toastElementsMap: new Map(),

  addToast: (toast) => {
    set((state) => {
      const newMap = new Map(state.toasts);
      newMap.set(String(Date.now()), { ...toast, open: true });
      return { toasts: newMap };
    });

    get().sortToasts();
  },

  removeToast: (key) =>
    set((state) => {
      const newMap = new Map(state.toasts);
      newMap.delete(key);
      return { toasts: newMap };
    }),

  setToastElement: (key, element) =>
    set((state) => {
      const newMap = new Map(state.toastElementsMap);
      if (element) {
        newMap.set(key, element);
      } else {
        newMap.delete(key);
      }
      return { toastElementsMap: newMap };
    }),

  sortToasts: () =>
    set((state) => {
      const entries = Array.from(state.toasts.entries());
      entries.sort((a, b) => Number(b[0]) - Number(a[0]));

      return { toasts: new Map(entries) };
    }),
}));

export const toast = (description: string) =>
  useToastStore.getState().addToast({ status: "default", description });

toast.success = (description: string) =>
  useToastStore.getState().addToast({ status: "success", description });

toast.error = (description: string) =>
  useToastStore.getState().addToast({ status: "error", description });
