import { type AccountMeta, type Address, address, AccountRole } from "gill";

import { getEphemeralSignerPda } from "~/program/multisig/pda";
import { type VaultTransactionMessage } from "~/program/multisig/codec";

function isStaticWritableIndex(
  message: VaultTransactionMessage,
  index: number,
): boolean {
  const numAccountKeys = message.accountKeys.length;
  const { numSigners, numWritableSigners, numWritableNonSigners } = message;

  if (index >= numAccountKeys) return false;
  if (index < numWritableSigners) return true;
  if (index >= numSigners) return index - numSigners < numWritableNonSigners;

  return false;
}

export async function accountsForTransactionExecute({
  message,
  vaultPda,
  transactionPda,
  ephemeralSignerBumps,
}: {
  vaultPda: Address;
  transactionPda: Address;
  ephemeralSignerBumps: number[];
  message: VaultTransactionMessage;
}): Promise<AccountMeta<Address>[]> {
  const ephemeralSignerPdas = await Promise.all(
    ephemeralSignerBumps.map(async (_, additionalSignerIndex) => {
      return await getEphemeralSignerPda({
        transactionPda,
        ephemeralSignerIndex: BigInt(additionalSignerIndex),
      });
    }),
  );

  return Promise.all(
    message.accountKeys.map(async (accountKey, accountIndex) => {
      const isVaultPda = accountKey === vaultPda;
      const isSigner = accountIndex < message.numSigners;
      const isWritable = isStaticWritableIndex(message, accountIndex);
      const isEphemeralSigner = ephemeralSignerPdas.find(
        (k) => k === accountKey,
      );

      let role = AccountRole.READONLY;

      if (isWritable) {
        role = AccountRole.WRITABLE;
      }

      if (isSigner && !isVaultPda && !isEphemeralSigner) {
        if (isWritable) {
          role = AccountRole.WRITABLE_SIGNER;
        } else {
          role = AccountRole.READONLY_SIGNER;
        }
      }

      return {
        role,
        address: address(accountKey),
      };
    }),
  );
}
