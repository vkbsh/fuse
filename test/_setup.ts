import {
  getMintSize,
  getMintToInstruction,
  TOKEN_PROGRAM_ADDRESS,
  TOKEN_2022_PROGRAM_ADDRESS,
  getInitializeMintInstruction,
  getAssociatedTokenAccountAddress,
  getCreateAssociatedTokenIdempotentInstruction,
} from "gill/programs/token";

import {
  address,
  Address,
  lamports,
  KeyPairSigner,
  airdropFactory,
  LAMPORTS_PER_SOL,
  TransactionSigner,
  generateKeyPairSigner,
  createKeyPairFromBytes,
  createSignerFromKeyPair,
  getMinimumBalanceForRentExemption,
} from "gill";

import { getCreateAccountInstruction } from "gill/programs";
import { getMultisigPda, getVaultPda } from "~/program/multisig/pda";
import { createAndConfirmMessage } from "~/program/multisig/message";

import {
  createMultisig,
  generateLegacyKeyPair,
} from "~/program/multisig/legacy";

import { useRpcStore } from "~/state/rpc";

const client = useRpcStore.getState();

export async function getTestAccountsWithBalances() {
  const creatorKeyPair = generateLegacyKeyPair();
  const createKeyKeyPair = generateLegacyKeyPair();
  const secondMemberKeyPair = generateLegacyKeyPair();
  const rentCollectorKeyPair = generateLegacyKeyPair();
  const toTokenKeyPair = generateLegacyKeyPair();
  const toSolKeyPair = generateLegacyKeyPair();

  const createKey = await createSignerFromKeyPair(
    await createKeyPairFromBytes(createKeyKeyPair.secretKey),
  );

  const creator = await createSignerFromKeyPair(
    await createKeyPairFromBytes(creatorKeyPair.secretKey),
  );
  const secondMember = await createSignerFromKeyPair(
    await createKeyPairFromBytes(secondMemberKeyPair.secretKey),
  );

  const rentCollector = await createSignerFromKeyPair(
    await createKeyPairFromBytes(rentCollectorKeyPair.secretKey),
  );

  const toToken = await createSignerFromKeyPair(
    await createKeyPairFromBytes(toTokenKeyPair.secretKey),
  );

  const toSol = await createSignerFromKeyPair(
    await createKeyPairFromBytes(toSolKeyPair.secretKey),
  );

  const multisigPda = await getMultisigPda({ createKey: createKey.address });
  const multisigAddress = address(multisigPda);
  const vaultAddress = await getVaultPda({
    vaultIndex: 0,
    multisigAddress,
  });

  await Promise.all(
    [creator, createKey, secondMember, { address: vaultAddress }].map(
      async ({ address }) => await airdrop(address),
    ),
  );

  await createMultisig({
    multisigPda,
    creator: createKeyKeyPair,
    createKey: createKeyKeyPair,
    rentCollector: rentCollector.address,
    members: [
      {
        key: creator.address,
        permissions: { mask: 7 },
      },
      {
        key: secondMember.address,
        permissions: { mask: 2 },
      },
    ],
  });

  return {
    creator,
    createKey,
    secondMember,
    vaultAddress,
    multisigAddress,
    receiverSolAddress: toSol.address,
    receiverTokenAddress: toToken.address,
    rentCollectorAddress: rentCollector.address,
  };
}

export async function getBalance(address: Address) {
  return client.rpc.getBalance(address).send();
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

export async function getTokenAccountBalance(
  mint: Address,
  receiverTokenAddress: Address,
) {
  const ata = await getAssociatedTokenAccountAddress(
    mint,
    receiverTokenAddress,
    TOKEN_2022_PROGRAM_ADDRESS,
  );

  const { value: balance } = await client.rpc
    .getTokenAccountBalance(ata)
    .send();

  return balance;
}

export async function getMockToken({
  payer,
  vaultPda,
}: {
  payer: KeyPairSigner;
  vaultPda: Address;
}) {
  const decimals = 6;
  const mint = await createMint({
    payer,
    decimals,
    mintAuthority: payer.address,
  });

  const ata = await mintTo({
    mint,
    payer,
    owner: vaultPda,
    authority: payer.address,
    amount: BigInt(10 ** decimals),
  });

  return {
    ata,
    mint,
    decimals,
  };
}

const createMint = async ({
  payer,
  decimals,
  mintAuthority,
}: {
  payer: TransactionSigner;
  mintAuthority: Address;
  decimals: number;
}): Promise<Address> => {
  const space = BigInt(getMintSize());
  const mint = await generateKeyPairSigner();

  const instructions = [
    getCreateAccountInstruction({
      payer,
      space,
      newAccount: mint,
      programAddress: TOKEN_2022_PROGRAM_ADDRESS,
      lamports: getMinimumBalanceForRentExemption(space),
    }),
    getInitializeMintInstruction(
      {
        decimals,
        mintAuthority,
        mint: mint.address,
        freezeAuthority: mintAuthority,
      },
      {
        programAddress: TOKEN_2022_PROGRAM_ADDRESS,
      },
    ),
  ];

  await createAndConfirmMessage({
    feePayer: payer,
    instructions,
  });

  return mint.address;
};

const mintTo = async ({
  mint,
  payer,
  owner,
  amount,
  authority,
}: {
  mint: Address;
  owner: Address;
  amount: bigint;
  authority: Address;
  payer: TransactionSigner;
}): Promise<Address> => {
  const ata = await getAssociatedTokenAccountAddress(
    mint,
    owner,
    TOKEN_2022_PROGRAM_ADDRESS,
  );

  const instructions = [
    getCreateAssociatedTokenIdempotentInstruction({
      ata,
      mint,
      owner,
      payer,
      tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
    }),
    getMintToInstruction(
      {
        mint,
        amount,
        token: ata,
        mintAuthority: authority,
      },
      {
        programAddress: TOKEN_2022_PROGRAM_ADDRESS,
      },
    ),
  ];

  await createAndConfirmMessage({
    feePayer: payer,
    instructions,
  });

  return ata;
};
