import bs58 from "bs58";
import { z } from "zod";
import { useState } from "react";
import {
  useConnect,
  useWallets,
  getWalletFeature,
} from "@wallet-standard/react";

import Input from "~/components/ui/Input";
import Button from "~/components/ui/Button";
import { IconLogo } from "~/components/icons/IconLogo";

import { useWalletStore } from "~/state/wallet";
import { useWithdrawStore } from "~/state/withdraw";

import { abbreviateAddress } from "~/utils/address";
import { getProposalPda } from "~/program/multisig/pda";
import { address, getBase64EncodedWireTransaction } from "gill";
import {
  compileTransactionWithIx,
  createVaultInstruction,
  createTransferInnerMessage,
  createTransferTokenInnerMessage,
} from "~/program/multisig/transaction";
import {
  createProposalApproveInstruction,
  createProposalCreateInstruction,
} from "~/program/multisig/instruction";

const Memo = z.string().max(140).optional();

const Review = ({
  onClose,
  prevStep,
}: {
  onClose: () => void;
  prevStep: () => void;
}) => {
  const wallets = useWallets();
  const { currentWallet, currentMultisigWallet } = useWalletStore();
  const { memo, toAddress, token, amount, set } = useWithdrawStore();

  const wallet = wallets.find((w) => w.name === currentWallet?.name); // TODO: check features available (filter by features)
  const [, connect] = useConnect(wallet);

  const handleTx = async () => {
    const nextTxIndex = BigInt(
      currentMultisigWallet.account.transactionIndex + 1n,
    );

    console.log(
      "transactionIndex",
      currentMultisigWallet?.account.transactionIndex,
    );
    console.log("nextTxIndex", nextTxIndex);

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
        lamports: 1_000_000 * amount,
        toAddress: address(toAddress),
        payer: address(currentMultisigWallet.defaultVault),
        fromAddress: address(currentMultisigWallet.defaultVault),
      });
    }

    const instructions = [
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
    ];

    const tx = await compileTransactionWithIx({
      instructions,
      feePayer: address(currentWallet?.address),
    });

    const accounts = await connect({ silent: true });

    const { signAndSendTransaction } = getWalletFeature(
      wallet,
      "solana:signAndSendTransaction",
    );

    const [{ signature }] = await signAndSendTransaction({
      account: accounts[0], // TODO: check if correct account selected
      chain: "solana:mainnet",
      transaction: Buffer.from(getBase64EncodedWireTransaction(tx), "base64"),
    });

    console.log("Signature", bs58.encode(signature));

    onClose();
  };

  return (
    <>
      <h3 className="text-center font-bold text-xl">Review</h3>
      <div className="h-14 border border-white rounded-[20px] px-4 py-2.5 flex flex-row gap-2 items-center justify-between">
        <span>From</span>
        <span className="flex flex-row items-center gap-3">
          <span className="flex w-8 h-8 rounded-full bg-white justify-center text-black">
            <IconLogo />
          </span>
          <span>{abbreviateAddress(currentMultisigWallet?.defaultVault)}</span>
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
            <img
              src={currentWallet?.icon}
              alt={currentWallet?.name}
              className="rounded-full w-6 h-6"
            />
          </span>
          <span>{abbreviateAddress(toAddress)}</span>
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
        <Button size="md" onClick={prevStep} variant="secondary">
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
