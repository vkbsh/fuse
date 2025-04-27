import {
  Rpc,
  address,
  IInstruction,
  getBase64Codec,
  LAMPORTS_PER_SOL,
  SolanaRpcApiMainnet,
  parseBase64RpcAccount,
} from "gill";
import { parseTransferSolInstruction } from "@solana-program/system";
import { parseTransferInstruction, fetchToken } from "@solana-program/token";
import { parseTransferInstruction as parseTransferInstruction2022 } from "@solana-program/token-2022";

import {
  getMultisigAccountCodec,
  getProposalAccountCodec,
  getVaultTransactionCodec,
} from "~/program/multisig/codec";

import {
  SQUADS_PROGRAM_ID,
  MULTISIG_ACCOUNT_DISCRIMINATOR_BASE64,
  PROPOSAL_ACCOUNT_DISCRIMINATOR_BASE64,
  TOKEN_2022_PROGRAM_ID,
} from "~/program/multisig/address";

import { getTransactionPda, getVaultPda } from "~/program/multisig/pda";

import { Wallet } from "~/model/wallet";
import { Address } from "~/model/web3js";

import { fetchTokenMeta } from "~/state/totalBalance";

export async function getWalletByMemberKey(
  rpc: Rpc<SolanaRpcApiMainnet>,
  keyAddress: Address,
): Promise<Wallet[]> {
  // The key must be the one of the first 6 multisig members: Paymaster (optionally), up to 2 Active Keys, up to 3 Recovery Keys.
  const [...wallets] = await Promise.all([
    getWalletByKeyAndIndex(rpc, keyAddress, 0),
    getWalletByKeyAndIndex(rpc, keyAddress, 1),
    getWalletByKeyAndIndex(rpc, keyAddress, 2),
    getWalletByKeyAndIndex(rpc, keyAddress, 3),
    getWalletByKeyAndIndex(rpc, keyAddress, 4),
    getWalletByKeyAndIndex(rpc, keyAddress, 5),
  ]);

  return wallets.flat();
}

export async function getActiveProposals(
  rpc: Rpc<SolanaRpcApiMainnet>,
  keyAddress: Address,
): Promise<any[]> {
  const [...accounts] = await Promise.all([
    getProposalAccounts(rpc, keyAddress, 1), // (Active: 1) Ready to approve
    getProposalAccounts(rpc, keyAddress, 2), // (Rejected: 2)
    getProposalAccounts(rpc, keyAddress, 3), // (Approved: 3) Ready to execute
    getProposalAccounts(rpc, keyAddress, 4), // (Executed: 4)
    getProposalAccounts(rpc, keyAddress, 5), // (Calncelled: 4)
  ]);

  return accounts.flat();
}

export async function getProposalAccounts(
  rpc: Rpc<SolanaRpcApiMainnet>,
  keyAddress: Address,
  index: 1 | 2 | 3 | 4 | 5,
): Promise<any> {
  const proposals = await rpc
    .getProgramAccounts(SQUADS_PROGRAM_ID, {
      filters: [
        // discriminator
        {
          memcmp: {
            offset: 0n,
            encoding: "base64",
            bytes: PROPOSAL_ACCOUNT_DISCRIMINATOR_BASE64,
          },
        },
        //multisig
        {
          memcmp: {
            offset: 8n,
            encoding: "base58",
            bytes: keyAddress,
          },
        },
        // status
        {
          memcmp: {
            offset: 48n,
            encoding: "base64",
            bytes: getBase64Codec().decode(new Uint8Array([index])),
          },
        },
      ],
      encoding: "base64",
    })
    .send();

  return Promise.all(
    proposals.map(async (proposal) => {
      const { data } = parseBase64RpcAccount(proposal.pubkey, proposal.account);
      const { status, rejected, approved, cancelled, transactionIndex } =
        getProposalAccountCodec().decode(data);

      const transactionPda = await getTransactionPda({
        multisigAddress: keyAddress,
        transactionIndex: transactionIndex,
      });

      const transactionPdaInfo = await rpc
        .getAccountInfo(transactionPda, {
          encoding: "base64",
        })
        .send();

      const VaultData = parseBase64RpcAccount(
        transactionPda,
        transactionPdaInfo.value,
      ).data;

      let vaultTransaction = null;

      try {
        vaultTransaction = getVaultTransactionCodec().decode(VaultData);
      } catch (error) {
        console.log("error", error);
      }

      const instructions = vaultTransaction?.message?.instructions || [];
      const accountKeys = vaultTransaction?.message?.accountKeys || [];

      const test = await Promise.all(
        instructions
          .filter((ix) => {
            let programAddress = accountKeys[ix.programIdIndex];
            const isTokenProgram = [
              "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              TOKEN_2022_PROGRAM_ID,
            ].includes(programAddress);

            return isTokenProgram;
          })
          .map(async (ix) => {
            let programAddress = accountKeys[ix.programIdIndex];
            const isTokenProgram = [
              "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              TOKEN_2022_PROGRAM_ID,
            ].includes(programAddress);

            const customIx: IInstruction = {
              data: new Uint8Array(ix.data),
              accounts: ix.accountIndexes.map((index) => ({
                address: accountKeys[index],
                role: 1, // any role to satisfy the type
              })),
              programAddress: address(programAddress),
            };

            let decoded = null;

            if (!isTokenProgram) {
              decoded = parseTransferSolInstruction(customIx);
            } else if (isTokenProgram) {
              if (
                customIx.programAddress ===
                "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
              ) {
                decoded = parseTransferInstruction(customIx);
              }
              if (customIx.programAddress === TOKEN_2022_PROGRAM_ID) {
                decoded = parseTransferInstruction2022(customIx);
              }

              let tokenInfo = null;
              try {
                tokenInfo = await fetchToken(
                  rpc,
                  address(decoded.accounts.destination.address),
                );
              } catch (error) {
                console.log("vaultTransaction", vaultTransaction);
                console.log("decoded", decoded);
                console.log("error", error);
              }

              const mint = await fetchTokenMeta(tokenInfo?.data?.mint);

              decoded.accounts.source.address = tokenInfo?.address;
              decoded.accounts.destination.address = tokenInfo?.data?.owner;
              decoded.mint = {
                name: mint?.name,
                symbol: mint?.symbol,
                logoURI: mint?.logoURI,
                decimals: mint?.decimals,
              };
            }

            const nativeToken = {
              address: "So11111111111111111111111111111111111111112",
              name: "Solana",
              symbol: "SOL",
              decimals: 9,
              logoURI:
                "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
            };

            if (decoded && typeof decoded === "object") {
              const isNative =
                customIx.programAddress === "11111111111111111111111111111111";
              return {
                txType: isNative
                  ? "transferSol"
                  : customIx.programAddress ===
                      "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
                    ? "transferToken"
                    : "any other instruction",
                fromAccount: decoded.accounts.source.address,
                toAccount: decoded.accounts.destination.address,
                amount: isNative
                  ? Number(decoded?.data?.amount) / LAMPORTS_PER_SOL
                  : Number(decoded?.data?.amount) /
                    10 ** decoded?.mint?.decimals,

                mint: isNative ? nativeToken : decoded?.mint,
              };
            } else {
              return null;
            }
          }),
      );

      const filteredTest = test.filter((t) => t !== null);

      const result = filteredTest[0];

      return {
        message: result,
        approved,
        rejected,
        cancelled,
        transactionIndex,
        status: status.__kind,
        timestamp: status?.timestamp,
      };
    }),
  );
}

async function getWalletByKeyAndIndex(
  rpc: Rpc<SolanaRpcApiMainnet>,
  keyAddress: Address,
  index: number,
): Promise<Wallet[]> {
  const offset = BigInt(132 + (32 + 1) * index);

  const wallets = await rpc
    .getProgramAccounts(SQUADS_PROGRAM_ID, {
      filters: [
        {
          memcmp: {
            offset: 0n,
            bytes: MULTISIG_ACCOUNT_DISCRIMINATOR_BASE64,
            encoding: "base64",
          },
        },
        {
          memcmp: {
            offset,
            bytes: keyAddress,
            encoding: "base58",
          },
        },
      ],
      encoding: "base64",
    })
    .send();

  return await Promise.all(
    wallets.map(async (wallet) => {
      const defaultVault = await getVaultPda({
        vaultIndex: 0,
        multisigAddress: wallet.pubkey,
      });

      return {
        address: wallet.pubkey,
        defaultVault,
        account: getMultisigAccountCodec().decode(
          parseBase64RpcAccount(wallet.pubkey, wallet.account).data,
        ),
      };
    }),
  );
}
