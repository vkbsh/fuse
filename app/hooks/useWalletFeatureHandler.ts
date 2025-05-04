import {
  useConnect,
  useWallets,
  getWalletFeature,
} from "@wallet-standard/react";
import { getBase64EncodedWireTransaction, Transaction } from "gill";

import { useWalletStore } from "~/state/wallet";

type Feature = "signAndSendTransaction";

export function useWalletFeatureHandler(feature: Feature) {
  const wallets = useWallets();
  const { currentWallet } = useWalletStore();

  const wallet = wallets
    .filter((w) => w.features.includes(`solana:${feature}`))
    .find((w) => w.name === currentWallet?.name);

  const [, connect] = useConnect(wallet);

  // TODO: extend feature list
  if (feature !== "signAndSendTransaction") {
    throw new Error("Feature not supported");
  }

  const handlerFeature = async ({
    transaction,
  }: {
    transaction: Transaction;
  }) => {
    const accounts = await connect({ silent: true });
    const account = accounts[0];

    const { signAndSendTransaction } = getWalletFeature(
      account,
      `solana:${feature}`,
    );

    try {
      const [{ signature }] = await signAndSendTransaction({
        account,
        chain: "solana:mainnet",
        transaction: Buffer.from(
          getBase64EncodedWireTransaction(transaction),
          "base64",
        ),
      });

      return signature;
    } catch (error) {
      console.error(error);

      return null;
    }
  };

  return handlerFeature;
}
