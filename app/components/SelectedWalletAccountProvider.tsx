import {
  getUiWalletAccountStorageKey,
  UiWallet,
  UiWalletAccount,
  uiWalletAccountBelongsToUiWallet,
  uiWalletAccountsAreSame,
  useWallets,
} from "@wallet-standard/react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type SelectedWalletAccountState = UiWalletAccount | null;

const SelectedWalletAccountContext = createContext<
  readonly [
    selectedWalletAccount: SelectedWalletAccountState,
    setSelectedWalletAccount: React.Dispatch<
      React.SetStateAction<SelectedWalletAccountState>
    >,
  ]
>([
  null /* selectedWalletAccount */,
  function setSelectedWalletAccount() {
    /* empty */
  },
]);

const STORAGE_KEY = "fuse-web-ui:selected-wallet-and-address";

let wasSetterInvoked = false;

export function useSelectedWalletAccount() {
  const [walletAccount, setWalletAccount] = useContext(
    SelectedWalletAccountContext,
  );

  return { walletAccount, setWalletAccount };
}

/**
 * Saves the selected wallet account's storage key to the browser's local storage. In future
 * sessions it will try to return that same wallet account, or at least one from the same brand of
 * wallet if the wallet from which it came is still in the Wallet Standard registry.
 */
export function SelectedWalletAccountProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const wallets = useWallets();
  const [selectedWalletAccount, setSelectedWalletAccountInternal] =
    useState<SelectedWalletAccountState>(() => getSavedWalletAccount(wallets));
  const setSelectedWalletAccount: React.Dispatch<
    React.SetStateAction<SelectedWalletAccountState>
  > = (setStateAction) => {
    setSelectedWalletAccountInternal((prevSelectedWalletAccount) => {
      wasSetterInvoked = true;
      const nextWalletAccount =
        typeof setStateAction === "function"
          ? setStateAction(prevSelectedWalletAccount)
          : setStateAction;
      const accountKey = nextWalletAccount
        ? getUiWalletAccountStorageKey(nextWalletAccount)
        : undefined;
      if (accountKey) {
        localStorage.setItem(STORAGE_KEY, accountKey);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
      return nextWalletAccount;
    });
  };
  useEffect(() => {
    const savedWalletAccount = getSavedWalletAccount(wallets);
    if (savedWalletAccount) {
      setSelectedWalletAccountInternal(savedWalletAccount);
    }
  }, [wallets]);
  const walletAccount = useMemo(() => {
    if (!selectedWalletAccount) return null;

    for (const uiWallet of wallets) {
      for (const uiWalletAccount of uiWallet.accounts) {
        if (uiWalletAccountsAreSame(selectedWalletAccount, uiWalletAccount)) {
          return uiWalletAccount;
        }
      }
      if (
        uiWalletAccountBelongsToUiWallet(selectedWalletAccount, uiWallet) &&
        uiWallet.accounts[0]
      ) {
        // If the selected account belongs to this connected wallet, at least, then
        // select one of its accounts.
        return uiWallet.accounts[0];
      }
    }

    return null;
  }, [selectedWalletAccount, wallets]);
  useEffect(() => {
    // If there is a selected wallet account but the wallet to which it belongs has since
    // disconnected, clear the selected wallet.
    if (selectedWalletAccount && !walletAccount) {
      setSelectedWalletAccountInternal(null);
    }
  }, [selectedWalletAccount, walletAccount]);
  return (
    <SelectedWalletAccountContext.Provider
      value={useMemo(
        () => [walletAccount, setSelectedWalletAccount],
        [walletAccount],
      )}
    >
      {children}
    </SelectedWalletAccountContext.Provider>
  );
}

function getSavedWalletAccount(
  wallets: readonly UiWallet[],
): UiWalletAccount | null {
  // After the user makes an explicit choice of wallet, stop trying to auto-select the
  // saved wallet, if and when it appears.
  if (wasSetterInvoked) return null;

  const savedWalletNameAndAddress = localStorage.getItem(STORAGE_KEY);
  if (!savedWalletNameAndAddress) return null;

  const [savedWalletName, savedAccountAddress] =
    savedWalletNameAndAddress.split(":");
  if (!savedWalletName || !savedAccountAddress) return null;

  for (const wallet of wallets) {
    if (wallet.name !== savedWalletName) continue;

    for (const account of wallet.accounts) {
      if (account.address === savedAccountAddress) {
        return account;
      }
    }
  }

  return null;
}
