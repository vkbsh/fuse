import { PublicKey } from "@solana/web3.js";
import { type Address, address } from "gill";
import { MainnetSpotMarkets } from "@drift-labs/sdk";
import { TOKEN_PROGRAM_ADDRESS } from "gill/programs/token";

import {
  type LegacyTransactionMessage,
  createLegacyInstructionFromInstruction,
  createLegacyMessageFromLegacyInstruction,
} from "~/program/multisig/legacy";

import { getDriftClient } from "~/service/drift";
import {
  getAssociatedTokenAccountAddress,
  getCreateAssociatedTokenIdempotentInstruction,
} from "gill/programs/token";

export async function createDriftWithdrawLegacyMessage({
  symbol,
  mintAddress,
  vaultAddress,
}: {
  symbol: string | undefined;
  vaultAddress: Address;
  mintAddress: Address | string;
}): Promise<LegacyTransactionMessage> {
  const driftClient = await getDriftClient(address(vaultAddress));
  const spotMarket = MainnetSpotMarkets.find(
    (market) => symbol?.toLowerCase() === market.symbol.toLowerCase(),
  );

  const marketIndex = spotMarket?.marketIndex;

  if (marketIndex == undefined) {
    throw new Error(`Market not found for symbol ${symbol}`);
  }

  const maxWithdrawableAmount = driftClient
    .getUser()
    .getWithdrawalLimit(marketIndex, true);

  const toAta = await getAssociatedTokenAccountAddress(
    address(mintAddress),
    vaultAddress,
    TOKEN_PROGRAM_ADDRESS,
  );

  const createATAIx = getCreateAssociatedTokenIdempotentInstruction({
    ata: toAta,
    // @ts-expect-error (expect signer)
    payer: vaultAddress,
    owner: vaultAddress,
    mint: address(mintAddress),
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  const withdrawIx = await driftClient.getWithdrawIx(
    maxWithdrawableAmount,
    marketIndex,
    new PublicKey(toAta),
    true,
  );

  return createLegacyMessageFromLegacyInstruction({
    signer: vaultAddress,
    instructions: [
      createLegacyInstructionFromInstruction(createATAIx),
      withdrawIx,
    ],
  });
}
