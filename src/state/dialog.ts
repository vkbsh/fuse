import { create } from "zustand";

type DialogName = "connect" | "withdraw" | "transaction";

type DialogState = {
  [key in DialogName]: {
    meta?: any;
    isOpen: boolean;
  };
};

type DialogActions = {
  setOpen: (name: DialogName, isOpen: boolean, meta?: any) => void;
};

export const useBaseDialogStore = create<DialogState & DialogActions>(
  (set) => ({
    connect: {
      meta: null,
      isOpen: false,
    },
    withdraw: {
      meta: null,
      isOpen: false,
    },
    transaction: {
      meta: null,
      isOpen: false,
    },

    setOpen: (name, isOpen, meta) => set({ [name]: { isOpen, meta } }),
  }),
);

export function useDialogStore(name: DialogName) {
  const setOpen = useBaseDialogStore((s) => s.setOpen);
  const { isOpen, meta } = useBaseDialogStore((s) => s[name]);

  return {
    meta,
    isOpen,
    onOpenChange: (open: boolean, meta?: any) => setOpen(name, open, meta),
  };
}
