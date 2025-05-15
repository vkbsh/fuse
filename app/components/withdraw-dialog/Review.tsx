import {
  address,
  LAMPORTS_PER_SOL,
  getBase58Decoder,
  signAndSendTransactionMessageWithSigners,
} from "gill";

import { UiWalletAccount } from "@wallet-standard/react";
import { useWalletAccountTransactionSendingSigner } from "@solana/react";

import Input from "~/components/ui/Input";
import Button from "~/components/ui/Button";
import { IconLogo } from "~/components/ui/icons/IconLogo";

import { useWithdrawStore } from "~/state/withdraw";
import { abbreviateAddress } from "~/utils/address";
import { getProposalPda } from "~/program/multisig/pda";

import {
  createMessageWithSigner,
  createTransferInnerMessage,
  createTransferTokenInnerMessage,
} from "~/program/multisig/transaction";

import {
  createProposalApproveInstruction,
  createProposalCreateInstruction,
} from "~/program/multisig/instruction";

import { createVaultInstruction } from "~/program/multisig/legacy";

import { useWalletStore, useWalletByKey } from "~/state/wallet";

const Review = ({
  onClose,
  prevStep,
  walletAccount,
}: {
  onClose: () => void;
  prevStep: () => void;
  walletAccount: UiWalletAccount;
}) => {
  // const wallets = useWallets();
  const { currentWallet, history } = useWalletStore();
  const { memo, toAddress, token, amount, set } = useWithdrawStore();
  const multisigWallet = useWalletByKey(currentWallet?.address);
  const currentMultisigWallet = multisigWallet?.wallets[0];

  const signer = useWalletAccountTransactionSendingSigner(
    walletAccount,
    "solana:mainnet",
  );

  const handleTx = async () => {
    const nextTxIndex = BigInt(
      currentMultisigWallet.account.transactionIndex + 1n,
    );

    const proposalPda = await getProposalPda({
      transactionIndex: nextTxIndex,
      multisigAddress: currentMultisigWallet.address,
    });

    let transferMessage = null;

    if (token?.mint !== "So11111111111111111111111111111111111111112") {
      transferMessage = await createTransferTokenInnerMessage({
        fromToken: token,
        toAddress: address(toAddress),
        amount: BigInt(amount * 10 ** token.decimals),
        authority: address(currentMultisigWallet?.defaultVault),
      });
    } else {
      transferMessage = await createTransferInnerMessage({
        lamports: Math.round(amount * LAMPORTS_PER_SOL),
        toAddress: address(toAddress),
        payer: address(currentMultisigWallet.defaultVault),
        fromAddress: address(currentMultisigWallet.defaultVault),
      });
    }

    const message = await createMessageWithSigner({
      feePayer: signer,
      instructions: [
        createVaultInstruction({
          vaultIndex: 0,
          ephemeralSigners: 0,
          transactionIndex: nextTxIndex,
          transactionMessage: transferMessage,
          creator: address(currentWallet?.address),
          multisigPda: address(currentMultisigWallet.address),
        }),
        createProposalCreateInstruction({
          transactionIndex: nextTxIndex,
          proposalPda: address(proposalPda),
          creator: address(currentWallet?.address),
          multisigPda: address(currentMultisigWallet.address),
        }),
        createProposalApproveInstruction({
          proposalPda,
          memo: "auto approve",
          memberAddress: address(currentWallet?.address),
          multisigPda: address(currentMultisigWallet.address),
        }),
      ],
    });

    try {
      const signatureBytes =
        await signAndSendTransactionMessageWithSigners(message);
      const base58Signature = getBase58Decoder().decode(signatureBytes);
      console.log("Signature [Initiate, Proposal, Approve]: ", base58Signature);
    } catch (error) {
      console.log("Error [Initiate, Proposal, Approve]:", error);
    } finally {
      typeof onClose === "function" && onClose();
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
            {abbreviateAddress(currentMultisigWallet?.defaultVault || "")}
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
          <span>{abbreviateAddress(toAddress || "")}</span>
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
