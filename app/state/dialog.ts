import { create } from "zustand";

export type DialogName = "withdraw" | "transaction" | "connectWallet";

type DialogState = {
  data: Record<DialogName, any>;
  isOpen: Record<DialogName, boolean>;
  onOpenChange: <T>(name: DialogName, open: boolean, data?: T) => void;
};

export const useDialogStore = create<DialogState>((set) => ({
  data: {
    withdraw: null,
    transaction: null,
    connectWallet: null,
  },
  isOpen: {
    withdraw: false,
    transaction: false,
    connectWallet: false,
  },
  onOpenChange: (name, open, data) =>
    set((state) => {
      return {
        data: {
          ...state.data,
          [name]: data,
        },
        isOpen: {
          ...state.isOpen,
          [name]: open,
        },
      };
    }),
}));

export const useDialog = (name: DialogName) => {
  const { isOpen, data, onOpenChange } = useDialogStore();

  return {
    data: data[name],
    isOpen: isOpen[name],
    onOpenChange: (open: boolean, data?: any) => {
      if (!open) {
        onOpenChange(name, open, null);
      } else {
        onOpenChange(name, open, data);
      }
    },
  };
};
