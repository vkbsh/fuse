import { type Address, address } from "gill";
import { KaminoVault, KaminoManager } from "@kamino-finance/klend-sdk";

import { getRpcClient } from "~/lib/rpc";
import { type EarnBalance } from "~/hooks/resources";
import { KVAULT_PROGRAM_ID_MAINNET as KAMINO_PROGRAM_ID } from "~/program/kamino/address";

const USDC_MINT = address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

export async function fetchKaminoBalance(
  vaultAddress: Address,
): Promise<EarnBalance | null> {
  const { rpc } = getRpcClient();

  try {
    let balanceUSDC = 0;
    let kaminoVaultUSDCAddress: Address | undefined = undefined;

    const manager = new KaminoManager(rpc);
    const userSharesAllVaults =
      await manager.getUserSharesBalanceAllVaults(vaultAddress);

    for (const [vAddress, shares] of userSharesAllVaults) {
      const vault = new KaminoVault(rpc, vAddress);
      const vaultState = await vault.getState();

      if (vaultState.tokenMint === USDC_MINT) {
        kaminoVaultUSDCAddress = vAddress;
        const exchangeRate = (await vault.getExchangeRate()).toNumber();
        const totalUSDCShares = shares.totalShares.toNumber();

        balanceUSDC += totalUSDCShares * exchangeRate;
        break;
      }
    }

    if (!kaminoVaultUSDCAddress || !balanceUSDC) {
      return null;
    }

    return {
      symbol: "USDC",
      balance: balanceUSDC,
      kaminoVaultUSDCAddress,
      programId: KAMINO_PROGRAM_ID,
    };
  } catch (error) {
    console.error("Error fetching Kamino balance:", error);
    return null;
  }
}
