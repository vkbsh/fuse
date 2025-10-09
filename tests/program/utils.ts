import {
  TOKEN_PROGRAM_ADDRESS,
  TOKEN_2022_PROGRAM_ADDRESS,
  getMintSize,
  getMintToInstruction,
  getInitializeMintInstruction,
  getAssociatedTokenAccountAddress,
  getCreateAssociatedTokenIdempotentInstruction,
} from "gill/programs/token";

import {
  type Address,
  type KeyPairSigner,
  type TransactionSigner,
  address,
  lamports,
  airdropFactory,
  LAMPORTS_PER_SOL,
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

import { getRpcClient } from "~/lib/rpc";

export async function getTestAccountsWithBalances() {
  const creatorKeyPair = generateLegacyKeyPair();
  const createKeyKeyPair = generateLegacyKeyPair();
  const secondMemberKeyPair = generateLegacyKeyPair();
  const thirdMemberKeyPair = generateLegacyKeyPair();
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

  const thirdMember = await createSignerFromKeyPair(
    await createKeyPairFromBytes(thirdMemberKeyPair.secretKey),
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
    [
      creator,
      createKey,
      secondMember,
      thirdMember,
      { address: vaultAddress },
    ].map(async ({ address }) => await airdrop(address)),
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
      {
        key: thirdMember.address,
        permissions: { mask: 2 },
      },
    ],
  });

  return {
    creator,
    createKey,
    secondMember,
    thirdMember,
    vaultAddress,
    multisigAddress,
    recipientSolAddress: toSol.address,
    recipientTokenAddress: toToken.address,
    rentCollectorAddress: rentCollector.address,
  };
}

export async function getBalance(address: Address) {
  const { rpc } = getRpcClient();
  const { value: balance } = await rpc.getBalance(address).send();

  return balance;
}

export const airdrop = async (
  recipientAddress: Address,
  putativeLamports: bigint = lamports(BigInt(LAMPORTS_PER_SOL * 2)),
) => {
  const client = getRpcClient();
  await airdropFactory(client)({
    recipientAddress,
    commitment: "confirmed",
    lamports: lamports(putativeLamports),
  });
};

export async function getTokenAccountBalance(
  mint: Address,
  recipientTokenAddress: Address,
  tokenProgramAddress:
    | typeof TOKEN_PROGRAM_ADDRESS
    | typeof TOKEN_2022_PROGRAM_ADDRESS,
) {
  const { rpc } = getRpcClient();
  const ata = await getAssociatedTokenAccountAddress(
    mint,
    recipientTokenAddress,
    tokenProgramAddress,
  );

  const { value: balance } = await rpc.getTokenAccountBalance(ata).send();

  return balance;
}

export async function createMintAndMintTo({
  payer,
  recipient,
  tokenProgramAddress,
}: {
  payer: KeyPairSigner;
  recipient: Address;
  tokenProgramAddress:
    | typeof TOKEN_PROGRAM_ADDRESS
    | typeof TOKEN_2022_PROGRAM_ADDRESS;
}) {
  const decimals = 6;
  const mint = await createMint({
    payer,
    decimals,
    tokenProgramAddress,
    mintAuthority: payer.address,
  });

  const ata = await mintTo({
    mint,
    payer,
    owner: recipient,
    tokenProgramAddress,
    authority: payer.address,
    amount: BigInt(10 ** decimals),
  });

  return {
    ata,
    mint,
    decimals,
    programIdAddress: tokenProgramAddress,
  };
}

const createMint = async ({
  payer,
  decimals,
  mintAuthority,
  tokenProgramAddress,
}: {
  decimals: number;
  mintAuthority: Address;
  payer: TransactionSigner;
  tokenProgramAddress:
    | typeof TOKEN_PROGRAM_ADDRESS
    | typeof TOKEN_2022_PROGRAM_ADDRESS;
}): Promise<Address> => {
  const space = BigInt(getMintSize());
  const mint = await generateKeyPairSigner();

  const instructions = [
    getCreateAccountInstruction({
      payer,
      space,
      newAccount: mint,
      programAddress: tokenProgramAddress,
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
        programAddress: tokenProgramAddress,
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
  tokenProgramAddress,
}: {
  mint: Address;
  owner: Address;
  amount: bigint;
  authority: Address;
  payer: TransactionSigner;
  tokenProgramAddress:
    | typeof TOKEN_PROGRAM_ADDRESS
    | typeof TOKEN_2022_PROGRAM_ADDRESS;
}): Promise<Address> => {
  const ata = await getAssociatedTokenAccountAddress(
    mint,
    owner,
    tokenProgramAddress,
  );

  const instructions = [
    getCreateAssociatedTokenIdempotentInstruction({
      ata,
      mint,
      owner,
      payer,
      tokenProgram: tokenProgramAddress,
    }),
    getMintToInstruction(
      {
        mint,
        amount,
        token: ata,
        mintAuthority: authority,
      },
      {
        programAddress: tokenProgramAddress,
      },
    ),
  ];

  await createAndConfirmMessage({
    feePayer: payer,
    instructions,
  });

  return ata;
};
