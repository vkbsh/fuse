import {
  AccountRole,
  IAccountMeta,
  IInstruction,
  upgradeRoleToSigner,
  upgradeRoleToWritable,
} from "@solana/web3.js";
import { TransactionInstruction } from "web3js1";
import { addressFromLegacyPublicKey } from "./address";

export function instructionFromLegacyInstruction(
  legacyInstruction: TransactionInstruction,
): IInstruction {
  return {
    programAddress: addressFromLegacyPublicKey(legacyInstruction.programId),
    accounts: legacyInstruction.keys.map((meta) => {
      let role = AccountRole.READONLY;
      if (meta.isWritable) {
        role = upgradeRoleToWritable(role);
      }
      if (meta.isSigner) {
        role = upgradeRoleToSigner(role);
      }

      return {
        address: addressFromLegacyPublicKey(meta.pubkey),
        role,
      } satisfies IAccountMeta;
    }),
    data: legacyInstruction.data,
  };
}
