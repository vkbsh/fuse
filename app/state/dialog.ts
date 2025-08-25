import { create } from "zustand";

type DialogName = "connect" | "withdraw" | "transaction";

type DialogState = {
  [key in DialogName]: {
    isOpen: boolean;
    meta?: any;
  };
};

type DialogActions = {
  setOpen: (name: DialogName, isOpen: boolean, meta?: any) => void;
};

export const useBaseDialogStore = create<DialogState & DialogActions>(
  (set) => ({
    connect: {
      isOpen: false,
      meta: null,
    },
    withdraw: {
      isOpen: false,
      meta: null,
    },
    transaction: {
      isOpen: false,
      meta: null,
    },

    setOpen: (name, isOpen, meta) => set({ [name]: { isOpen, meta } }),
  }),
);

export function useDialogStore(name: DialogName) {
  const { isOpen, meta } = useBaseDialogStore((state) => state[name]);
  const setOpen = useBaseDialogStore((state) => state.setOpen);

  return {
    meta,
    isOpen,
    onOpenChange: (open: boolean, meta?: any) => setOpen(name, open, meta),
  };
}
