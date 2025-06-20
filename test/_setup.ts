import * as multisig from "@sqds/multisig";
import { Connection, Keypair, PublicKey, Signer } from "web3js1";

import {
  getMintSize,
  getTokenSize,
  getMintToInstruction,
  TOKEN_2022_PROGRAM_ADDRESS,
  getInitializeMintInstruction,
  getInitializeAccountInstruction,
} from "gill/programs/token";

import {
  pipe,
  address,
  Address,
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

import { useRpcStore, RPC_URL_TEST } from "~/state/rpc";

const client = useRpcStore.getState();
const connection = new Connection(RPC_URL_TEST, "confirmed");
export async function getMultisigInfo({
  multisigPda,
}: {
  multisigPda: PublicKey;
}) {
  const multisigInfo = await multisig.accounts.Multisig.fromAccountAddress(
    // @ts-expect-error: incompatible type of Connection (solana web3js1 squads vs fuse)
    connection,
    multisigPda,
  );

  return multisigInfo;
}

export function generateLegacyKeyPair(): Keypair {
  return Keypair.generate();
}

export function getMultisigPda(createKey: Address): PublicKey {
  const [multisigPda] = multisig.getMultisigPda({
    createKey: new PublicKey(createKey),
  });

  return multisigPda;
}

export async function createMultisig({
  creator,
  members,
  createKey,
  multisigPda,
  rentCollector,
}: {
  creator: Signer;
  createKey: Signer;
  multisigPda: PublicKey;
  rentCollector: Address;
  members: Array<{ key: Address; permissions: { mask: number } }>;
}) {
  const programConfigPda = multisig.getProgramConfigPda({})[0];

  const programConfig =
    await multisig.accounts.ProgramConfig.fromAccountAddress(
      // @ts-expect-error: incompatible type of Connection (solana web3js1 squads vs fuse)
      connection,
      programConfigPda,
    );

  const legacyMembers = members.map((member) => ({
    key: new PublicKey(member.key),
    permissions: member.permissions,
  }));

  try {
    const signature = await multisig.rpc.multisigCreateV2({
      creator,
      createKey,
      // @ts-expect-error: incompatible type of Connection (solana web3js1 squads vs fuse)
      connection,
      multisigPda,
      timeLock: 0,
      threshold: 2,
      configAuthority: null,
      members: legacyMembers,
      treasury: programConfig.treasury,
      rentCollector: new PublicKey(rentCollector) ?? null,
    });

    await connection.confirmTransaction(signature);
  } catch (error) {
    console.log(error);
  }
}

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
    creator.address,
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
      programAddress: address(TOKEN_2022_PROGRAM_ADDRESS),
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
      programAddress: TOKEN_2022_PROGRAM_ADDRESS,
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

export async function getTokenAccountBalance(ata: Address) {
  const { value: balance } = await client.rpc
    .getTokenAccountBalance(ata)
    .send();

  return balance;
}
