import {
  useConnect,
  useWallets,
  UiWalletAccount,
  getWalletFeature,
} from "@wallet-standard/react";

import {
  address,
  LAMPORTS_PER_SOL,
  getBase64EncodedWireTransaction,
  TransactionSendingSigner,
  signTransactionMessageWithSigners,
  getSignatureFromTransaction,
  Transaction,
  TransactionSendingSignerConfig,
  SignatureBytes,
  getTransactionEncoder,
  isTransactionSendingSigner,
  signAndSendTransactionMessageWithSigners, // TODO: use as singer to set in setTransactionMessageFeePayerSigner
} from "gill";

import Input from "~/components/ui/Input";
import Button from "~/components/ui/Button";
import { IconLogo } from "~/components/icons/IconLogo";

import { useWithdrawStore } from "~/state/withdraw";
import { abbreviateAddress } from "~/utils/address";
import { getProposalPda } from "~/program/multisig/pda";

import {
  compileTransactionWithIx,
  createMessageWithSigner,
  createTransferInnerMessage,
  createTransferTokenInnerMessage,
} from "~/program/multisig/transaction";
import {
  createVaultInstruction,
  createProposalApproveInstruction,
  createProposalCreateInstruction,
} from "~/program/multisig/instruction";

import { Address } from "~/model/web3js";
import { useWalletStore, useSuspenseWalletByKey } from "~/state/wallet";
import { IdentifierString, WalletAccount } from "@wallet-standard/core";
import { getAbortablePromise } from "@solana/promises";

// interface SolanaSignAndSendTransactionOutput {
//   /** Transaction signature, as raw bytes. */
//   readonly signature: Uint8Array;
// }

type SolanaTransactionCommitment = "processed" | "confirmed" | "finalized";

type SolanaSignAndSendTransactionOptions = SolanaSignTransactionOptions & {
  /** Desired commitment level. If provided, confirm the transaction after sending. */
  readonly commitment?: SolanaTransactionCommitment;

  /** Disable transaction verification at the RPC. */
  readonly skipPreflight?: boolean;

  /** Maximum number of times for the RPC node to retry sending the transaction to the leader. */
  readonly maxRetries?: number;
};

type SolanaSignTransactionOptions = {
  /** Preflight commitment level. */
  readonly preflightCommitment?: SolanaTransactionCommitment;

  /** The minimum slot that the request can be evaluated at. */
  readonly minContextSlot?: number;
};

interface SolanaSignTransactionInput {
  /** Account to use. */
  readonly account: WalletAccount;

  /** Serialized transaction, as raw bytes. */
  readonly transaction: Uint8Array;

  /** Chain to use. */
  readonly chain?: IdentifierString;

  /** TODO: docs */
  readonly options?: SolanaSignTransactionOptions;
}

interface SolanaSignAndSendTransactionInput extends SolanaSignTransactionInput {
  /** Chain to use. */
  readonly chain: IdentifierString;

  /** TODO: docs */
  readonly options?: SolanaSignAndSendTransactionOptions;
}

type Input = Readonly<
  Omit<SolanaSignAndSendTransactionInput, "account" | "chain" | "options"> & {
    options?: Readonly<{
      minContextSlot?: bigint;
    }>;
  }
>;
// type Output = SolanaSignAndSendTransactionOutput;

const Review = ({
  onClose,
  prevStep,
}: {
  onClose: () => void;
  prevStep: () => void;
}) => {
  const wallets = useWallets();
  const { currentWallet, history } = useWalletStore();
  const { memo, toAddress, token, amount, set } = useWithdrawStore();
  const multisigWallet = useSuspenseWalletByKey(currentWallet?.address);
  const currentMultisigWallet = multisigWallet?.wallets[0];

  const wallet = wallets
    .filter((w) => w.features.includes("solana:signAndSendTransaction"))
    .find((w) => w.name === currentWallet?.name);
  const [, connect] = useConnect(wallet);

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
    const account = accounts[0];

    const { signAndSendTransaction } = getWalletFeature(
      account,
      "solana:signAndSendTransaction",
    );

    // const createTransactionSendingSigner = (
    //   uiWalletAccount: UiWalletAccount,
    //   chain: string,
    // ): TransactionSendingSigner<typeof uiWalletAccount.address> => {
    //   // Create encoder once
    //   const transactionEncoder = getTransactionEncoder();

    //   // Get the signAndSendTransaction function from wallet
    //   const signAndSendTransaction = async (inputWithOptions) => {
    //     // This is where you'd call your wallet's signAndSendTransaction method
    //     // Similar to what the hook does with the wallet standard
    //     return await signAndSendTransaction({
    //       account: uiWalletAccount,
    //       chain,
    //       transaction: inputWithOptions.transaction,
    //       ...inputWithOptions.options,
    //     });
    //   };

    //   return {
    //     address: address(uiWalletAccount.address),
    //     async signAndSendTransactions(transactions, config = {}) {
    //       const { abortSignal, ...options } = config;
    //       abortSignal?.throwIfAborted();

    //       if (transactions.length > 1) {
    //         throw Error("SOLANA_ERROR__SIGNER__WALLET_MULTISIGN_UNIMPLEMENTED");
    //       }
    //       if (transactions.length === 0) {
    //         return [];
    //       }

    //       const [transaction] = transactions;
    //       const wireTransactionBytes = transactionEncoder.encode(transaction);
    //       const inputWithOptions = {
    //         ...options,
    //         transaction: wireTransactionBytes as Uint8Array,
    //       };

    //       const { signature } = await getAbortablePromise(
    //         signAndSendTransaction(inputWithOptions),
    //         abortSignal,
    //       );

    //       return Object.freeze([signature as SignatureBytes]);
    //     },
    //   };
    // };

    // const signer: TransactionSendingSigner = createTransactionSendingSigner(
    //   account,
    //   "solana:mainnet",
    // );

    // const testTxMessage = await createMessageWithSigner({
    //   feePayer: signer,
    //   instructions,
    // });

    // try {
    //   const signedTransaction =
    //     await signTransactionMessageWithSigners(testTxMessage);
    //   const signature = getSignatureFromTransaction(signedTransaction);
    //   console.log("signature", signature);
    // } catch (error) {
    //   console.log("Error", error);
    // }

    try {
      const [{ signature }] = await signAndSendTransaction({
        account,
        chain: "solana:mainnet",
        transaction: Buffer.from(getBase64EncodedWireTransaction(tx), "base64"),
      });

      typeof onClose === "function" && onClose();
    } catch (error) {
      console.error(error);
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
