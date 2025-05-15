import {
  getMintSize,
  getTokenSize,
  getMintToInstruction,
  TOKEN_PROGRAM_ADDRESS,
  getInitializeMintInstruction,
  getInitializeAccountInstruction,
} from "@solana-program/token";

import {
  pipe,
  lamports,
  Commitment,
  KeyPairSigner,
  airdropFactory,
  LAMPORTS_PER_SOL,
  TransactionSigner,
  generateKeyPairSigner,
  createTransactionMessage,
  getSignatureFromTransaction,
  CompilableTransactionMessage,
  sendAndConfirmTransactionFactory,
  signTransactionMessageWithSigners,
  setTransactionMessageFeePayerSigner,
  appendTransactionMessageInstructions,
  TransactionMessageWithBlockhashLifetime,
  setTransactionMessageLifetimeUsingBlockhash,
} from "gill";

import { getCreateAccountInstruction } from "gill/programs";

import { Address } from "~/model/web3js";
import { useRpcStore } from "~/state/rpc";

const client = useRpcStore.getState();

export const airdrop = async (
  recipientAddress: Address,
  putativeLamports: bigint = lamports(BigInt(LAMPORTS_PER_SOL)),
) => {
  await airdropFactory(client)({
    recipientAddress,
    commitment: "confirmed",
    lamports: lamports(putativeLamports),
  });
};

export const getBalance = async (address: Address) => {
  return client.rpc.getBalance(address).send();
};

export async function getMockToken({
  creator,
  vaultPda,
}: {
  vaultPda: Address;
  creator: KeyPairSigner;
}) {
  const decimals = 6;
  const mint = await createMint(creator, creator.address, decimals);

  const ata = await createTokenWithAmount(
    mint,
    vaultPda,
    BigInt(10 ** decimals),
    creator,
    creator,
  );

  return {
    ata,
    mint,
    decimals,
  };
}

const createMint = async (
  payer: TransactionSigner,
  mintAuthority: Address,
  decimals: number = 0,
): Promise<Address> => {
  const space = BigInt(getMintSize());
  const [transactionMessage, rent, mint] = await Promise.all([
    createDefaultTransaction(payer),
    client.rpc.getMinimumBalanceForRentExemption(space).send(),
    generateKeyPairSigner(),
  ]);
  const instructions = [
    getCreateAccountInstruction({
      payer,
      space,
      lamports: rent,
      newAccount: mint,
      programAddress: TOKEN_PROGRAM_ADDRESS,
    }),
    getInitializeMintInstruction({
      decimals,
      mintAuthority,
      mint: mint.address,
    }),
  ];

  await pipe(
    transactionMessage,
    (tx) => appendTransactionMessageInstructions(instructions, tx),
    (tx) => signAndSendTransaction(tx),
  );

  return mint.address;
};

const createTokenWithAmount = async (
  mint: Address,
  owner: Address,
  amount: bigint,
  payer: TransactionSigner,
  mintAuthority: TransactionSigner,
): Promise<Address> => {
  const space = BigInt(getTokenSize());
  const [transactionMessage, rent, token] = await Promise.all([
    createDefaultTransaction(payer),
    client.rpc.getMinimumBalanceForRentExemption(space).send(),
    generateKeyPairSigner(),
  ]);
  const instructions = [
    getCreateAccountInstruction({
      payer,
      space,
      lamports: rent,
      newAccount: token,
      programAddress: TOKEN_PROGRAM_ADDRESS,
    }),
    getInitializeAccountInstruction({ account: token.address, mint, owner }),
    getMintToInstruction({ mint, token: token.address, mintAuthority, amount }),
  ];
  await pipe(
    transactionMessage,
    (tx) => appendTransactionMessageInstructions(instructions, tx),
    (tx) => signAndSendTransaction(tx),
  );

  return token.address;
};

const signAndSendTransaction = async (
  transactionMessage: CompilableTransactionMessage &
    TransactionMessageWithBlockhashLifetime,
  commitment: Commitment = "confirmed",
) => {
  const signedTransaction =
    await signTransactionMessageWithSigners(transactionMessage);
  const signature = getSignatureFromTransaction(signedTransaction);
  await sendAndConfirmTransactionFactory(client)(signedTransaction, {
    commitment,
  });
  return signature;
};

const createDefaultTransaction = async (feePayer: TransactionSigner) => {
  const { value: latestBlockhash } = await client.rpc
    .getLatestBlockhash()
    .send();
  return pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
  );
};
