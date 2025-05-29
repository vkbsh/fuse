import { UiWalletAccount } from "@wallet-standard/react";
import { useWalletAccountTransactionSendingSigner } from "@solana/react";
import {
  LAMPORTS_PER_SOL,
  signAndSendTransactionMessageWithSigners,
} from "gill";

import Input from "~/components/ui/Input";
import Button from "~/components/ui/Button";
import { IconLogo } from "~/components/ui/icons/IconLogo";

import {
  createTransferSolMessage,
  createTransferTokenMessage,
} from "~/program/multisig/utils/message";

import { toast } from "~/state/toast";
import { useWalletStore } from "~/state/wallet";
import { useWithdrawStore } from "~/state/withdraw";

import { Address } from "~/model/web3js";
import { abbreviateAddress } from "~/utils/address";

const Review = ({
  onClose,
  prevStep,
  walletAccount,
  transactionIndex,
}: {
  onClose: () => void;
  prevStep: () => void;
  transactionIndex: number;
  walletAccount: UiWalletAccount;
}) => {
  const { memo, toAddress, token, amount, set } = useWithdrawStore();
  const { storageWallet, storageMultisigWallet, history } = useWalletStore();

  const signer = useWalletAccountTransactionSendingSigner(
    walletAccount,
    "solana:mainnet", // TODO: Get from .env
  );

  const handleTx = async () => {
    if (
      !transactionIndex ||
      !storageWallet ||
      !toAddress ||
      !token ||
      !amount
    ) {
      // TODO: Trigger Toast
      console.log("Error [Review]: Missing data");
      return;
    }

    const nextTxIndex = BigInt(transactionIndex + 1);

    let message = null;
    const memo = "auto approve";
    const isNative =
      token?.mint === "So11111111111111111111111111111111111111112";

    if (!isNative) {
      message = await createTransferTokenMessage({
        memo,
        toAddress,
        feePayer: signer,
        fromToken: token,
        transactionIndex: nextTxIndex,
        creator: storageWallet?.address as Address,
        amount: Math.round(amount * 10 ** token.decimals),
        multisigPda: storageMultisigWallet?.address as Address,
        authority: storageMultisigWallet?.defaultVault as Address,
      });
    } else {
      message = await createTransferSolMessage({
        memo,
        toAddress,
        feePayer: signer,
        transactionIndex: nextTxIndex,
        creator: storageWallet?.address,
        amount: Math.round(amount * LAMPORTS_PER_SOL),
        multisigPda: storageMultisigWallet?.address as Address,
      });
    }

    try {
      const signature = await signAndSendTransactionMessageWithSigners(message);
      // TODO: Check status of transaction
      console.log("Signature", signature);
      // TODO: Fetch status of transaction
      typeof onClose === "function" && onClose();
    } catch (error) {
      toast.error(error.message);
      typeof onClose === "function" && onClose();
      console.error("Error [Initiate, Proposal, Approve]:", error);
    }
  };

  const fromHistory = history?.find((w) => w.address === toAddress);

  return (
    <>
      <h3 className="text-center font-bold text-xl">Review</h3>
      <div className="h-14 border border-white rounded-[20px] px-4 py-2.5 flex flex-row gap-2 items-center justify-between">
        <span>From</span>
        <span className="flex flex-row items-center gap-3">
          <span className="flex w-8 h-8 rounded-full bg-white justify-center text-black">
            <IconLogo />
          </span>
          <span>
            {abbreviateAddress(storageMultisigWallet?.defaultVault as Address)}
          </span>
        </span>
      </div>
      <div className="h-14 border border-white rounded-[20px] px-4 py-2.5 flex flex-row gap-2 items-center justify-between">
        <span>Token</span>
        <span className="flex flex-row items-center gap-2">
          <span>{amount}</span>
          <span className="opacity-40">{token?.symbol}</span>
        </span>
      </div>
      <div className="h-14 border border-white rounded-[20px] px-4 py-2.5 flex flex-row gap-2 items-center justify-between">
        <span>To</span>
        <span className="flex flex-row items-center gap-3">
          <span className="flex w-8 h-8 rounded-full bg-white justify-center items-center text-black">
            {toAddress === fromHistory?.address ? (
              <img
                src={fromHistory?.icon}
                alt={fromHistory?.name}
                className="rounded-full w-6 h-6"
              />
            ) : (
              <span className="w-6 h-6 rounded-full bg-black" />
            )}
          </span>
          <span>{abbreviateAddress(toAddress as Address)}</span>
        </span>
      </div>
      <div className="h-14 border border-white rounded-[20px] px-4 py-2.5 flex flex-row gap-2 items-center justify-between">
        <Input
          defaultValue={memo}
          placeholder="Leve a note"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            set("memo", e.target.value)
          }
        />
      </div>
      <div className="flex flex-row gap-2 justify-center">
        <Button size="md" onClick={prevStep} variant="cancel">
          Back
        </Button>
        <Button size="md" onClick={handleTx} variant="secondary">
          Initiate
        </Button>
      </div>
    </>
  );
};

export default Review;
