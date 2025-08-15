import { toast } from "sonner";
import { UiWalletAccount } from "@wallet-standard/react";
import { useWalletAccountTransactionSigner } from "@solana/react";
import { address, Address, assertIsAddress, LAMPORTS_PER_SOL } from "gill";

import { Button } from "~/components/ui/button";
import { TokenData, useRefetchTransactions } from "~/hooks/resources";

import {
  createTransferSolMessage,
  createTransferTokenMessage,
  sendAndConfirmTransferWithProposalApproveMessage,
} from "~/program/multisig/message";
import { SOL_MINT_ADDRESS } from "~/program/multisig/address";

export default function Review({
  token,
  amount,
  errors,
  onClose,
  addError,
  toAddress,
  vaultAddress,
  walletAccount,
  multisigAddress,
  transactionIndex,
}: {
  toAddress: string;
  onClose: () => void;
  amount: number | null;
  vaultAddress: Address;
  token: TokenData | null;
  multisigAddress: Address;
  transactionIndex: number;
  walletAccount: UiWalletAccount;
  errors: { [key: string]: string } | null;
  addError: (key: string, message: string) => void;
}) {
  const refetchTransactions = useRefetchTransactions(multisigAddress);

  const signer = useWalletAccountTransactionSigner(
    walletAccount,
    "solana:mainnet",
  );

  const handleTx = async () => {
    if (!token) {
      addError("token", "Invalid token");
    }

    if (!amount) {
      addError("amount", "Invalid amount");
    }
    if (Number(amount) <= 0) {
      addError("amount", "Amount must be greater than 0");
    }
    if (Number(amount) > Number(token?.amount)) {
      addError("amount", "Insufficient balance");
    }

    try {
      assertIsAddress(toAddress);
    } catch (e) {
      addError("toAddress", "Invalid address");
      return;
    }

    if (
      !token ||
      !amount ||
      !toAddress ||
      (amount && amount <= 0) ||
      (amount && amount > Number(token?.amount))
    ) {
      console.error(errors);
      return;
    }

    const nextTxIndex = BigInt(transactionIndex + 1);
    const memberAddress = address(walletAccount.address);
    const creatorAddress = address(walletAccount.address);
    const isSolTransfer = token.mint === SOL_MINT_ADDRESS;

    let transactionMessage = null;

    const fee = 5000;

    if (isSolTransfer) {
      transactionMessage = await createTransferSolMessage({
        toAddress: address(toAddress),
        source: vaultAddress,
        amount: amount * LAMPORTS_PER_SOL - fee,
      });
    } else {
      transactionMessage = await createTransferTokenMessage({
        toAddress: address(toAddress),
        fromToken: token,
        signer: vaultAddress,
        authorityAddress: vaultAddress,
        amount: amount * 10 ** token.decimals,
      });
    }

    try {
      await sendAndConfirmTransferWithProposalApproveMessage({
        memo: "auto approve",
        memberAddress,
        creatorAddress,
        multisigAddress,
        feePayer: signer,
        transactionMessage,
        transactionIndex: nextTxIndex,
      });

      await refetchTransactions();
    } catch (e: any) {
      toast.error("Failed to initiate transfer");
      console.error("Error [Initiate, Proposal, Approve]: ", e);
    } finally {
      onClose();
    }
  };

  return (
    <div className="flex flex-row gap-2 justify-center">
      <Button onClick={handleTx}>Initiate</Button>
    </div>
  );
}
