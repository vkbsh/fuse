import {
  getWalletFeature,
  useConnect,
  useWallets,
} from "@wallet-standard/react";
import { getBase64EncodedWireTransaction } from "gill";

import { useWalletStore } from "~/state/wallet";

type Feature = "signAndSendTransaction";

export async function useWalletFeatureHandler(feature: Feature) {
  // TODO: extend feature list
  if (feature !== "signAndSendTransaction") {
    throw new Error("Feature not supported");
  }

  const wallets = useWallets();
  const { currentWallet } = useWalletStore();

  const wallet = wallets
    .filter((w) => w.features.includes(`solana:${feature}`))
    .find((w) => w.name === currentWallet?.name);

  const [, connect] = useConnect(wallet);

  const handlerSignAndSend = async (tx) => {
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
        transaction: Buffer.from(getBase64EncodedWireTransaction(tx), "base64"),
      });

      return signature;
    } catch (error) {
      console.error(error);

      return null;
    }
  };

  return handlerSignAndSend;
}
